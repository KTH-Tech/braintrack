// Daily Focus Push — Task #358
// Sends a single morning push notification per active learner with today's
// "What to study right now" directive (subject, days remaining, deep link).
// Parents linked to that learner who have an active push subscription receive
// a parallel digest. Existing push opt-in rules are honoured: only enabled
// push_subscriptions rows are dispatched to, and a SAST quiet-hours window
// (06:00–22:00 inclusive of 06:00, exclusive of 22:00) gates the run.
//
// Task #381: Each dispatch attempt is written to daily_focus_push_log.
// Already-logged (user_id, sent_date, channel) pairs are skipped so a
// duplicate cron fire cannot double-notify a learner.

import { db } from "./db";
import { pushSubscriptions, parentLinks, dailyFocusPushLog } from "@shared/schema";
import { users } from "@shared/models/auth";
import { and, eq, inArray, sql } from "drizzle-orm";
import webpush from "web-push";
import { getDailyDirective, type DailyDirective } from "./nsc-timetable";

export interface DailyFocusRunResult {
  learnersScanned: number;
  learnersWithPush: number;
  learnerPushSent: number;
  learnerPushFailed: number;
  learnerPushSkipped: number;
  parentPushSent: number;
  parentPushFailed: number;
  parentPushSkipped: number;
  skippedQuietHours: boolean;
  errors: string[];
}

const QUIET_HOURS_START_SAST = 6;  // inclusive
const QUIET_HOURS_END_SAST = 22;   // exclusive
const SAST_OFFSET_HOURS = 2;       // SAST = UTC+2 (no DST)

export function isWithinSastSendWindow(now: Date = new Date()): boolean {
  const sastHour = (now.getUTCHours() + SAST_OFFSET_HOURS) % 24;
  return sastHour >= QUIET_HOURS_START_SAST && sastHour < QUIET_HOURS_END_SAST;
}

/** Returns today's date string in YYYY-MM-DD (SAST wall-clock date). */
function todaySastDate(now: Date = new Date()): string {
  // Shift UTC to SAST (+2h) then take the date portion.
  const sast = new Date(now.getTime() + SAST_OFFSET_HOURS * 60 * 60 * 1000);
  return sast.toISOString().slice(0, 10);
}

function buildLearnerPayload(
  firstName: string | null,
  directive: DailyDirective,
  langAf: boolean,
): string {
  const name = firstName?.trim() || (langAf ? "Leerder" : "Learner");

  let title: string;
  if (directive.isExamToday) {
    title = langAf ? "Eksamen vandag! 🎯" : "Exam today! 🎯";
  } else if (directive.hasExam && directive.daysUntil != null) {
    const d = directive.daysUntil;
    if (langAf) {
      title = `${d} ${d === 1 ? "dag" : "dae"} oor — Vandag se fokus`;
    } else {
      title = `${d} ${d === 1 ? "day" : "days"} to go — Today's focus`;
    }
  } else {
    title = langAf ? "Vandag se fokus 🧠" : "Today's focus 🧠";
  }

  const message = langAf ? directive.messageAf : directive.message;
  const body = `${name}, ${message}`;

  return JSON.stringify({
    title,
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `daily-focus-${new Date().toISOString().slice(0, 10)}`,
    data: {
      url: directive.deepLink || "/dashboard?focus=today",
      type: "daily_focus",
      subjectId: directive.subjectId,
      daysUntil: directive.daysUntil,
      urgencyState: directive.urgencyState,
    },
  });
}

function buildParentPayload(
  learnerName: string,
  directive: DailyDirective,
  langAf: boolean,
): string {
  let title: string;
  if (directive.isExamToday) {
    title = langAf
      ? `${learnerName} skryf vandag eksamen 🎯`
      : `${learnerName} writes an exam today 🎯`;
  } else if (directive.hasExam && directive.daysUntil != null) {
    const d = directive.daysUntil;
    if (langAf) {
      title = `${learnerName} se fokus — ${d} ${d === 1 ? "dag" : "dae"} oor`;
    } else {
      title = `${learnerName}'s focus — ${d} ${d === 1 ? "day" : "days"} to go`;
    }
  } else {
    title = langAf ? `${learnerName} se daaglikse fokus` : `${learnerName}'s daily focus`;
  }

  const subj = langAf ? directive.subjectNameAf : directive.subjectName;
  let body: string;
  if (directive.hasExam) {
    body = langAf
      ? `Vandag se prioriteit: ${subj}${directive.weakTopic ? ` — "${directive.weakTopic.nameAfrikaans || directive.weakTopic.name}"` : ""}.`
      : `Today's priority: ${subj}${directive.weakTopic ? ` — "${directive.weakTopic.name}"` : ""}.`;
  } else {
    body = langAf
      ? "Hou aan om meesterskap op te bou."
      : "Keep building mastery today.";
  }

  return JSON.stringify({
    title,
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `daily-focus-parent-${new Date().toISOString().slice(0, 10)}`,
    data: {
      url: "/parent",
      type: "daily_focus_parent",
      subjectId: directive.subjectId,
      daysUntil: directive.daysUntil,
    },
  });
}

/**
 * Atomically claim a send slot for this (userId, sentDate, channel) triple.
 *
 * Uses INSERT … ON CONFLICT DO NOTHING so only one concurrent process can
 * hold the claim — the one whose INSERT returns a row id. Any second
 * concurrent process (duplicate cron fire in the same window) gets no rows
 * back and must skip this recipient.
 *
 * **Retry policy**: A claimed row (success=false or success=true) blocks
 * re-dispatch for the remainder of the SAST calendar day. This is intentional
 * — it prevents accidental over-notification on same-day retries. An admin
 * can force a retry for a specific recipient by deleting their row from
 * `daily_focus_push_log` before re-triggering the cron.
 *
 * **Parent multi-learner policy**: The unique key is on (user_id, sent_date,
 * channel='parent'), so a parent linked to multiple learners receives at most
 * one push per day (for the first learner processed). This avoids notification
 * fatigue. If per-learner parent pushes are needed, the schema should be
 * extended to include a `for_learner_user_id` column in the unique key.
 *
 * Returns true if this caller is the winner (should proceed to send).
 */
async function claimSendSlot(
  userId: string,
  sentDate: string,
  channel: "learner" | "parent",
  payloadTag: string | null,
): Promise<boolean> {
  const result = await db.execute(sql`
    INSERT INTO daily_focus_push_log (user_id, sent_date, channel, payload_tag, success, error)
    VALUES (${userId}, ${sentDate}, ${channel}, ${payloadTag}, false, null)
    ON CONFLICT (user_id, sent_date, channel) DO NOTHING
    RETURNING id
  `);
  return (result.rows?.length ?? 0) > 0;
}

/**
 * Update the outcome of an already-claimed row after the send attempt.
 */
async function updateLogOutcome(
  userId: string,
  sentDate: string,
  channel: "learner" | "parent",
  success: boolean,
  error: string | null,
): Promise<void> {
  await db
    .update(dailyFocusPushLog)
    .set({ success, error })
    .where(
      and(
        eq(dailyFocusPushLog.userId, userId),
        eq(dailyFocusPushLog.sentDate, sentDate),
        eq(dailyFocusPushLog.channel, channel),
      ),
    );
}

/**
 * Dispatch the daily focus push to every active learner with a push subscription,
 * and to every parent (linked via parent_links + active push subscription) of
 * that learner. Returns counters describing the run.
 */
export async function sendDailyFocusNotifications(
  options: { ignoreQuietHours?: boolean } = {},
): Promise<DailyFocusRunResult> {
  const result: DailyFocusRunResult = {
    learnersScanned: 0,
    learnersWithPush: 0,
    learnerPushSent: 0,
    learnerPushFailed: 0,
    learnerPushSkipped: 0,
    parentPushSent: 0,
    parentPushFailed: 0,
    parentPushSkipped: 0,
    skippedQuietHours: false,
    errors: [],
  };

  if (!options.ignoreQuietHours && !isWithinSastSendWindow()) {
    result.skippedQuietHours = true;
    return result;
  }

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    result.errors.push("VAPID keys not configured — push disabled");
    return result;
  }

  const sentDate = todaySastDate();

  // 1. Pull every learner who has at least one active push subscription.
  const learnerSubsRows = await db
    .select({
      userId: pushSubscriptions.userId,
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
      role: users.role,
      firstName: users.firstName,
      preferredLanguage: users.preferredLanguage,
    })
    .from(pushSubscriptions)
    .innerJoin(users, eq(users.id, pushSubscriptions.userId))
    .where(and(eq(pushSubscriptions.enabled, true), eq(users.role, "learner")));

  // Group subscriptions by learner.
  const learnerMap = new Map<
    string,
    {
      firstName: string | null;
      preferredLanguage: string | null;
      subs: { endpoint: string; p256dh: string; auth: string }[];
    }
  >();
  for (const row of learnerSubsRows) {
    const entry = learnerMap.get(row.userId) ?? {
      firstName: row.firstName ?? null,
      preferredLanguage: row.preferredLanguage ?? null,
      subs: [],
    };
    entry.subs.push({ endpoint: row.endpoint, p256dh: row.p256dh, auth: row.auth });
    learnerMap.set(row.userId, entry);
  }

  result.learnersScanned = learnerMap.size;
  result.learnersWithPush = learnerMap.size;

  if (learnerMap.size === 0) return result;

  const learnerIds = [...learnerMap.keys()];

  // 2. Pull all activated parent_links pointing at any of these learners.
  const parentLinkRows = await db
    .select({
      learnerUserId: parentLinks.learnerUserId,
      parentUserId: parentLinks.parentUserId,
      learnerName: parentLinks.learnerName,
    })
    .from(parentLinks)
    .where(
      and(
        eq(parentLinks.status, "activated"),
        inArray(parentLinks.learnerUserId, learnerIds),
      ),
    );

  // learnerId → array of { parentUserId, learnerName }
  const linksByLearner = new Map<string, { parentUserId: string; learnerName: string }[]>();
  const parentIds = new Set<string>();
  for (const row of parentLinkRows) {
    if (!row.learnerUserId) continue;
    parentIds.add(row.parentUserId);
    const list = linksByLearner.get(row.learnerUserId) ?? [];
    list.push({ parentUserId: row.parentUserId, learnerName: row.learnerName });
    linksByLearner.set(row.learnerUserId, list);
  }

  // 3. Pull active push subs + language for those parents.
  const parentSubsByUser = new Map<
    string,
    {
      preferredLanguage: string | null;
      subs: { endpoint: string; p256dh: string; auth: string }[];
    }
  >();
  if (parentIds.size > 0) {
    const parentRows = await db
      .select({
        userId: pushSubscriptions.userId,
        endpoint: pushSubscriptions.endpoint,
        p256dh: pushSubscriptions.p256dh,
        auth: pushSubscriptions.auth,
        preferredLanguage: users.preferredLanguage,
      })
      .from(pushSubscriptions)
      .innerJoin(users, eq(users.id, pushSubscriptions.userId))
      .where(
        and(
          eq(pushSubscriptions.enabled, true),
          inArray(pushSubscriptions.userId, [...parentIds]),
        ),
      );
    for (const row of parentRows) {
      const entry = parentSubsByUser.get(row.userId) ?? {
        preferredLanguage: row.preferredLanguage ?? null,
        subs: [],
      };
      entry.subs.push({ endpoint: row.endpoint, p256dh: row.p256dh, auth: row.auth });
      parentSubsByUser.set(row.userId, entry);
    }
  }

  // 4. Per learner: compute directive, claim log slot, send to learner, then parents.
  for (const [learnerId, learner] of learnerMap.entries()) {
    let directive: DailyDirective;
    try {
      directive = await getDailyDirective(learnerId);
    } catch (err: any) {
      result.errors.push(`getDailyDirective(${learnerId}): ${err?.message ?? String(err)}`);
      continue;
    }

    const learnerLangAf = (learner.preferredLanguage || "").toLowerCase().startsWith("af");
    const learnerPayload = buildLearnerPayload(learner.firstName, directive, learnerLangAf);
    const payloadTag = `daily-focus-${sentDate}`;

    // Atomically claim the send slot. The INSERT … ON CONFLICT DO NOTHING is
    // the sole race arbitrator: only the process whose INSERT returns a row id
    // proceeds to send. Any concurrent duplicate cron fire, or any same-day
    // re-run, hits the conflict and is counted as skipped.
    if (!await claimSendSlot(learnerId, sentDate, "learner", payloadTag)) {
      result.learnerPushSkipped++;
    } else {
      let learnerSuccess = false;
      let learnerError: string | null = null;
      for (const sub of learner.subs) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            learnerPayload,
          );
          learnerSuccess = true;
          result.learnerPushSent++;
        } catch (err: any) {
          result.learnerPushFailed++;
          learnerError = err?.message ?? String(err);
          result.errors.push(`learner ${learnerId} push: ${learnerError}`);
        }
      }
      await updateLogOutcome(learnerId, sentDate, "learner", learnerSuccess, learnerError);
    }

    const links = linksByLearner.get(learnerId) ?? [];
    for (const link of links) {
      const parentEntry = parentSubsByUser.get(link.parentUserId);
      if (!parentEntry) continue; // parent has not opted in

      const parentLangAf = (parentEntry.preferredLanguage || "").toLowerCase().startsWith("af");
      const learnerName = link.learnerName?.trim() || learner.firstName || (parentLangAf ? "jou kind" : "your child");
      const parentPayload = buildParentPayload(learnerName, directive, parentLangAf);
      const parentPayloadTag = `daily-focus-parent-${sentDate}`;

      if (!await claimSendSlot(link.parentUserId, sentDate, "parent", parentPayloadTag)) {
        result.parentPushSkipped++;
        continue;
      }

      let parentSuccess = false;
      let parentError: string | null = null;
      for (const sub of parentEntry.subs) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            parentPayload,
          );
          parentSuccess = true;
          result.parentPushSent++;
        } catch (err: any) {
          result.parentPushFailed++;
          parentError = err?.message ?? String(err);
          result.errors.push(`parent ${link.parentUserId} push: ${parentError}`);
        }
      }
      await updateLogOutcome(link.parentUserId, sentDate, "parent", parentSuccess, parentError);
    }
  }

  return result;
}
