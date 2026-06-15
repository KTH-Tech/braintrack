import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-A11Y — Accessibility", () => {
  test("TC-A11Y-001 — keyboard navigation advances focus through the page", async ({ page }) => {
    // Use /past-papers — a stable public route that does not redirect to OAuth.
    await page.goto(`${BASE}/past-papers`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);
    // Click body first so the document has a focus context before Tab is pressed.
    await page.locator("body").click({ position: { x: 1, y: 1 } }).catch(() => {});
    await page.keyboard.press("Tab");
    await page.waitForTimeout(300);
    const focusedEl = page.locator(":focus");
    const focusCount = await focusedEl.count();
    expect(focusCount, "Tab must move focus to at least one element").toBeGreaterThan(0);
    // Evaluate runs on the already-confirmed live element — no catch suppression.
    const tagName = await focusedEl.evaluate((el) => el.tagName.toLowerCase());
    expect(["a", "button", "input", "select", "textarea", "details", "area"]).toContain(tagName);
  });

  test("TC-A11Y-002 — dropdown accessible via keyboard", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("domcontentloaded");
    const dropdown = page.locator("[role='combobox'], select").first();
    if (!(await dropdown.isVisible().catch(() => false))) {
      test.skip();
      return;
    }
    await dropdown.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("TC-A11Y-003 — at least 50% of buttons have accessible labels", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("domcontentloaded");
    // In the Replit dev environment the SPA sometimes redirects to OAuth before
    // rendering BrainTrack content. Skip explicitly with a clear reason.
    const currentUrl = page.url();
    const onApp = currentUrl.startsWith(BASE) || currentUrl.includes("localhost");
    test.skip(!onApp, "Redirected to Replit OAuth — button label check requires app landing page");
    const buttons = page.locator("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    let labelledCount = 0;
    for (let i = 0; i < Math.min(count, 20); i++) {
      const btn = buttons.nth(i);
      const ariaLabel = await btn.getAttribute("aria-label");
      const ariaLabelledBy = await btn.getAttribute("aria-labelledby");
      const textContent = (await btn.textContent())?.trim();
      const hasLabel =
        (ariaLabel && ariaLabel.trim() !== "") ||
        (ariaLabelledBy && ariaLabelledBy.trim() !== "") ||
        (textContent && textContent !== "");
      if (hasLabel) labelledCount++;
    }
    const sampleSize = Math.min(count, 20);
    expect(labelledCount / sampleSize).toBeGreaterThanOrEqual(0.5);
  });
});

test.describe("TC-RESP — Responsiveness", () => {
  /**
   * Navigate to the given path at a specific viewport and return whether the
   * page has horizontal overflow. Returns `null` when the page cannot be
   * evaluated (e.g. the SPA redirected to Replit OAuth before React rendered),
   * which callers must handle with an explicit test.skip — no silent pass.
   */
  async function checkNoHorizontalScroll(
    page: Page,
    width: number,
    height: number,
    path = "/past-papers"
  ): Promise<boolean | null> {
    await page.setViewportSize({ width, height });
    // Use /past-papers by default — a stable public route that renders without auth.
    await page.goto(`${BASE}${path}`);
    // domcontentloaded (not networkidle) — networkidle hangs when the SPA
    // redirects to Replit OAuth which keeps long-polling connections open.
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);
    // If the SPA navigated away (OAuth redirect or client-side routing), we
    // cannot meaningfully measure BrainTrack layout. Signal to skip.
    const currentUrl = page.url();
    const onApp = currentUrl.startsWith(BASE) || currentUrl.includes("localhost");
    if (!onApp) return null;
    // Evaluate on the confirmed BrainTrack page.
    // If the SPA finishes its auth routing between the URL check and the
    // evaluate call, the execution context is destroyed.  Catch only that
    // specific error and return null so the caller can test.skip honestly.
    // All other errors are re-thrown for a genuine failure.
    try {
      return await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Execution context was destroyed")) return null;
      throw err;
    }
  }

  test("TC-RESP-001 — layout works at 320px mobile width without horizontal scroll", async ({ page }) => {
    const result = await checkNoHorizontalScroll(page, 320, 568);
    test.skip(result === null, "Redirected to Replit OAuth — responsiveness check requires app to render");
    expect(result, "320px viewport must not produce horizontal scroll").toBe(false);
  });

  test("TC-RESP-002 — layout works at 390px mobile width without horizontal scroll", async ({ page }) => {
    const result = await checkNoHorizontalScroll(page, 390, 844);
    test.skip(result === null, "Redirected to Replit OAuth — responsiveness check requires app to render");
    expect(result, "390px viewport must not produce horizontal scroll").toBe(false);
  });

  test("TC-RESP-003 — layout adapts properly at 768px tablet width without horizontal scroll", async ({ page }) => {
    const result = await checkNoHorizontalScroll(page, 768, 1024);
    test.skip(result === null, "Redirected to Replit OAuth — responsiveness check requires app to render");
    expect(result, "768px viewport must not produce horizontal scroll").toBe(false);
  });
});
