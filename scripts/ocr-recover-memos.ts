/**
 * OCR-driven memo recovery — Task #384.
 *
 * Re-ingests every (subject, year) tuple that the triage report flags as
 * MEMO_PDF_EXTRACTION_FAILED — i.e. rows where `source_memo_url` is set
 * but `memo_text` is NULL/empty. These are the papers whose memo PDFs are
 * scanned images that `pdf-parse` cannot read; the OCR fallback in
 * `server/dbe-ingestion.ts:fetchAndParsePDF` (gated by ENABLE_OCR_FALLBACK)
 * routes them through OpenAI vision to recover the text.
 *
 * This script is intentionally narrower than `reingest-priority-missing-memos.ts`:
 *   - it ONLY picks tuples with at least one row that has a memo URL but
 *     no usable memo_text (so we don't re-OCR papers that are already fine
 *     or that never had a memo URL to begin with — those need follow-up
 *     #385 to re-scrape the catalog),
 *   - it auto-enables ENABLE_OCR_FALLBACK=1,
 *   - it records before/after coverage to /tmp/ocr-recover-state.json so
 *     the run is resumable across restarts.
 *
 * Run:    npx tsx scripts/ocr-recover-memos.ts
 * Tail:   tail -f /tmp/ocr-recover.log
 *
 * Verify with the SQL from the task description:
 *   SELECT count(*) FROM dbe_verbatim_questions
 *    WHERE memo_text IS NULL OR length(trim(memo_text)) < 10;
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { existsSync, readFileSync, writeFileSync } from "fs";

// Must be set BEFORE importing dbe-ingestion so fetchAndParsePDF sees it.
if (process.env.ENABLE_OCR_FALLBACK === undefined) {
  process.env.ENABLE_OCR_FALLBACK = "1";
}

import { runIngestionBatch, rebuildMasteryFromExisting } from "../server/dbe-ingestion";
import catalogJson from "../server/data/dbe-papers-catalog.json";

const STATE_PATH = "/tmp/ocr-recover-state.json";

interface TupleResult {
  key: string;
  subject: string;
  year: number;
  durationSec: number;
  completed: number;
  failed: number;
  skipped: number;
  missingBefore: number;
  missingAfter: number;
  totalBefore: number;
  totalAfter: number;
  coverageBeforePct: number;
  coverageAfterPct: number;
  recovered: number;
  error?: string;
}

interface State {
  done: string[];
  failed: string[];
  results: TupleResult[];
  startedAt: string;
}

function loadState(): State {
  if (existsSync(STATE_PATH)) {
    try {
      const parsed = JSON.parse(readFileSync(STATE_PATH, "utf8"));
      return {
        done: Array.isArray(parsed.done) ? parsed.done : [],
        failed: Array.isArray(parsed.failed) ? parsed.failed : [],
        results: Array.isArray(parsed.results) ? parsed.results : [],
        startedAt: parsed.startedAt ?? new Date().toISOString(),
      };
    } catch {
      // fall through
    }
  }
  return { done: [], failed: [], results: [], startedAt: new Date().toISOString() };
}

function saveState(s: State) {
  writeFileSync(STATE_PATH, JSON.stringify(s, null, 2), "utf8");
}

const log = (...args: any[]) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}]`, ...args);
};

async function main() {
  log(`OCR fallback ${process.env.ENABLE_OCR_FALLBACK === "1" ? "ENABLED" : "DISABLED"}`);

  // Limit knobs (handy when running interactively)
  const MAX_TUPLES = Number(process.env.OCR_MAX_TUPLES ?? 0); // 0 = no cap
  const SUBJECT_FILTER = process.env.OCR_SUBJECT?.trim() || null;

  // ── Build work set: (subject, year) tuples with at least one memo-less
  //    row that DOES have a memo URL (i.e. an OCR-recoverable paper). ────
  const groups = await db.execute(sql`
    SELECT subject, year,
           COUNT(*)::int                                                              AS total,
           COUNT(*) FILTER (WHERE memo_text IS NULL OR length(trim(memo_text)) < 10)::int AS missing,
           COUNT(*) FILTER (
             WHERE (memo_text IS NULL OR length(trim(memo_text)) < 10)
               AND source_memo_url IS NOT NULL
               AND source_memo_url <> ''
           )::int                                                                     AS recoverable
    FROM dbe_verbatim_questions
    GROUP BY 1, 2
    HAVING COUNT(*) FILTER (
             WHERE (memo_text IS NULL OR length(trim(memo_text)) < 10)
               AND source_memo_url IS NOT NULL
               AND source_memo_url <> ''
           ) > 0
    ORDER BY recoverable DESC
  `);

  let tuples = (groups.rows as any[]).map((r) => ({
    subject: String(r.subject),
    year: Number(r.year),
    total: Number(r.total),
    missing: Number(r.missing),
    recoverable: Number(r.recoverable),
  }));

  if (SUBJECT_FILTER) {
    tuples = tuples.filter((t) => t.subject.toLowerCase() === SUBJECT_FILTER.toLowerCase());
  }
  if (MAX_TUPLES > 0) tuples = tuples.slice(0, MAX_TUPLES);

  log(
    `Found ${tuples.length} (subject, year) tuples with OCR-recoverable memos · ` +
      `${tuples.reduce((a, t) => a + t.recoverable, 0)} candidate questions`,
  );

  const state = loadState();
  // Re-queue previously failed tuples for retry on this pass.
  const requeued = state.failed.filter((k) => !state.done.includes(k));
  if (requeued.length > 0) {
    log(`Re-queueing ${requeued.length} previously failed tuples for retry`);
    state.failed = [];
    saveState(state);
  }
  const remaining = tuples.filter((t) => !state.done.includes(`${t.subject}|${t.year}`));
  log(`Resuming: ${state.done.length} already done · ${remaining.length} remaining`);

  const catalog = catalogJson as any[];
  let i = 0;
  for (const t of remaining) {
    i++;
    const key = `${t.subject}|${t.year}`;
    const t0 = Date.now();

    // Capture before-state
    const before = await db.execute(sql`
      SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE memo_text IS NULL OR length(trim(memo_text)) < 10)::int AS missing
      FROM dbe_verbatim_questions
      WHERE subject = ${t.subject} AND year = ${t.year}
    `);
    const bRow = before.rows[0] as any;
    const bTotal = Number(bRow?.total ?? 0);
    const bMissing = Number(bRow?.missing ?? 0);
    const bCoverage = bTotal > 0 ? Math.round(((bTotal - bMissing) / bTotal) * 100) : 0;

    let succeeded = false;
    let summary = { completed: 0, failed: 0, skipped: 0 } as any;
    let errorMsg: string | undefined;

    try {
      log(
        `▶ [${i}/${remaining.length}] ${t.subject} ${t.year} — ` +
          `${t.recoverable} OCR-recoverable rows (memo coverage before: ${bCoverage}%)`,
      );
      summary = await runIngestionBatch(catalog, {
        subject: t.subject,
        year: t.year,
        force: true,
      });
      log(
        `✔ ${t.subject} ${t.year}: ${summary.completed} ok / ${summary.failed} failed / ${summary.skipped} skipped (${(
          (Date.now() - t0) / 1000
        ).toFixed(1)}s)`,
      );
      succeeded = true;
    } catch (err: any) {
      errorMsg = err?.message ?? String(err);
      log(`✖ ${t.subject} ${t.year}: FAILED ${errorMsg}`);
    }

    // After-state (always)
    const after = await db.execute(sql`
      SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE memo_text IS NULL OR length(trim(memo_text)) < 10)::int AS missing
      FROM dbe_verbatim_questions
      WHERE subject = ${t.subject} AND year = ${t.year}
    `);
    const aRow = after.rows[0] as any;
    const aTotal = Number(aRow?.total ?? 0);
    const aMissing = Number(aRow?.missing ?? 0);
    const aCoverage = aTotal > 0 ? Math.round(((aTotal - aMissing) / aTotal) * 100) : 0;
    const recovered = Math.max(0, bMissing - aMissing);
    log(
      `  ↳ memo coverage now ${aCoverage}% (${aTotal - aMissing}/${aTotal}) · recovered ${recovered} rows`,
    );

    if (succeeded) {
      try {
        await rebuildMasteryFromExisting(t.subject);
      } catch (e: any) {
        log(`  mastery rebuild failed: ${e?.message}`);
      }
    }

    state.results.push({
      key,
      subject: t.subject,
      year: t.year,
      durationSec: Number(((Date.now() - t0) / 1000).toFixed(1)),
      completed: summary.completed ?? 0,
      failed: summary.failed ?? 0,
      skipped: summary.skipped ?? 0,
      missingBefore: bMissing,
      missingAfter: aMissing,
      totalBefore: bTotal,
      totalAfter: aTotal,
      coverageBeforePct: bCoverage,
      coverageAfterPct: aCoverage,
      recovered,
      error: errorMsg,
    });

    if (succeeded) {
      state.done.push(key);
    } else if (!state.failed.includes(key)) {
      state.failed.push(key);
    }
    saveState(state);
  }

  const totalRecovered = state.results.reduce((a, r) => a + r.recovered, 0);
  log(
    `DONE — processed ${remaining.length} tuples · ${state.done.length} cumulative success · ` +
      `${state.failed.length} pending retry · ${totalRecovered} memo rows recovered overall`,
  );
  process.exit(0);
}

main().catch((err) => {
  log("FATAL", err);
  process.exit(1);
});
