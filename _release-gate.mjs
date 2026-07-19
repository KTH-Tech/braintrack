import { register } from "tsx/esm/api";
register();
const { releaseEligiblePapers, getSubjectReleaseCounts } = await import("./server/release-gate.ts");
const pg = await import("pg");
const c = new pg.default.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const { rows } = await c.query("SELECT DISTINCT subject FROM dbe_verbatim_questions ORDER BY subject");
await c.end();
let releasedTotal = 0;
for (const { subject } of rows) {
  try {
    const result = await releaseEligiblePapers(subject);
    const n = typeof result === "number" ? result : (result?.released ?? result?.count ?? 0);
    releasedTotal += Number(n) || 0;
    console.log(`[gate] ${subject}: ${JSON.stringify(result)}`);
  } catch (e) {
    console.log(`[gate] ${subject}: FAILED ${e?.message ?? e}`);
  }
}
console.log(`[gate] DONE across ${rows.length} subjects`);
try {
  const counts = await getSubjectReleaseCounts();
  console.log(JSON.stringify(counts, null, 2).slice(0, 3000));
} catch (e) {
  console.log("counts unavailable:", e?.message);
}
process.exit(0);
