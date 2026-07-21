/**
 * server/parent-activation.ts — parent-driven learner account activation.
 *
 * Launch flow: a signed-in PARENT fills a short form (their cell + email, the
 * child's name and school) and the child's learner account is created and
 * activated immediately. The generated password is returned ONCE in the
 * creation response so the parent can hand it to the child on screen — it is
 * never stored, logged, emailed or SMS'd anywhere.
 *
 * Compliance (POPIA): the parent creating the account IS the parental consent.
 * The learner row is created with parentConsentGranted = true +
 * parentConsentGrantedAt, and a consent_log entry (consentType "parental") is
 * written with metadata recording that the account was parent-created.
 *
 * Billing is deliberately NOT touched here — no subscription, no trial. The
 * existing subscribe/trial + card-capture flow owns billing (a minor cannot
 * self-activate billing), so a freshly activated learner hits those gates
 * exactly like every other account.
 *
 * The core logic takes its side effects through `ActivationDeps` so
 * tests/unit/parent-activation.test.ts can pin the contract down without a
 * database. The real deps are built in server/routes.ts at the
 * POST /api/parent/activate-child handler.
 */
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomInt, randomUUID } from "crypto";

/** Same cost as server/local-auth.ts — the one standard hashing path. */
const BCRYPT_COST = 12;

// ─── Input validation ───────────────────────────────────────────────────────

export const activateChildSchema = z.object({
  /** The PARENT's cell number (not the child's). Normalised server-side. */
  parentPhone: z.string().trim().min(9).max(20),
  parentEmail: z.string().trim().toLowerCase().email().max(200),
  childFirstName: z.string().trim().min(1).max(80),
  childLastName: z.string().trim().min(1).max(80),
  /** Optional — when blank a login handle is generated (never mailed). */
  childEmail: z.string().trim().toLowerCase().email().max(200).optional().or(z.literal("")),
  schoolName: z.string().trim().min(1).max(200),
  /** Present only when the parent picked a partner school from the search. */
  schoolId: z.number().int().positive().nullable().optional(),
  language: z.enum(["en", "af"]).default("en"),
});

export type ActivateChildInput = z.infer<typeof activateChildSchema>;

// ─── Credential generation ──────────────────────────────────────────────────

/**
 * Readable Word-Word-## passwords. Every word is 4–6 letters so the shortest
 * possible result ("Bold-Wave-10", 12 chars) clears the 10-char minimum that
 * server/local-auth.ts enforces. Two words + 2 digits from a 48-word list is
 * ~4.4M combinations behind bcrypt cost 12 AND the existing per-account
 * lockout (8 attempts / 15 min) + IP rate limiting — and the learner is told
 * to change it at first sign-in.
 */
const PASSWORD_WORDS = [
  "Amber", "Bold", "Brave", "Bright", "Cedar", "Clever", "Cloud", "Comet",
  "Coral", "Crane", "Delta", "Eagle", "Ember", "Falcon", "Flame", "Gecko",
  "Grand", "Happy", "Karoo", "Lion", "Lucky", "Lunar", "Mango", "Maple",
  "Noble", "Ocean", "Orbit", "Pilot", "Prime", "Proud", "Quick", "Rapid",
  "River", "Rocket", "Royal", "Sharp", "Solar", "Spark", "Storm", "Sunny",
  "Swift", "Tiger", "Topaz", "Ultra", "Vivid", "Wave", "Wise", "Zebra",
] as const;

/** `pick(n)` must return a uniform integer in [0, n). Injectable for tests. */
export function generateReadablePassword(pick: (n: number) => number = randomInt): string {
  const first = PASSWORD_WORDS[pick(PASSWORD_WORDS.length)];
  let second = PASSWORD_WORDS[pick(PASSWORD_WORDS.length)];
  if (second === first) {
    second = PASSWORD_WORDS[(PASSWORD_WORDS.indexOf(second) + 7) % PASSWORD_WORDS.length];
  }
  const digits = 10 + pick(90); // 10–99, always two digits
  return `${first}-${second}-${digits}`;
}

/** The standard hashing path (bcrypt cost 12) — same as local-auth. */
export function hashPasswordDefault(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

// ─── Login-handle generation ────────────────────────────────────────────────

/**
 * Children without an email get a login identifier of the form
 * `firstname.lastname##@learners.braintrack.tech`. It satisfies the email
 * shape local-auth's sign-in expects but is NEVER mailed — the domain exists
 * purely as a namespace for generated handles.
 */
export const LEARNER_HANDLE_DOMAIN = "learners.braintrack.tech";

function slugName(raw: string, fallback: string): string {
  const slug = raw
    .toLowerCase()
    .normalize("NFKD")
    // strip combining diacritics left by NFKD (José → jose)
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
  return slug || fallback;
}

export function buildLearnerHandle(firstName: string, lastName: string, digits: string): string {
  return `${slugName(firstName, "learner")}.${slugName(lastName, "bt")}${digits}@${LEARNER_HANDLE_DOMAIN}`;
}

/**
 * Collision-checked handle generation. Two random digits give 90 slots per
 * name; if an improbably popular name exhausts the retries we widen to four
 * digits rather than fail the parent at the counter.
 */
export async function generateUniqueHandle(
  firstName: string,
  lastName: string,
  emailExists: (email: string) => Promise<boolean>,
  pick: (n: number) => number = randomInt,
): Promise<string> {
  for (let attempt = 0; attempt < 25; attempt++) {
    const handle = buildLearnerHandle(firstName, lastName, String(10 + pick(90)));
    if (!(await emailExists(handle))) return handle;
  }
  for (let attempt = 0; attempt < 25; attempt++) {
    const handle = buildLearnerHandle(firstName, lastName, String(1000 + pick(9000)));
    if (!(await emailExists(handle))) return handle;
  }
  throw new Error("could_not_allocate_handle");
}

// ─── Core activation ────────────────────────────────────────────────────────

export interface ParentLinkRow {
  id: number;
  learnerName: string | null;
  learnerUserId: string | null;
  status: string | null;
}

/** The exact row shape written to `users` — note: passwordHash only, never plaintext. */
export interface NewLearnerRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "learner";
  roleConfirmed: boolean;
  grade: number;
  schoolId: number | null;
  schoolName: string;
  preferredLanguage: "en" | "af";
  parentEmail: string;
  parentConsentGranted: boolean;
  parentConsentGrantedAt: Date;
  passwordHash: string;
  firstTouchSource: string;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentLogEntry {
  userId: string;
  consentType: "parental";
  action: "granted";
  version: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
}

export interface ActivationDeps {
  /** Returns the normalised SA cell (E.164-ish) or null when invalid. */
  normalisePhone(raw: string): string | null;
  emailExists(email: string): Promise<boolean>;
  linksForParent(parentUserId: string): Promise<ParentLinkRow[]>;
  createLearner(row: NewLearnerRow): Promise<void>;
  /** Attach the new learner to an existing pending parent_links row. */
  activatePendingLink(linkId: number, learnerUserId: string, activatedAt: Date): Promise<void>;
  createActivatedLink(row: {
    parentUserId: string;
    learnerUserId: string;
    activationToken: string;
    learnerName: string;
    status: "activated";
    activatedAt: Date;
  }): Promise<number>;
  insertConsentLog(entry: ConsentLogEntry): Promise<void>;
  /** Fill the parent's own cell number if their profile is missing one. */
  updateParentContact(parentUserId: string, patch: { phone: string }): Promise<void>;
  /** Defaults to bcrypt cost 12 (hashPasswordDefault) when omitted. */
  hashPassword?(password: string): Promise<string>;
  /** Defaults to crypto.randomUUID when omitted. */
  newId?(): string;
}

export type ActivateChildResult =
  | { ok: false; status: 400 | 409; error: string; message: string }
  | {
      ok: true;
      learnerId: string;
      /** The login identifier — child's own email or the generated handle. */
      username: string;
      /**
       * PLAINTEXT password — exists only in this in-memory result so the
       * creation response can show it once. Callers must never persist or
       * log it.
       */
      password: string;
      usernameGenerated: boolean;
      linkId: number;
      reusedPendingLink: boolean;
    };

export async function activateChild(
  deps: ActivationDeps,
  ctx: { parentUserId: string; ipAddress: string | null; userAgent: string | null },
  input: ActivateChildInput,
): Promise<ActivateChildResult> {
  const hash = deps.hashPassword ?? hashPasswordDefault;
  const newId = deps.newId ?? randomUUID;

  const parentPhone = deps.normalisePhone(input.parentPhone);
  if (!parentPhone) {
    return {
      ok: false, status: 400, error: "invalid_phone",
      message: "Please enter a valid South African cell number.",
    };
  }

  const childFullName = `${input.childFirstName} ${input.childLastName}`.trim();
  const nameKey = childFullName.toLowerCase();

  // Duplicate protection 1 — this parent already has a linked learner with
  // the same name. 409 rather than silently creating a second account.
  const links = await deps.linksForParent(ctx.parentUserId);
  const alreadyLinked = links.find(
    (l) => l.learnerUserId && (l.learnerName ?? "").trim().toLowerCase() === nameKey,
  );
  if (alreadyLinked) {
    return {
      ok: false, status: 409, error: "child_already_linked",
      message: `${childFullName} is already linked to your account. Check your parent dashboard — if this is a different child, add a second name or initial.`,
    };
  }

  // Login identity — the child's own email when supplied, else a generated
  // handle. Duplicate protection 2 — a supplied email that already has an
  // account is a 409, never a takeover.
  const suppliedEmail = (input.childEmail ?? "").trim().toLowerCase();
  let username: string;
  let usernameGenerated = false;
  if (suppliedEmail) {
    if (await deps.emailExists(suppliedEmail)) {
      return {
        ok: false, status: 409, error: "email_taken",
        message: "An account with that email already exists. Leave the email blank to generate a username, or sign the learner in instead.",
      };
    }
    username = suppliedEmail;
  } else {
    username = await generateUniqueHandle(input.childFirstName, input.childLastName, deps.emailExists);
    usernameGenerated = true;
  }

  const password = generateReadablePassword();
  const passwordHash = await hash(password);
  const now = new Date();
  const learnerId = newId();

  // The learner row: consent granted at creation (the parent doing this IS
  // the consent), REAL account (isDemo false), Grade 12 by product definition.
  await deps.createLearner({
    id: learnerId,
    email: username,
    firstName: input.childFirstName,
    lastName: input.childLastName,
    role: "learner",
    roleConfirmed: true,
    grade: 12,
    schoolId: input.schoolId ?? null,
    schoolName: input.schoolName,
    preferredLanguage: input.language,
    parentEmail: input.parentEmail,
    parentConsentGranted: true,
    parentConsentGrantedAt: now,
    passwordHash,
    firstTouchSource: "parent-activation",
    isDemo: false,
    createdAt: now,
    updatedAt: now,
  });

  // Parent link — activated immediately so the parent dashboard works now.
  // If parent onboarding already left a pending link with this child's name,
  // attach to it instead of creating a duplicate row.
  const pending = links.find(
    (l) => !l.learnerUserId && (l.learnerName ?? "").trim().toLowerCase() === nameKey,
  );
  let linkId: number;
  if (pending) {
    await deps.activatePendingLink(pending.id, learnerId, now);
    linkId = pending.id;
  } else {
    linkId = await deps.createActivatedLink({
      parentUserId: ctx.parentUserId,
      learnerUserId: learnerId,
      activationToken: newId(),
      learnerName: childFullName,
      status: "activated",
      activatedAt: now,
    });
  }

  // POPIA audit — parental consent granted by the parent creating the account.
  await deps.insertConsentLog({
    userId: learnerId,
    consentType: "parental",
    action: "granted",
    version: "1.0",
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    metadata: {
      parentUserId: ctx.parentUserId,
      parentEmail: input.parentEmail,
      parentPhone,
      source: "parent_activate_child",
      accountCreatedByParent: true,
    },
  });

  await deps.updateParentContact(ctx.parentUserId, { phone: parentPhone });

  return { ok: true, learnerId, username, password, usernameGenerated, linkId, reusedPendingLink: !!pending };
}
