/**
 * BrainTrack Stress Spec — TC-STRESS-001 through TC-STRESS-005
 *
 * Light concurrent stress scenarios that run inside the `page-and-public`
 * Playwright project (no auth needed). Tests are API-only — no browser launch.
 *
 * These 5 scenarios validate:
 *  - TC-STRESS-001: server handles 20 simultaneous health requests without errors
 *  - TC-STRESS-002: server handles 20 simultaneous exam-dates requests without errors
 *  - TC-STRESS-003: authLimiter fires a 429 under a 50-request flood
 *  - TC-STRESS-004: activationLimiter fires a 429 under a 50-request flood
 *  - TC-STRESS-005: server survives the flood tests (final health check passes)
 */

import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-STRESS — Concurrent Load & Rate Limiter Scenarios", () => {

  test("TC-STRESS-001 — 20 simultaneous GET /api/health requests all return 200", async ({ request }) => {
    const workers = 20;
    const responses = await Promise.all(
      Array.from({ length: workers }, () => request.get(`${BASE}/api/health`))
    );

    const statuses = responses.map((r) => r.status());
    const failures = statuses.filter((s) => s !== 200);

    expect(
      failures.length,
      `Expected all ${workers} health checks to return 200; got failures: ${failures.join(", ")}`
    ).toBe(0);
  });

  test("TC-STRESS-002 — 20 simultaneous GET /api/exam-dates requests all return 200 or 304", async ({ request }) => {
    const workers = 20;
    const responses = await Promise.all(
      Array.from({ length: workers }, () => request.get(`${BASE}/api/exam-dates`))
    );

    const statuses = responses.map((r) => r.status());
    const failures = statuses.filter((s) => s !== 200 && s !== 304);

    expect(
      failures.length,
      `Expected all ${workers} exam-dates requests to return 200 or 304; got failures: ${failures.join(", ")}`
    ).toBe(0);
  });

  test("TC-STRESS-003 — flooding POST /api/login 50 times triggers at least one 429", async ({ request }) => {
    const floodCount = 50;
    const responses = await Promise.all(
      Array.from({ length: floodCount }, () =>
        request.post(`${BASE}/api/login`, {
          headers: { "content-type": "application/json" },
          data: JSON.stringify({ username: "stress@test.invalid", password: "badpassword" }),
        })
      )
    );

    const statuses = responses.map((r) => r.status());
    const got429 = statuses.some((s) => s === 429);

    expect(
      got429,
      `Expected at least one 429 from authLimiter after ${floodCount} rapid POST /api/login requests. Statuses seen: ${[...new Set(statuses)].join(", ")}`
    ).toBe(true);
  });

  test("TC-STRESS-004 — flooding POST /api/activation/activate 50 times triggers at least one 429", async ({ request }) => {
    const floodCount = 50;
    const responses = await Promise.all(
      Array.from({ length: floodCount }, () =>
        request.post(`${BASE}/api/activation/activate`, {
          headers: { "content-type": "application/json" },
          data: JSON.stringify({ code: "STRESS-INVALID-CODE-XYZ" }),
        })
      )
    );

    const statuses = responses.map((r) => r.status());
    const got429 = statuses.some((s) => s === 429);

    expect(
      got429,
      `Expected at least one 429 from activationLimiter after ${floodCount} rapid POST /api/activation/activate requests. Statuses seen: ${[...new Set(statuses)].join(", ")}`
    ).toBe(true);
  });

  test("TC-STRESS-005 — server survives flood tests and /api/health still returns 200", async ({ request }) => {
    const res = await request.get(`${BASE}/api/health`);
    expect(
      res.status(),
      "Server should still be alive after the flood tests — final /api/health must return 200"
    ).toBe(200);
  });
});
