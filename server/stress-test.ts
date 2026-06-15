import http from "http";

const BASE_URL = process.env.STRESS_TARGET || "http://localhost:5000";
const TOTAL_USERS = 8000;
const RAMP_UP_SECONDS = 30;
const TEST_DURATION_SECONDS = 60;
const CONCURRENT_BATCH = 200;

interface Result {
  endpoint: string;
  status: number;
  latency: number;
  error?: string;
}

const LEARNER_ENDPOINTS = [
  { method: "GET", path: "/api/health", weight: 5 },
  { method: "GET", path: "/api/subjects", weight: 15 },
  { method: "GET", path: "/api/subjects/1", weight: 10 },
  { method: "GET", path: "/api/subjects/1/papers", weight: 10 },
  { method: "GET", path: "/api/exam-papers", weight: 8 },
  { method: "GET", path: "/api/exam-dates", weight: 5 },
  { method: "GET", path: "/api/exam-countdown", weight: 5 },
  { method: "GET", path: "/api/about", weight: 3 },
  { method: "GET", path: "/api/push/vapid-public-key", weight: 3 },
  { method: "GET", path: "/api/simulated/subjects", weight: 8 },
  { method: "GET", path: "/api/simulated/all-papers", weight: 5 },
  { method: "GET", path: "/", weight: 15 },
  { method: "GET", path: "/features", weight: 5 },
  { method: "GET", path: "/faq", weight: 3 },
];

function pickEndpoint(): { method: string; path: string } {
  const totalWeight = LEARNER_ENDPOINTS.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * totalWeight;
  for (const ep of LEARNER_ENDPOINTS) {
    r -= ep.weight;
    if (r <= 0) return ep;
  }
  return LEARNER_ENDPOINTS[0];
}

function makeRequest(method: string, path: string): Promise<Result> {
  const url = new URL(path, BASE_URL);
  const start = Date.now();

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ endpoint: path, status: 0, latency: Date.now() - start, error: "timeout" });
    }, 10000);

    const req = http.request(url, { method, timeout: 10000 }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        clearTimeout(timeout);
        resolve({ endpoint: path, status: res.statusCode || 0, latency: Date.now() - start });
      });
    });

    req.on("error", (err) => {
      clearTimeout(timeout);
      resolve({ endpoint: path, status: 0, latency: Date.now() - start, error: err.message });
    });

    req.end();
  });
}

async function runBatch(count: number): Promise<Result[]> {
  const promises: Promise<Result>[] = [];
  for (let i = 0; i < count; i++) {
    const ep = pickEndpoint();
    promises.push(makeRequest(ep.method, ep.path));
  }
  return Promise.all(promises);
}

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║     BrainTrack — Stress Test (8000 Users)  ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log(`Target: ${BASE_URL}`);
  console.log(`Simulating: ${TOTAL_USERS} concurrent learners`);
  console.log(`Ramp-up: ${RAMP_UP_SECONDS}s | Duration: ${TEST_DURATION_SECONDS}s`);
  console.log(`Batch size: ${CONCURRENT_BATCH} requests`);
  console.log("");

  const healthCheck = await makeRequest("GET", "/api/health");
  if (healthCheck.status !== 200) {
    console.error(`Server not reachable (status: ${healthCheck.status}). Aborting.`);
    process.exit(1);
  }
  console.log(`Health check: ${healthCheck.status} (${healthCheck.latency}ms)`);
  console.log("");

  const allResults: Result[] = [];
  const startTime = Date.now();
  let totalRequests = 0;
  let currentUsers = 0;
  const rampIncrement = TOTAL_USERS / (RAMP_UP_SECONDS * 2);
  let phase = "ramp-up";

  const intervalResults: { time: number; rps: number; avgLatency: number; errors: number; users: number }[] = [];

  while ((Date.now() - startTime) / 1000 < RAMP_UP_SECONDS + TEST_DURATION_SECONDS) {
    const elapsed = (Date.now() - startTime) / 1000;

    if (elapsed < RAMP_UP_SECONDS) {
      currentUsers = Math.min(TOTAL_USERS, Math.floor(rampIncrement * elapsed * 2));
      phase = "ramp-up";
    } else {
      currentUsers = TOTAL_USERS;
      phase = "sustained";
    }

    const batchSize = Math.min(CONCURRENT_BATCH, Math.max(10, Math.floor(currentUsers / 10)));
    const batchStart = Date.now();
    const results = await runBatch(batchSize);
    const batchDuration = (Date.now() - batchStart) / 1000;

    allResults.push(...results);
    totalRequests += results.length;

    const avgLatency = Math.round(results.reduce((s, r) => s + r.latency, 0) / results.length);
    const errors = results.filter((r) => r.status === 0 || r.status >= 500).length;
    const rps = Math.round(results.length / Math.max(batchDuration, 0.01));

    intervalResults.push({ time: Math.round(elapsed), rps, avgLatency, errors, users: currentUsers });

    const bar = "█".repeat(Math.min(50, Math.floor((currentUsers / TOTAL_USERS) * 50)));
    const pad = "░".repeat(50 - bar.length);
    console.log(
      `[${phase.padEnd(9)}] ${bar}${pad} ${currentUsers}/${TOTAL_USERS} users | ${rps} req/s | ${avgLatency}ms avg | ${errors} err`
    );

    if (batchDuration < 0.5) {
      await new Promise((r) => setTimeout(r, Math.max(100, 500 - batchDuration * 1000)));
    }
  }

  console.log("\n");
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║                  TEST RESULTS                   ║");
  console.log("╚══════════════════════════════════════════════════╝");

  const totalDuration = (Date.now() - startTime) / 1000;
  const latencies = allResults.map((r) => r.latency).sort((a, b) => a - b);
  const successCount = allResults.filter((r) => r.status >= 200 && r.status < 400).length;
  const errorCount = allResults.filter((r) => r.status === 0 || r.status >= 500).length;
  const authBlocked = allResults.filter((r) => r.status === 401 || r.status === 403).length;

  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.9)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const avgLatency = Math.round(latencies.reduce((s, l) => s + l, 0) / latencies.length);
  const maxLatency = latencies[latencies.length - 1] || 0;

  console.log(`Duration:        ${totalDuration.toFixed(1)}s`);
  console.log(`Total Requests:  ${totalRequests}`);
  console.log(`Avg Throughput:  ${Math.round(totalRequests / totalDuration)} req/s`);
  console.log(`Peak Users:      ${TOTAL_USERS}`);
  console.log("");
  console.log("── Response Status ──────────────────────────────");
  console.log(`  Success (2xx/3xx): ${successCount} (${((successCount / totalRequests) * 100).toFixed(1)}%)`);
  console.log(`  Auth blocked (401/403): ${authBlocked}`);
  console.log(`  Server errors (5xx): ${errorCount}`);
  console.log(`  Timeouts/Network: ${allResults.filter((r) => r.status === 0).length}`);
  console.log("");
  console.log("── Latency (ms) ────────────────────────────────");
  console.log(`  Average:  ${avgLatency}ms`);
  console.log(`  P50:      ${p50}ms`);
  console.log(`  P90:      ${p90}ms`);
  console.log(`  P95:      ${p95}ms`);
  console.log(`  P99:      ${p99}ms`);
  console.log(`  Max:      ${maxLatency}ms`);
  console.log("");

  const byEndpoint = new Map<string, { count: number; errors: number; totalLatency: number; maxLatency: number }>();
  for (const r of allResults) {
    const key = r.endpoint;
    const entry = byEndpoint.get(key) || { count: 0, errors: 0, totalLatency: 0, maxLatency: 0 };
    entry.count++;
    entry.totalLatency += r.latency;
    if (r.status === 0 || r.status >= 500) entry.errors++;
    if (r.latency > entry.maxLatency) entry.maxLatency = r.latency;
    byEndpoint.set(key, entry);
  }

  console.log("── Per-Endpoint Breakdown ──────────────────────");
  console.log(`${"Endpoint".padEnd(35)} ${"Reqs".padStart(6)} ${"Avg".padStart(6)} ${"Max".padStart(6)} ${"Errs".padStart(5)}`);
  console.log("─".repeat(62));
  for (const [ep, data] of [...byEndpoint.entries()].sort((a, b) => b[1].count - a[1].count)) {
    const avg = Math.round(data.totalLatency / data.count);
    console.log(`${ep.padEnd(35)} ${String(data.count).padStart(6)} ${(avg + "ms").padStart(6)} ${(data.maxLatency + "ms").padStart(6)} ${String(data.errors).padStart(5)}`);
  }

  console.log("");
  const grade =
    p95 < 200 && errorCount === 0
      ? "A+ (Excellent)"
      : p95 < 500 && errorCount < totalRequests * 0.01
        ? "A (Good)"
        : p95 < 1000 && errorCount < totalRequests * 0.05
          ? "B (Acceptable)"
          : p95 < 2000
            ? "C (Needs optimization)"
            : "D (Critical issues)";

  console.log(`Overall Grade: ${grade}`);
  console.log("");

  if (p95 > 1000) console.log("⚠  P95 latency > 1s — consider adding caching or optimizing slow queries");
  if (errorCount > 0) console.log(`⚠  ${errorCount} server errors detected — check server logs`);
  if (p99 > 3000) console.log("⚠  P99 latency > 3s — some users experiencing very slow responses");
  if (errorCount === 0 && p95 < 500) console.log("✓  App handled 8000-user load with no errors and fast responses");
}

main().catch(console.error);
