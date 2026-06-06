/**
 * Task #713 — Targeted re-ingestion for 7 memo-gap tuples.
 *
 * Fixes applied to the catalog before this script:
 *   1. TechMath 2020 P2 EN/AF memos: session "September" → "November"
 *   2. TechMath 2021 P2 May/June AF memo: added new entry (DBE English P2 May/June URL)
 *   3. TechMath 2022 P1/P2 AF memos: session "November" → "May/June"
 *   4. TechMath 2023 P2 May/June EN memo: added new entry (saexampapers AF May/June URL)
 *   5. isiXhosa SAL 2022 P1 memo: session "November" → "May/June"
 *   6. EGD 2022 P2 AF memo: session "September" → "May/June"
 *
 * Run:   npx tsx scripts/reingest-task-713-papers.ts
 * Tail:  tail -f /tmp/reingest-713.log
 */

if (process.env.ENABLE_OCR_FALLBACK === undefined) {
  process.env.ENABLE_OCR_FALLBACK = "1";
}

import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { runIngestionBatch, rebuildMasteryFromExisting } from "../server/dbe-ingestion";
import { releaseEligiblePapers } from "../server/release-gate";
import catalogJson from "../server/data/dbe-papers-catalog.json";

const TASK_713_TARGETS = [
  { subject: "Afrikaans Home Language",             year: 2020 },
  { subject: "isiXhosa Second Additional Language", year: 2022 },
  { subject: "Engineering Graphics and Design",     year: 2022 },
  { subject: "Technical Mathematics",               year: 2020 },
  { subject: "Technical Mathematics",               year: 2021 },
  { subject: "Technical Mathematics",               year: 2022 },
  { subject: "Technical Mathematics",               year: 2023 },
];

const log = (...args: any[]) => {
  const ts = new Date().toISOString();
  const msg = `[${ts}] ${args.join(" ")}`;
  console.log(msg);
};

async function getCoverage(subject: string, year: number) {
  const r = await db.execute(sql`
    SELECT
      paper_number,
      session,
      language,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text) >= 20)::int AS memo_rows
    FROM dbe_verbatim_questions
    WHERE subject = ${subject} AND year = ${year}
    GROUP BY 1, 2, 3
    ORDER BY 1, 2, 3
  `);
  return r.rows as any[];
}

async function main() {
  const catalog = catalogJson as any[];

  for (const target of TASK_713_TARGETS) {
    log(`\n${"=".repeat(60)}`);
    log(`▶ ${target.subject} ${target.year}`);

    const before = await getCoverage(target.subject, target.year);
    const bTotal = before.reduce((s, r) => s + Number(r.total), 0);
    const bMemo = before.reduce((s, r) => s + Number(r.memo_rows), 0);
    log(`  Before: ${bMemo}/${bTotal} rows have memo (${bTotal > 0 ? Math.round(100 * bMemo / bTotal) : 0}%)`);
    before.forEach(r => {
      const pct = Number(r.total) > 0 ? Math.round(100 * Number(r.memo_rows) / Number(r.total)) : 0;
      log(`    P${r.paper_number} ${r.session} ${r.language}: ${r.memo_rows}/${r.total} = ${pct}%`);
    });

    let summary = { completed: 0, failed: 0, skipped: 0 };
    try {
      summary = await runIngestionBatch(catalog, {
        subject: target.subject,
        year: target.year,
        force: true,
      });
      log(`  ✔ Ingestion done: ${summary.completed} ok / ${summary.failed} failed / ${summary.skipped} skipped`);
    } catch (err: any) {
      log(`  ✖ Ingestion FAILED: ${err?.message}`);
    }

    const after = await getCoverage(target.subject, target.year);
    const aTotal = after.reduce((s, r) => s + Number(r.total), 0);
    const aMemo = after.reduce((s, r) => s + Number(r.memo_rows), 0);
    log(`  After:  ${aMemo}/${aTotal} rows have memo (${aTotal > 0 ? Math.round(100 * aMemo / aTotal) : 0}%)`);
    after.forEach(r => {
      const pct = Number(r.total) > 0 ? Math.round(100 * Number(r.memo_rows) / Number(r.total)) : 0;
      log(`    P${r.paper_number} ${r.session} ${r.language}: ${r.memo_rows}/${r.total} = ${pct}%`);
    });

    try {
      await rebuildMasteryFromExisting(target.subject);
      log(`  Mastery rebuilt for ${target.subject}`);
    } catch (e: any) {
      log(`  Mastery rebuild error: ${e?.message}`);
    }
  }

  log(`\n${"=".repeat(60)}`);
  log("Running release gate for affected subjects...");
  for (const subj of [...new Set(TASK_713_TARGETS.map(t => t.subject))]) {
    const results = await releaseEligiblePapers(subj);
    const released = results.filter(r => r.released);
    const notReleased = results.filter(r => !r.released);
    log(`  ${subj}: ${released.length} tuples released, ${notReleased.length} still below threshold`);
    for (const r of released) {
      log(`    ✓ P${r.paperNumber} ${r.session} ${r.language} — memo ${r.memoCoverage}%`);
    }
    for (const r of notReleased) {
      log(`    ✗ P${r.paperNumber} ${r.session} ${r.language} — memo ${r.memoCoverage}% (below ${70}%)`);
    }
  }

  log(`\nDone.`);
  process.exit(0);
}

main().catch(err => {
  log("FATAL", err);
  process.exit(1);
});
