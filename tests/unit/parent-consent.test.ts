/**
 * Unit tests for the onboarding parent-consent decision logic
 * (client/src/lib/parent-consent.ts).
 *
 * Two of these encode bugs that were live in client/src/pages/onboarding.tsx:
 *   • adults were gated behind sending a parent-consent email, which trapped
 *     every 18+ learner on the final onboarding screen (`canLeaveConsentPhase`);
 *   • a learner could enter their own address and self-approve, voiding the
 *     POPIA control entirely (`parentEmailIssue` → "self").
 */
import { describe, it, expect } from "vitest";
import {
  normaliseEmail,
  parentEmailIssue,
  isValidParentEmail,
  consentShareMode,
  canLeaveConsentPhase,
  consentRequirement,
} from "../../client/src/lib/parent-consent";

describe("normaliseEmail", () => {
  it("trims and lowercases, matching how the server stores parentEmail", () => {
    expect(normaliseEmail("  Parent@Example.CO.ZA ")).toBe("parent@example.co.za");
  });

  it("treats null/undefined as empty rather than throwing", () => {
    expect(normaliseEmail(null)).toBe("");
    expect(normaliseEmail(undefined)).toBe("");
  });
});

describe("parentEmailIssue", () => {
  it("accepts a normal address", () => {
    expect(parentEmailIssue("mom@example.co.za")).toBeNull();
    expect(parentEmailIssue("first.last+tag@sub.domain.org")).toBeNull();
  });

  it("reports an empty field as 'empty', not 'invalid'", () => {
    expect(parentEmailIssue("")).toBe("empty");
    expect(parentEmailIssue("   ")).toBe("empty");
    expect(parentEmailIssue(null)).toBe("empty");
  });

  it("catches the typos a learner actually makes", () => {
    expect(parentEmailIssue("mom.example.co.za")).toBe("invalid"); // no @
    expect(parentEmailIssue("mom@example")).toBe("invalid");       // no dot
    expect(parentEmailIssue("mom@example.c")).toBe("invalid");     // 1-char TLD
    expect(parentEmailIssue("mom @example.co.za")).toBe("invalid"); // space
    expect(parentEmailIssue("mom@example.co.za,dad@x.co.za")).toBe("invalid"); // two
  });

  it("refuses the learner's own address — self-consent defeats the control", () => {
    expect(parentEmailIssue("teen@example.co.za", "teen@example.co.za")).toBe("self");
  });

  it("compares learner and parent addresses case- and whitespace-insensitively", () => {
    expect(parentEmailIssue("  TEEN@Example.co.za ", "teen@example.co.za")).toBe("self");
  });

  it("skips the self check when the learner's address isn't known yet", () => {
    expect(parentEmailIssue("teen@example.co.za")).toBeNull();
    expect(parentEmailIssue("teen@example.co.za", null)).toBeNull();
    expect(parentEmailIssue("teen@example.co.za", "")).toBeNull();
  });

  it("still reports shape problems ahead of the self check", () => {
    expect(parentEmailIssue("nonsense", "nonsense")).toBe("invalid");
  });
});

describe("isValidParentEmail", () => {
  it("mirrors parentEmailIssue as a boolean", () => {
    expect(isValidParentEmail("mom@example.co.za")).toBe(true);
    expect(isValidParentEmail("")).toBe(false);
    expect(isValidParentEmail("nope")).toBe(false);
    expect(isValidParentEmail("teen@x.co.za", "teen@x.co.za")).toBe(false);
  });
});

describe("consentShareMode", () => {
  it("treats only a real send as 'sent'", () => {
    expect(consentShareMode("sent")).toBe("sent");
  });

  it("collapses both non-delivery outcomes to 'manual' — the learner is the courier", () => {
    expect(consentShareMode("not_configured")).toBe("manual");
    expect(consentShareMode("failed")).toBe("manual");
  });

  it("defaults to 'manual' when delivery is unknown, so the link is never hidden", () => {
    expect(consentShareMode(null)).toBe("manual");
    expect(consentShareMode(undefined)).toBe("manual");
  });
});

describe("canLeaveConsentPhase", () => {
  it("blocks a minor who hasn't requested consent (POPIA)", () => {
    expect(canLeaveConsentPhase({ isMinor: true, consentRequested: false })).toBe(false);
  });

  it("lets a minor through once the request has been sent", () => {
    expect(canLeaveConsentPhase({ isMinor: true, consentRequested: true })).toBe(true);
  });

  it("never blocks an adult — the old unconditional gate trapped every 18+ signup", () => {
    expect(canLeaveConsentPhase({ isMinor: false, consentRequested: false })).toBe(true);
    expect(canLeaveConsentPhase({ isMinor: false, consentRequested: true })).toBe(true);
  });
});

describe("consentRequirement", () => {
  it("is required for minors and optional for adults", () => {
    expect(consentRequirement(true)).toBe("required");
    expect(consentRequirement(false)).toBe("optional");
  });
});
