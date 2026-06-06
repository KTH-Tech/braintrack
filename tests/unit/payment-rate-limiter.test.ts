import { vi, describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import { createServer } from "http";
import type { Server } from "http";
import { createPaymentLimiter, PAYMENT_LIMITER_CONFIG } from "../../server/middleware/payment-limiter";

// ─── Mock all heavy server dependencies so we can import registerRoutes ─────
vi.mock("../../server/db", () => ({
  pool: { query: vi.fn(), end: vi.fn(), on: vi.fn() },
  db: new Proxy({}, { get: () => vi.fn().mockReturnThis() }),
}));

vi.mock("../../server/storage", () => {
  class DatabaseStorage {
    static readonly TEST_LEARNER_ID = "00000000-0000-0000-0000-000000000001";
    static readonly TEST_PARENT_ID  = "00000000-0000-0000-0000-000000000002";
    static readonly TEST_ADMIN_ID   = "00000000-0000-0000-0000-000000000003";
  }
  return {
    storage: new Proxy({}, { get: () => vi.fn().mockResolvedValue(null) }),
    DatabaseStorage,
  };
});

vi.mock("../../server/socket", () => ({
  emitScoreUpdated: vi.fn(),
  emitReadinessRecalculated: vi.fn(),
  emitReportUpdated: vi.fn(),
  signSocketToken: vi.fn().mockReturnValue("mock-socket-token"),
}));

vi.mock("../../server/replit_integrations/auth", () => ({
  setupAuth: vi.fn().mockResolvedValue(undefined),
  registerAuthRoutes: vi.fn(),
  isAuthenticated: (_req: any, _res: any, next: any) => next(),
  rotateSigningKey: vi.fn(),
  generateAccessToken: vi.fn().mockReturnValue("mock-access-token"),
  generateRefreshToken: vi.fn().mockReturnValue("mock-refresh-token"),
}));

vi.mock("../../server/replit_integrations/auth/storage", () => ({
  authStorage: new Proxy({}, { get: () => vi.fn().mockResolvedValue(null) }),
}));

vi.mock("../../server/gamification", () => ({
  ensureGamificationTables: vi.fn().mockResolvedValue(undefined),
  scheduleDailyAggregation: vi.fn(),
  emitEvent: vi.fn(),
  getInAppNotifications: vi.fn().mockResolvedValue([]),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  getPersonalBests: vi.fn().mockResolvedValue({}),
  getWeeklyComparison: vi.fn().mockResolvedValue({}),
  getNextMilestone: vi.fn().mockResolvedValue(null),
  getDAU: vi.fn().mockResolvedValue(0),
  getQuizCompletionRate: vi.fn().mockResolvedValue(0),
  getBadgeAwardRate: vi.fn().mockResolvedValue(0),
  getAvgReadinessBySchool: vi.fn().mockResolvedValue([]),
  createParentReportNotification: vi.fn().mockResolvedValue(undefined),
  BADGE_DEFINITIONS: [],
}));

vi.mock("openai", () => {
  function OpenAIMock(this: any) {
    this.chat = { completions: { create: vi.fn().mockResolvedValue({ choices: [] }) } };
    this.audio = { speech: { create: vi.fn().mockResolvedValue({ arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)) }) } };
  }
  return { default: OpenAIMock };
});

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("multer", () => {
  const multerInstance = {
    single: vi.fn().mockReturnValue((_req: any, _res: any, next: any) => next()),
    array: vi.fn().mockReturnValue((_req: any, _res: any, next: any) => next()),
  };
  const multerFn: any = vi.fn().mockReturnValue(multerInstance);
  multerFn.memoryStorage = vi.fn().mockReturnValue({});
  multerFn.diskStorage = vi.fn().mockReturnValue({});
  return { default: multerFn };
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("Payment rate limiter config (server/middleware/payment-limiter.ts)", () => {
  it("allows 5 attempts per 15-minute window", () => {
    expect(PAYMENT_LIMITER_CONFIG.max).toBe(5);
    expect(PAYMENT_LIMITER_CONFIG.windowMs).toBe(15 * 60 * 1000);
  });

  it("returns the expected error message when the limit is exceeded", () => {
    expect(PAYMENT_LIMITER_CONFIG.message).toEqual({
      error: "Too many payment attempts, please try again in 15 minutes",
    });
  });
});

describe("Payment rate limiter — real route wiring via registerRoutes", () => {
  let app: express.Express;
  let httpServer: Server;

  beforeAll(async () => {
    const { registerRoutes } = await import("../../server/routes");
    app = express();
    app.use(express.json());
    httpServer = createServer(app);
    await registerRoutes(httpServer, app);
  });

  describe("/api/subscribe/netcash/card/init", () => {
    it("allows first 5 requests (rate limiter not triggered)", async () => {
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post("/api/subscribe/netcash/card/init")
          .send({ plan: "standard" });
        expect(res.status, `Request ${i + 1} must not return 429`).not.toBe(429);
      }
    });

    it("blocks the 6th request with HTTP 429", async () => {
      const res = await request(app)
        .post("/api/subscribe/netcash/card/init")
        .send({ plan: "standard" });
      expect(res.status).toBe(429);
    });

    it("includes the expected error message in the 429 response body", async () => {
      const res = await request(app)
        .post("/api/subscribe/netcash/card/init")
        .send({ plan: "standard" });
      expect(res.body).toMatchObject({
        error: "Too many payment attempts, please try again in 15 minutes",
      });
    });
  });

  describe("removed payment endpoints", () => {
    it("/api/subscribe/paystack returns 404 (endpoint removed)", async () => {
      const res = await request(app)
        .post("/api/subscribe/paystack")
        .send({ reference: "x", plan: "standard" });
      expect(res.status).toBe(404);
    });

    it("/api/subscribe/ozow/initiate returns 404 (endpoint removed)", async () => {
      const res = await request(app)
        .post("/api/subscribe/ozow/initiate")
        .send({ plan: "standard" });
      expect(res.status).toBe(404);
    });

    it("/api/ozow/notify returns 404 (endpoint removed)", async () => {
      const res = await request(app)
        .post("/api/ozow/notify")
        .send({});
      expect(res.status).toBe(404);
    });
  });
});

describe("Payment rate limiter — isolated middleware behaviour", () => {
  function freshApp() {
    const a = express();
    a.use(express.json());
    const limiter = createPaymentLimiter();
    a.post("/api/subscribe/netcash/card/init", limiter, (_req, res) => res.status(200).json({ ok: true }));
    return a;
  }

  it("/api/subscribe/netcash/card/init — allows first 5 and blocks 6th with 429", async () => {
    const app = freshApp();
    for (let i = 0; i < 5; i++) {
      const r = await request(app).post("/api/subscribe/netcash/card/init").send({});
      expect(r.status).not.toBe(429);
    }
    const blocked = await request(app).post("/api/subscribe/netcash/card/init").send({});
    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({ error: "Too many payment attempts, please try again in 15 minutes" });
  });
});
