// Trial Reminder Push Notifications — Task #393
//
// Twice a day (06:30 SAST = 04:30 UTC, anchored by
// scripts/nightly-trial-reminders.sh) we look for learners whose 14-day
// free trial is ending in either 24h (Day 13 — heads-up) or today
// (Day 14 — final call). Each batch sends a Web Push notification to
// the learner (and any opted-in linked parents) and flips the
// `trial_reminder_d13_sent` / `trial_reminder_d14_sent` flag so we
// never double-send.
//
// The in-app banner is delivered via the existing route protection /
// /api/user/subscription-status pathway: any sub with status='trial'
// and trialEndsAt within 24h causes the client to render the
// `<TrialEndingBanner />` component. So this server-side job only
// owns the *push* dispatch.

import { db } from "./db";
import { pushSubscriptions, subscriptions } from "@shared/schema";
import { users } from "@shared/models/auth";
import { eq, and } from "drizzle-orm";
import webpush from "web-push";
import { storage } from "./storage";

export interface TrialReminderResult {
  d13Sent: number;
  d14Sent: number;
  failed: number;
  errors: string[];
  trialsLapsed: number;
  graceLapsed: number;
  disabled?: boolean;
}

export async function runTrialReminders(): Promise<TrialReminderResult> {
  return _runTrialRemindersOriginal();
}

function formatBody(slot: "d13" | "d14", langAf: boolean, firstName: string | null): string {
  const name = firstName?.trim() || (langAf ? "Leerder" : "Learner");
  if (slot === "d13") {
    return langAf
      ? `${name}, jou Brain Boost-proef eindig môre — kies vandag jou betaalmetode om sonder onderbreking aan te hou.`
      : `${name}, your Brain Boost trial ends tomorrow — pick a payment method today to keep going without a break.`;
  }
  return langAf
    ? `${name}, jou gratis proef eindig vandag. Aktiveer maandelikse betaling sodat jy nie toegang verloor nie.`
    : `${name}, your free trial ends today. Activate a monthly payment so you don't lose access.`;
}

function buildPayload(slot: "d13" | "d14", langAf: boolean, firstName: string | null): string {
  const title = slot === "d13"
    ? (langAf ? "1 dag oor in jou proef ⏳" : "1 day left in your trial ⏳")
    : (langAf ? "Proef eindig vandag — aktiveer asseblief" : "Trial ends today — please activate");
  return JSON.stringify({
    title,
    body: formatBody(slot, langAf, firstName),
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `trial-${slot}-${new Date().toISOString().slice(0, 10)}`,
    data: { url: "/subscribe?from=trial-reminder", type: `trial_reminder_${slot}` },
  });
}

async function sendOne(userId: string, payload: string): Promise<boolean> {
  const subs = await db.select().from(pushSubscriptions).where(
    and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.enabled, true)),
  );
  let any = false;
  for (const ps of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: ps.endpoint, keys: { p256dh: ps.p256dh, auth: ps.auth } },
        payload,
      );
      any = true;
    } catch (err: any) {
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        try { await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, ps.id)); } catch {}
      }
    }
  }
  return any;
}

// Original implementation, kept for when Brain Boost re-enables paid trials.
// Renamed so the no-op `runTrialReminders` above (Task #413) takes precedence.
async function _runTrialRemindersOriginal(): Promise<TrialReminderResult> {
  const result: TrialReminderResult = { d13Sent: 0, d14Sent: 0, failed: 0, errors: [], trialsLapsed: 0, graceLapsed: 0 };

  // Step 1: enforce lifecycle transitions BEFORE sending reminders so any
  // expired-trial / grace-expired subs are flipped to "lapsed" and we never
  // send a reminder to someone who has already lost access.
  try {
    const enforced = await storage.enforceLapsedSubscriptions();
    result.trialsLapsed = enforced.trialsLapsed;
    result.graceLapsed = enforced.graceLapsed;
    if (enforced.trialsLapsed > 0 || enforced.graceLapsed > 0) {
      console.log(`[TrialReminders] enforcement: ${enforced.trialsLapsed} trials lapsed, ${enforced.graceLapsed} grace lapsed`);
    }
  } catch (e: any) {
    result.errors.push(`enforce: ${e?.message ?? String(e)}`);
  }

  for (const slot of ["d14", "d13"] as const) {
    const days = slot === "d13" ? 1 : 0;
    let batch: Awaited<ReturnType<typeof storage.getTrialReminderBatch>> = [];
    try {
      batch = await storage.getTrialReminderBatch(days as 1 | 0);
    } catch (e: any) {
      result.errors.push(`batch ${slot}: ${e?.message ?? String(e)}`);
      continue;
    }
    for (const sub of batch) {
      try {
        const [user] = await db.select().from(users).where(eq(users.id, sub.userId)).limit(1);
        const langAf = (user?.preferredLanguage ?? "en") === "af";
        const payload = buildPayload(slot, langAf, user?.firstName ?? null);
        // Only mark the reminder slot as "sent" when we actually delivered a
        // push OR there are no subscribed devices to deliver to (in which
        // case there is nothing to retry). Transient delivery failures keep
        // the flag false so the next nightly pass retries.
        const subsCount = await db.select().from(pushSubscriptions).where(
          and(eq(pushSubscriptions.userId, sub.userId), eq(pushSubscriptions.enabled, true)),
        );
        const ok = await sendOne(sub.userId, payload);
        if (ok) {
          if (slot === "d13") result.d13Sent++; else result.d14Sent++;
          await storage.markTrialReminderSent(sub.userId, slot);
        } else if (subsCount.length === 0) {
          // No push subscriptions on file — nothing to retry, mark complete.
          await storage.markTrialReminderSent(sub.userId, slot);
        } else {
          // Transient failure across all of the user's subscribed devices —
          // leave the flag unset so the next run retries.
          result.failed++;
        }
      } catch (e: any) {
        result.failed++;
        result.errors.push(`${sub.userId}: ${e?.message ?? String(e)}`);
      }
    }
  }
  return result;
}
