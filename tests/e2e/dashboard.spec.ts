import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-DASH — Dashboard & Subject Views", () => {
  test("TC-DASH-001 — /dashboard page renders body without crashing", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/something went wrong|unhandled error|cannot read properties/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "/dashboard must not crash for unauthenticated users").toBe(false);
  });

  test("TC-DASH-002 — /api/user/stats requires authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/stats`);
    expect(
      [401, 403],
      `Stats API must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-DASH-003 — /api/subjects requires authentication (subject list gated per learner)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/subjects`);
    expect(
      [401, 403],
      `Subjects list API must require auth, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-DASH-004 — /api/user/streak requires authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/streak`);
    expect(
      [401, 403],
      `Streak API must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-DASH-005 — /api/user/badges requires authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/badges`);
    expect(
      [401, 403],
      `Badges API must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });
});
