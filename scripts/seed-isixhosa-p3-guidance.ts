/**
 * Seed stand-in creative writing guidance for isiXhosa Home Language Paper 3.
 *
 * isiXhosa HL P3 is a creative writing task — DBE does not publish a separate
 * memo PDF for this paper. The marking rubric is applied by examiners using
 * criteria from the official isiXhosa Home Language Subject Assessment
 * Guidelines (SAG).
 *
 * This script:
 *   1. Finds all `dbe_verbatim_questions` rows where subject = 'isiXhosa Home Language'
 *      AND paper_number = 3 AND (memo_text IS NULL OR length(trim(memo_text)) < 10).
 *   2. Updates those rows' memo_text with the creative writing guidance text
 *      (language-aware: 'af' rows get the Afrikaans guidance, everything else
 *      gets English).
 *   3. Updates `exam_papers` rows for isiXhosa HL P3 where memo_url is empty
 *      to set memo_url = 'guidance://isixhosa-p3-creative-writing'.
 *
 * Safe to re-run — only touches rows whose memo_text is currently empty/null.
 * To re-apply the guidance even to rows that already have it, pass --force.
 *
 * Run:
 *   npx tsx scripts/seed-isixhosa-p3-guidance.ts
 *   npx tsx scripts/seed-isixhosa-p3-guidance.ts --force
 */

import { db } from "../server/db";
import { sql } from "drizzle-orm";
import {
  ISIXHOSA_P3_GUIDANCE_EN,
  ISIXHOSA_P3_GUIDANCE_AF,
  CREATIVE_WRITING_GUIDANCE_MARKER,
} from "../server/data/isixhosa-p3-guidance";

const SUBJECT = "isiXhosa Home Language";
const PAPER_NUMBER = 3;
const GUIDANCE_URL = "guidance://isixhosa-p3-creative-writing";

const force = process.argv.includes("--force");
const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

async function main() {
  log("isiXhosa HL P3 creative writing guidance seeder starting…");
  log(`force=${force}`);

  // ── 1. Backfill dbe_verbatim_questions ──────────────────────────────────
  const whereClause = force
    ? sql`subject = ${SUBJECT} AND paper_number = ${PAPER_NUMBER}`
    : sql`subject = ${SUBJECT} AND paper_number = ${PAPER_NUMBER} AND (memo_text IS NULL OR length(trim(memo_text)) < 10)`;

  const candidates = await db.execute(
    sql`SELECT id, language FROM dbe_verbatim_questions WHERE ${whereClause}`,
  );

  log(`Found ${candidates.rows.length} isiXhosa HL P3 verbatim rows to update.`);

  let updatedVerbatim = 0;
  for (const row of candidates.rows as { id: number; language: string }[]) {
    const guidance =
      row.language === "af" ? ISIXHOSA_P3_GUIDANCE_AF : ISIXHOSA_P3_GUIDANCE_EN;
    await db.execute(
      sql`UPDATE dbe_verbatim_questions SET memo_text = ${guidance} WHERE id = ${row.id}`,
    );
    updatedVerbatim++;
  }
  log(`Updated ${updatedVerbatim} dbe_verbatim_questions rows.`);

  // ── 2. Stamp exam_papers rows ────────────────────────────────────────────
  const subjectRow = await db.execute(
    sql`SELECT id FROM subjects WHERE name = ${SUBJECT} LIMIT 1`,
  );
  if ((subjectRow.rows as any[]).length === 0) {
    log(`WARN: '${SUBJECT}' subject not found in subjects table — skipping exam_papers update.`);
  } else {
    const subjectId = (subjectRow.rows as any[])[0].id as number;

    const epWhere = force
      ? sql`subject_id = ${subjectId} AND paper_number = ${PAPER_NUMBER}`
      : sql`subject_id = ${subjectId} AND paper_number = ${PAPER_NUMBER} AND (memo_url IS NULL OR memo_url = '')`;

    await db.execute(
      sql`UPDATE exam_papers SET memo_url = ${GUIDANCE_URL} WHERE ${epWhere}`,
    );
    log(`Updated exam_papers rows for isiXhosa HL P3.`);
  }

  // ── 3. Summary ───────────────────────────────────────────────────────────
  const markerPrefix = CREATIVE_WRITING_GUIDANCE_MARKER + "%";
  const coverageCheck = await db.execute(sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(trim(memo_text)) >= 10)::int AS with_memo,
      COUNT(*) FILTER (WHERE memo_text LIKE ${markerPrefix})::int AS with_guidance
    FROM dbe_verbatim_questions
    WHERE subject = ${SUBJECT} AND paper_number = ${PAPER_NUMBER}
  `);
  const c = (coverageCheck.rows as any[])[0];
  log(
    `isiXhosa HL P3 coverage: total=${c.total}  with_memo=${c.with_memo}  with_guidance=${c.with_guidance}`,
  );

  const epCheck = await db.execute(sql`
    SELECT COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE memo_url = ${GUIDANCE_URL})::int AS with_guidance
    FROM exam_papers ep
    JOIN subjects s ON s.id = ep.subject_id
    WHERE s.name = ${SUBJECT} AND ep.paper_number = ${PAPER_NUMBER}
  `);
  const e = (epCheck.rows as any[])[0];
  log(`exam_papers isiXhosa HL P3: total=${e.total}  with_guidance=${e.with_guidance}`);

  log("Done.");
  log("");
  log("Next step — run the release gate to make these rows visible to learners:");
  log(`  npx tsx -e "import { releaseEligiblePapers } from './server/release-gate'; releaseEligiblePapers('${SUBJECT}').then(r => { console.log(JSON.stringify(r.filter(x => x.paperNumber === ${PAPER_NUMBER}), null, 2)); process.exit(0); })"`);

  process.exit(0);
}

main().catch((err) => {
  log("FATAL", err);
  process.exit(1);
});
