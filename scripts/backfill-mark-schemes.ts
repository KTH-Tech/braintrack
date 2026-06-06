/**
 * One-shot backfill: parse every `dbe_verbatim_questions` memo into a
 * structured mark scheme (via `server/memo-marker.ts → parseMemoToScheme`)
 * and cache the result on the `mark_scheme` jsonb column.
 *
 * Why:
 *   The Memo-Driven Marking Engine parses memos lazily on first use and
 *   caches the parsed scheme on the question row. Warming this cache for
 *   every verbatim question makes the first attempt instant for every
 *   learner and surfaces memos the parser can't handle so they can be
 *   triaged.
 *
 * Behaviour:
 *   - Idempotent: rows that already have a non-empty `markScheme` are
 *     skipped (override with --force).
 *   - Streams in batches (default 500) so memory stays flat across
 *     thousands of rows.
 *   - Reports counts of: scanned / cached-skip / parsed / no-memo /
 *     parse-failed, plus up to N sample failures (id, subject, year,
 *     paper, question_number, memo_text length + preview) for triage.
 *
 * Usage:
 *   npx tsx scripts/backfill-mark-schemes.ts                # default
 *   npx tsx scripts/backfill-mark-schemes.ts --force        # re-parse all
 *   npx tsx scripts/backfill-mark-schemes.ts --batch=1000   # batch size
 *   npx tsx scripts/backfill-mark-schemes.ts --samples=20   # failure samples
 *   npx tsx scripts/backfill-mark-schemes.ts --subject="Mathematics"
 */
import { db, pool } from "../server/db";
import { and, asc, eq, gt, sql } from "drizzle-orm";
import { dbeVerbatimQuestions } from "@shared/schema";
import { parseMemoToScheme, type MarkScheme } from "../server/memo-marker";

function isCachedScheme(value: unknown): value is MarkScheme {
  if (!value || typeof value !== "object") return false;
  const criteria = (value as { criteria?: unknown }).criteria;
  return Array.isArray(criteria) && criteria.length > 0;
}

type Args = {
  force: boolean;
  batch: number;
  samples: number;
  subject: string | null;
};

function parseArgs(): Args {
  const args: Args = { force: false, batch: 500, samples: 10, subject: null };
  for (const raw of process.argv.slice(2)) {
    if (raw === "--force") args.force = true;
    else if (raw.startsWith("--batch=")) args.batch = Math.max(50, parseInt(raw.slice(8), 10) || 500);
    else if (raw.startsWith("--samples=")) args.samples = Math.max(0, parseInt(raw.slice(10), 10) || 10);
    else if (raw.startsWith("--subject=")) args.subject = raw.slice(10).trim() || null;
  }
  return args;
}

type FailureSample = {
  id: number;
  subject: string;
  year: number;
  paperNumber: number;
  questionNumber: string;
  marks: number | null;
  memoLength: number;
  memoPreview: string;
  reason: "no_memo" | "parse_returned_null" | "empty_criteria";
};

async function main() {
  const args = parseArgs();
  const startedAt = Date.now();

  console.log("[backfill] Mark-scheme backfill starting…");
  console.log(`[backfill] options: force=${args.force} batch=${args.batch} samples=${args.samples} subject=${args.subject ?? "<all>"}`);

  // Total candidate count for progress reporting
  const totalRow = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(dbeVerbatimQuestions)
    .where(args.subject ? eq(dbeVerbatimQuestions.subject, args.subject) : sql`true`);
  const total = totalRow[0]?.n ?? 0;
  console.log(`[backfill] ${total} verbatim question(s) in scope.`);

  let scanned = 0;
  let skippedCached = 0;
  let parsed = 0;
  let noMemo = 0;
  let parseFailed = 0;
  let updateFailed = 0;
  const failures: FailureSample[] = [];

  let lastId = 0;
  // Stream rows in id-ordered pages — no OFFSET, no full table buffer.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await db
      .select({
        id: dbeVerbatimQuestions.id,
        subject: dbeVerbatimQuestions.subject,
        year: dbeVerbatimQuestions.year,
        paperNumber: dbeVerbatimQuestions.paperNumber,
        questionNumber: dbeVerbatimQuestions.questionNumber,
        memoText: dbeVerbatimQuestions.memoText,
        marks: dbeVerbatimQuestions.marks,
        markScheme: dbeVerbatimQuestions.markScheme,
      })
      .from(dbeVerbatimQuestions)
      .where(
        and(
          gt(dbeVerbatimQuestions.id, lastId),
          args.subject ? eq(dbeVerbatimQuestions.subject, args.subject) : sql`true`,
        ),
      )
      .orderBy(asc(dbeVerbatimQuestions.id))
      .limit(args.batch);

    if (page.length === 0) break;

    for (const row of page) {
      scanned++;
      lastId = row.id;

      if (isCachedScheme(row.markScheme) && !args.force) {
        skippedCached++;
        continue;
      }

      const memo = (row.memoText ?? "").trim();
      if (memo.length < 10) {
        noMemo++;
        if (failures.length < args.samples) {
          failures.push({
            id: row.id,
            subject: row.subject,
            year: row.year,
            paperNumber: row.paperNumber,
            questionNumber: row.questionNumber,
            marks: row.marks,
            memoLength: memo.length,
            memoPreview: memo.slice(0, 120),
            reason: "no_memo",
          });
        }
        continue;
      }

      const totalMarks = row.marks ?? 1;
      const scheme = parseMemoToScheme(memo, totalMarks);

      if (!scheme || scheme.criteria.length === 0) {
        parseFailed++;
        if (failures.length < args.samples) {
          failures.push({
            id: row.id,
            subject: row.subject,
            year: row.year,
            paperNumber: row.paperNumber,
            questionNumber: row.questionNumber,
            marks: row.marks,
            memoLength: memo.length,
            memoPreview: memo.slice(0, 200).replace(/\s+/g, " "),
            reason: scheme ? "empty_criteria" : "parse_returned_null",
          });
        }
        continue;
      }

      try {
        await db
          .update(dbeVerbatimQuestions)
          .set({ markScheme: scheme })
          .where(eq(dbeVerbatimQuestions.id, row.id));
        parsed++;
      } catch (err: unknown) {
        updateFailed++;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[backfill] update failed for id=${row.id}: ${msg}`);
      }
    }

    const pct = total > 0 ? ((scanned / total) * 100).toFixed(1) : "100.0";
    console.log(
      `[backfill] progress ${scanned}/${total} (${pct}%) — parsed=${parsed} cached=${skippedCached} no_memo=${noMemo} parse_failed=${parseFailed} update_failed=${updateFailed}`,
    );
  }

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log("");
  console.log("[backfill] ───────── SUMMARY ─────────");
  console.log(`[backfill] scanned        : ${scanned}`);
  console.log(`[backfill] parsed+stored  : ${parsed}`);
  console.log(`[backfill] skipped cached : ${skippedCached}`);
  console.log(`[backfill] no memo text   : ${noMemo}`);
  console.log(`[backfill] parse failures : ${parseFailed}`);
  console.log(`[backfill] update failures: ${updateFailed}`);
  console.log(`[backfill] elapsed        : ${elapsedSec}s`);

  if (failures.length > 0) {
    console.log("");
    console.log(`[backfill] First ${failures.length} sample(s) needing triage:`);
    for (const f of failures) {
      console.log(
        `  · id=${f.id} ${f.subject} ${f.year} P${f.paperNumber} Q${f.questionNumber} marks=${f.marks ?? "?"} reason=${f.reason} memoLen=${f.memoLength}`,
      );
      if (f.memoPreview) console.log(`      memo: "${f.memoPreview}${f.memoLength > f.memoPreview.length ? "…" : ""}"`);
    }
  }

  await pool.end().catch(() => {});
}

main().catch(async (err) => {
  console.error("[backfill] FATAL:", err);
  await pool.end().catch(() => {});
  process.exit(1);
});
