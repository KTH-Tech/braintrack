/**
 * scripts/dbe-mapping-report.ts — verifiable DBE/CAPS mapping proof.
 *
 * Rolls up the official `dbe_verbatim_questions` corpus into a per-subject
 * provenance report: how many questions were ingested, what share carry a
 * topic / match a real CAPS topic, which years and papers are covered, memo
 * coverage, released count, and the distinct DBE source URLs that prove where
 * each row came from.
 *
 * Read-only — safe against production.
 *
 * Usage:
 *   npx tsx scripts/dbe-mapping-report.ts
 *   npx tsx scripts/dbe-mapping-report.ts --out=reports/dbe-mapping.json
 *
 * (DATABASE_URL must already be in the environment — importing ../server/db
 *  constructs the pool and throws if it is unset.)
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { pool } from "../server/db";
import { computeDbeMappingReport } from "../server/dbe-mapping-report";

function argVal(name: string, fallback: string): string {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

async function main() {
  const outPath = argVal("out", "reports/dbe-mapping-report.json");
  const report = await computeDbeMappingReport();

  // Console table — one row per subject.
  const table = report.subjects.map((s) => ({
    subject: s.subject,
    questions: s.questionsIngested,
    "topic%": s.topicMappedPct,
    "caps%": s.capsMatchedPct,
    years: s.distinctYears,
    papers: s.distinctPaperInstances,
    "memo%": s.memoCoveragePct,
    released: s.releasedCount,
    sources: s.distinctSourcePaperUrls,
  }));

  console.log("\n=== DBE / CAPS Mapping Report ===");
  console.log(`Generated: ${report.generatedAt}\n`);
  console.table(table);

  const t = report.totals;
  console.log("\n--- Totals ---");
  console.log(`Subjects ingested:        ${t.subjects}`);
  console.log(`Questions ingested:       ${t.questionsIngested}`);
  console.log(`Topic present (non-null): ${t.topicMappedCount} (${t.topicMappedPct}%)`);
  console.log(`Matched a CAPS topic:     ${t.capsMatchedCount} (${t.capsMatchedPct}%)`);
  console.log(`Memo coverage:            ${t.memoCoveredCount} (${t.memoCoveragePct}%)`);
  console.log(`Released to learners:     ${t.releasedCount}`);
  console.log(`Distinct exam years:      ${t.distinctYears}`);
  console.log(`Distinct DBE source URLs: ${t.distinctSourcePaperUrls}`);
  console.log(
    `\nNOTE: "topic%" is the share of rows with any topic; "caps%" is the ` +
      `stricter share whose topic matches a real CAPS topic name. Reported ` +
      `as-is — topic extraction is best-effort and many rows are legitimately NULL.`,
  );

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nJSON written to ${outPath}`);
}

main()
  .then(async () => {
    await pool.end().catch(() => {});
  })
  .catch(async (err) => {
    console.error("[dbe-mapping-report] FATAL:", err);
    await pool.end().catch(() => {});
    process.exit(1);
  });
