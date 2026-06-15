import { test, expect } from "@playwright/test";
import { parentAuthHeaders } from "./fixtures/auth";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-PARENT — Parent Dashboard & Realtime", () => {
  test("TC-PARENT-001 — /parent-dashboard renders body without crashing", async ({ page }) => {
    await page.goto(`${BASE}/parent-dashboard`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/something went wrong|unhandled error/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "Parent dashboard must not show a crash error").toBe(false);
  });

  test("TC-PARENT-002 — authenticated parent gets child-progress data with required fields", async ({ request }) => {
    const res = await request.get(`${BASE}/api/parent/child-progress`, {
      headers: parentAuthHeaders(),
    });
    expect(res.status(), `Authenticated parent GET /api/parent/child-progress must return 200, got ${res.status()}`).toBe(200);
    const body = await res.json();
    expect(body, "child-progress body must be an object").toBeTruthy();
    expect(typeof body.learnerName, "learnerName must be a string").toBe("string");
    expect(typeof body.currentStreak, "currentStreak must be a number").toBe("number");
    expect(typeof body.overallAccuracy, "overallAccuracy must be a number").toBe("number");
    expect(body.currentStreak, "currentStreak must be ≥ 0").toBeGreaterThanOrEqual(0);
  });

  test("TC-PARENT-003 — /api/parent/feedback POST requires authentication (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/parent/feedback`, {
      data: { message: "My child is improving", rating: 5 },
    });
    expect(
      [401, 403],
      `Parent feedback API must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-PARENT-004 — /parent-purchase page renders without crashing", async ({ page }) => {
    await page.goto(`${BASE}/parent-purchase`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/something went wrong|unhandled error/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "Parent purchase page must not crash").toBe(false);
  });

  test("TC-PARENT-005 — /api/user/subscription-status requires authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/subscription-status`);
    expect(
      [401, 403],
      `Subscription status API must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-PARENT-006 — /api/user/subscription requires authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/subscription`);
    expect(
      [401, 403],
      `Subscription API must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });
});
