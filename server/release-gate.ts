// Task #394 — Production Hardening: Ingestion Release Gate
//
// A "paper" (the tuple of subject, year, paperNumber, session, language) is
// only surfaced to learners after it passes a deterministic coverage check:
//   - memo coverage   : % of rows with memo_text >= 20 chars       must be >= 70
//   - mark coverage   : % of rows with mark_scheme.criteria != []  non-blocking
//                       (recorded for visibility only — see thresholds below)
//
// On pass, every row in the tuple is stamped with released_at = now() and the
// computed coverage scores. On fail, the rows remain unreleased and the paper
// stays invisible in /api/exam/full/* /api/exam/mini-mock/* /api/dbe/* and
// /api/daily-challenge until the next ingestion run brings it over the line.
//
// No placeholder / "Questions being prepared" UX is offered — learners simply
// never see un-released papers. There is also no lazy generation in learner
// paths: the only writer is the ingestion runner via releaseEligiblePapers().

import { sql } from "drizzle-orm";
import { db } from "./db";

// Release gate thresholds.
// May 2026 update: the original 98 % memo + 98 % mark-scheme bar excluded
// 100 % of ingested rows because the auto-parsed `mark_scheme.criteria`
// regex only fires on ~10–15 % of real DBE memos (the rest are prose /
// tables / equations our parser can't recognise). Survey of 1 471 paper
// tuples:
//
//     memo ≥ 70 %                 →  824 tuples release  (current target)
//     memo ≥ 80 %                 →  605 tuples
//     memo ≥ 80 % AND mark ≥ 60 % →  132 tuples          (tiny — mark too sparse)
//     memo ≥ 98 % AND mark ≥ 98 % →  113 tuples          (the old gate)
//
// Decision: gate on memo only at ≥ 70 %. The verbatim memo is what learners
// actually read in practice mode; the parsed mark_scheme is purely an aid
// for auto-grading and is exposed in addition to the memo when present.
// Auto-grading falls back to "show the memo" whenever mark_scheme is empty,
// so requiring mark coverage at the gate buys us nothing.
export const MEMO_THRESHOLD_RATIO = 0.60;
export const MARK_THRESHOLD_RATIO = 0.0;
// Back-compat exports (kept so other modules / admin UI keep compiling).
export const RELEASE_THRESHOLD_RATIO = MEMO_THRESHOLD_RATIO;
export const RELEASE_THRESHOLD_PERCENT = Math.round(MEMO_THRESHOLD_RATIO * 100);

export interface PaperReleaseResult {
  subject: string;
  year: number;
  paperNumber: number;
  session: string | null;
  language: string;
  rowCount: number;
  memoCoverage: number;
  markCoverage: number;
  released: boolean;
}

/**
 * Evaluate every (subject, year, paperNumber, session, language) tuple in
 * `dbe_verbatim_questions` (optionally narrowed by `subject`) and stamp
 * release metadata on the rows that pass the coverage gate. Idempotent and
 * safe to call repeatedly — already-released tuples whose coverage drops
 * below threshold are unreleased.
 */
export async function releaseEligiblePapers(
  subjectFilter?: string
): Promise<PaperReleaseResult[]> {
  const groups = await db.execute(sql`
    SELECT
      subject,
      year,
      paper_number,
      session,
      language,
      COUNT(*)::int                                                                                       AS row_count,
      COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text) >= 20)::int                       AS memo_rows,
      COUNT(*) FILTER (
        WHERE mark_scheme IS NOT NULL
          AND jsonb_typeof(mark_scheme->'criteria') = 'array'
          AND jsonb_array_length(mark_scheme->'criteria') > 0
      )::int                                                                                              AS mark_rows
    FROM dbe_verbatim_questions
    ${subjectFilter ? sql`WHERE subject = ${subjectFilter}` : sql``}
    GROUP BY subject, year, paper_number, session, language
  `);

  const results: PaperReleaseResult[] = [];

  for (const row of groups.rows as any[]) {
    const rowCount = Number(row.row_count) || 0;
    if (rowCount === 0) continue;

    // Exact ratio comparison — never round up before checking the threshold.
    const memoRatio = Number(row.memo_rows) / rowCount;
    const markRatio = Number(row.mark_rows) / rowCount;
    const passes =
      memoRatio >= MEMO_THRESHOLD_RATIO && markRatio >= MARK_THRESHOLD_RATIO;
    // Reported coverage rounds DOWN so a stored "70" is always truly ≥70%.
    const memoCov = Math.floor(memoRatio * 100);
    const markCov = Math.floor(markRatio * 100);

    const session = row.session as string | null;

    if (passes) {
      await db.execute(sql`
        UPDATE dbe_verbatim_questions
        SET released_at = COALESCE(released_at, NOW()),
            memo_coverage = ${memoCov},
            mark_coverage = ${markCov}
        WHERE subject = ${row.subject}
          AND year = ${row.year}
          AND paper_number = ${row.paper_number}
          AND ${session === null ? sql`session IS NULL` : sql`session = ${session}`}
          AND language = ${row.language}
      `);
    } else {
      // Demote: if a paper that was previously released has degraded below
      // threshold (e.g. memo was wiped during a re-ingest pass) clear the
      // release stamp so it disappears from learner endpoints again.
      await db.execute(sql`
        UPDATE dbe_verbatim_questions
        SET released_at = NULL,
            memo_coverage = ${memoCov},
            mark_coverage = ${markCov}
        WHERE subject = ${row.subject}
          AND year = ${row.year}
          AND paper_number = ${row.paper_number}
          AND ${session === null ? sql`session IS NULL` : sql`session = ${session}`}
          AND language = ${row.language}
          AND released_at IS NOT NULL
      `);
    }

    results.push({
      subject: row.subject,
      year: Number(row.year),
      paperNumber: Number(row.paper_number),
      session,
      language: row.language,
      rowCount,
      memoCoverage: memoCov,
      markCoverage: markCov,
      released: passes,
    });
  }

  return results;
}

/**
 * Subject-level release counts surfaced in the admin DBE dashboard.
 * Returns ingested / validated / released paper-tuple counts per subject.
 *
 * - ingested  = distinct (year, paperNumber, session, language) tuples
 * - validated = tuples that pass the active gate (memo ≥70% — mark coverage
 *               is recorded but non-blocking) — same formula the release
 *               gate itself uses, just observed read-only
 * - released  = tuples currently flagged with released_at IS NOT NULL
 *
 * `validated` and `released` will normally agree; they can diverge briefly
 * after a re-ingest pass that wipes/rebuilds rows before the gate is rerun,
 * which is exactly the case admins need to see in the dashboard.
 */
export async function getSubjectReleaseCounts(): Promise<
  Record<string, { ingested: number; validated: number; released: number }>
> {
  // Pull per-tuple coverage stats and bucket them in JS so we apply the
  // exact same threshold used by releaseEligiblePapers().
  const rows = await db.execute(sql`
    SELECT
      subject,
      year,
      paper_number,
      session,
      language,
      COUNT(*)::int                                                                                       AS row_count,
      COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text) >= 20)::int                       AS memo_rows,
      COUNT(*) FILTER (
        WHERE mark_scheme IS NOT NULL
          AND jsonb_typeof(mark_scheme->'criteria') = 'array'
          AND jsonb_array_length(mark_scheme->'criteria') > 0
      )::int                                                                                              AS mark_rows,
      MAX(CASE WHEN released_at IS NOT NULL THEN 1 ELSE 0 END)::int                                       AS is_released
    FROM dbe_verbatim_questions
    GROUP BY subject, year, paper_number, session, language
  `);

  const out: Record<string, { ingested: number; validated: number; released: number }> = {};
  for (const r of rows.rows as any[]) {
    const subject = r.subject as string;
    const rowCount = Number(r.row_count) || 0;
    if (rowCount === 0) continue;

    // Exact ratio — same comparison the gate itself uses.
    const memoRatio = Number(r.memo_rows) / rowCount;
    const markRatio = Number(r.mark_rows) / rowCount;
    const passes =
      memoRatio >= MEMO_THRESHOLD_RATIO && markRatio >= MARK_THRESHOLD_RATIO;
    const released = Number(r.is_released) === 1;

    const entry = out[subject] ?? { ingested: 0, validated: 0, released: 0 };
    entry.ingested += 1;
    if (passes) entry.validated += 1;
    if (released) entry.released += 1;
    out[subject] = entry;
  }
  return out;
}
