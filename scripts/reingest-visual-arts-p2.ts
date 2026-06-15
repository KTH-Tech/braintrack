/**
 * Surgical re-ingestion of Visual Arts Paper 2.
 *
 * Deletes existing Visual Arts P2 rows (verbatim + log) for the requested year,
 * leaving Paper 1 untouched, then re-runs the ingestion engine against a
 * catalog filtered to Visual Arts P2 only. Finally runs the release gate so the
 * passing tuples become learner-visible.
 *
 * Run: npx tsx scripts/reingest-visual-arts-p2.ts [year]
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { runIngestionBatch, rebuildMasteryFromExisting } from "../server/dbe-ingestion";
import { releaseEligiblePapers } from "../server/release-gate";
import catalogJson from "../server/data/dbe-papers-catalog.json";

const SUBJECT = "Visual Arts";
const PAPER = 2;

async function main() {
  const yearArg = process.argv[2] ? Number(process.argv[2]) : undefined;

  const fullCatalog = catalogJson as any[];
  const p2Catalog = fullCatalog.filter(
    (e) =>
      e.subject === SUBJECT &&
      (e.paperNumber ?? 0) === PAPER &&
      (yearArg ? e.year === yearArg : true),
  );
  console.log(
    `[reingest] ${SUBJECT} P${PAPER}${yearArg ? ` ${yearArg}` : ""}: ${p2Catalog.length} catalog entries`,
  );

  // Delete only the P2 rows we are about to re-ingest (NULL attempts FK first).
  await db.execute(sql`
    UPDATE attempts SET dbe_verbatim_question_id = NULL
    WHERE dbe_verbatim_question_id IN (
      SELECT id FROM dbe_verbatim_questions
      WHERE subject = ${SUBJECT} AND paper_number = ${PAPER}
        ${yearArg ? sql`AND year = ${yearArg}` : sql``}
    )
  `);
  const delQ = await db.execute(sql`
    DELETE FROM dbe_verbatim_questions
    WHERE subject = ${SUBJECT} AND paper_number = ${PAPER}
      ${yearArg ? sql`AND year = ${yearArg}` : sql``}
  `);
  const delL = await db.execute(sql`
    DELETE FROM dbe_ingestion_log
    WHERE subject = ${SUBJECT} AND paper_number = ${PAPER}
      ${yearArg ? sql`AND year = ${yearArg}` : sql``}
  `);
  console.log(`[reingest] cleared existing P${PAPER} rows (verbatim=${delQ.rowCount ?? "?"}, log=${delL.rowCount ?? "?"})`);

  const summary = await runIngestionBatch(p2Catalog, { subject: SUBJECT });
  console.log(
    `[reingest] done: ${summary.completed} ok / ${summary.failed} failed / ${summary.skipped} skipped`,
  );
  if (summary.errors?.length) {
    for (const e of summary.errors) console.log("  error:", e);
  }

  try {
    await rebuildMasteryFromExisting(SUBJECT);
  } catch (e: any) {
    console.log("  mastery rebuild failed:", e?.message);
  }

  const rel = await releaseEligiblePapers(SUBJECT);
  const p2rel = rel.filter((r) => r.paperNumber === PAPER);
  console.log("[reingest] release gate P2 results:");
  for (const r of p2rel.sort((a, b) => a.year - b.year || a.language.localeCompare(b.language))) {
    console.log(
      `  ${r.year} ${r.language}: rows=${r.rowCount} memo=${r.memoCoverage}% mark=${r.markCoverage}% released=${r.released}`,
    );
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[reingest] FATAL", err);
  process.exit(1);
});
