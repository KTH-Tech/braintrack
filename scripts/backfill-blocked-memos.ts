/**
 * Data-driven memo backfill for every paper still blocked by the release gate.
 *
 * Unlike scripts/reingest-priority-missing-memos.ts, which targets a hardcoded
 * list from closed tasks, this reads the CURRENT blocked set straight out of
 * the database and works it in descending order of learner impact, so the
 * biggest wins land first and the run stays useful even if it is interrupted.
 *
 * A tuple is blocked when fewer than MEMO_THRESHOLD_RATIO of its rows carry a
 * memo of >= 20 characters — the exact predicate the gate uses. Re-ingesting
 * with force:true re-fetches the memo PDFs through the current parser (plus
 * OCR fallback for scanned memos), which is the only thing that can move a
 * tuple across the line. Re-running the gate alone never will.
 *
 * The gate runs per subject immediately after that subject re-ingests, so
 * content reaches learners progressively rather than only at the very end.
 *
 * Run:  npx tsx scripts/backfill-blocked-memos.ts [--limit N] [--dry]
 */
if (process.env.ENABLE_OCR_FALLBACK === undefined) {
  process.env.ENABLE_OCR_FALLBACK = "1";
}

import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { runIngestionBatch } from "../server/dbe-ingestion";
import { releaseEligiblePapers } from "../server/release-gate";
import catalogJson from "../server/data/dbe-papers-catalog.json";
import { existsSync, readFileSync, writeFileSync } from "fs";

const STATE_FILE = "C:/dev/_backfill-memos-state.json";
const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const limitArg = args.indexOf("--limit");
const LIMIT = limitArg >= 0 ? Number(args[limitArg + 1]) : Infinity;

type Done = { done: string[] };
function loadState(): Done {
  if (existsSync(STATE_FILE)) {
    try {
      return JSON.parse(readFileSync(STATE_FILE, "utf8"));
    } catch {
      /* corrupt state is not worth aborting a multi-hour run over */
    }
  }
  return { done: [] };
}
function saveState(s: Done) {
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

async function main() {
  // Group to (subject, year) because that is the unit runIngestionBatch takes,
  // even though the gate itself evaluates the finer (paper, session, language).
  const blocked = await db.execute(sql`
    WITH t AS (
      SELECT subject, year, paper_number, session, language,
             COUNT(*)::int AS rows,
             COUNT(*) FILTER (
               WHERE memo_text IS NOT NULL AND length(memo_text) >= 20
             )::int AS memo_ok,
             BOOL_OR(released_at IS NOT NULL) AS released
      FROM dbe_verbatim_questions
      GROUP BY 1,2,3,4,5
    )
    SELECT subject, year,
           SUM(rows)::int AS blocked_rows,
           COUNT(*)::int  AS blocked_tuples
    FROM t
    WHERE NOT released
      AND memo_ok::float / rows < 0.60
    GROUP BY subject, year
    ORDER BY SUM(rows) DESC
  `);

  const targets = (blocked as any).rows as Array<{
    subject: string; year: number; blocked_rows: number; blocked_tuples: number;
  }>;

  const totalRows = targets.reduce((n, t) => n + Number(t.blocked_rows), 0);
  log(`${targets.length} (subject, year) targets — ${totalRows} blocked rows`);
  log("Top 15 by impact:");
  targets.slice(0, 15).forEach((t) =>
    log(`   ${t.subject} ${t.year}: ${t.blocked_rows} rows / ${t.blocked_tuples} tuples`)
  );

  if (DRY) {
    log("--dry: stopping before ingestion.");
    process.exit(0);
  }

  const state = loadState();
  const catalog = (catalogJson as any).papers ?? catalogJson;
  let processed = 0;

  for (const t of targets) {
    if (processed >= LIMIT) {
      log(`Reached --limit ${LIMIT}; stopping.`);
      break;
    }
    const key = `${t.subject}::${t.year}`;
    if (state.done.includes(key)) continue;

    log(`→ ${t.subject} ${t.year} (${t.blocked_rows} rows)`);
    try {
      const summary = await runIngestionBatch(catalog as any, {
        subject: t.subject,
        year: t.year,
        force: true,
      });
      log(`   ingest: ${summary.completed} ok, ${summary.failed} failed, ${summary.skipped} skipped`);

      // Publish this subject's newly-eligible tuples right away.
      const results = await releaseEligiblePapers(t.subject);
      const rel = results.filter((r) => r.released).length;
      log(`   gate: ${rel}/${results.length} tuples now released`);
    } catch (err: any) {
      log(`   ! failed: ${err?.message ?? err}`);
    }

    state.done.push(key);
    saveState(state);
    processed++;
  }

  const after = await db.execute(sql`
    SELECT COUNT(*) FILTER (WHERE released_at IS NOT NULL) AS released,
           COUNT(*) AS total
    FROM dbe_verbatim_questions
  `);
  const a = (after as any).rows[0];
  log(`FINAL: ${a.released}/${a.total} released`);
  process.exit(0);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
