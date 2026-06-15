/**
 * Seed stand-in PAT marking guidance for Design Paper 2 entries.
 *
 * Design P2 is a Practical Assessment Task (PAT) — a portfolio-based
 * submission assessed by an embedded rubric. DBE has never published a
 * separate memo PDF for any year or language (confirmed in Task #389/#477).
 *
 * This script:
 *   1. Finds all `dbe_verbatim_questions` rows where subject = 'Design' AND
 *      paper_number = 2 AND (memo_text IS NULL OR length(trim(memo_text)) < 10).
 *   2. Updates those rows' memo_text with the PAT guidance text (language-aware:
 *      'af' rows get the Afrikaans guidance, everything else gets English).
 *   3. Updates `exam_papers` rows for Design P2 where memo_url is empty to set
 *      memo_url = 'guidance://design-pat' so the seeder knows guidance is attached.
 *
 * Safe to re-run — only touches rows whose memo_text is currently empty/null.
 * To re-apply the guidance even to rows that already have it, pass --force.
 *
 * Run:
 *   npx tsx scripts/seed-design-pat-guidance.ts
 *   npx tsx scripts/seed-design-pat-guidance.ts --force
 */

import { db } from "../server/db";
import { sql } from "drizzle-orm";
import {
  DESIGN_PAT_GUIDANCE_EN,
  DESIGN_PAT_GUIDANCE_AF,
  PAT_GUIDANCE_MARKER,
} from "../server/data/design-pat-guidance";

const force = process.argv.includes("--force");
const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

async function main() {
  log("Design PAT guidance seeder starting…");
  log(`force=${force}`);

  // ── 1. Backfill dbe_verbatim_questions ──────────────────────────────────
  const whereClause = force
    ? sql`subject = 'Design' AND paper_number = 2`
    : sql`subject = 'Design' AND paper_number = 2 AND (memo_text IS NULL OR length(trim(memo_text)) < 10)`;

  const candidates = await db.execute(
    sql`SELECT id, language FROM dbe_verbatim_questions WHERE ${whereClause}`,
  );

  log(`Found ${candidates.rows.length} Design P2 verbatim rows to update.`);

  let updatedVerbatim = 0;
  for (const row of candidates.rows as { id: number; language: string }[]) {
    const guidance =
      row.language === "af" ? DESIGN_PAT_GUIDANCE_AF : DESIGN_PAT_GUIDANCE_EN;
    await db.execute(
      sql`UPDATE dbe_verbatim_questions SET memo_text = ${guidance} WHERE id = ${row.id}`,
    );
    updatedVerbatim++;
  }
  log(`Updated ${updatedVerbatim} dbe_verbatim_questions rows.`);

  // ── 2. Stamp exam_papers rows ────────────────────────────────────────────
  // Find the Design subject id first
  const subjectRow = await db.execute(
    sql`SELECT id FROM subjects WHERE name = 'Design' LIMIT 1`,
  );
  if ((subjectRow.rows as any[]).length === 0) {
    log("WARN: 'Design' subject not found in subjects table — skipping exam_papers update.");
  } else {
    const subjectId = (subjectRow.rows as any[])[0].id as number;

    const epWhere = force
      ? sql`subject_id = ${subjectId} AND paper_number = 2`
      : sql`subject_id = ${subjectId} AND paper_number = 2 AND (memo_url IS NULL OR memo_url = '')`;

    const epResult = await db.execute(
      sql`UPDATE exam_papers SET memo_url = 'guidance://design-pat' WHERE ${epWhere}`,
    );
    log(`Updated exam_papers rows for Design P2.`);
  }

  // ── 3. Summary ───────────────────────────────────────────────────────────
  const markerPrefix = PAT_GUIDANCE_MARKER + "%";
  const coverageCheck = await db.execute(sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(trim(memo_text)) >= 10)::int AS with_memo,
      COUNT(*) FILTER (WHERE memo_text LIKE ${markerPrefix})::int AS with_pat_guidance
    FROM dbe_verbatim_questions
    WHERE subject = 'Design' AND paper_number = 2
  `);
  const c = (coverageCheck.rows as any[])[0];
  log(
    `Design P2 coverage: total=${c.total}  with_memo=${c.with_memo}  with_pat_guidance=${c.with_pat_guidance}`,
  );

  const epCheck = await db.execute(sql`
    SELECT COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE memo_url = 'guidance://design-pat')::int AS with_guidance
    FROM exam_papers ep
    JOIN subjects s ON s.id = ep.subject_id
    WHERE s.name = 'Design' AND ep.paper_number = 2
  `);
  const e = (epCheck.rows as any[])[0];
  log(`exam_papers Design P2: total=${e.total}  with_guidance=${e.with_guidance}`);

  log("Done.");
  process.exit(0);
}

main().catch((err) => {
  log("FATAL", err);
  process.exit(1);
});
