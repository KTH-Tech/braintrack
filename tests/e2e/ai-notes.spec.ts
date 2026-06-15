import { test, expect } from "@playwright/test";
import { learnerAuthHeaders } from "./fixtures/auth";

const BASE = process.env.BASE_URL || "http://localhost:5000";

const LEARNING_STYLES = ["visual", "auditory", "reading", "kinesthetic"] as const;

test.describe("TC-AI — AI Tutor & Notes", () => {
  test("TC-AI-001 — AI tutor API requires authentication (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/ai/tutor`, {
      data: { message: "What is photosynthesis?", subjectId: 1 },
    });
    expect(
      [401, 403],
      `AI tutor must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-AI-002 — notes API returns all 4 learning-style variants (visual/auditory/reading/kinesthetic)", async ({ request }) => {
    test.setTimeout(120_000);
    const headers = learnerAuthHeaders();
    const topic = "DNA Replication";
    const subject = "Life Sciences";

    for (const style of LEARNING_STYLES) {
      const res = await request.post(`${BASE}/api/ai/tutor/notes`, {
        headers,
        data: { topic, subject, language: "english", learningStyle: style },
      });
      expect(
        [200, 429, 503],
        `Notes API for style '${style}' must return 200 (or 429/503 if rate-limited), got ${res.status()}`
      ).toContain(res.status());

      if (res.status() === 200) {
        const body = await res.json();
        expect(typeof body.notes, `notes field for style '${style}' must be a string`).toBe("string");
        expect(body.notes.length, `notes for style '${style}' must be non-empty`).toBeGreaterThan(50);
        expect(body.learningStyle, `learningStyle echo must match requested style '${style}'`).toBe(style);
        expect("_wm" in body, `notes response for style '${style}' must include _wm watermark field`).toBe(true);
      }
    }
  });

  test("TC-AI-003 — AI notes API requires authentication (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/ai/tutor/notes`, {
      data: { topic: "Photosynthesis", subject: "Life Sciences" },
    });
    expect(
      [401, 403],
      `AI notes API must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-AI-004 — AI topic explanation API requires authentication (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/ai/tutor/topic`, {
      data: { topic: "Photosynthesis", subjectId: 1 },
    });
    expect(
      [401, 403],
      `Topic explanation must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-AI-005 — CAPS adaptive explanation requires authentication (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/caps/adaptive-explanation`, {
      data: { capsCode: "MATH-12-01", subjectId: 1 },
    });
    expect(
      [401, 403],
      `Adaptive explanation must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-AI-006 — AI ask endpoint requires authentication (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/ai/tutor/ask`, {
      data: { question: "What is quadratic formula?", subjectId: 1 },
    });
    expect(
      [401, 403],
      `AI ask endpoint must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-AI-007 — XSS input in AI tutor payload is rejected (auth required, script not reflected)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/ai/tutor`, {
      data: { message: "<script>alert('xss')</script>", subjectId: 1 },
    });
    expect(
      [401, 403],
      `AI tutor with XSS payload must return 401/403 for unauthenticated request, got ${res.status()}`
    ).toContain(res.status());
    const body = await res.text();
    expect(body, "Script tag must not be reflected back in response").not.toContain("<script>alert");
  });

  test("TC-AI-008 — AI notes API rejects request with blank topic (returns 400 input validation)", async ({ request }) => {
    const headers = learnerAuthHeaders();
    const res = await request.post(`${BASE}/api/ai/tutor/notes`, {
      headers,
      data: { topic: "ab", subject: "Mathematics", language: "english", learningStyle: "visual" },
    });
    expect(
      res.status(),
      `Notes API must return 400 when topic is too short (< 3 chars), got ${res.status()}`
    ).toBe(400);
    const body = await res.json();
    expect(
      typeof body.error,
      "400 response must include an error message string"
    ).toBe("string");
  });
});
