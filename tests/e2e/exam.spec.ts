import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-EXAM — Exam Mode & Timed Sessions", () => {
  test("TC-EXAM-001 — /api/exam-dates returns upcoming exam dates", async ({ request }) => {
    const res = await request.get(`${BASE}/api/exam-dates`);
    expect(res.status(), "Exam dates endpoint must return 200").toBe(200);
    const body = await res.json();
    expect(typeof body === "object" || Array.isArray(body)).toBe(true);
  });

  test("TC-EXAM-002 — /api/exam-countdown returns countdown data", async ({ request }) => {
    const res = await request.get(`${BASE}/api/exam-countdown`);
    expect(res.status(), "Exam countdown must return 200").toBe(200);
    const body = await res.json();
    expect(typeof body === "object" || Array.isArray(body)).toBe(true);
  });

  test("TC-EXAM-003 — creating an exam session requires authentication (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/exam-sessions`, {
      data: { paperId: 1, duration: 60 },
    });
    expect(
      [401, 403],
      `POST /api/exam-sessions must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-EXAM-004 — listing exam sessions requires authentication (returns 401)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/exam-sessions`);
    expect(
      [401, 403],
      `GET /api/exam-sessions must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-EXAM-005 — submitting an exam session requires authentication (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/exam-sessions/1/submit`, {
      data: { answers: [] },
    });
    expect(
      [401, 403],
      `POST /api/exam-sessions/:id/submit must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-EXAM-006 — /exam-mode page body renders for unauthenticated users without crashing", async ({ page }) => {
    await page.goto(`${BASE}/exam-mode`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/cannot read properties|typeerror/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "/exam-mode page must not throw visible JS errors").toBe(false);
  });

  test("TC-EXAM-007 — /past-papers public page loads without crashing", async ({ page }) => {
    await page.goto(`${BASE}/past-papers`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/something went wrong/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "Past papers page must not crash").toBe(false);
  });

  test("TC-EXAM-008 — /api/exam-papers public endpoint returns an array", async ({ request }) => {
    const res = await request.get(`${BASE}/api/exam-papers`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body), "Exam papers must return an array").toBe(true);
  });
});

test.describe("TC-DAILY — Daily Challenge page and API", () => {
  test("TC-DAILY-001 — /api/daily-challenge requires authentication", async ({ request }) => {
    const res = await request.get(`${BASE}/api/daily-challenge`);
    expect(
      [401, 403],
      `GET /api/daily-challenge must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-DAILY-002 — /daily-challenge page renders without crashing for unauthenticated users", async ({ page }) => {
    await page.goto(`${BASE}/daily-challenge`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/cannot read properties|typeerror|something went wrong/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "/daily-challenge page must not throw visible JS errors").toBe(false);
  });

  test("TC-DAILY-003 — /api/daily-challenge/history requires authentication", async ({ request }) => {
    const res = await request.get(`${BASE}/api/daily-challenge/history`);
    expect(
      [401, 403],
      `GET /api/daily-challenge/history must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });
});

test.describe("TC-CRUNCH — Crunch Time (BST Exam) page and API", () => {
  test("TC-CRUNCH-001 — /bst-exam page renders without crashing for unauthenticated users", async ({ page }) => {
    await page.goto(`${BASE}/bst-exam`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/cannot read properties|typeerror|something went wrong/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "/bst-exam page must not throw visible JS errors").toBe(false);
  });

  test("TC-CRUNCH-002 — /api/bst/papers requires authentication", async ({ request }) => {
    const res = await request.get(`${BASE}/api/bst/papers`);
    expect(
      [401, 403],
      `GET /api/bst/papers must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-CRUNCH-003 — /api/bst/topic-weights requires authentication", async ({ request }) => {
    const res = await request.get(`${BASE}/api/bst/topic-weights`);
    expect(
      [401, 403],
      `GET /api/bst/topic-weights must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-CRUNCH-004 — submitting a BST exam requires authentication", async ({ request }) => {
    const res = await request.post(`${BASE}/api/bst/submit`, {
      data: { paperId: 1, answers: [] },
    });
    expect(
      [401, 403],
      `POST /api/bst/submit must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });
});

test.describe("TC-BOOST — Boost Quiz & Subject Revision page and API", () => {
  test("TC-BOOST-001 — GET /api/subjects/:id/boost/quiz requires authentication", async ({ request }) => {
    const res = await request.get(`${BASE}/api/subjects/1/boost/quiz`);
    expect(
      [401, 403],
      `GET /api/subjects/:id/boost/quiz must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-BOOST-002 — POST /api/subjects/:id/boost/quiz/submit requires authentication", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subjects/1/boost/quiz/submit`, {
      data: { answers: [] },
    });
    expect(
      [401, 403],
      `POST /api/subjects/:id/boost/quiz/submit must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-BOOST-003 — /subject/:id page renders without crashing for unauthenticated users", async ({ page }) => {
    await page.goto(`${BASE}/subject/1`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/cannot read properties|typeerror|something went wrong/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "/subject/:id page must not throw visible JS errors").toBe(false);
  });
});
