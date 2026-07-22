/**
 * client/src/lib/parent-share.ts — pure builders for the PARENT ONBOARDING
 * "share step". After a parent creates + activates their child's account
 * (POST /api/parent/activate-child), the server returns a single-use,
 * time-bounded ACTIVATION LINK (an onboarding magic-link — see
 * server/sms/onboarding-link.ts). These helpers turn that link into the
 * artifacts the parent taps/shares:
 *
 *   • a `https://wa.me/...?text=<encoded>` DEEP LINK the parent taps to open
 *     WhatsApp with a prefilled message. This is NOT a server-side WhatsApp
 *     send — it opens the parent's own WhatsApp. When the parent supplied the
 *     child's cell we target `wa.me/<number>`, otherwise the generic picker.
 *   • the prefilled message text itself (also reused for navigator.share()).
 *
 * POPIA / data-minimisation: the shareable message carries ONLY the activation
 * link — never the child's name, school, cell, username or the on-screen
 * password. The link itself carries a signed token, never a password.
 *
 * Everything here is pure (no React, no DOM) so it is unit-tested directly in
 * tests/unit/parent-share.test.ts.
 */

export type ShareLang = "en" | "af";

/**
 * Convert a South African cell number into the digits-only international form
 * `wa.me` expects: country code, no `+`, no leading `0`, no spaces.
 * Returns null when the input can't be a real SA mobile number, so callers
 * fall back to the generic `wa.me/?text=` picker rather than a broken link.
 *
 * Accepts `0XX XXX XXXX`, `+27XXXXXXXXX`, `27XXXXXXXXX` and bare `6/7/8…`.
 */
export function normaliseWaNumber(raw: string | null | undefined): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  // Already in 27XXXXXXXXX form (11 digits, SA mobile prefix 6/7/8).
  if (digits.startsWith("27") && digits.length === 11 && /^27[6-8]/.test(digits)) {
    return digits;
  }
  // Local 0XXXXXXXXX (10 digits) → strip the 0, prepend 27.
  if (digits.startsWith("0") && digits.length === 10 && /^0[6-8]/.test(digits)) {
    return `27${digits.slice(1)}`;
  }
  // Bare 9-digit national number without the trunk 0 (6/7/8…).
  if (digits.length === 9 && /^[6-8]/.test(digits)) {
    return `27${digits}`;
  }
  return null;
}

/**
 * The prefilled WhatsApp / share message. Short, bilingual, light on data
 * (SA learners are data-conscious), and deliberately free of ANY personal
 * data — just the activation link and what to do with it.
 */
export function buildActivationShareText(activationUrl: string, lang: ShareLang): string {
  const url = (activationUrl ?? "").trim();
  if (lang === "af") {
    return `Haai! 👋 Tik jou BrainTrack-aanmeldskakel om te begin: ${url} (net vir jou, verval oor 24 uur).`;
  }
  return `Hi! 👋 Tap your BrainTrack sign-in link to get started: ${url} (just for you, expires in 24 hours).`;
}

/**
 * Build the `wa.me` deep link the PARENT taps. Opens WhatsApp with the message
 * prefilled. Targets the child's number when a valid SA cell is supplied,
 * otherwise the generic contact picker.
 *
 * @param activationUrl  the single-use activation link (contains the token)
 * @param lang           the parent's language for the prefilled copy
 * @param childCell      optional child cell — targets wa.me/<number> when valid
 */
export function buildWhatsAppDeepLink(
  activationUrl: string,
  lang: ShareLang,
  childCell?: string | null,
): string {
  const text = encodeURIComponent(buildActivationShareText(activationUrl, lang));
  const number = normaliseWaNumber(childCell);
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}
