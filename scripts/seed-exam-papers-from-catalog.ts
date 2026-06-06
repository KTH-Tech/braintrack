/**
 * One-shot seed: populate `exam_papers` from the verified DBE papers catalog
 * (`server/data/dbe-papers-catalog.json`).
 *
 * Pairing rules (per QP entry):
 *   1. Memo with the IDENTICAL url (combined QP+memo PDF) wins.
 *   2. Else the first memo from the SAME hostname.
 *   3. Else memo_url is left empty (better than mis-pairing across provinces).
 *
 * Row identity (subject_id, year, month, paper_number, language) is preserved
 * by selecting at most ONE QP per identity — preference order: matching memo
 * available > national DBE source > first-seen.
 *
 * Idempotent: existing rows are not duplicated; if memo_url improves
 * (was empty / mismatched and we now find a same-URL or same-host memo),
 * the existing row is UPDATEd in place.
 *
 * Run:  npx tsx scripts/seed-exam-papers-from-catalog.ts
 */
import { db } from "../server/db";
import { sql, eq, and } from "drizzle-orm";
import { examPapers, subjects as subjectsTable } from "@shared/schema";
import catalogJson from "../server/data/dbe-papers-catalog.json";
import { existsSync, readFileSync } from "fs";

type CatalogEntry = {
  subject: string;
  paperNumber: number;
  isMemo: boolean;
  year: number;
  session: string;
  language: string;
  url: string;
  source?: string;
};

const SUPPLEMENTAL_PATH = "server/data/dbe-papers-catalog-supplemental.json";
function loadSupplemental(): CatalogEntry[] {
  if (!existsSync(SUPPLEMENTAL_PATH)) return [];
  try {
    const raw = JSON.parse(readFileSync(SUPPLEMENTAL_PATH, "utf8")) as any[];
    // Strip extra triage fields, return canonical CatalogEntry shape with source marker.
    return raw.map((e) => ({
      subject: e.subject,
      paperNumber: e.paperNumber,
      isMemo: true,
      year: e.year,
      session: e.session,
      language: e.language,
      url: e.url,
      source: "supplemental",
    }));
  } catch {
    return [];
  }
}

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);
const idKey = (e: { subject: string; year: number; paperNumber: number; session: string; language: string }) =>
  `${e.subject}|${e.year}|${e.paperNumber}|${e.session}|${e.language}`;

function hostOf(u: string): string {
  try { return new URL(u).host; } catch { return ""; }
}
function isOfficialDbe(u: string): boolean {
  return /(^|\.)education\.gov\.za$/i.test(hostOf(u));
}

async function main() {
  const main = catalogJson as CatalogEntry[];
  const supplemental = loadSupplemental();
  log(`Catalog: ${main.length} entries · supplemental: ${supplemental.length} entries`);
  // Supplemental entries are appended; the per-tuple grouping below picks them
  // up automatically. They are pure memos and are matched to their target
  // (subject, year, paperNumber, language) by identity key.
  const catalog = [...main, ...supplemental];

  const subjects = await db.select().from(subjectsTable);
  const subjectByName = new Map(subjects.map(s => [s.name, s.id]));
  log(`Subjects in DB: ${subjects.length}`);

  // Group catalog entries by identity key
  const groups = new Map<string, { qps: CatalogEntry[]; memos: CatalogEntry[] }>();
  for (const e of catalog) {
    const k = idKey(e);
    const g = groups.get(k) ?? { qps: [], memos: [] };
    if (e.isMemo) g.memos.push(e); else g.qps.push(e);
    groups.set(k, g);
  }
  log(`Distinct identity keys: ${groups.size}`);

  // For each identity, pick the best (qp, memo) pair using safe rules
  type Pick = { qp: CatalogEntry; memo: CatalogEntry | null };
  const picks: Pick[] = [];
  let qpCount = 0, memoCount = 0, noMemoForGroup = 0;
  for (const { qps, memos } of groups.values()) {
    if (qps.length === 0) continue;

    // Rank candidates: (1) has same-url memo, (2) is official DBE, (3) first-seen
    const ranked = qps.slice().sort((a, b) => {
      const aSameUrl = memos.some(m => m.url === a.url) ? 1 : 0;
      const bSameUrl = memos.some(m => m.url === b.url) ? 1 : 0;
      if (aSameUrl !== bSameUrl) return bSameUrl - aSameUrl;
      const aOff = isOfficialDbe(a.url) ? 1 : 0;
      const bOff = isOfficialDbe(b.url) ? 1 : 0;
      if (aOff !== bOff) return bOff - aOff;
      return 0;
    });
    const qp = ranked[0];

    // Pair memo: same URL > same host > supplemental > none
    const sameUrl = memos.find(m => m.url === qp.url) ?? null;
    const sameHost = sameUrl ?? memos.find(m => hostOf(m.url) === hostOf(qp.url)) ?? null;
    const supplementalMemo = memos.find(m => m.source === "supplemental") ?? null;
    const memo = sameHost ?? supplementalMemo;

    if (memo) memoCount++; else if (memos.length > 0) noMemoForGroup++;
    qpCount++;
    picks.push({ qp, memo });
  }
  log(`Picks: qps=${qpCount}, with memo=${memoCount}, memo cross-source skipped=${noMemoForGroup}`);

  // Pre-load existing rows
  const existing = await db.execute(sql`
    SELECT id, subject_id, year, month, paper_number, language, COALESCE(memo_url,'') AS memo_url, COALESCE(paper_url,'') AS paper_url
    FROM exam_papers
  `);
  type Row = { id: number; subject_id: number; year: number; month: string; paper_number: number; language: string; memo_url: string; paper_url: string };
  const existingByKey = new Map<string, Row>();
  for (const r of existing.rows as any[]) {
    const k = `${r.subject_id}|${r.year}|${r.month}|${r.paper_number}|${r.language}`;
    existingByKey.set(k, r as Row);
  }
  log(`Existing exam_papers rows: ${existingByKey.size}`);

  let inserted = 0, updated = 0, unchanged = 0, skippedNoSubject = 0;
  const missingSubjects = new Set<string>();
  const insertBatch: any[] = [];
  const updateOps: Array<{ id: number; memoUrl: string; paperUrl: string }> = [];

  for (const { qp, memo } of picks) {
    const subjectId = subjectByName.get(qp.subject);
    if (!subjectId) { skippedNoSubject++; missingSubjects.add(qp.subject); continue; }

    const k = `${subjectId}|${qp.year}|${qp.session}|${qp.paperNumber}|${qp.language}`;
    const memoUrl = memo?.url ?? "";
    const existingRow = existingByKey.get(k);

    if (!existingRow) {
      insertBatch.push({
        subjectId,
        year: qp.year,
        month: qp.session,
        paperNumber: qp.paperNumber,
        language: qp.language,
        paperUrl: qp.url,
        memoUrl,
        source: "DBE",
        sourceLink: qp.url,
      });
    } else {
      // Update memo_url when:
      //  (a) supplemental memo and existing memo_url is empty (Task #391 — fills
      //      DBE-never-published gaps), OR
      //  (b) we now have a better (same-host or same-url) memo and existing is
      //      empty or cross-host.
      const existingHost = hostOf(existingRow.memo_url);
      const newHost = hostOf(memoUrl);
      const qpHost = hostOf(existingRow.paper_url || qp.url);
      const existingIsBad = !existingRow.memo_url || (existingHost && qpHost && existingHost !== qpHost);
      const newIsBetter = !!memoUrl && newHost === qpHost;
      const supplementalFill = !!memoUrl && memo?.source === "supplemental" && !existingRow.memo_url;
      if ((supplementalFill || (existingIsBad && newIsBetter)) && existingRow.memo_url !== memoUrl) {
        updateOps.push({ id: existingRow.id, memoUrl, paperUrl: existingRow.paper_url });
      } else {
        unchanged++;
      }
    }
  }

  log(`Plan: insert=${insertBatch.length}, update=${updateOps.length}, unchanged=${unchanged}, skipped(no subject)=${skippedNoSubject}`);
  if (missingSubjects.size) log(`Subjects missing from DB:`, [...missingSubjects].sort().join(", "));

  const CHUNK = 200;
  for (let i = 0; i < insertBatch.length; i += CHUNK) {
    const slice = insertBatch.slice(i, i + CHUNK);
    await db.insert(examPapers).values(slice).onConflictDoNothing();
    inserted += slice.length;
    log(`  inserted ${inserted}/${insertBatch.length}`);
  }
  for (const op of updateOps) {
    await db.update(examPapers).set({ memoUrl: op.memoUrl }).where(eq(examPapers.id, op.id));
    updated++;
  }
  log(`  updated ${updated} memo_url values`);

  const after = await db.execute(sql`
    SELECT s.name, COUNT(p.*)::int AS papers,
           COUNT(*) FILTER (WHERE COALESCE(p.memo_url,'') <> '')::int AS with_memo
    FROM subjects s
    LEFT JOIN exam_papers p ON p.subject_id = s.id
    GROUP BY s.name
    ORDER BY papers DESC, s.name
  `);
  log(`\n=== final per-subject counts ===`);
  for (const r of after.rows as any[]) {
    log(`  ${String(r.name).padEnd(40)} papers=${String(r.papers).padStart(4)}  memos=${String(r.with_memo).padStart(4)}`);
  }
  const totals = await db.execute(sql`SELECT COUNT(*)::int AS papers, COUNT(*) FILTER (WHERE COALESCE(memo_url,'')<>'')::int AS memos FROM exam_papers`);
  log(`TOTAL: ${JSON.stringify(totals.rows[0])}`);
  process.exit(0);
}

main().catch(err => { log("FATAL", err); process.exit(1); });
