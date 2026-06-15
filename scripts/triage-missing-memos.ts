/**
 * Triage report — groups dbe_verbatim_questions rows whose memo_text is
 * NULL or effectively empty (length(trim) < 10) by subject + year + paper +
 * language, with a flag for whether a memo URL was originally captured.
 *
 * Output:  reports/missing-memos-triage.csv  (sorted by missing DESC)
 *          reports/missing-memos-triage.json (machine-readable)
 *
 * Run:     npx tsx scripts/triage-missing-memos.ts
 *
 * The same data is also surfaced via
 *   GET /api/admin/dbe-ingestion/missing-memos
 * for the Admin DBE console.
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import catalogJson from "../server/data/dbe-papers-catalog.json";
import { existsSync, readFileSync as _readFileSync } from "fs";

const SUPPLEMENTAL_PATH = "server/data/dbe-papers-catalog-supplemental.json";
function loadSupplementalMemos(): any[] {
  if (!existsSync(SUPPLEMENTAL_PATH)) return [];
  try { return JSON.parse(_readFileSync(SUPPLEMENTAL_PATH, "utf8")); } catch { return []; }
}

interface MissingRow {
  subject: string;
  year: number;
  paperNumber: number;
  language: string;
  missing: number;
  total: number;
  withMemoUrl: number;
  noMemoUrl: number;
  qpUrl: string | null;
  memoUrl: string | null;
  catalogHasMemo: boolean;
}

function csvCell(v: any): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  console.log("[triage] Querying memo-less questions…");

  const grouped = await db.execute(sql`
    SELECT
      subject,
      year,
      paper_number AS paperNumber,
      language,
      COUNT(*)::int                                                              AS missing,
      COUNT(*) FILTER (WHERE source_memo_url IS NOT NULL AND source_memo_url <> '')::int AS with_memo_url,
      COUNT(*) FILTER (WHERE source_memo_url IS NULL OR source_memo_url = '')::int       AS no_memo_url,
      MAX(source_paper_url)                                                       AS qp_url,
      MAX(source_memo_url)                                                        AS memo_url
    FROM dbe_verbatim_questions
    WHERE memo_text IS NULL OR length(trim(memo_text)) < 10
    GROUP BY 1, 2, 3, 4
    ORDER BY missing DESC
  `);

  const totals = await db.execute(sql`
    SELECT
      subject, year, paper_number AS paperNumber, language,
      COUNT(*)::int AS total
    FROM dbe_verbatim_questions
    GROUP BY 1, 2, 3, 4
  `);
  const totalMap = new Map<string, number>();
  for (const r of totals.rows as any[]) {
    totalMap.set(`${r.subject}|${r.year}|${r.papernumber ?? r.paperNumber}|${r.language}`, Number(r.total));
  }

  const catalog = [...(catalogJson as any[]), ...loadSupplementalMemos()];
  const catalogMemoSet = new Set<string>();
  for (const e of catalog) {
    if (e.isMemo) {
      catalogMemoSet.add(`${e.subject}|${e.year}|${e.paperNumber}|${e.language ?? ""}`);
    }
  }

  const rows: MissingRow[] = (grouped.rows as any[]).map((r) => {
    const key = `${r.subject}|${r.year}|${r.papernumber ?? r.paperNumber}|${r.language}`;
    return {
      subject: r.subject,
      year: Number(r.year),
      paperNumber: Number(r.papernumber ?? r.paperNumber),
      language: r.language,
      missing: Number(r.missing),
      total: totalMap.get(key) ?? Number(r.missing),
      withMemoUrl: Number(r.with_memo_url),
      noMemoUrl: Number(r.no_memo_url),
      qpUrl: r.qp_url ?? null,
      memoUrl: r.memo_url ?? null,
      catalogHasMemo: catalogMemoSet.has(
        `${r.subject}|${r.year}|${r.papernumber ?? r.paperNumber}|${r.language}`,
      ),
    };
  });

  // ── CSV ─────────────────────────────────────────────────────────
  const header = [
    "subject",
    "year",
    "paper_number",
    "language",
    "missing_memo_questions",
    "total_questions",
    "memo_coverage_pct",
    "rows_with_memo_url",
    "rows_without_memo_url",
    "catalog_has_memo",
    "qp_url",
    "memo_url",
    "remediation_hint",
  ];
  // Papers where DBE intentionally publishes no separate memo PDF.
  // Add entries as { subject, paperNumber } — all years and languages are covered.
  //
  // Before adding a new entry, confirm:
  //  1. The DBE catalog has ZERO memo entries for this subject+paper across ALL years.
  //  2. An authoritative source explains why (embedded rubric, portfolio submission, etc.).
  //  3. Document the finding in docs/design-p2-no-memo.md under "Confirmed No-Memo Papers".
  //
  // Subjects investigated in Task #549 (May 2026) but NOT added as all-year exemptions:
  //   Visual Arts P2  — DBE published a separate memo PDF ONLY for 2023. Every other
  //                     year (2015, 2020, 2021, 2024, 2025) is confirmed absent on the
  //                     live DBE site (Task #715). Handled below as a YEAR-SPECIFIC
  //                     exemption so 2023 still triages as a real (resolvable) memo while
  //                     the no-memo years emit MEMO_NOT_PUBLISHED_BY_DBE.
  //   Music P2        — full memo coverage 2015-2025; not a no-memo paper.
  //   Dramatic Arts P2 — no P2 paper exists in the NSC written exam structure.
  //   Dance Studies P2 — no P2 paper exists in the NSC written exam structure.
  //
  // See docs/design-p2-no-memo.md for full investigation details.
  const KNOWN_NO_MEMO_PAPERS: Array<{ subject: string; paperNumber: number }> = [
    // Design P2 is a creative portfolio submission assessed by an embedded rubric.
    // Confirmed exhaustively in Task #389 — no memo PDF exists on DBE or any mirror site.
    // Catalog analysis (Task #549): 12 QP entries, 0 memo entries across all years.
    { subject: "Design", paperNumber: 2 },
    // isiXhosa Home Language P3 is a creative writing task. DBE applies the rubric
    // from the official SAG document — no separate memo PDF is published for any year.
    // Stand-in creative writing guidance is seeded via scripts/seed-isixhosa-p3-guidance.ts
    // (Task #650 — May 2026). See docs/isixhosa-p3-creative-writing-guidance.md.
    { subject: "isiXhosa Home Language", paperNumber: 3 },
  ];

  // Year-specific no-memo exemptions: papers where DBE published a separate memo
  // PDF for SOME years but not others. Only the listed years are exempted; any
  // other year for the same subject+paper still triages as a real (resolvable)
  // memo gap. Add entries as { subject, paperNumber, years: [...] }.
  const KNOWN_NO_MEMO_PAPER_YEARS: Array<{
    subject: string;
    paperNumber: number;
    years: number[];
  }> = [
    // Visual Arts P2 — DBE published a separate memo PDF ONLY for 2023. The
    // 2015, 2020, 2021, 2024 and 2025 papers have NO separate memo on the live
    // DBE site (confirmed Task #715). 2023 is intentionally excluded so it keeps
    // triaging as a real memo. See docs/design-p2-no-memo.md.
    { subject: "Visual Arts", paperNumber: 2, years: [2015, 2020, 2021, 2024, 2025] },
  ];

  function isKnownNoMemo(r: MissingRow): boolean {
    if (
      KNOWN_NO_MEMO_PAPERS.some(
        (e) => e.subject === r.subject && e.paperNumber === r.paperNumber,
      )
    ) {
      return true;
    }
    return KNOWN_NO_MEMO_PAPER_YEARS.some(
      (e) =>
        e.subject === r.subject &&
        e.paperNumber === r.paperNumber &&
        e.years.includes(r.year),
    );
  }

  const csvLines = [header.join(",")];
  for (const r of rows) {
    const coveragePct = r.total > 0 ? Math.round(((r.total - r.missing) / r.total) * 100) : 0;
    let hint = "";
    if (isKnownNoMemo(r)) {
      hint = "MEMO_NOT_PUBLISHED_BY_DBE — portfolio/practical submission assessed by embedded rubric; no memo PDF exists";
    } else if (!r.memoUrl && !r.catalogHasMemo) {
      hint = "MEMO_MISSING_FROM_CATALOG — manually source memo PDF";
    } else if (!r.memoUrl && r.catalogHasMemo) {
      hint = "MEMO_IN_CATALOG_NOT_LINKED — re-ingest with force to re-pair";
    } else if (r.withMemoUrl > 0) {
      hint = "MEMO_PDF_EXTRACTION_FAILED — re-ingest with force, or OCR fallback";
    }
    csvLines.push(
      [
        csvCell(r.subject),
        csvCell(r.year),
        csvCell(r.paperNumber),
        csvCell(r.language),
        csvCell(r.missing),
        csvCell(r.total),
        csvCell(coveragePct),
        csvCell(r.withMemoUrl),
        csvCell(r.noMemoUrl),
        csvCell(r.catalogHasMemo ? "yes" : "no"),
        csvCell(r.qpUrl),
        csvCell(r.memoUrl),
        csvCell(hint),
      ].join(","),
    );
  }

  const csvPath = "reports/missing-memos-triage.csv";
  const jsonPath = "reports/missing-memos-triage.json";
  mkdirSync(dirname(csvPath), { recursive: true });
  writeFileSync(csvPath, csvLines.join("\n") + "\n", "utf8");
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        groupCount: rows.length,
        totalMemoLessQuestions: rows.reduce((a, r) => a + r.missing, 0),
        rows,
      },
      null,
      2,
    ),
    "utf8",
  );

  // ── Console summary (top 20 + per-subject totals) ───────────────
  const totalMissing = rows.reduce((a, r) => a + r.missing, 0);
  console.log(`\n[triage] ${rows.length} (subject, year, paper, language) groups · ${totalMissing} memo-less questions`);
  console.log(`[triage] CSV  → ${csvPath}`);
  console.log(`[triage] JSON → ${jsonPath}`);

  console.log("\nTop 20 worst-affected papers:");
  console.log("subject | year | paper | language | missing | catalogMemo? | hasMemoUrl?");
  for (const r of rows.slice(0, 20)) {
    console.log(
      `  ${r.subject} | ${r.year} | P${r.paperNumber} | ${r.language} | ${r.missing} | ${r.catalogHasMemo} | ${!!r.memoUrl}`,
    );
  }

  const bySubject = new Map<string, number>();
  for (const r of rows) bySubject.set(r.subject, (bySubject.get(r.subject) ?? 0) + r.missing);
  const sorted = [...bySubject.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  console.log("\nTop 10 most-affected subjects:");
  for (const [s, n] of sorted) console.log(`  ${s}: ${n}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("[triage] FATAL", err);
  process.exit(1);
});
