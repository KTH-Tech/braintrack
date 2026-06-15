/**
 * Task #385 follow-on: memo-only patcher.
 *
 * Far faster than full force-re-ingestion when the only thing missing on a
 * (subject, year, paperNumber, language) tuple is the memo half (i.e. the
 * triage flagged it MEMO_IN_CATALOG_NOT_LINKED). For each affected tuple we
 *   1. read the memo URL from `exam_papers`,
 *   2. download + parse the memo PDF ONCE,
 *   3. slice the memo per QUESTION header (top-level) and per sub-question regex,
 *   4. UPDATE matching `dbe_verbatim_questions` rows in place — setting
 *      `source_memo_url`, `memo_text`, and a freshly-computed `mark_scheme`.
 *
 * Idempotent — only touches rows whose `memo_text` is currently NULL or empty.
 *
 * Run:  npx tsx scripts/patch-missing-memos.ts
 *       (use --limit=N to cap tuples processed in one run)
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { fetchAndParsePDF, splitByQuestionHeaders } from "../server/dbe-ingestion";
import { parseMemoToScheme } from "../server/memo-marker";

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface Tuple {
  subject: string;
  year: number;
  paperNumber: number;
  language: string;
  memoUrl: string;
  missingRows: number;
}

async function findTuples(): Promise<Tuple[]> {
  // Tuples where:
  //   - dbe_verbatim_questions has rows for this (subject, year, paper, language)
  //     AND at least one row has memo_text NULL/empty AND source_memo_url NULL
  //   - exam_papers has a populated memo_url for that tuple
  const rows = await db.execute(sql`
    WITH gaps AS (
      SELECT q.subject, q.year, q.paper_number, q.language,
             COUNT(*) FILTER (WHERE q.memo_text IS NULL OR length(trim(q.memo_text)) < 10)::int AS missing
      FROM dbe_verbatim_questions q
      GROUP BY 1,2,3,4
      HAVING COUNT(*) FILTER (WHERE q.memo_text IS NULL OR length(trim(q.memo_text)) < 10) > 0
    )
    SELECT g.subject, g.year, g.paper_number, g.language, g.missing,
           ep.memo_url
    FROM gaps g
    JOIN subjects s ON s.name = g.subject
    JOIN exam_papers ep
      ON ep.subject_id = s.id
     AND ep.year = g.year
     AND ep.paper_number = g.paper_number
     AND ep.language = g.language
    WHERE COALESCE(ep.memo_url, '') <> ''
    ORDER BY g.missing DESC
  `);
  return (rows.rows as any[]).map((r) => ({
    subject: r.subject,
    year: Number(r.year),
    paperNumber: Number(r.paper_number),
    language: r.language,
    memoUrl: r.memo_url,
    missingRows: Number(r.missing),
  }));
}

async function patchTuple(t: Tuple): Promise<{ updated: number; skipped: number }> {
  let memoText: string;
  try {
    memoText = await fetchAndParsePDF(t.memoUrl);
  } catch (e: any) {
    log(`  ✖ download/parse failed: ${e?.message ?? e}`);
    return { updated: 0, skipped: 0 };
  }
  if (!memoText || memoText.trim().length < 50) {
    log(`  ✖ memo PDF text too short (${memoText?.length ?? 0} chars) — likely scanned/image, needs OCR`);
    return { updated: 0, skipped: 0 };
  }

  const memoSections = splitByQuestionHeaders(memoText);
  if (memoSections.size === 0) {
    log(`  ✖ memo had no detectable QUESTION headers — skipping`);
    return { updated: 0, skipped: 0 };
  }

  // Pull all rows we may need to update for this tuple.
  const qrows = await db.execute(sql`
    SELECT id, question_number, marks
    FROM dbe_verbatim_questions
    WHERE subject = ${t.subject}
      AND year = ${t.year}
      AND paper_number = ${t.paperNumber}
      AND language = ${t.language}
      AND (memo_text IS NULL OR length(trim(memo_text)) < 10)
  `);

  let updated = 0;
  let skipped = 0;
  for (const r of qrows.rows as any[]) {
    const qNum: string = String(r.question_number);
    const topLevel = qNum.split(".")[0].toUpperCase();
    const memoSection = memoSections.get(topLevel);
    if (!memoSection) {
      skipped++;
      continue;
    }

    let memoSubText: string | null = null;
    if (qNum.includes(".")) {
      // Sub-question — replicate the slicer used at ingestion time.
      const escaped = escapeRegExp(qNum);
      const escapedTopLevel = escapeRegExp(topLevel);
      // Match "1.1 ..." up to the next sibling sub-number or next QUESTION/VRAAG.
      let re: RegExp | null = null;
      try {
        re = new RegExp(
          `(?:^|\\n)\\s*${escaped}\\s+(.+?)(?=\\n\\s*${escapedTopLevel}\\.\\d|\\n\\s*QUESTION|\\n\\s*VRAAG|$)`,
          "is",
        );
      } catch (err) {
        log(`[warn] Skipping qNum="${qNum}" — invalid RegExp: ${err}`);
      }
      const m = re ? memoSection.match(re) : null;
      if (m) memoSubText = m[1].replace(/\s+/g, " ").trim().slice(0, 2000);
    } else {
      memoSubText = memoSection.slice(0, 4000).trim();
    }

    if (!memoSubText || memoSubText.length < 5) {
      skipped++;
      continue;
    }

    const scheme = parseMemoToScheme(memoSubText, r.marks ?? 1);
    await db.execute(sql`
      UPDATE dbe_verbatim_questions
      SET memo_text = ${memoSubText},
          source_memo_url = ${t.memoUrl},
          mark_scheme = ${scheme as any}
      WHERE id = ${r.id}
    `);
    updated++;
  }
  return { updated, skipped };
}

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : Number.POSITIVE_INFINITY;

  const tuples = await findTuples();
  log(`Found ${tuples.length} tuples with paired memo URLs awaiting patch`);

  let totalUpdated = 0;
  let totalSkipped = 0;
  let processed = 0;
  for (const t of tuples) {
    if (processed >= limit) break;
    processed++;
    log(
      `▶ [${processed}/${Math.min(tuples.length, limit)}] ${t.subject} ${t.year} P${t.paperNumber} ${t.language} (${t.missingRows} missing)`,
    );
    try {
      const { updated, skipped } = await patchTuple(t);
      totalUpdated += updated;
      totalSkipped += skipped;
      log(`  ✓ patched ${updated}, skipped ${skipped}`);
    } catch (e: any) {
      log(`  ✖ tuple FAILED: ${e?.message ?? e}`);
    }
  }
  log(`\n=== DONE === processed ${processed} tuples · updated ${totalUpdated} rows · skipped ${totalSkipped} rows`);
  process.exit(0);
}

main().catch((e) => {
  log("FATAL", e);
  process.exit(1);
});
