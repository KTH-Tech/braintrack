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
  const flush = async () => {
    if (!batch.length) return;
    for (const row of batch) {
      const entries = Object.entries(row).filter(([k]) => k !== "id");
      const cols = entries.map(([k]) => `"${k}"`).join(",");
      const vals = entries.map((_, i) => `$${i + 1}`).join(",");
      const params = entries.map(([, v]) =>
        v !== null && typeof v === "object" ? JSON.stringify(v) : v,
      );
      const conflict = hasHash ? " ON CONFLICT (content_hash) DO NOTHING" : " ON CONFLICT DO NOTHING";
      try {
        await c.query(`INSERT INTO ${table} (${cols}) VALUES (${vals})${conflict}`, params);
        total++;
      } catch (e) {
        console.error(`[import] ${table} row failed: ${e.message?.slice(0, 120)}`);
      }
    }
    batch = [];
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
