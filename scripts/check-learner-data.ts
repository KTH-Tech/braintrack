/** Read-only: how much learner-facing content actually exists, and does it
 *  clear the quality bars the serving layer now enforces? Queries whatever
 *  DATABASE_URL points at (local preview here). No writes. */
import pg from "pg";
import { readFileSync } from "node:fs";

// Load DATABASE_URL from .env without extra deps.
let url = process.env.DATABASE_URL;
if (!url) {
  try {
    const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
    url = env.split(/\r?\n/).find((l) => l.startsWith("DATABASE_URL="))?.split("=").slice(1).join("=").trim();
  } catch {}
}
if (!url) { console.error("No DATABASE_URL"); process.exit(1); }

const c = new pg.Client({ connectionString: url });
await c.connect();

async function q(label: string, sql: string) {
  try {
    const r = await c.query(sql);
    console.log(`\n=== ${label} ===`);
    console.table(r.rows);
  } catch (e: any) {
    console.log(`\n=== ${label} === ERROR: ${e.message}`);
  }
}

await q("simulated questions — total + score buckets", `
  SELECT COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE COALESCE(quality_score,0) >= 92)::int AS ge92,
    COUNT(*) FILTER (WHERE COALESCE(quality_score,0) >= 60)::int AS ge60,
    COUNT(*) FILTER (WHERE COALESCE(quality_score,0) = 0)::int AS zero,
    COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(trim(memo_text)) >= 20)::int AS has_memo
  FROM dbe_simulated_questions`);

await q("simulated — per subject (top 15 by count)", `
  SELECT subject, COUNT(*)::int AS n,
    COUNT(*) FILTER (WHERE COALESCE(quality_score,0) >= 92)::int AS ge92,
    ROUND(AVG(COALESCE(quality_score,0)))::int AS avg_score
  FROM dbe_simulated_questions GROUP BY subject ORDER BY n DESC LIMIT 15`);

await q("verbatim RELEASED (what learners had before)", `
  SELECT COUNT(*)::int AS released_total,
    COUNT(DISTINCT subject)::int AS subjects
  FROM dbe_verbatim_questions WHERE released_at IS NOT NULL`);

await q("flashcards + daily challenge + tips", `
  SELECT
    (SELECT COUNT(*) FROM flashcards)::int AS flashcards,
    (SELECT COUNT(*) FROM subject_daily_challenges)::int AS daily_rows,
    (SELECT COALESCE(SUM(total_questions),0) FROM subject_daily_challenges)::int AS daily_questions,
    (SELECT COUNT(*) FROM subject_study_tips)::int AS tips`);

await c.end();
