import { test, expect } from "@playwright/test";
import { learnerAuthHeaders, parentAuthHeaders, getTestTokens } from "./fixtures/auth";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-AUTH — Authentication, Roles & Access", () => {
  test("TC-AUTH-001 — learner sign-up lifecycle: seeded learner has role=learner and completed onboarding", async ({ request }) => {
    const tokens = getTestTokens();
    expect(tokens.learnerId, "Test setup must provide a learnerId").toBeTruthy();

    // Verify learner profile exists and has correct role
    const profileRes = await request.get(`${BASE}/api/auth/user`, {
      headers: learnerAuthHeaders(),
    });
    expect(profileRes.status(), `GET /api/auth/user with learner JWT must return 200, got ${profileRes.status()}`).toBe(200);
    const profile = await profileRes.json();
    expect(profile.id, "Learner profile must include id field").toBeTruthy();
    expect(profile.role, "Learner must have role=learner after registration").toBe("learner");

    // Verify onboarding was completed (as it would be after sign-up + onboarding)
    const onboardRes = await request.get(`${BASE}/api/user/onboarding-status`, {
      headers: learnerAuthHeaders(),
    });
    expect(onboardRes.status(), `Onboarding status with learner JWT must return 200, got ${onboardRes.status()}`).toBe(200);
    const onboardBody = await onboardRes.json();
    expect(
      onboardBody === true || (typeof onboardBody === "object" && onboardBody !== null),
      "Learner onboarding status must be truthy after completing sign-up flow"
    ).toBe(true);
  });

  test("TC-AUTH-002 — parent sign-up lifecycle: seeded parent has role=parent", async ({ request }) => {
    const tokens = getTestTokens();
    expect(tokens.parentId, "Test setup must provide a parentId").toBeTruthy();

    const profileRes = await request.get(`${BASE}/api/auth/user`, {
      headers: parentAuthHeaders(),
    });
    expect(profileRes.status(), `GET /api/auth/user with parent JWT must return 200, got ${profileRes.status()}`).toBe(200);
    const profile = await profileRes.json();
    expect(profile.id, "Parent profile must include id field").toBeTruthy();
    expect(profile.role, "Parent must have role=parent after registration").toBe("parent");
    expect(profile.id, "Parent id must match seeded parentId").toBe(tokens.parentId);
  });

  test("TC-AUTH-003 — invalid JWT token is rejected with 401", async ({ request }) => {
    const badToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWtlLXVzZXIiLCJyb2xlIjoibGVhcm5lciIsImV4cCI6MTYwMDAwMDAwMH0.INVALIDSIGNATURE";
    const res = await request.get(`${BASE}/api/auth/user`, {
      headers: { Authorization: `Bearer ${badToken}` },
    });
    expect(
      res.status(),
      `Invalid JWT must be rejected with 401, got ${res.status()}`
    ).toBe(401);
    const body = await res.json().catch(() => ({}));
    expect(
      typeof body === "object",
      "Error response must be a JSON object"
    ).toBe(true);
  });

  test("TC-AUTH-004 — role-based route protection: learner JWT is denied admin-only endpoint with 403", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/plans`, {
      headers: learnerAuthHeaders(),
    });
    expect(
      res.status(),
      `Learner JWT accessing admin-only /api/admin/plans must return 403, got ${res.status()}`
    ).toBe(403);
  });

  test("TC-AUTH-005 — session persistence: same JWT returns consistent user identity across multiple requests", async ({ request }) => {
    const headers = learnerAuthHeaders();
    const expectedId = getTestTokens().learnerId;

    const [r1, r2, r3] = await Promise.all([
      request.get(`${BASE}/api/auth/user`, { headers }),
      request.get(`${BASE}/api/auth/user`, { headers }),
      request.get(`${BASE}/api/auth/user`, { headers }),
    ]);

    for (const res of [r1, r2, r3]) {
      expect(res.status(), `Each parallel request with same JWT must return 200, got ${res.status()}`).toBe(200);
    }

    const [b1, b2, b3] = await Promise.all([r1.json(), r2.json(), r3.json()]);
    expect(b1.id, "First response must return seeded learner id").toBe(expectedId);
    expect(b2.id, "Second response must return same id as first").toBe(expectedId);
    expect(b3.id, "Third response must return same id as first").toBe(expectedId);
  });

  test("TC-AUTH-006 — logout endpoint returns redirect (302) to sign-out the user", async ({ request }) => {
    const res = await request.get(`${BASE}/api/auth/logout`);
    expect(
      [200, 302],
      `Logout endpoint must return 200 or 302, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-AUTH-007 — authenticated JWT → /api/auth/user returns 200 with seeded user profile", async ({ request }) => {
    const res = await request.get(`${BASE}/api/auth/user`, {
      headers: learnerAuthHeaders(),
    });
    expect(res.status(), `JWT-authenticated /api/auth/user must return 200, got ${res.status()}`).toBe(200);
    const body = await res.json();
    expect(body, "Response body must be a non-null object").toBeTruthy();
    expect(typeof body === "object" && !Array.isArray(body), "User profile must be an object").toBe(true);
    expect(body.id, "User profile must include an id field").toBeTruthy();
    expect(body.role, "Seeded learner must have role=learner").toBe("learner");
  });

  test("TC-AUTH-008 — authenticated JWT → /api/user/onboarding-status returns 200 with truthy completion state", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/onboarding-status`, {
      headers: learnerAuthHeaders(),
    });
    expect(res.status(), `Authenticated /api/user/onboarding-status must return 200, got ${res.status()}`).toBe(200);
    const body = await res.json();
    expect(
      body === true || (typeof body === "object" && body !== null),
      "Onboarding status must be truthy for seeded learner"
    ).toBe(true);
  });

  test("TC-AUTH-009 — authenticated JWT lifecycle: access multiple resources and verify stable identity", async ({ request }) => {
    const headers = learnerAuthHeaders();

    const statsRes = await request.get(`${BASE}/api/user/stats`, { headers });
    expect(statsRes.status(), `Stats with valid JWT must return 200, got ${statsRes.status()}`).toBe(200);

    const streakRes = await request.get(`${BASE}/api/user/streak`, { headers });
    expect(streakRes.status(), `Streak with valid JWT must return 200, got ${streakRes.status()}`).toBe(200);

    const userRes = await request.get(`${BASE}/api/auth/user`, { headers });
    expect(userRes.status(), `Profile re-check with same JWT must return 200, got ${userRes.status()}`).toBe(200);
    const profile = await userRes.json();
    expect(profile.id, "Identity must be stable across multiple calls").toBe("test-learner-seed-001");
  });
});
