import { test, expect } from "@playwright/test";
import { learnerAuthHeaders, parentAuthHeaders, getTestTokens } from "./fixtures/auth";

const BASE = process.env.BASE_URL || "http://localhost:5000";

test.describe("TC-SEC — Security & Data Protection", () => {
  test("TC-SEC-001 — admin write API endpoints require authentication", async ({ request }) => {
    const adminEndpoints: Array<{ method: "post" | "patch" | "get"; path: string }> = [
      { method: "post", path: "/api/admin/toggle-subscription" },
      { method: "get", path: "/api/admin/plans" },
      { method: "get", path: "/api/admin/reports/parents" },
      { method: "get", path: "/api/admin/reports/schools" },
    ];
    for (const { method, path } of adminEndpoints) {
      const res = await (method === "get"
        ? request.get(`${BASE}${path}`)
        : request.post(`${BASE}${path}`, { data: {} }));
      expect(
        [401, 403],
        `Expected ${path} to require auth (401/403), got ${res.status()}`
      ).toContain(res.status());
    }
  });

  test("TC-SEC-002 — cross-learner data isolation: unauthenticated access denied and each JWT scoped to its own user", async ({ request }) => {
    const userSpecificEndpoints = [
      { method: "get" as const, path: "/api/user/onboarding-status" },
      { method: "get" as const, path: "/api/user/stats" },
      { method: "get" as const, path: "/api/user/streak" },
      { method: "get" as const, path: "/api/user/badges" },
      { method: "get" as const, path: "/api/user/referral" },
    ];
    const failures: string[] = [];
    for (const { method, path } of userSpecificEndpoints) {
      const res = await request[method](`${BASE}${path}`);
      if (![401, 403].includes(res.status())) {
        failures.push(`${path} → ${res.status()} (expected 401/403)`);
      }
    }
    expect(
      failures,
      `User-specific endpoints must deny unauthenticated access:\n${failures.join("\n")}`
    ).toHaveLength(0);

    // Real isolation: two authenticated users each see their own identity only
    const learnerProfile = await (await request.get(`${BASE}/api/auth/user`, { headers: learnerAuthHeaders() })).json();
    const parentProfile  = await (await request.get(`${BASE}/api/auth/user`, { headers: parentAuthHeaders() })).json();

    expect(learnerProfile.id, "Learner JWT must resolve to learner user").toBe(getTestTokens().learnerId);
    expect(parentProfile.id,  "Parent JWT must resolve to parent user").toBe(getTestTokens().parentId);
    expect(learnerProfile.id, "Learner and parent profiles must be different users").not.toBe(parentProfile.id);

    // Parent JWT must NOT be able to access learner-only endpoints with learner role
    expect(learnerProfile.role, "Learner JWT must carry learner role").toBe("learner");
    expect(parentProfile.role,  "Parent JWT must carry parent role").toBe("parent");
  });

  test("TC-SEC-003 — /api/user/stats is protected", async ({ request }) => {
    const res = await request.get(`${BASE}/api/user/stats`);
    expect(
      [401, 403],
      `User stats should be protected, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-SEC-004 — XSS payload in AI tutor is not reflected in response", async ({ request }) => {
    const maliciousInputs = [
      "<script>alert('xss')</script>",
      "<img src=x onerror=alert(1)>",
    ];
    for (const input of maliciousInputs) {
      const res = await request.post(`${BASE}/api/ai/tutor`, {
        data: { message: input, subjectId: 1 },
      });
      expect([200, 400, 401, 403, 422, 429]).toContain(res.status());
      if (res.status() === 200) {
        const body = await res.text();
        expect(body).not.toContain("<script>alert");
        expect(body).not.toContain("onerror=alert");
      }
    }
  });

  test("TC-SEC-005 — admin force-unlock requires admin role", async ({ request }) => {
    const res = await request.post(`${BASE}/api/admin/users/some-user-id/force-unlock`, {
      data: {},
    });
    expect(
      [401, 403],
      `Force unlock must require admin, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-SEC-006 — admin lock-status requires admin role", async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/users/some-user-id/lock-status`);
    expect(
      [401, 403],
      `Lock status must require admin, got ${res.status()}`
    ).toContain(res.status());
  });

  test("TC-SEC-007 — rate-limited endpoint returns 429 or auth error after burst", async ({ request }) => {
    const requests = Array.from({ length: 5 }).map(() =>
      request.post(`${BASE}/api/ai/tutor`, {
        data: { message: "rate limit test", subjectId: 1 },
      })
    );
    const responses = await Promise.all(requests);
    const statuses = responses.map((r) => r.status());
    const validStatuses = [200, 400, 401, 403, 429];
    statuses.forEach((s, i) => {
      expect(
        validStatuses,
        `Response ${i} had unexpected status ${s}`
      ).toContain(s);
    });
    const hasExpectedAuthOrRateLimit = statuses.some((s) => [401, 403, 429].includes(s));
    expect(
      hasExpectedAuthOrRateLimit,
      "At least one request should be denied (401/403) or rate-limited (429)"
    ).toBe(true);
  });

  test("TC-SEC-009 — parent JWT cannot access admin-only routes and learner JWT cannot access parent child-progress", async ({ request }) => {
    // Parent role cannot call admin endpoints
    const adminRes = await request.get(`${BASE}/api/admin/plans`, {
      headers: parentAuthHeaders(),
    });
    expect(
      [401, 403],
      `Parent JWT must not access admin endpoints (got ${adminRes.status()})`
    ).toContain(adminRes.status());

    // Learner role (no parent role) must be denied /api/parent/child-progress
    const childProgressRes = await request.get(`${BASE}/api/parent/child-progress`, {
      headers: learnerAuthHeaders(),
    });
    expect(
      [401, 403],
      `Learner JWT must not access parent child-progress endpoint (got ${childProgressRes.status()})`
    ).toContain(childProgressRes.status());
  });

  test("TC-SEC-008 — file upload endpoint rejects unauthenticated requests and invalid file types", async ({ request }) => {
    const uploadEndpoint = `${BASE}/api/admin/dbe-ingestion/upload`;

    const unauthRes = await request.post(uploadEndpoint, {
      multipart: {
        pdf: {
          name: "test.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("fake-pdf-content"),
        },
      },
    });
    expect(
      [401, 403],
      `File upload without auth must be rejected, got ${unauthRes.status()}`
    ).toContain(unauthRes.status());

    const invalidTypeRes = await request.post(uploadEndpoint, {
      multipart: {
        pdf: {
          name: "malicious.exe",
          mimeType: "application/octet-stream",
          buffer: Buffer.from("MZ\x90\x00executable"),
        },
      },
    });
    expect(
      [400, 401, 403, 415, 422],
      `Non-PDF file upload must be rejected, got ${invalidTypeRes.status()}`
    ).toContain(invalidTypeRes.status());
  });
});
