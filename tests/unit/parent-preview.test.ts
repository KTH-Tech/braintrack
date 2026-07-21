/**
 * tests/unit/parent-preview.test.ts
 *
 * The admin parent-dashboard preview serves synthetic data. The thing that
 * actually matters is the GATE: it must be impossible for a non-admin to
 * receive sample data, and impossible for the middleware to interfere with a
 * normal parent request. These tests pin that contract down.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

/* Mutable auth fixture the mocked storage reads from. */
let dbUser: { id: string; role: string | null; email: string | null } | null = null;
let adminEmails: string[] = ["owner@braintrack.co.za"];

vi.mock("../../server/storage", () => ({
  storage: {
    getAllSubjects: async () => [
      { id: 11, name: "Mathematics" },
      { id: 12, name: "Physical Sciences" },
      { id: 13, name: "Life Sciences" },
      { id: 14, name: "English Home Language" },
      { id: 15, name: "Accounting" },
      { id: 16, name: "Geography" },
    ],
  },
}));

vi.mock("../../server/replit_integrations/auth/storage", () => ({
  authStorage: { getUser: async (id: string) => (dbUser && dbUser.id === id ? dbUser : null) },
}));

vi.mock("../../server/replit_integrations/auth/replitAuth", () => ({
  isAdminEmail: (email: string | null | undefined) => !!email && adminEmails.includes(email),
}));

const ADMIN = { id: "admin-1", role: "admin", email: "owner@braintrack.co.za" };
const PARENT = { id: "parent-1", role: "parent", email: "mom@example.com" };
/** role says admin, email is not on the allowlist — must still be refused. */
const FAKE_ADMIN = { id: "admin-2", role: "admin", email: "attacker@example.com" };

let mw: typeof import("../../server/parent-preview").parentPreviewMiddleware;
let PREVIEW_LEARNER_ID: string;

beforeEach(async () => {
  const mod = await import("../../server/parent-preview");
  mw = mod.parentPreviewMiddleware;
  PREVIEW_LEARNER_ID = mod.PREVIEW_LEARNER_ID;
  dbUser = null;
  adminEmails = ["owner@braintrack.co.za"];
});

/** Minimal express req/res doubles. */
function call(opts: {
  path: string;
  query?: Record<string, string>;
  user?: { id: string; role: string | null; email: string | null } | null;
}) {
  dbUser = opts.user ?? null;
  const req: any = {
    path: opts.path,
    query: opts.query ?? {},
    user: opts.user ? { claims: { sub: opts.user.id } } : undefined,
  };
  const state = { nexted: false, json: undefined as any, headers: {} as Record<string, string> };
  const res: any = {
    setHeader: (k: string, v: string) => { state.headers[k] = v; },
    json: (payload: any) => { state.json = payload; return res; },
  };
  const next = () => { state.nexted = true; };
  return mw(req, res, next).then(() => state) as Promise<typeof state>;
}

describe("parent preview gate — who is refused", () => {
  it("falls through for an unauthenticated caller", async () => {
    const s = await call({ path: "/children", query: { preview: "1" }, user: null });
    expect(s.nexted).toBe(true);
    expect(s.json).toBeUndefined();
  });

  it("falls through for a parent — even with ?preview=1", async () => {
    const s = await call({ path: "/children", query: { preview: "1" }, user: PARENT });
    expect(s.nexted).toBe(true);
    expect(s.json).toBeUndefined();
  });

  it("falls through for a parent addressing the reserved learner id", async () => {
    const s = await call({
      path: "/child-progress",
      query: { learnerId: PREVIEW_LEARNER_ID },
      user: PARENT,
    });
    expect(s.nexted).toBe(true);
    expect(s.json).toBeUndefined();
  });

  it("refuses role=admin when the email is not on the allowlist", async () => {
    const s = await call({ path: "/children", query: { preview: "1" }, user: FAKE_ADMIN });
    expect(s.nexted).toBe(true);
    expect(s.json).toBeUndefined();
  });

  it("falls through for an admin who did not opt in", async () => {
    const s = await call({ path: "/child-progress", query: {}, user: ADMIN });
    expect(s.nexted).toBe(true);
    expect(s.json).toBeUndefined();
  });

  it("falls through for an unknown path even for an opted-in admin", async () => {
    const s = await call({ path: "/report-email-preference", query: { preview: "1" }, user: ADMIN });
    expect(s.nexted).toBe(true);
    expect(s.json).toBeUndefined();
  });
});

describe("parent preview gate — what an admin gets", () => {
  it("serves a single, clearly-labelled sample child", async () => {
    const s = await call({ path: "/children", query: { preview: "1" }, user: ADMIN });
    expect(s.nexted).toBe(false);
    expect(s.json.children).toHaveLength(1);
    expect(s.json.children[0].learnerUserId).toBe(PREVIEW_LEARNER_ID);
    expect(s.json.children[0].learnerName).toMatch(/SAMPLE/);
    expect(s.headers["X-BrainTrack-Preview"]).toBe("sample-data");
    expect(s.headers["Cache-Control"]).toMatch(/no-store/);
  });

  it("serves sample data for downstream widgets via the reserved learner id alone", async () => {
    const s = await call({
      path: "/child-progress",
      query: { learnerId: PREVIEW_LEARNER_ID },
      user: ADMIN,
    });
    expect(s.nexted).toBe(false);
    expect(s.json.learnerName).toMatch(/SAMPLE/);
    expect(s.json.totalQuestionsAnswered).toBeGreaterThan(0);
    expect(s.json.weeklyReport.subjectBreakdown.length).toBeGreaterThan(0);
    expect(s.json.subjectMarks.length).toBeGreaterThan(0);
  });

  it("covers every widget the dashboard queries", async () => {
    const paths = [
      "/readiness",
      "/activity-feed",
      "/monthly-summary",
      "/learner-exam-schedule",
      "/learner-today-directive",
      "/learner-subject-readiness",
      "/onboarding-link-history",
    ];
    for (const path of paths) {
      const s = await call({ path, query: { learnerId: PREVIEW_LEARNER_ID }, user: ADMIN });
      expect(s.nexted, `${path} should be intercepted`).toBe(false);
      expect(s.json, `${path} should return a payload`).toBeDefined();
    }
  });

  it("keys subject readiness by REAL subject ids so labels resolve", async () => {
    const s = await call({
      path: "/learner-subject-readiness",
      query: { learnerId: PREVIEW_LEARNER_ID },
      user: ADMIN,
    });
    const ids = Object.keys(s.json.readiness).map(Number);
    // 11..16 come from the mocked subject table, not from 1..6 fallbacks.
    expect(ids).toContain(11);
    expect(ids).toContain(16);
    for (const v of Object.values(s.json.readiness) as number[]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("returns readiness rows shaped exactly as the dashboard expects", async () => {
    const s = await call({ path: "/readiness", query: { preview: "1" }, user: ADMIN });
    for (const r of s.json.readiness) {
      expect(typeof r.subjectName).toBe("string");
      expect(["red", "amber", "green"]).toContain(r.masteryBand);
      expect(["up", "down", "stable"]).toContain(r.trendDirection);
      expect(Array.isArray(r.trendScores)).toBe(true);
      expect(r.delta).toBe(r.currentAccuracy - r.baselineMark);
    }
  });
});
