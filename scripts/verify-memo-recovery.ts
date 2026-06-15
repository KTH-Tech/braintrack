/**
 * Verification report for Task #369 — compares the baseline memo-coverage
 * snapshot (reports/missing-memos-baseline.json) against current DB state
 * and writes the result to reports/missing-memos-recovery.md.
 *
 * Also runs the verification SQL from the task description and includes
 * its output verbatim.
 *
 * Run:   npx tsx scripts/verify-memo-recovery.ts
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";

const TOP5 = [
  "Life Sciences",
  "Electrical Technology",
  "Mechanical Technology",
  "Physical Sciences",
  "Agricultural Sciences",
];

interface BaselineSnapshot {
  capturedAt: string;
  overall: string;
  by2024_2025: string;
  top5Subjects: string;
}

function parseTwoColCsv(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = s.trim().split("\n");
  if (lines.length < 2) return out;
  const headers = lines[0].split(",");
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",");
    out[`row_${i}_${cells[0]}`] = headers.map((h, j) => `${h}=${cells[j] ?? ""}`).join("; ");
  }
  return out;
}

async function main() {
  const baselinePath = "reports/missing-memos-baseline.json";
  const reportPath = "reports/missing-memos-recovery.md";
  mkdirSync(dirname(reportPath), { recursive: true });

  if (!existsSync(baselinePath)) {
    console.error(
      `[verify] Baseline missing: ${baselinePath}. Re-create one before targeted re-ingestion to enable before/after diffs.`,
    );
  }
  const baseline: BaselineSnapshot | null = existsSync(baselinePath)
    ? JSON.parse(readFileSync(baselinePath, "utf8"))
    : null;

  // ── Current snapshot ──────────────────────────────────────────
  const overall = await db.execute(sql`
    SELECT
      (SELECT COUNT(*)::int FROM dbe_verbatim_questions) AS total_questions,
      (SELECT COUNT(*)::int FROM dbe_verbatim_questions
        WHERE memo_text IS NULL OR length(trim(memo_text)) < 10) AS missing_memo
  `);
  const oRow = overall.rows[0] as any;
  const totalNow = Number(oRow.total_questions);
  const missingNow = Number(oRow.missing_memo);
  const coverageNow = totalNow > 0 ? Math.round(((totalNow - missingNow) / totalNow) * 100) : 0;

  const recent = await db.execute(sql`
    SELECT year,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE memo_text IS NULL OR length(trim(memo_text)) < 10)::int AS missing
    FROM dbe_verbatim_questions
    WHERE year IN (2024, 2025)
    GROUP BY year ORDER BY year
  `);
  const top5 = await db.execute(sql`
    SELECT subject,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE memo_text IS NULL OR length(trim(memo_text)) < 10)::int AS missing
    FROM dbe_verbatim_questions
    WHERE subject IN (${sql.join(TOP5.map((s) => sql`${s}`), sql`, `)})
    GROUP BY subject ORDER BY missing DESC
  `);

  // ── Required verification SQL from task description ───────────
  const taskSql = await db.execute(sql`
    SELECT subject, year, paper_number, COUNT(*)::int AS missing
    FROM dbe_verbatim_questions
    WHERE memo_text IS NULL OR length(trim(memo_text)) < 10
    GROUP BY 1, 2, 3
    ORDER BY 4 DESC
    LIMIT 30
  `);

  // ── State file from re-ingestion runner ──────────────────────
  const statePath = "/tmp/reingest-priority-state.json";
  let stateSummary = "";
  if (existsSync(statePath)) {
    try {
      const state = JSON.parse(readFileSync(statePath, "utf8"));
      const done = (state.done ?? []).length;
      const failed = (state.failed ?? []).length;
      const results = state.results ?? [];
      const improved = results.filter(
        (r: any) =>
          r.memoCoveragePctBefore !== null &&
          r.memoCoveragePctAfter > (r.memoCoveragePctBefore ?? 0),
      );
      const totalDelta = results.reduce(
        (a: number, r: any) =>
          a + Math.max(0, (r.memoCoveragePctAfter ?? 0) - (r.memoCoveragePctBefore ?? 0)),
        0,
      );
      stateSummary =
        `- Cumulative successful tuples: **${done}**\n` +
        `- Pending retry (failed last pass): **${failed}**\n` +
        `- Tuples with improved memo coverage: **${improved.length} / ${results.length}**\n` +
        `- Sum of memo-coverage % gains across tuples: **${totalDelta}**`;
    } catch (e: any) {
      stateSummary = `- State file unreadable: ${e?.message}`;
    }
  } else {
    stateSummary = "- No state file yet (re-ingestion has not produced any results)";
  }

  // ── Render report ────────────────────────────────────────────
  const lines: string[] = [];
  lines.push(`# Task #369 — Memo Recovery Verification`);
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`## Overall coverage`);
  lines.push(`- Total verbatim questions: **${totalNow.toLocaleString()}**`);
  lines.push(`- Memo-less questions: **${missingNow.toLocaleString()}**`);
  lines.push(`- Memo coverage: **${coverageNow}%**`);
  if (baseline) {
    lines.push("");
    lines.push(`### Baseline (captured ${baseline.capturedAt})`);
    lines.push("```");
    lines.push(baseline.overall.trim());
    lines.push("```");
  }
  lines.push("");
  lines.push(`## 2024 + 2025 NSC papers`);
  lines.push(``);
  lines.push(`| Year | Total | Missing memo | Coverage % |`);
  lines.push(`|------|------:|-------------:|-----------:|`);
  for (const r of recent.rows as any[]) {
    const t = Number(r.total);
    const m = Number(r.missing);
    const cov = t > 0 ? Math.round(((t - m) / t) * 100) : 0;
    lines.push(`| ${r.year} | ${t} | ${m} | ${cov}% |`);
  }
  if (baseline) {
    lines.push("");
    lines.push(`### Baseline 2024–2025`);
    lines.push("```");
    lines.push(baseline.by2024_2025.trim());
    lines.push("```");
  }
  lines.push("");
  lines.push(`## Top-5 most-affected subjects (re-ingest scope)`);
  lines.push(``);
  lines.push(`| Subject | Total | Missing memo | Coverage % |`);
  lines.push(`|---------|------:|-------------:|-----------:|`);
  for (const r of top5.rows as any[]) {
    const t = Number(r.total);
    const m = Number(r.missing);
    const cov = t > 0 ? Math.round(((t - m) / t) * 100) : 0;
    lines.push(`| ${r.subject} | ${t} | ${m} | ${cov}% |`);
  }
  if (baseline) {
    lines.push("");
    lines.push(`### Baseline top-5`);
    lines.push("```");
    lines.push(baseline.top5Subjects.trim());
    lines.push("```");
  }
  lines.push("");
  lines.push(`## Re-ingestion runner state`);
  lines.push(stateSummary);
  lines.push("");
  lines.push(
    `## Verification SQL (top-30 worst remaining papers)`,
  );
  lines.push("");
  lines.push("```sql");
  lines.push(
    `SELECT subject, year, paper_number, count(*) FROM dbe_verbatim_questions\n WHERE memo_text IS NULL OR length(trim(memo_text)) < 10\n GROUP BY 1,2,3 ORDER BY 4 DESC;`,
  );
  lines.push("```");
  lines.push("");
  lines.push("```");
  lines.push("subject | year | paper | missing");
  for (const r of taskSql.rows as any[]) {
    lines.push(`${r.subject} | ${r.year} | ${r.paper_number} | ${r.missing}`);
  }
  lines.push("```");
  lines.push("");
  lines.push(`## Notes`);
  lines.push(
    `- Re-ingestion alone cannot recover memos whose source PDF is a scanned image.`,
  );
  lines.push(
    `- The OCR fallback in \`server/dbe-ingestion.ts:fetchAndParsePDF\` (gated by \`ENABLE_OCR_FALLBACK=1\`) routes such PDFs to OpenAI vision for text recovery; enable it on the next pass to close the residual gap.`,
  );
  lines.push(
    `- Rows where \`source_memo_url\` is NULL fall under follow-up #385 (re-scrape DBE for missing memo links) — re-ingestion can't help them.`,
  );

  writeFileSync(reportPath, lines.join("\n") + "\n", "utf8");
  console.log(`[verify] Wrote ${reportPath}`);
  console.log(`[verify] Coverage: ${coverageNow}% (${(totalNow - missingNow).toLocaleString()}/${totalNow.toLocaleString()})`);

  process.exit(0);
}

main().catch((err) => {
  console.error("[verify] FATAL", err);
  process.exit(1);
});
