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

/**
 * Change-password policy: the CURRENT password is always required — including
 * for parent-created learner accounts (the learner knows it: the parent handed
 * it over on the activation screen). New passwords follow the same 10-char
 * minimum as registration. Exported for tests/unit/parent-activation.test.ts.
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(200),
  newPassword: z
    .string()
    .min(10, "New password must be at least 10 characters")
    .max(200, "Password is too long"),
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

function publicUser(row: { id: string; email: string | null; firstName: string | null; lastName: string | null; role: string | null; roleConfirmed?: boolean | null }) {
  const role = row.role ?? "learner";
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    role,
    // MUST be included: the client (client/src/pages/signin.tsx onSuccess)
    // seeds the ["/api/auth/user"] react-query cache with this exact object,
    // and ProtectedRoute (client/src/App.tsx) gates on `roleConfirmed`. If it
    // is absent the seed reads `undefined` → ProtectedRoute hard-redirects the
    // just-authenticated user to /role-select, which then bounces back through
    // /dashboard, producing several full-page reloads ("redirect loop") before
    // the background /api/auth/user refetch finally lands the real value.
    // Admins bypass the roleConfirmed gate, so treat them as confirmed.
    roleConfirmed: role === "admin" ? true : (row.roleConfirmed ?? false),
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

      // SECURITY (account-takeover / admin-escalation fix, 2026-07):
      // Reject registration for ANY email that already has an account — not
      // only those with a passwordHash. Previously, an email that matched an
      // existing *passwordless* account (created via SMS onboarding, a
      // parent-created learner, a seed, or an external identity provider) had
      // the caller's password silently attached and was then logged in AS
      // that account — with no proof of email ownership. Because
      // enforceAdminAllowlist() runs immediately afterwards, registering with
      // a known allowlisted admin email (which are not secret) against a
      // passwordless admin row would hand the caller a full admin session.
      // For non-admins it exposed a minor's POPIA data to anyone who knew the
      // email. Attaching a local password to a pre-existing account must go
      // through an authenticated, email-verified "set password" flow instead
      // (not yet implemented). The response is uniform for every existing
      // account so this does not become an OIDC-vs-local enumeration oracle.
      if (existing) {
        return res.status(409).json({
          error: "email_in_use",
          message: "An account with that email already exists. Try signing in instead.",
        });
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

      const [created] = await db.insert(users)
        .values({ email, passwordHash, firstName, lastName, role })
        .returning({ id: users.id });
      const userId = created.id;

      const [row] = await db.select({
        id: users.id, email: users.email, firstName: users.firstName,
        lastName: users.lastName, role: users.role, roleConfirmed: users.roleConfirmed,
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
        role: users.role, roleConfirmed: users.roleConfirmed, passwordHash: users.passwordHash,
        isLocked: users.isLocked, lockedUntil: users.lockedUntil,
        failedLoginAttempts: users.failedLoginAttempts,
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

  // ── Change password ──────────────────────────────────────────────────────
  // Session-authenticated. Only for accounts with a local passwordHash (i.e.
  // native or parent-created accounts) — OIDC accounts have no password here.
  // Requires the current password; a parent-set starter password is still a
  // known password, so no bypass exists. Never logs or stores plaintext.
  app.post("/api/auth/change-password", authLimiter, async (req: Request, res: Response) => {
    const userId = (req as any).user?.claims?.sub as string | undefined;
    if (!(req as any).isAuthenticated?.() || !userId) {
      return res.status(401).json({ error: "unauthorized", message: "Please sign in first." });
    }

    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "invalid_input",
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      });
    }
    const { currentPassword, newPassword } = parsed.data;

    try {
      const [user] = await db.select({ id: users.id, passwordHash: users.passwordHash })
        .from(users).where(eq(users.id, userId));

      if (!user) return res.status(401).json({ error: "unauthorized", message: "Please sign in first." });
      if (!user.passwordHash) {
        return res.status(400).json({
          error: "no_local_password",
          message: "This account signs in without a password, so there is no password to change here.",
        });
      }

      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) {
        return res.status(401).json({
          error: "invalid_current_password",
          message: "Your current password is incorrect.",
        });
      }

      const newHash = await bcrypt.hash(newPassword, BCRYPT_COST);
      await db.update(users)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(users.id, userId));

      return res.json({ ok: true });
    } catch (err: any) {
      console.error("[local-auth] change-password failed:", err?.message ?? err);
      return res.status(500).json({ error: "server_error", message: "Could not change the password." });
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
