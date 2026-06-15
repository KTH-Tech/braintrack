import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-TUTOR — Smart Tutor page and API", () => {
  test("TC-TUTOR-001 — /tutor page renders without crashing for unauthenticated users", async ({ page }) => {
    await page.goto(`${BASE}/tutor`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/cannot read properties|typeerror|something went wrong/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "/tutor page must not throw visible JS errors").toBe(false);
  });

  test("TC-TUTOR-002 — POST /api/ai/tutor requires authentication", async ({ request }) => {
    const res = await request.post(`${BASE}/api/ai/tutor`, {
      data: {
        questionId: 1,
        mode: "hint",
        userMessage: "help",
      },
    });
    expect(
      [401, 403],
      `POST /api/ai/tutor must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-TUTOR-003 — POST /api/tutor/feedback requires authentication", async ({ request }) => {
    const res = await request.post(`${BASE}/api/tutor/feedback`, {
      data: { sessionId: 1, rating: 5 },
    });
    expect(
      [401, 403],
      `POST /api/tutor/feedback must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-TUTOR-004 — GET /api/user/usage (tutor usage limits) requires authentication", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/usage`);
    expect(
      [401, 403],
      `GET /api/user/usage must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });
});
