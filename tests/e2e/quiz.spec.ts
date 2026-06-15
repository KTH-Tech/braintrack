import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-QUIZ — Question Bank & Quiz Engine", () => {
  test("TC-QUIZ-001 — /api/exam-papers public endpoint returns an array of papers", async ({ request }) => {
    const res = await request.get(`${BASE}/api/exam-papers`);
    expect(res.status(), "Exam papers endpoint must return 200").toBe(200);
    const body = await res.json();
    expect(Array.isArray(body), "Exam papers must be an array").toBe(true);
  });

  test("TC-QUIZ-002 — /api/exam-papers/:id/questions requires auth or valid ID", async ({ request }) => {
    const res = await request.get(`${BASE}/api/exam-papers/99999/questions`);
    expect(
      [200, 401, 403, 404],
      `Should return 200, 401, 403 or 404, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-QUIZ-003 — /api/simulated/subjects public endpoint returns subjects", async ({ request }) => {
    const res = await request.get(`${BASE}/api/simulated/subjects`);
    expect(res.status(), "Simulated subjects must return 200").toBe(200);
    const body = await res.json();
    expect(typeof body === "object" || Array.isArray(body)).toBe(true);
  });

  test("TC-QUIZ-004 — /api/subjects/:id (public) returns subject data for ID 1", async ({ request }) => {
    const res = await request.get(`${BASE}/api/subjects/1`);
    expect([200, 404]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.id || body.code || body.name).toBeTruthy();
    }
  });

  test("TC-QUIZ-005 — /api/subjects/:id/papers returns paper list for subject 1", async ({ request }) => {
    const res = await request.get(`${BASE}/api/subjects/1/papers`);
    expect([200, 404]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(Array.isArray(body) || typeof body === "object").toBe(true);
    }
  });

  test("TC-QUIZ-006 — /api/subjects/:id/topics requires authentication", async ({ request }) => {
    const res = await request.get(`${BASE}/api/subjects/1/topics`);
    expect(
      [401, 403],
      `Topics API must require auth, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-QUIZ-007 — /api/subjects (list) requires authentication", async ({ request }) => {
    const res = await request.get(`${BASE}/api/subjects`);
    expect(
      [401, 403],
      `Subjects list API must require auth, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-QUIZ-008 — /api/attempts (write) is blocked for unauthenticated users (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/attempts`, {
      data: { questionId: 1, answer: "test", correct: true },
    });
    expect(
      [401, 403],
      `POST /api/attempts must require auth (expected 401/403), got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-QUIZ-009 — /api/simulated/all-papers returns all simulated papers", async ({ request }) => {
    const res = await request.get(`${BASE}/api/simulated/all-papers`);
    expect(res.status(), "All papers endpoint must return 200").toBe(200);
    const body = await res.json();
    expect(typeof body === "object" || Array.isArray(body)).toBe(true);
  });
});
