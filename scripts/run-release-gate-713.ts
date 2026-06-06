/**
 * Task #713 — Run release gate for AfrikaansHL 2020 and isiXhosa SAL 2022,
 * then regenerate reports/memo-coverage-post-476.csv with 98% threshold.
 */
import { releaseEligiblePapers } from "../server/release-gate";
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

const TASK_476_TARGETS: { subject: string; year: number }[] = [
  { subject: "Afrikaans Home Language", year: 2020 },
  { subject: "Engineering Graphics and Design", year: 2022 },
  { subject: "isiXhosa Second Additional Language", year: 2022 },
  { subject: "Technical Mathematics", year: 2020 },
  { subject: "Technical Mathematics", year: 2021 },
  { subject: "Technical Mathematics", year: 2022 },
  { subject: "Technical Mathematics", year: 2023 },
  { subject: "Technical Mathematics", year: 2024 },
  { subject: "Technical Mathematics", year: 2025 },
];

const ABOVE_THRESHOLD_PCT = 98.0;

async function main() {
  // ── 1. Release gate for AfrikaansHL 2020 ───────────────────────────────────
  log("[1] Running release gate for Afrikaans Home Language...");
  const afResults = await releaseEligiblePapers("Afrikaans Home Language");
  const afReleased = afResults.filter(r => r.released);
  log(`  Released ${afReleased.length}/${afResults.length} tuples`);
  for (const r of afReleased) {
    log(`  ✓ Y${r.year} P${r.paperNumber} ${r.session} ${r.language}: memo=${(r.memoCoverage*100).toFixed(1)}%`);
  }
  for (const r of afResults.filter(x => !x.released && x.year === 2020)) {
    log(`  ✗ Y${r.year} P${r.paperNumber} ${r.session} ${r.language}: memo=${(r.memoCoverage*100).toFixed(1)}%`);
  }

  // ── 2. Release gate for isiXhosa SAL 2022 ──────────────────────────────────
  log("\n[2] Running release gate for isiXhosa Second Additional Language...");
  const isiResults = await releaseEligiblePapers("isiXhosa Second Additional Language");
  const isiReleased = isiResults.filter(r => r.released);
  log(`  Released ${isiReleased.length}/${isiResults.length} tuples`);
  for (const r of isiResults) {
    const icon = r.released ? "✓" : "✗";
    log(`  ${icon} Y${r.year} P${r.paperNumber} ${r.session} ${r.language}: memo=${(r.memoCoverage*100).toFixed(1)}%`);
  }

  // ── 3. Collect per-year stats for all 9 Task #476 targets ──────────────────
  log("\n[3] Collecting Task #476 coverage stats...");
  const rows: string[] = [];
  rows.push([
    "subject",
    "year",
    "released_at_stamped",
    "tuples_total",
    "tuples_released",
    "tuples_not_released",
    "questions_total",
    "questions_with_memo",
    "memo_coverage_pct_after",
    "above_98pct_threshold",
    "status",
  ].join(","));

  let allAbove = true;
  for (const target of TASK_476_TARGETS) {
    // Coverage stats
    const cov = await db.execute(sql`
      SELECT
        COUNT(*)::int                                                                              AS total,
        COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text) >= 20)::int            AS with_memo,
        ROUND(100.0 * COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text) >= 20)
              / NULLIF(COUNT(*), 0), 2)                                                           AS memo_pct,
        COUNT(DISTINCT (paper_number::text || '|' || COALESCE(session,'') || '|' || language))::int AS tuples_total,
        COUNT(DISTINCT (paper_number::text || '|' || COALESCE(session,'') || '|' || language))
              FILTER (WHERE released_at IS NOT NULL)::int                                          AS tuples_released
      FROM dbe_verbatim_questions
      WHERE subject = ${target.subject} AND year = ${target.year}
    `);
    const c = cov.rows[0] as any;
    const pct = parseFloat(c.memo_pct || "0");
    const above = pct >= ABOVE_THRESHOLD_PCT;
    const hasReleased = (c.tuples_released || 0) > 0;
    const status = above ? "ABOVE_THRESHOLD" : "BELOW_THRESHOLD_NEEDS_FOLLOW_UP";

    if (!above) allAbove = false;

    rows.push([
      `"${target.subject}"`,
      target.year,
      hasReleased ? "yes" : "no",
      c.tuples_total,
      c.tuples_released,
      (c.tuples_total || 0) - (c.tuples_released || 0),
      c.total,
      c.with_memo,
      pct.toFixed(1),
      above ? "yes" : "no",
      status,
    ].join(","));

    const icon = above ? "✓" : "✗";
    log(`  ${icon} ${target.subject} ${target.year}: ${c.with_memo}/${c.total} = ${pct}% — ${status}`);
  }

  if (allAbove) {
    log("\n✓✓✓ ALL 9 Task #476 targets are ABOVE_THRESHOLD (≥98%)");
  } else {
    log("\n!!! Some targets still BELOW_THRESHOLD — check above");
  }

  // ── 4. Write CSV ────────────────────────────────────────────────────────────
  mkdirSync("reports", { recursive: true });
  const csvPath = path.join("reports", "memo-coverage-post-476.csv");
  writeFileSync(csvPath, rows.join("\n") + "\n", "utf8");
  log(`\nCSV written to ${csvPath} (${rows.length - 1} data rows)`);

  // ── 5. Validate: fail if any target is below threshold ─────────────────────
  if (!allAbove) {
    log("\nFAIL: CSV validation failed — some Task #476 targets are below 98%");
    process.exit(2);
  }

  log("PASS: All Task #476 targets confirmed ≥98% memo coverage");
  process.exit(0);
}

main().catch(e => { log("FATAL", e); process.exit(1); });
