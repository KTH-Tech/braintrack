/**
 * Targeted re-ingestion of papers with missing memo text — Task #369 / #476.
 *
 * Scope:
 *   1. All NSC (November) papers from 2024 + 2025.
 *   2. Top-5 most-affected subjects across every year (2015–2025):
 *        Life Sciences, Electrical Technology, Mechanical Technology,
 *        Physical Sciences, Agricultural Sciences.
 *   3. Task #476 targeted papers — specific (subject, year) tuples that
 *      received new memo URLs in Task #389 and need a forced re-ingestion
 *      to pair the memo text and lift memo_coverage to ≥98 % for the
 *      release gate:
 *        - isiXhosa Second Additional Language 2022 (P1 memo added)
 *        - Afrikaans Home Language 2020 (P1 memo added)
 *        - Engineering Graphics and Design 2022 (P2 Afrikaans memo added)
 *        - Technical Mathematics 2020 (P2 memo added for both languages)
 *        - Technical Mathematics 2021–2025 (Afrikaans memos added)
 *
 * Strategy:
 *   - For each (subject, year) tuple in scope, run `runIngestionBatch` with
 *     `force: true` so the existing rows + log entries are wiped and the
 *     PDFs are re-fetched and re-parsed using the current pdf-parse v2 +
 *     multi-language splitter + AI fallback. This lets memos that previously
 *     failed to extract pick up the new pipeline.
 *   - Tuples that have already been re-processed in this run are recorded
 *     in /tmp/reingest-priority-state.json so the script can resume
 *     after restart without redoing finished work.
 *
 * Run:    npx tsx scripts/reingest-priority-missing-memos.ts
 * Tail:   tail -f /tmp/reingest-priority.log
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { existsSync, readFileSync, writeFileSync } from "fs";

// Auto-enable the OCR fallback for this re-ingestion pass — Task #384.
// Many of the priority papers (Mechanical/Electrical Technology pre-2024,
// isiXhosa Home Language, CAT, etc.) have memo PDFs that are scanned
// images, so plain pdf-parse returns empty text. Setting this BEFORE
// importing dbe-ingestion so the env var is in scope when fetchAndParsePDF
// runs. Override with ENABLE_OCR_FALLBACK=0 if you need to skip OCR.
if (process.env.ENABLE_OCR_FALLBACK === undefined) {
  process.env.ENABLE_OCR_FALLBACK = "1";
}

import { runIngestionBatch, rebuildMasteryFromExisting } from "../server/dbe-ingestion";
import catalogJson from "../server/data/dbe-papers-catalog.json";

const TOP_SUBJECTS = [
  "Life Sciences",
  "Electrical Technology",
  "Mechanical Technology",
  "Physical Sciences",
  "Agricultural Sciences",
];

const PRIORITY_YEARS = [2024, 2025];

/**
 * Task #476 — papers that gained memo URLs in Task #389.
 * These are force-re-ingested regardless of current memo_coverage and the
 * done-state cache so the new memo PDFs are fetched and paired with existing
 * question rows.
 *
 * Sunset gate: once all 9 tuples are verified at ≥98 % memo_coverage and
 * released_at is populated, set TASK_476_BYPASS=0 to disable the bypass
 * and let the normal coverage filter + state cache manage them going forward.
 */
const TASK_476_BYPASS_ENABLED = process.env.TASK_476_BYPASS !== "0";

const TASK_476_PAPERS: Array<{ subject: string; year: number; reason: string }> = [
  { subject: "isiXhosa Second Additional Language", year: 2022, reason: "task476-isiXhosa-SAL-2022-P1-memo" },
  { subject: "Afrikaans Home Language",             year: 2020, reason: "task476-Afrikaans-HL-2020-P1-memo" },
  { subject: "Engineering Graphics and Design",     year: 2022, reason: "task476-EGD-2022-P2-Af-memo" },
  { subject: "Technical Mathematics",               year: 2020, reason: "task476-TechMaths-2020-P2-memo" },
  { subject: "Technical Mathematics",               year: 2021, reason: "task476-TechMaths-2021-Af-memo" },
  { subject: "Technical Mathematics",               year: 2022, reason: "task476-TechMaths-2022-Af-memo" },
  { subject: "Technical Mathematics",               year: 2023, reason: "task476-TechMaths-2023-Af-memo" },
  { subject: "Technical Mathematics",               year: 2024, reason: "task476-TechMaths-2024-Af-memo" },
  { subject: "Technical Mathematics",               year: 2025, reason: "task476-TechMaths-2025-Af-memo" },
];

const STATE_PATH = "/tmp/reingest-priority-state.json";

interface TupleResult {
  key: string;       // "subject|year"
  durationSec: number;
  completed: number;
  failed: number;
  skipped: number;
  memoCoveragePctBefore: number | null;
  memoCoveragePctAfter: number;
  totalAfter: number;
  missingAfter: number;
  error?: string;
}

interface State {
  done: string[];           // tuples that completed without throwing
  failed: string[];         // tuples that threw — auto-retried on next run
  results: TupleResult[];   // per-tuple before/after metrics for verification
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
  const catalog = catalogJson as any[];
  const allCatalogSubjects = new Set<string>(
    catalog.filter((e) => !e.isMemo).map((e) => e.subject as string),
  );

  // Build the work set as { subject, year } tuples.
  const tasks: Array<{ subject: string; year: number; reason: string }> = [];

  // 1) Priority years × every subject in catalog (NSC November sittings)
  for (const year of PRIORITY_YEARS) {
    for (const subject of allCatalogSubjects) {
      const hasNovember = catalog.some(
        (e) => e.subject === subject && e.year === year && e.session === "November" && !e.isMemo,
      );
      if (hasNovember) tasks.push({ subject, year, reason: `${year}-NSC` });
    }
  }

  // 2) Top-5 subjects × all years 2015–2025
  for (const subject of TOP_SUBJECTS) {
    if (!allCatalogSubjects.has(subject)) {
      log(`! Top-5 subject not found in catalog: ${subject}`);
      continue;
    }
    const years = [
      ...new Set(catalog.filter((e) => e.subject === subject && !e.isMemo).map((e) => e.year)),
    ].sort();
    for (const y of years) {
      const dup = tasks.find((t) => t.subject === subject && t.year === y);
      if (dup) dup.reason += "+top5";
      else tasks.push({ subject, year: y as number, reason: "top5" });
    }
  }

  log(`Planned tasks: ${tasks.length} (subject, year) tuples`);

  // Filter out tasks that already have full memo coverage so we don't waste
  // time re-fetching papers that don't need it.
  const memoStats = await db.execute(sql`
    SELECT subject, year,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE memo_text IS NULL OR length(trim(memo_text)) < 10)::int AS missing
    FROM dbe_verbatim_questions
    GROUP BY 1, 2
  `);
  const statsMap = new Map<string, { total: number; missing: number }>();
  for (const r of memoStats.rows as any[]) {
    statsMap.set(`${r.subject}|${r.year}`, { total: Number(r.total), missing: Number(r.missing) });
  }

  // Task #476 targeted papers bypass the coverage filter and done-state cache
  // when TASK_476_BYPASS_ENABLED is true (the default). Set TASK_476_BYPASS=0
  // to disable once all tuples are verified at ≥98 % memo_coverage.
  const task476Keys = TASK_476_BYPASS_ENABLED
    ? new Set(TASK_476_PAPERS.map((p) => `${p.subject}|${p.year}`))
    : new Set<string>();

  if (TASK_476_BYPASS_ENABLED) {
    log(`Task #476 bypass ACTIVE — ${TASK_476_PAPERS.length} tuples will bypass coverage filter and done-state cache (set TASK_476_BYPASS=0 to disable after verification)`);
  }

  const filtered = tasks.filter((t) => {
    if (task476Keys.has(`${t.subject}|${t.year}`)) return true;
    const s = statsMap.get(`${t.subject}|${t.year}`);
    // include if no rows yet (never ingested) OR has any missing memo rows
    return !s || s.missing > 0;
  });

  // Prepend any Task #476 entries that aren't already in the work set
  // (i.e. tuples not covered by the priority-years or top-5 logic).
  if (TASK_476_BYPASS_ENABLED) {
    for (const p of TASK_476_PAPERS) {
      const alreadyInList = filtered.some((t) => t.subject === p.subject && t.year === p.year);
      if (!alreadyInList) {
        filtered.unshift(p);
      }
    }
  }

  const t476Suffix = TASK_476_BYPASS_ENABLED ? ` (incl. ${TASK_476_PAPERS.length} Task #476 targeted papers)` : "";
  log(`After filtering already-complete tuples: ${filtered.length} need re-ingestion${t476Suffix}`);

  const state = loadState();
  // Re-queue any previously failed tuples so they get retried on this pass.
  const requeueFailures = state.failed.filter((k) => !state.done.includes(k));
  if (requeueFailures.length > 0) {
    log(`Re-queueing ${requeueFailures.length} previously failed tuples for retry`);
    state.failed = [];
    saveState(state);
  }
  // Task #476 papers always bypass the done-state cache so they are
  // re-ingested with the newly-added memo URLs even if a prior run of
  // this script already processed them (with the old, memo-less catalog).
  const remaining = filtered.filter(
    (t) =>
      task476Keys.has(`${t.subject}|${t.year}`) ||
      !state.done.includes(`${t.subject}|${t.year}`),
  );
  const t476ResumeNote = TASK_476_BYPASS_ENABLED ? `, incl. ${TASK_476_PAPERS.length} Task #476 force-re-queued` : "";
  log(`Resuming: ${state.done.length} already done · ${remaining.length} remaining (incl. retries${t476ResumeNote})`);

  let i = 0;
  for (const task of remaining) {
    i++;
    const key = `${task.subject}|${task.year}`;
    const t0 = Date.now();

    // Capture before-state for verification
    const before = await db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE memo_text IS NULL OR length(trim(memo_text)) < 10)::int AS missing
      FROM dbe_verbatim_questions
      WHERE subject = ${task.subject} AND year = ${task.year}
    `);
    const bRow = before.rows[0] as any;
    const bTotal = Number(bRow?.total ?? 0);
    const bMissing = Number(bRow?.missing ?? 0);
    const beforeCoverage = bTotal > 0 ? Math.round(((bTotal - bMissing) / bTotal) * 100) : null;

    let succeeded = false;
    let summary = { completed: 0, failed: 0, skipped: 0 } as any;
    let errorMsg: string | undefined;
    try {
      log(`▶ [${i}/${remaining.length}] ${task.subject} ${task.year} (${task.reason}) — force re-ingest starting (memo coverage before: ${beforeCoverage ?? "n/a"}%)`);
      summary = await runIngestionBatch(catalog, {
        subject: task.subject,
        year: task.year,
        force: true,
      });
      log(
        `✔ ${task.subject} ${task.year}: ${summary.completed} ok / ${summary.failed} failed / ${summary.skipped} skipped (${(
          (Date.now() - t0) / 1000
        ).toFixed(1)}s)`,
      );
      succeeded = true;
    } catch (err: any) {
      errorMsg = err?.message ?? String(err);
      log(`✖ ${task.subject} ${task.year}: FAILED ${errorMsg}`);
    }

    // After-state (always captured, even on failure, for the report)
    const after = await db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE memo_text IS NULL OR length(trim(memo_text)) < 10)::int AS missing
      FROM dbe_verbatim_questions
      WHERE subject = ${task.subject} AND year = ${task.year}
    `);
    const aRow = after.rows[0] as any;
    const aTotal = Number(aRow?.total ?? 0);
    const aMissing = Number(aRow?.missing ?? 0);
    const afterCoverage = aTotal > 0 ? Math.round(((aTotal - aMissing) / aTotal) * 100) : 0;
    log(`  ↳ memo coverage now ${afterCoverage}% (${aTotal - aMissing}/${aTotal})`);

    if (succeeded) {
      try {
        await rebuildMasteryFromExisting(task.subject);
      } catch (e: any) {
        log(`  mastery rebuild failed: ${e?.message}`);
      }
    }

    // Record the per-tuple result regardless of outcome
    state.results.push({
      key,
      durationSec: Number(((Date.now() - t0) / 1000).toFixed(1)),
      completed: summary.completed ?? 0,
      failed: summary.failed ?? 0,
      skipped: summary.skipped ?? 0,
      memoCoveragePctBefore: beforeCoverage,
      memoCoveragePctAfter: afterCoverage,
      totalAfter: aTotal,
      missingAfter: aMissing,
      error: errorMsg,
    });

    // ── Critical fix: only mark done on success.
    //   Failed tuples land in state.failed and are auto-retried next run.
    if (succeeded) {
      state.done.push(key);
    } else {
      if (!state.failed.includes(key)) state.failed.push(key);
    }
    saveState(state);
  }

  log(`DONE — processed ${remaining.length} tuples this run · ${state.done.length} cumulative success · ${state.failed.length} pending retry`);
  process.exit(0);
}

main().catch((err) => {
  log("FATAL", err);
  process.exit(1);
});
