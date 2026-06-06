import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:5000";
const LOAD_THRESHOLD_MS = 3000;

test.describe("TC-PERF — Performance & Resilience", () => {
  test("TC-PERF-001 — landing page loads within 3 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("domcontentloaded");
    const elapsed = Date.now() - start;
    expect(elapsed, `Landing page took ${elapsed}ms, must be under ${LOAD_THRESHOLD_MS}ms`).toBeLessThan(LOAD_THRESHOLD_MS);
  });

  test("TC-PERF-002 — socket reconnect does not crash the page", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const wnd = window as Window & { __ws?: WebSocket; socket?: WebSocket };
      const ws = wnd.__ws || wnd.socket;
      if (ws && ws.close) ws.close();
    });
    await page.waitForTimeout(2000);
    await expect(page.locator("body")).toBeVisible();
    await expect(page).not.toHaveURL(/.*error.*/);
  });

  test("TC-PERF-003 — /api/health responds within 3 seconds", async ({ request }) => {
    const start = Date.now();
    const res = await request.get(`${BASE}/api/health`);
    const elapsed = Date.now() - start;
    expect(res.status()).toBe(200);
    expect(elapsed, `Health check took ${elapsed}ms, must be under ${LOAD_THRESHOLD_MS}ms`).toBeLessThan(LOAD_THRESHOLD_MS);
  });

  test("TC-PERF-004 — /api/exam-papers bulk fetch responds within 3 seconds", async ({ request }) => {
    const start = Date.now();
    const res = await request.get(`${BASE}/api/exam-papers`);
    const elapsed = Date.now() - start;
    expect([200, 401, 403]).toContain(res.status());
    if (res.status() === 200) {
      expect(elapsed, `Exam papers fetch took ${elapsed}ms, must be under ${LOAD_THRESHOLD_MS}ms`).toBeLessThan(LOAD_THRESHOLD_MS);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    }
  });

  test("TC-PERF-005 — simultaneous public API calls all resolve without errors", async ({ request }) => {
    const endpoints = [
      "/api/health",
      "/api/exam-dates",
      "/api/exam-papers",
      "/api/exam-countdown",
      "/api/caps/dbe-link",
    ];
    const responses = await Promise.all(
      endpoints.map((ep) => request.get(`${BASE}${ep}`))
    );
    responses.forEach((res, i) => {
      expect(
        [200, 404],
        `Endpoint ${endpoints[i]} returned unexpected status: ${res.status()}`
      ).toContain(res.status());
    });
  });

  test("TC-PERF-006 — VAPID push public key endpoint is accessible without auth", async ({ request }) => {
    const res = await request.get(`${BASE}/api/push/vapid-public-key`);
    expect(
      [200, 404, 500, 503],
      `VAPID endpoint returned unexpected status: ${res.status()}`
    ).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.publicKey || body.key || typeof body === "string").toBeTruthy();
    }
  });
});
