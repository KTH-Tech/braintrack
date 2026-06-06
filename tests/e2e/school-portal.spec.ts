import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-SCHOOL — School Portal", () => {
  test("TC-SCHOOL-001 — /partner-schools page renders without crashing", async ({ page }) => {
    await page.goto(`${BASE}/partner-schools`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page.locator("text=/something went wrong/i").isVisible().catch(() => false);
    expect(crashed, "Partner schools page must not crash").toBe(false);
  });

  test("TC-SCHOOL-002 — /api/partner-schools requires authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/partner-schools`);
    expect(
      [401, 403],
      `GET /api/partner-schools must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-SCHOOL-003 — /api/partner-schools/code/:code lookup is public", async ({ request }) => {
    const res = await request.get(`${BASE}/api/partner-schools/code/TEST-CODE`);
    expect(
      [200, 404],
      `School code lookup returned unexpected status: ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-SCHOOL-004 — /api/admin/reports/parents requires admin role (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/reports/parents`);
    expect(
      [401, 403],
      `GET /api/admin/reports/parents must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-SCHOOL-005 — /api/admin/reports/schools requires admin role (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/reports/schools`);
    expect(
      [401, 403],
      `GET /api/admin/reports/schools must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });
});

test.describe("TC-PARTNER — Partner Portal", () => {
  test("TC-PARTNER-001 — /api/partner-schools/:id/referral-link requires authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/partner-schools/1/referral-link`);
    expect(
      [401, 403],
      `GET /api/partner-schools/:id/referral-link must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-PARTNER-002 — /api/partner-schools/track-referral requires authentication (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/partner-schools/track-referral`, {
      data: { schoolCode: "TEST", source: "sms" },
    });
    expect(
      [401, 403],
      `Track referral must require authentication (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-PARTNER-003 — /api/partner-schools/:id/stats requires authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/partner-schools/1/stats`);
    expect(
      [401, 403],
      `GET /api/partner-schools/:id/stats must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });
});
