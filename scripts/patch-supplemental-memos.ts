/**
 * Task #391 — patch only the (subject, year, paper, language) tuples listed
 * in `server/data/dbe-papers-catalog-supplemental.json`. Re-uses the slicing
 * logic from `patch-missing-memos.ts` but limits the work set to the
 * supplemental tuples so a single run completes inside the 120 s tool budget.
 *
 * Idempotent — re-runs only touch rows whose memo_text is still empty.
 *
 * Run:  npx tsx scripts/patch-supplemental-memos.ts
 *       (--limit=N to cap; --start=N to resume)
 */
import { readFileSync } from "fs";
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { fetchAndParsePDF, splitByQuestionHeaders } from "../server/dbe-ingestion";
import { parseMemoToScheme } from "../server/memo-marker";

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface SupEntry {
  forSubject: string;
  forYear: number;
  forPaperNumber: number;
  forLanguage: string;
  url: string;
}

async function patchTuple(t: SupEntry): Promise<{ updated: number; skipped: number }> {
  let memoText: string;
  try {
    memoText = await fetchAndParsePDF(t.url, 1);
  } catch (e: any) {
    log(`  ✖ download/parse failed: ${e?.message ?? e}`);
    return { updated: 0, skipped: 0 };
  }
  if (!memoText || memoText.trim().length < 50) {
    log(`  ✖ memo PDF text too short (${memoText?.length ?? 0} chars)`);
    return { updated: 0, skipped: 0 };
  }

  const memoSections = splitByQuestionHeaders(memoText);

  const qrows = await db.execute(sql`
    SELECT id, question_number, marks
    FROM dbe_verbatim_questions
    WHERE subject = ${t.forSubject}
      AND year = ${t.forYear}
      AND paper_number = ${t.forPaperNumber}
      AND language = ${t.forLanguage}
      AND (memo_text IS NULL OR length(trim(memo_text)) < 10)
  `);

  let updated = 0, skipped = 0;
  for (const r of qrows.rows as any[]) {
    const qNum: string = String(r.question_number);
    const topLevel = qNum.split(".")[0].toUpperCase();
    const memoSection = memoSections.get(topLevel);

    let memoSubText: string | null = null;

    if (qNum.includes(".")) {
      const escaped = escapeRegExp(qNum);
      const escapedTopLevel = escapeRegExp(topLevel);
      // Slice within the per-QUESTION section if we have it; otherwise slice
      // from the full memo body (Math/MathLit memos lack QUESTION headers).
      const haystack = memoSection ?? memoText;
      let re: RegExp | null = null;
      try {
        re = new RegExp(
          `(?:^|\\n)\\s*${escaped}\\s+(.+?)(?=\\n\\s*${escapedTopLevel}\\.\\d|\\n\\s*\\d+\\.\\d+\\b|\\n\\s*QUESTION|\\n\\s*VRAAG|$)`,
          "is",
        );
      } catch (err) {
        log(`[warn] Skipping qNum="${qNum}" — invalid RegExp: ${err}`);
      }
      const m = re ? haystack.match(re) : null;
      if (m) memoSubText = m[1].replace(/\s+/g, " ").trim().slice(0, 2000);
    } else if (memoSection) {
      memoSubText = memoSection.slice(0, 4000).trim();
    } else {
      // Top-level question with no section header — fall back to the
      // first ~4000 chars after the matching "1.", "2.", etc.
      let re: RegExp | null = null;
      try {
        re = new RegExp(`(?:^|\\n)\\s*${escapeRegExp(qNum)}[.)\\s].{0,4000}`, "is");
      } catch (err) {
        log(`[warn] Skipping qNum="${qNum}" — invalid RegExp: ${err}`);
      }
      const m = re ? memoText.match(re) : null;
      if (m) memoSubText = m[0].slice(0, 4000).trim();
    }

    if (!memoSubText || memoSubText.length < 5) { skipped++; continue; }

    const scheme = parseMemoToScheme(memoSubText, r.marks ?? 1);
    await db.execute(sql`
      UPDATE dbe_verbatim_questions
      SET memo_text = ${memoSubText},
          source_memo_url = ${t.url},
          mark_scheme = ${scheme as any}
      WHERE id = ${r.id}
    `);
    updated++;
  }
  return { updated, skipped };
}

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const startArg = process.argv.find((a) => a.startsWith("--start="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : Number.POSITIVE_INFINITY;
  const start = startArg ? parseInt(startArg.split("=")[1], 10) : 0;

  const tuples = JSON.parse(readFileSync("server/data/dbe-papers-catalog-supplemental.json", "utf8")) as SupEntry[];
  log(`Processing ${tuples.length} supplemental tuples (start=${start}, limit=${limit})`);

  let totalUpdated = 0, totalSkipped = 0, processed = 0;
  for (let i = start; i < tuples.length && processed < limit; i++) {
    const t = tuples[i];
    processed++;
    log(`▶ [${i + 1}/${tuples.length}] ${t.forSubject} ${t.forYear} P${t.forPaperNumber} ${t.forLanguage}`);
    try {
      const { updated, skipped } = await patchTuple(t);
      totalUpdated += updated; totalSkipped += skipped;
      log(`  ✓ updated=${updated}, skipped=${skipped}`);
    } catch (e: any) {
      log(`  ✖ tuple FAILED: ${e?.message ?? e}`);
    }
  }
  log(`\n=== DONE === processed ${processed} · updated ${totalUpdated} rows · skipped ${totalSkipped}`);
  process.exit(0);
}

main().catch((e) => { log("FATAL", e); process.exit(1); });
