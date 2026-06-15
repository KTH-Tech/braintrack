import { test, expect, Page } from "@playwright/test";
import { learnerAuthHeaders } from "./fixtures/auth";

const BASE = process.env.BASE_URL || "http://localhost:5000";

/**
 * TC-READY — Study Plan widget + Readiness Scores end-to-end.
 *
 * Verifies the redesigned dynamic study plan and the new Readiness section
 * on /study-calendar render against a learner that has progress data, that
 * subject names accompany every readiness pill / row, and that the shared
 * "Mission Readiness" number is identical across:
 *   1. Dashboard hero readiness dial
 *   2. Progress page Mission Readiness bar
 *   3. Study calendar Readiness Scores chip
 */
test.describe("TC-READY — Study Plan & Readiness Scores", () => {
  /** Authenticate the page-level fetches (useAuth + react-query) for same-origin
   *  requests only. We intentionally do NOT use setExtraHTTPHeaders because that
   *  attaches the Authorization header to cross-origin requests (Google Fonts,
   *  etc.), which trips CORS preflight checks and fills the console with
   *  unrelated errors. */
  async function authPage(page: Page) {
    const auth = learnerAuthHeaders().Authorization;
    await page.route("**/*", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      const sameOrigin = url.origin === new URL(BASE).origin;
      const headers = { ...req.headers(), ...(sameOrigin ? { authorization: auth } : {}) };
      await route.continue({ headers });
    });
  }

  /** Capture meaningful browser console errors. We ignore generic
   *  "Failed to load resource" messages and HTTP 4xx/5xx surface noise from
   *  optional endpoints — those are network-layer messages, not JS exceptions,
   *  and they don't indicate the widget actually broke. We DO surface real
   *  page errors / uncaught exceptions and any other console.error. */
  function trackConsoleErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (/Failed to load resource/i.test(text)) return;
      errors.push(text);
    });
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    return errors;
  }

  test("TC-READY-001 — study plan widget shows subject names beside %, readiness pills carry name + %", async ({ page }) => {
    await authPage(page);
    const errors = trackConsoleErrors(page);

    await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });

    const widget = page.locator('[data-testid="study-plan-widget"]');
    await expect(widget, "Study Plan widget must render on /dashboard").toBeVisible({ timeout: 30000 });
    // Allow the readiness/subjects queries to populate
    await page.waitForFunction(
      () => !!document.querySelector('[data-testid^="readiness-pill-"]'),
      null,
      { timeout: 30000 }
    );

    // The widget body should contain at least one subject name beside the % pill —
    // the widget pulls subject names from /api/subjects, so a bare "%" with no
    // word characters before it indicates the regression we're guarding against.
    const widgetText = (await widget.innerText()).trim();
    expect(widgetText.length, "Study Plan widget must not be empty").toBeGreaterThan(0);
    expect(widgetText, "Study Plan widget must include a % value").toMatch(/\d+%/);

    // Readiness pills (one per seeded subject)
    const pills = page.locator('[data-testid^="readiness-pill-"]');
    const pillCount = await pills.count();
    expect(pillCount, "At least one readiness pill must render with seeded data").toBeGreaterThan(0);
    for (let i = 0; i < pillCount; i++) {
      const text = (await pills.nth(i).innerText()).replace(/\s+/g, " ").trim();
      expect(text, `Readiness pill #${i} must include a % value: "${text}"`).toMatch(/\d+%/);
      // Subject name is anything before the "·" separator and should contain letters.
      expect(text, `Readiness pill #${i} must include a subject name (alphabetical chars): "${text}"`).toMatch(/[A-Za-z]{2,}/);
    }

    expect(errors, `Browser console errors on /dashboard: ${errors.join(" | ")}`).toEqual([]);
  });

  test("TC-READY-002 — /study-calendar Readiness Scores section renders with at least one row", async ({ page }) => {
    await authPage(page);
    const errors = trackConsoleErrors(page);

    await page.goto(`${BASE}/study-calendar`, { waitUntil: "domcontentloaded" });

    const section = page.locator('[data-testid="study-calendar-readiness"]');
    await expect(section, "Readiness Scores section must be visible on /study-calendar").toBeVisible({ timeout: 30000 });

    const rows = page.locator('[data-testid^="readiness-row-"]');
    const rowCount = await rows.count();
    expect(rowCount, "At least one readiness row must render on /study-calendar").toBeGreaterThan(0);
    for (let i = 0; i < rowCount; i++) {
      const text = (await rows.nth(i).innerText()).replace(/\s+/g, " ").trim();
      expect(text, `Readiness row #${i} must include a subject name: "${text}"`).toMatch(/[A-Za-z]{2,}/);
      expect(text, `Readiness row #${i} must include a % value: "${text}"`).toMatch(/\d+%/);
    }

    expect(errors, `Browser console errors on /study-calendar: ${errors.join(" | ")}`).toEqual([]);
  });

  test("TC-READY-003 — overall Readiness number is identical on dashboard hero, progress page, and study calendar", async ({ page, request }) => {
    await authPage(page);

    // Compute expected readiness from /api/user/stats using the shared formula
    // (mirrors client/src/lib/readiness.ts → calcReadiness).
    const statsRes = await request.get(`${BASE}/api/user/stats`, { headers: learnerAuthHeaders() });
    expect(statsRes.ok(), "Stats endpoint must succeed for the seeded learner").toBe(true);
    const stats = await statsRes.json();
    const acc = Math.max(0, Math.min(100, Number(stats.accuracy ?? 0) || 0));
    const streak = Math.max(0, Number(stats.studyStreak ?? 0) || 0);
    const qAnswered = Math.max(0, Number(stats.questionsAnswered ?? 0) || 0);
    const streakPart = streak >= 7 ? 35 : streak >= 3 ? 25 : streak >= 1 ? 15 : 0;
    const questionsPart = Math.min(35, qAnswered / 3);
    const accuracyPart = Math.min(30, acc * 0.3);
    const expectedReadiness = Math.min(100, Math.round(streakPart + questionsPart + accuracyPart));

    // 1) Dashboard hero readiness dial
    await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="hero-readiness-value"]').first()).toBeVisible({ timeout: 30000 });
    // Wait for the readiness number to settle to its computed (non-zero) value.
    await page.waitForFunction(
      (target) => {
        const el = document.querySelector('[data-testid="hero-readiness-value"]');
        return !!el && Number((el.textContent || "").trim()) === target;
      },
      expectedReadiness,
      { timeout: 30000 }
    );
    // SVG <text> elements expose textContent, not innerText.
    const heroVal = (await page.locator('[data-testid="hero-readiness-value"]').first().textContent()) || "";
    const heroNum = Number(heroVal.trim());
    expect(heroNum, `Dashboard hero readiness "${heroVal}" must equal computed ${expectedReadiness}`).toBe(expectedReadiness);

    // 2) Progress page Mission Readiness bar
    await page.goto(`${BASE}/progress`, { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="mission-readiness-value"]').first()).toBeVisible({ timeout: 30000 });
    await page.waitForFunction(
      (target) => {
        const el = document.querySelector('[data-testid="mission-readiness-value"]');
        if (!el) return false;
        const m = (el.textContent || "").match(/(\d+)/);
        return !!m && Number(m[1]) === target;
      },
      expectedReadiness,
      { timeout: 30000 }
    );
    const missionVal = await page.locator('[data-testid="mission-readiness-value"]').first().innerText();
    const missionNum = Number(missionVal.replace("%", "").trim());
    expect(missionNum, `Progress Mission Readiness "${missionVal}" must equal ${expectedReadiness}`).toBe(expectedReadiness);

    // 3) Study calendar Readiness chip — there are two elements with this
    // testid (study-plan widget Overall pill + dedicated section header).
    // Both must agree with the shared number.
    await page.goto(`${BASE}/study-calendar`, { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="readiness-overall"]').first()).toBeVisible({ timeout: 30000 });
    await page.waitForFunction(
      (target) => {
        const els = Array.from(document.querySelectorAll('[data-testid="readiness-overall"]'));
        if (els.length === 0) return false;
        return els.every((el) => {
          const m = (el.textContent || "").match(/(\d+)\s*%/);
          return !!m && Number(m[1]) === target;
        });
      },
      expectedReadiness,
      { timeout: 30000 }
    );
    const overall = page.locator('[data-testid="readiness-overall"]');
    const overallCount = await overall.count();
    expect(overallCount, "At least one Readiness Overall chip must be present on /study-calendar").toBeGreaterThan(0);
    for (let i = 0; i < overallCount; i++) {
      const txt = (await overall.nth(i).innerText()).trim();
      const m = txt.match(/(\d+)\s*%/);
      expect(m, `Readiness Overall chip #${i} must contain a % value: "${txt}"`).not.toBeNull();
      const num = Number(m![1]);
      expect(num, `Readiness Overall chip #${i} = ${num}, must equal ${expectedReadiness}`).toBe(expectedReadiness);
    }
  });
});
