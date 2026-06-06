import type { Request, Response, NextFunction } from "express";

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

type Bucket = {
  lastAt: number;
  hourly: number[];
  daily: number[];
};

const buckets = new Map<string, Bucket>();

function prune(b: Bucket, now: number) {
  b.hourly = b.hourly.filter((t) => now - t < HOUR_MS);
  b.daily = b.daily.filter((t) => now - t < DAY_MS);
}

function getKey(req: Request): string | null {
  const user = req.user as
    | { id?: string; claims?: { sub?: string } }
    | undefined;
  return user?.id ?? user?.claims?.sub ?? null;
}

export function smsResendLimiter(
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
  const b = buckets.get(key) ?? { lastAt: 0, hourly: [], daily: [] };
  prune(b, now);

  const sinceLast = now - b.lastAt;
  if (b.lastAt && sinceLast < COOLDOWN_SECONDS * 1000) {
    const retryAfter = Math.ceil((COOLDOWN_SECONDS * 1000 - sinceLast) / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    return res.status(429).json({
      error: "resend_cooldown",
      reason: "cooldown",
      retryAfterSeconds: retryAfter,
      message: `Please wait ${retryAfter}s before requesting another SMS.`,
    });
  }
  if (b.hourly.length >= HOURLY_CAP) {
    const oldest = b.hourly[0];
    const retryAfter = Math.max(1, Math.ceil((HOUR_MS - (now - oldest)) / 1000));
    res.setHeader("Retry-After", String(retryAfter));
    return res.status(429).json({
      error: "resend_hourly_cap",
      reason: "hourly_cap",
      retryAfterSeconds: retryAfter,
      message: `You've reached the hourly resend limit (${HOURLY_CAP}). Try again later.`,
    });
  }
  if (b.daily.length >= DAILY_CAP) {
    const oldest = b.daily[0];
    const retryAfter = Math.max(1, Math.ceil((DAY_MS - (now - oldest)) / 1000));
    res.setHeader("Retry-After", String(retryAfter));
    return res.status(429).json({
      error: "resend_daily_cap",
      reason: "daily_cap",
      retryAfterSeconds: retryAfter,
      message: `Daily resend limit reached (${DAILY_CAP}). Please try again tomorrow.`,
    });
  }

  // Reserve the slot before the handler runs so concurrent requests can't slip
  // past the caps. If the downstream handler decides not to actually send (e.g.
  // validation failure), it should call releaseSmsResendSlot(req).
  b.lastAt = now;
  b.hourly.push(now);
  b.daily.push(now);
  buckets.set(key, b);
  (req as any)._smsResendSlotAt = now;
  next();
}

export function releaseSmsResendSlot(req: Request) {
  const key = getKey(req);
  const ts = (req as any)._smsResendSlotAt as number | undefined;
  if (!key || !ts) return;
  const b = buckets.get(key);
  if (!b) return;
  if (b.lastAt === ts) b.lastAt = 0;
  b.hourly = b.hourly.filter((t) => t !== ts);
  b.daily = b.daily.filter((t) => t !== ts);
  if (!b.hourly.length && !b.daily.length && !b.lastAt) {
    buckets.delete(key);
  } else {
    buckets.set(key, b);
  }
  delete (req as any)._smsResendSlotAt;
}

export const SMS_RESEND_LIMITS = {
  cooldownSeconds: COOLDOWN_SECONDS,
  hourlyCap: HOURLY_CAP,
  dailyCap: DAILY_CAP,
};

export function __resetSmsResendBucketsForTests() {
  buckets.clear();
}
