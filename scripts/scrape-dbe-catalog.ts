/**
 * Re-builds `server/data/dbe-papers-catalog.json` by scraping the official
 * DBE site (education.gov.za) directly. Unlike the saexampapers/stanmore
 * mirrors, DBE serves real text-extractable PDFs.
 *
 * Run:  npx tsx scripts/scrape-dbe-catalog.ts
 * Output: server/data/dbe-papers-catalog-dbe.json (does NOT overwrite the
 *         existing catalog — review first, then swap).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type CatalogEntry = {
  subject: string;
  paperNumber: number;
  isMemo: boolean;
  year: number;
  session: string;
  language: string;
  url: string;
  linkText: string;
  province?: string;
};

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

// ─── Landing pages: (year, session, URL) ───────────────────────────────
// Confirmed-working pages from index, plus probes for likely-named pages.
const LANDING_PAGES: Array<{ year: number; session: string; url: string }> = [
  // 2025
  { year: 2025, session: "November", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2025NovemberExamPapers.aspx" },
  { year: 2025, session: "May/June", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2025MayJuneExamPapers.aspx" },
  // 2024
  { year: 2024, session: "November", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2024NSCNovemberpastpapers.aspx" },
  { year: 2024, session: "November", url: "https://www.education.gov.za/2024NSCNovemberpastpapers.aspx" },
  { year: 2024, session: "May/June", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2024MayJuneExamPapers.aspx" },
  // 2023
  { year: 2023, session: "November", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2023NSCNovemberpastpapers.aspx" },
  { year: 2023, session: "May/June", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2023MayJuneExamPapers.aspx" },
  // 2022
  { year: 2022, session: "November", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2022NovemberNSCExams.aspx" },
  { year: 2022, session: "May/June", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2022MayJuneExamPapers.aspx" },
  // 2021
  { year: 2021, session: "November", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2021NSCExamPapers.aspx" },
  { year: 2021, session: "May/June", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2021MayJuneNSCExams.aspx" },
  // 2020
  { year: 2020, session: "November", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2020NSCExamPapers.aspx" },
  // 2019
  { year: 2019, session: "May/June", url: "https://www.education.gov.za/2019JuneNSCExamPapers.aspx" },
  { year: 2019, session: "November", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2019NovemberNSCExamPapers.aspx" },
  // 2018
  { year: 2018, session: "November", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2018NSCExamPapers.aspx" },
  { year: 2018, session: "Supplementary", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/2018SupplementaryExams.aspx" },
  // 2017
  { year: 2017, session: "November", url: "https://www.education.gov.za/Home/2017NSCNovemberpastpapers.aspx" },
  { year: 2017, session: "May/June", url: "https://www.education.gov.za/Curriculum/SeniorCertificate/2017SCMay-JuneExampapers.aspx" },
  // 2016
  { year: 2016, session: "November", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/PastExamPapers/2016NovemberNSCExaminations.aspx" },
  { year: 2016, session: "Feb/March", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/PastExamPapers/2016FebMarchNSCExaminationPapers.aspx" },
  // 2015
  { year: 2015, session: "November", url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/PastExamPapers/2015NovemberNSCExamPapers1.aspx" },
];

// ─── Subject name normalisation ───────────────────────────────────────
// Maps the short codes in DBE link text to the canonical names in our subjects table.
const LANG_FULL: Record<string, string> = {
  Afrikaans: "Afrikaans", English: "English",
  IsiNdebele: "isiNdebele", isiNdebele: "isiNdebele",
  IsiXhosa: "isiXhosa", isiXhosa: "isiXhosa",
  IsiZulu: "isiZulu", isiZulu: "isiZulu",
  Sepedi: "Sepedi", Sesotho: "Sesotho", Setswana: "Setswana",
  SiSwati: "siSwati", siSwati: "siSwati",
  Tshivenda: "Tshivenda", Xitsonga: "Xitsonga",
  Siswati: "siSwati",
};

const SUBJECT_ALIASES: Record<string, string> = {
  // Direct
  "Mathematics": "Mathematics",
  "Mathematical Literacy": "Mathematical Literacy",
  "Maths Literacy": "Mathematical Literacy",
  "Math Literacy": "Mathematical Literacy",
  "Mathematic Literacy": "Mathematical Literacy",
  "Technical Mathematics": "Technical Mathematics",
  "Technical Maths": "Technical Mathematics",
  "Tech Maths": "Technical Mathematics",
  "Physical Sciences": "Physical Sciences",
  "Physical Science": "Physical Sciences",
  "Phys Sciences": "Physical Sciences",
  "Technical Sciences": "Technical Sciences",
  "Tech Sciences": "Technical Sciences",
  "Life Sciences": "Life Sciences",
  "Life Science": "Life Sciences",
  "Life Orientation": "Life Orientation",
  "Accounting": "Accounting",
  "Business Studies": "Business Studies",
  "Economics": "Economics",
  "Geography": "Geography",
  "History": "History",
  "Tourism": "Tourism",
  "Religion Studies": "Religion Studies",
  "Religious Studies": "Religion Studies",
  "Visual Arts": "Visual Arts",
  "Music": "Music",
  "Dance Studies": "Dance Studies",
  "Dramatic Arts": "Dramatic Arts",
  "Design": "Design",
  "Information Technology": "Information Technology",
  "Computer Applications Technology": "Computer Applications Technology",
  "Computer Application Technology": "Computer Applications Technology",
  "CAT": "Computer Applications Technology",
  "Engineering Graphics and Design": "Engineering Graphics and Design",
  "Engineering Graphic and Design": "Engineering Graphics and Design",
  "EGD": "Engineering Graphics and Design",
  "Civil Technology": "Civil Technology",
  "Mechanical Technology": "Mechanical Technology",
  "Electrical Technology": "Electrical Technology",
  "Digital Technology": "Digital Technology",
  "Agricultural Sciences": "Agricultural Sciences",
  "Agricultural Technology": "Agricultural Technology",
  "Agricultural Management Practices": "Agricultural Management Practices",
  "AMP": "Agricultural Management Practices",
  "Consumer Studies": "Consumer Studies",
  "Hospitality Studies": "Hospitality Studies",
  "Marine Sciences": "Marine Sciences",
};

const PROVINCES = ["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","North West","Northern Cape","Western Cape"];

// Returns { subject, language, paperNumber, isMemo, province? } from anchor text
function parseLinkText(text: string, year: number, session: string): Omit<CatalogEntry, "url" | "linkText" | "year" | "session"> | null {
  let t = text.replace(/\s+/g, " ").trim();
  if (!t) return null;

  // Skip non-paper assets
  const lower = t.toLowerCase();
  if (/(addendum|errata|annexure|guideline|programme|timetable|circular|workbook|notice|excel|data file|template|cover page|instructions)/i.test(lower)) return null;

  // Province
  let province: string | undefined;
  for (const p of PROVINCES) {
    const re = new RegExp(`\\(${p}\\)|\\b${p}\\b`, "i");
    if (re.test(t)) { province = p; t = t.replace(re, "").replace(/\(\s*\)/g, "").trim(); break; }
  }

  // Memo / answer book
  const isMemo = /\b(memo|memorandum|answers?)\b/i.test(t);
  t = t.replace(/\b(memo|memorandum|answers?)\b/gi, "").trim();

  // Language hint in parens, e.g. "Mathematics P1 (Afrikaans)"
  let language = "English";
  const langInParens = t.match(/\(([A-Za-z]+)\)/);
  if (langInParens && /afrikaans/i.test(langInParens[1])) {
    language = "Afrikaans";
    t = t.replace(langInParens[0], "").trim();
  }

  // Paper number: P1 / P2 / P3 / Paper 1 / etc.
  const paperMatch = t.match(/\bP\s*(\d)\b|\bPaper\s+(\d)\b/i);
  let paperNumber = paperMatch ? parseInt(paperMatch[1] ?? paperMatch[2], 10) : 1;
  t = t.replace(/\bP\s*\d\b|\bPaper\s+\d\b/gi, "").trim();

  // Strip trailing "MG" (marking guide), Eng/Afr suffixes
  t = t.replace(/\b(MG|Eng|Afr)\b/gi, "").trim();
  t = t.replace(/\s{2,}/g, " ").replace(/\s*[-,]\s*$/g, "").trim();

  if (!t) return null;

  // ─── Detect official-language paper, e.g. "Afrikaans HL", "isiZulu FAL", "Sepedi SAL"
  const langMatch = t.match(/^([A-Za-z]+)\s+(HL|FAL|SAL)\b/i);
  if (langMatch) {
    const langWord = langMatch[1];
    const level = langMatch[2].toUpperCase();
    const langFull = LANG_FULL[langWord] ?? LANG_FULL[langWord.toLowerCase()] ?? langWord;
    const levelFull = level === "HL" ? "Home Language" : level === "FAL" ? "First Additional Language" : "Second Additional Language";
    const subject = `${langFull} ${levelFull}`;
    // language column = the language being studied
    const subjLanguage = langFull;
    return { subject, paperNumber, isMemo, language: subjLanguage, province };
  }

  // ─── Plain content subject — match against alias map
  // Strip parenthetical noise
  t = t.replace(/\(.*?\)/g, "").trim();
  const subject = SUBJECT_ALIASES[t] ?? null;
  if (!subject) return null;
  return { subject, paperNumber, isMemo, language, province };
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, "Accept": "text/html" }, signal: AbortSignal.timeout(25000) });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) { return null; }
}

function extractAnchors(html: string): Array<{ href: string; text: string }> {
  const out: Array<{ href: string; text: string }> = [];
  const re = /<a[^>]+href="([^"]*LinkClick[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1].replace(/&amp;/g, "&");
    const text = m[2].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    if (text) out.push({ href, text });
  }
  return out;
}

// Build a mid → subject map from DNN module headings.
// Pattern: <span class="eds_containerTitle">SUBJECT</span> ... <div id="dnn_ctrMID_...">
// Each LinkClick URL contains &mid=MID — that mid identifies the parent subject pane.
function buildMidToSubjectMap(html: string): Map<string, string> {
  const map = new Map<string, string>();
  // Match each container title and the very next dnn_ctrMID id that appears
  const re = /eds_containerTitle"[^>]*>([^<]+)<\/span>[\s\S]{0,800}?dnn_ctr(\d+)_/gi;
  let m;
  while ((m = re.exec(html))) {
    const subject = m[1].replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    const mid = m[2];
    if (subject && !map.has(mid)) map.set(mid, subject);
  }
  return map;
}

// Parser for the heading-grouped layout.
// Anchor text examples: "Paper 1 (English)", "Memo 2 (Afrikaans)", "Paper 1 Answer Book (English)", "Download"
function parseGroupedLinkText(text: string, subjectFromMid: string): Omit<CatalogEntry, "url" | "linkText" | "year" | "session"> | null {
  let t = text.replace(/\s+/g, " ").trim();
  if (!t) return null;
  const lower = t.toLowerCase();
  // Skip non-paper assets (Download links are duplicates of the title link with same fileticket)
  if (lower === "download") return null;
  if (/(addendum|errata|annexure|guideline|programme|timetable|circular|notice|excel|data file|template|cover page|instructions|workbook|results|errata)/i.test(lower)) return null;

  // Skip pure answer-book downloads (they don't contain question text)
  if (/answer\s*book/i.test(t)) return null;

  // Detect language in parens
  let language = "English";
  const langInParens = t.match(/\(([^)]+)\)/);
  if (langInParens) {
    const inner = langInParens[1].toLowerCase();
    if (/afrikaans/.test(inner) && !/english/.test(inner)) language = "Afrikaans";
    else if (/english/.test(inner) && !/afrikaans/.test(inner)) language = "English";
    else if (/english\s*&\s*afrikaans|english\s+and\s+afrikaans/.test(inner)) language = "English"; // bilingual → use English
    t = t.replace(langInParens[0], "").trim();
  }

  // Paper number — Paper 1 / P1 / Memo 1 / Memorandum 1 / Marking Guideline 1 / standalone "1"
  // IMPORTANT: extract BEFORE stripping memo/marking words, since the link text in
  // multi-stream modules (e.g. Mechanical Tech: Welding/Fitting/Automotive) reads
  // "Welding and Metalwork Memo 1 (English)" — stripping "memo" first leaves
  // "Welding and Metalwork 1" with no Paper/P prefix and the old regex missed it.
  const paperMatch =
    t.match(/\b(?:Paper|Memo(?:randum)?|Marking\s+Guideline|P)\s*(\d)\b/i) ||
    t.match(/(?:^|\s)(\d)(?:\s|$)/);
  if (!paperMatch) return null;
  const paperNumber = parseInt(paperMatch[1], 10);

  // Memo
  const isMemo = /\b(memo|memorandum|marking|answers?)\b/i.test(t);
  t = t.replace(/\b(memo|memorandum|marking|guide|guideline|answers?)\b/gi, "").trim();

  // If the heading is a bare language name, defer to inline parser
  // (it knows how to derive HL/FAL/SAL from the link text).
  const cleanSubj = subjectFromMid.replace(/\(.*?\)/g, "").trim();
  if (LANG_FULL[cleanSubj] || LANG_FULL[cleanSubj.toLowerCase()]) return null;

  // Resolve subject through aliases (mid heading text might be e.g. "Maths Literacy")
  const subject = SUBJECT_ALIASES[cleanSubj] ?? SUBJECT_ALIASES[subjectFromMid] ?? cleanSubj;
  if (!subject) return null;
  return { subject, paperNumber, isMemo, language };
}

async function main() {
  const all: CatalogEntry[] = [];
  const seenTickets = new Set<string>();
  const stats: Record<string, number> = {};
  const skipped: string[] = [];

  for (const lp of LANDING_PAGES) {
    log(`fetching ${lp.year} ${lp.session} → ${lp.url}`);
    const html = await fetchHtml(lp.url);
    if (!html) { log(`  · MISS (404/403/timeout)`); continue; }
    const anchors = extractAnchors(html);
    const midMap = buildMidToSubjectMap(html);
    log(`  · anchors=${anchors.length}, subject-mids=${midMap.size}`);
    let added = 0, skippedHere = 0, viaGrouped = 0;
    for (const a of anchors) {
      const ticket = a.href.match(/fileticket=([^&]+)/)?.[1];
      if (ticket && seenTickets.has(ticket)) continue;
      // Try grouped (mid-based) layout first
      const mid = a.href.match(/[?&]mid=(\d+)/)?.[1];
      let parsed: ReturnType<typeof parseLinkText> = null;
      if (mid && midMap.has(mid)) {
        parsed = parseGroupedLinkText(a.text, midMap.get(mid)!);
        if (parsed) viaGrouped++;
      }
      if (!parsed) parsed = parseLinkText(a.text, lp.year, lp.session);
      if (!parsed) { skippedHere++; if (skipped.length < 30) skipped.push(`${lp.year} ${lp.session}: ${a.text} [mid=${mid}, subj=${mid ? midMap.get(mid) : "?"}]`); continue; }
      if (ticket) seenTickets.add(ticket);
      const url = a.href.startsWith("http") ? a.href : `https://www.education.gov.za${a.href}`;
      all.push({ ...parsed, year: lp.year, session: lp.session, url, linkText: a.text });
      added++;
    }
    log(`  · via-grouped=${viaGrouped}`);
    log(`  · added=${added}, unrecognised=${skippedHere}`);
    stats[`${lp.year} ${lp.session}`] = added;
  }

  // Sort
  all.sort((a, b) => a.subject.localeCompare(b.subject) || b.year - a.year || a.paperNumber - b.paperNumber || Number(a.isMemo) - Number(b.isMemo));

  const outPath = path.join(__dirname, "..", "server", "data", "dbe-papers-catalog-dbe.json");
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2));

  log(`\n=== SUMMARY ===`);
  log(`total entries: ${all.length}`);
  log(`unique subjects: ${new Set(all.map(e => e.subject)).size}`);
  log(`output: ${outPath}`);
  log(`\nper-page:`);
  for (const [k, v] of Object.entries(stats)) log(`  ${k.padEnd(28)} ${v}`);

  log(`\nper-subject (top 20 by count):`);
  const bySubject: Record<string, number> = {};
  for (const e of all) bySubject[e.subject] = (bySubject[e.subject] ?? 0) + 1;
  for (const [s, n] of Object.entries(bySubject).sort((a, b) => b[1] - a[1]).slice(0, 25)) {
    log(`  ${s.padEnd(40)} ${n}`);
  }

  if (skipped.length) {
    log(`\nfirst 30 unrecognised anchor texts (sample):`);
    for (const s of skipped) log(`  ${s}`);
  }
  process.exit(0);
}

main().catch(e => { log("FATAL", e); process.exit(1); });
