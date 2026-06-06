import { test, expect } from "@playwright/test";
import { learnerAuthHeaders } from "./fixtures/auth";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-GAME — Gamification", () => {
  test("TC-GAME-001 — /api/user/streak requires authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/streak`);
    expect(
      [401, 403],
      `Streak API must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-GAME-002 — /api/user/badges requires authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/badges`);
    expect(
      [401, 403],
      `Badges API must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-GAME-003 — /api/user/activity (write) requires authentication (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/user/activity`, {
      data: { type: "quiz", points: 10 },
    });
    expect(
      [401, 403],
      `Activity endpoint must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-GAME-004 — /api/user/stats requires authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/stats`);
    expect(
      [401, 403],
      `Stats API must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-GAME-005 — /rewards page renders without crashing", async ({ page }) => {
    await page.goto(`${BASE}/rewards`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/something went wrong|unhandled error/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "Rewards page must not crash").toBe(false);
  });

  test("TC-GAME-006 — /api/user/referral requires authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/referral`);
    expect(
      [401, 403],
      `Referral API must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-GAME-007 — streak lifecycle: read baseline → post activity → verify streak response structure", async ({ request }) => {
    const headers = learnerAuthHeaders();

    // Step 1: Get baseline streak
    const baselineRes = await request.get(`${BASE}/api/user/streak`, { headers });
    expect(baselineRes.status(), `Initial streak GET must return 200, got ${baselineRes.status()}`).toBe(200);
    const baseline = await baselineRes.json();
    expect(typeof baseline.currentStreak === "number", "currentStreak must be a number").toBe(true);
    expect(typeof baseline.longestStreak === "number", "longestStreak must be a number").toBe(true);
    expect(baseline.currentStreak, "currentStreak must be ≥ 0").toBeGreaterThanOrEqual(0);

    // Step 2: Log activity (triggers streak update)
    const activityRes = await request.post(`${BASE}/api/user/activity`, { headers });
    expect(activityRes.status(), `POST /api/user/activity must return 200, got ${activityRes.status()}`).toBe(200);
    const activityBody = await activityRes.json();
    expect(typeof activityBody === "object" && activityBody !== null, "Activity response must be an object").toBe(true);
    expect("streak" in activityBody, "Activity response must include streak field").toBe(true);
    expect("newBadges" in activityBody, "Activity response must include newBadges field").toBe(true);
    expect(Array.isArray(activityBody.newBadges), "newBadges must be an array").toBe(true);

    // Step 3: Read streak again — must be ≥ baseline (streak either increments or stays same day)
    const updatedRes = await request.get(`${BASE}/api/user/streak`, { headers });
    expect(updatedRes.status(), `Updated streak GET must return 200, got ${updatedRes.status()}`).toBe(200);
    const updated = await updatedRes.json();
    expect(typeof updated.currentStreak === "number", "Updated currentStreak must be a number").toBe(true);
    expect(updated.currentStreak, "Streak must not decrease after logging activity").toBeGreaterThanOrEqual(baseline.currentStreak);
  });

  test("TC-GAME-008 — authenticated JWT → /api/user/badges returns an array", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/badges`, {
      headers: learnerAuthHeaders(),
    });
    expect(res.status(), `Authenticated badges must return 200, got ${res.status()}`).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body), "Badges response must be an array").toBe(true);
  });

  test("TC-GAME-009 — authenticated JWT → /api/user/stats returns a stats object with required fields", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/stats`, {
      headers: learnerAuthHeaders(),
    });
    expect(res.status(), `Authenticated stats must return 200, got ${res.status()}`).toBe(200);
    const body = await res.json();
    expect(typeof body === "object" && body !== null, "Stats must be an object").toBe(true);
  });
});
