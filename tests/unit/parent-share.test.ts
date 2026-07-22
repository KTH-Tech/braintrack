/**
 * tests/unit/parent-share.test.ts
 *
 * The PARENT ONBOARDING share step turns a server-issued activation link into
 * the artifacts a parent taps to hand it over. Two units under test:
 *
 *   1. client/src/lib/parent-share.ts — the WhatsApp-text encoder and the
 *      `wa.me` deep-link builder (+ SA-cell → wa.me number normaliser).
 *   2. server/sms/onboarding-link.ts — buildOnboardingClaimUrl, the token-link
 *      builder both the SMS path and the parent-share path mint URLs through.
 *
 * The load-bearing guarantees at launch:
 *   • the shareable link/text carries the TOKEN, never a password;
 *   • no child personal data is baked into the message;
 *   • wa.me targeting works for real SA numbers and degrades to the generic
 *     picker (never a broken link) for anything else.
 */

import { describe, it, expect } from "vitest";
import {
  normaliseWaNumber,
  buildActivationShareText,
  buildWhatsAppDeepLink,
} from "../../client/src/lib/parent-share";
import { buildOnboardingClaimUrl } from "../../server/sms/onboarding-link";

const URL_SAMPLE =
  "https://app.braintrack.co.za/api/auth/onboarding-claim?token=eyJhbGciOi.abc-123.def";

// ─── normaliseWaNumber ────────────────────────────────────────────────────────

describe("normaliseWaNumber", () => {
  it("converts local 0XX numbers to 27XXXXXXXXX", () => {
    expect(normaliseWaNumber("083 123 4567")).toBe("27831234567");
    expect(normaliseWaNumber("0831234567")).toBe("27831234567");
    expect(normaliseWaNumber("072-345-6789")).toBe("27723456789");
  });

  it("accepts +27 and 27 international forms", () => {
    expect(normaliseWaNumber("+27 83 123 4567")).toBe("27831234567");
    expect(normaliseWaNumber("27831234567")).toBe("27831234567");
  });

  it("accepts a bare 9-digit national number", () => {
    expect(normaliseWaNumber("831234567")).toBe("27831234567");
  });

  it("returns null for blanks and non-SA-mobile shapes", () => {
    expect(normaliseWaNumber("")).toBeNull();
    expect(normaliseWaNumber(null)).toBeNull();
    expect(normaliseWaNumber(undefined)).toBeNull();
    expect(normaliseWaNumber("012 345 6789")).toBeNull(); // landline prefix 0
    expect(normaliseWaNumber("0123")).toBeNull();
    expect(normaliseWaNumber("hello")).toBeNull();
  });
});

// ─── buildActivationShareText ─────────────────────────────────────────────────

describe("buildActivationShareText", () => {
  it("embeds the activation link in both languages", () => {
    expect(buildActivationShareText(URL_SAMPLE, "en")).toContain(URL_SAMPLE);
    expect(buildActivationShareText(URL_SAMPLE, "af")).toContain(URL_SAMPLE);
  });

  it("localises the copy", () => {
    expect(buildActivationShareText(URL_SAMPLE, "en").toLowerCase()).toContain("sign-in link");
    expect(buildActivationShareText(URL_SAMPLE, "af").toLowerCase()).toContain("aanmeldskakel");
  });

  it("mentions the 24-hour single-use nature so the child acts promptly", () => {
    expect(buildActivationShareText(URL_SAMPLE, "en")).toMatch(/24 hours/);
    expect(buildActivationShareText(URL_SAMPLE, "af")).toMatch(/24 uur/);
  });

  it("carries ONLY the link — never a password or a name (POPIA data-minimisation)", () => {
    // The builder's only data input is the URL, so a caller cannot leak child
    // data through it even by mistake — assert the contract holds.
    const text = buildActivationShareText(URL_SAMPLE, "en");
    expect(text).not.toMatch(/password/i);
    expect(text).not.toMatch(/Kagiso|Dlamini/); // sample child identity never present
  });
});

// ─── buildWhatsAppDeepLink ────────────────────────────────────────────────────

describe("buildWhatsAppDeepLink", () => {
  it("targets wa.me/<number> when a valid child cell is supplied", () => {
    const link = buildWhatsAppDeepLink(URL_SAMPLE, "en", "083 123 4567");
    expect(link.startsWith("https://wa.me/27831234567?text=")).toBe(true);
  });

  it("falls back to the generic picker when no/invalid cell is supplied", () => {
    expect(buildWhatsAppDeepLink(URL_SAMPLE, "en").startsWith("https://wa.me/?text=")).toBe(true);
    expect(buildWhatsAppDeepLink(URL_SAMPLE, "en", "").startsWith("https://wa.me/?text=")).toBe(true);
    expect(
      buildWhatsAppDeepLink(URL_SAMPLE, "en", "not-a-number").startsWith("https://wa.me/?text="),
    ).toBe(true);
  });

  it("url-encodes the message, preserving the token when decoded", () => {
    const link = buildWhatsAppDeepLink(URL_SAMPLE, "af", "0831234567");
    const encoded = link.split("?text=")[1];
    // Raw spaces must be encoded, and the token survives a round-trip decode.
    expect(encoded).not.toContain(" ");
    expect(decodeURIComponent(encoded)).toContain(URL_SAMPLE);
    expect(decodeURIComponent(encoded)).toContain("token=eyJhbGciOi.abc-123.def");
  });
});

// ─── buildOnboardingClaimUrl (server token-link builder) ──────────────────────

describe("buildOnboardingClaimUrl", () => {
  it("builds the claim URL and strips a trailing slash off the base", () => {
    expect(buildOnboardingClaimUrl("https://app.braintrack.co.za", "tok")).toBe(
      "https://app.braintrack.co.za/api/auth/onboarding-claim?token=tok",
    );
    expect(buildOnboardingClaimUrl("https://app.braintrack.co.za/", "tok")).toBe(
      "https://app.braintrack.co.za/api/auth/onboarding-claim?token=tok",
    );
  });

  it("url-encodes the token (JWTs contain dots and, rarely, reserved chars)", () => {
    const jwtish = "a.b+c/d=";
    const url = buildOnboardingClaimUrl("https://x.co", jwtish);
    expect(url).toContain(`token=${encodeURIComponent(jwtish)}`);
    expect(url).not.toContain("+c/d="); // reserved chars were percent-encoded
  });
});
