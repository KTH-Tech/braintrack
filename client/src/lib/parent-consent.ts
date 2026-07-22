/**
 * client/src/lib/parent-consent.ts — the decision logic behind the onboarding
 * `parent_consent` phase, kept out of the page so it can be unit-tested.
 *
 * WHY THIS IS LOAD-BEARING
 * ------------------------
 * Under POPIA a learner under 18 cannot consent to processing on their own
 * behalf — a competent person (parent/guardian) has to. Onboarding therefore
 * collects a parent's address and asks the server to mint a one-time consent
 * link. Two rules fall out of that and both used to be wrong in the page:
 *
 *   1. The requirement is age-conditional. `canLeaveConsentPhase` gates ONLY
 *      minors. The page previously gated everyone on `consentLink !== null`,
 *      so an adult learner could never finish onboarding without first
 *      emailing a "parent" — a dead end for every 18+ signup.
 *   2. The address must not be the learner's own. A minor who types their own
 *      address can approve themselves, which voids the control entirely.
 *      `parentEmailIssue` rejects that case explicitly.
 *
 * Delivery is best-effort: the server always returns the link so the learner
 * can share it by hand when mail is not configured or the send failed. Those
 * two outcomes are honestly distinct (`not_configured` is an environment
 * limitation, `failed` is an error worth retrying) but share one behaviour —
 * the learner is now the delivery mechanism — which `consentShareMode`
 * collapses so the UI has a single branch to render against.
 */

/** Outcomes reported by POST /api/onboarding/parent-consent/request. */
export type ConsentDelivery = "sent" | "not_configured" | "failed";

/** Payload shape of that endpoint (the body, not the fetch Response). */
export interface ConsentRequestResult {
  ok: boolean;
  url: string;
  delivery: ConsentDelivery;
}

/** Why a parent address is not acceptable, or `null` when it is fine. */
export type ParentEmailIssue = "empty" | "invalid" | "self";

/**
 * Deliberately permissive shape check — matching RFC 5322 in a regex is a
 * losing game, and the address is validated for real by `z.string().email()`
 * on the server before a token is minted. This exists to stop the obvious
 * typos (missing @, missing dot, trailing comma) at the point of entry.
 */
const EMAIL_SHAPE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/;

/** Trim + lowercase, matching how the server stores `users.parentEmail`. */
export function normaliseEmail(raw: string | null | undefined): string {
  return (raw ?? "").trim().toLowerCase();
}

/**
 * Validate the parent address the learner typed. `learnerEmail` is optional
 * because the page can render before the auth query resolves; when it is
 * absent the self-consent check is simply skipped rather than guessed at.
 */
export function parentEmailIssue(
  raw: string | null | undefined,
  learnerEmail?: string | null,
): ParentEmailIssue | null {
  const email = normaliseEmail(raw);
  if (email.length === 0) return "empty";
  if (!EMAIL_SHAPE.test(email)) return "invalid";
  const learner = normaliseEmail(learnerEmail);
  if (learner.length > 0 && learner === email) return "self";
  return null;
}

/** Convenience predicate — true when the address may be submitted. */
export function isValidParentEmail(
  raw: string | null | undefined,
  learnerEmail?: string | null,
): boolean {
  return parentEmailIssue(raw, learnerEmail) === null;
}

/**
 * Did the email actually leave the building? `sent` means the learner should
 * go nudge their parent; anything else means the learner is now responsible
 * for delivering the link, so the UI must foreground it.
 */
export function consentShareMode(
  delivery: ConsentDelivery | null | undefined,
): "sent" | "manual" {
  return delivery === "sent" ? "sent" : "manual";
}

/**
 * Can the learner leave the consent phase and complete onboarding?
 *
 * Minors must have at least requested consent (the parent has not necessarily
 * clicked yet — that unlocks features later, it does not block signup).
 * Adults are never gated: nothing about their account depends on a guardian.
 */
export function canLeaveConsentPhase(args: {
  isMinor: boolean;
  consentRequested: boolean;
}): boolean {
  return args.isMinor ? args.consentRequested : true;
}

/**
 * Is the parent-email block a hard requirement on this screen, or an optional
 * extra? Adults may still add a guardian (for progress reports) but are never
 * blocked by it, and the copy must say so rather than implying a wall.
 */
export function consentRequirement(isMinor: boolean): "required" | "optional" {
  return isMinor ? "required" : "optional";
}
