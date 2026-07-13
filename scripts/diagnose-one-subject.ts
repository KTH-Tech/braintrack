/**
 * One-subject ingestion diagnostic — measures true yield & quality for a single
 * subject/year against docs/INGESTION_STANDARDS.md, WITHOUT touching the rest of
 * the corpus. Use this to decide whether the question bank is a "run the script"
 * problem (good yield with a real key) or an extraction-quality problem (#8/#9).
 *
 * Run (needs a real OpenAI key for the OCR path on scanned PDFs):
 *   DATABASE_URL=<db> OPENAI_API_KEY=<real> ENABLE_OCR_FALLBACK=1 \
 *     npx tsx scripts/diagnose-one-subject.ts "Mathematics" 2023
 *
 * Args:  <subject> [year]   — year optional; omit to ingest all years for the subject.
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { runIngestionBatch } from "../server/dbe-ingestion";
import catalogJson from "../server/data/dbe-papers-catalog.json";

const SUBJECT = process.argv[2] || "Mathematics";
const YEAR = process.argv[3] ? Number(process.argv[3]) : undefined;

// Standards thresholds (docs/INGESTION_STANDARDS.md)
const PASS = 0.70, REVIEW = 0.40;      // confidence bands
const MIN_YIELD_PER_PAPER = 3;          // rough floor; real bar is §3 per-subject baseline

const pct = (n: number, d: number) => (d ? Math.round((100 * n) / d) : 0);

async function q(text: string): Promise<any[]> {
  const r = await db.execute(sql.raw(text));
  return (r as any).rows ?? [];
}
const esc = (s: string) => s.replace(/'/g, "''");

async function main() {
  const label = `${SUBJECT}${YEAR ? " " + YEAR : " (all years)"}`;
  console.log(`\n=== Ingestion diagnostic: ${label} ===\n`);

  const catalog = catalogJson as any[];
  const catalogPapers = catalog.filter(
    (e) => e.subject === SUBJECT && !e.isMemo && (YEAR ? e.year === YEAR : true) && e.url,
  ).length;
  console.log(`Catalogued non-memo papers: ${catalogPapers}`);
  if (!catalogPapers) { console.log("No catalogued papers match — check the subject name."); process.exit(1); }

  console.log(`Ingesting (downloads + parses DBE PDFs; OCR=${process.env.ENABLE_OCR_FALLBACK === "1" ? "on" : "OFF"})...\n`);
  const t0 = Date.now();
  const summary = await runIngestionBatch(catalog, { subject: SUBJECT, year: YEAR });
  console.log(`Batch finished in ${((Date.now() - t0) / 1000).toFixed(0)}s — completed ${summary.completed}, failed ${summary.failed}, skipped ${summary.skipped}\n`);

  const yearClause = YEAR ? ` AND year = ${YEAR}` : "";
  const subj = esc(SUBJECT);

  // Coverage (§2)
  const [logs] = await q(
    `SELECT count(*) FILTER (WHERE is_memo=false) AS papers,
            count(*) FILTER (WHERE is_memo=false AND status='completed') AS papers_done,
            count(*) FILTER (WHERE is_memo=true) AS memos,
            count(*) FILTER (WHERE is_memo=true AND status='completed') AS memos_done
     FROM dbe_ingestion_log WHERE subject='${subj}'${yearClause}`);

  // Yield + integrity + confidence (§3/§5/§6)
  const [qs] = await q(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE question_text IS NULL OR length(trim(question_text))=0)::int AS empty,
            count(*) FILTER (WHERE position('\\u0000' in question_text) > 0)::int AS nul_bytes,
            count(*) FILTER (WHERE marks IS NOT NULL)::int AS with_marks,
            count(*) FILTER (WHERE quality_score >= ${PASS})::int AS passed,
            count(*) FILTER (WHERE quality_score >= ${REVIEW} AND quality_score < ${PASS})::int AS review,
            count(*) FILTER (WHERE quality_score < ${REVIEW})::int AS quarantined,
            round(avg(quality_score)::numeric, 2) AS avg_score
     FROM dbe_verbatim_questions WHERE subject='${subj}'${yearClause}`);

  const perPaper = await q(
    `SELECT year, paper_number, count(*)::int AS n
     FROM dbe_verbatim_questions WHERE subject='${subj}'${yearClause}
     GROUP BY year, paper_number ORDER BY year, paper_number`);

  const papers = Number(logs?.papers ?? 0), papersDone = Number(logs?.papers_done ?? 0);
  const memos = Number(logs?.memos ?? 0), memosDone = Number(logs?.memos_done ?? 0);
  const total = Number(qs?.total ?? 0);
  const median = perPaper.length ? perPaper.map((r) => r.n).sort((a, b) => a - b)[Math.floor(perPaper.length / 2)] : 0;

  const line = (ok: boolean, label: string, detail: string) => console.log(`  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(22)} ${detail}`);

  console.log("── Against INGESTION_STANDARDS ──");
  line(pct(papersDone, papers) >= 90, "Coverage §2 papers", `${papersDone}/${papers} (${pct(papersDone, papers)}%, need ≥90%)`);
  line(memos === 0 || pct(memosDone, memos) >= 85, "Coverage §2 memos", `${memosDone}/${memos} (${pct(memosDone, memos)}%, need ≥85%)`);
  line(median >= MIN_YIELD_PER_PAPER, "Yield §3 median/paper", `${median} questions (floor ${MIN_YIELD_PER_PAPER})`);
  line(Number(qs?.nul_bytes ?? 0) === 0 && Number(qs?.empty ?? 0) === 0, "Integrity §5", `${qs?.nul_bytes ?? 0} NUL, ${qs?.empty ?? 0} empty (need 0)`);
  line(total > 0 && pct(Number(qs?.passed ?? 0), total) >= 70, "Confidence §6 passed", `${qs?.passed ?? 0}/${total} ≥0.70 (avg ${qs?.avg_score ?? "n/a"})`);
  console.log(`\n  Total questions: ${total}  |  passed ${qs?.passed ?? 0} · review ${qs?.review ?? 0} · quarantined ${qs?.quarantined ?? 0}`);
  console.log(`  Per-paper yield: ${perPaper.map((r) => `${r.year}P${r.paper_number}=${r.n}`).join("  ") || "(none)"}\n`);

  const verdict = total > 0 && median >= MIN_YIELD_PER_PAPER && pct(papersDone, papers) >= 90;
  console.log(verdict
    ? "VERDICT: healthy yield — this is a 'run the full ingest' problem. Proceed on prod.\n"
    : "VERDICT: low yield — extraction quality is the blocker (#8/#9), not just running the script.\n");

  process.exit(0);
}

main().catch((e) => { console.error("FATAL", e?.message ?? e); process.exit(1); });
