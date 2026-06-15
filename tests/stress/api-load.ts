/**
 * BrainTrack API Load Test — autocannon-based concurrent HTTP flood.
 *
 * Hits every rate-limited and high-cost API route with 10 concurrent
 * connections for 5 seconds each and prints a summary table.
 *
 * Exit code 1 if any public route returns a 5xx, has P95 > threshold,
 * or if the server does not respond to a final /api/health ping.
 *
 * Uses a dedicated X-Forwarded-For IP (10.32.0.1) so the load test does
 * not pollute the default socket IP's security-monitor counter.
 *
 * Usage:  tsx tests/stress/api-load.ts
 *         BASE_URL=http://localhost:5000 tsx tests/stress/api-load.ts
 */

import autocannon, { type Result, type Options } from "autocannon";

const BASE = process.env.BASE_URL || "http://localhost:5000";
const CONNECTIONS = 10;
const DURATION_SEC = 5;

const LOAD_TEST_IP = "10.32.0.1";

interface EndpointSpec {
  label: string;
  method: "GET" | "POST";
  path: string;
  body?: string;
  extraHeaders?: Record<string, string>;
  publicRoute: boolean;
  p95ThresholdMs: number;
  notes: string;
}

const ENDPOINTS: EndpointSpec[] = [
  {
    label: "GET /api/health",
    method: "GET",
    path: "/api/health",
    publicRoute: true,
    p95ThresholdMs: 500,
    notes: "Baseline",
  },
  {
    label: "GET /api/exam-dates",
    method: "GET",
    path: "/api/exam-dates",
    publicRoute: true,
    p95ThresholdMs: 500,
    notes: "Lightweight public",
  },
  {
    label: "GET /api/exam-countdown",
    method: "GET",
    path: "/api/exam-countdown",
    publicRoute: true,
    p95ThresholdMs: 1000,
    notes: "Lightweight public",
  },
  {
    label: "GET /api/caps/dbe-link",
    method: "GET",
    path: "/api/caps/dbe-link",
    publicRoute: true,
    p95ThresholdMs: 1000,
    notes: "Public, DB-backed",
  },
  {
    label: "GET /api/subjects",
    method: "GET",
    path: "/api/subjects",
    publicRoute: false,
    p95ThresholdMs: 2000,
    notes: "Auth-gated — expect 401, verify no 5xx",
  },
  {
    label: "GET /api/dbe/available",
    method: "GET",
    path: "/api/dbe/available",
    publicRoute: false,
    p95ThresholdMs: 2000,
    notes: "Auth-gated — expect 401, verify no 5xx",
  },
  {
    label: "POST /api/login",
    method: "POST",
    path: "/api/login",
    body: JSON.stringify({ username: "stress@test.invalid", password: "badpass" }),
    extraHeaders: { "content-type": "application/json" },
    publicRoute: false,
    p95ThresholdMs: 2000,
    notes: "Auth limiter target — expect 429 under flood",
  },
];

interface SummaryRow {
  endpoint: string;
  requests: number;
  rps: number;
  p50: number;
  p95: number;
  p99: number;
  errors: number;
  fivexx: number;
  verdict: "PASS" | "FAIL";
  reason: string;
}

function count5xx(result: Result): number {
  const stats = (result as any).statusCodeStats as Record<string, { count: number }> | undefined;
  if (!stats) return 0;
  return Object.entries(stats)
    .filter(([code]) => parseInt(code, 10) >= 500)
    .reduce((sum, [, v]) => sum + (v?.count ?? 0), 0);
}

async function runEndpoint(spec: EndpointSpec): Promise<SummaryRow> {
  const headers: Record<string, string> = {
    "x-forwarded-for": LOAD_TEST_IP,
    ...(spec.extraHeaders ?? {}),
  };

  const opts: Options = {
    url: `${BASE}${spec.path}`,
    connections: CONNECTIONS,
    duration: DURATION_SEC,
    method: spec.method,
    headers,
    percentiles: [95],
    ...(spec.body ? { body: spec.body } : {}),
  };

  const result: Result = await new Promise((resolve, reject) => {
    const inst = autocannon(opts, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
    autocannon.track(inst, { renderProgressBar: false });
  });

  const totalRequests = result.requests.total ?? 0;
  const rps = Math.round(result.requests.average ?? 0);
  const lat = result.latency as any;
  const p50 = lat.p50 ?? lat.average ?? 0;
  const p95 = lat.p95 ?? lat.p90 ?? lat.p97_5 ?? lat.max ?? 0;
  const p99 = lat.p99 ?? lat.max ?? 0;
  const totalErrors = (result.errors ?? 0) + (result.timeouts ?? 0);
  const fivexx = count5xx(result);

  let verdict: "PASS" | "FAIL" = "PASS";
  let reason = "OK";

  if (fivexx > 0) {
    verdict = "FAIL";
    reason = `${fivexx} 5xx response(s) detected`;
  } else if (spec.publicRoute && p95 > spec.p95ThresholdMs) {
    verdict = "FAIL";
    reason = `P95 ${p95}ms exceeds ${spec.p95ThresholdMs}ms threshold`;
  }

  return {
    endpoint: spec.label,
    requests: totalRequests,
    rps,
    p50,
    p95,
    p99,
    errors: totalErrors,
    fivexx,
    verdict,
    reason,
  };
}

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

function printTable(rows: SummaryRow[]): void {
  const cols: Array<{ key: keyof SummaryRow; label: string; width: number }> = [
    { key: "endpoint", label: "Endpoint", width: 28 },
    { key: "requests", label: "Reqs", width: 6 },
    { key: "rps", label: "RPS", width: 6 },
    { key: "p50", label: "P50ms", width: 7 },
    { key: "p95", label: "P95ms", width: 7 },
    { key: "p99", label: "P99ms", width: 7 },
    { key: "errors", label: "Errs", width: 5 },
    { key: "fivexx", label: "5xx", width: 4 },
    { key: "verdict", label: "Verdict", width: 7 },
    { key: "reason", label: "Reason", width: 38 },
  ];

  const header = cols.map((c) => pad(c.label, c.width)).join(" | ");
  const divider = cols.map((c) => "-".repeat(c.width)).join("-+-");

  console.log("\n" + divider);
  console.log(header);
  console.log(divider);

  for (const row of rows) {
    const icon = row.verdict === "FAIL" ? "✗" : "✓";
    const line = cols.map((c) => pad(String(row[c.key]), c.width)).join(" | ");
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
  console.log(`\nBrainTrack API Load Test`);
  console.log(`Target : ${BASE}`);
  console.log(`Config : ${CONNECTIONS} connections × ${DURATION_SEC}s per endpoint`);
  console.log(`Load IP: ${LOAD_TEST_IP} (isolated from socket IP)\n`);

  const rows: SummaryRow[] = [];

  for (const spec of ENDPOINTS) {
    process.stdout.write(`  Testing ${spec.label} … `);
    const row = await runEndpoint(spec);
    process.stdout.write(`${row.verdict} (P95=${row.p95}ms, 5xx=${row.fivexx})\n`);
    rows.push(row);
  }

  printTable(rows);

  process.stdout.write("  Server survival check: GET /api/health … ");
  const alive = await checkServerAlive();
  if (!alive) {
    process.stdout.write("FAIL\n");
    console.error("FAIL: Server did not survive load test — /api/health returned non-200.");
    process.exit(1);
  }
  process.stdout.write("PASS\n\n");

  const failures = rows.filter((r) => r.verdict === "FAIL");
  if (failures.length > 0) {
    console.error(`FAILED: ${failures.length} endpoint(s) did not meet criteria:`);
    for (const f of failures) console.error(`  • ${f.endpoint}: ${f.reason}`);
    process.exit(1);
  } else {
    console.log(`All ${rows.length} endpoints passed load criteria. Server alive.`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Load test error:", err);
  process.exit(1);
});
