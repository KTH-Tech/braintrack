import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { storage } from "../../storage";
import { toPublicUser } from "@shared/models/auth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      // Never expose credential material or sensitive personal information to
      // the client. passwordHash is a bcrypt digest for native email+password
      // sign-in; idNumber is the learner's South African ID number (POPIA
      // sensitive personal information). Neither may leave the server, even
      // over an authenticated channel. toPublicUser() strips every field
      // listed in SENSITIVE_USER_FIELDS, so new sensitive columns are covered
      // by adding them there.
      const safeUser = user ? toPublicUser(user) : user;
      // Admin "Preview as learner" mode: session flag overrides the
      // client-facing role/onboarding flags without touching the DB.
      // Server permissions still read from the real DB row elsewhere.
      if (safeUser && safeUser.role === "admin" && req.session?.previewAsLearner) {
        return res.json({
          ...safeUser,
          role: "learner",
          roleConfirmed: true,
          _previewMode: true,
        });
      }
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout - destroy session, revoke all bearer-token refresh tokens for
  // this user, and redirect to landing page. Revoking the refresh tokens
  // closes the split-session gap: without this, a refresh token issued
  // earlier (via POST /api/auth/token) would stay valid for up to 7 days
  // after the user clicks "Sign out", allowing continued bearer access.
  app.get("/api/auth/logout", async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    if (userId) {
      try {
        await storage.revokeAllRefreshTokens(userId);
      } catch (err) {
        console.error("Failed to revoke refresh tokens on logout:", err);
        // Continue with session teardown either way — best-effort revoke
        // should never block the user from signing out of the browser.
      }
    }
    req.logout((err: any) => {
      if (err) {
        console.error("Logout error:", err);
      }
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.clearCookie("connect.sid");
        // Send a tiny HTML page that clears portal-scoped localStorage
        // (e.g. saved DBE Portal UI state) before forwarding to the
        // landing page. This covers the case where logout is reached
        // by direct navigation to /api/auth/logout from anywhere in
        // the app, not just the DBE Portal nav button.
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        res.status(200).send(`<!doctype html>
<html><head><meta charset="utf-8"><title>Signing out…</title>
<meta http-equiv="refresh" content="0;url=/"></head>
<body><script>
try { localStorage.removeItem("braintrack:dbe-portal:ui"); } catch (e) {}
window.location.replace("/");
</script></body></html>`);
      });
    });
  });
}
