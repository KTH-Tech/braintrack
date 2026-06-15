// Exam Countdown Reminder Engine — T148
// Sends push notifications (and logs email-intent) to learners as milestones approach.
// Default milestones: 30 days, 14 days, 7 days before a learner's first upcoming exam paper.
// A dedup table prevents double-sending. An admin campaign toggle gates the whole flow.
// Settings hierarchy: school-specific settings override global; global acts as the default.

import { db } from "./db";
import {
  examCountdownReminders,
  reminderCampaignSettings,
  learnerExamSchedule,
  pushSubscriptions,
  users,
  type ReminderCampaignSettings,
} from "@shared/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import webpush from "web-push";

// ============================================
// CAMPAIGN SETTINGS HELPERS
// ============================================

const DEFAULT_MILESTONES = [30, 14, 7];

export async function getOrCreateCampaignSettings(cohortKey: string): Promise<ReminderCampaignSettings> {
  const [existing] = await db
    .select()
    .from(reminderCampaignSettings)
    .where(eq(reminderCampaignSettings.cohortKey, cohortKey));

  if (existing) return existing;

  const [created] = await db
    .insert(reminderCampaignSettings)
    .values({ cohortKey, enabled: true, milestones: DEFAULT_MILESTONES })
    .returning();

  return created;
}

export async function listCampaignSettings(): Promise<ReminderCampaignSettings[]> {
  const rows = await db.select().from(reminderCampaignSettings);
  if (rows.length === 0) {
    const global = await getOrCreateCampaignSettings("global");
    return [global];
  }
  return rows;
}

export async function updateCampaignSettings(
  cohortKey: string,
  patch: { enabled?: boolean; milestones?: number[] },
  updatedBy: string
): Promise<ReminderCampaignSettings> {
  await getOrCreateCampaignSettings(cohortKey);

  const [updated] = await db
    .update(reminderCampaignSettings)
    .set({
      ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}),
      ...(patch.milestones !== undefined ? { milestones: patch.milestones } : {}),
      updatedAt: new Date(),
      updatedBy,
    })
    .where(eq(reminderCampaignSettings.cohortKey, cohortKey))
    .returning();

  return updated;
}

// ============================================
// REMINDER DISPATCH
// ============================================

export interface ReminderRunResult {
  learnersScanned: number;
  notificationsSent: number;
  notificationsSkipped: number;
  errors: string[];
}

/**
 * Derive the cohort key for a learner.
 * Learners affiliated with a school get a school-specific key first;
 * the dispatch logic then falls back to "global" if no school-specific
 * row exists or if the school row defers to global.
 */
function cohortKeyForUser(schoolId: number | null | undefined): string {
  if (schoolId != null) return `school:${schoolId}`;
  return "global";
}

/**
 * Resolve effective campaign settings for a user.
 * Priority: school-specific row (if exists and explicitly set) → global fallback.
 * A school-specific row that is missing falls back to global — it is NOT
 * auto-created during dispatch to avoid polluting the settings table.
 */
async function resolveEffectiveSettings(
  schoolId: number | null | undefined,
  globalSettings: ReminderCampaignSettings,
  settingsCache: Map<string, ReminderCampaignSettings | null>
): Promise<ReminderCampaignSettings> {
  if (schoolId == null) return globalSettings;

  const cohortKey = `school:${schoolId}`;

  if (settingsCache.has(cohortKey)) {
    const cached = settingsCache.get(cohortKey);
    return cached ?? globalSettings;
  }

  const [schoolRow] = await db
    .select()
    .from(reminderCampaignSettings)
    .where(eq(reminderCampaignSettings.cohortKey, cohortKey));

  settingsCache.set(cohortKey, schoolRow ?? null);
  return schoolRow ?? globalSettings;
}

/**
 * Core dispatch function.
 * Call this on a schedule (e.g. daily cron) or manually via the admin route.
 *
 * @param schoolIdFilter - if provided, only process learners belonging to this school.
 */
export async function processExamReminders(schoolIdFilter?: number): Promise<ReminderRunResult> {
  const result: ReminderRunResult = {
    learnersScanned: 0,
    notificationsSent: 0,
    notificationsSkipped: 0,
    errors: [],
  };

  try {
    const globalSettings = await getOrCreateCampaignSettings("global");
    const settingsCache = new Map<string, ReminderCampaignSettings | null>();

    // Fetch all upcoming learner exam schedule rows
    const upcoming = await db
      .select()
      .from(learnerExamSchedule)
      .where(eq(learnerExamSchedule.isPast, false));

    // Group by userId → pick earliest exam
    const userEarliestExam = new Map<string, typeof upcoming[0]>();
    for (const row of upcoming) {
      const current = userEarliestExam.get(row.userId);
      if (!current || row.daysRemaining < current.daysRemaining) {
        userEarliestExam.set(row.userId, row);
      }
    }

    const userIds = [...userEarliestExam.keys()];
    if (userIds.length === 0) return result;

    // Fetch user records (for email + schoolId lookup)
    const userRows = await db
      .select({ id: users.id, email: users.email, schoolId: users.schoolId, firstName: users.firstName })
      .from(users)
      .where(inArray(users.id, userIds));

    const userMap = new Map(userRows.map(u => [u.id, u]));

    // Fetch all push subscriptions for these users
    const pushSubs = await db
      .select()
      .from(pushSubscriptions)
      .where(and(inArray(pushSubscriptions.userId, userIds), eq(pushSubscriptions.enabled, true)));

    const pushSubMap = new Map<string, typeof pushSubs[0][]>();
    for (const sub of pushSubs) {
      if (!pushSubMap.has(sub.userId)) pushSubMap.set(sub.userId, []);
      pushSubMap.get(sub.userId)!.push(sub);
    }

    result.learnersScanned = userIds.length;

    for (const userId of userIds) {
      const examRow = userEarliestExam.get(userId)!;
      const user = userMap.get(userId);
      if (!user) continue;

      // Filter by school if requested
      if (schoolIdFilter !== undefined && user.schoolId !== schoolIdFilter) continue;

      // Resolve effective settings: school-specific row overrides global
      const settings = await resolveEffectiveSettings(user.schoolId, globalSettings, settingsCache);

      if (!settings.enabled) {
        result.notificationsSkipped++;
        continue;
      }

      const milestones: number[] = Array.isArray(settings.milestones)
        ? (settings.milestones as number[])
        : DEFAULT_MILESTONES;

      // Check each milestone
      for (const milestone of milestones) {
        const daysWindow = examRow.daysRemaining;
        // Fire if the learner is within [milestone-1, milestone] days of their exam
        if (daysWindow > milestone || daysWindow < milestone - 1) continue;

        // Determine channel — push if subscription exists, otherwise email-intent
        const subs = pushSubMap.get(userId) ?? [];
        const channel = subs.length > 0 ? "push" : "email";

        // Check dedup — skip if already sent on this channel
        const [alreadySent] = await db
          .select({ id: examCountdownReminders.id })
          .from(examCountdownReminders)
          .where(
            and(
              eq(examCountdownReminders.userId, userId),
              eq(examCountdownReminders.subjectName, examRow.subjectName),
              eq(examCountdownReminders.examDate, examRow.examDate),
              eq(examCountdownReminders.paperNumber, examRow.paperNumber),
              eq(examCountdownReminders.milestoneDay, milestone),
              eq(examCountdownReminders.channel, channel)
            )
          )
          .limit(1);

        if (alreadySent) {
          result.notificationsSkipped++;
          continue;
        }

        // Build notification payload
        const firstName = user.firstName ?? "Learner";
        const days = examRow.daysRemaining;
        const subject = examRow.subjectName;
        const paper = examRow.paperNumber > 1 ? ` P${examRow.paperNumber}` : "";
        const title = `⏰ ${days} days until ${subject}${paper}`;
        const body = `${firstName}, your ${subject}${paper} exam is in ${days} days. Open BrainTrack to stay on track.`;

        const payload = JSON.stringify({
          title,
          body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: `exam-countdown-${userId}-${examRow.subjectName}-${milestone}`,
          data: { url: "/dashboard", type: "exam_countdown", milestoneDay: milestone },
        });

        let channelSent = false;

        if (channel === "push" && subs.length > 0) {
          for (const sub of subs) {
            try {
              await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                payload
              );
              channelSent = true;
            } catch (pushErr: any) {
              result.errors.push(`Push failed for ${userId}: ${pushErr.message}`);
            }
          }
        } else {
          // No push subscription — log email intent for future email service integration
          console.log(
            `[Reminder] Email-intent for ${userId} (${subject}${paper}, ${days}d, milestone=${milestone}d). ` +
            `Connect an email provider to deliver this reminder.`
          );
          channelSent = true;
        }

        // Log the reminder for dedup + audit purposes
        try {
          await db.insert(examCountdownReminders).values({
            userId,
            subjectName: examRow.subjectName,
            examDate: examRow.examDate,
            paperNumber: examRow.paperNumber,
            milestoneDay: milestone,
            channel,
          });

          if (channelSent) result.notificationsSent++;
        } catch (dupErr: any) {
          // Unique constraint violation = race condition / already sent; safe to ignore
          if (!dupErr.message?.includes("duplicate") && !dupErr.message?.includes("unique")) {
            result.errors.push(`Dedup insert failed for ${userId}: ${dupErr.message}`);
          } else {
            result.notificationsSkipped++;
          }
        }
      }
    }
  } catch (err: any) {
    result.errors.push(`Fatal error: ${err.message}`);
    console.error("[ExamReminder] processExamReminders error:", err);
  }

  return result;
}

// ============================================
// CUSTOM (AD-HOC) REMINDER DISPATCH
// ============================================

export interface CustomReminderInput {
  title: string;
  body: string;
  target: "all" | "school" | "user";
  schoolId?: number;
  userId?: string;
  url?: string;
}

export interface CustomReminderResult {
  recipientsTargeted: number;
  pushSent: number;
  pushFailed: number;
  emailIntentLogged: number;
  errors: string[];
}

export async function sendCustomReminder(input: CustomReminderInput): Promise<CustomReminderResult> {
  const result: CustomReminderResult = {
    recipientsTargeted: 0,
    pushSent: 0,
    pushFailed: 0,
    emailIntentLogged: 0,
    errors: [],
  };

  if (!input.title?.trim() || !input.body?.trim()) {
    result.errors.push("Title and body are required");
    return result;
  }

  let userRows: { id: string; email: string | null; schoolId: number | null; firstName: string | null }[] = [];

  if (input.target === "user") {
    if (!input.userId) {
      result.errors.push("userId is required when target=user");
      return result;
    }
    userRows = await db
      .select({ id: users.id, email: users.email, schoolId: users.schoolId, firstName: users.firstName })
      .from(users)
      .where(eq(users.id, input.userId));
  } else if (input.target === "school") {
    if (input.schoolId == null) {
      result.errors.push("schoolId is required when target=school");
      return result;
    }
    userRows = await db
      .select({ id: users.id, email: users.email, schoolId: users.schoolId, firstName: users.firstName })
      .from(users)
      .where(and(eq(users.schoolId, input.schoolId), eq(users.role, "student")));
  } else {
    userRows = await db
      .select({ id: users.id, email: users.email, schoolId: users.schoolId, firstName: users.firstName })
      .from(users)
      .where(eq(users.role, "student"));
  }

  result.recipientsTargeted = userRows.length;
  if (userRows.length === 0) return result;

  const userIds = userRows.map(u => u.id);
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(and(inArray(pushSubscriptions.userId, userIds), eq(pushSubscriptions.enabled, true)));

  const subsByUser = new Map<string, typeof subs>();
  for (const s of subs) {
    if (!subsByUser.has(s.userId)) subsByUser.set(s.userId, [] as any);
    subsByUser.get(s.userId)!.push(s);
  }

  const url = input.url ?? "/dashboard";

  for (const user of userRows) {
    const userSubs = subsByUser.get(user.id) ?? [];
    const payload = JSON.stringify({
      title: input.title,
      body: input.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: `custom-reminder-${user.id}-${Date.now()}`,
      data: { url, type: "custom_reminder" },
    });

    if (userSubs.length === 0) {
      console.log(`[Reminder] Email-intent (custom) for ${user.id} — title="${input.title}"`);
      result.emailIntentLogged++;
      continue;
    }

    for (const sub of userSubs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        result.pushSent++;
      } catch (err: any) {
        result.pushFailed++;
        result.errors.push(`Push failed for ${user.id}: ${err.message ?? String(err)}`);
      }
    }
  }

  return result;
}

// ============================================
// REMINDER LOG QUERY
// ============================================

export async function getRecentReminderLog(limit = 100) {
  return db
    .select()
    .from(examCountdownReminders)
    .orderBy(desc(examCountdownReminders.sentAt))
    .limit(limit);
}
