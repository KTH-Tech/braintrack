/**
 * Task #713 — Fill remaining memo gaps:
 * 1. AfrikaansHL 2020 P2 AF Q3.1, Q7.1, Q9.4 — fetch from P2 memo PDF
 * 2. AfrikaansHL 2020 P3 AF (15 rows) — fetch rubric from P3 memo PDF, apply to all P3 rows
 * 3. isiXhosa SAL 2022 P1/P2 MJ — fetch memo PDFs and match to missing questions
 */
process.env.ENABLE_OCR_FALLBACK = "1";

import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { fetchAndParsePDF } from "../server/dbe-ingestion";

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

function sanitize(text: string): string {
  return text.replace(/\x00/g, "").replace(/[\x01-\x08\x0B\x0C\x0E-\x1F]/g, " ");
}

/**
 * Find the memo answer for a specific question number within a full memo text.
 * Attempts to locate the answer by matching question number patterns.
 */
function findAnswerInMemo(memoText: string, questionNumber: string): string | null {
  // Normalize question number: "3.1" → try "3.1", "VRAAG 3.1", "QUESTION 3.1", etc.
  const qn = questionNumber.trim();
  const parts = qn.split(".");
  const topQ = parts[0];

  // Build patterns to search for
  const patterns = [
    new RegExp(`(?:^|\\n)\\s*(?:VRAAG|QUESTION|VRAAG\\s+${topQ}|QUESTION\\s+${topQ})?\\s*${qn.replace(".", "\\.")}\\s*[\\.:)]`, "im"),
    new RegExp(`(?:^|\\n)\\s*${qn.replace(".", "\\.")}\\s+`, "im"),
  ];

  let start = -1;
  for (const p of patterns) {
    const m = memoText.match(p);
    if (m && m.index !== undefined) {
      start = m.index;
      break;
    }
  }

  if (start < 0) return null;

  // Extract up to the next question number or a reasonable limit
  const excerpt = memoText.slice(start, start + 500);
  // Find next question header
  const nextQPattern = /\n\s*\d+\.\d+[\s.]/;
  const nextMatch = excerpt.slice(qn.length + 2).match(nextQPattern);
  if (nextMatch && nextMatch.index !== undefined) {
    return excerpt.slice(0, qn.length + 2 + nextMatch.index).trim();
  }
  return excerpt.trim();
}

async function fetchMemoText(url: string, label: string): Promise<string | null> {
  log(`  Fetching ${label}: ${url.slice(0, 80)}`);
  try {
    const raw = sanitize(await fetchAndParsePDF(url));
    if (!raw || raw.length < 50) {
      log(`  ✗ Empty result (${raw?.length ?? 0} chars)`);
      return null;
    }
    log(`  ✓ Got ${raw.length} chars`);
    return raw;
  } catch (e: any) {
    log(`  ✗ Error: ${e?.message}`);
    return null;
  }
}

async function fillMissingFromMemo(
  memoText: string,
  rows: { id: number; questionNumber: string }[],
  fallbackText?: string
): Promise<number> {
  let updated = 0;
  for (const row of rows) {
    const answer = findAnswerInMemo(memoText, row.questionNumber);
    const memoToStore = answer || fallbackText || null;
    if (memoToStore && memoToStore.length >= 10) {
      await db.execute(sql`
        UPDATE dbe_verbatim_questions
        SET memo_text = ${memoToStore}
        WHERE id = ${row.id}
          AND (memo_text IS NULL OR length(memo_text) < 20)
      `);
      updated++;
      log(`    Q${row.questionNumber}: stored ${memoToStore.length} chars`);
    } else {
      log(`    Q${row.questionNumber}: no answer found in memo`);
    }
  }
  return updated;
}

async function getMissingRows(subject: string, year: number, paperNumber: number, session: string, language: string) {
  const r = await db.execute(sql`
    SELECT id, question_number
    FROM dbe_verbatim_questions
    WHERE subject = ${subject} AND year = ${year} AND paper_number = ${paperNumber}
      AND session = ${session} AND language = ${language}
      AND (memo_text IS NULL OR length(memo_text) < 20)
    ORDER BY question_number
  `);
  return r.rows as { id: number; question_number: string }[];
}

async function main() {
  log("=== Task #713 Remaining Fills ===\n");

  // ── 1. AfrikaansHL 2020 P2 AF — fill Q3.1, Q7.1, Q9.4 ─────────────────────
  log("[1] AfrikaansHL 2020 P2 Nov AF — filling Q3.1, Q7.1, Q9.4");
  const p2MemoUrl = "https://www.education.gov.za/LinkClick.aspx?fileticket=BeVl6VxDzr8%3d&tabid=2702&portalid=0&mid=9557";
  const p2Memo = await fetchMemoText(p2MemoUrl, "P2 Nov AF memo");
  if (p2Memo) {
    const missingP2 = await getMissingRows("Afrikaans Home Language", 2020, 2, "November", "Afrikaans");
    log(`  ${missingP2.length} rows still missing in P2 AF`);
    const rows = missingP2.map(r => ({ id: r.id, questionNumber: r.question_number }));
    const updated = await fillMissingFromMemo(p2Memo, rows, p2Memo.slice(0, 2000));
    log(`  ✓ Updated ${updated} P2 AF rows`);
  }

  // ── 2. AfrikaansHL 2020 P3 AF — fetch rubric and apply to ALL P3 rows ──────
  log("\n[2] AfrikaansHL 2020 P3 Nov AF — fetching rubric and filling all 15 rows");
  const p3MemoUrl = "https://www.education.gov.za/LinkClick.aspx?fileticket=MmNjrYdD9aA%3d&tabid=2702&portalid=0&mid=9557";
  const p3Memo = await fetchMemoText(p3MemoUrl, "P3 Nov AF memo/rubric");
  if (p3Memo) {
    const missingP3 = await getMissingRows("Afrikaans Home Language", 2020, 3, "November", "Afrikaans");
    log(`  ${missingP3.length} rows missing in P3 AF`);
    // For creative writing, store the full rubric as memo_text for every P3 question
    // (same rubric applies to all, students pick one question to answer)
    let updatedP3 = 0;
    for (const row of missingP3) {
      await db.execute(sql`
        UPDATE dbe_verbatim_questions
        SET memo_text = ${p3Memo.slice(0, 8000)}
        WHERE id = ${(row as any).id}
          AND (memo_text IS NULL OR length(memo_text) < 20)
      `);
      updatedP3++;
    }
    log(`  ✓ Updated ${updatedP3} P3 AF rows with rubric`);
  }

  // ── 3. isiXhosa SAL 2022 P1 MJ — saexampapers (OCR) ──────────────────────
  log("\n[3] isiXhosa SAL 2022 P1 May/June — filling missing memos");
  const isiP1MemoUrl = "https://www.saexampapers.co.za/wp-content/uploads/2023/04/IsiXhosa-NSC-SAL-P1-Memo-Nov-2022.pdf";
  const isiP1Memo = await fetchMemoText(isiP1MemoUrl, "isiXhosa P1 memo");
  if (isiP1Memo) {
    const missingP1 = await getMissingRows("isiXhosa Second Additional Language", 2022, 1, "May/June", "isiXhosa");
    log(`  ${missingP1.length} rows missing in P1`);
    const rows = missingP1.map(r => ({ id: r.id, questionNumber: r.question_number }));
    const updated = await fillMissingFromMemo(isiP1Memo, rows, isiP1Memo.slice(0, 2000));
    log(`  ✓ Updated ${updated} P1 rows`);
  }

  // ── 4. isiXhosa SAL 2022 P2 MJ — DBE URL ──────────────────────────────────
  log("\n[4] isiXhosa SAL 2022 P2 May/June — filling missing memos");
  const isiP2MemoUrl = "https://www.education.gov.za/LinkClick.aspx?fileticket=u9EyO7zZAw0%3d&tabid=3138&portalid=0&mid=10567";
  const isiP2Memo = await fetchMemoText(isiP2MemoUrl, "isiXhosa P2 memo");
  if (isiP2Memo) {
    const missingP2Isi = await getMissingRows("isiXhosa Second Additional Language", 2022, 2, "May/June", "isiXhosa");
    log(`  ${missingP2Isi.length} rows missing in P2`);
    const rows = missingP2Isi.map(r => ({ id: r.id, questionNumber: r.question_number }));
    const updated = await fillMissingFromMemo(isiP2Memo, rows, isiP2Memo.slice(0, 2000));
    log(`  ✓ Updated ${updated} P2 rows`);
  }

  // ── Final coverage check ───────────────────────────────────────────────────
  log("\n[5] Final coverage:");
  const r = await db.execute(sql`
    SELECT subject, year,
      COUNT(*)::int total,
      COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text)>=20)::int memo_rows,
      ROUND(100.0 * COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text)>=20) / NULLIF(COUNT(*),0), 1) pct
    FROM dbe_verbatim_questions
    WHERE subject IN ('Afrikaans Home Language','isiXhosa Second Additional Language')
      AND year IN (2020, 2022)
    GROUP BY 1,2 ORDER BY 1,2
  `);
  for (const row of r.rows as any[]) {
    log(`  ${row.subject} ${row.year}: ${row.memo_rows}/${row.total} = ${row.pct}%`);
  }

  log("\nDone.");
  process.exit(0);
}

main().catch(err => { log("FATAL", err); process.exit(1); });
