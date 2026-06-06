import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createServer } from "http";
import type { Server } from "http";
import {
  buildPayfastSignature,
  parsePayfastItn,
  verifyPayfastItnSignature,
  type PayfastConfig,
} from "../../server/payfast";

// ─── Fake storage ────────────────────────────────────────────────────────────

interface FakeSubscription {
  userId: string;
  plan: string | null;
  priceRands: number | null;
  status: string;
  netcashCheckoutRef: string;   // reused for m_payment_id in PayFast flows
  payfastSubscriptionId: string | null;
  payfastPaymentId: string | null;
  nextRenewalAt: Date | null;
  gracePeriodEndsAt: Date | null;
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

  async getSubscriptionByMPaymentId(mPaymentId: string) {
    this._record("getSubscriptionByMPaymentId", [mPaymentId]);
    if (this._sub && this._sub.netcashCheckoutRef === mPaymentId) return this._sub;
    return undefined;
  },

  async getSubscriptionByPayfastToken(token: string) {
    this._record("getSubscriptionByPayfastToken", [token]);
    if (this._sub && this._sub.payfastSubscriptionId === token) return this._sub;
    return undefined;
  },

  async setPayfastIdentifiers(userId: string, ids: any) {
    this._record("setPayfastIdentifiers", [userId, ids]);
    if (this._sub && this._sub.userId === userId) {
      if (ids.token != null) this._sub.payfastSubscriptionId = ids.token;
      if (ids.paymentId != null) this._sub.payfastPaymentId = ids.paymentId;
      if (ids.nextRenewalAt != null) this._sub.nextRenewalAt = ids.nextRenewalAt;
    }
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
    }
  },

  async recordRecurringFailure(userId: string, gracePeriodEndsAt: Date) {
    this._record("recordRecurringFailure", [userId, gracePeriodEndsAt]);
    if (this._sub && this._sub.userId === userId) {
      this._sub.status = "grace";
      this._sub.gracePeriodEndsAt = gracePeriodEndsAt;
    }
  },

  async markLapsed(userId: string) {
    this._record("markLapsed", [userId]);
    if (this._sub && this._sub.userId === userId) {
      this._sub.status = "lapsed";
    }
  },
};

// ─── Module mocks ─────────────────────────────────────────────────────────────

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
    this.audio = {
      speech: {
        create: vi.fn().mockResolvedValue({
          arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
        }),
      },
    };
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

// ─── Shared test fixtures ─────────────────────────────────────────────────────

// PayFast sandbox test credentials (public sandbox values)
const TEST_MERCHANT_ID = "10000100";
const TEST_MERCHANT_KEY = "46f0cd694581a";
const TEST_M_PAYMENT_ID = "bt-testuser-abc123";
const TEST_USER_ID = "testuser-uuid-001";

const testCfg: PayfastConfig = {
  merchantId: TEST_MERCHANT_ID,
  merchantKey: TEST_MERCHANT_KEY,
  passphrase: undefined,
  sandbox: true,
};

function freshSub(overrides: Partial<FakeSubscription> = {}): FakeSubscription {
  return {
    userId: TEST_USER_ID,
    plan: "brain-boost",
    priceRands: 169,
    status: "pending",
    netcashCheckoutRef: TEST_M_PAYMENT_ID,
    payfastSubscriptionId: null,
    payfastPaymentId: null,
    nextRenewalAt: null,
    gracePeriodEndsAt: null,
    ...overrides,
  };
}

function calls(method: string) {
  return fakeStorage._calls.filter((c) => c.method === method);
}

/**
 * Build a valid signed ITN payload using the test merchant config.
 * Signing is done the same way PayFast does it: sort + MD5 (no passphrase for sandbox).
 */
function signedItn(fields: Record<string, string>): Record<string, string> {
  const paramsWithoutSig = { ...fields };
  delete paramsWithoutSig.signature;
  const sig = buildPayfastSignature(paramsWithoutSig, testCfg.passphrase);
  return { ...paramsWithoutSig, signature: sig };
}

// ─── Part 1: Pure unit tests for server/payfast.ts ──────────────────────────

describe("buildPayfastSignature", () => {
  it("produces a 32-char lowercase hex MD5", () => {
    const sig = buildPayfastSignature({ b: "2", a: "1" }, undefined);
    expect(sig).toMatch(/^[0-9a-f]{32}$/);
  });

  it("sorts keys alphabetically before hashing", () => {
    const ordered = buildPayfastSignature({ a: "1", b: "2", c: "3" }, undefined);
    const reversed = buildPayfastSignature({ c: "3", b: "2", a: "1" }, undefined);
    expect(ordered).toBe(reversed);
  });

  it("excludes the signature key from the hash input", () => {
    const withoutKey = buildPayfastSignature({ a: "1", b: "2" }, undefined);
    const withKey = buildPayfastSignature({ a: "1", b: "2", signature: "old" }, undefined);
    expect(withoutKey).toBe(withKey);
  });

  it("appends passphrase when provided", () => {
    const withPhrase = buildPayfastSignature({ a: "1" }, "secret");
    const withoutPhrase = buildPayfastSignature({ a: "1" }, undefined);
    expect(withPhrase).not.toBe(withoutPhrase);
  });

  it("produces a different hash when a field value changes", () => {
    const original = buildPayfastSignature({ amount: "169.00" }, undefined);
    const tampered = buildPayfastSignature({ amount: "1.00" }, undefined);
    expect(original).not.toBe(tampered);
  });

  it("URL-encodes special characters in values", () => {
    const sig1 = buildPayfastSignature({ item: "BrainTrack Brain Boost" }, undefined);
    const sig2 = buildPayfastSignature({ item: "BrainTrack Brain Boost" }, undefined);
    expect(sig1).toBe(sig2);
  });
});

describe("parsePayfastItn", () => {
  it("returns null when payment_status is missing", () => {
    expect(parsePayfastItn({ m_payment_id: "ref-1" })).toBeNull();
  });

  it("returns null when m_payment_id is missing", () => {
    expect(parsePayfastItn({ payment_status: "COMPLETE" })).toBeNull();
  });

  it("parses a complete COMPLETE event correctly", () => {
    const body = {
      payment_status: "COMPLETE",
      m_payment_id: "ref-1",
      pf_payment_id: "pf-123",
      token: "sub-token-abc",
      amount_gross: "169.00",
    };
    const evt = parsePayfastItn(body);
    expect(evt).not.toBeNull();
    expect(evt!.paymentStatus).toBe("COMPLETE");
    expect(evt!.mPaymentId).toBe("ref-1");
    expect(evt!.pfPaymentId).toBe("pf-123");
    expect(evt!.token).toBe("sub-token-abc");
    expect(evt!.amountGross).toBe(169);
    expect(evt!.raw).toEqual(body);
  });

  it("parses a SUBSCR_PAYMENT event with token", () => {
    const evt = parsePayfastItn({
      payment_status: "SUBSCR_PAYMENT",
      m_payment_id: "ref-2",
      pf_payment_id: "pf-456",
      token: "tok-renewal",
      amount_gross: "169.00",
    });
    expect(evt!.paymentStatus).toBe("SUBSCR_PAYMENT");
    expect(evt!.token).toBe("tok-renewal");
  });

  it("leaves token undefined when not present", () => {
    const evt = parsePayfastItn({
      payment_status: "SUBSCR_FAILED",
      m_payment_id: "ref-3",
    });
    expect(evt!.token).toBeUndefined();
    expect(evt!.amountGross).toBeUndefined();
  });

  it("leaves amountGross undefined for a non-numeric amount_gross", () => {
    const evt = parsePayfastItn({
      payment_status: "COMPLETE",
      m_payment_id: "ref-4",
      amount_gross: "NaN",
    });
    expect(evt!.amountGross).toBeUndefined();
  });

  it("defaults pfPaymentId to empty string when absent", () => {
    const evt = parsePayfastItn({ payment_status: "COMPLETE", m_payment_id: "ref-5" });
    expect(evt!.pfPaymentId).toBe("");
  });
});

describe("verifyPayfastItnSignature", () => {
  const body: Record<string, string> = {
    merchant_id: TEST_MERCHANT_ID,
    merchant_key: TEST_MERCHANT_KEY,
    m_payment_id: TEST_M_PAYMENT_ID,
    payment_status: "COMPLETE",
    amount_gross: "169.00",
  };

  it("accepts a valid signature (no passphrase)", () => {
    const sig = buildPayfastSignature(body, undefined);
    expect(verifyPayfastItnSignature({ ...body, signature: sig }, testCfg)).toBe(true);
  });

  it("accepts a valid signature with a passphrase", () => {
    const cfgWithPhrase: PayfastConfig = { ...testCfg, passphrase: "mysecret" };
    const sig = buildPayfastSignature(body, "mysecret");
    expect(verifyPayfastItnSignature({ ...body, signature: sig }, cfgWithPhrase)).toBe(true);
  });

  it("rejects a signature computed with a wrong passphrase", () => {
    const cfgWithPhrase: PayfastConfig = { ...testCfg, passphrase: "correct" };
    const wrongSig = buildPayfastSignature(body, "wrong");
    expect(verifyPayfastItnSignature({ ...body, signature: wrongSig }, cfgWithPhrase)).toBe(false);
  });

  it("rejects a signature computed without passphrase when cfg requires one", () => {
    const cfgWithPhrase: PayfastConfig = { ...testCfg, passphrase: "required" };
    const noPhraseSig = buildPayfastSignature(body, undefined);
    expect(verifyPayfastItnSignature({ ...body, signature: noPhraseSig }, cfgWithPhrase)).toBe(false);
  });

  it("rejects when signature field is absent", () => {
    expect(verifyPayfastItnSignature({ ...body }, testCfg)).toBe(false);
  });

  it("rejects a tampered body (amount changed)", () => {
    const sig = buildPayfastSignature(body, undefined);
    const tampered = { ...body, amount_gross: "1.00", signature: sig };
    expect(verifyPayfastItnSignature(tampered, testCfg)).toBe(false);
  });

  it("rejects an all-zeros garbage signature", () => {
    expect(verifyPayfastItnSignature({ ...body, signature: "0".repeat(32) }, testCfg)).toBe(false);
  });
});

// ─── Part 2: Integration tests — POST /api/payfast/itn ───────────────────────

describe("PayFast ITN webhook lifecycle (POST /api/payfast/itn)", () => {
  let app: express.Express;
  let httpServer: Server;

  const ENV_SNAPSHOT: Record<string, string | undefined> = {
    NODE_ENV: process.env.NODE_ENV,
    PAYFAST_MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID,
    PAYFAST_MERCHANT_KEY: process.env.PAYFAST_MERCHANT_KEY,
    PAYFAST_PASSPHRASE: process.env.PAYFAST_PASSPHRASE,
    PAYFAST_SANDBOX: process.env.PAYFAST_SANDBOX,
  };

  beforeAll(async () => {
    // Set sandbox PayFast credentials so isPayfastConfigured() returns true.
    // PAYFAST_SANDBOX=true skips the server-side validate call for COMPLETE events,
    // allowing the full activation flow to run in tests without network access.
    process.env.PAYFAST_MERCHANT_ID = TEST_MERCHANT_ID;
    process.env.PAYFAST_MERCHANT_KEY = TEST_MERCHANT_KEY;
    process.env.PAYFAST_SANDBOX = "true";
    delete process.env.PAYFAST_PASSPHRASE;
    process.env.NODE_ENV = "test";

    const { registerRoutes } = await import("../../server/routes");
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    httpServer = createServer(app);
    await registerRoutes(httpServer, app);
  });

  afterAll(() => {
    for (const [k, v] of Object.entries(ENV_SNAPSHOT)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    httpServer.close();
  });

  beforeEach(() => {
    fakeStorage.reset(freshSub());
  });

  it("always responds 200 immediately", async () => {
    const payload = signedItn({
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: TEST_M_PAYMENT_ID,
      payment_status: "COMPLETE",
      pf_payment_id: "pf-001",
      amount_gross: "169.00",
    });
    const res = await request(app).post("/api/payfast/itn").send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ received: true });
  });

  it("COMPLETE — activates subscription and records first renewal in sandbox mode", async () => {
    const before = Date.now();
    const payload = signedItn({
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: TEST_M_PAYMENT_ID,
      payment_status: "COMPLETE",
      pf_payment_id: "pf-001",
      token: "sub-token-abc",
      amount_gross: "169.00",
    });

    const res = await request(app).post("/api/payfast/itn").send(payload);
    const after = Date.now();

    expect(res.status).toBe(200);

    // setPayfastIdentifiers called with token + paymentId + nextRenewalAt
    const setIdCalls = calls("setPayfastIdentifiers");
    expect(setIdCalls).toHaveLength(1);
    const ids: any = setIdCalls[0].args[1];
    expect(ids.token).toBe("sub-token-abc");
    expect(ids.paymentId).toBe("pf-001");
    expect(ids.nextRenewalAt).toBeInstanceOf(Date);

    const renewal = (ids.nextRenewalAt as Date).getTime();
    expect(renewal).toBeGreaterThanOrEqual(before + 30 * 24 * 60 * 60 * 1000 - 1000);
    expect(renewal).toBeLessThanOrEqual(after + 30 * 24 * 60 * 60 * 1000 + 1000);

    // Subscription activated and renewal recorded
    expect(calls("activateSubscription")).toHaveLength(1);
    const [activateUserId, activatePlan, activatePrice] = calls("activateSubscription")[0].args as any[];
    expect(activateUserId).toBe(TEST_USER_ID);
    expect(activatePlan).toBe("brain-boost");
    expect(activatePrice).toBe(169);

    expect(calls("recordRecurringSuccess")).toHaveLength(1);

    // Storage state reflects activation
    expect(fakeStorage._sub?.status).toBe("active");
    expect(fakeStorage._sub?.payfastSubscriptionId).toBe("sub-token-abc");
    expect(fakeStorage._sub?.payfastPaymentId).toBe("pf-001");
    expect(fakeStorage._sub?.gracePeriodEndsAt).toBeNull();
  });

  it("SUBSCR_PAYMENT — records renewal without re-activating (recurring billing)", async () => {
    fakeStorage.reset(freshSub({ status: "active", payfastSubscriptionId: "sub-token-abc" }));

    const before = Date.now();
    const payload = signedItn({
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: TEST_M_PAYMENT_ID,
      payment_status: "SUBSCR_PAYMENT",
      pf_payment_id: "pf-002",
      token: "sub-token-abc",
      amount_gross: "169.00",
    });

    const res = await request(app).post("/api/payfast/itn").send(payload);
    const after = Date.now();

    expect(res.status).toBe(200);

    // activateSubscription must NOT be called for renewals
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

  it("SUBSCR_FAILED — enters grace period (3 days) without activating", async () => {
    fakeStorage.reset(freshSub({ status: "active", payfastSubscriptionId: "sub-token-abc" }));

    const before = Date.now();
    const payload = signedItn({
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: TEST_M_PAYMENT_ID,
      payment_status: "SUBSCR_FAILED",
      pf_payment_id: "pf-003",
      token: "sub-token-abc",
      amount_gross: "169.00",
    });

    const res = await request(app).post("/api/payfast/itn").send(payload);
    const after = Date.now();

    expect(res.status).toBe(200);

    expect(calls("activateSubscription")).toHaveLength(0);
    expect(calls("recordRecurringSuccess")).toHaveLength(0);

    const failCalls = calls("recordRecurringFailure");
    expect(failCalls).toHaveLength(1);
    const grace = failCalls[0].args[1] as Date;
    expect(grace).toBeInstanceOf(Date);
    expect(grace.getTime()).toBeGreaterThanOrEqual(before + 3 * 24 * 60 * 60 * 1000 - 1000);
    expect(grace.getTime()).toBeLessThanOrEqual(after + 3 * 24 * 60 * 60 * 1000 + 1000);

    expect(fakeStorage._sub?.status).toBe("grace");
    expect(fakeStorage._sub?.gracePeriodEndsAt).toEqual(grace);
  });

  it("FAILED — also enters grace period (same handler as SUBSCR_FAILED)", async () => {
    const before = Date.now();
    const payload = signedItn({
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: TEST_M_PAYMENT_ID,
      payment_status: "FAILED",
      pf_payment_id: "pf-004",
      amount_gross: "169.00",
    });

    const res = await request(app).post("/api/payfast/itn").send(payload);
    const after = Date.now();

    expect(res.status).toBe(200);
    const failCalls = calls("recordRecurringFailure");
    expect(failCalls).toHaveLength(1);
    const grace = failCalls[0].args[1] as Date;
    expect(grace.getTime()).toBeGreaterThanOrEqual(before + 3 * 24 * 60 * 60 * 1000 - 1000);
    expect(grace.getTime()).toBeLessThanOrEqual(after + 3 * 24 * 60 * 60 * 1000 + 1000);
    expect(fakeStorage._sub?.status).toBe("grace");
  });

  it("SUBSCR_CANCEL — marks subscription lapsed", async () => {
    fakeStorage.reset(freshSub({ status: "active", payfastSubscriptionId: "sub-token-abc" }));

    const payload = signedItn({
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: TEST_M_PAYMENT_ID,
      payment_status: "SUBSCR_CANCEL",
      pf_payment_id: "pf-005",
      token: "sub-token-abc",
    });

    const res = await request(app).post("/api/payfast/itn").send(payload);

    expect(res.status).toBe(200);
    const lapsedCalls = calls("markLapsed");
    expect(lapsedCalls).toHaveLength(1);
    expect(lapsedCalls[0].args[0]).toBe(TEST_USER_ID);
    expect(fakeStorage._sub?.status).toBe("lapsed");

    expect(calls("activateSubscription")).toHaveLength(0);
    expect(calls("recordRecurringSuccess")).toHaveLength(0);
    expect(calls("recordRecurringFailure")).toHaveLength(0);
  });

  it("CANCELLED — also marks subscription lapsed (alias for SUBSCR_CANCEL)", async () => {
    const payload = signedItn({
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: TEST_M_PAYMENT_ID,
      payment_status: "CANCELLED",
      pf_payment_id: "pf-006",
    });

    const res = await request(app).post("/api/payfast/itn").send(payload);

    expect(res.status).toBe(200);
    expect(calls("markLapsed")).toHaveLength(1);
    expect(fakeStorage._sub?.status).toBe("lapsed");
  });

  it("invalid signature — silently ignores and makes no storage calls", async () => {
    const payload = {
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: TEST_M_PAYMENT_ID,
      payment_status: "COMPLETE",
      pf_payment_id: "pf-007",
      amount_gross: "169.00",
      signature: "deadbeefdeadbeefdeadbeefdeadbeef",  // wrong signature
    };

    const res = await request(app).post("/api/payfast/itn").send(payload);

    // Route always returns 200 immediately before processing
    expect(res.status).toBe(200);

    // No storage mutations should have occurred
    expect(calls("activateSubscription")).toHaveLength(0);
    expect(calls("recordRecurringSuccess")).toHaveLength(0);
    expect(calls("recordRecurringFailure")).toHaveLength(0);
    expect(calls("markLapsed")).toHaveLength(0);
    expect(calls("setPayfastIdentifiers")).toHaveLength(0);
  });

  it("unknown m_payment_id — silently ignores with no storage calls", async () => {
    fakeStorage.reset(null);

    const unknownPayload = signedItn({
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: "bt-does-not-exist",
      payment_status: "COMPLETE",
      pf_payment_id: "pf-008",
      amount_gross: "169.00",
    });

    const res = await request(app).post("/api/payfast/itn").send(unknownPayload);

    expect(res.status).toBe(200);
    expect(calls("activateSubscription")).toHaveLength(0);
    expect(calls("recordRecurringSuccess")).toHaveLength(0);
  });

  it("token-based lookup for SUBSCR_PAYMENT when m_payment_id has no match", async () => {
    // Simulates a renewal where PayFast sends the subscription token only
    fakeStorage.reset(freshSub({ status: "active", payfastSubscriptionId: "tok-renewal-only" }));

    // Intentionally use a non-matching m_payment_id — lookup falls through to token
    const payload = signedItn({
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: "no-such-ref",
      payment_status: "SUBSCR_PAYMENT",
      pf_payment_id: "pf-009",
      token: "tok-renewal-only",
      amount_gross: "169.00",
    });

    const res = await request(app).post("/api/payfast/itn").send(payload);

    expect(res.status).toBe(200);
    expect(calls("getSubscriptionByMPaymentId")).toHaveLength(1);
    expect(calls("getSubscriptionByPayfastToken")).toHaveLength(1);
    expect(calls("recordRecurringSuccess")).toHaveLength(1);
    expect(fakeStorage._sub?.status).toBe("active");
  });

  it("full lifecycle: pending → COMPLETE → SUBSCR_PAYMENT → SUBSCR_FAILED → SUBSCR_CANCEL → lapsed", async () => {
    // 1) COMPLETE — first payment activates the subscription
    const completePayload = signedItn({
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: TEST_M_PAYMENT_ID,
      payment_status: "COMPLETE",
      pf_payment_id: "pf-A",
      token: "tok-full-lifecycle",
      amount_gross: "169.00",
    });
    await request(app).post("/api/payfast/itn").send(completePayload);
    expect(fakeStorage._sub?.status).toBe("active");
    expect(fakeStorage._sub?.payfastSubscriptionId).toBe("tok-full-lifecycle");

    // 2) SUBSCR_PAYMENT — monthly renewal
    const renewalPayload = signedItn({
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: TEST_M_PAYMENT_ID,
      payment_status: "SUBSCR_PAYMENT",
      pf_payment_id: "pf-B",
      token: "tok-full-lifecycle",
      amount_gross: "169.00",
    });
    await request(app).post("/api/payfast/itn").send(renewalPayload);
    expect(fakeStorage._sub?.status).toBe("active");
    expect(fakeStorage._sub?.nextRenewalAt).toBeInstanceOf(Date);

    // 3) SUBSCR_FAILED — payment failed, enters grace
    const failPayload = signedItn({
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: TEST_M_PAYMENT_ID,
      payment_status: "SUBSCR_FAILED",
      pf_payment_id: "pf-C",
      token: "tok-full-lifecycle",
      amount_gross: "169.00",
    });
    await request(app).post("/api/payfast/itn").send(failPayload);
    expect(fakeStorage._sub?.status).toBe("grace");
    expect(fakeStorage._sub?.gracePeriodEndsAt).toBeInstanceOf(Date);

    // 4) SUBSCR_CANCEL — user cancels, subscription lapses
    const cancelPayload = signedItn({
      merchant_id: TEST_MERCHANT_ID,
      merchant_key: TEST_MERCHANT_KEY,
      m_payment_id: TEST_M_PAYMENT_ID,
      payment_status: "SUBSCR_CANCEL",
      pf_payment_id: "pf-D",
      token: "tok-full-lifecycle",
    });
    await request(app).post("/api/payfast/itn").send(cancelPayload);
    expect(fakeStorage._sub?.status).toBe("lapsed");
  });
});

// ─── Part 3: POST /api/subscribe/payfast/init — 503 guard when unconfigured ──

describe("PayFast init endpoint — 503 when credentials not configured", () => {
  let app503: express.Express;
  let httpServer503: Server;

  const ENV_SNAPSHOT: Record<string, string | undefined> = {
    NODE_ENV: process.env.NODE_ENV,
    PAYFAST_MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID,
    PAYFAST_MERCHANT_KEY: process.env.PAYFAST_MERCHANT_KEY,
  };

  beforeAll(async () => {
    delete process.env.PAYFAST_MERCHANT_ID;
    delete process.env.PAYFAST_MERCHANT_KEY;
    process.env.NODE_ENV = "test";

    // We can't import registerRoutes again (already cached), so we re-use the
    // cached module. The init route checks isPayfastConfigured() at request
    // time, not at import time, so clearing env vars is enough.
    const { registerRoutes } = await import("../../server/routes");
    app503 = express();
    app503.use(express.json());
    httpServer503 = createServer(app503);
    await registerRoutes(httpServer503, app503);
  });

  afterAll(() => {
    for (const [k, v] of Object.entries(ENV_SNAPSHOT)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    httpServer503.close();
  });

  it("returns 503 with payfast_not_configured when credentials are missing", async () => {
    // Ensure env vars are definitely absent for this request
    const savedMid = process.env.PAYFAST_MERCHANT_ID;
    const savedMkey = process.env.PAYFAST_MERCHANT_KEY;
    delete process.env.PAYFAST_MERCHANT_ID;
    delete process.env.PAYFAST_MERCHANT_KEY;

    try {
      const res = await request(app503)
        .post("/api/subscribe/payfast/init")
        .send({ plan: "brain-boost" });

      expect(res.status).toBe(503);
      expect(res.body).toMatchObject({ error: "payfast_not_configured" });
    } finally {
      if (savedMid !== undefined) process.env.PAYFAST_MERCHANT_ID = savedMid;
      if (savedMkey !== undefined) process.env.PAYFAST_MERCHANT_KEY = savedMkey;
    }
  });
});
