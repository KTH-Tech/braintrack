// NSC Timetable — Exam-Aware Engine (T114)
// November-session seed data (data/nsc-2026-timetable.ts) verified 2026-07-19
// against the official DBE Oct/Nov 2026 NSC timetable, revision FINAL — February 2026.
// See docs/nsc-timetable-verification-2026.md for the audit trail.
// Responsibilities:
//   1. Seed official timetable on startup if empty
//   2. Build/refresh per-learner exam schedules
//   3. Provide countdown/urgency state utilities
//   4. Priority ordering utility for subject content

import { db } from "./db";
import {
  nscTimetable, timetableSubjectMapping, learnerExamSchedule, onboardingResults, subjects, userProgress,
  prelimExams,
  type NscTimetable, type LearnerExamSchedule, type UrgencyState, type PrelimExam,
} from "@shared/schema";
import { users } from "@shared/models/auth";
import { eq, and, inArray, sql, or, isNull } from "drizzle-orm";
import { NSC_2026_TIMETABLE, NSC_2026_PRELIMINARY_TIMETABLE, SUBJECT_NAME_MAPPINGS } from "./data/nsc-2026-timetable";

// ============================================
// DATE HELPERS — all exam day-counting runs in SAST
// ============================================

/**
 * Today's date at SAST midnight, expressed as a UTC instant.
 * South Africa is UTC+2 year-round (no DST). Deriving "today" from the host clock
 * makes daysRemaining a full day too high between 00:00 and 02:00 SAST whenever the
 * server runs on UTC, which is what parents saw as a wrong exam countdown.
 */
function sastToday(): Date {
  const nowSast = new Date(Date.now() + 2 * 60 * 60 * 1000);
  return new Date(Date.UTC(nowSast.getUTCFullYear(), nowSast.getUTCMonth(), nowSast.getUTCDate()));
}

/** An exam's calendar date at SAST midnight, in the same frame as sastToday(). */
function examDay(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00Z");
}

// ============================================
// PRELIM EXAMS — School-set preliminary dates (Task #359)
// ============================================

/**
 * Returns the effective prelim exams for a learner.
 * Resolution rule: learner-source rows always win for a (subjectId, paperNumber);
 * school-source rows fill in any gaps.
 */
export async function getEffectivePrelimExams(userId: string): Promise<PrelimExam[]> {
  const [user] = await db.select({ schoolId: users.schoolId }).from(users).where(eq(users.id, userId));
  const schoolId = user?.schoolId ?? null;

  const rows = await db
    .select()
    .from(prelimExams)
    .where(
      schoolId !== null
        ? or(
            and(eq(prelimExams.source, "learner"), eq(prelimExams.userId, userId)),
            and(eq(prelimExams.source, "school"), eq(prelimExams.schoolId, schoolId)),
          )
        : and(eq(prelimExams.source, "learner"), eq(prelimExams.userId, userId)),
    );

  // Restrict to learner's selected subjects
  const [onboarding] = await db.select()
    .from(onboardingResults)
    .where(eq(onboardingResults.userId, userId));
  const selectedIds = new Set<number>(onboarding?.selectedSubjects || []);

  const filtered = rows.filter(r => selectedIds.size === 0 || selectedIds.has(r.subjectId));

  // Dedupe: learner row beats school row on the same (subjectId, paperNumber).
  const byKey = new Map<string, PrelimExam>();
  for (const row of filtered) {
    const key = `${row.subjectId}:${row.paperNumber}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, row);
    } else if (existing.source === "school" && row.source === "learner") {
      byKey.set(key, row);
    }
  }

  // Third tier — provisional SACAI dates. Prelim timetables are set per
  // school, so a new learner used to see NO prelim countdown at all until
  // someone typed dates in. But the repo vendors the published SACAI 2026
  // preliminary timetable, which is the standard many schools follow — so a
  // subject with no learner- or school-set date falls back to its SACAI
  // entries, synthesized in-memory (id: 0, source "provisional"), never
  // persisted. The moment a learner or school saves real dates for that
  // subject, those win and the fallback disappears.
  if (selectedIds.size > 0) {
    const selectedSubjects = await db
      .select({ id: subjects.id, name: subjects.name })
      .from(subjects)
      .where(inArray(subjects.id, Array.from(selectedIds)));
    const nameById = new Map(selectedSubjects.map((s) => [s.id, s.name]));

    for (const [subjectId, name] of nameById) {
      const sacaiEntries = NSC_2026_PRELIMINARY_TIMETABLE.filter(
        (e) => e.subjectName.toLowerCase() === name.toLowerCase() && !e.isNonExaminationDay,
      );
      for (const entry of sacaiEntries) {
        const key = `${subjectId}:${entry.paperNumber}`;
        if (byKey.has(key)) continue;
        byKey.set(key, {
          id: 0,
          source: "provisional",
          userId,
          schoolId: null,
          subjectId,
          subjectName: name,
          paperNumber: entry.paperNumber,
          examDate: entry.examDate,
          startTime: entry.startTime,
          durationMinutes: entry.durationMinutes,
          createdBy: null,
          createdAt: null,
          updatedAt: null,
        } as PrelimExam);
      }
    }
  }

  return Array.from(byKey.values());
}

/**
 * Wraps a prelim exam as a `LearnerExamSchedule`-shaped object so it can be
 * merged into the learner's materialised schedule. Uses `nscTimetableId: 0`
 * as a sentinel because prelims are not tied to an `nsc_timetable` row.
 */
function prelimToSchedule(userId: string, p: PrelimExam): LearnerExamSchedule {
  const today = sastToday();
  const examDate = examDay(p.examDate);
  const diffMs = examDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.floor(diffMs / 86400000));
  const isPast = examDate < today;
  const urgencyState: UrgencyState = isPast ? "build_mastery" : getCountdownState(daysRemaining);

  return {
    id: -p.id, // negative sentinel — never collides with real schedule rows
    userId,
    nscTimetableId: 0,
    subjectId: p.subjectId,
    subjectName: p.subjectName,
    paperNumber: p.paperNumber,
    examDate: p.examDate,
    startTime: p.startTime,
    durationMinutes: p.durationMinutes,
    daysRemaining,
    urgencyState,
    isPast,
    generatedAt: p.createdAt,
    updatedAt: p.updatedAt,
  } as unknown as LearnerExamSchedule;
}

// ============================================
// URGENCY STATE LOGIC
// ============================================

/**
 * Returns urgency band based on days remaining to the exam paper.
 * Build Mastery    : > 60 days
 * Focused Revision : 30-60 days
 * Exam Prep Mode   : 14-29 days
 * Final Sprint     : < 14 days
 */
export function getCountdownState(daysRemaining: number): UrgencyState {
  if (daysRemaining > 60) return "build_mastery";
  if (daysRemaining > 30) return "focused_revision";
  if (daysRemaining > 14) return "exam_prep_mode";
  return "final_sprint";
}

export const URGENCY_LABELS: Record<UrgencyState, { en: string; af: string; color: string; description: string }> = {
  build_mastery: {
    en: "Build Mastery",
    af: "Bou Meesterskap",
    color: "emerald",
    description: "Focus on learning new concepts and building understanding.",
  },
  focused_revision: {
    en: "Focused Revision",
    af: "Gefokusde Hersiening",
    color: "blue",
    description: "Revise key topics and practise past paper questions.",
  },
  exam_prep_mode: {
    en: "Exam Prep Mode",
    af: "Eksamenvoorbereiding",
    color: "amber",
    description: "Intensive preparation — timed papers and weak-area drilling.",
  },
  final_sprint: {
    en: "Final Sprint",
    af: "Finale Eindstryd",
    color: "red",
    description: "Last push — focus only on high-yield topics and key formulae.",
  },
};

// ============================================
// TIMETABLE SEEDING
// ============================================

export async function seedNscTimetableIfEmpty(): Promise<void> {
  try {
    // Check each session independently so we backfill prelims even if
    // November finals were already seeded by an earlier release.
    const existingSessions = await db
      .select({ session: nscTimetable.session })
      .from(nscTimetable)
      .where(eq(nscTimetable.year, 2026));
    const haveSessions = new Set(existingSessions.map(r => r.session));

    const toSeed: any[] = [];
    if (!haveSessions.has("November")) {
      toSeed.push(...NSC_2026_TIMETABLE.map(e => ({
        year: 2026,
        session: "November",
        examDate: e.examDate,
        startTime: e.startTime,
        durationMinutes: e.durationMinutes,
        subjectName: e.subjectName,
        paperNumber: e.paperNumber,
        isNonExaminationDay: e.isNonExaminationDay,
        notes: e.notes || null,
        source: "DBE_OFFICIAL",
      })));
    }
    if (!haveSessions.has("Preliminary")) {
      toSeed.push(...NSC_2026_PRELIMINARY_TIMETABLE.map(e => ({
        year: 2026,
        session: "Preliminary",
        examDate: e.examDate,
        startTime: e.startTime,
        durationMinutes: e.durationMinutes,
        subjectName: e.subjectName,
        paperNumber: e.paperNumber,
        isNonExaminationDay: e.isNonExaminationDay,
        notes: e.notes || "Preliminary exam — schools may shift by ±2 weeks",
        source: "SCHOOL_PRELIMINARY",
      })));
    }

    if (toSeed.length > 0) {
      console.log(`[NSC Timetable] Seeding ${toSeed.length} 2026 timetable entries (sessions: ${[...haveSessions].length === 0 ? "November + Preliminary" : !haveSessions.has("November") ? "November" : "Preliminary"})...`);
      await db.insert(nscTimetable).values(toSeed);
      console.log(`[NSC Timetable] Seeded ${toSeed.length} entries.`);
    }

    // Always run subject mapping backfill — it's idempotent and ensures
    // existing deployments pick up new aliases added in later releases.
    await seedSubjectMappings();
  } catch (err) {
    console.error("[NSC Timetable] Seed error:", err);
  }
}

async function seedSubjectMappings(): Promise<void> {
  try {
    const allSubjects = await db.select().from(subjects);
    const existing = await db.select().from(timetableSubjectMapping);
    const existingNames = new Set(existing.map(m => m.timetableSubjectName));

    const toInsert: any[] = [];

    for (const mapping of SUBJECT_NAME_MAPPINGS) {
      if (existingNames.has(mapping.timetableName)) continue;

      // Try to find a matching BrainTrack subject
      let matchedSubjectId: number | null = null;
      for (const alias of mapping.aliases) {
        const match = allSubjects.find(s =>
          s.name.toLowerCase() === alias.toLowerCase() ||
          s.nameAfrikaans?.toLowerCase() === alias.toLowerCase()
        );
        if (match) {
          matchedSubjectId = match.id;
          break;
        }
      }

      toInsert.push({
        timetableSubjectName: mapping.timetableName,
        braintrackSubjectId: matchedSubjectId,
        isConfirmed: matchedSubjectId !== null,
      });
    }

    if (toInsert.length > 0) {
      await db.insert(timetableSubjectMapping).values(toInsert);
      console.log(`[NSC Timetable] Created ${toInsert.length} subject mappings.`);
    }
  } catch (err) {
    console.error("[NSC Timetable] Subject mapping seed error:", err);
  }
}

// ============================================
// LEARNER SCHEDULE GENERATION
// ============================================

/**
 * Builds or refreshes a learner's exam schedule based on their selectedSubjects.
 * Safe to call multiple times — uses upsert logic.
 */
export async function buildLearnerSchedule(userId: string): Promise<LearnerExamSchedule[]> {
  try {
    // Get learner's selected subjects.
    // users.selected_subjects is the authoritative live list — PATCH /api/user/subjects
    // writes there, so onboarding_results can lag behind. Fall back to onboarding only
    // for learners whose user row was never populated.
    const [[userRow], [onboarding]] = await Promise.all([
      db.select({ selectedSubjects: users.selectedSubjects })
        .from(users)
        .where(eq(users.id, userId)),
      db.select()
        .from(onboardingResults)
        .where(eq(onboardingResults.userId, userId)),
    ]);

    const fromUser = Array.isArray(userRow?.selectedSubjects)
      ? (userRow!.selectedSubjects as number[])
      : [];
    const selectedSubjectIds: number[] = fromUser.length > 0
      ? fromUser
      : (onboarding?.selectedSubjects || []);
    if (selectedSubjectIds.length === 0) return [];

    // Get the mappings for those subject IDs
    const mappings = await db.select()
      .from(timetableSubjectMapping)
      .where(
        selectedSubjectIds.length > 0
          ? inArray(timetableSubjectMapping.braintrackSubjectId, selectedSubjectIds)
          : sql`false`
      );

    if (mappings.length === 0) return [];

    const timetableSubjectNames = mappings.map(m => m.timetableSubjectName);

    // Fetch relevant timetable entries (non-examination days excluded from schedule)
    const timetableEntries = await db.select()
      .from(nscTimetable)
      .where(
        and(
          eq(nscTimetable.year, 2026),
          eq(nscTimetable.isNonExaminationDay, false),
          inArray(nscTimetable.subjectName, timetableSubjectNames)
        )
      );

    if (timetableEntries.length === 0) return [];

    const today = sastToday();

    // Build schedule rows
    const scheduleRows = timetableEntries.map(entry => {
      const examDate = examDay(entry.examDate);
      const diffMs = examDate.getTime() - today.getTime();
      const daysRemaining = Math.max(0, Math.floor(diffMs / 86400000));
      const isPast = examDate < today;
      const urgencyState = isPast ? "build_mastery" : getCountdownState(daysRemaining);

      // Find the BrainTrack subjectId from mapping
      const mapping = mappings.find(m => m.timetableSubjectName === entry.subjectName);
      const subjectId = mapping?.braintrackSubjectId || null;

      return {
        userId,
        nscTimetableId: entry.id,
        subjectId,
        subjectName: entry.subjectName,
        paperNumber: entry.paperNumber,
        examDate: entry.examDate,
        startTime: entry.startTime,
        durationMinutes: entry.durationMinutes,
        daysRemaining,
        urgencyState,
        isPast,
      };
    });

    // Replace the schedule atomically. Without a transaction two concurrent rebuilds
    // interleave as delete/delete/insert/insert and leave every exam duplicated.
    await db.transaction(async (tx) => {
      // The advisory lock is what actually serialises this. Under READ COMMITTED a
      // second rebuild's DELETE takes its snapshot before the first one commits, so
      // it deletes nothing and then inserts a duplicate set on top.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);

      await tx.delete(learnerExamSchedule)
        .where(eq(learnerExamSchedule.userId, userId));

      if (scheduleRows.length > 0) {
        await tx.insert(learnerExamSchedule).values(scheduleRows);
      }
    });

    // Update onboarding scheduleLastUpdatedAt
    await db.update(onboardingResults)
      .set({ scheduleLastUpdatedAt: new Date() })
      .where(eq(onboardingResults.userId, userId));

    return db.select()
      .from(learnerExamSchedule)
      .where(eq(learnerExamSchedule.userId, userId));
  } catch (err) {
    console.error(`[NSC Timetable] buildLearnerSchedule error for user ${userId}:`, err); // nosemgrep: javascript.lang.security.audit.unsafe-formatstring -- userId is a validated internal auth identifier, not user-controlled content
    return [];
  }
}

/**
 * Gets a learner's exam schedule, building it if missing or stale.
 */
export async function getLearnerSchedule(userId: string): Promise<LearnerExamSchedule[]> {
  const existing = await db.select()
    .from(learnerExamSchedule)
    .where(eq(learnerExamSchedule.userId, userId));

  // If empty, build it. We still fall through so prelims get merged in
  // even when the learner has no DBE-mapped subjects.
  let baseRows = existing;
  if (baseRows.length === 0) {
    baseRows = await buildLearnerSchedule(userId);
  }

  // Refresh daysRemaining on fetch (cheap computation)
  const today = sastToday();
  const refreshed = baseRows.map(e => {
    const examDate = examDay(e.examDate);
    const diffMs = examDate.getTime() - today.getTime();
    const daysRemaining = Math.max(0, Math.floor(diffMs / 86400000));
    const isPast = examDate < today;
    return {
      ...e,
      daysRemaining,
      isPast,
      urgencyState: isPast ? "build_mastery" as UrgencyState : getCountdownState(daysRemaining),
    };
  });

  // Merge in school-set / learner-set prelim entries (Task #359). Prelims
  // are not materialised into learner_exam_schedule because their dates
  // change frequently and they're optional per-cohort; we resolve them on
  // every read so updates take effect immediately.
  //
  // Precedence: learner prelim > school prelim > seeded NSC timetable row
  // for the same (subjectId, paperNumber). Without this, a learner whose
  // school sets a different prelim date would see BOTH the seeded entry
  // and the override and getDailyDirective would arbitrarily pick the
  // earlier date. We therefore drop seeded rows that have a corresponding
  // prelim override.
  const prelims = await getEffectivePrelimExams(userId);
  const prelimRows = prelims.map(p => prelimToSchedule(userId, p));

  if (prelimRows.length === 0) {
    return refreshed;
  }

  const overrideKeys = new Set<string>();
  for (const p of prelimRows) {
    if (p.subjectId !== null && p.subjectId !== undefined) {
      overrideKeys.add(`id:${p.subjectId}:${p.paperNumber}`);
    }
    overrideKeys.add(`name:${p.subjectName.toLowerCase()}:${p.paperNumber}`);
  }

  const filtered = refreshed.filter(r => {
    const idKey = r.subjectId !== null && r.subjectId !== undefined
      ? `id:${r.subjectId}:${r.paperNumber}` : null;
    const nameKey = `name:${r.subjectName.toLowerCase()}:${r.paperNumber}`;
    if (idKey && overrideKeys.has(idKey)) return false;
    if (overrideKeys.has(nameKey)) return false;
    return true;
  });

  return [...filtered, ...prelimRows];
}

// ============================================
// EXAM WIDGET DATA
// ============================================

export interface ExamWidgetData {
  nextExam: LearnerExamSchedule | null;
  thisWeekExams: LearnerExamSchedule[];
  subjectPriorityQueue: SubjectPriority[];
  nonExaminationDays: string[];
  urgencyBanner: {
    state: UrgencyState;
    label: string;
    labelAf: string;
    description: string;
    color: string;
  } | null;
}

export interface SubjectPriority {
  subjectName: string;
  subjectId: number | null;
  nextPaperNumber: number;
  daysRemaining: number;
  urgencyState: UrgencyState;
  examDate: string;
  paperCount: number;
}

export async function getExamWidgets(userId: string): Promise<ExamWidgetData> {
  const schedule = await getLearnerSchedule(userId);
  const upcoming = schedule.filter(e => !e.isPast).sort((a, b) => a.daysRemaining - b.daysRemaining);

  const nextExam = upcoming.length > 0 ? upcoming[0] : null;

  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const thisWeekExams = upcoming.filter(e => {
    const d = examDay(e.examDate);
    return d >= today && d <= weekEnd;
  });

  // Build subject priority queue (one entry per subject, using earliest remaining paper)
  const subjectMap = new Map<string, SubjectPriority>();
  for (const entry of upcoming) {
    const key = entry.subjectName;
    if (!subjectMap.has(key)) {
      subjectMap.set(key, {
        subjectName: entry.subjectName,
        subjectId: entry.subjectId,
        nextPaperNumber: entry.paperNumber,
        daysRemaining: entry.daysRemaining,
        urgencyState: entry.urgencyState as UrgencyState,
        examDate: entry.examDate,
        paperCount: 1,
      });
    } else {
      subjectMap.get(key)!.paperCount++;
    }
  }

  const subjectPriorityQueue = Array.from(subjectMap.values())
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Urgency banner: based on the most urgent upcoming exam
  const urgencyBanner = nextExam
    ? {
        state: nextExam.urgencyState as UrgencyState,
        label: URGENCY_LABELS[nextExam.urgencyState as UrgencyState].en,
        labelAf: URGENCY_LABELS[nextExam.urgencyState as UrgencyState].af,
        description: URGENCY_LABELS[nextExam.urgencyState as UrgencyState].description,
        color: URGENCY_LABELS[nextExam.urgencyState as UrgencyState].color,
      }
    : null;

  const nonExaminationDays = ["2026-11-03", "2026-11-04", "2026-11-05", "2026-11-09"];

  return {
    nextExam,
    thisWeekExams,
    subjectPriorityQueue,
    nonExaminationDays,
    urgencyBanner,
  };
}

// ============================================
// DAILY DIRECTIVE — TODAY'S TOP PRIORITY
// ============================================

export interface DailyDirective {
  hasExam: boolean;
  subjectName: string;
  subjectNameAf: string;
  subjectId: number | null;
  paperNumber: number | null;
  paperLabel: string | null;
  examDate: string | null;
  startTime: string | null;
  daysUntil: number | null;
  urgencyState: UrgencyState;
  urgencyLabel: string;
  urgencyLabelAf: string;
  urgencyColor: string;
  message: string;
  messageAf: string;
  deepLink: string;
  weakTopic: { id: number; name: string; nameAfrikaans: string | null; masteryScore: number } | null;
  isExamToday: boolean;
}

export const DIRECTIVE_AF_NAMES: Record<string, string> = {
  "Mathematics": "Wiskunde",
  "Mathematical Literacy": "Wiskundige Geletterdheid",
  "Technical Mathematics": "Tegniese Wiskunde",
  "Physical Sciences": "Fisiese Wetenskappe",
  "Life Sciences": "Lewenswetenskappe",
  "Agricultural Sciences": "Landbouwetenskappe",
  "Technical Sciences": "Tegniese Wetenskappe",
  "Accounting": "Rekeningkunde",
  "Business Studies": "Besigheidstudies",
  "Economics": "Ekonomie",
  "History": "Geskiedenis",
  "Geography": "Geografie",
  "Religion Studies": "Godsdienstudies",
  "Tourism": "Toerisme",
  "English Home Language": "Engels Huistaal",
  "English First Additional Language": "Engels Eerste Addisionele Taal",
  "Afrikaans Home Language": "Afrikaans Huistaal",
  "Afrikaans First Additional Language": "Afrikaans Eerste Addisionele Taal",
  "Visual Arts": "Visuele Kunste",
  "Dramatic Arts": "Dramatiese Kunste",
  "Dance Studies": "Dansstudies",
  "Music": "Musiek",
  "Drama": "Drama",
  "Design": "Ontwerp",
  "Information Technology": "Inligtingstegnologie",
  "Computer Applications Technology": "Rekenaartoepassingstegnologie",
  "Engineering Graphics and Design": "Ingenieursgrafika en Ontwerp",
  "Civil Technology": "Siviele Tegnologie",
  "Electrical Technology": "Elektriese Tegnologie",
  "Mechanical Technology": "Meganiese Tegnologie",
  "Hospitality Studies": "Gasvryheidsstudies",
  "Consumer Studies": "Verbruikersstudies",
};

/**
 * Returns the single most important "what to study right now" directive for a learner.
 * Combines the soonest upcoming exam with the learner's weakest topic in that subject.
 */
export async function getDailyDirective(userId: string): Promise<DailyDirective> {
  const schedule = await getLearnerSchedule(userId);
  const upcoming = schedule
    .filter(e => !e.isPast)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  // No upcoming exam → encourage general practice
  if (upcoming.length === 0) {
    return {
      hasExam: false,
      subjectName: "",
      subjectNameAf: "",
      subjectId: null,
      paperNumber: null,
      paperLabel: null,
      examDate: null,
      startTime: null,
      daysUntil: null,
      urgencyState: "build_mastery",
      urgencyLabel: URGENCY_LABELS.build_mastery.en,
      urgencyLabelAf: URGENCY_LABELS.build_mastery.af,
      urgencyColor: URGENCY_LABELS.build_mastery.color,
      message: "Pick a subject and keep building mastery.",
      messageAf: "Kies 'n vak en bly meesterskap bou.",
      deepLink: "/subjects",
      weakTopic: null,
      isExamToday: false,
    };
  }

  const next = upcoming[0];
  const urgency = URGENCY_LABELS[next.urgencyState as UrgencyState];
  const isExamToday = next.daysRemaining === 0;

  // Find the weakest topic in this subject (if subjectId is mapped)
  let weakTopic: DailyDirective["weakTopic"] = null;
  if (next.subjectId !== null) {
    try {
      const { topicMastery, topics } = await import("@shared/schema");
      const rows = await db
        .select({
          topicId: topicMastery.topicId,
          masteryScore: topicMastery.masteryScore,
          name: topics.name,
          nameAfrikaans: topics.nameAfrikaans,
        })
        .from(topicMastery)
        .innerJoin(topics, eq(topicMastery.topicId, topics.id))
        .where(and(eq(topicMastery.userId, userId), eq(topics.subjectId, next.subjectId)))
        .orderBy(topicMastery.masteryScore);
      if (rows.length > 0) {
        const r = rows[0];
        weakTopic = {
          id: r.topicId,
          name: r.name,
          nameAfrikaans: r.nameAfrikaans,
          masteryScore: r.masteryScore ?? 0,
        };
      }
    } catch (err) {
      console.error("[NSC Timetable] getDailyDirective weak-topic lookup error:", err);
    }
  }

  // Compose message
  let message: string;
  let messageAf: string;
  if (isExamToday) {
    message = `Exam today — final revision for ${next.subjectName} P${next.paperNumber}.`;
    messageAf = `Eksamen vandag — finale hersiening vir ${next.subjectName} V${next.paperNumber}.`;
  } else if (next.daysRemaining <= 3) {
    message = weakTopic
      ? `Final sprint — drill "${weakTopic.name}" before your ${next.subjectName} exam in ${next.daysRemaining} day${next.daysRemaining === 1 ? "" : "s"}.`
      : `Final sprint — your ${next.subjectName} P${next.paperNumber} is in ${next.daysRemaining} day${next.daysRemaining === 1 ? "" : "s"}.`;
    messageAf = weakTopic
      ? `Finale sprint — oefen "${weakTopic.nameAfrikaans || weakTopic.name}" voor jou ${next.subjectName}-eksamen oor ${next.daysRemaining} dag${next.daysRemaining === 1 ? "" : "e"}.`
      : `Finale sprint — jou ${next.subjectName} V${next.paperNumber} is oor ${next.daysRemaining} dag${next.daysRemaining === 1 ? "" : "e"}.`;
  } else if (next.daysRemaining <= 14) {
    message = weakTopic
      ? `${next.daysRemaining} days to ${next.subjectName} P${next.paperNumber} — focus on "${weakTopic.name}" today.`
      : `${next.daysRemaining} days to ${next.subjectName} P${next.paperNumber} — start timed practice papers.`;
    messageAf = weakTopic
      ? `${next.daysRemaining} dae tot ${next.subjectName} V${next.paperNumber} — fokus vandag op "${weakTopic.nameAfrikaans || weakTopic.name}".`
      : `${next.daysRemaining} dae tot ${next.subjectName} V${next.paperNumber} — begin getydsde oefenvraestelle.`;
  } else {
    message = weakTopic
      ? `Build mastery in ${next.subjectName} — start with "${weakTopic.name}".`
      : `Build mastery in ${next.subjectName} ahead of P${next.paperNumber}.`;
    messageAf = weakTopic
      ? `Bou meesterskap in ${next.subjectName} — begin met "${weakTopic.nameAfrikaans || weakTopic.name}".`
      : `Bou meesterskap in ${next.subjectName} voor V${next.paperNumber}.`;
  }

  return {
    hasExam: true,
    subjectName: next.subjectName,
    subjectNameAf: DIRECTIVE_AF_NAMES[next.subjectName] || next.subjectName,
    subjectId: next.subjectId,
    paperNumber: next.paperNumber,
    paperLabel: `Paper ${next.paperNumber}`,
    examDate: next.examDate,
    startTime: next.startTime,
    daysUntil: next.daysRemaining,
    urgencyState: next.urgencyState as UrgencyState,
    urgencyLabel: urgency.en,
    urgencyLabelAf: urgency.af,
    urgencyColor: urgency.color,
    message,
    messageAf,
    deepLink: next.subjectId !== null ? `/subject/${next.subjectId}` : "/subjects",
    weakTopic,
    isExamToday,
  };
}

// ============================================
// PRIORITY ORDERING UTILITY
// ============================================

/**
 * Reorders subject IDs by exam proximity (most urgent first).
 * If a subject's Paper 1 date has passed, suppress P1 and elevate P2.
 * Used by dashboard and study planner without rewriting either.
 */
export async function getSubjectPriorityOrder(
  userId: string,
  subjectIds: number[]
): Promise<Array<{ subjectId: number; paperFocus: number; daysRemaining: number; urgencyState: UrgencyState }>> {
  const schedule = await getLearnerSchedule(userId);

  const result: Array<{ subjectId: number; paperFocus: number; daysRemaining: number; urgencyState: UrgencyState }> = [];

  for (const sid of subjectIds) {
    const subjectEntries = schedule
      .filter(e => e.subjectId === sid)
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

    if (subjectEntries.length === 0) {
      result.push({ subjectId: sid, paperFocus: 1, daysRemaining: 999, urgencyState: "build_mastery" });
      continue;
    }

    // Find next upcoming paper (skip past ones)
    const nextEntry = subjectEntries.find(e => !e.isPast) || subjectEntries[subjectEntries.length - 1];

    result.push({
      subjectId: sid,
      paperFocus: nextEntry.paperNumber,
      daysRemaining: nextEntry.daysRemaining,
      urgencyState: nextEntry.urgencyState as UrgencyState,
    });
  }

  return result.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

// ============================================
// ADMIN UTILITIES
// ============================================

export async function regenerateAllLearnerSchedules(): Promise<number> {
  try {
    const allOnboardings = await db.select({ userId: onboardingResults.userId })
      .from(onboardingResults);

    let count = 0;
    for (const { userId } of allOnboardings) {
      await buildLearnerSchedule(userId);
      count++;
    }
    return count;
  } catch (err) {
    console.error("[NSC Timetable] regenerateAllLearnerSchedules error:", err);
    return 0;
  }
}

export async function getNscTimetableForAdmin(): Promise<NscTimetable[]> {
  return db.select().from(nscTimetable)
    .where(eq(nscTimetable.year, 2026))
    .orderBy(nscTimetable.examDate, nscTimetable.startTime);
}

export async function getSubjectMappings() {
  return db.select().from(timetableSubjectMapping);
}

export async function updateSubjectMapping(
  id: number,
  braintrackSubjectId: number | null,
  mappedBy: string
) {
  return db.update(timetableSubjectMapping)
    .set({ braintrackSubjectId, isConfirmed: true, mappedBy, updatedAt: new Date() })
    .where(eq(timetableSubjectMapping.id, id))
    .returning();
}

// ============================================
// COHORT EXAM PRESSURE (Admin/School view)
// ============================================

export interface CohortExamPressure {
  subjectName: string;
  subjectId: number | null;
  learnerCount: number;
  examDate: string;
  daysRemaining: number;
  urgencyState: UrgencyState;
  paperNumber: number;
  lowReadinessCount: number;
}

export async function getCohortExamPressure(): Promise<CohortExamPressure[]> {
  try {
    const allSchedules = await db.select().from(learnerExamSchedule)
      .where(eq(learnerExamSchedule.isPast, false));

    // Group by subject + paper
    const grouped = new Map<string, { entries: typeof allSchedules; subjectId: number | null }>();
    for (const entry of allSchedules) {
      const key = `${entry.subjectName}:${entry.paperNumber}`;
      if (!grouped.has(key)) {
        grouped.set(key, { entries: [], subjectId: entry.subjectId });
      }
      grouped.get(key)!.entries.push(entry);
    }

    // Fetch all relevant userProgress rows to compute low readiness counts
    const subjectIds = [...new Set(
      allSchedules.map(s => s.subjectId).filter((id): id is number => id !== null)
    )];
    const progressRows = subjectIds.length > 0
      ? await db.select().from(userProgress).where(inArray(userProgress.subjectId, subjectIds))
      : [];

    // Build map: subjectId → Set<userId> of learners with accuracy < 50%
    const lowReadinessMap = new Map<number, Set<string>>();
    for (const row of progressRows) {
      if (row.questionsAttempted > 0) {
        const accuracy = Math.round((row.correctAnswers / row.questionsAttempted) * 100);
        if (accuracy < 50) {
          if (!lowReadinessMap.has(row.subjectId)) {
            lowReadinessMap.set(row.subjectId, new Set());
          }
          lowReadinessMap.get(row.subjectId)!.add(row.userId);
        }
      }
    }

    const result: CohortExamPressure[] = [];
    for (const [, { entries, subjectId }] of grouped.entries()) {
      const first = entries[0];
      const learnerUserIds = new Set(entries.map(e => e.userId));
      // Count how many learners in this schedule have low readiness for this subject
      const lowSet = subjectId !== null ? (lowReadinessMap.get(subjectId) ?? new Set()) : new Set();
      const lowReadinessCount = [...learnerUserIds].filter(uid => lowSet.has(uid)).length;

      result.push({
        subjectName: first.subjectName,
        subjectId,
        learnerCount: entries.length,
        examDate: first.examDate,
        daysRemaining: first.daysRemaining,
        urgencyState: first.urgencyState as UrgencyState,
        paperNumber: first.paperNumber,
        lowReadinessCount,
      });
    }

    return result.sort((a, b) => a.daysRemaining - b.daysRemaining);
  } catch (err) {
    console.error("[NSC Timetable] getCohortExamPressure error:", err);
    return [];
  }
}
