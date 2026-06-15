import { test, expect } from "@playwright/test";
import { learnerAuthHeaders, getTestTokens } from "./fixtures/auth";

const BASE = process.env.BASE_URL || "http://localhost:5000";

// TC-SUB — Subscribe page trial flow.
//
// Five distinct page states:
//   plan            — trial form (default unauthenticated/no-sub view)
//   success         — trial started or ?netcash=success
//   not_configured  — 503 from server
//   trial_used      — 409 or lapsed/expired sub → PaymentPickerScreen
//   payment_cancelled — ?netcash=cancel → PaymentPickerScreen with banner
//
// Auth stubs used in browser tests:
//   /api/auth/user              → authenticated learner with roleConfirmed: true
//   /api/user/subscription      → current subscription state (subscribe-page check)
//   /api/user/subscription-status → ProtectedRoute gate check
//   /api/user/onboarding-status → ProtectedRoute gate check

/** Stub the authenticated-user API responses shared across both helpers. */
async function _stubUserAndOnboarding(page: any, learnerId: string) {
  await page.route("**/api/auth/user", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: learnerId,
        role: "learner",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        roleConfirmed: true,
      }),
    });
  });
  await page.route("**/api/user/onboarding-status", async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(true) });
  });
}

/**
 * Stubs the user as authenticated WITH an active subscription.
 * SubscribeRoute (App.tsx) will immediately redirect to /dashboard.
 * Use this only when testing the already-active redirect (TC-SUB-007).
 */
async function stubAuthenticatedLearner(page: any, learnerId: string) {
  await _stubUserAndOnboarding(page, learnerId);
  await page.route("**/api/user/subscription-status", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ active: true, status: "active", trialEndsAt: null }),
    });
  });
}

/**
 * Stubs the user as authenticated but with NO active subscription.
 * SubscribeRoute lets the user through to the subscribe form.
 * Use this when the test needs to interact with the subscribe form as a logged-in user.
 *
 * Also injects a script that suppresses the window focus / visibilitychange events
 * React Query uses for refetchOnWindowFocus, preventing stale-at-0 subscription
 * refetches from overriding the page state set by form interactions.
 */
async function stubAuthenticatedLearnerNoSub(page: any, learnerId: string) {
  // Suppress React Query's refetchOnWindowFocus by neutralising the focus and
  // visibilitychange events it relies on.  Must be added before page.goto().
  // Uses plain JS (no TS types) so the serialised string is valid browser code.
  await page.addInitScript(() => {
    const _winAel = window.addEventListener.bind(window);
    window.addEventListener = function(type, ...args) {
      if (type === "focus" || type === "blur") return;
      return _winAel(type, ...args);
    };
    const _docAel = document.addEventListener.bind(document);
    document.addEventListener = function(type, ...args) {
      if (type === "visibilitychange") return;
      return _docAel(type, ...args);
    };
  });

  await _stubUserAndOnboarding(page, learnerId);
  await page.route("**/api/user/subscription-status", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ active: false, status: "none", trialEndsAt: null }),
    });
  });
  // The subscribe page's own useQuery also checks /api/user/subscription.
  // Return a non-active status so it stays in "plan" state.
  await page.route("**/api/user/subscription", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "none" }),
    });
  });
}

test.describe("TC-SUB — Subscribe Page Trial Flow", () => {
  // ─── Browser: plan state (unauthenticated) ────────────────────────────────

  test("TC-SUB-001 — unauthenticated user sees plan showcase with trial form and Start Free Trial CTA", async ({ page }) => {
    await page.goto(`${BASE}/subscribe`);
    await page.waitForLoadState("domcontentloaded");

    const crashed = await page
      .locator("text=/something went wrong|unhandled error|cannot read properties/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "Subscribe page must not crash for unauthenticated users").toBe(false);

    await expect(
      page.locator("h1, [role='heading']").filter({ hasText: /Brain Boost.*14.day/i }).first(),
    ).toBeVisible();

    const inputs = page.locator("input[type='tel']");
    await expect(inputs, "Two tel inputs must be present").toHaveCount(2);

    const cta = page.locator("button").filter({ hasText: /Start Free Trial/i });
    await expect(cta, "Start Free Trial CTA must be visible").toBeVisible();
  });

  test("TC-SUB-002 — unauthenticated click on Start Free Trial redirects to login", async ({ page }) => {
    await page.goto(`${BASE}/subscribe`);
    await page.waitForLoadState("domcontentloaded");
    // Wait for the React app to fully mount and the button to become interactive
    await expect(page.locator("button").filter({ hasText: /Start Free Trial/i })).toBeVisible();

    // Clicking the CTA when unauthenticated triggers window.location.href = "/api/login" — a full-page navigation
    const navPromise = page.waitForNavigation({ waitUntil: "commit", timeout: 8000 }).catch(() => null);
    await page.locator("button").filter({ hasText: /Start Free Trial/i }).click();
    await navPromise;

    const url = page.url();
    const isLoginUrl = url.includes("/api/login") || url.includes("/login") || url.includes("replit.com");
    expect(
      isLoginUrl,
      `Unauthenticated CTA must redirect to login/auth, got: ${url}`,
    ).toBe(true);
  });

  test("TC-SUB-003 — subscribe page shows parent and learner cell number inputs with placeholders", async ({ page }) => {
    await page.goto(`${BASE}/subscribe`);
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("input[placeholder*='082']"), "Parent cell input must be visible").toBeVisible();
    await expect(page.locator("input[placeholder*='071']"), "Learner cell input must be visible").toBeVisible();
  });

  test("TC-SUB-004 — back-to-home button is visible on the plan state", async ({ page }) => {
    await page.goto(`${BASE}/subscribe`);
    await page.waitForLoadState("domcontentloaded");

    const backBtn = page.locator("button, a").filter({ hasText: /Back to home|Terug na tuisblad/i });
    await expect(backBtn.first(), "Back button must be visible").toBeVisible();
  });

  // ─── Browser: success state ───────────────────────────────────────────────

  test("TC-SUB-005 — ?netcash=success query param renders payment success screen with dashboard button", async ({ page }) => {
    // Task #656 — ?netcash=success now resolves the subscription query and
    // shows the PaymentSuccessScreen ("Payment successful") when the sub is
    // active with a non-trial billing method (debicheck/card).
    await stubAuthenticatedLearnerNoSub(page, getTestTokens().learnerId);
    await page.unroute("**/api/user/subscription");
    await page.route("**/api/user/subscription", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "active", billingMethod: "card" }),
      });
    });

    await page.goto(`${BASE}/subscribe?netcash=success`);
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.locator("h1, [role='heading']").filter({ hasText: /Payment successful|Betaling suksesvol/i }).first(),
    ).toBeVisible({ timeout: 8000 });

    const dashBtn = page.locator("button").filter({ hasText: /Go to Dashboard|Gaan na Dashboard/i });
    await expect(dashBtn, "Dashboard button must be visible on payment success screen").toBeVisible();
  });

  test("TC-SUB-006 — successful trial start (stubbed 200) renders success screen with sign-in link banner", async ({ page }) => {
    // No active sub → SubscribeRoute lets us through to the form.
    await stubAuthenticatedLearnerNoSub(page, getTestTokens().learnerId);

    await page.route("**/api/subscribe/start-trial", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          trialStarted: true,
          sms: {
            sent: true,
            to: "+27711234567",
            jti: "test-jti-001",
            error: null,
            message: null,
          },
        }),
      });
    });

    await page.goto(`${BASE}/subscribe`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("button").filter({ hasText: /Start Free Trial/ })).toBeVisible();

    // Use click + pressSequentially (dispatches real keyboard events) so React's
    // controlled-input onChange handler reliably captures the value.
    await page.locator("input[placeholder*='082']").click();
    await page.locator("input[placeholder*='082']").pressSequentially("0821234567");
    await page.locator("input[placeholder*='071']").click();
    await page.locator("input[placeholder*='071']").pressSequentially("0711234567");
    await page.locator("button").filter({ hasText: /Start Free Trial/i }).click();

    // Wait for the success screen heading to appear
    await expect(
      page.locator("h1, [role='heading']").filter({ hasText: /Welcome to Brain Boost|Welkom by Brain Boost/i }).first(),
    ).toBeVisible({ timeout: 8000 });

    // WhatsApp / sign-in link sent confirmation banner
    const smsBanner = page.locator("text=/Sign-in link sent|Aanmeldingskakel gestuur/i");
    await expect(smsBanner, "SMS sent banner must be visible after successful trial start").toBeVisible();
  });

  // ─── Browser: already-active subscription redirects to dashboard ──────────

  test("TC-SUB-007 — already-active subscription redirects to /dashboard", async ({ page }) => {
    // IMPORTANT: In Playwright the LAST registered route wins (highest priority).
    // Register the specific stubs AFTER any broader stubs so they take priority.

    // Subscription query on subscribe page sees "active" → calls navigate("/dashboard")
    // Register this LAST so it overrides anything broader that might match the same URL.
    await page.route("**/api/user/subscription", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "active", plan: "brain_boost" }),
      });
    });

    // stubAuthenticatedLearner registers auth/user, onboarding-status, subscription-status.
    // Registered AFTER the subscription stub so they take highest priority.
    await stubAuthenticatedLearner(page, getTestTokens().learnerId);

    await page.goto(`${BASE}/subscribe`);

    // Wouter's navigate("/dashboard") fires after the active subscription is detected.
    // The ProtectedRoute gates (onboarding, subscription-status) are all stubbed to pass.
    await page.waitForURL("**/dashboard**", { timeout: 8000 });

    expect(
      page.url().includes("/dashboard"),
      `Already-active subscription must navigate to /dashboard; got: ${page.url()}`,
    ).toBe(true);
  });

  // ─── Browser: trial_used / payment_cancelled → PaymentPickerScreen ────────

  test("TC-SUB-008 — 409 trial_already_used response renders PaymentPickerScreen with 'Choose your payment method'", async ({ page }) => {
    // Closure flag: subscription returns "none" (shows form) before submit,
    // "lapsed" afterwards — prevents refetchOnWindowFocus from resetting trial_used state.
    let afterSubmit = false;

    await page.route("**/api/user/subscription", async (route: any) => {
      const s = afterSubmit ? "lapsed" : "none";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: s }),
      });
    });

    // subscription-status stub: not active → SubscribeRoute lets us through.
    await page.route("**/api/user/subscription-status", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ active: false, status: "none", trialEndsAt: null }),
      });
    });

    // Auth stubs registered LAST so they have the highest Playwright route priority.
    await page.route("**/api/user/onboarding-status", async (route: any) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(true) });
    });
    await page.route("**/api/auth/user", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: getTestTokens().learnerId,
          role: "learner",
          firstName: "Test",
          email: "test@example.com",
          roleConfirmed: true,
        }),
      });
    });

    await page.route("**/api/subscribe/start-trial", async (route: any) => {
      afterSubmit = true; // flip before fulfilling so any parallel refetch gets "lapsed"
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ error: "trial_already_used" }),
      });
    });

    await page.goto(`${BASE}/subscribe`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("button").filter({ hasText: /Start Free Trial/ })).toBeVisible();

    // Use click + pressSequentially to ensure React controlled-input onChange fires.
    await page.locator("input[placeholder*='082']").click();
    await page.locator("input[placeholder*='082']").pressSequentially("0821234567");
    await page.locator("input[placeholder*='071']").click();
    await page.locator("input[placeholder*='071']").pressSequentially("0711234567");
    await page.locator("button").filter({ hasText: /Start Free Trial/i }).click();

    // 409 → catch block → setPageState("trial_used") → PaymentPickerScreen
    await expect(
      page.locator("h1, [role='heading']").filter({ hasText: /Choose your payment method|Kies jou betaalmetode/i }).first(),
    ).toBeVisible({ timeout: 8000 });

    await expect(
      page.locator("button").filter({ hasText: /DebiCheck/i }).first(),
      "DebiCheck tile must be visible",
    ).toBeVisible();

    await expect(
      page.locator("button").filter({ hasText: /Recurring Card|Herhalende Kaart/i }).first(),
      "Recurring card tile must be visible",
    ).toBeVisible();
  });

  test("TC-SUB-009 — DebiCheck tile calls /api/subscribe/netcash/debicheck/init on click", async ({ page }) => {
    // ?netcash=cancel lands directly on PaymentPickerScreen — no trial-start needed
    await page.goto(`${BASE}/subscribe?netcash=cancel`);
    await page.waitForLoadState("domcontentloaded");

    let debicheckHit = false;
    await page.route("**/api/subscribe/netcash/debicheck/init", async (route: any) => {
      debicheckHit = true;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "netcash_not_configured" }),
      });
    });

    const debiBtn = page.locator("button").filter({ hasText: /DebiCheck/i }).first();
    await expect(debiBtn, "DebiCheck tile must be visible on PaymentPickerScreen").toBeVisible();
    await debiBtn.click();

    // Wait for the network request to complete
    await page.waitForResponse("**/api/subscribe/netcash/debicheck/init", { timeout: 8000 }).catch(() => null);

    expect(debicheckHit, "DebiCheck tile must call /api/subscribe/netcash/debicheck/init").toBe(true);
  });

  test("TC-SUB-010 — Card tile calls /api/subscribe/netcash/card/init on click", async ({ page }) => {
    await page.goto(`${BASE}/subscribe?netcash=cancel`);
    await page.waitForLoadState("domcontentloaded");

    let cardHit = false;
    await page.route("**/api/subscribe/netcash/card/init", async (route: any) => {
      cardHit = true;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "netcash_not_configured" }),
      });
    });

    const cardBtn = page.locator("button").filter({ hasText: /Recurring Card|Herhalende Kaart/i }).first();
    await expect(cardBtn, "Recurring card tile must be visible on PaymentPickerScreen").toBeVisible();
    await cardBtn.click();

    await page.waitForResponse("**/api/subscribe/netcash/card/init", { timeout: 8000 }).catch(() => null);

    expect(cardHit, "Card tile must call /api/subscribe/netcash/card/init").toBe(true);
  });

  // ─── Browser: inline validation ───────────────────────────────────────────

  test("TC-SUB-011 — authenticated user submitting empty fields sees inline error message", async ({ page }) => {
    // No active sub → SubscribeRoute lets us through to the form.
    await stubAuthenticatedLearnerNoSub(page, getTestTokens().learnerId);

    await page.goto(`${BASE}/subscribe`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("button").filter({ hasText: /Start Free Trial/ })).toBeVisible();

    // Leave both inputs empty — client-side guard fires inline error
    await page.locator("button").filter({ hasText: /Start Free Trial/i }).click();

    // Error banner uses the destructive variant and must mention cell phone numbers
    await expect(
      page.locator("text=/Please provide both cell phone numbers|Verskaf asseblief beide selfoonnommers/i").first(),
      "Inline error must mention cell phone numbers",
    ).toBeVisible({ timeout: 5000 });
  });

  // ─── API: authentication enforcement ──────────────────────────────────────

  test("TC-SUB-012 — POST /api/subscribe/start-trial without auth returns 401 or 403", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/start-trial`, {
      data: { plan: "brain_boost", parentCell: "0821234567", learnerCell: "0711234567", parentApproval: true, language: "en" },
    });
    expect([401, 403], `start-trial without auth must return 401/403, got ${res.status()}`).toContain(res.status());
  });

  test("TC-SUB-013 — POST /api/subscribe/netcash/debicheck/init without auth returns 401 or 403", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/netcash/debicheck/init`, {
      data: { plan: "brain-boost" },
    });
    expect([401, 403], `DebiCheck init without auth must return 401/403, got ${res.status()}`).toContain(res.status());
  });

  test("TC-SUB-014 — POST /api/subscribe/netcash/card/init without auth returns 401 or 403", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/netcash/card/init`, { data: { plan: "brain-boost" } });
    expect([401, 403], `Card init without auth must return 401/403, got ${res.status()}`).toContain(res.status());
  });

  test("TC-SUB-015 — GET /api/user/subscription without auth returns 401 or 403", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/subscription`);
    expect([401, 403], `GET /api/user/subscription without auth must return 401/403, got ${res.status()}`).toContain(res.status());
  });

  // ─── API: field validation on start-trial ─────────────────────────────────

  test("TC-SUB-016 — POST /api/subscribe/start-trial with auth but missing learnerCell returns 400", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/start-trial`, {
      headers: learnerAuthHeaders(),
      data: { plan: "brain_boost", parentCell: "0821234567", parentApproval: true, language: "en" },
    });
    // 429 = paymentLimiter fired before Zod validation; both confirm the endpoint is guarded
    expect([400, 429], `start-trial without learnerCell must return 400 or 429, got ${res.status()}`).toContain(res.status());
  });

  test("TC-SUB-017 — POST /api/subscribe/start-trial with auth but missing parentApproval returns 400", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/start-trial`, {
      headers: learnerAuthHeaders(),
      data: { plan: "brain_boost", parentCell: "0821234567", learnerCell: "0711234567", language: "en" },
    });
    expect([400, 429], `start-trial without parentApproval must return 400 or 429, got ${res.status()}`).toContain(res.status());
  });

  test("TC-SUB-018 — POST /api/subscribe/start-trial with cell numbers that are too short returns 400", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/start-trial`, {
      headers: learnerAuthHeaders(),
      data: { plan: "brain_boost", parentCell: "082", learnerCell: "071", parentApproval: true, language: "en" },
    });
    expect([400, 429], `start-trial with short cell numbers must return 400 or 429, got ${res.status()}`).toContain(res.status());
  });

  // ─── API: subscription status and Netcash init with auth ─────────────────

  test("TC-SUB-019 — GET /api/user/subscription with valid auth returns 200", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/subscription`, { headers: learnerAuthHeaders() });
    expect(res.status(), `GET /api/user/subscription with learner JWT must return 200, got ${res.status()}`).toBe(200);
    expect(typeof (await res.json()), "Subscription response must be an object or null").toBe("object");
  });

  test("TC-SUB-020 — POST /api/subscribe/netcash/debicheck/init with auth returns 503 when Netcash is not configured", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/netcash/debicheck/init`, {
      headers: learnerAuthHeaders(),
      data: { plan: "brain-boost" },
    });
    expect(
      [200, 302, 400, 503, 429],
      `DebiCheck init with auth must return 503 (unconfigured) or 200/302 (configured) or 429 (rate-limited), got ${res.status()}`,
    ).toContain(res.status());
    if (res.status() === 503) {
      expect((await res.json()).error, "503 body must have netcash_not_configured").toBe("netcash_not_configured");
    }
  });

  test("TC-SUB-021 — POST /api/subscribe/netcash/card/init with auth returns 503 when Netcash is not configured", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/netcash/card/init`, {
      headers: learnerAuthHeaders(),
      data: { plan: "brain-boost" },
    });
    expect(
      [200, 302, 400, 503, 429],
      `Card init with auth must return 503 (unconfigured) or 200/302 (configured) or 429 (rate-limited), got ${res.status()}`,
    ).toContain(res.status());
    if (res.status() === 503) {
      expect((await res.json()).error, "503 body must have netcash_not_configured").toBe("netcash_not_configured");
    }
  });

  // ─── API: start-trial response codes ─────────────────────────────────────

  test("TC-SUB-022 — POST /api/subscribe/start-trial with valid data returns 200, 409, 429, or 503", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/start-trial`, {
      headers: learnerAuthHeaders(),
      data: { plan: "brain_boost", parentCell: "0821234567", learnerCell: "0711234567", parentApproval: true, language: "en" },
    });
    expect([200, 409, 503, 429], `start-trial with valid auth must return 200, 409, 503 or 429, got ${res.status()}`).toContain(res.status());

    if (res.status() === 409) {
      expect((await res.json()).error, "409 must carry trial_already_used").toBe("trial_already_used");
    }
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.trialStarted === true || body.alreadyActive === true, "200 must have trialStarted or alreadyActive flag").toBe(true);
    }
  });
});
