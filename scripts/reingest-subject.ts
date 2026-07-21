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
  const args = process.argv.slice(3);
  // force DELETEs a subject-year before re-inserting. Concurrent workers then
  // wipe each other's rows — that is how Physical Sciences 2023-2025 was lost
  // while the run reported "16 ok, 0 failed". Additive is the default; force is
  // opt-in and unsafe until the replace is transactional and a unique index
  // exists on (subject, year, paper_number, language, question_number).
  const force = args.includes("--force");
  const years = args.filter((a) => !a.startsWith("--")).map(Number).filter((n) => !Number.isNaN(n));

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

  log(`Ingesting ${targetYears.length} year(s) ${force ? "WITH FORCE (destructive)" : "additively"}: ${targetYears.join(", ")}`);

  // Guard: a row count that drops mid-run means workers are deleting each
  // other's inserts. Abort rather than keep going and lose more.
  const rowCount = async () => {
    const r = await db.execute(sql`
      SELECT COUNT(*)::int AS n FROM dbe_verbatim_questions WHERE subject = ${subject}
    `);
    return Number((r as any).rows[0].n);
  };
  let watermark = await rowCount();

  for (const year of targetYears) {
    try {
      const s = await runIngestionBatch(catalog as any, { subject, year, force });
      const now = await rowCount();
      const delta = now - watermark;
      log(`   ${year}: ${s.completed} ok, ${s.failed} failed, ${s.skipped} skipped, rows ${delta >= 0 ? "+" : ""}${delta}`);
      if (now < watermark) {
        log(`   ABORT — row count fell ${watermark} -> ${now}. Stopping before more is lost.`);
        break;
      }
      watermark = now;
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
