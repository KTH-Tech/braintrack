/**
 * Pre-deploy migration applier — runs in Render's `preDeployCommand`, after
 * the build and BEFORE the new code serves traffic.
 *
 * WHY THIS EXISTS
 * ---------------
 * The runtime has no migration step (start = `node dist/index.cjs`), so schema
 * changes only reach prod if something applies them. shared/schema.ts declares
 * columns (e.g. 13 on `flashcards`) that only exist after migration 0033 runs;
 * deploying that code against a DB without them makes every typed SELECT on
 * that table 500 — the 0034-class regression that already bit this project.
 *
 * SAFETY
 * ------
 * • Only the files in PENDING_IDEMPOTENT run. That list is a hardcoded
 *   allowlist of additive-only, `IF NOT EXISTS`-guarded migrations — this
 *   script can NEVER execute an arbitrary or destructive migration.
 * • Each file runs inside its own transaction. A failure rolls that file back
 *   and exits non-zero, which ABORTS the Render deploy — the old version keeps
 *   serving. A broken migration can never ship a half-migrated DB behind new
 *   code.
 * • Every listed file is re-runnable, so this is a no-op when the migration
 *   was already applied by hand. Running it is always safe.
 *
 * To add a migration here it MUST be additive-only and idempotent. If it is
 * not, it does not belong in an auto-applier — apply it by hand.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

// Hardcoded allowlist — additive-only, IF NOT EXISTS-guarded, transaction-safe
// (no CREATE INDEX CONCURRENTLY). Order matters only in that each is
// independent here.
const PENDING_IDEMPOTENT = [
  "migrations/0033_content_studio_prod_sync.sql",
  "migrations/0035_messaging_infra.sql",
  "migrations/0036_simulated_stimulus_language.sql",
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[predeploy-migrate] DATABASE_URL is not set — aborting deploy.");
    process.exit(1);
  }

  const client = new Client({
    connectionString: url,
    // Match the app's TLS posture for Supabase.
    ...(url.includes(".supabase.") ? { ssl: { rejectUnauthorized: true } } : {}),
  });

  await client.connect();
  console.log(`[predeploy-migrate] connected; applying ${PENDING_IDEMPOTENT.length} idempotent migration(s).`);

  try {
    for (const rel of PENDING_IDEMPOTENT) {
      const sql = readFileSync(join(REPO_ROOT, rel), "utf8");
      const t0 = Date.now();
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("COMMIT");
        console.log(`[predeploy-migrate] ✓ ${rel} (${Date.now() - t0}ms)`);
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        console.error(`[predeploy-migrate] ✗ ${rel} failed — rolled back. Deploy aborted.`);
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    }
    console.log("[predeploy-migrate] all migrations applied. Continuing deploy.");
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error("[predeploy-migrate] fatal:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
