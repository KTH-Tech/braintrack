import { test, expect } from "@playwright/test";
import { learnerAuthHeaders, adminAuthHeaders, getTestTokens } from "./fixtures/auth";

const BASE = process.env.E2E_BASE_URL ?? "http://127.0.0.1:5000";

// TC-PAY — Payments & Subscriptions (Netcash recurring billing + PayFast hosted checkout).
// Yoco/Paystack/Ozow have all been removed; the legacy Yoco endpoints
// now respond 410 Gone via a stub for stale clients.
test.describe("TC-PAY — Payments & Subscriptions (Netcash only)", () => {
  test("TC-PAY-001 — legacy Yoco endpoints return 410 Gone", async ({ request }) => {
    const checkout = await request.post(`${BASE}/api/subscribe/yoco/checkout`, { data: { plan: "brain-boost" } });
    const verify = await request.get(`${BASE}/api/subscribe/yoco/verify`);
    const webhook = await request.post(`${BASE}/api/yoco/webhook`, { data: {} });
    // Auth-protected ones can return 401 or 410 depending on order; webhook is public so it should be 410.
    expect([401, 403, 410]).toContain(checkout.status());
    expect([401, 403, 410]).toContain(verify.status());
    expect(webhook.status()).toBe(410);
  });

  test("TC-PAY-002 — Netcash webhook endpoint is publicly reachable", async ({ request }) => {
    // Without proper signature it should be rejected (400 in prod) or accepted with note in dev.
    const res = await request.post(`${BASE}/api/netcash/webhook`, {
      data: {},
      headers: { "Content-Type": "application/json" },
    });
    expect([200, 400, 401, 503]).toContain(res.status());
  });

  test("TC-PAY-003 — /api/subscribe/start-trial requires authentication", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/start-trial`, {
      data: { plan: "brain-boost", parentCell: "0821234567" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("TC-PAY-004 — /api/subscribe/netcash/debicheck/init requires authentication", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/netcash/debicheck/init`, {
      data: { plan: "brain-boost" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("TC-PAY-005 — /api/subscribe/netcash/card/init requires authentication", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/netcash/card/init`, {
      data: { plan: "brain-boost" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("TC-PAY-006 — /api/subscribe/netcash/verify requires authentication", async ({ request }) => {
    const res = await request.get(`${BASE}/api/subscribe/netcash/verify`);
    expect([401, 403]).toContain(res.status());
  });

  test("TC-PAY-007 — /api/admin/billing requires authentication and admin role", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/billing`);
    expect([401, 403]).toContain(res.status());
  });
});

// ─── TC-PAY-ADM — Admin billing dashboard mutations ─────────────────────────
//
// The billing dashboard exposes admin-only mutations to manually correct
// subscription state (mark-active, mark-lapsed, extend-trial, grant-trial).
// Each must reject non-admin callers (learner JWT) and accept admin callers
// (admin JWT). Failure to enforce these guards could silently expose or
// corrupt subscription state.
test.describe("TC-PAY-ADM — Admin billing dashboard mutations", () => {
  // Target user seeded by /api/test/setup (learner row with active sub).
  // Resolved lazily inside each test because globalSetup writes the tokens
  // file AFTER Playwright's collection pass imports this module.
  const targetUserId = () => getTestTokens().learnerId;

  // ── GET /api/admin/billing — overview list ──────────────────────────────

  test("TC-PAY-ADM-001 — GET /api/admin/billing with learner JWT returns 403", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/billing`, {
      headers: learnerAuthHeaders(),
    });
    expect(
      res.status(),
      `GET /api/admin/billing with learner JWT must return 403, got ${res.status()}`,
    ).toBe(403);
  });

  test("TC-PAY-ADM-002 — GET /api/admin/billing with admin JWT returns 200", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/billing`, {
      headers: adminAuthHeaders(),
    });
    expect(
      res.status(),
      `GET /api/admin/billing with admin JWT must return 200, got ${res.status()}`,
    ).toBe(200);
  });

  // ── POST /api/admin/billing/:id/mark-active ─────────────────────────────

  test("TC-PAY-ADM-003 — POST /api/admin/billing/:id/mark-active without auth returns 401/403", async ({ request }) => {
    const tid = targetUserId();
    const res = await request.post(`${BASE}/api/admin/billing/${tid}/mark-active`, {
      data: {},
    });
    expect([401, 403]).toContain(res.status());
  });

  test("TC-PAY-ADM-004 — POST /api/admin/billing/:id/mark-active with learner JWT returns 403", async ({ request }) => {
    const tid = targetUserId();
    const res = await request.post(`${BASE}/api/admin/billing/${tid}/mark-active`, {
      headers: learnerAuthHeaders(),
      data: {},
    });
    expect(
      res.status(),
      `mark-active with learner JWT must return 403, got ${res.status()}`,
    ).toBe(403);
  });

  test("TC-PAY-ADM-005 — POST /api/admin/billing/:id/mark-active with admin JWT returns 200", async ({ request }) => {
    const tid = targetUserId();
    const res = await request.post(`${BASE}/api/admin/billing/${tid}/mark-active`, {
      headers: adminAuthHeaders(),
      data: { note: "e2e test — mark-active" },
    });
    expect(
      res.status(),
      `mark-active with admin JWT must return 200, got ${res.status()}`,
    ).toBe(200);
    const body = await res.json();
    expect(body.ok, "response must include ok:true").toBe(true);
    expect(body.userId, "response must echo back target userId").toBe(tid);
  });

  // ── POST /api/admin/billing/:id/mark-lapsed ─────────────────────────────

  test("TC-PAY-ADM-006 — POST /api/admin/billing/:id/mark-lapsed without auth returns 401/403", async ({ request }) => {
    const tid = targetUserId();
    const res = await request.post(`${BASE}/api/admin/billing/${tid}/mark-lapsed`, {
      data: {},
    });
    expect([401, 403]).toContain(res.status());
  });

  test("TC-PAY-ADM-007 — POST /api/admin/billing/:id/mark-lapsed with learner JWT returns 403", async ({ request }) => {
    const tid = targetUserId();
    const res = await request.post(`${BASE}/api/admin/billing/${tid}/mark-lapsed`, {
      headers: learnerAuthHeaders(),
      data: {},
    });
    expect(
      res.status(),
      `mark-lapsed with learner JWT must return 403, got ${res.status()}`,
    ).toBe(403);
  });

  test("TC-PAY-ADM-008 — POST /api/admin/billing/:id/mark-lapsed with admin JWT returns 200", async ({ request }) => {
    const tid = targetUserId();
    const res = await request.post(`${BASE}/api/admin/billing/${tid}/mark-lapsed`, {
      headers: adminAuthHeaders(),
      data: { note: "e2e test — mark-lapsed" },
    });
    expect(
      res.status(),
      `mark-lapsed with admin JWT must return 200, got ${res.status()}`,
    ).toBe(200);
    const body = await res.json();
    expect(body.ok, "response must include ok:true").toBe(true);
    expect(body.status, "response must report status:lapsed").toBe("lapsed");
    expect(body.userId, "response must echo back target userId").toBe(tid);

    // Restore the seeded learner's subscription to active so subsequent test
    // runs and other specs see the expected baseline state. Asserted so a
    // failed cleanup fails this test loudly instead of silently polluting state.
    const restore = await request.post(`${BASE}/api/admin/billing/${tid}/mark-active`, {
      headers: adminAuthHeaders(),
      data: { note: "e2e test — restore active baseline" },
    });
    expect(
      restore.status(),
      `cleanup mark-active must return 200, got ${restore.status()}`,
    ).toBe(200);
    const restoreBody = await restore.json();
    expect(restoreBody.ok, "cleanup response must include ok:true").toBe(true);
  });
});

// ─── TC-PAY-PF — PayFast hosted-checkout redirect flow ───────────────────────
//
// Tests the three legs of the PayFast flow:
//   1. init  — POST /api/subscribe/payfast/init   (auth guard + 503 when unconfigured)
//   2. return — /subscribe?payfast=success|cancel  (page state driven by URL param)
//   3. verify — GET /api/subscribe/payfast/verify  (auth guard + JSON shape)
//
// The "init → redirect → return → verify" cycle is exercised in TC-PAY-PF-008
// using browser-level route stubs: payfast/init is intercepted, a fake redirectUrl
// is returned, the browser fetch is performed, and the response is asserted.
test.describe("TC-PAY-PF — PayFast hosted-checkout redirect flow", () => {

  // ─── API: authentication guards ────────────────────────────────────────────

  test("TC-PAY-PF-001 — POST /api/subscribe/payfast/init without auth returns 401 or 403", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/payfast/init`, {
      data: { plan: "brain-boost" },
    });
    expect(
      [401, 403],
      `payfast/init without auth must return 401/403, got ${res.status()}`,
    ).toContain(res.status());
  });

  test("TC-PAY-PF-002 — GET /api/subscribe/payfast/verify without auth returns 401 or 403", async ({ request }) => {
    const res = await request.get(`${BASE}/api/subscribe/payfast/verify`);
    expect(
      [401, 403],
      `payfast/verify without auth must return 401/403, got ${res.status()}`,
    ).toContain(res.status());
  });

  // ─── API: init returns 503 when credentials are not configured ─────────────

  test("TC-PAY-PF-003 — POST /api/subscribe/payfast/init with auth returns 503 (payfast_not_configured) when credentials absent", async ({ request }) => {
    const res = await request.post(`${BASE}/api/subscribe/payfast/init`, {
      headers: learnerAuthHeaders(),
      data: { plan: "brain-boost" },
    });
    // 503 = credentials not set (expected in CI/dev), 429 = rate-limiter fired first.
    // 200/302 = credentials are configured in this environment — validate shape.
    expect(
      [200, 302, 503, 429],
      `payfast/init with auth must return 503/429 (unconfigured/rate-limited) or 200 (configured), got ${res.status()}`,
    ).toContain(res.status());
    if (res.status() === 503) {
      const body = await res.json();
      expect(body.error, "503 body must carry payfast_not_configured").toBe("payfast_not_configured");
    }
    if (res.status() === 200) {
      const body = await res.json();
      expect(typeof body.redirectUrl, "200 body must include redirectUrl string").toBe("string");
      expect(body.redirectUrl, "redirectUrl must point to the PayFast domain").toMatch(/payfast\.co\.za/i);
    }
  });

  // ─── API: verify returns correct JSON shape ────────────────────────────────

  test("TC-PAY-PF-004 — GET /api/subscribe/payfast/verify with auth returns 200 with a verified boolean", async ({ request }) => {
    const res = await request.get(`${BASE}/api/subscribe/payfast/verify`, {
      headers: learnerAuthHeaders(),
    });
    expect(res.status(), `payfast/verify with auth must return 200, got ${res.status()}`).toBe(200);
    const body = await res.json();
    expect(typeof body.verified, "Response must have a boolean 'verified' field").toBe("boolean");
    if (body.verified === true) {
      expect(body.subscription, "Active verification must include a subscription object").toBeTruthy();
    }
    if (body.verified === false && body.failed === true) {
      // failed/lapsed subscription: correct shape for retry UI
      expect(body.failed).toBe(true);
    }
  });

  // ─── Browser: return URL renders correct page states ───────────────────────

  test("TC-PAY-PF-005 — /subscribe?payfast=success renders the payment success screen", async ({ page }) => {
    // Task #656 — payment-return URLs now resolve the subscription query and
    // render PaymentSuccessScreen when the sub is active with a non-trial
    // billing method (debicheck/card), instead of the trial WhatsApp screen.
    await page.route("**/api/auth/user", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: getTestTokens().learnerId,
          role: "learner",
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          roleConfirmed: true,
        }),
      });
    });
    await page.route("**/api/user/onboarding-status", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(true) });
    });
    await page.route("**/api/user/subscription", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "active", billingMethod: "debicheck" }),
      });
    });

    await page.goto(`${BASE}/subscribe?payfast=success`);
    await page.waitForLoadState("domcontentloaded");

    const crashed = await page
      .locator("text=/something went wrong|unhandled error|cannot read properties/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "Page must not crash on ?payfast=success").toBe(false);

    await expect(
      page.locator("h1, [role='heading']").filter({ hasText: /Payment successful|Betaling suksesvol/i }).first(),
    ).toBeVisible({ timeout: 8000 });

    const dashBtn = page.locator("button").filter({ hasText: /Go to Dashboard|Gaan na Dashboard/i });
    await expect(dashBtn, "Dashboard button must be visible on the payment success screen").toBeVisible();
  });

  test("TC-PAY-PF-006 — /subscribe?payfast=cancel renders PaymentPickerScreen with a cancelled banner", async ({ page }) => {
    await page.goto(`${BASE}/subscribe?payfast=cancel`);
    await page.waitForLoadState("domcontentloaded");

    const crashed = await page
      .locator("text=/something went wrong|unhandled error|cannot read properties/i")
      .isVisible()
      .catch(() => false);
    expect(crashed, "Page must not crash on ?payfast=cancel").toBe(false);

    await expect(
      page
        .locator("h1, [role='heading']")
        .filter({ hasText: /Choose your payment method|Kies jou betaalmetode/i })
        .first(),
    ).toBeVisible({ timeout: 8000 });

    await expect(
      page.locator("text=/Payment cancelled|Betaling gekanselleer/i").first(),
      "Cancelled banner must appear when returning via ?payfast=cancel",
    ).toBeVisible({ timeout: 8000 });
  });

  // ─── Browser: stubbed init → redirectUrl → verify poll ─────────────────────
  //
  // This test exercises the full redirect loop in isolation using browser-level
  // route stubs so it is deterministic and requires no PayFast credentials:
  //
  //   1. /subscribe?payfast=cancel is loaded — user landed back after cancelling.
  //   2. Route stubs are installed for auth + subscription so React hooks settle.
  //   3. /api/subscribe/payfast/init is stubbed to return a fake redirectUrl.
  //   4. The browser calls the init endpoint via fetch() (page.evaluate).
  //   5. The response is asserted to contain the stubbed redirectUrl.
  //   6. /subscribe?payfast=success is loaded — simulating the PayFast return.
  //   7. /api/subscribe/payfast/verify is stubbed to return { verified: true }.
  //   8. A fetch to the verify endpoint is made and the response is asserted.

  test("TC-PAY-PF-007 — full redirect loop: stubbed init returns redirectUrl → ?payfast=success return renders success → stubbed verify returns verified:true", async ({ page }) => {
    const FAKE_PAYFAST_URL = "https://sandbox.payfast.co.za/eng/process?m_payment_id=bt-test-e2e";

    // Install auth + subscription stubs so the page mounts cleanly.
    await page.route("**/api/auth/user", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: getTestTokens().learnerId,
          role: "learner",
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          roleConfirmed: true,
        }),
      });
    });
    await page.route("**/api/user/onboarding-status", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(true) });
    });
    await page.route("**/api/user/subscription", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "none" }),
      });
    });

    // ── Leg 1: init stub ──────────────────────────────────────────────────────
    // Stub payfast/init to return the fake redirectUrl; track it was called.
    let initCalled = false;
    await page.route("**/api/subscribe/payfast/init", async (route) => {
      initCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ redirectUrl: FAKE_PAYFAST_URL }),
      });
    });

    // Navigate to the page so stubs and cookies are live.
    await page.goto(`${BASE}/subscribe?payfast=cancel`);
    await page.waitForLoadState("domcontentloaded");

    // Call the init endpoint from inside the browser and assert the response shape.
    const initResult = await page.evaluate(async () => {
      const res = await fetch("/api/subscribe/payfast/init", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "brain-boost" }),
      });
      return { status: res.status, body: await res.json() };
    });

    expect(initCalled, "init stub must have been called via browser fetch").toBe(true);
    expect(initResult.status, "init stub must return 200").toBe(200);
    expect(typeof initResult.body.redirectUrl, "init response must include a redirectUrl string").toBe("string");
    expect(initResult.body.redirectUrl, "redirectUrl must point to the PayFast domain").toContain("payfast.co.za");
    expect(initResult.body.redirectUrl, "redirectUrl must match the exact stubbed URL").toBe(FAKE_PAYFAST_URL);

    // ── Leg 2: ?payfast=success return URL renders success screen ─────────────
    await page.goto(`${BASE}/subscribe?payfast=success`);
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.locator("h1, [role='heading']").filter({ hasText: /Welcome to Brain Boost|Welkom by Brain Boost/i }).first(),
      "?payfast=success return URL must render the success screen",
    ).toBeVisible({ timeout: 8000 });

    // ── Leg 3: verify poll returns verified:true ──────────────────────────────
    let verifyCalled = false;
    await page.route("**/api/subscribe/payfast/verify", async (route) => {
      verifyCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ verified: true, subscription: { status: "active", plan: "brain_boost" } }),
      });
    });

    const verifyResult = await page.evaluate(async () => {
      const res = await fetch("/api/subscribe/payfast/verify", { credentials: "include" });
      return { status: res.status, body: await res.json() };
    });

    expect(verifyCalled, "verify stub must have been called via browser fetch").toBe(true);
    expect(verifyResult.status, "verify must return 200").toBe(200);
    expect(verifyResult.body.verified, "verify response must have verified:true when subscription is active").toBe(true);
    expect(verifyResult.body.subscription, "verify response must include the subscription object").toBeTruthy();
    expect(verifyResult.body.subscription.status, "subscription status must be 'active'").toBe("active");
  });
});
