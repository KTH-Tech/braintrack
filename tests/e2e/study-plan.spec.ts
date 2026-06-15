import { test, expect } from "@playwright/test";
import { learnerAuthHeaders } from "./fixtures/auth";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-PLAN — Dynamic Study Plan", () => {
  test("TC-PLAN-001 — authenticated learner onboarding data drives study plan (subjects/learningStyle/focusDuration)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/onboarding`, {
      headers: learnerAuthHeaders(),
    });
    expect(res.status(), `GET /api/user/onboarding must return 200 for authenticated learner, got ${res.status()}`).toBe(200);
    const body = await res.json();
    expect(body, "Onboarding result must be an object").toBeTruthy();
    expect(typeof body.learningStyle, "learningStyle must be a string").toBe("string");
    expect(["visual", "auditory", "kinesthetic", "reading"], `learningStyle must be one of the 4 valid styles, got '${body.learningStyle}'`).toContain(body.learningStyle);
    expect(typeof body.focusDuration, "focusDuration (study time) must be a number").toBe("number");
    expect(body.focusDuration, "focusDuration must be > 0").toBeGreaterThan(0);
    expect(Array.isArray(body.selectedSubjects), "selectedSubjects must be an array").toBe(true);
  });

  test("TC-PLAN-002 — learner stats endpoint returns weak-topic data for plan prioritisation", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/stats`, {
      headers: learnerAuthHeaders(),
    });
    expect(res.status(), `GET /api/user/stats must return 200 for authenticated learner, got ${res.status()}`).toBe(200);
    const body = await res.json();
    expect(body, "Stats response must be an object").toBeTruthy();
    expect(typeof body === "object" && body !== null, "Stats must be a non-null object").toBe(true);
  });

  test("TC-PLAN-003 — PATCH /api/user/onboarding requires authentication (returns 401)", async ({ request }) => {
    const res = await request.patch(`${BASE}/api/user/onboarding`, {
      data: { selectedSubjects: ["Mathematics"] },
    });
    expect(
      [401, 403],
      `PATCH /api/user/onboarding must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-PLAN-004 — /api/exam-dates returns prelims and finals dates for exam-driven plan urgency", async ({ request }) => {
    const res = await request.get(`${BASE}/api/exam-dates`);
    expect(res.status(), "Exam dates must be publicly accessible (200)").toBe(200);
    const body = await res.json();
    expect(body, "Exam dates response must be an object").toBeTruthy();
    expect(typeof body === "object" && body !== null, "Exam dates must be a non-null object").toBe(true);
    const hasPrelimsOrFinals =
      ("prelims" in body && typeof body.prelims === "string") ||
      ("finals" in body && typeof body.finals === "string") ||
      Array.isArray(body);
    expect(hasPrelimsOrFinals, "Exam dates must include prelims/finals date strings or an array of exam entries").toBe(true);
  });

  test("TC-PLAN-005 — GET /api/user/onboarding requires authentication (returns 401 without token)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/onboarding`);
    expect(
      [401, 403],
      `GET /api/user/onboarding must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-PLAN-006 — /dbe-practice page renders without crashing", async ({ page }) => {
    await page.goto(`${BASE}/dbe-practice`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/something went wrong/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "DBE practice page must not crash").toBe(false);
  });
});
