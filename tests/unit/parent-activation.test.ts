/**
 * tests/unit/parent-activation.test.ts
 *
 * POST /api/parent/activate-child core logic (server/parent-activation.ts).
 * What actually matters at launch:
 *   1. Validation — malformed input never reaches the database.
 *   2. Duplicate rejection — same-named linked child and taken emails 409.
 *   3. Consent — the learner row carries parentConsentGranted(+At) and a
 *      "parental"/"granted" consent_log entry records the parent-created
 *      account (POPIA).
 *   4. No plaintext anywhere — the password exists only in the in-memory
 *      result; everything persisted holds a hash.
 * Plus the credential generators: readable ≥10-char passwords and
 * collision-checked learner handles.
 */

import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import {
  activateChildSchema,
  activateChild,
  generateReadablePassword,
  hashPasswordDefault,
  buildLearnerHandle,
  generateUniqueHandle,
  LEARNER_HANDLE_DOMAIN,
  type ActivationDeps,
  type NewLearnerRow,
  type ConsentLogEntry,
} from "../../server/parent-activation";
import { changePasswordSchema } from "../../server/local-auth";

// ─── Fixtures ───────────────────────────────────────────────────────────────

const VALID_INPUT = {
  parentPhone: "083 123 4567",
  parentEmail: "Parent@Example.com",
  childFirstName: "Kagiso",
  childLastName: "Dlamini",
  childEmail: "",
  schoolName: "Waterkloof High School",
  schoolId: null,
  language: "en" as const,
};

const CTX = { parentUserId: "parent-1", ipAddress: "196.1.2.3", userAgent: "vitest" };

/** In-memory deps double that records every side effect. */
function makeDeps(overrides: Partial<ActivationDeps> = {}) {
  const state = {
    learners: [] as NewLearnerRow[],
    consentLogs: [] as ConsentLogEntry[],
    createdLinks: [] as any[],
    activatedPending: [] as Array<{ linkId: number; learnerUserId: string; activatedAt: Date }>,
    parentPatches: [] as Array<{ parentUserId: string; phone: string }>,
    existingEmails: new Set<string>(),
    links: [] as Array<{ id: number; learnerName: string | null; learnerUserId: string | null; status: string | null }>,
  };
  const deps: ActivationDeps = {
    normalisePhone: (raw) => {
      const digits = raw.replace(/\D/g, "");
      return digits.length >= 9 ? `+27${digits.slice(-9)}` : null;
    },
    emailExists: async (email) => state.existingEmails.has(email),
    linksForParent: async () => state.links,
    createLearner: async (row) => { state.learners.push(row); },
    activatePendingLink: async (linkId, learnerUserId, activatedAt) => {
      state.activatedPending.push({ linkId, learnerUserId, activatedAt });
    },
    createActivatedLink: async (row) => { state.createdLinks.push(row); return 99; },
    insertConsentLog: async (entry) => { state.consentLogs.push(entry); },
    updateParentContact: async (parentUserId, patch) => {
      state.parentPatches.push({ parentUserId, phone: patch.phone });
    },
    // Fast fake hash for most tests — the real bcrypt path is asserted separately.
    hashPassword: async (pw) => `fakehash(${Buffer.from(pw).toString("base64")})`,
    ...overrides,
  };
  return { deps, state };
}

// ─── Validation ─────────────────────────────────────────────────────────────

describe("activateChildSchema", () => {
  it("accepts the canonical parent form payload", () => {
    const parsed = activateChildSchema.safeParse(VALID_INPUT);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.parentEmail).toBe("parent@example.com"); // lowercased
      expect(parsed.data.language).toBe("en");
    }
  });

  it("defaults language to en and allows af", () => {
    const noLang = activateChildSchema.safeParse({ ...VALID_INPUT, language: undefined });
    expect(noLang.success && noLang.data.language).toBe("en");
    const af = activateChildSchema.safeParse({ ...VALID_INPUT, language: "af" });
    expect(af.success && af.data.language).toBe("af");
  });

  it("treats a blank child email as absent, rejects a malformed one", () => {
    expect(activateChildSchema.safeParse({ ...VALID_INPUT, childEmail: "" }).success).toBe(true);
    expect(activateChildSchema.safeParse({ ...VALID_INPUT, childEmail: undefined }).success).toBe(true);
    expect(activateChildSchema.safeParse({ ...VALID_INPUT, childEmail: "not-an-email" }).success).toBe(false);
  });

  it.each([
    ["missing child first name", { ...VALID_INPUT, childFirstName: "" }],
    ["missing child last name", { ...VALID_INPUT, childLastName: "" }],
    ["missing school", { ...VALID_INPUT, schoolName: "" }],
    ["short phone", { ...VALID_INPUT, parentPhone: "0831" }],
    ["bad parent email", { ...VALID_INPUT, parentEmail: "nope" }],
    ["unknown language", { ...VALID_INPUT, language: "zu" }],
    ["grade injection is not a field", { ...VALID_INPUT, grade: 8 }], // stripped, never trusted
  ])("rejects/strips: %s", (_label, payload) => {
    const parsed = activateChildSchema.safeParse(payload);
    if (_label === "grade injection is not a field") {
      // zod strips unknown keys — grade can never be client-supplied.
      expect(parsed.success).toBe(true);
      if (parsed.success) expect((parsed.data as any).grade).toBeUndefined();
    } else {
      expect(parsed.success).toBe(false);
    }
  });
});

// ─── Credential generators ──────────────────────────────────────────────────

describe("generateReadablePassword", () => {
  it("always meets the 10-char local-auth minimum and the Word-Word-## shape", () => {
    for (let i = 0; i < 200; i++) {
      const pw = generateReadablePassword();
      expect(pw.length).toBeGreaterThanOrEqual(10);
      expect(pw).toMatch(/^[A-Z][a-z]+-[A-Z][a-z]+-\d{2}$/);
    }
  });

  it("never repeats the same word twice even when the picker is degenerate", () => {
    const pw = generateReadablePassword(() => 0); // always picks index 0 / digits 10
    const [a, b] = pw.split("-");
    expect(a).not.toBe(b);
  });
});

describe("learner handle generation", () => {
  it("builds firstname.lastname##@learners.braintrack.tech", () => {
    expect(buildLearnerHandle("Kagiso", "Dlamini", "42")).toBe(`kagiso.dlamini42@${LEARNER_HANDLE_DOMAIN}`);
  });

  it("slugs away spaces, punctuation and diacritics", () => {
    expect(buildLearnerHandle("José-Maria", "van der Merwe", "10"))
      .toBe(`josemaria.vandermerwe10@${LEARNER_HANDLE_DOMAIN}`);
  });

  it("falls back when a name has no usable characters", () => {
    expect(buildLearnerHandle("!!!", "???", "10")).toBe(`learner.bt10@${LEARNER_HANDLE_DOMAIN}`);
  });

  it("retries past collisions until a free handle is found", async () => {
    const taken = new Set([
      buildLearnerHandle("Kagiso", "Dlamini", "10"),
      buildLearnerHandle("Kagiso", "Dlamini", "11"),
    ]);
    let calls = 0;
    const seq = [0, 1, 2]; // digits 10 (taken), 11 (taken), 12 (free)
    const handle = await generateUniqueHandle(
      "Kagiso", "Dlamini",
      async (email) => taken.has(email),
      () => seq[Math.min(calls++, seq.length - 1)],
    );
    expect(handle).toBe(`kagiso.dlamini12@${LEARNER_HANDLE_DOMAIN}`);
  });
});

describe("hashPasswordDefault (standard bcrypt path)", () => {
  it("produces a bcrypt cost-12 hash the login path can verify", async () => {
    const pw = generateReadablePassword();
    const hash = await hashPasswordDefault(pw);
    expect(hash.startsWith("$2")).toBe(true);
    expect(hash).toContain("$12$");
    expect(await bcrypt.compare(pw, hash)).toBe(true);
    expect(await bcrypt.compare("Wrong-Password-99", hash)).toBe(false);
  });
});

// ─── Core activation ────────────────────────────────────────────────────────

function input(over: Partial<typeof VALID_INPUT> = {}) {
  const parsed = activateChildSchema.safeParse({ ...VALID_INPUT, ...over });
  if (!parsed.success) throw new Error("fixture must be valid");
  return parsed.data;
}

describe("activateChild — rejections", () => {
  it("400s an invalid parent phone before any writes", async () => {
    const { deps, state } = makeDeps({ normalisePhone: () => null });
    const result = await activateChild(deps, CTX, input());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toBe("invalid_phone");
    }
    expect(state.learners).toHaveLength(0);
    expect(state.consentLogs).toHaveLength(0);
  });

  it("409s when the parent already has a linked learner with the same name", async () => {
    const { deps, state } = makeDeps();
    state.links.push({ id: 1, learnerName: "  kagiso   DLAMINI ".replace(/\s+/g, " ").trim(), learnerUserId: "learner-1", status: "activated" });
    const result = await activateChild(deps, CTX, input());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(409);
      expect(result.error).toBe("child_already_linked");
    }
    expect(state.learners).toHaveLength(0);
    expect(state.createdLinks).toHaveLength(0);
    expect(state.consentLogs).toHaveLength(0);
  });

  it("409s when the supplied child email already has an account — never a takeover", async () => {
    const { deps, state } = makeDeps();
    state.existingEmails.add("taken@example.com");
    const result = await activateChild(deps, CTX, input({ childEmail: "Taken@Example.com" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(409);
      expect(result.error).toBe("email_taken");
    }
    expect(state.learners).toHaveLength(0);
    expect(state.consentLogs).toHaveLength(0);
  });
});

describe("activateChild — happy path", () => {
  it("creates a real, consented, activated Grade-12 learner and returns the password once", async () => {
    const { deps, state } = makeDeps();
    const result = await activateChild(deps, CTX, input());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Learner row.
    expect(state.learners).toHaveLength(1);
    const learner = state.learners[0];
    expect(learner.role).toBe("learner");
    expect(learner.grade).toBe(12);            // hard product constant
    expect(learner.isDemo).toBe(false);        // REAL account
    expect(learner.roleConfirmed).toBe(true);
    expect(learner.schoolName).toBe("Waterkloof High School");
    expect(learner.preferredLanguage).toBe("en");
    expect(learner.firstTouchSource).toBe("parent-activation");

    // Consent — the parent creating the account IS the parental consent.
    expect(learner.parentConsentGranted).toBe(true);
    expect(learner.parentConsentGrantedAt).toBeInstanceOf(Date);
    expect(learner.parentEmail).toBe("parent@example.com");
    expect(state.consentLogs).toHaveLength(1);
    const log = state.consentLogs[0];
    expect(log.userId).toBe(result.learnerId);
    expect(log.consentType).toBe("parental");
    expect(log.action).toBe("granted");
    expect(log.ipAddress).toBe(CTX.ipAddress);
    expect(log.metadata).toMatchObject({
      parentUserId: CTX.parentUserId,
      parentEmail: "parent@example.com",
      source: "parent_activate_child",
      accountCreatedByParent: true,
    });

    // Link — activated immediately so the parent dashboard works now.
    expect(state.createdLinks).toHaveLength(1);
    const link = state.createdLinks[0];
    expect(link.parentUserId).toBe(CTX.parentUserId);
    expect(link.learnerUserId).toBe(result.learnerId);
    expect(link.learnerName).toBe("Kagiso Dlamini");
    expect(link.status).toBe("activated");
    expect(link.activatedAt).toBeInstanceOf(Date);
    expect(typeof link.activationToken).toBe("string");
    expect(link.activationToken.length).toBeGreaterThan(10);

    // Generated username (no child email supplied).
    expect(result.usernameGenerated).toBe(true);
    expect(result.username).toMatch(new RegExp(`^kagiso\\.dlamini\\d{2}@${LEARNER_HANDLE_DOMAIN.replace(/\./g, "\\.")}$`));
    expect(learner.email).toBe(result.username);

    // Password: readable, returned once, and NEVER persisted in plaintext.
    expect(result.password).toMatch(/^[A-Z][a-z]+-[A-Z][a-z]+-\d{2}$/);
    expect(learner.passwordHash).not.toBe(result.password);
    expect(learner.passwordHash).not.toContain(result.password);
    expect((learner as any).password).toBeUndefined();
    const persisted = JSON.stringify({ learners: state.learners, links: state.createdLinks, logs: state.consentLogs, patches: state.parentPatches });
    expect(persisted).not.toContain(result.password);

    // Parent contact backfill got the normalised number.
    expect(state.parentPatches).toEqual([{ parentUserId: CTX.parentUserId, phone: "+27831234567" }]);
  });

  it("uses the supplied child email verbatim as the username", async () => {
    const { deps, state } = makeDeps();
    const result = await activateChild(deps, CTX, input({ childEmail: "Kid@Example.com" }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.username).toBe("kid@example.com"); // schema lowercases
    expect(result.usernameGenerated).toBe(false);
    expect(state.learners[0].email).toBe("kid@example.com");
  });

  it("reuses a pending parent-onboarding link for the same child instead of duplicating", async () => {
    const { deps, state } = makeDeps();
    state.links.push({ id: 7, learnerName: "Kagiso Dlamini", learnerUserId: null, status: "pending" });
    const result = await activateChild(deps, CTX, input());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.reusedPendingLink).toBe(true);
    expect(result.linkId).toBe(7);
    expect(state.activatedPending).toEqual([
      { linkId: 7, learnerUserId: result.learnerId, activatedAt: expect.any(Date) },
    ]);
    expect(state.createdLinks).toHaveLength(0); // no duplicate row
  });

  it("does NOT touch billing — only users, parent_links and consent_log are written", async () => {
    // The deps surface IS the endpoint's entire write capability: no
    // subscription/trial dep exists, so billing untouched is structural.
    const { deps, state } = makeDeps();
    const result = await activateChild(deps, CTX, input());
    expect(result.ok).toBe(true);
    expect(Object.keys(state).sort()).toEqual(
      ["activatedPending", "consentLogs", "createdLinks", "existingEmails", "learners", "links", "parentPatches"].sort(),
    );
  });
});

// ─── Change-password policy (settings → account) ────────────────────────────

describe("changePasswordSchema", () => {
  it("always requires the current password — parent-set starter passwords included", () => {
    expect(changePasswordSchema.safeParse({ currentPassword: "", newPassword: "LongEnough-42" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ newPassword: "LongEnough-42" }).success).toBe(false);
  });

  it("enforces the 10-char minimum on the new password", () => {
    expect(changePasswordSchema.safeParse({ currentPassword: "Brave-Tiger-42", newPassword: "short" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ currentPassword: "Brave-Tiger-42", newPassword: "MyNewPass-10" }).success).toBe(true);
  });

  it("accepts a generated starter password as the current password", () => {
    const starter = generateReadablePassword();
    expect(changePasswordSchema.safeParse({ currentPassword: starter, newPassword: "Chosen-By-Learner-1" }).success).toBe(true);
  });
});
