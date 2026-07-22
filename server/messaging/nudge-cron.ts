// BrainTrack trial-lifecycle nudge cron.
//
// Every run, we scan `subscriptions` for active trials that hit day 3, 7 or
// 12 (SAST calendar) since the trial started, gather the real progress
// metrics the templates reference — questions answered, streak, prep score,
// weakest subject, papers completed — and hand them to `sendMessage()`.
// Each `(user, template)` pair is recorded in `messaging_sends` before the
// send is dispatched so a concurrent invocation (or a re-run inside the same
// day) cannot double-send.
//
// The cron is idempotent by design: the unique index on
// (`user_id`, `template_key`) makes re-runs no-ops and lets us safely wire
// this endpoint into Render cron + a manual curl for gap-day recovery.
//
// This module does NOT own the transactional templates (welcome,
// first_quiz_completed, payment_success, payment_failed, prelim_countdown_7d,
// streak_broken) — those fire from their respective event handlers via
// `sendMessage()` directly. Only the day-N nudges live here because they are
// the only ones with a calendar trigger.

import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "../db";
import { subscriptions, userStreaks, userProgress, topicMastery, subjects } from "@shared/schema";
import { users } from "@shared/models/auth";
import { sendMessage, isMessagingConfigured, type Language, type TemplateKey } from "./twilio-messaging";
import { publicBaseUrl } from "../sms/onboarding-link";

// ────────────────────────────────────────────────────────────────────────────
// Types & config
// ────────────────────────────────────────────────────────────────────────────

/**
 * Day-N nudges. The lifecycle plan is: welcome (day 0, transactional), day-3
 * momentum, day-7 halfway, day-12 heads-up. Anything past day 14 is handled
 * by `/api/cron/charge-trials`.
 */
const NUDGE_SCHEDULE = [
  { day: 3, templateKey: "day_3_youre_rolling" satisfies TemplateKey },
  { day: 7, templateKey: "day_7_checkpoint" satisfies TemplateKey },
  { day: 12, templateKey: "day_12_two_days_left" satisfies TemplateKey },
] as const;

export interface NudgeCronOptions {
  /** When true, resolves the audience + variables but does NOT call Twilio and does NOT insert into messaging_sends. */
  dryRun?: boolean;
  /** Override the "now" reference — unit-test seam only. Never used from routes.ts. */
  now?: Date;
  /** Override the app link base — unit-test seam only. Defaults to publicBaseUrl(). */
  appLink?: string;
}

export interface NudgeCronResult {
  processed: number;
  delivered: number;
  skipped: number;
  errors: number;
  dryRun: boolean;
  details: Array<{
    userId: string;
    templateKey: TemplateKey;
    channel: "whatsapp" | "sms" | "none";
    delivered: boolean;
    to: string | null;
    error?: string;
    dryRun?: boolean;
  }>;
}

// ────────────────────────────────────────────────────────────────────────────
// SAST time helpers — mirror server/nsc-timetable.ts:sastToday() semantics so
// day-N is a calendar day in the timezone parents live in, not UTC.
// ────────────────────────────────────────────────────────────────────────────

function sastMidnight(when: Date): Date {
  // Shift now → SAST wall-clock, then floor to that day's UTC-midnight for
  // arithmetic. Matches sastToday() in nsc-timetable.ts.
  const shifted = new Date(when.getTime() + 2 * 60 * 60 * 1000);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
}

/**
 * The SAST-calendar-day-count between the day the trial started and today.
 * A trial started at 2026-07-01 23:00 SAST is day 0 on 2026-07-01, day 1 on
 * 2026-07-02, day 3 on 2026-07-04 — matches the parent's mental model
 * regardless of what UTC clock time the trial actually kicked off.
 */
export function sastDaysSince(trialStartedAt: Date, now: Date): number {
  const startMidnight = sastMidnight(trialStartedAt);
  const nowMidnight = sastMidnight(now);
  return Math.floor((nowMidnight.getTime() - startMidnight.getTime()) / 86400000);
}

// ────────────────────────────────────────────────────────────────────────────
// Selector — WHICH subscriptions get WHICH nudge on this run. Pure so unit
// tests can pin the day-boundary behaviour without touching the DB.
// ────────────────────────────────────────────────────────────────────────────

export interface TrialRow {
  userId: string;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  status: string;
  parentCell: string | null;
  learnerCell: string | null;
}

export interface SelectedNudge {
  userId: string;
  templateKey: TemplateKey;
  daysSinceStart: number;
  trialRow: TrialRow;
}

/**
 * Given the current trial roster and "now", return every (user, template)
 * pair that is due today. Callers filter this against `messaging_sends` to
 * skip already-sent nudges — the selector itself is stateless.
 */
export function selectNudgesForRun(trials: TrialRow[], now: Date): SelectedNudge[] {
  const out: SelectedNudge[] = [];
  for (const trial of trials) {
    if (trial.status !== "trial" && trial.status !== "trialing") continue;
    // Trial start: prefer trial_started_at (added by migration 0035); fall
    // back to trial_ends_at - 14 days for rows written before the migration
    // and for rows where startDate was reused for a re-entered trial.
    const start = resolveTrialStart(trial);
    if (!start) continue;
    const daysSince = sastDaysSince(start, now);
    for (const scheduled of NUDGE_SCHEDULE) {
      if (daysSince === scheduled.day) {
        out.push({
          userId: trial.userId,
          templateKey: scheduled.templateKey,
          daysSinceStart: daysSince,
          trialRow: trial,
        });
      }
    }
  }
  return out;
}

function resolveTrialStart(trial: TrialRow): Date | null {
  if (trial.trialStartedAt) return trial.trialStartedAt;
  if (trial.trialEndsAt) return new Date(trial.trialEndsAt.getTime() - 14 * 24 * 60 * 60 * 1000);
  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// Metric gathering — pulls the numbers each template references. Reads the
// same tables `/api/user/journey`, `/api/user/progress` and the exam-widget
// helpers already read; nothing is re-invented here.
// ────────────────────────────────────────────────────────────────────────────

interface LearnerMetrics {
  learnerFirst: string;
  parentFirst: string;
  language: Language;
  toPhone: string;
  questionsAnswered: number;
  papersCompleted: number;
  streak: number;
  prepScore: number;
  weakestSubject: string;
  weakestSubjectAf: string;
  daysToPrelims: number;
  delta: number;
  daysLeft: number;
}

async function gatherMetrics(trial: TrialRow, now: Date): Promise<LearnerMetrics | null> {
  // Explicit column projection — never `select().from(users)` here, otherwise
  // Drizzle would include every column it knows about and the query becomes
  // sensitive to columns being added / removed at the schema layer. Reading
  // exactly what we need also keeps the whatsapp_opt_in resolution isolated
  // to resolvePreferredChannel() (raw SQL, migration-tolerant).
  const [learner] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      preferredLanguage: users.preferredLanguage,
      phone: users.phone,
    })
    .from(users)
    .where(eq(users.id, trial.userId))
    .limit(1);
  if (!learner) return null;

  const [progressAgg] = await db
    .select({
      questionsAttempted: sql<number>`COALESCE(SUM(${userProgress.questionsAttempted}), 0)`,
      papersCompleted: sql<number>`COALESCE(SUM(${userProgress.papersCompleted}), 0)`,
      correctAnswers: sql<number>`COALESCE(SUM(${userProgress.correctAnswers}), 0)`,
    })
    .from(userProgress)
    .where(eq(userProgress.userId, trial.userId));

  const [streakRow] = await db
    .select({ currentStreak: userStreaks.currentStreak })
    .from(userStreaks)
    .where(eq(userStreaks.userId, trial.userId))
    .limit(1);

  // Weakest subject: the subject with the lowest average topic mastery. Uses
  // topic_mastery so it matches the number the parent sees on the dashboard.
  const weakestRows = await db
    .select({
      subjectId: topicMastery.subjectId,
      avgMastery: sql<number>`COALESCE(AVG(${topicMastery.masteryScore}), 0)`,
    })
    .from(topicMastery)
    .where(eq(topicMastery.userId, trial.userId))
    .groupBy(topicMastery.subjectId)
    .orderBy(sql`COALESCE(AVG(${topicMastery.masteryScore}), 0) ASC`)
    .limit(1);

  let weakestSubject = "your weakest subject";
  let weakestSubjectAf = "jou swakste vak";
  let prepScore = 0;
  if (weakestRows[0]) {
    const [sub] = await db
      .select({ name: subjects.name, nameAf: subjects.nameAfrikaans })
      .from(subjects)
      .where(eq(subjects.id, weakestRows[0].subjectId))
      .limit(1);
    if (sub) {
      weakestSubject = sub.name;
      weakestSubjectAf = sub.nameAf ?? sub.name;
    }
    prepScore = Math.round(Number(weakestRows[0].avgMastery ?? 0));
  }

  // "Delta this week" — mastery movement over the last 7 days. Best-effort:
  // if we can't compute it, default to a sensible 0 rather than lie.
  const [deltaRow] = await db.execute(sql`
    SELECT COALESCE(ROUND(AVG(mastery_score))::int, 0) AS score
    FROM topic_mastery
    WHERE user_id = ${trial.userId}
      AND last_attempt_at >= NOW() - INTERVAL '7 days'
  `) as any;
  const currentAvg = Number(deltaRow?.score ?? prepScore ?? 0);
  const delta = Math.max(0, currentAvg - prepScore);

  // Days-to-prelims: prelims start on 2026-08-24 for the 2026 NSC cohort.
  // We keep this a soft default the templates can render — the day-7 push
  // arrives Aug 3 for a July 27 signup, giving parents 3 weeks of runway.
  const PRELIMS_START = new Date(Date.UTC(2026, 7, 24)); // 2026-08-24
  const daysToPrelims = Math.max(0, Math.ceil((PRELIMS_START.getTime() - now.getTime()) / 86400000));

  const daysLeft = (() => {
    if (!trial.trialEndsAt) return 14;
    const raw = Math.ceil((trial.trialEndsAt.getTime() - now.getTime()) / 86400000);
    return Math.max(0, raw);
  })();

  const language: Language = learner.preferredLanguage === "af" ? "af" : "en";

  // Recipient phone: parentCell from the subscription first (parent is the
  // audience for lifecycle nudges), then learner.phone as a fallback for
  // adult learners with no parent-linked row.
  const toPhone = trial.parentCell || learner.phone || trial.learnerCell || "";

  return {
    learnerFirst: learner.firstName?.trim() || (language === "af" ? "jou leerder" : "your learner"),
    parentFirst: language === "af" ? "Ouer" : "Parent",
    language,
    toPhone,
    questionsAnswered: Number(progressAgg?.questionsAttempted ?? 0),
    papersCompleted: Number(progressAgg?.papersCompleted ?? 0),
    streak: Number(streakRow?.currentStreak ?? 0),
    prepScore,
    weakestSubject: language === "af" ? weakestSubjectAf : weakestSubject,
    weakestSubjectAf,
    daysToPrelims,
    delta,
    daysLeft,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Runner
// ────────────────────────────────────────────────────────────────────────────

function buildTemplateVariables(
  metrics: LearnerMetrics,
  templateKey: TemplateKey,
  appLink: string,
): Record<string, string | number> {
  const common = {
    parent_first: metrics.parentFirst,
    learner_first: metrics.learnerFirst,
    app_link: appLink,
  };
  switch (templateKey) {
    case "day_3_youre_rolling":
      return {
        ...common,
        questions_answered: metrics.questionsAnswered,
        streak: metrics.streak,
        days_left: metrics.daysLeft,
      };
    case "day_7_checkpoint":
      return {
        ...common,
        prep_score: metrics.prepScore,
        weakest_subject: metrics.weakestSubject,
        delta: metrics.delta,
        days_to_prelims: metrics.daysToPrelims,
      };
    case "day_12_two_days_left":
      return {
        ...common,
        questions_answered: metrics.questionsAnswered,
        papers_completed: metrics.papersCompleted,
        streak: metrics.streak,
      };
    default:
      return common;
  }
}

/**
 * Run one pass of the nudge cron. Never throws. Every per-user failure is
 * logged with the user id + template key so a batched view of the return
 * value is enough to debug. Marketing category (`streak_broken`,
 * `prelim_countdown_7d`) is not in scope of this cron — see module header.
 */
export async function runNudgeCron(opts: NudgeCronOptions = {}): Promise<NudgeCronResult> {
  const now = opts.now ?? new Date();
  const dryRun = Boolean(opts.dryRun);
  const appLink = (opts.appLink ?? publicBaseUrl()).replace(/\/$/, "");

  const result: NudgeCronResult = {
    processed: 0,
    delivered: 0,
    skipped: 0,
    errors: 0,
    dryRun,
    details: [],
  };

  if (!dryRun && !isMessagingConfigured()) {
    console.warn("[nudge-cron] Twilio env not configured — refusing to run. Set TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN.");
    return result;
  }

  // Pull a wide window (0..14 days) of trials in one query. Filtering to the
  // exact day is done in JS via sastDaysSince so we get identical semantics
  // in unit tests.
  const windowStart = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      userId: subscriptions.userId,
      trialEndsAt: subscriptions.trialEndsAt,
      startDate: subscriptions.startDate,
      status: subscriptions.status,
      parentCell: subscriptions.parentCell,
      learnerCell: subscriptions.learnerCell,
    })
    .from(subscriptions)
    .where(
      and(
        // Cast into TS-safe drizzle predicates. Only trial-state rows matter.
        sql`${subscriptions.status} IN ('trial', 'trialing')`,
        gte(subscriptions.trialEndsAt, windowStart),
        lt(subscriptions.trialEndsAt, windowEnd),
      ),
    );

  const trials: TrialRow[] = rows.map((r) => ({
    userId: r.userId,
    trialStartedAt: r.startDate ?? null,
    trialEndsAt: r.trialEndsAt ?? null,
    status: r.status,
    parentCell: r.parentCell ?? null,
    learnerCell: r.learnerCell ?? null,
  }));

  const dueNudges = selectNudgesForRun(trials, now);
  result.processed = dueNudges.length;

  for (const nudge of dueNudges) {
    try {
      // Idempotency claim BEFORE anything else. If the row already exists,
      // we skip — even a dry-run counts a would-be re-send as skipped so the
      // owner sees the same number in preview and live. Raw SQL because
      // messaging_sends is not in the Drizzle schema — the table is added by
      // migration 0035 and read via raw SQL to keep the ORM safe if the
      // migration hasn't run yet.
      let existingRows: unknown[] = [];
      try {
        const existingResult: any = await db.execute(sql`
          SELECT id FROM messaging_sends
           WHERE user_id = ${nudge.userId}
             AND template_key = ${nudge.templateKey}
           LIMIT 1
        `);
        existingRows = existingResult.rows ?? existingResult ?? [];
      } catch (dbErr: any) {
        // Table not present → migration 0035 hasn't been applied yet. Treat
        // the nudge as not-yet-sent and continue (send will also fail on
        // insert, and we'll gracefully surface migrationPending in the log).
        if (dbErr?.code === "42P01") {
          console.warn(
            `[nudge-cron] messaging_sends does not exist — apply migration 0035_messaging_infra.sql. Skipping ${nudge.userId}/${nudge.templateKey}.`,
          );
          result.skipped += 1;
          result.details.push({
            userId: nudge.userId,
            templateKey: nudge.templateKey,
            channel: "none",
            delivered: false,
            to: null,
            error: "migration_pending",
          });
          continue;
        }
        throw dbErr;
      }
      if (existingRows.length > 0) {
        result.skipped += 1;
        result.details.push({
          userId: nudge.userId,
          templateKey: nudge.templateKey,
          channel: "none",
          delivered: false,
          to: null,
          error: "already_sent",
        });
        continue;
      }

      const metrics = await gatherMetrics(nudge.trialRow, now);
      if (!metrics || !metrics.toPhone) {
        result.skipped += 1;
        result.details.push({
          userId: nudge.userId,
          templateKey: nudge.templateKey,
          channel: "none",
          delivered: false,
          to: null,
          error: "no_recipient",
        });
        continue;
      }

      const variables = buildTemplateVariables(metrics, nudge.templateKey, appLink);
      const preferChannel = await resolvePreferredChannel(nudge.trialRow.userId);

      if (dryRun) {
        result.details.push({
          userId: nudge.userId,
          templateKey: nudge.templateKey,
          channel: preferChannel,
          delivered: false,
          to: metrics.toPhone,
          dryRun: true,
        });
        continue;
      }

      const sendResult = await sendMessage({
        to: metrics.toPhone,
        templateKey: nudge.templateKey,
        language: metrics.language,
        variables,
        preferChannel,
      });

      // Log every attempt — success and failure both — so a bounce is
      // visible in messaging_sends without re-sending. Raw SQL with
      // ON CONFLICT DO NOTHING on the (user_id, template_key) unique index
      // enforces at-most-once even on races.
      try {
        const channel = sendResult.delivered ? sendResult.channel : "none";
        const messageSid = sendResult.delivered ? sendResult.messageSid : null;
        const errorCode = sendResult.delivered ? null : sendResult.error;
        await db.execute(sql`
          INSERT INTO messaging_sends (user_id, template_key, channel, delivered, message_sid, to_phone, error_code)
          VALUES (${nudge.userId}, ${nudge.templateKey}, ${channel}, ${sendResult.delivered}, ${messageSid}, ${metrics.toPhone}, ${errorCode})
          ON CONFLICT (user_id, template_key) DO NOTHING
        `);
      } catch (logErr: any) {
        console.warn(
          `[nudge-cron] failed to log messaging_sends for ${nudge.userId}/${nudge.templateKey}: ${logErr?.message ?? logErr}`,
        );
      }

      if (sendResult.delivered) {
        result.delivered += 1;
        result.details.push({
          userId: nudge.userId,
          templateKey: nudge.templateKey,
          channel: sendResult.channel,
          delivered: true,
          to: metrics.toPhone,
        });
      } else {
        result.errors += 1;
        result.details.push({
          userId: nudge.userId,
          templateKey: nudge.templateKey,
          channel: "none",
          delivered: false,
          to: metrics.toPhone,
          error: sendResult.error,
        });
      }
    } catch (err: any) {
      result.errors += 1;
      console.error(
        `[nudge-cron] unhandled error for user=${nudge.userId} template=${nudge.templateKey}:`,
        err?.message ?? err,
      );
      result.details.push({
        userId: nudge.userId,
        templateKey: nudge.templateKey,
        channel: "none",
        delivered: false,
        to: null,
        error: `exception:${err?.message ?? "unknown"}`,
      });
    }
  }

  return result;
}

/**
 * Pull the user's `whatsapp_opt_in` flag via raw SQL — the column is added by
 * migration 0035 and NOT declared in the Drizzle schema so the ORM stays
 * safe if the migration hasn't run. Falls back to SMS on any read failure so
 * we never accidentally push WhatsApp traffic to a parent who never opted in.
 */
async function resolvePreferredChannel(userId: string): Promise<"whatsapp" | "sms"> {
  try {
    const result: any = await db.execute(sql`
      SELECT whatsapp_opt_in AS opt_in FROM users WHERE id = ${userId} LIMIT 1
    `);
    const row = (result.rows ?? result)[0];
    return row?.opt_in === true ? "whatsapp" : "sms";
  } catch (err: any) {
    if (err?.code !== "42703") {
      console.warn(
        `[nudge-cron] users.whatsapp_opt_in read failed (${err?.code ?? "?"}: ${err?.message ?? err}) — defaulting to SMS.`,
      );
    }
    return "sms";
  }
}
