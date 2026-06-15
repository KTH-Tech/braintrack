// Task #394 — Production Hardening: dev-vs-prod row-count report.
//
// Usage:
//   DEV_DATABASE_URL=<dev-url> PROD_DATABASE_URL=<prod-url> \
//     npx tsx scripts/dev-prod-row-counts.ts
//
// Compares row counts on the key tables between the two databases so an
// admin can see at a glance what the next dev → prod sync needs to push.
// Read-only; never mutates either database.

import pg from "pg";
const { Pool } = pg;

const TABLES = [
  "users",
  "subjects",
  "topics",
  "exam_papers",
  "questions",
  "dbe_verbatim_questions",
  "dbe_simulated_questions",
  "dbe_ingestion_log",
  "dbe_topic_coverage",
  "dbe_topic_frequency",
  "subject_quizzes",
  "subject_daily_challenges",
  "flashcards",
  "topic_audio_lessons",
];

// Per-tuple counts for dbe_verbatim_questions so we can show
// ingested / validated / released by environment.
const VERBATIM_AGG_SQL = `
  SELECT
    COUNT(DISTINCT (subject, year, paper_number, session, language))::int AS ingested,
    COUNT(DISTINCT (subject, year, paper_number, session, language)) FILTER (
      WHERE released_at IS NOT NULL
    )::int AS released
  FROM dbe_verbatim_questions
`;

async function readCounts(label: string, url: string | undefined) {
  if (!url) {
    console.error(`[${label}] DATABASE_URL not provided — skipping.`);
    return null;
  }
  const pool = new Pool({ connectionString: url });
  try {
    const counts: Record<string, number> = {};
    for (const t of TABLES) {
      try {
        const r = await pool.query(`SELECT COUNT(*)::int AS c FROM ${t}`);
        counts[t] = Number(r.rows[0]?.c ?? 0);
      } catch (err: any) {
        counts[t] = -1; // table missing on this side
      }
    }
    let verbatim = { ingested: 0, released: 0 };
    try {
      const r = await pool.query(VERBATIM_AGG_SQL);
      verbatim = {
        ingested: Number(r.rows[0]?.ingested ?? 0),
        released: Number(r.rows[0]?.released ?? 0),
      };
    } catch { /* released_at may not exist yet on prod */ }
    return { counts, verbatim };
  } finally {
    await pool.end();
  }
}

(async () => {
  const dev = await readCounts("dev", process.env.DEV_DATABASE_URL ?? process.env.DATABASE_URL);
  const prod = await readCounts("prod", process.env.PROD_DATABASE_URL);

  if (!dev || !prod) {
    console.error("Both DEV_DATABASE_URL and PROD_DATABASE_URL must be set.");
    process.exit(1);
  }

  const pad = (s: string, n: number) => s.padEnd(n, " ");
  const num = (n: number) =>
    n < 0 ? "  (missing)".padStart(12, " ") : n.toLocaleString().padStart(12, " ");

  console.log("");
  console.log(pad("table", 32) + "         dev" + "         prod" + "      delta");
  console.log("─".repeat(72));
  for (const t of TABLES) {
    const d = dev.counts[t] ?? 0;
    const p = prod.counts[t] ?? 0;
    const delta = d >= 0 && p >= 0 ? d - p : NaN;
    const deltaStr = isNaN(delta) ? "    n/a".padStart(10) : (delta >= 0 ? `+${delta}` : String(delta)).padStart(10);
    console.log(pad(t, 32) + num(d) + num(p) + deltaStr);
  }
  console.log("─".repeat(72));
  console.log("dbe_verbatim_questions tuples (subject,year,paper,session,lang):");
  console.log(`  dev   ingested=${dev.verbatim.ingested}  released=${dev.verbatim.released}`);
  console.log(`  prod  ingested=${prod.verbatim.ingested}  released=${prod.verbatim.released}`);
  console.log("");
})().catch((err) => {
  console.error("dev-prod-row-counts failed:", err);
  process.exit(1);
});
