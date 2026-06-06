import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:5000";

const publicRoutes = [
  "/",
  "/research",
  "/features",
  "/faq",
  "/privacy-policy",
  "/terms-of-service",
  "/about",
  "/past-papers",
  "/calendar",
];

const protectedRoutes = [
  "/dashboard",
  "/onboarding",
  "/settings",
  "/subscribe",
];

test.describe("TC-REG — Final Regression Pack", () => {
  test("TC-REG-001 — no critical JS page errors on landing page load", async ({ page }) => {
    const pageerrors: string[] = [];
    page.on("pageerror", (err) => pageerrors.push(err.message));
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);
    const criticalErrors = pageerrors.filter(
      (e) =>
        !/favicon|chunk|bluetooth|replit/i.test(e) &&
        (e.includes("TypeError") || e.includes("ReferenceError") || e.includes("SyntaxError"))
    );
    expect(
      criticalErrors,
      `Critical JS errors on /: ${criticalErrors.join(", ")}`
    ).toHaveLength(0);
  });

  test("TC-REG-002 — all known public routes render without crashing", async ({ page }) => {
    const failures: string[] = [];
    for (const route of publicRoutes) {
      const pageerrors: string[] = [];
      page.on("pageerror", (e) => pageerrors.push(e.message));
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);

      const isBodyVisible = await page.locator("body").isVisible().catch(() => false);
      const isCrashPage = await page
        .locator("text=/something went wrong|unhandled exception|cannot read properties/i")
        .isVisible()
        .catch(() => false);

      if (!isBodyVisible || isCrashPage || pageerrors.length > 0) {
        failures.push(`${route}: body=${isBodyVisible}, crash=${isCrashPage}, jserr=${pageerrors.join("|")}`);
      }
    }
    expect(failures, `Public routes with issues:\n${failures.join("\n")}`).toHaveLength(0);
  });

  test("TC-REG-003 — protected routes do not show unhandled crash errors when unauthenticated", async ({ page }) => {
    const failures: string[] = [];
    for (const route of protectedRoutes) {
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 10000 });
        await page.waitForTimeout(400);
        const isCrashPage = await page
          .locator("text=/cannot read properties|typeerror|uncaught reference error/i")
          .isVisible()
          .catch(() => false);
        if (isCrashPage) {
          failures.push(`${route}: crash page detected`);
        }
      } catch {
        // navigation error (redirect to external auth) is expected and acceptable
      }
    }
    expect(failures, `Protected routes that show crash pages:\n${failures.join("\n")}`).toHaveLength(0);
  });

  test("TC-REG-004 — landing page has at least one enabled CTA button", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    // Wait for React to render before checking — the SPA bundle takes > 500ms to boot.
    // Wait up to 5 s for any button to appear (gives the SPA time to hydrate).
    await page.waitForSelector("button, a[href]", { timeout: 5000 }).catch(() => {});
    // In the Replit dev environment the SPA sometimes redirects to OAuth
    // before rendering landing content. Skip explicitly with a clear reason.
    const currentUrl = page.url();
    const onApp = currentUrl.startsWith(BASE) || currentUrl.includes("localhost");
    test.skip(!onApp, "Redirected to Replit OAuth — CTA button check requires app landing page");
    const enabledButtons = page.locator("button:not([disabled]), a[href]:not([disabled])");
    const count = await enabledButtons.count();
    expect(count, "Landing page must have at least 1 enabled CTA button").toBeGreaterThan(0);
  });

  test("TC-REG-005 — /api/health endpoint returns 200", async ({ request }) => {
    const res = await request.get(`${BASE}/api/health`);
    expect(res.status(), "Health endpoint must return 200").toBe(200);
  });
});
