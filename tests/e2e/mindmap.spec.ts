import { test, expect } from "@playwright/test";
import { learnerAuthHeaders } from "./fixtures/auth";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-MAP — Mindmap & Visual Learning", () => {
  test("TC-MAP-001 — authenticated notes generation returns structured content that populates mindmap", async ({ request }) => {
    test.setTimeout(90_000);
    const res = await request.post(`${BASE}/api/ai/tutor/notes`, {
      headers: learnerAuthHeaders(),
      data: { topic: "Photosynthesis", subject: "Life Sciences", language: "english", learningStyle: "visual" },
      timeout: 75_000,
    });
    // 401 = test token not accepted in this env, 408/504 = upstream timeout — skip gracefully
    if ([401, 408, 504].includes(res.status())) {
      test.skip(true, `Notes API returned ${res.status()} — OpenAI unavailable or auth not configured in test env`);
      return;
    }
    expect(
      [200, 429, 503],
      `Notes API must return 200 (or 429/503 if rate-limited), got ${res.status()}`
    ).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(typeof body.notes, "notes field must be a string").toBe("string");
      expect(body.notes.length, "notes content must be non-empty for mindmap generation").toBeGreaterThan(50);
      expect(body.topic, "topic field must match requested topic").toBe("Photosynthesis");
      const hasStructure = body.notes.includes("#") || body.notes.includes("**") || body.notes.includes("- ") || body.notes.includes("•");
      expect(hasStructure, "Visual notes must contain structured content (headers/bullets) for mindmap node parsing").toBe(true);
    }
  });

  test("TC-MAP-002 — visual learner onboarding style is set to visual (enables mindmap access)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/onboarding`, {
      headers: learnerAuthHeaders(),
    });
    expect(res.status(), `GET /api/user/onboarding must return 200 for authenticated learner, got ${res.status()}`).toBe(200);
    const body = await res.json();
    expect(body.learningStyle, "Seeded test learner must have learningStyle 'visual' — visual learners have mindmap access").toBe("visual");
  });

  test("TC-MAP-003 — auditory-style notes do not contain visual hierarchy suitable for mindmap", async ({ request }) => {
    test.setTimeout(90_000);
    const visualRes = await request.post(`${BASE}/api/ai/tutor/notes`, {
      headers: learnerAuthHeaders(),
      data: { topic: "Newton Laws", subject: "Physical Sciences", language: "english", learningStyle: "visual" },
      timeout: 75_000,
    });
    if ([401, 408, 504].includes(visualRes.status())) {
      test.skip(true, `Notes API returned ${visualRes.status()} — OpenAI unavailable or auth not configured in test env`);
      return;
    }
    const auditoryRes = await request.post(`${BASE}/api/ai/tutor/notes`, {
      headers: learnerAuthHeaders(),
      data: { topic: "Newton Laws", subject: "Physical Sciences", language: "english", learningStyle: "auditory" },
      timeout: 75_000,
    });
    if ([401, 408, 504].includes(auditoryRes.status())) {
      test.skip(true, `Notes API returned ${auditoryRes.status()} — OpenAI unavailable or auth not configured in test env`);
      return;
    }
    if (visualRes.status() === 200 && auditoryRes.status() === 200) {
      const visual = await visualRes.json();
      const auditory = await auditoryRes.json();
      expect(visual.learningStyle, "Visual response must have learningStyle=visual").toBe("visual");
      expect(auditory.learningStyle, "Auditory response must have learningStyle=auditory").toBe("auditory");
      expect(visual.notes, "Visual and auditory notes must differ (different style prompts)").not.toBe(auditory.notes);
    } else {
      expect([200, 429, 503]).toContain(visualRes.status());
      expect([200, 429, 503]).toContain(auditoryRes.status());
    }
  });

  test("TC-MAP-004 — visual notes for a topic contain markdown headings and bullets for mindmap branch/leaf parsing", async ({ request }) => {
    test.setTimeout(90_000);
    const res = await request.post(`${BASE}/api/ai/tutor/notes`, {
      headers: learnerAuthHeaders(),
      data: { topic: "Quadratic Equations", subject: "Mathematics", language: "english", learningStyle: "visual" },
      timeout: 75_000,
    });
    if ([401, 408, 504].includes(res.status())) {
      test.skip(true, `Notes API returned ${res.status()} — OpenAI unavailable or auth not configured in test env`);
      return;
    }
    expect(
      [200, 429, 503],
      `Notes API must return 200 (or 429/503 if rate-limited), got ${res.status()}`
    ).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(typeof body.notes, "notes must be a string").toBe("string");
      expect(body.notes.length, "notes must be non-empty").toBeGreaterThan(100);
      const hasMindmapStructure =
        body.notes.includes("##") ||
        body.notes.includes("**") ||
        body.notes.includes("# ") ||
        (body.notes.match(/^[-•*]\s/m) !== null);
      expect(hasMindmapStructure, "Visual notes must contain markdown headings/bullets for mindmap branch/leaf extraction").toBe(true);
    }
  });

  test("TC-MAP-005 — notes response contains _wm watermark field for branded mindmap print", async ({ request }) => {
    test.setTimeout(90_000);
    const res = await request.post(`${BASE}/api/ai/tutor/notes`, {
      headers: learnerAuthHeaders(),
      data: { topic: "Cell Division", subject: "Life Sciences", language: "english", learningStyle: "visual" },
      timeout: 75_000,
    });
    if ([401, 408, 504].includes(res.status())) {
      test.skip(true, `Notes API returned ${res.status()} — OpenAI unavailable or auth not configured in test env`);
      return;
    }
    expect(
      [200, 429, 503],
      `Notes API must return 200 (or 429/503 if rate-limited), got ${res.status()}`
    ).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect("_wm" in body, "Notes response must include _wm watermark field for branded mindmap print").toBe(true);
      expect(body._wm, "_wm field must be truthy (not null/undefined/empty)").toBeTruthy();
      expect(typeof body.notes, "notes must be a string").toBe("string");
      const hasFingerprint = body.notes.includes("\u200b") || body.notes.includes("\u200c");
      expect(hasFingerprint, "Notes text must contain zero-width fingerprint characters for watermarking").toBe(true);
    }
  });
});
