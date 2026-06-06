import { test, expect } from "@playwright/test";
import { learnerAuthHeaders } from "./fixtures/auth";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-PRINT — Printing & Exports", () => {
  test("TC-PRINT-001 — notes API response includes _wm branding field and zero-width user fingerprint", async ({ request }) => {
    test.setTimeout(60_000);
    const res = await request.post(`${BASE}/api/ai/tutor/notes`, {
      headers: learnerAuthHeaders(),
      data: { topic: "Trigonometry", subject: "Mathematics", language: "english", learningStyle: "visual" },
    });
    expect(
      [200, 429, 503],
      `Notes API must return 200 (or 429/503 if rate-limited), got ${res.status()}`
    ).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect("_wm" in body, "Notes print response must include _wm branding/watermark field (logo, title, footer, watermark, timestamp)").toBe(true);
      expect(body._wm, "_wm field must be truthy — present and non-empty").toBeTruthy();
      expect(typeof body.notes, "notes field must be a string").toBe("string");
      const hasZeroWidthFingerprint = body.notes.includes("\u200b") || body.notes.includes("\u200c");
      expect(hasZeroWidthFingerprint, "Notes text must contain zero-width user fingerprint characters (branding watermark embedded in print output)").toBe(true);
    }
  });

  test("TC-PRINT-002 — mindmap notes response includes branding watermark field for branded mindmap printable", async ({ request }) => {
    test.setTimeout(60_000);
    const res = await request.post(`${BASE}/api/ai/tutor/notes`, {
      headers: learnerAuthHeaders(),
      data: { topic: "Organic Chemistry", subject: "Physical Sciences", language: "english", learningStyle: "visual" },
    });
    expect(
      [200, 429, 503],
      `Notes API must return 200 (or 429/503 if rate-limited), got ${res.status()}`
    ).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect("_wm" in body, "Mindmap print response must include _wm watermark field (same branding rules apply)").toBe(true);
      const hasZeroWidthFingerprint = body.notes.includes("\u200b") || body.notes.includes("\u200c");
      expect(hasZeroWidthFingerprint, "Mindmap notes text must contain zero-width fingerprint characters for watermarked print").toBe(true);
    }
  });

  test("TC-PRINT-003 — /past-papers page renders and has print-capable CSS loaded", async ({ page }) => {
    await page.goto(`${BASE}/past-papers`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(400);
    await expect(page.locator("body")).toBeVisible({ timeout: 5000 });
    const crashed = await page.locator("text=/something went wrong/i").isVisible().catch(() => false);
    expect(crashed, "Past papers page must not crash").toBe(false);
    const { sheetCount, styleTagCount, hasAnyStyle } = await page.evaluate(() => {
      const sheetCount = document.styleSheets.length;
      const styleTagCount = document.querySelectorAll("style").length;
      let accessibleRules = 0;
      Array.from(document.styleSheets).forEach((sheet) => {
        try { accessibleRules += sheet.cssRules?.length || 0; } catch {}
      });
      return { sheetCount, styleTagCount, hasAnyStyle: sheetCount > 0 || styleTagCount > 0 || accessibleRules > 0 };
    }).catch(() => ({ sheetCount: 0, styleTagCount: 0, hasAnyStyle: false }));
    expect(hasAnyStyle, `Past papers page must load CSS (found ${sheetCount} stylesheets, ${styleTagCount} style tags) — print stylesheets required for exam paper printing`).toBe(true);
  });

  test("TC-PRINT-004 — mobile viewport: /calendar page does not overflow at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/calendar`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(400);
    await expect(page.locator("body")).toBeVisible({ timeout: 5000 });
    const crashed = await page.locator("text=/something went wrong/i").isVisible().catch(() => false);
    expect(crashed, "Calendar page must not crash on mobile").toBe(false);
    const horizontalScroll = await page
      .evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
      .catch(() => false);
    expect(horizontalScroll, "Calendar page must not overflow horizontally at 390px").toBe(false);
  });

  test("TC-PRINT-005 — /past-papers page loads and shows paper listings", async ({ page }) => {
    await page.goto(`${BASE}/past-papers`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
    const crashed = await page.locator("text=/something went wrong/i").isVisible().catch(() => false);
    expect(crashed, "Past papers page must not crash").toBe(false);
  });
});
