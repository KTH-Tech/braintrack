import { test, expect } from "@playwright/test";
import { adminAuthHeaders, learnerAuthHeaders, parentAuthHeaders } from "./fixtures/auth";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-ADMIN — Admin Tools", () => {
  test("TC-ADMIN-001 — /api/admin/plans requires admin authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/plans`);
    expect(
      [401, 403],
      `GET /api/admin/plans must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-ADMIN-002 — /api/admin/products requires admin authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/products`);
    expect(
      [401, 403],
      `GET /api/admin/products must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-ADMIN-003 — /api/admin/reports/schools requires admin authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/reports/schools`);
    expect(
      [401, 403],
      `GET /api/admin/reports/schools must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-ADMIN-004 — /api/admin/reports/parents requires admin authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/reports/parents`);
    expect(
      [401, 403],
      `GET /api/admin/reports/parents must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-ADMIN-005 — /api/admin/toggle-subscription requires admin role (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/admin/toggle-subscription`, {
      data: { userId: "test-user", active: true },
    });
    expect(
      [401, 403],
      `toggle-subscription must require admin, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-ADMIN-006 — /api/admin/dbe-ingestion/subjects requires admin authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/dbe-ingestion/subjects`);
    expect(
      [401, 403],
      `GET /api/admin/dbe-ingestion/subjects must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  // ── Positive-path: admin JWT must be accepted ──────────────────────────────

  test("TC-ADMIN-007 — admin JWT can access /api/admin/plans (returns 200)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/plans`, {
      headers: adminAuthHeaders(),
    });
    expect(
      res.status(),
      `GET /api/admin/plans with admin JWT must return 200, got ${res.status()}`
    ).toBe(200);
  });

  test("TC-ADMIN-008 — admin JWT can access /api/admin/dbe-ingestion/subjects (returns 200)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/dbe-ingestion/subjects`, {
      headers: adminAuthHeaders(),
    });
    expect(
      res.status(),
      `GET /api/admin/dbe-ingestion/subjects with admin JWT must return 200, got ${res.status()}`
    ).toBe(200);
  });

  test("TC-ADMIN-009 — admin JWT can access /api/admin/billing (returns 200)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/billing`, {
      headers: adminAuthHeaders(),
    });
    expect(
      res.status(),
      `GET /api/admin/billing with admin JWT must return 200, got ${res.status()}`
    ).toBe(200);
  });

  // ── Negative-path: non-admin JWTs must be rejected with 403 ────────────────

  test("TC-ADMIN-010 — learner JWT cannot access /api/admin/plans (returns 403)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/plans`, {
      headers: learnerAuthHeaders(),
    });
    expect(
      res.status(),
      `GET /api/admin/plans with learner JWT must return 403, got ${res.status()}`
    ).toBe(403);
  });

  test("TC-ADMIN-011 — learner JWT cannot access /api/admin/dbe-ingestion/subjects (returns 403)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/dbe-ingestion/subjects`, {
      headers: learnerAuthHeaders(),
    });
    expect(
      res.status(),
      `GET /api/admin/dbe-ingestion/subjects with learner JWT must return 403, got ${res.status()}`
    ).toBe(403);
  });

  test("TC-ADMIN-012 — parent JWT cannot access /api/admin/plans (returns 403)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/plans`, {
      headers: parentAuthHeaders(),
    });
    expect(
      res.status(),
      `GET /api/admin/plans with parent JWT must return 403, got ${res.status()}`
    ).toBe(403);
  });
});
