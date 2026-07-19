// Export the DBE content tables to JSON-lines for prod restore.
// Usage: DATABASE_URL=<src> node scripts/content-export.mjs <out-dir>
import pg from "pg";
import fs from "fs";
import path from "path";

const TABLES = [
  "dbe_verbatim_questions",
  "dbe_memo_rubrics",
  "dbe_ingestion_log",
  "examiner_profiles",
  "generated_questions",
  "simulated_paper_bank",
  "learner_paper_allocations",
];

const outDir = process.argv[2] ?? "./content-export";
fs.mkdirSync(outDir, { recursive: true });
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();

for (const table of TABLES) {
  const exists = await c.query(
    "SELECT 1 FROM information_schema.tables WHERE table_name = $1",
    [table],
  );
  if (!exists.rows.length) { console.log(`[export] ${table}: absent, skipped`); continue; }
  const out = fs.createWriteStream(path.join(outDir, `${table}.jsonl`));
  const { rows } = await c.query(`SELECT * FROM ${table}`);
  for (const row of rows) out.write(JSON.stringify(row) + "\n");
  out.end();
  console.log(`[export] ${table}: ${rows.length} rows`);
}
await c.end();
console.log(`[export] done -> ${outDir}`);
