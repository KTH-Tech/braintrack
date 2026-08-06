/**
 * scripts/withdraw-garbled.cjs — pull all OCR-"garbled" verbatim questions out
 * of circulation by clearing their released_at, so they can never be served to
 * a learner (quiz/exam) on any build.
 *
 * "garbled" = dbe_verbatim_questions.accuracy_flag = 'garbled' (OCR quality
 * score < 45 — mostly symbols/nonsense). These should never reach a learner.
 *
 * USAGE (from repo root, prod DB env sourced):
 *   set -a; source /c/dev/bt-prod-db.env; set +a
 *   node scripts/withdraw-garbled.cjs           # dry run — shows the count
 *   node scripts/withdraw-garbled.cjs --apply    # actually un-releases them
 *
 * Idempotent + non-destructive: it only NULLs released_at (the rows and their
 * text stay in the table for admin review / re-OCR), never deletes. Re-runnable.
 */
const { Client } = require("pg");
const APPLY = process.argv.includes("--apply");
let url = process.env.PGURL_EXTERNAL || process.env.DATABASE_URL || "";
if (url && !/sslmode=/.test(url)) url += (url.includes("?") ? "&" : "?") + "sslmode=no-verify";

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await c.connect();
    const before = await c.query(
      "SELECT count(*)::int n FROM dbe_verbatim_questions WHERE accuracy_flag='garbled' AND released_at IS NOT NULL"
    );
    const n = before.rows[0].n;
    console.log((APPLY ? "[APPLY] " : "[DRY RUN] ") + n + " garbled+released questions.");
    if (!APPLY) {
      console.log("Re-run with --apply to un-release them (clears released_at; rows kept for review).");
      return;
    }
    const r = await c.query(
      "UPDATE dbe_verbatim_questions SET released_at = NULL, updated_at = now() " +
      "WHERE accuracy_flag='garbled' AND released_at IS NOT NULL RETURNING id"
    );
    console.log("WITHDRAWN " + (r.rows ? r.rows.length : 0) + " garbled questions (released_at cleared).");
    const after = await c.query(
      "SELECT count(*)::int n FROM dbe_verbatim_questions WHERE accuracy_flag='garbled' AND released_at IS NOT NULL"
    );
    console.log("garbled+released remaining: " + after.rows[0].n + " (should be 0).");
  } catch (e) { console.error("FAILED:", e.message); process.exit(1); }
  finally { await c.end().catch(() => {}); }
})();
