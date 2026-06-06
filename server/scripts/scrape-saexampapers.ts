/**
 * Scrapes saexampapers.co.za — second mirror covering ~42 Grade 12 subjects
 * (the long tail Stanmore Physics doesn't host: Accounting, Economics, CAT,
 * EGD, all technical subjects, all 11 official languages, the arts, etc.).
 *
 * PDFs follow the convention:
 *   {Subject}-Grade-12-{QP|MEMO|ANSWER-BOOK}-{Month}-{Year}-{Province}.pdf
 *
 * Output: server/data/dbe-papers-catalog-saexampapers.json
 * Run with: tsx server/scripts/scrape-saexampapers.ts
 */

import { writeFile } from "fs/promises";
import { join } from "path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const SUBJECTS_INDEX = "https://www.saexampapers.co.za/subjects/";

type CatalogEntry = {
  subject: string;
  paperNumber: number;
  isMemo: boolean;
  year: number;
  session: string;
  language: string;
  url: string;
  linkText: string;
};

async function fetchHtml(url: string, attempt = 0): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html,*/*" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
    return await res.text();
  } catch (err) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      return fetchHtml(url, attempt + 1);
    }
    throw err;
  }
}

// Map URL slug → canonical base subject name. HL/FAL/SAL variants are
// detected per-PDF from the filename below.
const SLUG_MAP: Record<string, string> = {
  "accounting": "Accounting",
  "afrikaans1": "Afrikaans",
  "agriculturalmanagementpractices": "Agricultural Management Practices",
  "agriculturalsciences": "Agricultural Sciences",
  "agriculturaltechnology": "Agricultural Technology",
  "businessstudies": "Business Studies",
  "civiltechnology": "Civil Technology",
  "computerapplicationtechnology": "Computer Applications Technology",
  "consumerstudies": "Consumer Studies",
  "dancestudies": "Dance Studies",
  "design": "Design",
  "dramaticarts": "Dramatic Arts",
  "economics": "Economics",
  "electricaltechnology": "Electrical Technology",
  "engineeringgraphicanddesign": "Engineering Graphics and Design",
  "english": "English",
  "geography": "Geography",
  "history": "History",
  "hospitalitystudies": "Hospitality Studies",
  "informationtechnology": "Information Technology",
  "isindebele": "isiNdebele",
  "isixhosa": "isiXhosa",
  "isizulu": "isiZulu",
  "life-orientation": "Life Orientation",
  "lifesciences": "Life Sciences",
  "marine-sciences": "Marine Sciences",
  "mathematicalliteracy": "Mathematical Literacy",
  "mathematics": "Mathematics",
  "mechanicaltechnology": "Mechanical Technology",
  "music": "Music",
  "physicalsciences": "Physical Sciences",
  "religionstudies": "Religion Studies",
  "sepedi": "Sepedi",
  "sesotho": "Sesotho",
  "setswana": "Setswana",
  "siswati": "siSwati",
  "technicalmathematics": "Technical Mathematics",
  "technicalsciences": "Technical Sciences",
  "tourism": "Tourism",
  "tshivenda": "Tshivenda",
  "visualarts": "Visual Arts",
  "xitsonga": "Xitsonga",
};

// Languages have HL/FAL/SAL variants — derive from filename.
const LANGUAGE_BASE_SUBJECTS = new Set([
  "Afrikaans", "English",
  "isiNdebele", "isiXhosa", "isiZulu",
  "Sepedi", "Sesotho", "Setswana", "siSwati", "Tshivenda", "Xitsonga",
]);

function detectLanguageVariant(baseSubject: string, filename: string): string {
  if (!LANGUAGE_BASE_SUBJECTS.has(baseSubject)) return baseSubject;
  const f = filename.toLowerCase();
  if (/\bhl\b|home[- ]?language|huistaal/.test(f)) return `${baseSubject} Home Language`;
  if (/\bfal\b|first[- ]?additional/.test(f)) return `${baseSubject} First Additional Language`;
  if (/\bsal\b|second[- ]?additional/.test(f)) return `${baseSubject} Second Additional Language`;
  // Default — most papers without an explicit tag are HL on this site
  return `${baseSubject} Home Language`;
}

function parseFilename(url: string, baseSubject: string): CatalogEntry[] {
  const file = decodeURIComponent(url.split("/").pop() ?? "").replace(/\.pdf$/i, "");
  const lower = file.toLowerCase();

  // Skip non-papers (study guides, scopes, answer-only books, etc.)
  if (
    /scope|guidelines|atp|manual|study[-_ ]guide|notes|revision|textbook|summary|syllabus|annexure/i.test(lower)
  ) {
    return [];
  }
  // Skip blank answer books (no question content)
  if (/answer[-_ ]?book/i.test(lower) && !/qp|question/i.test(lower)) {
    return [];
  }

  // Year — last 4-digit run between 2010 and 2027
  const years = file.match(/(20[1-2][0-9])/g) ?? [];
  const year = years.length ? parseInt(years[years.length - 1], 10) : 0;
  if (!year || year < 2014) return [];

  // Paper number
  let paperNumber = 0;
  const pMatch = file.match(/[\b\-_ ]P([1-3])\b/i) ?? file.match(/Paper[\b\-_ ]([1-3])/i);
  if (pMatch) paperNumber = parseInt(pMatch[1], 10);
  if (!paperNumber) paperNumber = 1;

  // Session
  let session = "November";
  if (/may[\b\-_ ]june|june|midyear/i.test(file)) session = "May/June";
  else if (/march/i.test(file)) session = "March";
  else if (/sept|trial|prelim/i.test(file)) session = "September";
  else if (/feb/i.test(file)) session = "February";

  // Subject (with language variant resolution)
  const subject = detectLanguageVariant(baseSubject, file);

  // Language tag for the Afrikaans-language version of any subject
  const language = /afrikaans/i.test(file) && !LANGUAGE_BASE_SUBJECTS.has(baseSubject)
    ? "Afrikaans"
    : (baseSubject === "Afrikaans" ? "Afrikaans" : "English");

  const linkText = file.replace(/[-_]+/g, " ");

  // Detect QP vs MEMO (saexampapers separates them into distinct PDFs)
  const isMemo = /\bmemo\b|memorand/i.test(file);
  const isQP = /\bqp\b|question[-_ ]paper/i.test(file) || (!isMemo && !/answer[-_ ]book/i.test(file));

  const entries: CatalogEntry[] = [];
  if (isQP && !isMemo) {
    entries.push({ subject, paperNumber, isMemo: false, year, session, language, url, linkText });
  }
  if (isMemo) {
    entries.push({ subject, paperNumber, isMemo: true, year, session, language, url, linkText });
  }
  return entries;
}

async function main() {
  console.log("Fetching SAE subjects index...");
  const indexHtml = await fetchHtml(SUBJECTS_INDEX);

  const subjectPages = Array.from(
    indexHtml.matchAll(/href="(https:\/\/www\.saexampapers\.co\.za\/grade-12-[^"]+)"/g),
  )
    .map((m) => m[1].replace(/#.*$/, "").replace(/\/?$/, "/"))
    .filter((u, i, arr) => arr.indexOf(u) === i);

  console.log(`Found ${subjectPages.length} subject pages on SAE`);

  const entries: CatalogEntry[] = [];
  const skipped: string[] = [];

  for (const pageUrl of subjectPages) {
    const slug = pageUrl.replace(/^.*\/grade-12-/, "").replace(/\/$/, "");
    const baseSubject = SLUG_MAP[slug];
    if (!baseSubject) {
      skipped.push(slug);
      continue;
    }
    try {
      console.log(`  → ${baseSubject} (${slug})`);
      const html = await fetchHtml(pageUrl);
      const pdfs = Array.from(
        html.matchAll(/href="(https?:\/\/[^"]*saexampapers\.co\.za[^"]*\.pdf)"/gi),
      )
        .map((m) => m[1].replace(/^http:\/\//, "https://"))
        .filter((u, i, arr) => arr.indexOf(u) === i);

      for (const pdfUrl of pdfs) {
        entries.push(...parseFilename(pdfUrl, baseSubject));
      }
    } catch (err: any) {
      console.warn(`    failed: ${err?.message ?? err}`);
    }
  }

  // Dedup by URL+isMemo
  const seen = new Set<string>();
  const deduped = entries.filter((e) => {
    const key = `${e.url}|${e.isMemo}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const outPath = join(process.cwd(), "server/data/dbe-papers-catalog-saexampapers.json");
  await writeFile(outPath, JSON.stringify(deduped, null, 2));

  console.log(`\nWrote ${deduped.length} entries to ${outPath}`);
  if (skipped.length) console.log(`Skipped slugs (no mapping): ${skipped.join(", ")}`);

  const bySubject = new Map<string, number>();
  for (const e of deduped) bySubject.set(e.subject, (bySubject.get(e.subject) ?? 0) + 1);
  console.log(`\n${bySubject.size} unique subjects:`);
  for (const [s, n] of [...bySubject.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${s.padEnd(50)} ${n}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
