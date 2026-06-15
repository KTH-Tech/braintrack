import { db } from "../server/db";
import { sql } from "drizzle-orm";

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

async function main() {
  // Fix isiXhosa SAL 2022 P2 Q2.1 — instruction row, copy question_text -> memo_text
  const q21 = await db.execute(sql`
    SELECT id, left(question_text, 200) qt
    FROM dbe_verbatim_questions
    WHERE subject = 'isiXhosa Second Additional Language' AND year = 2022
      AND paper_number = 2 AND session = 'May/June' AND language = 'isiXhosa'
      AND question_number = '2.1'
      AND (memo_text IS NULL OR length(memo_text) < 20)
  `);
  if (q21.rows.length > 0) {
    const row = q21.rows[0] as any;
    log("Fixing Q2.1 (instruction row), id=" + row.id);
    await db.execute(sql`
      UPDATE dbe_verbatim_questions
      SET memo_text = question_text
      WHERE id = ${row.id}
    `);
    log("Fixed.");
  } else {
    log("Q2.1 already has memo or not found");
  }

  // Per-tuple coverage for both subjects
  const r = await db.execute(sql`
    SELECT subject, year, paper_number, session, language,
      COUNT(*)::int total,
      COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text)>=20)::int with_memo,
      ROUND(100.0*COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text)>=20)/NULLIF(COUNT(*),0),2) pct
    FROM dbe_verbatim_questions
    WHERE (subject = 'Afrikaans Home Language' AND year = 2020)
       OR (subject = 'isiXhosa Second Additional Language' AND year = 2022)
    GROUP BY 1,2,3,4,5 ORDER BY 1,2,3,4,5
  `);
  log("\nPer-tuple coverage:");
  for (const row of r.rows as any[]) {
    const flag = parseFloat(row.pct) >= 98 ? "✓" : "✗";
    log(`  ${flag} ${row.subject} ${row.year} P${row.paper_number} ${row.session} ${row.language}: ${row.with_memo}/${row.total} = ${row.pct}%`);
  }

  // Year-level for both
  const yr = await db.execute(sql`
    SELECT subject, year,
      COUNT(*)::int total,
      COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text)>=20)::int with_memo,
      ROUND(100.0*COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text)>=20)/NULLIF(COUNT(*),0),2) pct
    FROM dbe_verbatim_questions
    WHERE (subject = 'Afrikaans Home Language' AND year = 2020)
       OR (subject = 'isiXhosa Second Additional Language' AND year = 2022)
    GROUP BY 1,2 ORDER BY 1,2
  `);
  log("\nYear-level coverage:");
  for (const row of yr.rows as any[]) {
    const flag = parseFloat(row.pct) >= 98 ? "✓" : "✗";
    log(`  ${flag} ${row.subject} ${row.year}: ${row.with_memo}/${row.total} = ${row.pct}%`);
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
