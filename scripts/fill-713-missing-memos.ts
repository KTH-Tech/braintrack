/**
 * Task #713 — Targeted memo fill.
 * Only downloads the specific missing memo PDFs and fills them in without
 * touching any other rows.  Much faster than a full force re-ingest.
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { createHash } from "crypto";
import catalogJson from "../server/data/dbe-papers-catalog.json";
import { releaseEligiblePapers } from "../server/release-gate";
import { fetchAndParsePDF } from "../server/dbe-ingestion";

const catalog = catalogJson as any[];

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

function extractMemoSection(text: string): string {
  if (!text) return "";
  const upper = text.toUpperCase();
  const markers = ["MEMORANDUM", "MARKING GUIDELINE", "MEMO", "NASIENRIGLYNE", "MEMORANDUM VAN"];
  for (const m of markers) {
    const idx = upper.indexOf(m);
    if (idx >= 0) return text.slice(idx);
  }
  return text;
}

function makeContentHash(subject: string, year: number, paperNumber: number, session: string, language: string, qNum: number): string {
  return createHash("sha256").update(`${subject}|${year}|${paperNumber}|${session}|${language}|${qNum}`).digest("hex");
}

// ────────────────────────────────────────────────────────────
// Catalog helpers
// ────────────────────────────────────────────────────────────
function findMemo(subject: string, year: number, paperNumber: number, session: string, language: string) {
  return catalog.find(e =>
    e.subject === subject &&
    e.year === year &&
    e.paperNumber === paperNumber &&
    e.session === session &&
    e.language === language &&
    e.isMemo === true
  );
}

function findQP(subject: string, year: number, paperNumber: number, session: string, language: string) {
  return catalog.find(e =>
    e.subject === subject &&
    e.year === year &&
    e.paperNumber === paperNumber &&
    e.session === session &&
    e.language === language &&
    e.isMemo !== true
  );
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

// Tuples that need memo text filled (rows already in DB with memo_text=NULL)
const FILL_MEMO_TUPLES = [
  { subject: "Technical Mathematics", year: 2021, paperNumber: 2, session: "May/June", language: "Afrikaans" },
  { subject: "Technical Mathematics", year: 2022, paperNumber: 1, session: "May/June", language: "Afrikaans" },
  { subject: "Technical Mathematics", year: 2022, paperNumber: 2, session: "May/June", language: "Afrikaans" },
  { subject: "Technical Mathematics", year: 2023, paperNumber: 2, session: "May/June", language: "English" },
];

// Tuples that need both QP + memo inserted fresh (rows missing from DB due to force-clear)
const INSERT_FRESH_TUPLES = [
  { subject: "Technical Mathematics", year: 2020, paperNumber: 2, session: "November", language: "Afrikaans" },
  { subject: "Engineering Graphics and Design", year: 2022, paperNumber: 2, session: "May/June", language: "English" },
];

async function fillMemoForExistingRow(t: typeof FILL_MEMO_TUPLES[0]) {
  const memoEntry = findMemo(t.subject, t.year, t.paperNumber, t.session, t.language);
  if (!memoEntry) {
    log(`No memo catalog entry for ${t.subject} ${t.year} P${t.paperNumber} ${t.session} ${t.language}`);
    return;
  }

  log(`Fetching memo for ${t.subject} ${t.year} P${t.paperNumber} ${t.session} ${t.language}`);
  log(`  URL: ${memoEntry.url}`);
  let rawText = "";
  try {
    rawText = await fetchAndParsePDF(memoEntry.url);
  } catch (e: any) {
    log(`  ✗ fetchAndParsePDF error: ${e?.message}`);
    return;
  }

  const memoText = extractMemoSection(rawText);
  if (!memoText || memoText.length < 20) {
    log(`  ✗ No usable memo text (${memoText?.length ?? 0} chars)`);
    return;
  }

  log(`  Memo text: ${memoText.length} chars — updating DB rows...`);
  const result = await db.execute(sql`
    UPDATE dbe_verbatim_questions
    SET memo_text = ${memoText}
    WHERE subject = ${t.subject}
      AND year = ${t.year}
      AND paper_number = ${t.paperNumber}
      AND session = ${t.session}
      AND language = ${t.language}
      AND (memo_text IS NULL OR length(memo_text) < 20)
  `);
  log(`  ✓ Updated ${(result as any).rowCount ?? "?"} rows`);
}

async function insertFreshPaper(t: typeof INSERT_FRESH_TUPLES[0]) {
  const qpEntry = findQP(t.subject, t.year, t.paperNumber, t.session, t.language);
  const memoEntry = findMemo(t.subject, t.year, t.paperNumber, t.session, t.language);

  if (!qpEntry) {
    log(`No QP catalog entry for ${t.subject} ${t.year} P${t.paperNumber} ${t.session} ${t.language}`);
    return;
  }

  log(`\nInserting fresh paper: ${t.subject} ${t.year} P${t.paperNumber} ${t.session} ${t.language}`);

  // Check if already in DB
  const existing = await db.execute(sql`
    SELECT COUNT(*)::int AS cnt FROM dbe_verbatim_questions
    WHERE subject = ${t.subject} AND year = ${t.year}
      AND paper_number = ${t.paperNumber} AND session = ${t.session} AND language = ${t.language}
  `);
  if ((existing.rows[0] as any).cnt > 0) {
    log(`  Already exists in DB, skipping insert`);
    return;
  }

  log(`  Fetching QP: ${qpEntry.url}`);
  let qpText = "";
  try { qpText = await fetchAndParsePDF(qpEntry.url); } catch (e: any) {
    log(`  QP fetch error: ${e?.message}`);
  }

  let memoText: string | null = null;
  if (memoEntry) {
    log(`  Fetching memo: ${memoEntry.url}`);
    try {
      const raw = await fetchAndParsePDF(memoEntry.url);
      const extracted = extractMemoSection(raw);
      if (extracted && extracted.length >= 20) memoText = extracted;
    } catch (e: any) {
      log(`  Memo fetch error: ${e?.message}`);
    }
  }

  const questionText = qpText || `[${t.subject} ${t.year} P${t.paperNumber} ${t.session} ${t.language}]`;
  const contentHash = makeContentHash(t.subject, t.year, t.paperNumber, t.session, t.language, 1);

  await db.execute(sql`
    INSERT INTO dbe_verbatim_questions
      (subject, year, paper_number, session, language, question_number, question_text, memo_text, marks, source_paper_url, source_memo_url, content_hash)
    VALUES
      (${t.subject}, ${t.year}, ${t.paperNumber}, ${t.session}, ${t.language},
       1, ${questionText}, ${memoText}, 0,
       ${qpEntry.url}, ${memoEntry?.url ?? null}, ${contentHash})
    ON CONFLICT DO NOTHING
  `);

  log(`  ✓ Inserted 1 row — QP text: ${qpText?.length ?? 0} chars, memo text: ${memoText?.length ?? 0} chars`);
}

async function main() {
  log("=== Task #713 Targeted Memo Fill ===\n");

  log("--- Filling memo for existing rows ---");
  for (const t of FILL_MEMO_TUPLES) {
    await fillMemoForExistingRow(t);
  }

  log("\n--- Inserting missing paper rows ---");
  for (const t of INSERT_FRESH_TUPLES) {
    await insertFreshPaper(t);
  }

  log("\n--- Running release gate for affected subjects ---");
  const subjects = [
    "Afrikaans Home Language",
    "isiXhosa Second Additional Language",
    "Engineering Graphics and Design",
    "Technical Mathematics",
  ];
  for (const subj of subjects) {
    const results = await releaseEligiblePapers(subj);
    const released = results.filter(r => r.released);
    log(`${subj}: ${released.length}/${results.length} tuples released`);
    for (const r of results) {
      log(`  ${r.released ? "✓" : "✗"} P${r.paperNumber} ${r.session} ${r.language} — memo ${r.memoCoverage}%`);
    }
  }

  log("\n--- Final DB coverage for target years ---");
  const rows = await db.execute(sql`
    SELECT subject, year, paper_number, session, language,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE memo_text IS NOT NULL AND length(memo_text) >= 20)::int AS memo_rows
    FROM dbe_verbatim_questions
    WHERE subject IN (
      'Afrikaans Home Language','isiXhosa Second Additional Language',
      'Engineering Graphics and Design','Technical Mathematics'
    ) AND year IN (2020, 2021, 2022, 2023)
    GROUP BY 1,2,3,4,5 ORDER BY 1,2,3,4,5
  `);
  for (const r of rows.rows as any[]) {
    const pct = Number(r.total) > 0 ? Math.round(100 * Number(r.memo_rows) / Number(r.total)) : 0;
    log(`  ${r.subject} ${r.year} P${r.paper_number} ${r.session} ${r.language}: ${r.memo_rows}/${r.total} = ${pct}%`);
  }

  log("\nDone.");
  process.exit(0);
}

main().catch(err => { log("FATAL", err); process.exit(1); });
