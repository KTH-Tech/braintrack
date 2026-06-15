import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-ONB — Onboarding Flow", () => {
  test("TC-ONB-001 — /onboarding page renders body without crashing", async ({ page }) => {
    await page.goto(`${BASE}/onboarding`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/something went wrong|unhandled error|cannot read properties/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "Onboarding page must not crash").toBe(false);
  });

  test("TC-ONB-002 — /api/user/onboarding-status requires authentication", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/onboarding-status`);
    expect(
      [401, 403],
      `Onboarding status must require auth, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-ONB-003 — POST /api/onboarding requires authentication (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/onboarding`, {
      data: {
        subjects: ["Mathematics", "Physical Sciences"],
        learningStyle: "visual",
        language: "en",
        gradeLevel: 12,
      },
    });
    expect(
      [401, 403],
      `Onboarding POST must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-ONB-004 — /role-select page renders without crashing for unauthenticated users", async ({ page }) => {
    await page.goto(`${BASE}/role-select`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/something went wrong|unhandled error|cannot read properties/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "Role select page must not crash for unauthenticated users").toBe(false);
  });
});
