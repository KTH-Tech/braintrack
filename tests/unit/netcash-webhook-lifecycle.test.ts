import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createServer } from "http";
import type { Server } from "http";

// ─── Stateful fake storage ──────────────────────────────────────────────────
// We track which storage methods were called and with what arguments so we
// can assert the lifecycle transitions triggered by each Netcash webhook
// event type.

interface FakeSubscription {
  userId: string;
  plan: string | null;
  priceRands: number | null;
  status: string;
  billingMethod: string | null;
  pendingMethod: "debicheck" | "card" | null;
  netcashCheckoutRef: string;
  nextRenewalAt: Date | null;
  gracePeriodEndsAt: Date | null;
  netcashMandateId: string | null;
  netcashCardToken: string | null;
  netcashSubscriptionId: string | null;
  lastPaymentStatus: string | null;
}

const fakeStorage = {
  _sub: null as FakeSubscription | null,
  _calls: [] as Array<{ method: string; args: unknown[] }>,

  reset(initial: FakeSubscription | null) {
    this._sub = initial;
    this._calls = [];
  },

  _record(method: string, args: unknown[]) {
    this._calls.push({ method, args });
  },

  async getSubscriptionByNetcashRef(reference: string) {
    this._record("getSubscriptionByNetcashRef", [reference]);
    if (this._sub && this._sub.netcashCheckoutRef === reference) return this._sub;
    return undefined;
  },

  async setNetcashIdentifiers(userId: string, ids: any) {
    this._record("setNetcashIdentifiers", [userId, ids]);
    if (this._sub && this._sub.userId === userId) {
      if (ids.mandateId) this._sub.netcashMandateId = ids.mandateId;
      if (ids.cardToken) this._sub.netcashCardToken = ids.cardToken;
      if (ids.subscriptionId) this._sub.netcashSubscriptionId = ids.subscriptionId;
      if (ids.billingMethod) this._sub.billingMethod = ids.billingMethod;
      if (ids.nextRenewalAt) this._sub.nextRenewalAt = ids.nextRenewalAt;
      if (ids.lastPaymentStatus) this._sub.lastPaymentStatus = ids.lastPaymentStatus;
    }
  },

  async updateSubscriptionStatus(userId: string, status: string) {
    this._record("updateSubscriptionStatus", [userId, status]);
    if (this._sub && this._sub.userId === userId) this._sub.status = status;
  },

  async activateSubscription(userId: string, plan: string, priceRands: number) {
    this._record("activateSubscription", [userId, plan, priceRands]);
    if (this._sub && this._sub.userId === userId) {
      this._sub.status = "active";
      this._sub.plan = plan;
      this._sub.priceRands = priceRands;
    }
  },

  async recordRecurringSuccess(userId: string, nextRenewalAt: Date) {
    this._record("recordRecurringSuccess", [userId, nextRenewalAt]);
    if (this._sub && this._sub.userId === userId) {
      this._sub.status = "active";
      this._sub.nextRenewalAt = nextRenewalAt;
      this._sub.gracePeriodEndsAt = null;
      this._sub.lastPaymentStatus = "success";
    }
  },

  async recordRecurringFailure(userId: string, gracePeriodEndsAt: Date) {
    this._record("recordRecurringFailure", [userId, gracePeriodEndsAt]);
    if (this._sub && this._sub.userId === userId) {
      this._sub.status = "grace";
      this._sub.gracePeriodEndsAt = gracePeriodEndsAt;
      this._sub.lastPaymentStatus = "failed";
    }
  },

  async startTrial(userId: string, parentCell: string, plan: string, priceRands: number) {
    this._record("startTrial", [userId, parentCell, plan, priceRands]);
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const sub: any = {
      userId,
      plan,
      priceRands,
      status: "trial",
      billingMethod: "trial",
      parentCell,
      trialEndsAt,
      endDate: trialEndsAt,
    };
    return sub;
  },

  async enforceLapsedSubscriptions() {
    this._record("enforceLapsedSubscriptions", []);
    let trialsLapsed = 0;
    let graceLapsed = 0;
    if (this._sub) {
      const now = Date.now();
      if (
        this._sub.status === "trial" &&
        !this._sub.netcashMandateId &&
        !this._sub.netcashCardToken &&
        // @ts-expect-error trialEndsAt may be present on injected fixtures
        this._sub.trialEndsAt &&
        // @ts-expect-error
        this._sub.trialEndsAt.getTime() < now
      ) {
        this._sub.status = "lapsed";
        this._sub.billingMethod = "lapsed";
        trialsLapsed = 1;
      } else if (
        this._sub.status === "grace" &&
        this._sub.gracePeriodEndsAt &&
        this._sub.gracePeriodEndsAt.getTime() < now
      ) {
        this._sub.status = "lapsed";
        this._sub.billingMethod = "lapsed";
        graceLapsed = 1;
      }
    }
    return { trialsLapsed, graceLapsed };
  },
};

// ─── Mock heavy server deps so we can import registerRoutes ─────────────────
// The db proxy must be both chainable (`.select().from().where().limit()`)
// AND awaitable (resolving to `[]`) so the referral helpers in routes.ts
// don't hang the webhook handler.
function makeDbChain() {
  const handler: ProxyHandler<object> = {
    get(_t, prop) {
      if (prop === "then") {
        return (resolve: (v: unknown) => void) => resolve([]);
      }
      return (..._args: unknown[]) => proxy;
    },
  };
  const proxy: any = new Proxy({}, handler);
  return proxy;
}
vi.mock("../../server/db", () => ({
  pool: { query: vi.fn().mockResolvedValue({ rows: [] }), end: vi.fn(), on: vi.fn() },
  db: makeDbChain(),
}));

vi.mock("../../server/storage", () => {
  class DatabaseStorage {
    static readonly TEST_LEARNER_ID = "00000000-0000-0000-0000-000000000001";
    static readonly TEST_PARENT_ID  = "00000000-0000-0000-0000-000000000002";
    static readonly TEST_ADMIN_ID   = "00000000-0000-0000-0000-000000000003";
  }
  // Wrap fakeStorage in a Proxy so any methods we forgot still resolve to a
  // no-op returning null, matching the rate-limiter test pattern.
  const proxied = new Proxy(fakeStorage as any, {
    get(target, prop, receiver) {
      if (prop in target) return Reflect.get(target, prop, receiver);
      return vi.fn().mockResolvedValue(null);
    },
  });
  return { storage: proxied, DatabaseStorage };
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

// ─── Helpers ────────────────────────────────────────────────────────────────

const REF = "bt-card-fakeuser-test";
const USER = "fakeuser";

function freshSub(overrides: Partial<FakeSubscription> = {}): FakeSubscription {
  return {
    userId: USER,
    plan: "brain-boost",
    priceRands: 169,
    status: "pending",
    billingMethod: null,
    pendingMethod: "card",
    netcashCheckoutRef: REF,
    nextRenewalAt: null,
    gracePeriodEndsAt: null,
    netcashMandateId: null,
    netcashCardToken: null,
    netcashSubscriptionId: null,
    lastPaymentStatus: null,
    ...overrides,
  };
}

function calls(method: string) {
  return fakeStorage._calls.filter((c) => c.method === method);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("Netcash webhook lifecycle (server/routes.ts /api/netcash/webhook)", () => {
  let app: express.Express;
  let httpServer: Server;

  // Snapshot env so we can restore it after this suite runs and avoid
  // contaminating other test files that share the same vitest process.
  const ENV_SNAPSHOT: Record<string, string | undefined> = {
    NODE_ENV: process.env.NODE_ENV,
    NETCASH_WEBHOOK_SECRET: process.env.NETCASH_WEBHOOK_SECRET,
    NETCASH_SERVICE_KEY: process.env.NETCASH_SERVICE_KEY,
    NETCASH_SOFTWARE_VENDOR_KEY: process.env.NETCASH_SOFTWARE_VENDOR_KEY,
  };

  beforeAll(async () => {
    // No NETCASH_WEBHOOK_SECRET → isNetcashConfigured()=false; in non-prod
    // the route accepts the request without signature verification, which
    // is exactly what we want for these lifecycle tests.
    delete process.env.NETCASH_WEBHOOK_SECRET;
    delete process.env.NETCASH_SERVICE_KEY;
    delete process.env.NETCASH_SOFTWARE_VENDOR_KEY;
    process.env.NODE_ENV = "test";

    const { registerRoutes } = await import("../../server/routes");
    app = express();
    app.use(express.json());
    httpServer = createServer(app);
    await registerRoutes(httpServer, app);
  });

  afterAll(() => {
    for (const [k, v] of Object.entries(ENV_SNAPSHOT)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  beforeEach(() => {
    fakeStorage.reset(freshSub());
  });

  it("ignores webhooks for an unknown subscription reference", async () => {
    fakeStorage.reset(null);
    const res = await request(app)
      .post("/api/netcash/webhook")
      .send({ Reference: "no-such-ref", TransactionAccepted: "true" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ note: "no matching subscription" });
    expect(calls("activateSubscription")).toHaveLength(0);
    expect(calls("recordRecurringSuccess")).toHaveLength(0);
  });

  it("ignores unrecognised payloads but still 200s", async () => {
    const res = await request(app)
      .post("/api/netcash/webhook")
      .send({ Reference: REF, somethingWeird: true });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ note: "unrecognised event" });
  });

  it("mandate.created → setNetcashIdentifiers stamps mandateId + billingMethod=debicheck", async () => {
    const res = await request(app)
      .post("/api/netcash/webhook")
      .send({ Reference: REF, MandateAction: "created", MandateId: "MND-123" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ processed: "mandate.created" });

    const setCalls = calls("setNetcashIdentifiers");
    expect(setCalls).toHaveLength(1);
    expect(setCalls[0].args[0]).toBe(USER);
    expect(setCalls[0].args[1]).toMatchObject({ mandateId: "MND-123", billingMethod: "debicheck" });
    expect(fakeStorage._sub?.netcashMandateId).toBe("MND-123");
    expect(fakeStorage._sub?.billingMethod).toBe("debicheck");
  });

  it("mandate.approved → same effect as mandate.created", async () => {
    const res = await request(app)
      .post("/api/netcash/webhook")
      .send({ Reference: REF, MandateAction: "approved", MandateId: "MND-456" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ processed: "mandate.approved" });
    expect(fakeStorage._sub?.netcashMandateId).toBe("MND-456");
    expect(fakeStorage._sub?.billingMethod).toBe("debicheck");
  });

  it("mandate.rejected → status=failed", async () => {
    const res = await request(app)
      .post("/api/netcash/webhook")
      .send({ Reference: REF, MandateAction: "rejected" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ processed: "mandate.rejected" });
    const updates = calls("updateSubscriptionStatus");
    expect(updates).toHaveLength(1);
    expect(updates[0].args).toEqual([USER, "failed"]);
    expect(fakeStorage._sub?.status).toBe("failed");
  });

  it("mandate.cancelled → status=failed", async () => {
    const res = await request(app)
      .post("/api/netcash/webhook")
      .send({ Reference: REF, MandateAction: "cancelled" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ processed: "mandate.cancelled" });
    expect(fakeStorage._sub?.status).toBe("failed");
  });

  it("payment.first.success (card) → activate + recordRecurringSuccess + cardToken stored", async () => {
    fakeStorage.reset(freshSub({ pendingMethod: "card" }));
    const before = Date.now();
    const res = await request(app)
      .post("/api/netcash/webhook")
      .send({
        Reference: REF,
        TransactionAccepted: "true",
        Amount: "169.00",
        CardToken: "TOK-abc",
      });
    const after = Date.now();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ processed: "payment.first.success" });

    const setCalls = calls("setNetcashIdentifiers");
    expect(setCalls).toHaveLength(1);
    const ids: any = setCalls[0].args[1];
    expect(ids.billingMethod).toBe("card");
    expect(ids.cardToken).toBe("TOK-abc");
    expect(ids.lastPaymentStatus).toBe("success");
    expect(ids.nextRenewalAt).toBeInstanceOf(Date);
    const renewal = (ids.nextRenewalAt as Date).getTime();
    expect(renewal).toBeGreaterThanOrEqual(before + 30 * 24 * 60 * 60 * 1000 - 1000);
    expect(renewal).toBeLessThanOrEqual(after + 30 * 24 * 60 * 60 * 1000 + 1000);

    expect(calls("activateSubscription")).toHaveLength(1);
    expect(calls("recordRecurringSuccess")).toHaveLength(1);
    expect(fakeStorage._sub?.status).toBe("active");
    expect(fakeStorage._sub?.netcashCardToken).toBe("TOK-abc");
    expect(fakeStorage._sub?.billingMethod).toBe("card");
    expect(fakeStorage._sub?.gracePeriodEndsAt).toBeNull();
  });

  it("payment.first.success (debicheck) → billingMethod=debicheck and mandateId carried through", async () => {
    fakeStorage.reset(freshSub({ pendingMethod: "debicheck", netcashMandateId: "MND-existing" }));
    const res = await request(app)
      .post("/api/netcash/webhook")
      .send({
        Reference: REF,
        TransactionAccepted: "true",
        Amount: "169.00",
        MandateId: "MND-confirmed",
      });
    expect(res.status).toBe(200);

    const ids: any = calls("setNetcashIdentifiers")[0].args[1];
    expect(ids.billingMethod).toBe("debicheck");
    expect(ids.mandateId).toBe("MND-confirmed");
    expect(fakeStorage._sub?.status).toBe("active");
  });

  it("payment.recurring.success → recordRecurringSuccess with renewal ~30 days out (no activate)", async () => {
    fakeStorage.reset(freshSub({ status: "active", billingMethod: "card", netcashCardToken: "TOK-x" }));
    const before = Date.now();
    const res = await request(app)
      .post("/api/netcash/webhook")
      .send({
        Reference: REF,
        TransactionAccepted: "true",
        IsRecurring: "true",
        Amount: "169.00",
      });
    const after = Date.now();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ processed: "payment.recurring.success" });

    expect(calls("activateSubscription")).toHaveLength(0);
    const successCalls = calls("recordRecurringSuccess");
    expect(successCalls).toHaveLength(1);
    const nextRenewalAt = successCalls[0].args[1] as Date;
    expect(nextRenewalAt).toBeInstanceOf(Date);
    expect(nextRenewalAt.getTime()).toBeGreaterThanOrEqual(before + 30 * 24 * 60 * 60 * 1000 - 1000);
    expect(nextRenewalAt.getTime()).toBeLessThanOrEqual(after + 30 * 24 * 60 * 60 * 1000 + 1000);
    expect(fakeStorage._sub?.status).toBe("active");
    expect(fakeStorage._sub?.gracePeriodEndsAt).toBeNull();
  });

  it("payment.recurring.failed → recordRecurringFailure with 3-day grace window, status=grace", async () => {
    fakeStorage.reset(freshSub({ status: "active", billingMethod: "card", netcashCardToken: "TOK-x" }));
    const before = Date.now();
    const res = await request(app)
      .post("/api/netcash/webhook")
      .send({
        Reference: REF,
        TransactionAccepted: "false",
        IsRecurring: "true",
        Amount: "169.00",
      });
    const after = Date.now();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ processed: "payment.recurring.failed" });

    const failCalls = calls("recordRecurringFailure");
    expect(failCalls).toHaveLength(1);
    const grace = failCalls[0].args[1] as Date;
    expect(grace).toBeInstanceOf(Date);
    expect(grace.getTime()).toBeGreaterThanOrEqual(before + 3 * 24 * 60 * 60 * 1000 - 1000);
    expect(grace.getTime()).toBeLessThanOrEqual(after + 3 * 24 * 60 * 60 * 1000 + 1000);
    expect(fakeStorage._sub?.status).toBe("grace");
    expect(fakeStorage._sub?.gracePeriodEndsAt).toEqual(grace);
    expect(fakeStorage._sub?.lastPaymentStatus).toBe("failed");
    // No activate / success side-effects on failure.
    expect(calls("activateSubscription")).toHaveLength(0);
    expect(calls("recordRecurringSuccess")).toHaveLength(0);
  });

  it("full lifecycle: trial → mandate → first.success → recurring.success → recurring.failed → enforce → lapsed", async () => {
    // 1) Trial start (parent supplies cell)
    const trial = await fakeStorage.startTrial(USER, "0821234567", "brain-boost", 169);
    expect(trial.status).toBe("trial");
    expect(trial.billingMethod).toBe("trial");

    // Now the user goes through DebiCheck checkout — we install a pending sub.
    fakeStorage.reset(freshSub({ pendingMethod: "debicheck", status: "pending" }));

    // 2) Mandate created
    await request(app)
      .post("/api/netcash/webhook")
      .send({ Reference: REF, MandateAction: "created", MandateId: "MND-LC" });
    expect(fakeStorage._sub?.netcashMandateId).toBe("MND-LC");
    expect(fakeStorage._sub?.billingMethod).toBe("debicheck");

    // 3) First payment success → status=active, nextRenewalAt set
    await request(app)
      .post("/api/netcash/webhook")
      .send({ Reference: REF, TransactionAccepted: "true", Amount: "169.00", MandateId: "MND-LC" });
    expect(fakeStorage._sub?.status).toBe("active");
    expect(fakeStorage._sub?.nextRenewalAt).toBeInstanceOf(Date);

    // 4) Recurring success a month later
    const beforeRecur = Date.now();
    await request(app)
      .post("/api/netcash/webhook")
      .send({ Reference: REF, TransactionAccepted: "true", IsRecurring: "true", Amount: "169.00" });
    expect(fakeStorage._sub?.status).toBe("active");
    expect(fakeStorage._sub?.nextRenewalAt!.getTime()).toBeGreaterThanOrEqual(
      beforeRecur + 30 * 24 * 60 * 60 * 1000 - 1000,
    );

    // 5) Recurring failure → grace
    await request(app)
      .post("/api/netcash/webhook")
      .send({ Reference: REF, TransactionAccepted: "false", IsRecurring: "true", Amount: "169.00" });
    expect(fakeStorage._sub?.status).toBe("grace");
    expect(fakeStorage._sub?.gracePeriodEndsAt).toBeInstanceOf(Date);

    // 6) Force the grace window into the past and run enforceLapsedSubscriptions()
    fakeStorage._sub!.gracePeriodEndsAt = new Date(Date.now() - 1000);
    const result = await fakeStorage.enforceLapsedSubscriptions();
    expect(result).toEqual({ trialsLapsed: 0, graceLapsed: 1 });
    expect(fakeStorage._sub?.status).toBe("lapsed");
    expect(fakeStorage._sub?.billingMethod).toBe("lapsed");
  });

  it("expired trial with no payment method → enforceLapsedSubscriptions marks it lapsed", async () => {
    fakeStorage.reset({
      ...freshSub({ status: "trial", billingMethod: "trial" }),
      // @ts-expect-error injecting trialEndsAt for the fake's enforce check
      trialEndsAt: new Date(Date.now() - 1000),
    });
    const result = await fakeStorage.enforceLapsedSubscriptions();
    expect(result).toEqual({ trialsLapsed: 1, graceLapsed: 0 });
    expect(fakeStorage._sub?.status).toBe("lapsed");
    expect(fakeStorage._sub?.billingMethod).toBe("lapsed");
  });

  it("expired trial WITH a saved payment method is NOT marked lapsed by enforce", async () => {
    fakeStorage.reset({
      ...freshSub({
        status: "trial",
        billingMethod: "trial",
        netcashCardToken: "TOK-saved",
      }),
      // @ts-expect-error injecting trialEndsAt for the fake's enforce check
      trialEndsAt: new Date(Date.now() - 1000),
    });
    const result = await fakeStorage.enforceLapsedSubscriptions();
    expect(result).toEqual({ trialsLapsed: 0, graceLapsed: 0 });
    expect(fakeStorage._sub?.status).toBe("trial");
  });
});
