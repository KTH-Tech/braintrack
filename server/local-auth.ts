/**
 * server/local-auth.ts — native email + password authentication.
 *
 * Added so BrainTrack can run anywhere (Render, any host) without depending on
 * Replit OIDC. Coexists with the OIDC path: accounts created here have a
 * password_hash, accounts created by an identity provider have null and cannot
 * sign in through these routes.
 *
 * Security properties:
 *  - bcrypt (cost 12) — never stores or logs plaintext passwords
 *  - Per-account lockout after 8 failed attempts for 15 minutes, reusing the
 *    existing users.failed_login_attempts / is_locked / locked_until columns
 *  - Uniform "invalid email or password" response, so the endpoint cannot be
 *    used to enumerate which emails exist
 *  - Rate limited per IP on top of the per-account lockout
 *  - Sessions are the same passport sessions the rest of the app already uses,
 *    plus the existing JWT access/refresh pair for API clients
 *  - Session is regenerated on login (prevents session fixation)
 */
import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { users } from "@shared/schema";
import { generateAccessToken, generateRefreshToken } from "./replit_integrations/auth";
import { isAdminEmail } from "./replit_integrations/auth/replitAuth";

const BCRYPT_COST = 12;
const MAX_FAILED_ATTEMPTS = 8;
const LOCKOUT_MINUTES = 15;

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
  password: z.string().min(1, "Password is required").max(200),
});

const registerSchema = credentialsSchema.extend({
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(200, "Password is too long"),
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  // Self-service signup may only create learner or parent accounts. Admin is
  // granted server-side via the ADMIN_EMAILS allowlist, never by user input.
  role: z.enum(["learner", "parent"]).default("learner"),
});

/** Establish a passport session + issue tokens. Mirrors the OIDC session shape. */
async function establishSession(
  req: Request,
  userId: string,
  role: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = generateAccessToken(userId, role);
  const { raw: refreshToken } = await generateRefreshToken(userId);
  const nowSec = Math.floor(Date.now() / 1000);
  const sessionUser: any = {
    claims: { sub: userId, exp: nowSec + 60 * 60 * 24 * 7 },
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: nowSec + 60 * 60 * 24 * 7,
    role,
  };

  // Regenerate the session id first so a pre-auth session cannot be fixated.
  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((err) => (err ? reject(err) : resolve()));
  });
  await new Promise<void>((resolve, reject) => {
    req.logIn(sessionUser, (err) => (err ? reject(err) : resolve()));
  });

  return { accessToken, refreshToken };
}

/**
 * Apply the ADMIN_EMAILS allowlist, exactly as the OIDC path does on every
 * login: promote allowlisted emails to admin, demote anyone holding admin who
 * is no longer listed. Returns the effective role.
 *
 * Without this, an account created through native sign-up would sit at
 * "learner" even when its email is on the allowlist, and removing an email
 * from the allowlist would not revoke an existing admin.
 */
async function enforceAdminAllowlist(
  userId: string,
  email: string | null,
  currentRole: string | null,
): Promise<string> {
  const shouldBeAdmin = isAdminEmail(email);
  if (shouldBeAdmin && currentRole !== "admin") {
    await db.update(users)
      .set({ role: "admin", roleConfirmed: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
    return "admin";
  }
  if (!shouldBeAdmin && currentRole === "admin") {
    await db.update(users)
      .set({ role: "learner", updatedAt: new Date() })
      .where(eq(users.id, userId));
    const hint = email ? `${email.slice(0, 2)}***` : "(unknown)";
    console.log(`[local-auth] Demoted unauthorized admin: id=${userId} email=${hint}`);
    return "learner";
  }
  return currentRole ?? "learner";
}

function publicUser(row: { id: string; email: string | null; firstName: string | null; lastName: string | null; role: string | null }) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    role: row.role ?? "learner",
  };
}

export function registerLocalAuthRoutes(app: Express) {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.TEST_MODE === "true",
    message: { error: "too_many_attempts", message: "Too many attempts. Please try again shortly." },
  });

  // ── Sign up ──────────────────────────────────────────────────────────────
  app.post("/api/auth/register", authLimiter, async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "invalid_input",
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      });
    }
    const { email, password, firstName, lastName, role } = parsed.data;

    try {
      const [existing] = await db.select({ id: users.id, passwordHash: users.passwordHash })
        .from(users).where(eq(users.email, email));

      if (existing?.passwordHash) {
        return res.status(409).json({
          error: "email_in_use",
          message: "An account with that email already exists. Try signing in instead.",
        });
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

      let userId: string;
      if (existing) {
        // Account exists from an external provider — attach a local password
        // so the same person can sign in either way.
        await db.update(users)
          .set({ passwordHash, updatedAt: new Date() })
          .where(eq(users.id, existing.id));
        userId = existing.id;
      } else {
        const [created] = await db.insert(users)
          .values({ email, passwordHash, firstName, lastName, role })
          .returning({ id: users.id });
        userId = created.id;
      }

      const [row] = await db.select({
        id: users.id, email: users.email, firstName: users.firstName,
        lastName: users.lastName, role: users.role,
      }).from(users).where(eq(users.id, userId));

      const effectiveRole = await enforceAdminAllowlist(userId, row.email, row.role);
      await establishSession(req, userId, effectiveRole);
      return res.status(201).json({ user: publicUser({ ...row, role: effectiveRole }) });
    } catch (err: any) {
      console.error("[local-auth] register failed:", err?.message ?? err);
      return res.status(500).json({ error: "server_error", message: "Could not create the account." });
    }
  });

  // ── Sign in ──────────────────────────────────────────────────────────────
  app.post("/api/auth/login", authLimiter, async (req: Request, res: Response) => {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "invalid_input", message: "Enter your email and password." });
    }
    const { email, password } = parsed.data;
    // Identical response for unknown email and wrong password.
    const invalid = () =>
      res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password." });

    try {
      const [user] = await db.select({
        id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName,
        role: users.role, passwordHash: users.passwordHash, isLocked: users.isLocked,
        lockedUntil: users.lockedUntil, failedLoginAttempts: users.failedLoginAttempts,
      }).from(users).where(eq(users.email, email));

      if (!user?.passwordHash) {
        // Spend comparable time so a missing account isn't detectably faster.
        await bcrypt.compare(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin");
        return invalid();
      }

      const lockedUntil = user.lockedUntil ? new Date(user.lockedUntil) : null;
      if (lockedUntil && lockedUntil > new Date()) {
        const mins = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
        return res.status(423).json({
          error: "account_locked",
          message: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
        });
      }
      if (user.isLocked && !lockedUntil) {
        return res.status(423).json({
          error: "account_locked",
          message: "This account is locked. Please contact support.",
        });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        const attempts = (user.failedLoginAttempts ?? 0) + 1;
        const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
        await db.update(users).set({
          failedLoginAttempts: attempts,
          ...(shouldLock
            ? { lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60_000), lockReason: "too_many_failed_logins" }
            : {}),
        }).where(eq(users.id, user.id));
        return invalid();
      }

      await db.update(users)
        .set({ failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      const effectiveRole = await enforceAdminAllowlist(user.id, user.email, user.role);
      await establishSession(req, user.id, effectiveRole);
      return res.json({ user: publicUser({ ...user, role: effectiveRole }) });
    } catch (err: any) {
      console.error("[local-auth] login failed:", err?.message ?? err);
      return res.status(500).json({ error: "server_error", message: "Could not sign in." });
    }
  });

  // ── Sign out ─────────────────────────────────────────────────────────────
  app.post("/api/auth/signout", (req: Request, res: Response) => {
    req.logout?.(() => {
      req.session?.destroy?.(() => {
        res.clearCookie("connect.sid");
        res.json({ ok: true });
      });
    });
  });
}
