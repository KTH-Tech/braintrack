/**
 * Task #713 — Part 2: Re-ingest EGD 2022 + Technical Mathematics 2020-2023
 * (Continues after timeout cut off part 1)
 */
if (process.env.ENABLE_OCR_FALLBACK === undefined) {
  process.env.ENABLE_OCR_FALLBACK = "1";
}

import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { runIngestionBatch, rebuildMasteryFromExisting } from "../server/dbe-ingestion";
import { releaseEligiblePapers } from "../server/release-gate";
import catalogJson from "../server/data/dbe-papers-catalog.json";

const TARGETS = [
  { subject: "Engineering Graphics and Design", year: 2022 },
  { subject: "Technical Mathematics", year: 2020 },
  { subject: "Technical Mathematics", year: 2021 },
  { subject: "Technical Mathematics", year: 2022 },
  { subject: "Technical Mathematics", year: 2023 },
];

const log = (...args: any[]) => console.log(`[${new Date().toISOString()}]`, ...args);

async function getCoverage(subject: string, year: number) {
  const r = await db.execute(sql`
    SELECT paper_number, session, language,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text) >= 20)::int AS memo_rows
    FROM dbe_verbatim_questions
    WHERE subject = ${subject} AND year = ${year}
    GROUP BY 1,2,3 ORDER BY 1,2,3
  `);
  return r.rows as any[];
}

async function main() {
  const catalog = catalogJson as any[];

  for (const target of TARGETS) {
    log(`\n${"=".repeat(60)}`);
    log(`▶ ${target.subject} ${target.year}`);

    const before = await getCoverage(target.subject, target.year);
    const bT = before.reduce((s, r) => s + Number(r.total), 0);
    const bM = before.reduce((s, r) => s + Number(r.memo_rows), 0);
    log(`  Before: ${bM}/${bT} = ${bT > 0 ? Math.round(100 * bM / bT) : 0}%`);
    before.forEach(r => {
      const pct = Number(r.total) > 0 ? Math.round(100 * Number(r.memo_rows) / Number(r.total)) : 0;
      log(`    P${r.paper_number} ${r.session} ${r.language}: ${r.memo_rows}/${r.total} = ${pct}%`);
    });

    try {
      const s = await runIngestionBatch(catalog, { subject: target.subject, year: target.year, force: true });
      log(`  ✔ ${s.completed} ok / ${s.failed} failed / ${s.skipped} skipped`);
    } catch (err: any) {
      log(`  ✖ FAILED: ${err?.message}`);
    }

    const after = await getCoverage(target.subject, target.year);
    const aT = after.reduce((s, r) => s + Number(r.total), 0);
    const aM = after.reduce((s, r) => s + Number(r.memo_rows), 0);
    log(`  After:  ${aM}/${aT} = ${aT > 0 ? Math.round(100 * aM / aT) : 0}%`);
    after.forEach(r => {
      const pct = Number(r.total) > 0 ? Math.round(100 * Number(r.memo_rows) / Number(r.total)) : 0;
      log(`    P${r.paper_number} ${r.session} ${r.language}: ${r.memo_rows}/${r.total} = ${pct}%`);
    });

    try { await rebuildMasteryFromExisting(target.subject); } catch {}
  }

  log(`\n${"=".repeat(60)}`);
  log("Running release gate...");
  const allSubjects = [...new Set(TARGETS.map(t => t.subject))];
  // Also run for Afrikaans HL and isiXhosa SAL (already ingested in part 1)
  allSubjects.push("Afrikaans Home Language", "isiXhosa Second Additional Language");

  for (const subj of allSubjects) {
    const results = await releaseEligiblePapers(subj);
    const released = results.filter(r => r.released);
    log(`  ${subj}: ${released.length}/${results.length} tuples released`);
    for (const r of results) {
      log(`    ${r.released ? '✓' : '✗'} P${r.paperNumber} ${r.session} ${r.language} — memo ${r.memoCoverage}%`);
    }
  }

  log(`\nDone.`);
  process.exit(0);
}

main().catch(err => { log("FATAL", err); process.exit(1); });
