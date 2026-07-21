/**
 * Additive ingestion sweep over every subject that is not launch-ready.
 *
 * No --force anywhere: nothing is deleted, missing papers are simply fetched,
 * parsed and stored, then the release gate runs per subject. Safe to interrupt
 * and re-run — completed papers are skipped via dbe_ingestion_log.
 *
 * Sequential on purpose. Concurrent ingestion of the same subject has been
 * shown to destroy rows (workers wipe each other's DELETE-then-INSERT), so
 * this runs one subject at a time, one year at a time.
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

// Ordered by learner impact: core-subject gaps first, then thin subjects,
// then the African-language tail.
const TARGETS = [
  "Physical Sciences",        // Afrikaans memo pairing + restore 2023-2025
  "Mathematics",              // thin EN, no AF
  "Technical Sciences",       // no AF
  "Sesotho Home Language",    // 360 ingested, 0 released
  "Sepedi Home Language",     // 34 servable
  "Xitsonga Home Language",
  "Xitsonga First Additional Language",
  "Tshivenda Home Language",
  "Marine Sciences",
  "Engineering Graphics and Design",
  "Civil Technology",
  "Dance Studies",
  "siSwati Home Language",
  "Technical Mathematics",
];

async function totals() {
  const r = await db.execute(sql`
    SELECT COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE released_at IS NOT NULL)::int AS released
    FROM dbe_verbatim_questions
  `);
  return (r as any).rows[0];
}

async function main() {
  const before = await totals();
  log(`START: ${before.released}/${before.total} released`);

  // Heal the broken-window debris: while migration 0032 was missing, question
  // inserts failed silently but memo log rows were still written as
  // "completed" — claiming pairing work that never landed. Question papers
  // self-heal (a NULL/0 question_count is retried), memos do not: they skip on
  // status alone. Clear the target subjects' memo logs so memos re-fetch and
  // re-pair; the operation is cheap and idempotent.
  const healed = await db.execute(sql`
    DELETE FROM dbe_ingestion_log
    WHERE is_memo = true
      AND subject IN (${sql.join(TARGETS.map((t) => sql`${t}`), sql`, `)})
  `);
  log(`cleared ${(healed as any).rowCount ?? 0} stale memo log entries for re-pairing`);

  const catalog = ((catalogJson as any).papers ?? catalogJson) as any[];

  for (const subject of TARGETS) {
    const years = [...new Set(
      catalog
        .filter((e) => e.subject === subject && typeof e.year === "number")
        .map((e) => e.year as number),
    )].sort();

    if (years.length === 0) {
      log(`── ${subject}: NO CATALOG ENTRIES — needs papers sourced, skipping`);
      continue;
    }

    log(`── ${subject} (${years.length} years)`);
    // Watermark guard: additive runs must never shrink a subject.
    const countFor = async () => {
      const r = await db.execute(
        sql`SELECT COUNT(*)::int AS n FROM dbe_verbatim_questions WHERE subject = ${subject}`,
      );
      return Number((r as any).rows[0].n);
    };
    let watermark = await countFor();

    for (const year of years) {
      try {
        const s = await runIngestionBatch(catalog, { subject, year });
        const now = await countFor();
        const delta = now - watermark;
        if (s.completed > 0 || delta !== 0) {
          log(`   ${year}: ${s.completed} ok, ${s.failed} failed, ${s.skipped} skipped, rows ${delta >= 0 ? "+" : ""}${delta}`);
        }
        if (now < watermark) {
          log(`   ABORT ${subject} — rows fell ${watermark} -> ${now}`);
          break;
        }
        watermark = now;
      } catch (err: any) {
        log(`   ${year}: FAILED — ${err?.message ?? err}`);
      }
    }

    try {
      const results = await releaseEligiblePapers(subject);
      log(`   gate: ${results.filter((r) => r.released).length}/${results.length} tuples released`);
    } catch (err: any) {
      log(`   gate FAILED — ${err?.message ?? err}`);
    }
  }

  const after = await totals();
  log(`END: ${after.released}/${after.total} released (gained ${after.released - before.released})`);
  process.exit(0);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
