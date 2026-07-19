// Import JSON-lines content export into a target DB (idempotent upsert on
// content_hash where present, plain insert elsewhere). Batches of 200.
// Usage: DATABASE_URL=<target> node scripts/content-import.mjs <export-dir>
import pg from "pg";
import fs from "fs";
import path from "path";
import readline from "readline";

const dir = process.argv[2] ?? "./content-export";
const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL === "1" ? { rejectUnauthorized: false } : undefined });
await c.connect();

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jsonl"));
for (const file of files) {
  const table = path.basename(file, ".jsonl");
  const exists = await c.query(
    "SELECT 1 FROM information_schema.tables WHERE table_name = $1",
    [table],
  );
  if (!exists.rows.length) { console.log(`[import] ${table}: table absent in target, skipped`); continue; }

  const hasHash = (await c.query(
    "SELECT 1 FROM information_schema.columns WHERE table_name=$1 AND column_name='content_hash'",
    [table],
  )).rows.length > 0;

  const rl = readline.createInterface({ input: fs.createReadStream(path.join(dir, file)) });
  let batch = [];
  let total = 0;
  // One multi-row INSERT per batch. Row-at-a-time costs a full round trip per
  // row, which over SSL to a remote region turns a 35k-row load into hours.
  // Bare DO NOTHING covers whichever unique constraint the table actually has;
  // the column-specific form errors on tables without that exact index.
  const norm = (v) => (v !== null && typeof v === "object" && !(v instanceof Date) ? JSON.stringify(v) : v);
  const flush = async () => {
    if (!batch.length) return;
    const rows = batch;
    batch = [];
    const keys = Object.keys(rows[0]).filter((k) => k !== "id");
    const cols = keys.map((k) => `"${k}"`).join(",");
    const params = [];
    const tuples = rows.map((row) => {
      const ph = keys.map((k) => { params.push(norm(row[k] ?? null)); return `$${params.length}`; });
      return `(${ph.join(",")})`;
    });
    try {
      await c.query(`INSERT INTO ${table} (${cols}) VALUES ${tuples.join(",")} ON CONFLICT DO NOTHING`, params);
      total += rows.length;
    } catch (e) {
      // Fall back to row-at-a-time so one bad row can't drop the whole batch.
      for (const row of rows) {
        const rp = keys.map((k) => norm(row[k] ?? null));
        const ph = keys.map((_, i) => `$${i + 1}`).join(",");
        try {
          await c.query(`INSERT INTO ${table} (${cols}) VALUES (${ph}) ON CONFLICT DO NOTHING`, rp);
          total++;
        } catch (err) {
          console.error(`[import] ${table} row failed: ${err.message?.slice(0, 120)}`);
        }
      }
    }
  };
  for await (const line of rl) {
    if (!line.trim()) continue;
    batch.push(JSON.parse(line));
    if (batch.length >= 200) await flush();
  }
  await flush();
  console.log(`[import] ${table}: ${total} rows imported`);
}
await c.end();
console.log("[import] done");
