// Task #412 — Mint, send, and verify one-time signed onboarding magic links.
// The link is delivered to the learner's cell via Twilio. Tapping it lands
// on /api/auth/onboarding-claim which verifies the JWT, single-use-marks the
// jti, establishes a session, and redirects to /onboarding.

import { randomUUID, createHash } from "crypto";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { onboardingLinkTokens } from "@shared/schema";
import { and, eq, isNull, gt } from "drizzle-orm";
import { sendWhatsApp, isTwilioWhatsAppConfigured } from "./twilio";

const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours
const ONBOARDING_PURPOSE = "onboarding";

export interface OnboardingTokenPayload {
  sub: string; // user id
  purpose: typeof ONBOARDING_PURPOSE;
  jti: string;
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required for signing onboarding links");
  // Namespace via HMAC so the same secret can't be reused across token classes.
  return createHash("sha256").update(`${secret}::onboarding-link::v1`).digest("hex");
}

export function publicBaseUrl(req?: { protocol?: string; get?: (h: string) => string | undefined }): string {
  const fromEnv =
    process.env.PUBLIC_BASE_URL ||
    (process.env.REPLIT_DOMAINS?.split(",")[0]?.trim()
      ? `https://${process.env.REPLIT_DOMAINS!.split(",")[0]!.trim()}`
      : process.env.REPLIT_DEV_DOMAIN
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : null);
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (req?.protocol && req.get) {
    const host = req.get("host");
    if (host) return `${req.protocol}://${host}`;
  }
  return "https://braintrack.app";
}

function messageCopy(language: "en" | "af", url: string): string {
  if (language === "af") {
    return `BrainTrack: Tik om jou aanmeldingsvasvra te begin: ${url} (skakel verval oor 24h, eenmalig).`;
  }
  return `BrainTrack: Tap to start your onboarding quiz: ${url} (link expires in 24h, single-use).`;
}

export interface IssueOnboardingLinkOptions {
  userId: string;
  learnerCell: string; // already SA-normalised (27XXXXXXXXX form)
  language?: "en" | "af";
  baseUrl?: string;
  // Task #425: 0 = original send, 1 = first auto-retry, 2 = second auto-retry.
  retryCount?: number;
}

export interface IssueOnboardingLinkResult {
  ok: boolean;
  jti: string;
  url: string;
  smsError?: string;
  smsErrorMessage?: string;
  messageSid?: string;
}

export async function issueAndSendOnboardingLink(
  opts: IssueOnboardingLinkOptions,
): Promise<IssueOnboardingLinkResult> {
  const { userId, learnerCell, language = "en", baseUrl, retryCount = 0 } = opts;
  const jti = randomUUID();
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + TOKEN_TTL_SECONDS;
  const token = jwt.sign(
    { sub: userId, purpose: ONBOARDING_PURPOSE, jti } as Record<string, unknown>,
    getSecret(),
    { algorithm: "HS256", expiresIn: TOKEN_TTL_SECONDS },
  );
  const base = (baseUrl ?? publicBaseUrl()).replace(/\/$/, "");
  const url = `${base}/api/auth/onboarding-claim?token=${encodeURIComponent(token)}`;

  // Persist the jti BEFORE sending so we can enforce single-use even if the
  // process crashes between Twilio ack and DB write.
  await db.insert(onboardingLinkTokens).values({
    jti,
    userId,
    sentTo: learnerCell,
    channel: "whatsapp",
    deliveryStatus: "pending",
    expiresAt: new Date(expSec * 1000),
    retryCount,
  });

  if (!isTwilioWhatsAppConfigured()) {
    await db
      .update(onboardingLinkTokens)
      .set({ deliveryStatus: "not_configured", deliveryError: "twilio_not_configured" })
      .where(eq(onboardingLinkTokens.jti, jti));
    return {
      ok: false,
      jti,
      url,
      smsError: "twilio_not_configured",
      smsErrorMessage:
        "WhatsApp delivery is not yet active on this environment. Share the onboarding link with the learner manually.",
    };
  }

  // Task #415: ask Twilio to POST delivery status callbacks back to us so we
  // can record delivered / failed / undelivered transitions per jti. We pass
  // the jti as a query param (cheaper than maintaining a sid → jti index for
  // the in-flight window between Messages.create and the first callback).
  const statusCallback = `${base}/api/twilio/status?jti=${encodeURIComponent(jti)}`;

  // Task #427: Production sender uses an approved Meta template where {{1}} is
  // the magic-link URL. When TWILIO_WHATSAPP_CONTENT_SID (or its AF variant)
  // is set we pass just the URL as the body so sendWhatsApp maps it to
  // ContentVariables: { "1": url }. Without a template SID we fall back to
  // a free-form body (sandbox / 24h-session-window path only).
  const templateSid =
    language === "af"
      ? (process.env.TWILIO_WHATSAPP_CONTENT_SID_AF ?? process.env.TWILIO_WHATSAPP_CONTENT_SID)
      : process.env.TWILIO_WHATSAPP_CONTENT_SID;
  const messageBody = templateSid ? url : messageCopy(language, url);
  const send = await sendWhatsApp(learnerCell, messageBody, {
    statusCallback,
    contentSid: templateSid ?? undefined,
  });
  if (!send.ok) {
    await db
      .update(onboardingLinkTokens)
      .set({ deliveryStatus: "failed", deliveryError: `${send.error}: ${send.message}` })
      .where(eq(onboardingLinkTokens.jti, jti));
    return { ok: false, jti, url, smsError: send.error, smsErrorMessage: send.message };
  }

  await db
    .update(onboardingLinkTokens)
    .set({
      deliveryStatus: send.status || "sent",
      messageSid: send.messageSid,
      deliveryUpdatedAt: new Date(),
    })
    .where(eq(onboardingLinkTokens.jti, jti));
  return { ok: true, jti, url, messageSid: send.messageSid };
}

export interface VerifyOnboardingLinkResult {
  ok: boolean;
  userId?: string;
  reason?: "invalid" | "expired" | "wrong_purpose" | "already_used" | "unknown";
}

export interface VerifyOnboardingLinkOptions {
  // Task #415: support audit trail of where the magic-link was actually
  // claimed from so admins can spot bogus / forwarded link consumption.
  ip?: string | null;
  userAgent?: string | null;
}

export async function verifyAndConsumeOnboardingLink(
  token: string,
  audit: VerifyOnboardingLinkOptions = {},
): Promise<VerifyOnboardingLinkResult> {
  let payload: OnboardingTokenPayload;
  try {
    payload = jwt.verify(token, getSecret(), { algorithms: ["HS256"] }) as OnboardingTokenPayload;
  } catch (err: any) {
    if (err?.name === "TokenExpiredError") return { ok: false, reason: "expired" };
    return { ok: false, reason: "invalid" };
  }
  if (payload.purpose !== ONBOARDING_PURPOSE || !payload.sub || !payload.jti) {
    return { ok: false, reason: "wrong_purpose" };
  }

  // Atomic single-use enforcement: the UPDATE only matches rows that are
  // still unused AND unexpired. If nothing comes back the link was already
  // claimed (or expired / revoked).
  const now = new Date();
  const ipTrimmed = (audit.ip ?? "").toString().slice(0, 64) || null;
  const uaTrimmed = (audit.userAgent ?? "").toString().slice(0, 512) || null;
  const updated = await db
    .update(onboardingLinkTokens)
    .set({
      usedAt: now,
      claimedFromIp: ipTrimmed,
      claimedUserAgent: uaTrimmed,
    })
    .where(
      and(
        eq(onboardingLinkTokens.jti, payload.jti),
        eq(onboardingLinkTokens.userId, payload.sub),
        isNull(onboardingLinkTokens.usedAt),
        gt(onboardingLinkTokens.expiresAt, now),
      ),
    )
    .returning();
  if (!updated[0]) {
    // Disambiguate already-used vs expired/unknown for a friendlier error.
    const [existing] = await db
      .select()
      .from(onboardingLinkTokens)
      .where(eq(onboardingLinkTokens.jti, payload.jti))
      .limit(1);
    if (!existing) return { ok: false, reason: "unknown" };
    if (existing.usedAt) return { ok: false, reason: "already_used" };
    if (existing.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };
    return { ok: false, reason: "unknown" };
  }
  return { ok: true, userId: payload.sub };
}
