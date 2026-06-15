/**
 * Task #391 — Discover memo PDFs for the (subject, year, paper, language)
 * tuples flagged MEMO_MISSING_FROM_CATALOG in `reports/missing-memos-triage.csv`.
 *
 * Strategy (per missing tuple):
 *   1. Try to find a memo at:
 *        a. saexampapers mirror  (server/data/dbe-papers-catalog-saexampapers.json)
 *        b. dbe-archive mirror   (server/data/dbe-papers-catalog-dbe-archive.json)
 *        c. stanmore mirror      (server/data/dbe-papers-catalog-stanmore.json)
 *        d. cross-language fallback in the main DBE catalog
 *           (e.g. English memo for an Afrikaans Physical-Sciences paper —
 *            mark allocations are language-agnostic for non-language subjects).
 *   2. Probe each candidate URL — download via fetchAndParsePDF and require
 *      `splitByQuestionHeaders()` to find ≥ 3 QUESTION sections (matches what
 *      the live ingester uses). If no candidate passes, the tuple is skipped.
 *   3. Emit `server/data/dbe-papers-catalog-supplemental.json` containing the
 *      verified memo entries in the same shape as the main catalog (plus a
 *      `source: "supplemental"` marker so the seeder can treat them with
 *      higher priority).
 *
 * Cross-language memos are NOT used for language subjects (Home/FAL/SAL,
 * isiXhosa, Setswana, Sepedi, etc.) where memos are inherently language-bound.
 *
 * Run:  npx tsx scripts/find-missing-memos.ts
 *       (--dry-run to skip writing the output file; --limit=N to cap probes;
 *        --no-probe to trust mirrors without HTTP verification — useful when
 *        the network is slow but reduces output quality)
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { fetchAndParsePDF, splitByQuestionHeaders } from "../server/dbe-ingestion";

interface CatalogEntry {
  subject: string;
  paperNumber: number;
  isMemo: boolean;
  year: number;
  session: string;
  language: string;
  url: string;
  linkText?: string;
  source?: string;
}

interface MissingRow {
  subject: string;
  year: number;
  paperNumber: number;
  language: string;
  missing: number;
  total: number;
  qpUrl: string | null;
  memoUrl: string | null;
  catalogHasMemo: boolean;
}

interface SupplementalEntry extends CatalogEntry {
  source: "supplemental";
  origin: "saexampapers" | "dbe-archive" | "stanmore" | "cross-language";
  forSubject: string;
  forYear: number;
  forPaperNumber: number;
  forLanguage: string;
  qpUrl: string | null;
  probe: { questionsFound: number; textChars: number };
}

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

const NO_PROBE = process.argv.includes("--no-probe");
const DRY_RUN = process.argv.includes("--dry-run");
const RESET = process.argv.includes("--reset");
const LIMIT = (() => {
  const a = process.argv.find((x) => x.startsWith("--limit="));
  return a ? parseInt(a.split("=")[1], 10) : Number.POSITIVE_INFINITY;
})();

// ─── Subject-name normalisation across mirrors ────────────────────
// Map mirror subject names → canonical name used by the main catalog.
const SUBJECT_ALIASES: Record<string, string> = {
  // dbe-archive abbreviations
  "Afrikaans HL": "Afrikaans Home Language",
  "Afrikaans FAL": "Afrikaans First Additional Language",
  "Afrikaans SAL": "Afrikaans Second Additional Language",
  "English HL": "English Home Language",
  "English FAL": "English First Additional Language",
  "IsiNdebele HL": "isiNdebele Home Language",
  "IsiNdebele FAL": "isiNdebele First Additional Language",
  "IsiNdebele SAL": "isiNdebele Second Additional Language",
  "IsiXhosa HL": "isiXhosa Home Language",
  "IsiXhosa FAL": "isiXhosa First Additional Language",
  "IsiXhosa SAL": "isiXhosa Second Additional Language",
  "IsiZulu HL": "isiZulu Home Language",
  "IsiZulu FAL": "isiZulu First Additional Language",
  "IsiZulu SAL": "isiZulu Second Additional Language",
  "Sepedi HL": "Sepedi Home Language",
  "Sepedi FAL": "Sepedi First Additional Language",
  "Sepedi SAL": "Sepedi Second Additional Language",
  "Sesotho HL": "Sesotho Home Language",
  "Sesotho FAL": "Sesotho First Additional Language",
  "Sesotho SAL": "Sesotho Second Additional Language",
  "Setswana HL": "Setswana Home Language",
  "Setswana FAL": "Setswana First Additional Language",
  "Siswati HL": "siSwati Home Language",
  "Siswati FAL": "siSwati First Additional Language",
  "Tshivenda HL": "Tshivenda Home Language",
  "Tshivenda FAL": "Tshivenda First Additional Language",
  "Xitsonga HL": "Xitsonga Home Language",
  "Xitsonga FAL": "Xitsonga First Additional Language",
  "Engineering Graphic and Design": "Engineering Graphics and Design",
};
const normaliseSubject = (s: string): string => SUBJECT_ALIASES[s] ?? s;

// Subjects whose memos are inherently language-bound — never cross-language fall back.
const LANGUAGE_SUBJECT = (s: string): boolean =>
  /Home Language|First Additional Language|Second Additional Language/i.test(s) ||
  /^(Sepedi|Sesotho|Setswana|Tshivenda|Xitsonga|isiNdebele|isiXhosa|isiZulu|siSwati|Afrikaans|English)\b/.test(s);

function loadCatalog(path: string): CatalogEntry[] {
  return JSON.parse(readFileSync(path, "utf8")) as CatalogEntry[];
}

function indexMemosByTuple(entries: CatalogEntry[]): Map<string, CatalogEntry[]> {
  const m = new Map<string, CatalogEntry[]>();
  for (const e of entries) {
    if (!e.isMemo) continue;
    const subj = normaliseSubject(e.subject);
    const key = `${subj}|${e.year}|${e.paperNumber}|${e.language}`;
    const arr = m.get(key) ?? [];
    arr.push(e);
    m.set(key, arr);
  }
  return m;
}

function indexAnyMemoBySubjectYearPaper(entries: CatalogEntry[]): Map<string, CatalogEntry[]> {
  const m = new Map<string, CatalogEntry[]>();
  for (const e of entries) {
    if (!e.isMemo) continue;
    const subj = normaliseSubject(e.subject);
    const key = `${subj}|${e.year}|${e.paperNumber}`;
    const arr = m.get(key) ?? [];
    arr.push(e);
    m.set(key, arr);
  }
  return m;
}

/**
 * Reject candidates whose URL/linkText clearly references a different subject
 * than the target tuple. Catches mirror-catalog mis-classifications such as a
 * "Afrikaans-FAL-...-P1.pdf" URL being indexed under "Afrikaans Home Language"
 * (the bug that produced the bad Afrikaans HL 2020 P1 entry in the first run
 * of Task #391). Returns null if the candidate is fine; returns a string
 * reason if it must be rejected.
 */
function tupleMismatch(target: { subject: string; year: number; paperNumber: number }, url: string, linkText?: string): string | null {
  const hay = (decodeURIComponent(url) + " " + (linkText ?? "")).toLowerCase();
  // Language-stream cross-contamination: HL ↔ FAL ↔ SAL.
  const isHL = /\b(home\s*language|-hl[-_.]|\bhl\b)/.test(hay);
  const isFAL = /\b(first\s*additional|-fal[-_.]|\bfal\b)/.test(hay);
  const isSAL = /\b(second\s*additional|-sal[-_.]|\bsal\b)/.test(hay);
  const subHL = /home language/i.test(target.subject);
  const subFAL = /first additional/i.test(target.subject);
  const subSAL = /second additional/i.test(target.subject);
  if (subHL && (isFAL || isSAL)) return "URL/linkText hints FAL/SAL but target is Home Language";
  if (subFAL && (isHL || isSAL)) return "URL/linkText hints HL/SAL but target is FAL";
  if (subSAL && (isHL || isFAL)) return "URL/linkText hints HL/FAL but target is SAL";
  // Year mismatch in URL filename.
  const yrs = [...hay.matchAll(/\b(20\d{2})\b/g)].map((m) => parseInt(m[1])).filter((y) => y >= 2010 && y <= 2030);
  if (yrs.length && !yrs.includes(target.year)) return `URL years ${yrs.join(",")} ≠ target year ${target.year}`;
  // Paper-number mismatch.
  const pm = hay.match(/\bp([1-5])\b|paper[-_ ]?([1-5])/);
  if (pm) {
    const up = parseInt(pm[1] ?? pm[2]);
    if (up !== target.paperNumber) return `URL paper P${up} ≠ target P${target.paperNumber}`;
  }
  return null;
}

async function probeMemoPdf(url: string): Promise<{ ok: boolean; questionsFound: number; textChars: number; reason?: string }> {
  if (NO_PROBE) return { ok: true, questionsFound: 99, textChars: 0 };
  try {
    const text = await fetchAndParsePDF(url, 1);
    if (!text || text.trim().length < 200) {
      return { ok: false, questionsFound: 0, textChars: text?.length ?? 0, reason: "text too short" };
    }
    const sections = splitByQuestionHeaders(text);
    // Match the live ingester's threshold: ≥ 2 sections is enough to slice memos.
    // Also accept long bodies (≥ 4000 chars) with ≥ 1 section, which covers
    // memos using a single "MEMORANDUM" header followed by sub-question bodies.
    // Finally accept memos with NO QUESTION headers but heavy sub-question
    // numbering (e.g. Mathematics / Mathematical Literacy memos that print
    // "1.1 ✓ ✓ 12" without a "QUESTION 1" line) — at least 8 distinct
    // X.Y patterns and ≥ 4000 chars of text. These get linked into
    // exam_papers so the triage downgrades them from MEMO_MISSING_FROM_CATALOG
    // to MEMO_PDF_EXTRACTION_FAILED (a separate, downstream remediation).
    const subNums = new Set<string>();
    const subRe = /(?:^|\n)\s*(\d{1,2}\.\d{1,2})(?:\.\d{1,2})?\b/g;
    let sm: RegExpExecArray | null;
    while ((sm = subRe.exec(text)) !== null) subNums.add(sm[1]);
    const okSubNumberHeavy = subNums.size >= 8 && text.length >= 4000;
    const ok = sections.size >= 2 || (sections.size >= 1 && text.length >= 4000) || okSubNumberHeavy;
    return {
      ok,
      questionsFound: sections.size,
      textChars: text.length,
      reason: ok ? undefined : `only ${sections.size} QUESTION headers, ${subNums.size} sub-numbers`,
    };
  } catch (e: any) {
    return { ok: false, questionsFound: 0, textChars: 0, reason: e?.message ?? String(e) };
  }
}

async function main() {
  const triagePath = "reports/missing-memos-triage.json";
  const triage = JSON.parse(readFileSync(triagePath, "utf8"));
  const allRows: MissingRow[] = triage.rows;

  // Pull only MEMO_MISSING_FROM_CATALOG groups
  // The triage report doesn't store the hint, recompute it (no memoUrl + !catalogHasMemo).
  const targets = allRows.filter((r) => !r.memoUrl && !r.catalogHasMemo);
  log(`Targets: ${targets.length} MEMO_MISSING_FROM_CATALOG groups (${targets.reduce((a, r) => a + r.missing, 0)} questions)`);

  const main = loadCatalog("server/data/dbe-papers-catalog.json");
  const sa = loadCatalog("server/data/dbe-papers-catalog-saexampapers.json");
  const da = loadCatalog("server/data/dbe-papers-catalog-dbe-archive.json");
  const st = loadCatalog("server/data/dbe-papers-catalog-stanmore.json");

  const saMemoByTuple = indexMemosByTuple(sa);
  const daMemoByTuple = indexMemosByTuple(da);
  const stMemoByTuple = indexMemosByTuple(st);
  const mainMemoBySubjYearPaper = indexAnyMemoBySubjectYearPaper(main);

  type Source = "saexampapers" | "dbe-archive" | "stanmore" | "cross-language";
  type Candidate = { url: string; entry: CatalogEntry; origin: Source };

  function candidatesFor(t: MissingRow): Candidate[] {
    const list: Candidate[] = [];
    const tupleKey = `${t.subject}|${t.year}|${t.paperNumber}|${t.language}`;
    const tryAdd = (e: CatalogEntry, origin: Source) => {
      const reason = tupleMismatch(t, e.url, e.linkText);
      if (reason) {
        log(`  ⨯ rejecting ${origin} candidate for ${tupleKey}: ${reason}`);
        return;
      }
      list.push({ url: e.url, entry: e, origin });
    };
    for (const [origin, idx] of [
      ["saexampapers", saMemoByTuple],
      ["dbe-archive", daMemoByTuple],
      ["stanmore", stMemoByTuple],
    ] as const) {
      for (const e of (idx.get(tupleKey) ?? [])) tryAdd(e, origin);
    }
    // Cross-language fallback (only for non-language subjects)
    if (!LANGUAGE_SUBJECT(t.subject)) {
      const hits = mainMemoBySubjYearPaper.get(`${t.subject}|${t.year}|${t.paperNumber}`) ?? [];
      for (const e of hits) {
        if (e.language === t.language) continue; // would already be in catalog
        tryAdd(e, "cross-language");
      }
    }
    // Deduplicate by URL preserving order (so saexampapers > dbe-archive > stanmore > cross-language)
    const seen = new Set<string>();
    return list.filter((c) => {
      if (seen.has(c.url)) return false;
      seen.add(c.url);
      return true;
    });
  }

  const outPath = "server/data/dbe-papers-catalog-supplemental.json";
  // Resume from existing supplemental file (skip tuples already resolved or marked failed)
  let supplemental: SupplementalEntry[] = [];
  const failedTuplesPath = "reports/missing-memos-failed-tuples.json";
  let failedSet = new Set<string>();
  if (!RESET) {
    try {
      supplemental = JSON.parse(readFileSync(outPath, "utf8")) as SupplementalEntry[];
      log(`Resuming with ${supplemental.length} entries already in ${outPath}`);
    } catch {}
    try {
      const f = JSON.parse(readFileSync(failedTuplesPath, "utf8")) as string[];
      failedSet = new Set(f);
      log(`Resuming with ${failedSet.size} previously-failed tuples`);
    } catch {}
  }
  const resolvedKeys = new Set(supplemental.map((e) => `${e.forSubject}|${e.forYear}|${e.forPaperNumber}|${e.forLanguage}`));

  const noCandidate: string[] = [];
  const allCandidatesFailed: string[] = [];
  let processed = 0;
  let skipped = 0;

  for (const t of targets) {
    const key = `${t.subject}|${t.year}|${t.paperNumber}|${t.language}`;
    if (resolvedKeys.has(key) || failedSet.has(key)) {
      skipped++;
      continue;
    }
    if (processed >= LIMIT) break;
    processed++;
    const cands = candidatesFor(t);
    log(
      `▶ [${processed}/${Math.min(targets.length, LIMIT)}] ${t.subject} ${t.year} P${t.paperNumber} ${t.language} — ${cands.length} candidates`,
    );
    if (cands.length === 0) {
      noCandidate.push(`${t.subject} | ${t.year} | P${t.paperNumber} | ${t.language}`);
      continue;
    }

    let won: { c: Candidate; probe: Awaited<ReturnType<typeof probeMemoPdf>> } | null = null;
    for (const c of cands) {
      const probe = await probeMemoPdf(c.url);
      log(
        `   • [${c.origin}] ${probe.ok ? "✓" : "✗"} q=${probe.questionsFound} chars=${probe.textChars}${probe.reason ? ` — ${probe.reason}` : ""} ${c.url.slice(0, 90)}`,
      );
      if (probe.ok) {
        won = { c, probe };
        break;
      }
    }
    if (!won) {
      allCandidatesFailed.push(`${t.subject} | ${t.year} | P${t.paperNumber} | ${t.language} (${cands.length} cands)`);
      failedSet.add(key);
      // persist failures so re-runs skip them
      if (!DRY_RUN) {
        mkdirSync(dirname(failedTuplesPath), { recursive: true });
        writeFileSync(failedTuplesPath, JSON.stringify([...failedSet], null, 2) + "\n", "utf8");
      }
      continue;
    }

    supplemental.push({
      subject: t.subject,
      paperNumber: t.paperNumber,
      isMemo: true,
      year: t.year,
      session: won.c.entry.session || "November",
      language: t.language,
      url: won.c.url,
      linkText: won.c.entry.linkText ?? `[supplemental ${won.c.origin}]`,
      source: "supplemental",
      origin: won.c.origin,
      forSubject: t.subject,
      forYear: t.year,
      forPaperNumber: t.paperNumber,
      forLanguage: t.language,
      qpUrl: t.qpUrl,
      probe: { questionsFound: won.probe.questionsFound, textChars: won.probe.textChars },
    });
    // Persist after every successful resolution so chunked runs survive timeouts.
    if (!DRY_RUN) {
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, JSON.stringify(supplemental, null, 2) + "\n", "utf8");
    }
  }

  log(`\n=== Summary ===`);
  log(`Targets processed   : ${processed}`);
  log(`Memos found         : ${supplemental.length}`);
  log(`No candidate        : ${noCandidate.length}`);
  log(`All cands failed    : ${allCandidatesFailed.length}`);
  if (noCandidate.length) log(`\nNo-candidate tuples:\n  ${noCandidate.join("\n  ")}`);
  if (allCandidatesFailed.length) log(`\nFailed tuples:\n  ${allCandidatesFailed.join("\n  ")}`);

  // (outPath declared earlier)
  if (DRY_RUN) {
    log(`(dry-run) would write ${supplemental.length} entries to ${outPath}`);
  } else {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(supplemental, null, 2) + "\n", "utf8");
    log(`Wrote ${supplemental.length} entries → ${outPath}`);
  }
  process.exit(0);
}

main().catch((e) => {
  log("FATAL", e);
  process.exit(1);
});
