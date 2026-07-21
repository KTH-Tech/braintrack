/**
 * Apply the per-question quality release across the whole bank.
 *
 * Additive: releases questions that stand on their own merit (clean parse,
 * quality_score >= QUESTION_QUALITY_MIN, real memo attached) even where their
 * paper as a whole fell short of the memo-coverage gate. Nothing already live
 * is withdrawn.
 */
import { releaseHighQualityQuestions, QUESTION_QUALITY_MIN } from "../server/release-gate";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

async function snapshot() {
  const r = await db.execute(sql`
    SELECT COUNT(*) FILTER (WHERE released_at IS NOT NULL) AS released,
           COUNT(*) AS total
    FROM dbe_verbatim_questions
  `);
  return (r as any).rows[0];
}

async function subjectsAtFiveYears() {
  const r = await db.execute(sql`
    SELECT COUNT(*) FILTER (WHERE n >= 5) AS s5
    FROM (
      SELECT subject, COUNT(DISTINCT year) AS n
      FROM dbe_verbatim_questions
      WHERE released_at IS NOT NULL
      GROUP BY subject
    ) t
  `);
  return (r as any).rows[0].s5;
}

async function main() {
  const before = await snapshot();
  const before5 = await subjectsAtFiveYears();
  log(`BEFORE: ${before.released}/${before.total} released · ${before5} subjects at 5+ years`);
  log(`Releasing questions scoring >= ${QUESTION_QUALITY_MIN} with a clean parse and a memo...`);

  const added = await releaseHighQualityQuestions();

  const after = await snapshot();
  const after5 = await subjectsAtFiveYears();
  log(`AFTER:  ${after.released}/${after.total} released · ${after5} subjects at 5+ years`);
  log(`GAINED: ${added} questions, ${Number(after5) - Number(before5)} more subjects at the 5-year minimum`);
  process.exit(0);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
