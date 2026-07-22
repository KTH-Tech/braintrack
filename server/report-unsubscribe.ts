/**
 * server/report-unsubscribe.ts
 *
 * Signed one-click unsubscribe tokens for scheduled report emails.
 *
 * A token encodes the (parentUserId, learnerUserId) pair so that following
 * the link in an email directly flips `parent_links.report_email_opt_out`
 * for that specific parent-learner pair without requiring a login.
 */

import jwt from "jsonwebtoken";

const PURPOSE = "report-email-unsubscribe";

export interface UnsubscribeTokenPayload {
  parentUserId: string;
  learnerUserId: string;
  purpose: typeof PURPOSE;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET is required to sign/verify report unsubscribe tokens");
    }
    return "dev-session-secret";
  }
  return secret;
}

export function signUnsubscribeToken(
  parentUserId: string,
  learnerUserId: string,
): string {
  return jwt.sign(
    { parentUserId, learnerUserId, purpose: PURPOSE },
    getSecret(),
    { expiresIn: "365d" },
  );
}

export function verifyUnsubscribeToken(
  token: string,
): UnsubscribeTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret()) as UnsubscribeTokenPayload;
    if (!decoded || decoded.purpose !== PURPOSE) return null;
    if (!decoded.parentUserId || !decoded.learnerUserId) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function buildUnsubscribeUrl(
  parentUserId: string,
  learnerUserId: string,
): string {
  const token = signUnsubscribeToken(parentUserId, learnerUserId);
  const base = (process.env.APP_URL || process.env.PUBLIC_BASE_URL || "https://braintrack.tech").replace(/\/$/, "");
  return `${base}/api/unsubscribe/report-email?token=${encodeURIComponent(token)}`;
}
