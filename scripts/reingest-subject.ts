/**
 * Re-ingest one subject directly, with no shared checkpoint file.
 *
 * scripts/backfill-blocked-memos.ts keeps a checkpoint so a long run can
 * resume, but two concurrent runs share that one file and clobber each other —
 * a subject can end up marked done without ever being processed. This script
 * takes an explicit target and does the work unconditionally.
 *
 * Usage: npx tsx scripts/reingest-subject.ts "Physical Sciences" [year...]
 */
if (process.env.ENABLE_OCR_FALLBACK === undefined) {
  process.env.ENABLE_OCR_FALLBACK = "1";
}

import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { runIngestionBatch } from "../server/dbe-ingestion";
import { releaseEligiblePapers } from "../server/release-gate";
import catalogJson from "../server/data/dbe-papers-catalog.json";

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

async function coverage(subject: string) {
  const r = await db.execute(sql`
    SELECT language,
           COUNT(*)::int AS rows,
           COUNT(*) FILTER (
             WHERE memo_text IS NOT NULL AND length(memo_text) >= 20
           )::int AS memo_ok,
           COUNT(*) FILTER (WHERE released_at IS NOT NULL)::int AS released
    FROM dbe_verbatim_questions
    WHERE subject = ${subject}
    GROUP BY language ORDER BY language
  `);
  return (r as any).rows;
}

async function main() {
  const subject = process.argv[2];
  if (!subject) {
    console.error('usage: npx tsx scripts/reingest-subject.ts "<Subject>" [year...]');
    process.exit(1);
  }
  const years = process.argv.slice(3).map(Number).filter((n) => !Number.isNaN(n));

  log(`BEFORE ${subject}:`);
  (await coverage(subject)).forEach((r: any) =>
    log(`   ${r.language.padEnd(10)} rows=${r.rows} memo_ok=${r.memo_ok} released=${r.released}`),
  );

  const catalog = (catalogJson as any).papers ?? catalogJson;
  const targetYears = years.length
    ? years
    : [...new Set((catalog as any[])
        .filter((e) => e.subject === subject && typeof e.year === "number")
        .map((e) => e.year as number))].sort();

  log(`Re-ingesting ${targetYears.length} year(s): ${targetYears.join(", ")}`);

  for (const year of targetYears) {
    try {
      const s = await runIngestionBatch(catalog as any, { subject, year, force: true });
      log(`   ${year}: ${s.completed} ok, ${s.failed} failed, ${s.skipped} skipped`);
    } catch (err: any) {
      log(`   ${year}: FAILED — ${err?.message ?? err}`);
    }
  }

  const results = await releaseEligiblePapers(subject);
  log(`gate: ${results.filter((r) => r.released).length}/${results.length} tuples released`);

  log(`AFTER ${subject}:`);
  (await coverage(subject)).forEach((r: any) =>
    log(`   ${r.language.padEnd(10)} rows=${r.rows} memo_ok=${r.memo_ok} released=${r.released}`),
  );
  process.exit(0);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
