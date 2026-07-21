/**
 * server/parent-preview.ts — admin-only, read-only preview of the parent
 * dashboard populated with realistic SAMPLE data.
 *
 * WHY THIS EXISTS
 * ---------------
 * Production has exactly one account (the admin) and zero parent-learner links,
 * so `/parent` renders its empty state and the owner cannot review the parent
 * dashboard's design. Seeding fake users/links into production to work around
 * that is precisely the pollution we spent a cleanup removing, so instead this
 * module serves a synthetic payload that never touches the database.
 *
 * HOW IT IS GATED — three independent conditions, all required
 * -----------------------------------------------------------
 *   1. The caller must be authenticated (a resolvable `req.user.claims.sub`).
 *   2. That user's DB row must have `role === "admin"` AND their email must be
 *      on the admin allowlist (`isAdminEmail`) — the same defence-in-depth pair
 *      that `requireRole("admin")` in routes.ts enforces.
 *   3. The request must explicitly opt in, either with `?preview=1` or by
 *      addressing the reserved sample learner id.
 *
 * If ANY condition fails the middleware calls `next()` and the real handler
 * runs untouched. It never short-circuits with an error and never returns
 * sample data to a non-admin, so a normal parent request cannot be affected
 * even if it somehow carried `?preview=1`.
 *
 * WHY IT KEYS OFF A RESERVED LEARNER ID
 * -------------------------------------
 * The parent dashboard has several widgets that build their own
 * `?learnerId=…` URLs inline. Rather than thread a preview flag through each
 * one, `/api/parent/children?preview=1` hands back a child whose id is
 * PREVIEW_LEARNER_ID; every downstream widget then naturally asks for that id
 * and is intercepted here. One opt-in at the top, sample data all the way down.
 *
 * NOTHING HERE WRITES. There are no inserts, updates or deletes in this file —
 * the only database access is an optional read of the subject list so the
 * sample readiness pills line up with real subject names.
 */

import type { RequestHandler } from "express";
import { storage } from "./storage";

/**
 * Reserved id for the synthetic learner. Deliberately not a UUID and
 * self-describing, so it is obvious in any log line or network tab that this
 * is not a real person.
 */
export const PREVIEW_LEARNER_ID = "preview-sample-learner-do-not-persist";

/** Shown in the UI. The "(SAMPLE)" suffix is deliberate and load-bearing. */
export const PREVIEW_LEARNER_NAME = "Amahle Dlamini (SAMPLE)";

/** Subjects the sample learner "takes", in display order. */
const SAMPLE_SUBJECTS: Array<{
  name: string;
  attempts: number;
  accuracy: number;
  baseline: number;
  mastery: number;
}> = [
  { name: "Mathematics", attempts: 214, accuracy: 66, baseline: 52, mastery: 63 },
  { name: "Physical Sciences", attempts: 168, accuracy: 58, baseline: 61, mastery: 55 },
  { name: "Life Sciences", attempts: 132, accuracy: 80, baseline: 70, mastery: 78 },
  { name: "English Home Language", attempts: 96, accuracy: 82, baseline: 74, mastery: 80 },
  { name: "Accounting", attempts: 58, accuracy: 43, baseline: 48, mastery: 41 },
  { name: "Geography", attempts: 47, accuracy: 71, baseline: 55, mastery: 69 },
];

const DAY = 86_400_000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY).toISOString();

/**
 * Resolve real subject ids by name so the readiness pills render with proper
 * subject labels instead of "Subject 1". Read-only, cached for the process,
 * and falls back to synthetic ids if the lookup fails for any reason.
 */
let subjectIdCache: Map<string, number> | null = null;
async function subjectIds(): Promise<Map<string, number>> {
  if (subjectIdCache) return subjectIdCache;
  const map = new Map<string, number>();
  try {
    const all = await storage.getAllSubjects();
    for (const s of all as Array<{ id: number; name: string }>) {
      map.set(s.name, s.id);
    }
  } catch (err) {
    console.warn(
      "[ParentPreview] Could not read the subject list for id mapping — the preview will use synthetic ids:",
      err instanceof Error ? err.message : String(err),
    );
  }
  subjectIdCache = map;
  return map;
}

async function idFor(name: string, fallback: number): Promise<number> {
  return (await subjectIds()).get(name) ?? fallback;
}

/* ── Sample payload builders — one per intercepted route ──────────────────── */

function sampleChildren() {
  return {
    children: [
      { learnerUserId: PREVIEW_LEARNER_ID, learnerName: PREVIEW_LEARNER_NAME },
    ],
  };
}

function sampleChildProgress() {
  return {
    learnerName: PREVIEW_LEARNER_NAME,
    currentStreak: 12,
    overallAccuracy: 68,
    totalQuestionsAnswered: 715,
    totalPapersCompleted: 6,
    lastActiveDate: iso(0),
    weeklyReport: {
      weekStarting: iso(-7),
      weekEnding: iso(0),
      studyDays: 5,
      totalMinutes: 284,
      questionsAnswered: 143,
      accuracy: 71,
      subjectBreakdown: SAMPLE_SUBJECTS.map((s) => ({
        subjectName: s.name,
        questionsAttempted: Math.round(s.attempts / 6),
        accuracy: s.accuracy,
        improvement: s.accuracy - s.baseline,
        masteryScore: s.mastery,
        progressScore: Math.min(100, s.mastery + 6),
      })),
      achievements: [
        "12-day study streak reached",
        "Life Sciences improved 10 points above baseline",
        "First full past paper completed in English Home Language",
      ],
      areasForImprovement: ["Accounting", "Physical Sciences"],
      streakDays: 12,
    },
    subjectMarks: SAMPLE_SUBJECTS.map((s) => ({
      subjectName: s.name,
      initialMark: s.baseline,
      currentMark: s.accuracy,
    })),
    examSessions: [
      { subject: "Mathematics", score: 58, totalMarks: 100, date: iso(-4), status: "completed" },
      { subject: "Life Sciences", score: 71, totalMarks: 100, date: iso(-11), status: "completed" },
      { subject: "Physical Sciences", score: 49, totalMarks: 100, date: iso(-18), status: "completed" },
    ],
    varkPrimary: "visual",
  };
}

function sampleReadiness() {
  return {
    readiness: SAMPLE_SUBJECTS.map((s) => {
      const delta = s.accuracy - s.baseline;
      return {
        subjectName: s.name,
        readinessScore: Math.min(100, Math.round(s.accuracy * 0.7 + Math.max(0, delta) * 0.3)),
        currentAccuracy: s.accuracy,
        baselineMark: s.baseline,
        delta,
        masteryBand: s.accuracy >= 75 ? "green" : s.accuracy >= 50 ? "amber" : "red",
        trendDirection: delta > 2 ? "up" : delta < -2 ? "down" : "stable",
        trendScores: [
          Math.max(0, s.accuracy - 9),
          Math.max(0, s.accuracy - 5),
          Math.max(0, s.accuracy - 2),
          s.accuracy,
        ],
      };
    }),
  };
}

function sampleActivityFeed() {
  const topics: Record<string, string> = {
    Mathematics: "Trigonometry — compound angles",
    "Physical Sciences": "Electrostatics",
    "Life Sciences": "Genetics and inheritance",
    "English Home Language": "Comprehension and summary",
    Accounting: "Cash flow statements",
    Geography: "Geomorphology — fluvial processes",
  };
  const feed = Array.from({ length: 16 }, (_, i) => {
    const subj = SAMPLE_SUBJECTS[i % SAMPLE_SUBJECTS.length];
    const correct = (i * 7) % 3 !== 0;
    const available = 3 + (i % 3);
    return {
      id: 900_000 + i,
      type: "quiz_attempt" as const,
      timestamp: new Date(Date.now() - i * 3.7 * 3_600_000).toISOString(),
      subjectName: subj.name,
      topicName: topics[subj.name] ?? null,
      isCorrect: correct,
      marksAwarded: correct ? available : Math.max(0, available - 2),
      marksAvailable: available,
      questionNumber: `${1 + (i % 9)}.${1 + (i % 4)}`,
    };
  });
  return { feed };
}

function sampleMonthlySummary() {
  return {
    questionsAnswered: 457,
    studyDays: 22,
    avgAccuracy: 68,
    topSubjects: SAMPLE_SUBJECTS.slice(0, 5).map((s) => ({
      subjectName: s.name,
      attempts: s.attempts,
      accuracy: s.accuracy,
    })),
  };
}

async function sampleExamSchedule() {
  const rows = [
    { name: "Mathematics", paper: 1, days: 4 },
    { name: "Mathematics", paper: 2, days: 7 },
    { name: "Physical Sciences", paper: 1, days: 11 },
    { name: "Life Sciences", paper: 1, days: 16 },
    { name: "Accounting", paper: 1, days: 23 },
    { name: "English Home Language", paper: 1, days: 29 },
  ];
  const urgency = (d: number) =>
    d <= 5 ? "final_sprint" : d <= 14 ? "exam_prep_mode" : d <= 30 ? "focused_revision" : "build_mastery";

  const schedule = await Promise.all(
    rows.map(async (r, i) => {
      const subj = SAMPLE_SUBJECTS.find((s) => s.name === r.name);
      const acc = subj?.accuracy ?? null;
      return {
        subjectName: r.name,
        paperNumber: r.paper,
        examDate: iso(r.days),
        startTime: r.paper === 1 ? "09:00" : "14:00",
        daysRemaining: r.days,
        urgencyState: urgency(r.days),
        subjectId: await idFor(r.name, i + 1),
        subjectAccuracy: acc,
        isAtRisk: r.days <= 7 && (acc ?? 100) < 50,
      };
    }),
  );

  return {
    schedule,
    nonExamDays: [
      { examDate: iso(9), subjectName: "Public holiday — no examinations" },
      { examDate: iso(20), subjectName: "Study day — no examinations" },
    ],
    learnerId: PREVIEW_LEARNER_ID,
  };
}

async function sampleDirective() {
  return {
    hasExam: true,
    subjectName: "Mathematics",
    subjectNameAf: "Wiskunde",
    subjectId: await idFor("Mathematics", 1),
    paperNumber: 1,
    paperLabel: "Paper 1",
    examDate: iso(4),
    startTime: "09:00",
    daysUntil: 4,
    urgencyState: "final_sprint",
    urgencyLabel: "Final Sprint",
    urgencyLabelAf: "Finale Eindstryd",
    urgencyColor: "red",
    message:
      "Mathematics Paper 1 is in 4 days. Focus only on high-yield topics — compound angles and functions are the weakest areas right now.",
    messageAf:
      "Wiskunde Vraestel 1 is oor 4 dae. Fokus net op hoë-opbrengs onderwerpe — saamgestelde hoeke en funksies is tans die swakste areas.",
    deepLink: "/subjects",
    weakTopic: {
      id: 4211,
      name: "Trigonometry — compound angles",
      nameAfrikaans: "Trigonometrie — saamgestelde hoeke",
      masteryScore: 41,
    },
    isExamToday: false,
  };
}

async function sampleSubjectReadiness() {
  const readiness: Record<number, number> = {};
  for (let i = 0; i < SAMPLE_SUBJECTS.length; i++) {
    const s = SAMPLE_SUBJECTS[i];
    readiness[await idFor(s.name, i + 1)] = Math.round(
      s.mastery * 0.4 + s.accuracy * 0.35 + 72 * 0.25,
    );
  }
  return { readiness };
}

function sampleLinkHistory() {
  return [
    { usedAt: iso(-9), createdAt: iso(-10) },
    { usedAt: null, createdAt: iso(-31) },
  ];
}

/** Route path (relative to the /api/parent mount) → payload builder. */
const PREVIEW_ROUTES: Record<string, () => unknown | Promise<unknown>> = {
  "/children": sampleChildren,
  "/child-progress": sampleChildProgress,
  "/readiness": sampleReadiness,
  "/activity-feed": sampleActivityFeed,
  "/monthly-summary": sampleMonthlySummary,
  "/learner-exam-schedule": sampleExamSchedule,
  "/learner-today-directive": sampleDirective,
  "/learner-subject-readiness": sampleSubjectReadiness,
  "/onboarding-link-history": sampleLinkHistory,
};

/**
 * Mounted with `app.use("/api/parent", parentPreviewMiddleware)` ahead of the
 * real parent routes. See the gating contract at the top of this file.
 */
export const parentPreviewMiddleware: RequestHandler = async (req, res, next) => {
  try {
    // (3) Explicit opt-in. Cheapest check, so it runs first.
    const optedIn =
      req.query.preview === "1" || req.query.learnerId === PREVIEW_LEARNER_ID;
    if (!optedIn) return next();

    const build = PREVIEW_ROUTES[req.path];
    if (!build) return next();

    // (1) Authenticated?
    const userId = (req as any).user?.claims?.sub;
    if (!userId) return next();

    // (2) Admin, by role AND by allowlisted email.
    const { authStorage } = await import("./replit_integrations/auth/storage");
    const user = await authStorage.getUser(userId);
    if (!user || user.role !== "admin") return next();

    const { isAdminEmail } = await import("./replit_integrations/auth/replitAuth");
    if (!isAdminEmail(user.email)) return next();

    const payload = await build();
    res.setHeader("X-BrainTrack-Preview", "sample-data");
    // Never let a sample payload sit in a shared/proxy cache.
    res.setHeader("Cache-Control", "no-store, private");
    return res.json(payload);
  } catch (err) {
    console.error(
      "[ParentPreview] Failed to build sample payload for",
      req.path,
      "-",
      err instanceof Error ? err.message : String(err),
    );
    // Fall through to the real handler rather than breaking the page.
    return next();
  }
};
