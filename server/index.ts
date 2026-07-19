import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { ZodError } from "zod";
import helmet from "helmet";
import compression from "compression";
import hpp from "hpp";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { initSocket } from "./socket";

process.on("uncaughtException", (err) => {
  console.error("[FATAL] uncaughtException:", err?.stack || err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] unhandledRejection:", reason);
});
process.on("SIGTERM", () => {
  console.log("[SIGNAL] SIGTERM received — graceful shutdown initiated");
});
process.on("SIGHUP", () => {
  console.log("[SIGNAL] SIGHUP received");
});

// Task #394 — Production Hardening: boot-time env validation.
// REQUIRED_ENV_VARS are mandatory in every environment (dev + prod).
// REQUIRED_PROD_ENV_VARS additionally fail the boot in production.
// RECOMMENDED_PROD_ENV_VARS warn loudly but do not crash, so a partial
// deploy isn't blocked by an optional integration that's not configured yet.
const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "SESSION_SECRET",
];

const REQUIRED_PROD_ENV_VARS: string[] = [
  "ADMIN_EMAILS",                       // admin allowlist (comma-separated)
  "AI_INTEGRATIONS_OPENAI_API_KEY",     // Smart Tutor + memo helpers
];

// REPL_ID / REPLIT_DOMAINS were prod-required because Replit OIDC was the only
// login path. The app now also deploys to Render, where those don't exist —
// so they warn instead of crashing the boot. Replit OIDC login is disabled
// when they're absent; every other route works. Set them (plus a real REPL_ID
// from the Repl) to re-enable OIDC sign-in.
const RECOMMENDED_PROD_ENV_VARS: string[] = [
  "REPL_ID",
  "REPLIT_DOMAINS",
  "YOCO_SECRET_KEY",
  "YOCO_WEBHOOK_SECRET",
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
];

function validateEnvironment() {
  const missing: string[] = [];
  const missingRecommended: string[] = [];
  const isProd = process.env.NODE_ENV === "production";

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (isProd) {
    for (const envVar of REQUIRED_PROD_ENV_VARS) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }
    for (const envVar of RECOMMENDED_PROD_ENV_VARS) {
      if (!process.env[envVar]) {
        missingRecommended.push(envVar);
      }
    }
  }

  if (missingRecommended.length > 0) {
    console.warn(
      `[WARN] Missing recommended production env vars (feature will be disabled): ${missingRecommended.join(", ")}`
    );
  }

  if (missing.length > 0) {
    console.error(
      `[FATAL] Missing required environment variables: ${missing.join(", ")}\n` +
      `Server cannot start without these variables. Please configure them and restart.\n` +
      `See docs/admin-routes-audit.md for the full env checklist.`
    );
    process.exit(1);
  }
}

validateEnvironment();

const app = express();

// Ultra-fast health check — registered BEFORE any middleware so it responds
// instantly during cold starts and even if downstream init is still running.
// Used by Replit Autoscale health probes to avoid false-positive outages.
app.get("/healthz", (_req, res) => {
  res.status(200).type("text/plain").send("ok");
});

// Trust exactly one proxy hop. In the Cloudflare → Render chain, Cloudflare
// writes the real client IP into CF-Connecting-IP and X-Forwarded-For, and
// Render's load balancer appends one entry — so hop count 1 yields the correct
// client IP for req.ip. NOTE: this is only spoof-resistant if the origin is
// locked to Cloudflare's IP ranges (CLOUDFLARE.md §6); otherwise an attacker
// hitting the Render origin directly can forge these headers. Security-critical
// rate limiters use clientIp() (prefers CF-Connecting-IP) in routes.ts.
app.set("trust proxy", 1);

// ── Dev-only: local role picker instead of Replit OIDC ──────────────────────
// Locally there is no real Replit OIDC client (REPL_ID is the "local-preview"
// stub), so any redirect to /api/login would dead-end at Replit's
// "invalid client" error. Intercept it before the auth routes register and
// offer the seeded test roles instead. Never active in production.
// Dev-only: serve a self-destructing service worker. Browsers re-fetch
// /sw.js on every navigation (spec bypasses HTTP cache), so any client stuck
// with an OLD cached SW picks this up, which clears all caches, unregisters
// itself, and reloads open tabs — breaking the stale-bundle trap without the
// user having to dig through DevTools. Production still serves the real sw.js
// from client/public.
if (process.env.NODE_ENV !== "production") {
  app.get("/sw.js", (_req, res) => {
    res.status(200).type("application/javascript").set("Cache-Control", "no-store").send(
      `self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',(e)=>{e.waitUntil((async()=>{
  try{const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)));}catch{}
  try{await self.registration.unregister();}catch{}
  try{const cs=await self.clients.matchAll({type:'window'});cs.forEach(c=>c.navigate(c.url));}catch{}
})());});`
    );
  });
}

if (process.env.NODE_ENV !== "production" && (!process.env.REPL_ID || process.env.REPL_ID === "local-preview")) {
  app.get("/api/login", (_req, res) => {
    // Learner + parent + admin dev roles (owner request, 2026-07-19). This
    // whole route only exists in dev — production disables it entirely and
    // real OIDC + the ADMIN_EMAILS allowlist gate admin access.
    res.status(200).type("html").send(`<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>BrainTrack — Dev Sign-in</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050508;font-family:'Poppins',system-ui,sans-serif}
.card{background:#0a0b12;border:1.5px solid #9FF5E8;border-radius:20px;padding:36px;text-align:center;box-shadow:0 0 26px rgba(159,245,232,.22)}
h1{color:#fff;font-size:22px;margin:0 0 6px}p{color:#9FF5E8;font-size:13px;margin:0 0 22px}
a{display:block;margin:10px 0;padding:13px 40px;border-radius:12px;font-weight:700;text-decoration:none;color:#050508}
.l{background:#9FF5E8}.p{background:#94F7C5}.a{background:linear-gradient(100deg,#FFE29A,#FFB7E5)}</style></head><body>
<div class="card"><h1>Dev Sign-in</h1><p>Local preview — pick a role</p>
<a class="l" href="/api/dev/login-as/learner">Learner</a>
<a class="p" href="/api/dev/login-as/parent">Parent</a>
<a class="a" href="/api/dev/login-as/admin">Admin</a></div></body></html>`);
  });
}

// Disable X-Powered-By header (security)
app.disable("x-powered-by");

// Gzip compression for all responses (critical for 50k users)
app.use(compression({
  level: 6, // Balance between speed and compression
  threshold: 1024, // Only compress responses > 1KB
  filter: (req: any, res: any) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
}));

// Prevent HTTP Parameter Pollution attacks
app.use(hpp());


const isProd = process.env.NODE_ENV === "production";

// Enhanced Helmet security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: isProd
        ? ["'self'", "'unsafe-inline'"]
        : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", ...(isProd ? [] : ["ws:"]), "wss:", "https://api.openai.com", "https://paynow.netcash.co.za", "https://sandbox.netcash.co.za"],
      mediaSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      frameAncestors: isProd
        ? ["'none'"]
        : ["'self'", "https://*.replit.dev", "https://*.replit.com", "https://replit.com"],
      formAction: ["'self'"],
      upgradeInsecureRequests: isProd ? [] : null,
    },
  },
  frameguard: isProd ? { action: "deny" } : false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
}));

// Permissions-Policy — deny all sensitive browser APIs
app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=(), payment=(), usb=(), bluetooth=(), midi=(), magnetometer=(), gyroscope=(), accelerometer=()"
  );
  next();
});

// CORS — lock to same origin; reject cross-origin API calls
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.host ? `${req.protocol}://${req.headers.host}` : "'self'"); // nosemgrep: javascript.express.security.cors-misconfiguration -- intentionally locks CORS to same origin using request host
    res.setHeader("Vary", "Origin");
  }
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Max-Age", "600");
    return res.sendStatus(204);
  }
  next();
});

// Cache-Control: no-store on all /api routes (prevent caching of sensitive data)
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
const httpServer = createServer(app);
initSocket(httpServer);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Body size limits — prevent payload bloat / DoS
app.use(
  express.json({
    limit: "100kb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "50kb",
    // Capture raw body for form-encoded callbacks (e.g. Netcash legacy
    // webhooks) so HMAC signature verification can be done against the
    // exact bytes the provider signed, not a re-serialised version.
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// NOTE: /api/health is intentionally NOT registered here. It is a *readiness*
// probe that pings the database (see registerRoutes in routes.ts) so Render's
// healthCheckPath detects DB outages and holds the instance out of rotation.
// A DB-blind handler here would shadow it (Express matches first-registered)
// and always return 200 even with a dead database. Liveness — a DB-free
// "is the process up" check for cold-start probes — is served by /healthz above.

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  if (!isProd) {
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const port = parseInt(process.env.PORT || "5000", 10);

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }

    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: err.errors.map((e: any) => `${e.path.join(".") || "body"}: ${e.message}`),
      });
    }

    const status = err.status || err.statusCode || 500;
    const isProdEnv = process.env.NODE_ENV === "production";

    console.error("Internal Server Error:", err);

    if (isProdEnv) {
      const safeMessage = status < 500 ? (err.message || "Request failed") : "Internal Server Error";
      return res.status(status).json({ error: safeMessage });
    }

    return res.status(status).json({ error: err.message || "Internal Server Error" });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      // SO_REUSEPORT is only supported on Linux/BSD (used on Render for
      // zero-downtime rolling restarts). Windows throws ENOTSUP, which would
      // block local dev — so enable it everywhere except Windows.
      reusePort: process.platform !== "win32",
    },
    () => {
      log(`serving on port ${port}`);
      // Seed NSC 2026 timetable AFTER the server is listening, so cold-start
      // health probes (/healthz) never wait on DB seed work. Non-fatal.
      setImmediate(async () => {
        try {
          const { seedNscTimetableIfEmpty } = await import("./nsc-timetable");
          await seedNscTimetableIfEmpty();
          log("NSC timetable seed check complete", "startup");
        } catch (seedErr) {
          console.error("[Startup] NSC timetable seed failed (non-fatal):", seedErr);
        }
      });
    },
  );
})();
