import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { pool } from "../../db";
import { authStorage } from "./storage";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "crypto";
import { storage } from "../../storage";

const _sessionBase = process.env.SESSION_SECRET ?? (() => {
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set in production");
  console.warn("[auth] SESSION_SECRET not set — using insecure dev fallback. Set SESSION_SECRET env var.");
  return "dev-session-secret";
})();
const JWT_SECRET_BASE = createHash("sha256").update(_sessionBase + ":jwt").digest("hex");
const JWT_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

// ============================================
// SIGNING KEY ROTATION (T018)
// ============================================
// Active signing key — starts as the base secret.
// Calling rotateSigningKey() appends a random suffix, invalidating all previously
// issued JWTs without requiring a server restart.
let activeSigningKey = JWT_SECRET_BASE;

export function rotateSigningKey(): string {
  const suffix = randomBytes(16).toString("hex");
  activeSigningKey = `${JWT_SECRET_BASE}:rotated:${suffix}`;
  return activeSigningKey;
}

export function getActiveSigningKey(): string {
  return activeSigningKey;
}

// ============================================
// JWT HELPERS
// ============================================

export function generateAccessToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, activeSigningKey, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAccessToken(token: string): { sub: string; role: string } | null {
  try {
    const payload = jwt.verify(token, activeSigningKey) as jwt.JwtPayload;
    if (typeof payload.sub === "string" && typeof payload.role === "string") {
      return { sub: payload.sub, role: payload.role };
    }
    return null;
  } catch {
    return null;
  }
}

export async function generateRefreshToken(userId: string): Promise<{ raw: string; hash: string; expiresAt: Date }> {
  const raw = randomBytes(64).toString("hex");
  const hash = createHash("sha256").update(raw).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await storage.createRefreshToken(userId, hash, expiresAt);
  return { raw, hash, expiresAt };
}

export async function rotateRefreshToken(oldRawToken: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date } | null> {
  const oldHash = createHash("sha256").update(oldRawToken).digest("hex");

  // Atomic compare-and-swap: only one concurrent caller can win the UPDATE.
  // If the token was already revoked or expired, revokeRefreshTokenAtomic returns
  // undefined and we reject immediately — no race window exists.
  const existing = await storage.revokeRefreshTokenAtomic(oldHash);
  if (!existing) {
    return null;
  }

  // Issue new tokens for the winning caller
  const user = await authStorage.getUser(existing.userId);
  if (!user) return null;

  const accessToken = generateAccessToken(existing.userId, user.role || "learner");
  const { raw: newRaw, expiresAt } = await generateRefreshToken(existing.userId);

  return { accessToken, refreshToken: newRaw, expiresAt };
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  (sessionStore as any).on?.("error", (err: Error) => {
    console.error("[session-store] DB error (non-fatal):", err.message);
  });
  const isProd = process.env.NODE_ENV === "production";
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

// === Admin email allowlist =================================================
// Only emails on this list may hold the "admin" role. Configurable via the
// ADMIN_EMAILS env var (comma-separated). Defaults to the project owner.
export const ADMIN_EMAIL_ALLOWLIST: string[] = (
  process.env.ADMIN_EMAILS ?? "karlit@kthtech.co.za,kreativethinkinghub@gmail.com"
)
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAIL_ALLOWLIST.includes(email.toLowerCase());
}

async function upsertUser(claims: any) {
  const email: string | undefined = claims["email"];
  await authStorage.upsertUser({
    id: claims["sub"],
    email,
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });

  // Enforce admin-email allowlist on every login.
  // - If the email IS on the allowlist → ensure role is "admin".
  // - If the email is NOT on the allowlist and the user currently holds the
  //   admin role → demote to "learner".
  try {
    const existing = await authStorage.getUser(claims["sub"]);
    if (existing) {
      if (isAdminEmail(email)) {
        if (existing.role !== "admin") {
          const { db } = await import("../../db");
          const { users } = await import("@shared/schema");
          const { eq } = await import("drizzle-orm");
          await db.update(users).set({ role: "admin", roleConfirmed: true, updatedAt: new Date() }).where(eq(users.id, claims["sub"]));
        }
      } else if (existing.role === "admin") {
        const { db } = await import("../../db");
        const { users } = await import("@shared/schema");
        const { eq } = await import("drizzle-orm");
        await db.update(users).set({ role: "learner", updatedAt: new Date() }).where(eq(users.id, claims["sub"]));
        const emailHint = email ? `${email.slice(0, 2)}***` : "(unknown)";
        console.log(`[auth] Demoted unauthorized admin: id=${claims["sub"]} email=${emailHint}`);
      }
    }
  } catch (e: any) {
    console.error("[auth] Admin allowlist enforcement failed:", e?.message);
  }

  // Reset login failure counter on successful authentication
  await authStorage.resetLoginFailures(claims["sub"]);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Replit OIDC needs REPL_ID. Outside Replit (e.g. Render) it is absent, and
  // calling discovery() with an undefined client id throws and kills the boot.
  // Sessions/passport are installed above, so every non-OIDC route — including
  // the JWT refresh path — keeps working; only interactive Replit sign-in is
  // disabled, and /api/login reports that instead of 500-ing.
  if (!process.env.REPL_ID) {
    console.warn(
      "[auth] REPL_ID not set — Replit OIDC sign-in disabled. Set REPL_ID + " +
        "REPLIT_DOMAINS to enable it, or configure an alternative auth provider.",
    );
    app.get("/api/login", (_req, res) => {
      res.status(503).json({
        error: "sign_in_unavailable",
        message: "Interactive sign-in is not configured on this deployment yet.",
      });
    });
    app.get("/api/callback", (_req, res) => res.redirect("/"));
    app.get("/api/auth/logout", (req: any, res) => {
      if (req.session?.destroy) req.session.destroy(() => res.redirect("/"));
      else res.redirect("/");
    });
    return;
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    const returnTo = req.query.returnTo as string | undefined;
    if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
      (req.session as any).returnTo = returnTo;
    }
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", async (req: any, res) => {
    // Revoke all bearer-token refresh tokens for this user before tearing
    // down the OIDC session. Without this, a refresh token issued earlier
    // (via POST /api/auth/token) would stay valid for up to 7 days after
    // the user clicks Sign out, leaving a residual bearer session alive.
    const userId = req.user?.claims?.sub;
    if (userId) {
      try {
        await storage.revokeAllRefreshTokens(userId);
      } catch (err) {
        console.error("Failed to revoke refresh tokens on /api/logout:", err);
        // Best-effort — never block the user from signing out of the browser.
      }
    }
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });

  // ============================================
  // JWT REFRESH ENDPOINT
  // ============================================

  app.post("/api/auth/refresh", async (req: any, res) => {
    try {
      const rawToken = req.body?.refreshToken || req.cookies?.refreshToken;
      if (!rawToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }

      const result = await rotateRefreshToken(rawToken);
      if (!result) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
      }

      res.json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(500).json({ message: "Failed to refresh token" });
    }
  });

  // ============================================
  // JWT LOGOUT ENDPOINT (revokes refresh token)
  // ============================================

  app.post("/api/auth/logout", async (req: any, res) => {
    try {
      const rawToken = req.body?.refreshToken || req.cookies?.refreshToken;
      let userIdFromToken: string | undefined;
      if (rawToken) {
        const hash = createHash("sha256").update(rawToken).digest("hex");
        // Look up the token row BEFORE revoking so we know which user it
        // belongs to even if the caller isn't otherwise authenticated.
        // Then bulk-revoke every refresh token for that user so a logout
        // here matches the boundary enforced by GET /api/auth/logout and
        // GET /api/logout — no surviving refresh tokens for the account.
        const row = await storage.getRefreshTokenByHash(hash);
        if (row?.userId) userIdFromToken = row.userId;
        await storage.revokeRefreshToken(hash);
      }

      const userId = req.user?.claims?.sub || userIdFromToken;
      if (userId) {
        try {
          await storage.revokeAllRefreshTokens(userId);
        } catch (err) {
          console.error("Failed to bulk-revoke refresh tokens on POST /api/auth/logout:", err);
        }
      }

      // Also destroy the session
      req.logout((err: any) => {
        if (err) console.error("Logout session error:", err);
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // ============================================
  // ISSUE JWT TOKENS ENDPOINT (after OIDC login)
  // ============================================

  app.post("/api/auth/token", isAuthenticated, async (req: any, res) => {
    try {
      // Session-auth only: refuse to mint a fresh refresh-token chain to a
      // caller who is only proving identity with a Bearer JWT. Otherwise a
      // surviving (un-expired) access token could be used after the user
      // clicks Sign out (which revokes refresh tokens) to re-establish a
      // brand-new 7-day refresh token, defeating the logout boundary.
      if (req.user?._jwtAuth === true) {
        return res.status(403).json({ message: "Bearer-authenticated callers cannot issue new tokens. Sign in via the browser session." });
      }
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await authStorage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const accessToken = generateAccessToken(userId, user.role || "learner");
      const { raw: refreshToken, expiresAt } = await generateRefreshToken(userId);

      res.json({ accessToken, refreshToken, expiresAt });
    } catch (error) {
      console.error("Token issuance error:", error);
      res.status(500).json({ message: "Failed to issue token" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // ── 1. Try Bearer JWT first ──────────────────────────────────────────────
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    if (payload) {
      // Check account lockout
      const lockStatus = await authStorage.isAccountLocked(payload.sub);
      if (lockStatus.locked) {
        const minutesRemaining = lockStatus.lockedUntil
          ? Math.ceil((lockStatus.lockedUntil.getTime() - Date.now()) / 60000)
          : 15;
        return res.status(423).json({
          message: "Account temporarily locked due to multiple failed login attempts. Please try again later.",
          lockedUntil: lockStatus.lockedUntil,
          minutesRemaining,
        });
      }

      // Attach a synthetic user object so route handlers work unchanged
      (req as any).user = {
        claims: { sub: payload.sub },
        role: payload.role,
        _jwtAuth: true,
      };
      return next();
    }
    // Invalid JWT — fall through to session check
  }

  // ── 2. Fall back to OIDC session ────────────────────────────────────────
  const user = req.user as any;

  if (typeof req.isAuthenticated !== "function" || !req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    // Check account lockout status before allowing access
    const userId = user.claims?.sub;
    if (userId) {
      const lockStatus = await authStorage.isAccountLocked(userId);
      if (lockStatus.locked) {
        const minutesRemaining = lockStatus.lockedUntil
          ? Math.ceil((lockStatus.lockedUntil.getTime() - Date.now()) / 60000)
          : 15;
        return res.status(423).json({
          message: "Account temporarily locked due to multiple failed login attempts. Please try again later.",
          lockedUntil: lockStatus.lockedUntil,
          minutesRemaining,
        });
      }
    }
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);

    // Check account lockout status after token refresh too
    const userId = user.claims?.sub;
    if (userId) {
      const lockStatus = await authStorage.isAccountLocked(userId);
      if (lockStatus.locked) {
        const minutesRemaining = lockStatus.lockedUntil
          ? Math.ceil((lockStatus.lockedUntil.getTime() - Date.now()) / 60000)
          : 15;
        return res.status(423).json({
          message: "Account temporarily locked due to multiple failed login attempts. Please try again later.",
          lockedUntil: lockStatus.lockedUntil,
          minutesRemaining,
        });
      }
    }

    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
