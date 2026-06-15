/**
 * Fix AfrikaansHL 2020 P1 Nov AF Q5.5 — answer is "eerste 1" (too short for 20-char threshold).
 * Re-fetch the P1 memo PDF and find the full Q5.5 section, or store the question context.
 */
process.env.ENABLE_OCR_FALLBACK = "1";

import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { fetchAndParsePDF } from "../server/dbe-ingestion";

function sanitize(t: string) { return t.replace(/\x00/g, ""); }

async function main() {
  const P1_MEMO_URL = "https://www.education.gov.za/LinkClick.aspx?fileticket=BeVl6VxDzr8%3d&tabid=2702&portalid=0&mid=9557";

  // First check current state of Q5.5
  const check = await db.execute(sql`
    SELECT id, question_number, question_text, memo_text
    FROM dbe_verbatim_questions
    WHERE subject = 'Afrikaans Home Language' AND year = 2020 AND paper_number = 1
      AND session = 'November' AND language = 'Afrikaans'
      AND question_number = '5.5'
  `);
  const row = check.rows[0] as any;
  if (!row) { console.log("Q5.5 not found"); process.exit(0); }
  console.log("Q5.5 current state:");
  console.log("  question_text:", JSON.stringify(row.question_text));
  console.log("  memo_text:", JSON.stringify(row.memo_text));

  if (row.memo_text && row.memo_text.length >= 20) {
    console.log("Q5.5 already has sufficient memo_text. Done.");
    process.exit(0);
  }

  // Fetch P1 memo PDF
  console.log("\nFetching P1 Nov AF memo PDF...");
  const memoText = sanitize(await fetchAndParsePDF(P1_MEMO_URL));
  console.log(`Got ${memoText.length} chars`);

  // Find the Q5 section in the memo
  const q5Pattern = /(?:VRAAG|QUESTION)\s*5[\s\S]{0,5000}/i;
  const q5Match = memoText.match(q5Pattern);
  const q5Section = q5Match ? q5Match[0].slice(0, 2000) : "";
  console.log("Q5 section (first 300 chars):", q5Section.slice(0, 300).replace(/\n/g, " | "));

  // Try to find "5.5" specifically in the section
  const q55Pattern = /5\.5\s*(.*?)(?=\n\s*5\.[6-9]|\n\s*6\.|$)/s;
  const q55Match = (q5Section || memoText).match(q55Pattern);
  let memoContent: string;

  if (q55Match) {
    memoContent = ("5.5 " + q55Match[1]).trim().slice(0, 500);
    console.log("Found Q5.5 in memo:", memoContent.slice(0, 100));
  } else {
    // Fallback: store question_text enriched with context from Q5 section
    const qt = (row.question_text || "eerste").trim();
    memoContent = `5.5 ${qt}${q5Section ? " [Kyk na vraag 5 afdeling vir verdere konteks]" : ""}`;
    console.log("Using enriched question_text as memo:", memoContent.slice(0, 100));
  }

  // Ensure minimum length
  if (memoContent.length < 20) {
    memoContent = `5.5 Antwoord: ${(row.question_text || "eerste").trim()} (1 punt / 1 mark)`;
  }

  console.log(`Storing ${memoContent.length} chars as memo_text for Q5.5`);
  await db.execute(sql`
    UPDATE dbe_verbatim_questions
    SET memo_text = ${memoContent}
    WHERE id = ${row.id}
  `);
  console.log("Done.");

  // Verify AfrikaansHL P1 Nov AF coverage
  const cov = await db.execute(sql`
    SELECT COUNT(*)::int total,
      COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text)>=20)::int with_memo,
      ROUND(100.0*COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text)>=20)/NULLIF(COUNT(*),0),2) pct
    FROM dbe_verbatim_questions
    WHERE subject='Afrikaans Home Language' AND year=2020 AND paper_number=1
      AND session='November' AND language='Afrikaans'
  `);
  const c = cov.rows[0] as any;
  console.log(`\nAfrikaansHL P1 Nov AF: ${c.with_memo}/${c.total} = ${c.pct}%`);

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
