/**
 * BrainTrack Rate Limiter Verification
 *
 * Fires rapid sequential requests until a 429 appears or MAX_REQUESTS have
 * been sent, then reports PASS or FAIL for each named rate limiter.
 *
 * All five limiters are exercised by sending real HTTP requests:
 *   authLimiter      → POST /api/login          (10 req / 15 min)
 *   tutorLimiter     → POST /api/ai/tutor        (8 req  / 60 s)
 *   heavyLimiter     → POST /api/caps/adaptive-explanation (5 req / 60 s)
 *   publicPostLimiter→ POST /api/track/click     (15 req / 60 s)
 *   activationLimiter→ POST /api/activation/activate (5 req / 15 min)
 *
 * IP strategy:
 *   - authLimiter, publicPostLimiter, activationLimiter: unique private IPs
 *     (10.31.x.1) that are outside the TEST_HARNESS range, so the security
 *     monitor still protects them — but 429 is expected before block (limiter
 *     max < monitor threshold of 20).
 *   - tutorLimiter, heavyLimiter: use TEST_HARNESS_IPs (10.20.1.x) which are
 *     exempt from the IP-abuse security-monitor block when TEST_MODE=true, so
 *     the full request budget is available to observe the limiter's 429.
 *
 * Exit codes:
 *   0 — all limiters PASS
 *   1 — one or more limiters FAIL (429 not observed within MAX_REQUESTS)
 *
 * Usage:  tsx tests/stress/rate-limit-verify.ts
 *         BASE_URL=http://localhost:5000 tsx tests/stress/rate-limit-verify.ts
 */

const BASE = process.env.BASE_URL || "http://localhost:5000";
const MAX_REQUESTS = 300;

interface LimiterSpec {
  name: string;
  method: "GET" | "POST";
  path: string;
  body?: string;
  headers: Record<string, string>;
  description: string;
}

const LIMITERS: LimiterSpec[] = [
  {
    name: "authLimiter",
    method: "POST",
    path: "/api/login",
    body: JSON.stringify({ username: "stress@test.invalid", password: "wrongpassword" }),
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "10.31.1.1",
    },
    description: "POST /api/login — 10 req / 15 min (app.use-level, no prior auth needed)",
  },
  {
    name: "tutorLimiter",
    method: "POST",
    path: "/api/ai/tutor",
    body: JSON.stringify({ message: "stress test", subjectId: 1 }),
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "10.20.1.1",
    },
    description:
      "POST /api/ai/tutor — 8 req / 60 s (skip: TEST_MODE=true in server env; " +
      "active in production where TEST_MODE is unset)",
  },
  {
    name: "heavyLimiter",
    method: "POST",
    path: "/api/caps/adaptive-explanation",
    body: JSON.stringify({ subjectId: 1, topicId: 1 }),
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "10.20.1.2",
    },
    description:
      "POST /api/caps/adaptive-explanation — 5 req / 60 s (placed after isAuthenticated; " +
      "429 unreachable without a valid session)",
  },
  {
    name: "publicPostLimiter",
    method: "POST",
    path: "/api/track/click",
    body: JSON.stringify({ url: "/stress-test", ref: "stress" }),
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "10.31.4.1",
    },
    description: "POST /api/track/click — 15 req / 60 s (no auth required)",
  },
  {
    name: "activationLimiter",
    method: "POST",
    path: "/api/activation/activate",
    body: JSON.stringify({ code: "STRESS-TEST-INVALID" }),
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "10.31.5.1",
    },
    description: "POST /api/activation/activate — 5 req / 15 min (no auth required)",
  },
];

interface VerifyResult {
  name: string;
  description: string;
  requestsSent: number;
  first429At: number | null;
  verdict: "PASS" | "FAIL";
  note: string;
}

async function verifyLimiter(spec: LimiterSpec): Promise<VerifyResult> {
  const url = `${BASE}${spec.path}`;
  let first429At: number | null = null;

  for (let i = 1; i <= MAX_REQUESTS; i++) {
    let status: number;
    try {
      const init: RequestInit = {
        method: spec.method,
        headers: spec.headers,
        ...(spec.body ? { body: spec.body } : {}),
      };
      const res = await fetch(url, init);
      status = res.status;
    } catch {
      status = 0;
    }

    if (status === 429) {
      first429At = i;
      break;
    }

    if (status === 403) {
      return {
        name: spec.name,
        description: spec.description,
        requestsSent: i,
        first429At: null,
        verdict: "FAIL",
        note: `Received 403 at request ${i} — IP blocked by security monitor before 429 was reached`,
      };
    }
  }

  const verdict: "PASS" | "FAIL" = first429At !== null ? "PASS" : "FAIL";
  const note =
    first429At !== null
      ? `429 returned after ${first429At} request(s)`
      : `No 429 observed in ${MAX_REQUESTS} requests — ${describeFailReason(spec)}`;

  return {
    name: spec.name,
    description: spec.description,
    requestsSent: first429At ?? MAX_REQUESTS,
    first429At,
    verdict,
    note,
  };
}

function describeFailReason(spec: LimiterSpec): string {
  if (spec.name === "tutorLimiter") {
    return (
      "tutorLimiter has skip: () => TEST_MODE === 'true'; " +
      "server running with TEST_MODE=true disables this limiter for E2E compatibility. " +
      "Active in production (TEST_MODE unset). " +
      "Verify with authenticated requests or in production."
    );
  }
  if (spec.name === "heavyLimiter") {
    return (
      "heavyLimiter is placed after isAuthenticated on all its routes; " +
      "unauthenticated requests receive 401 before the limiter can fire. " +
      "Move heavyLimiter before isAuthenticated or verify with an authenticated session."
    );
  }
  return "429 not triggered within budget";
}

function padEnd(s: string, n: number): string {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

function printResults(results: VerifyResult[]): void {
  const cols: Array<{ key: keyof VerifyResult; label: string; width: number }> = [
    { key: "name", label: "Limiter", width: 21 },
    { key: "requestsSent", label: "Sent", width: 6 },
    { key: "first429At", label: "429@", width: 6 },
    { key: "verdict", label: "Verdict", width: 7 },
    { key: "note", label: "Note", width: 56 },
  ];

  const header = cols.map((c) => padEnd(c.label, c.width)).join(" | ");
  const divider = cols.map((c) => "-".repeat(c.width)).join("-+-");

  console.log("\n" + divider);
  console.log(header);
  console.log(divider);

  for (const r of results) {
    const icon = r.verdict === "PASS" ? "✓" : "✗";
    const line = cols
      .map((c) => {
        const val = r[c.key as keyof VerifyResult];
        const str = val === null || val === undefined ? "-" : String(val);
        return padEnd(str.length > c.width ? str.slice(0, c.width - 1) + "…" : str, c.width);
      })
      .join(" | ");
    console.log(`${icon} ${line}`);
  }
  console.log(divider + "\n");
}

async function checkServerAlive(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  console.log(`\nBrainTrack Rate Limiter Verification`);
  console.log(`Target      : ${BASE}`);
  console.log(`Max requests: ${MAX_REQUESTS} per limiter`);
  console.log(`IPs used    : unique per limiter; TEST_HARNESS_IPs (10.20.1.x) for`);
  console.log(`              tutor/heavy to bypass security-monitor block\n`);

  const results: VerifyResult[] = [];

  for (const spec of LIMITERS) {
    process.stdout.write(`  Verifying ${spec.name} … `);
    const result = await verifyLimiter(spec);
    const tag = result.verdict === "PASS" ? "PASS" : "FAIL";
    process.stdout.write(`${tag} — ${result.note.split(" — ")[0]}\n`);
    results.push(result);
  }

  printResults(results);

  process.stdout.write("  Server survival check: GET /api/health … ");
  const alive = await checkServerAlive();
  if (!alive) {
    process.stdout.write("FAIL\n");
    console.error("FAIL: Server did not survive rate-limit flood — /api/health returned non-200.");
    process.exit(1);
  }
  process.stdout.write("PASS\n\n");

  const failures = results.filter((r) => r.verdict === "FAIL");
  const passCount = results.filter((r) => r.verdict === "PASS").length;

  if (failures.length > 0) {
    console.error(`FAILED: ${failures.length} limiter(s) did not trigger a 429 within ${MAX_REQUESTS} requests:`);
    for (const f of failures) {
      console.error(`  ✗ ${f.name}: ${f.note}`);
    }
    process.exit(1);
  }

  console.log(`Verification complete: ${passCount} PASS. Server alive. Exit 0.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Rate limit verify error:", err);
  process.exit(1);
});
