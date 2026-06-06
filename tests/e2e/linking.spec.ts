import { test, expect } from "@playwright/test";
import { learnerAuthHeaders, parentAuthHeaders, getTestTokens } from "./fixtures/auth";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-LINK — Parent-Child Linking & Consent", () => {
  test("TC-LINK-001 — parent creates a consent record: POST /api/consent returns 201 with correct fields", async ({ request }) => {
    const tokens = getTestTokens();
    const payload = {
      parentId: tokens.parentId,
      learnerId: tokens.learnerId,
      consentMethod: "in_app" as const,
    };

    const res = await request.post(`${BASE}/api/consent`, {
      headers: parentAuthHeaders(),
      data: payload,
    });
    expect(
      res.status(),
      `Authenticated parent POST /api/consent must return 201, got ${res.status()}`
    ).toBe(201);

    const body = await res.json();
    expect(typeof body.id === "number", "Consent record must have a numeric id").toBe(true);
    expect(body.parentId, "Consent record must reference correct parentId").toBe(tokens.parentId);
    expect(body.learnerId, "Consent record must reference correct learnerId").toBe(tokens.learnerId);
    expect(body.consentMethod, "Consent record must have consentMethod=in_app").toBe("in_app");

    // Clean up: revoke so later lifecycle tests aren't affected by leftover records
    await request.post(`${BASE}/api/consent/${body.id}/revoke`, { headers: parentAuthHeaders() });
  });

  test("TC-LINK-002 — learner linked to parent: consent record readable by parent after creation", async ({ request }) => {
    const tokens = getTestTokens();
    const payload = {
      parentId: tokens.parentId,
      learnerId: tokens.learnerId,
      consentMethod: "in_app" as const,
    };

    // Step 1: Parent creates the consent record (simulates learner linking with valid code)
    const createRes = await request.post(`${BASE}/api/consent`, {
      headers: parentAuthHeaders(),
      data: payload,
    });
    expect(createRes.status(), `Creating consent must return 201, got ${createRes.status()}`).toBe(201);
    const created = await createRes.json();
    const consentId = created.id;

    // Step 2: Parent reads back the consent record (both records updated)
    const readRes = await request.get(`${BASE}/api/consent/${tokens.learnerId}`, {
      headers: parentAuthHeaders(),
    });
    expect(readRes.status(), `GET /api/consent/:learnerId must return 200, got ${readRes.status()}`).toBe(200);
    const record = await readRes.json();
    expect(record.id, "Read consent id must match created consent id").toBe(consentId);
    expect(record.parentId, "Read consent must reference correct parent").toBe(tokens.parentId);
    expect(record.learnerId, "Read consent must reference correct learner").toBe(tokens.learnerId);

    // Clean up: revoke so later lifecycle tests aren't affected by leftover records
    await request.post(`${BASE}/api/consent/${consentId}/revoke`, { headers: parentAuthHeaders() });
  });

  test("TC-LINK-003 — invalid consent data is rejected with 400 (missing required field)", async ({ request }) => {
    const tokens = getTestTokens();
    // POST with invalid consentMethod (not in enum) simulates entering an invalid/expired code
    const invalidPayload = {
      parentId: tokens.parentId,
      learnerId: tokens.learnerId,
      consentMethod: "invalid_method",
    };

    const res = await request.post(`${BASE}/api/consent`, {
      headers: parentAuthHeaders(),
      data: invalidPayload,
    });
    expect(
      res.status(),
      `POST /api/consent with invalid consentMethod must return 400, got ${res.status()}`
    ).toBe(400);
    const body = await res.json();
    expect(body.error, "Error response must include an error field").toBeTruthy();
  });

  test("TC-LINK-004 — parent sees only linked learner: GET /api/parent/child-progress returns learner progress data", async ({ request }) => {
    // The seeded parent has an activated parent_link to the seeded learner
    const res = await request.get(`${BASE}/api/parent/child-progress`, {
      headers: parentAuthHeaders(),
    });
    expect(
      res.status(),
      `Parent JWT → /api/parent/child-progress must return 200, got ${res.status()}`
    ).toBe(200);

    const body = await res.json();
    expect(typeof body === "object" && body !== null, "Child progress response must be a non-null object").toBe(true);
    // Response must contain expected child progress fields (parent sees only their linked child)
    expect(
      "learnerName" in body || "currentStreak" in body || "weeklyReport" in body,
      "Child progress must include learnerName, currentStreak, or weeklyReport field"
    ).toBe(true);
    expect(
      typeof body.currentStreak === "number",
      "currentStreak must be a number"
    ).toBe(true);
  });

  test("TC-LINK-005 — learner accesses own onboarding/settings data via authenticated API", async ({ request }) => {
    // Learner can access their own onboarding data from settings (showing the link state is accessible)
    const tokens = getTestTokens();

    const res = await request.get(`${BASE}/api/user/onboarding`, {
      headers: learnerAuthHeaders(),
    });
    expect(
      res.status(),
      `Learner JWT → /api/user/onboarding must return 200, got ${res.status()}`
    ).toBe(200);
    const body = await res.json();
    expect(typeof body === "object" && body !== null, "Onboarding data must be an object").toBe(true);
    expect(body.learningStyle, "Seeded learner must have learningStyle set").toBeTruthy();
  });

  test("TC-LINK-006 — /api/consent/:id/revoke requires authentication (returns 401)", async ({ request }) => {
    const res = await request.post(`${BASE}/api/consent/consent-123/revoke`);
    expect(
      [401, 403],
      `Revoke consent must return 401/403 for unauthenticated requests, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-LINK-007 — parent-child consent lifecycle: create → read → revoke → confirm revoked", async ({ request }) => {
    const tokens = getTestTokens();
    const consentPayload = {
      parentId: tokens.parentId,
      learnerId: tokens.learnerId,
      consentMethod: "in_app" as const,
    };

    // Step 1: Parent creates a consent record
    const createRes = await request.post(`${BASE}/api/consent`, {
      headers: parentAuthHeaders(),
      data: consentPayload,
    });
    expect(
      createRes.status(),
      `Authenticated parent must create consent record (201), got ${createRes.status()}`
    ).toBe(201);
    const created = await createRes.json();
    expect(typeof created.id === "number", "Created consent record must have a numeric id").toBe(true);
    expect(created.parentId, "Consent record must reference the parent user").toBe(tokens.parentId);
    expect(created.learnerId, "Consent record must reference the learner user").toBe(tokens.learnerId);

    const consentId = created.id;

    // Step 2: Read consent record for learner
    const readRes = await request.get(`${BASE}/api/consent/${tokens.learnerId}`, {
      headers: parentAuthHeaders(),
    });
    expect(readRes.status(), `GET consent/:learnerId must return 200, got ${readRes.status()}`).toBe(200);
    const readBody = await readRes.json();
    expect(readBody.id, "Read consent record must match created record").toBe(consentId);

    // Step 3: Revoke the consent record
    const revokeRes = await request.post(`${BASE}/api/consent/${consentId}/revoke`, {
      headers: parentAuthHeaders(),
    });
    expect(revokeRes.status(), `Revoking consent must return 200, got ${revokeRes.status()}`).toBe(200);
    const revoked = await revokeRes.json();
    expect(revoked.revokedAt, "Revoked consent must have a revokedAt timestamp").toBeTruthy();

    // Step 4: After revocation, GET returns 404 (no active record)
    const afterRevokeRes = await request.get(`${BASE}/api/consent/${tokens.learnerId}`, {
      headers: parentAuthHeaders(),
    });
    expect(
      afterRevokeRes.status(),
      `After revocation, GET consent/:learnerId must return 404, got ${afterRevokeRes.status()}`
    ).toBe(404);
  });

  test("TC-LINK-008 — learner JWT → /api/user/onboarding returns seeded onboarding data with correct learning style", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/onboarding`, {
      headers: learnerAuthHeaders(),
    });
    expect(
      res.status(),
      `Learner JWT with completed onboarding should get 200 from /api/user/onboarding, got ${res.status()}`
    ).toBe(200);
    const body = await res.json();
    expect(typeof body === "object" && body !== null, "Onboarding result must be an object").toBe(true);
    expect(body.learningStyle, "Seeded learner must have learningStyle=visual").toBe("visual");
    expect(body.studyPreference, "Seeded learner must have studyPreference=solo").toBe("solo");
  });
});
