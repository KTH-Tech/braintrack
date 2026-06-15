import { test, expect } from "@playwright/test";
import { learnerAuthHeaders } from "./fixtures/auth";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-AUDIO — Audio & Voice", () => {
  test("TC-AUDIO-001 — browser SpeechSynthesis API is available and voice list is enumerable", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("domcontentloaded");
    const result = await page.evaluate(() => {
      if (typeof window.speechSynthesis === "undefined") return { ok: false, reason: "no speechSynthesis" };
      try {
        const voices = window.speechSynthesis.getVoices();
        return { ok: true, count: voices.length, isArray: Array.isArray(voices) };
      } catch (e: unknown) {
        return { ok: false, reason: e instanceof Error ? e.message : String(e) };
      }
    });
    expect(result.ok, `speechSynthesis must be available and getVoices() must not throw: ${(result as {reason?: string}).reason ?? ""}`).toBe(true);
    expect((result as {isArray?: boolean}).isArray, "getVoices() must return an array").toBe(true);
  });

  test("TC-AUDIO-002 — notes API in auditory style returns auditory-style content for read-aloud feature", async ({ request }) => {
    test.setTimeout(60_000);
    const res = await request.post(`${BASE}/api/ai/tutor/notes`, {
      headers: learnerAuthHeaders(),
      data: { topic: "Mitosis", subject: "Life Sciences", language: "english", learningStyle: "auditory" },
    });
    expect(
      [200, 429, 503],
      `Notes API with auditory style must return 200 (or 429/503 if rate-limited), got ${res.status()}`
    ).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.learningStyle, "Response learningStyle must be auditory").toBe("auditory");
      expect(typeof body.notes, "Notes must be a string").toBe("string");
      expect(body.notes.length, "Auditory notes must be non-empty").toBeGreaterThan(50);
    }
  });

  test("TC-AUDIO-003 — learner onboarding learningStyle gates read-aloud (visual learner has non-auditory style)", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/onboarding`, {
      headers: learnerAuthHeaders(),
    });
    expect(res.status(), `GET /api/user/onboarding must return 200 for authenticated learner, got ${res.status()}`).toBe(200);
    const body = await res.json();
    expect(typeof body.learningStyle, "learningStyle must be a string").toBe("string");
    expect(["visual", "auditory", "kinesthetic", "reading"], `learningStyle must be one of 4 valid values, got '${body.learningStyle}'`).toContain(body.learningStyle);
    expect(body.learningStyle, "Seeded test learner is visual — read-aloud is gated for non-auditory learners").toBe("visual");
  });

  test("TC-AUDIO-004 — SpeechSynthesisUtterance can be constructed without error", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("domcontentloaded");
    const result = await page.evaluate(() => {
      try {
        const utterance = new SpeechSynthesisUtterance("Test");
        return { ok: typeof utterance.text === "string" };
      } catch (e: unknown) {
        return { ok: false };
      }
    });
    expect(result.ok, "SpeechSynthesisUtterance must be constructable without error").toBe(true);
  });

  test("TC-AUDIO-005 — voice consent API requires authentication (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/consent`, {
      data: { type: "audio", consent: true },
    });
    expect(
      [401, 403],
      `Consent API must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-AUDIO-006 — tutor page with mocked speech API shows no visible crash", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "speechSynthesis", {
        get: () => undefined,
        configurable: true,
      });
    });
    await page.goto(`${BASE}/tutor`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page
      .locator("text=/unhandled error|something went wrong/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "App must not crash when speech API is unavailable").toBe(false);
  });

  test("TC-AUDIO-007 — browser SpeechSynthesis API is available and can enumerate voices", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("domcontentloaded");
    const speechAvailable = await page.evaluate(() => {
      return typeof window.speechSynthesis !== "undefined";
    });
    expect(speechAvailable, "SpeechSynthesis API must be available in the browser").toBe(true);
    const voicesResult = await page.evaluate(() => {
      try {
        const voices = window.speechSynthesis.getVoices();
        return { ok: true, count: voices.length };
      } catch (e) {
        return { ok: false, count: 0 };
      }
    });
    expect(voicesResult.ok, "speechSynthesis.getVoices() must not throw").toBe(true);
  });
});
