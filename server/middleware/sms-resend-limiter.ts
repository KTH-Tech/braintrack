import type { Request, Response, NextFunction } from "express";
import { and, eq, gte } from "drizzle-orm";
import { db } from "../db";
import { smsResendEvents } from "@shared/schema";

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}

const COOLDOWN_SECONDS = parsePositiveInt(process.env.SMS_RESEND_COOLDOWN_SECONDS, 60);
const HOURLY_CAP = parsePositiveInt(process.env.SMS_RESEND_HOURLY_CAP, 5);
const DAILY_CAP = parsePositiveInt(process.env.SMS_RESEND_DAILY_CAP, 10);

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function getKey(req: Request): string | null {
  const user = req.user as
    | { id?: string; claims?: { sub?: string } }
    | undefined;
  return user?.id ?? user?.claims?.sub ?? null;
}

// DB-backed rate limiter. Each reserved resend is a row in `sms_resend_events`,
// so the cooldown/hourly/daily caps are shared across every Render instance and
// survive restarts/deploys (the previous in-memory Map gave each instance its
// own bucket — effective cap ~Nx and wiped on every deploy).
//
// FAIL-OPEN: an unexpected DB error logs and calls next() so a transient DB
// hiccup never blocks a legitimate resend. The caps still hold on the normal
// path; blocking all resends on a DB blip would be worse than a brief window.
export async function smsResendLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const key = getKey(req);
  if (!key) {
    return res
      .status(401)
      .json({ error: "unauthorized", message: "Sign in required." });
  }

  const now = Date.now();
  const hourAgoMs = now - HOUR_MS;
  const dayAgo = new Date(now - DAY_MS);

  try {
    // A single read covers all three checks: every event for this user within
    // the last day, oldest → newest. Rows are capped (~DAILY_CAP per user), so
    // this stays tiny. Anything older than a day is irrelevant to every cap.
    const rows = await db
      .select({ createdAt: smsResendEvents.createdAt })
      .from(smsResendEvents)
      .where(
        and(
          eq(smsResendEvents.userId, key),
          gte(smsResendEvents.createdAt, dayAgo),
        ),
      )
      .orderBy(smsResendEvents.createdAt);

    const times = rows.map((r) => r.createdAt.getTime());

    // Cooldown — newest event within the day window (anything older than the
    // cooldown is, by definition, older than the day window is not; the newest
    // in-window row is the only one that can still be inside the cooldown).
    const newest = times.length ? times[times.length - 1] : 0;
    const sinceLast = now - newest;
    if (newest && sinceLast < COOLDOWN_SECONDS * 1000) {
      const retryAfter = Math.ceil((COOLDOWN_SECONDS * 1000 - sinceLast) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: "resend_cooldown",
        reason: "cooldown",
        retryAfterSeconds: retryAfter,
        message: `Please wait ${retryAfter}s before requesting another SMS.`,
      });
    }

    // Hourly cap
    const hourly = times.filter((t) => t >= hourAgoMs);
    if (hourly.length >= HOURLY_CAP) {
      const oldest = hourly[0];
      const retryAfter = Math.max(1, Math.ceil((HOUR_MS - (now - oldest)) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: "resend_hourly_cap",
        reason: "hourly_cap",
        retryAfterSeconds: retryAfter,
        message: `You've reached the hourly resend limit (${HOURLY_CAP}). Try again later.`,
      });
    }

    // Daily cap — every in-window row is within the day by construction.
    if (times.length >= DAILY_CAP) {
      const oldest = times[0];
      const retryAfter = Math.max(1, Math.ceil((DAY_MS - (now - oldest)) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: "resend_daily_cap",
        reason: "daily_cap",
        retryAfterSeconds: retryAfter,
        message: `Daily resend limit reached (${DAILY_CAP}). Please try again tomorrow.`,
      });
    }

    // Reserve the slot before the handler runs so concurrent requests can't
    // slip past the caps. If the downstream handler decides not to actually
    // send (e.g. validation failure), it should call releaseSmsResendSlot(req)
    // to delete this reserved row.
    const [inserted] = await db
      .insert(smsResendEvents)
      .values({ userId: key })
      .returning({ id: smsResendEvents.id });
    (req as any)._smsResendEventId = inserted?.id;
    return next();
  } catch (err) {
    // Fail-open on unexpected DB errors — never block a legit resend on a blip.
    console.error(
      "[sms-resend-limiter] DB error, failing open:",
      err instanceof Error ? err.message : String(err),
    );
    return next();
  }
}

// Delete the slot reserved by smsResendLimiter when the handler decided not to
// send. Callers invoke this synchronously (no await), so it is fire-and-forget:
// the DELETE runs in the background and any error is swallowed after logging.
export function releaseSmsResendSlot(req: Request): void {
  const id = (req as any)._smsResendEventId as number | undefined;
  if (id === undefined || id === null) return;
  delete (req as any)._smsResendEventId;
  void db
    .delete(smsResendEvents)
    .where(eq(smsResendEvents.id, id))
    .catch((err) => {
      console.error(
        "[sms-resend-limiter] failed to release slot:",
        err instanceof Error ? err.message : String(err),
      );
    });
}

export const SMS_RESEND_LIMITS = {
  cooldownSeconds: COOLDOWN_SECONDS,
  hourlyCap: HOURLY_CAP,
  dailyCap: DAILY_CAP,
};

// Test helper: clear all reserved slots. Name kept for compatibility with the
// previous in-memory implementation; now truncates the backing table.
export async function __resetSmsResendBucketsForTests(): Promise<void> {
  await db.delete(smsResendEvents);
}
