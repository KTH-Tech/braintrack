// Task #43 — Parent consent token: mint a signed JWT, return a confirm URL.
// Email delivery is best-effort. If no email infra is configured we log the
// link and return it so the learner UI can surface a manual-share fallback.
//
// Task #460 — sendParentConsentEmail now delegates to the central branded
// email helper in server/email.ts instead of sending plain text.

import { createHash } from "crypto";
import jwt from "jsonwebtoken";
import { publicBaseUrl } from "./sms/onboarding-link";
import { sendParentConsentRequestEmail } from "./email";

const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const PURPOSE = "parent-consent";

export interface ParentConsentTokenPayload {
  sub: string;          // learner user id
  parentEmail: string;
  purpose: typeof PURPOSE;
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required for signing parent-consent tokens");
  return createHash("sha256").update(`${secret}::parent-consent::v1`).digest("hex");
}

export function mintParentConsentToken(learnerUserId: string, parentEmail: string): string {
  return jwt.sign(
    { sub: learnerUserId, parentEmail, purpose: PURPOSE },
    getSecret(),
    { algorithm: "HS256", expiresIn: TTL_SECONDS },
  );
}

export function verifyParentConsentToken(token: string):
  | { ok: true; learnerUserId: string; parentEmail: string }
  | { ok: false; reason: "expired" | "invalid" } {
  try {
    const payload = jwt.verify(token, getSecret(), { algorithms: ["HS256"] }) as ParentConsentTokenPayload;
    if (payload.purpose !== PURPOSE || !payload.sub) return { ok: false, reason: "invalid" };
    return { ok: true, learnerUserId: payload.sub, parentEmail: payload.parentEmail };
  } catch (err: any) {
    if (err?.name === "TokenExpiredError") return { ok: false, reason: "expired" };
    return { ok: false, reason: "invalid" };
  }
}

export function buildParentConsentUrl(token: string, baseUrl?: string): string {
  const base = (baseUrl ?? publicBaseUrl()).replace(/\/$/, "");
  return `${base}/parent-consent?token=${encodeURIComponent(token)}`;
}

export interface SendConsentEmailResult {
  ok: boolean;
  url: string;
  delivery: "sent" | "not_configured" | "failed";
  error?: string;
}

// Best-effort email send. Delegates to the central branded email helper in
// server/email.ts (dark HTML template, SendGrid). If SENDGRID_API_KEY is not
// set the helper logs the intent and returns not_configured — no try/catch
// needed here. The url is always returned so the UI can surface a manual
// share fallback (consistent with the WhatsApp helper pattern).
export async function sendParentConsentEmail(opts: {
  parentEmail: string;
  learnerName: string;
  url: string;
  language: "en" | "af";
}): Promise<SendConsentEmailResult> {
  const { parentEmail, learnerName, url, language } = opts;

  const result = await sendParentConsentRequestEmail({
    parentEmail,
    learnerName,
    consentUrl: url,
    language,
  });

  return {
    ok: result.delivery === "sent",
    url,
    delivery: result.delivery,
    ...(result.error ? { error: result.error } : {}),
  };
}
