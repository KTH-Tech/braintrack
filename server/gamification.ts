/**
 * Gamification Engine — Phase 5
 *
 * This module handles:
 * - Structured activity event emission and persistence
 * - Badge evaluation after every event
 * - In-app notification creation
 * - Daily aggregation scheduling (readiness scores, streaks, weekly summaries)
 */

import { db } from "./db";
import { pool } from "./db";
import {
  activityEvents,
  personalBests,
  notifications,
  userBadges,
  userStreaks,
  topicMastery,
  attempts,
  subjects,
  type ActivityEvent,
} from "@shared/schema";
import { eq, and, sql, desc, gte, lt, count, avg } from "drizzle-orm";
import { storage } from "./storage";

// ============================================
// EVENT TYPES
// ============================================

export type ActivityEventType =
  | "lesson_completed"
  | "quiz_submitted"
  | "score_recorded"
  | "study_session_started"
  | "study_session_ended"
  | "topic_mastered"
  | "report_viewed";

export interface EventMetadata {
  subjectId?: number;
  subjectName?: string;
  topicId?: number;
  topicName?: string;
  score?: number;
  marksAwarded?: number;
  marksAvailable?: number;
  sessionId?: number | string;
  improvement?: number;
  streakDays?: number;
  [key: string]: unknown;
}

// ============================================
// BADGE DEFINITIONS
// ============================================

export const BADGE_DEFINITIONS: Record<string, {
  name: string;
  nameAf: string;
  description: string;
  descriptionAf: string;
  isFirstTime?: boolean;
}> = {
  first_quiz:       { name: "First Quiz",       nameAf: "Eerste Toets",        description: "Completed your first quiz",             descriptionAf: "Jou eerste toets voltooi" },
  first_paper:      { name: "First Paper",       nameAf: "Eerste Vraestel",     description: "Completed your first full paper",        descriptionAf: "Jou eerste vraestel voltooi" },
  high_score:       { name: "80% Club",          nameAf: "80% Klub",            description: "Scored 80% or higher",                  descriptionAf: "80% of hoër behaal", isFirstTime: true },
  improvement_15:   { name: "15% Improver",      nameAf: "15% Verbeteraar",     description: "Improved your score by 15%+ in a subject", descriptionAf: "Jou telling met 15%+ verbeter", isFirstTime: true },
  streak_3:         { name: "3-Day Streak",       nameAf: "3-Dag Reeks",         description: "Studied 3 days in a row",               descriptionAf: "3 dae agtereenvolgens gestudeer" },
  streak_7:         { name: "7-Day Streak",       nameAf: "7-Dag Reeks",         description: "Studied 7 days in a row",               descriptionAf: "7 dae agtereenvolgens gestudeer" },
  streak_14:        { name: "14-Day Streak",      nameAf: "14-Dag Reeks",        description: "Studied 14 days in a row",              descriptionAf: "14 dae agtereenvolgens gestudeer" },
  streak_30:        { name: "30-Day Streak",      nameAf: "30-Dag Reeks",        description: "Studied 30 days in a row",              descriptionAf: "30 dae agtereenvolgens gestudeer" },
  topic_mastery:    { name: "Topic Master",       nameAf: "Onderwerp Meester",   description: "Mastered a topic (score 75+)",          descriptionAf: "Onderwerp bemeester (telling 75+)", isFirstTime: true },
  subject_mastery:  { name: "Subject Master",     nameAf: "Vak Meester",         description: "Mastered all topics in a subject",      descriptionAf: "Alle onderwerpe in 'n vak bemeester", isFirstTime: true },
  study_week:       { name: "Full Study Week",    nameAf: "Volle Studieweek",    description: "Studied every day for a full week",     descriptionAf: "Elke dag vir 'n volle week gestudeer", isFirstTime: true },
  questions_10:     { name: "10 Questions",       nameAf: "10 Vrae",             description: "Answered 10 questions",                 descriptionAf: "10 vrae beantwoord" },
  questions_50:     { name: "50 Questions",       nameAf: "50 Vrae",             description: "Answered 50 questions",                 descriptionAf: "50 vrae beantwoord" },
  questions_100:    { name: "100 Questions",      nameAf: "100 Vrae",            description: "Answered 100 questions",                descriptionAf: "100 vrae beantwoord" },
  questions_500:    { name: "500 Questions",      nameAf: "500 Vrae",            description: "Answered 500 questions",                descriptionAf: "500 vrae beantwoord" },
  accuracy_70:      { name: "70% Accuracy",       nameAf: "70% Akkuraatheid",    description: "Reached 70% overall accuracy",          descriptionAf: "70% algehele akkuraatheid bereik" },
  accuracy_80:      { name: "80% Accuracy",       nameAf: "80% Akkuraatheid",    description: "Reached 80% overall accuracy",          descriptionAf: "80% algehele akkuraatheid bereik" },
  accuracy_90:      { name: "90% Accuracy",       nameAf: "90% Akkuraatheid",    description: "Reached 90% overall accuracy",          descriptionAf: "90% algehele akkuraatheid bereik" },
  exam_complete:    { name: "Exam Ready",         nameAf: "Eksamen Gereed",      description: "Completed a full exam paper",           descriptionAf: "Volle vraestel voltooi" },
  exam_champion:    { name: "Exam Champion",      nameAf: "Eksamen Kampioen",    description: "Completed 5 or more full papers",       descriptionAf: "5 of meer vraestelle voltooi" },
};

// ============================================
// SAFE DB FALLBACK — CREATE TABLES IF NOT EXISTS
// Kept as a safety net for environments where the migration runner
// has not yet been executed. The canonical schema definition is in
// shared/schema.ts and the authoritative migration is
// migrations/0005_gamification_activity_events.sql.
// ============================================

export async function ensureGamificationTables(): Promise<void> {
  try {
    // nosemgrep: javascript.drizzle-orm.security.audit.ban-drizzle-sql-raw -- static DDL, no user input
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_events (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        event_type TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        occurred_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS activity_events_user_idx ON activity_events(user_id);
      CREATE INDEX IF NOT EXISTS activity_events_type_idx ON activity_events(event_type);
      CREATE INDEX IF NOT EXISTS activity_events_occurred_idx ON activity_events(user_id, occurred_at);

      CREATE TABLE IF NOT EXISTS personal_bests (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        subject_id INTEGER NOT NULL REFERENCES subjects(id),
        highest_score INTEGER NOT NULL DEFAULT 0,
        highest_score_at TIMESTAMP,
        best_streak INTEGER NOT NULL DEFAULT 0,
        total_sessions INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS personal_bests_user_subject_idx ON personal_bests(user_id, subject_id);
    `);
    console.log("[Gamification] Tables verified / created.");
  } catch (err: any) {
    console.error("[Gamification] Table migration error:", err.message);
  }
}

// ============================================
// ACTIVITY EVENT EMISSION
// ============================================

export async function emitEvent(
  userId: string,
  eventType: ActivityEventType,
  metadata: EventMetadata = {}
): Promise<{ newBadges: string[] }> {
  try {
    await db.insert(activityEvents).values({ userId, eventType, metadata });
  } catch (err: any) {
    console.error("[Gamification] emitEvent insert error:", err.message);
  }

  // Evaluate badges after each event
  const newBadges = await evaluateBadges(userId, eventType, metadata);

  // Create in-app notifications for newly awarded badges
  for (const badgeCode of newBadges) {
    await createBadgeNotification(userId, badgeCode);
  }

  // Update personal bests if score event
  if (
    (eventType === "score_recorded" || eventType === "quiz_submitted") &&
    metadata.subjectId &&
    typeof metadata.score === "number"
  ) {
    await updatePersonalBest(userId, metadata.subjectId, metadata.score).catch(() => {});
  }

  return { newBadges };
}

// ============================================
// BADGE EVALUATION ENGINE
// ============================================

async function evaluateBadges(
  userId: string,
  eventType: ActivityEventType,
  metadata: EventMetadata
): Promise<string[]> {
  const awarded: string[] = [];

  try {
    const stats = await storage.getUserStats(userId);
    const streak = await storage.getUserStreak(userId);

    // --- First Quiz ---
    if (eventType === "quiz_submitted" || eventType === "score_recorded") {
      const [{ cnt }] = await db
        .select({ cnt: count() })
        .from(activityEvents)
        .where(
          and(
            eq(activityEvents.userId, userId),
            sql`${activityEvents.eventType} IN ('quiz_submitted', 'score_recorded')`
          )
        );
      if (Number(cnt) === 1) {
        const b = await storage.awardBadge(userId, "first_quiz");
        if (b) awarded.push("first_quiz");
      }
    }

    // --- First Paper ---
    if (eventType === "quiz_submitted" || eventType === "score_recorded") {
      const examSessions = await storage.getExamSessionsByUser(userId);
      if (examSessions.filter((s: any) => s.status === "completed").length >= 1) {
        const b = await storage.awardBadge(userId, "first_paper");
        if (b) awarded.push("first_paper");
      }
    }

    // --- 80% High Score Badge ---
    if (
      (eventType === "score_recorded" || eventType === "quiz_submitted") &&
      typeof metadata.score === "number" &&
      metadata.score >= 80
    ) {
      const b = await storage.awardBadge(userId, "high_score");
      if (b) awarded.push("high_score");
    }

    // --- 15% Improvement ---
    if (
      metadata.improvement !== undefined &&
      metadata.improvement >= 15 &&
      metadata.subjectId
    ) {
      const b = await storage.awardBadge(userId, "improvement_15");
      if (b) awarded.push("improvement_15");
    }

    // --- Streak badges ---
    const currentStreak = streak?.currentStreak || 0;
    const streakBadges: [number, string][] = [[3, "streak_3"], [7, "streak_7"], [14, "streak_14"], [30, "streak_30"]];
    for (const [threshold, code] of streakBadges) {
      if (currentStreak >= threshold) {
        const b = await storage.awardBadge(userId, code);
        if (b) awarded.push(code);
      }
    }

    // --- Full Study Week (7 unique days in last 7 calendar days) ---
    const [distinctResult] = await db
      .select({
        distinctDays: sql<number>`COUNT(DISTINCT DATE(${activityEvents.occurredAt}))`,
      })
      .from(activityEvents)
      .where(
        and(
          eq(activityEvents.userId, userId),
          gte(activityEvents.occurredAt, sql`NOW() - INTERVAL '7 days'`)
        )
      );
    if (Number(distinctResult.distinctDays) >= 7) {
      const b = await storage.awardBadge(userId, "study_week");
      if (b) awarded.push("study_week");
    }

    // --- Topic Mastery ---
    if (eventType === "topic_mastered" && metadata.topicId) {
      const b = await storage.awardBadge(userId, "topic_mastery");
      if (b) awarded.push("topic_mastery");
    }

    // --- Questions badges ---
    const qAnswered = stats.questionsAnswered || 0;
    const questionBadges: [number, string][] = [
      [10, "questions_10"],
      [50, "questions_50"],
      [100, "questions_100"],
      [500, "questions_500"],
    ];
    for (const [threshold, code] of questionBadges) {
      if (qAnswered >= threshold) {
        const b = await storage.awardBadge(userId, code);
        if (b) awarded.push(code);
      }
    }

    // --- Accuracy badges (require at least 20 questions) ---
    if (qAnswered >= 20) {
      const accuracyBadges: [number, string][] = [
        [70, "accuracy_70"],
        [80, "accuracy_80"],
        [90, "accuracy_90"],
      ];
      for (const [threshold, code] of accuracyBadges) {
        if ((stats.accuracy || 0) >= threshold) {
          const b = await storage.awardBadge(userId, code);
          if (b) awarded.push(code);
        }
      }
    }

    // --- Exam complete / champion ---
    if (eventType === "quiz_submitted" || eventType === "score_recorded") {
      const examSessions = await storage.getExamSessionsByUser(userId);
      const completedCount = examSessions.filter((s: any) => s.status === "completed").length;
      if (completedCount >= 1) {
        const b = await storage.awardBadge(userId, "exam_complete");
        if (b) awarded.push("exam_complete");
      }
      if (completedCount >= 5) {
        const b = await storage.awardBadge(userId, "exam_champion");
        if (b) awarded.push("exam_champion");
      }
    }
  } catch (err: any) {
    console.error("[Gamification] evaluateBadges error:", err.message);
  }

  return awarded;
}

// ============================================
// IN-APP NOTIFICATIONS
// ============================================

export async function createInAppNotification(
  userId: string,
  type: string,
  titleEn: string,
  titleAf: string,
  messageEn: string,
  messageAf: string,
  data: Record<string, unknown> = {}
): Promise<void> {
  try {
    await db.insert(notifications).values({
      userId,
      type,
      titleEn,
      titleAf,
      messageEn,
      messageAf,
      channel: "in_app",
      status: "unread",
      data,
    });
  } catch (err: any) {
    console.error("[Gamification] createInAppNotification error:", err.message);
  }
}

async function createBadgeNotification(userId: string, badgeCode: string): Promise<void> {
  const def = BADGE_DEFINITIONS[badgeCode];
  if (!def) return;
  await createInAppNotification(
    userId,
    "badge_earned",
    `Badge Earned: ${def.name}`,
    `Kenteken Verdien: ${def.nameAf}`,
    `You earned the "${def.name}" badge! ${def.description}.`,
    `Jy het die "${def.nameAf}" kenteken verdien! ${def.descriptionAf}.`,
    { badgeCode, isFirstTime: def.isFirstTime ?? false }
  );
}

export async function createMilestoneNotification(userId: string, milestone: string, messageEn: string, messageAf: string): Promise<void> {
  await createInAppNotification(
    userId,
    "milestone_reached",
    "Milestone Reached!",
    "Mylpaal Bereik!",
    messageEn,
    messageAf,
    { milestone }
  );
}

export async function createStreakAlertNotification(userId: string, streakDays: number): Promise<void> {
  await createInAppNotification(
    userId,
    "streak_alert",
    `${streakDays}-Day Streak!`,
    `${streakDays}-Dag Reeks!`,
    `You've been studying for ${streakDays} days in a row! Keep the momentum going.`,
    `Jy studeer al ${streakDays} dae agtereenvolgens! Hou die momentum vol.`,
    { streakDays }
  );
}

export async function createParentReportNotification(userId: string): Promise<void> {
  await createInAppNotification(
    userId,
    "parent_report_ready",
    "Parent Report Ready",
    "Ouerverslag Gereed",
    "A new progress report has been sent to your parent.",
    "'n Nuwe vorderingsverslag is na jou ouer gestuur.",
    {}
  );
}

export async function createInactivityAlert(userId: string): Promise<void> {
  await createInAppNotification(
    userId,
    "inactivity_alert",
    "We Miss You!",
    "Ons Mis Jou!",
    "You haven't studied in 3 days. Jump back in — every day counts!",
    "Jy het 3 dae nie gestudeer nie. Spring terug in — elke dag tel!",
    {}
  );
}

// ============================================
// PERSONAL BESTS
// ============================================

export async function updatePersonalBest(
  userId: string,
  subjectId: number,
  score: number
): Promise<void> {
  try {
    await db
      .insert(personalBests)
      .values({
        userId,
        subjectId,
        highestScore: score,
        highestScoreAt: new Date(),
        totalSessions: 1,
      })
      .onConflictDoUpdate({
        target: [personalBests.userId, personalBests.subjectId],
        set: {
          highestScore: sql`GREATEST(${personalBests.highestScore}, EXCLUDED.highest_score)`,
          highestScoreAt: sql`CASE WHEN EXCLUDED.highest_score > ${personalBests.highestScore} THEN NOW() ELSE ${personalBests.highestScoreAt} END`,
          totalSessions: sql`${personalBests.totalSessions} + 1`,
          updatedAt: new Date(),
        },
      });
  } catch (err: any) {
    console.error("[Gamification] updatePersonalBest error:", err.message);
  }
}

export async function getPersonalBests(userId: string): Promise<any[]> {
  try {
    return await db
      .select({
        id: personalBests.id,
        userId: personalBests.userId,
        subjectId: personalBests.subjectId,
        highestScore: personalBests.highestScore,
        highestScoreAt: personalBests.highestScoreAt,
        bestStreak: personalBests.bestStreak,
        totalSessions: personalBests.totalSessions,
        updatedAt: personalBests.updatedAt,
        subjectName: subjects.name,
        subjectNameAf: subjects.nameAfrikaans,
        subjectCode: subjects.code,
      })
      .from(personalBests)
      .innerJoin(subjects, eq(subjects.id, personalBests.subjectId))
      .where(eq(personalBests.userId, userId))
      .orderBy(desc(personalBests.highestScore));
  } catch {
    return [];
  }
}

// ============================================
// YOU VS YOU — WEEKLY COMPARISON
// ============================================

export async function getWeeklyComparison(userId: string): Promise<{
  thisWeek: { accuracy: number; questionsAnswered: number; studyDays: number };
  lastWeek: { accuracy: number; questionsAnswered: number; studyDays: number };
}> {
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - 7);
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(now.getDate() - 14);

  try {
    const { rows: thisWeekRows } = await pool.query(
      `SELECT
         COUNT(*) AS total_attempts,
         SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct_attempts,
         COUNT(DISTINCT DATE(created_at)) AS study_days
       FROM attempts
       WHERE user_id=$1 AND created_at >= $2`,
      [userId, thisWeekStart.toISOString()]
    );

    const { rows: lastWeekRows } = await pool.query(
      `SELECT
         COUNT(*) AS total_attempts,
         SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct_attempts,
         COUNT(DISTINCT DATE(created_at)) AS study_days
       FROM attempts
       WHERE user_id=$1 AND created_at >= $2 AND created_at < $3`,
      [userId, lastWeekStart.toISOString(), thisWeekStart.toISOString()]
    );

    const parseRow = (row: any) => {
      const total = parseInt(row.total_attempts) || 0;
      const correct = parseInt(row.correct_attempts) || 0;
      return {
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        questionsAnswered: total,
        studyDays: parseInt(row.study_days) || 0,
      };
    };

    return {
      thisWeek: parseRow(thisWeekRows[0] || {}),
      lastWeek: parseRow(lastWeekRows[0] || {}),
    };
  } catch (err: any) {
    console.error("[Gamification] getWeeklyComparison error:", err.message);
    return {
      thisWeek: { accuracy: 0, questionsAnswered: 0, studyDays: 0 },
      lastWeek: { accuracy: 0, questionsAnswered: 0, studyDays: 0 },
    };
  }
}

// ============================================
// IN-APP NOTIFICATION RETRIEVAL
// ============================================

export async function getInAppNotifications(userId: string, limit = 20): Promise<any[]> {
  try {
    return await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.channel, "in_app")))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
}

export async function markNotificationRead(notifId: number, userId: string): Promise<void> {
  try {
    await db
      .update(notifications)
      .set({ status: "read", sentAt: new Date() })
      .where(and(eq(notifications.id, notifId), eq(notifications.userId, userId)));
  } catch (err: any) {
    console.error("[Gamification] markNotificationRead error:", err.message);
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  try {
    await db
      .update(notifications)
      .set({ status: "read", sentAt: new Date() })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.channel, "in_app"),
          eq(notifications.status, "unread")
        )
      );
  } catch (err: any) {
    console.error("[Gamification] markAllNotificationsRead error:", err.message);
  }
}

// ============================================
// NEXT MILESTONE WIDGET
// ============================================

interface BadgeProgress {
  badgeCode: string;
  name: string;
  nameAf: string;
  progressPct: number;
  currentValue: number;
  targetValue: number;
  unit: string;
}

export async function getNextMilestone(userId: string): Promise<BadgeProgress | null> {
  try {
    const earnedBadges = await storage.getUserBadges(userId);
    const earnedCodes = new Set(earnedBadges.map((b: any) => b.badgeCode));
    const stats = await storage.getUserStats(userId);
    const streak = await storage.getUserStreak(userId);

    const candidates: BadgeProgress[] = [];

    // Streak milestones
    const streakVal = streak?.currentStreak || 0;
    for (const [threshold, code, nameEn, nameAf] of [
      [3, "streak_3", "3-Day Streak", "3-Dag Reeks"],
      [7, "streak_7", "7-Day Streak", "7-Dag Reeks"],
      [14, "streak_14", "14-Day Streak", "14-Dag Reeks"],
      [30, "streak_30", "30-Day Streak", "30-Dag Reeks"],
    ] as [number, string, string, string][]) {
      if (!earnedCodes.has(code)) {
        candidates.push({
          badgeCode: code,
          name: nameEn,
          nameAf,
          progressPct: Math.min(100, Math.round((streakVal / threshold) * 100)),
          currentValue: streakVal,
          targetValue: threshold,
          unit: "days",
        });
        break;
      }
    }

    // Questions milestones
    const qVal = stats.questionsAnswered || 0;
    for (const [threshold, code, nameEn, nameAf] of [
      [10, "questions_10", "10 Questions", "10 Vrae"],
      [50, "questions_50", "50 Questions", "50 Vrae"],
      [100, "questions_100", "100 Questions", "100 Vrae"],
      [500, "questions_500", "500 Questions", "500 Vrae"],
    ] as [number, string, string, string][]) {
      if (!earnedCodes.has(code)) {
        candidates.push({
          badgeCode: code,
          name: nameEn,
          nameAf,
          progressPct: Math.min(100, Math.round((qVal / threshold) * 100)),
          currentValue: qVal,
          targetValue: threshold,
          unit: "questions",
        });
        break;
      }
    }

    // Accuracy milestones
    const accVal = stats.accuracy || 0;
    for (const [threshold, code, nameEn, nameAf] of [
      [70, "accuracy_70", "70% Accuracy", "70% Akkuraatheid"],
      [80, "accuracy_80", "80% Accuracy", "80% Akkuraatheid"],
      [90, "accuracy_90", "90% Accuracy", "90% Akkuraatheid"],
    ] as [number, string, string, string][]) {
      if (!earnedCodes.has(code)) {
        if (accVal < threshold) {
          candidates.push({
            badgeCode: code,
            name: nameEn,
            nameAf,
            progressPct: Math.min(100, Math.round((accVal / threshold) * 100)),
            currentValue: accVal,
            targetValue: threshold,
            unit: "%",
          });
          break;
        }
      }
    }

    if (candidates.length === 0) return null;
    // Return the one with highest progress percentage (closest to earning)
    candidates.sort((a, b) => b.progressPct - a.progressPct);
    return candidates[0];
  } catch (err: any) {
    console.error("[Gamification] getNextMilestone error:", err.message);
    return null;
  }
}

// ============================================
// ADMIN ANALYTICS
// ============================================

export async function getDAU(fromDate: string, toDate: string): Promise<any[]> {
  try {
    const { rows } = await pool.query(
      `SELECT
         DATE(a.created_at) AS date,
         COUNT(DISTINCT a.user_id) AS active_users
       FROM attempts a
       WHERE DATE(a.created_at) >= $1 AND DATE(a.created_at) <= $2
       GROUP BY DATE(a.created_at)
       ORDER BY date ASC`,
      [fromDate, toDate]
    );
    return rows.map((r: any) => ({ date: r.date, activeUsers: parseInt(r.active_users) }));
  } catch {
    return [];
  }
}

export async function getQuizCompletionRate(): Promise<{ total: number; completed: number; rate: number }> {
  try {
    const { rows: [row] } = await pool.query( // nosemgrep: javascript.drizzle-orm.security.audit.ban-drizzle-sql-raw -- static SQL, no user input
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed
       FROM exam_sessions`
    );
    const total = parseInt(row?.total) || 0;
    const completed = parseInt(row?.completed) || 0;
    return { total, completed, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  } catch {
    return { total: 0, completed: 0, rate: 0 };
  }
}

export async function getBadgeAwardRate(): Promise<{ totalBadgesAwarded: number; uniqueUsers: number; avgPerUser: number }> {
  try {
    const { rows: [row] } = await pool.query( // nosemgrep: javascript.drizzle-orm.security.audit.ban-drizzle-sql-raw -- static SQL, no user input
      `SELECT COUNT(*) AS total, COUNT(DISTINCT user_id) AS unique_users FROM user_badges`
    );
    const total = parseInt(row?.total) || 0;
    const uniqueUsers = parseInt(row?.unique_users) || 0;
    return {
      totalBadgesAwarded: total,
      uniqueUsers,
      avgPerUser: uniqueUsers > 0 ? Math.round((total / uniqueUsers) * 10) / 10 : 0,
    };
  } catch {
    return { totalBadgesAwarded: 0, uniqueUsers: 0, avgPerUser: 0 };
  }
}

export async function getAvgReadinessBySchool(): Promise<any[]> {
  try {
    const { rows } = await pool.query( // nosemgrep: javascript.drizzle-orm.security.audit.ban-drizzle-sql-raw -- static SQL, no user input
      `SELECT
         u.school AS school_name,
         COUNT(DISTINCT u.id) AS learner_count,
         COALESCE(AVG(tm.mastery_score), 0)::int AS avg_readiness,
         COALESCE(AVG(us.current_streak), 0)::int AS avg_streak
       FROM users u
       LEFT JOIN topic_mastery tm ON tm.user_id = u.id
       LEFT JOIN user_streaks us ON us.user_id = u.id
       WHERE u.role = 'learner' AND u.school IS NOT NULL
       GROUP BY u.school
       ORDER BY avg_readiness DESC
       LIMIT 50`
    );
    return rows.map((r: any) => ({
      schoolName: r.school_name,
      learnerCount: parseInt(r.learner_count),
      avgReadiness: parseInt(r.avg_readiness),
      avgStreak: parseInt(r.avg_streak),
    }));
  } catch {
    return [];
  }
}

// ============================================
// DAILY AGGREGATION JOB
// ============================================

export async function runDailyAggregation(): Promise<void> {
  console.log("[Gamification] Daily aggregation started...");
  try {
    // 1. Recalculate streaks — reset broken streaks (no activity yesterday or today)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const todayStr = new Date().toISOString().split("T")[0];

    await pool.query(
      `UPDATE user_streaks
       SET current_streak = 0, updated_at = NOW()
       WHERE last_activity_date < $1 AND current_streak > 0`,
      [yesterdayStr]
    );

    // 2. Send inactivity alerts for learners inactive 3+ days
    const { rows: inactiveUsers } = await pool.query( // nosemgrep: javascript.drizzle-orm.security.audit.ban-drizzle-sql-raw -- static SQL, no user input
      `SELECT DISTINCT u.id FROM users u
       JOIN user_streaks us ON us.user_id = u.id
       WHERE u.role = 'learner'
         AND us.last_activity_date <= (CURRENT_DATE - INTERVAL '3 days')
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.user_id = u.id
             AND n.type = 'inactivity_alert'
             AND n.channel = 'in_app'
             AND n.created_at >= NOW() - INTERVAL '3 days'
         )`
    );

    for (const { id } of inactiveUsers) {
      await createInactivityAlert(id).catch(() => {});
    }

    // 3. Pre-compute weekly summaries (stored as prep_scores snapshot)
    // Snapshot current state for parent/school dashboards
    const { rows: activeUsers } = await pool.query( // nosemgrep: javascript.drizzle-orm.security.audit.ban-drizzle-sql-raw -- static SQL, no user input
      `SELECT DISTINCT user_id FROM attempts WHERE created_at >= NOW() - INTERVAL '7 days'`
    );

    for (const { user_id } of activeUsers) {
      try {
        const statsRow = await pool.query(
          `SELECT
             COUNT(*) AS total,
             SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct,
             COUNT(DISTINCT exam_paper_id) AS papers
           FROM attempts a
           JOIN questions q ON q.id = a.question_id
           WHERE a.user_id=$1 AND a.created_at >= NOW() - INTERVAL '7 days'`,
          [user_id]
        );
        const row = statsRow.rows[0];
        const total = parseInt(row?.total) || 0;
        const correct = parseInt(row?.correct) || 0;
        const papers = parseInt(row?.papers) || 0;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        const streakRow = await pool.query(
          `SELECT current_streak FROM user_streaks WHERE user_id=$1`, [user_id]
        );
        const streak = parseInt(streakRow.rows[0]?.current_streak) || 0;

        let status = "catch_up";
        const score = Math.min(100, Math.round(accuracy * 0.4 + streak * 3 + papers * 10));
        if (score >= 85) status = "star";
        else if (score >= 60) status = "locked_in";
        else if (score >= 30) status = "building";

        await pool.query(
          `INSERT INTO prep_scores (user_id, score, status, streak, accuracy, questions_answered, papers_completed)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [user_id, score, status, streak, accuracy, total, papers]
        );
      } catch {}
    }

    console.log(`[Gamification] Daily aggregation complete. Inactive alerts: ${inactiveUsers.length}, Users processed: ${activeUsers.length}`);
  } catch (err: any) {
    console.error("[Gamification] Daily aggregation error:", err.message);
  }
}

// Schedule nightly at 02:00 SA time (UTC+2)
export function scheduleDailyAggregation(): void {
  const runAt2AM = () => {
    const now = new Date();
    const target = new Date();
    target.setUTCHours(0, 0, 0, 0); // 02:00 SAST = 00:00 UTC
    if (target.getTime() <= now.getTime()) {
      target.setUTCDate(target.getUTCDate() + 1);
    }
    const msUntil = target.getTime() - now.getTime();
    setTimeout(async () => {
      await runDailyAggregation();
      setInterval(runDailyAggregation, 24 * 60 * 60 * 1000);
    }, msUntil);
    console.log(`[Gamification] Daily aggregation scheduled in ${Math.round(msUntil / 60000)} minutes.`);
  };
  runAt2AM();
}
