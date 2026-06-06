/**
 * Scrapes stanmorephysics.com — a public mirror of NSC past papers — to
 * build a fresh DBE papers catalog. Writes to
 * server/data/dbe-papers-catalog-stanmore.json in the same shape as the
 * existing dbe-papers-catalog.json so the ingestion pipeline can consume
 * it unchanged.
 *
 * Run with: tsx server/scripts/scrape-stanmore.ts
 */

import { writeFile } from "fs/promises";
import { join } from "path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const ROOT = "https://stanmorephysics.com/";

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
      signal: AbortSignal.timeout(25_000),
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

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// Map slug fragments → canonical subject names matching the DB `subjects.name` column.
const SUBJECT_MAP: Record<string, string> = {
  "physical-science": "Physical Sciences",
  "maths-exam-papers": "Mathematics",
  "maths-literacy": "Mathematical Literacy",
  "information-technology": "Information Technology",
  "accounting": "Accounting",
  "english": "English Home Language",
  "life-sciences": "Life Sciences",
  "geography": "Geography",
  "business-studies": "Business Studies",
  "afrikaans": "Afrikaans Home Language",
  "isizulu": "isiZulu Home Language",
  "life-orientation": "Life Orientation",
  "history": "History",
  "tourism": "Tourism",
  "economics": "Economics",
  "agricultural-sciences": "Agricultural Sciences",
  "consumer-studies": "Consumer Studies",
  "religion": "Religion Studies",
  "dramatic-arts": "Dramatic Arts",
  "visual-arts": "Visual Arts",
  "music": "Music",
  "design": "Design",
  "computer-applications": "Computer Applications Technology",
  "cat-grade-12": "Computer Applications Technology",
  "engineering-graphics": "Engineering Graphics and Design",
  "egd": "Engineering Graphics and Design",
  "mechanical-technology": "Mechanical Technology",
  "electrical-technology": "Electrical Technology",
  "civil-technology": "Civil Technology",
  "hospitality": "Hospitality Studies",
  "sepedi": "Sepedi Home Language",
  "setswana": "Setswana Home Language",
  "sesotho": "Sesotho Home Language",
  "xitsonga": "Xitsonga Home Language",
  "tshivenda": "Tshivenda Home Language",
  "siswati": "Siswati Home Language",
  "isixhosa": "isiXhosa Home Language",
  "ndebele": "isiNdebele Home Language",
};

function classifySubjectFromUrl(slug: string): string | null {
  const lower = slug.toLowerCase();
  for (const [frag, canonical] of Object.entries(SUBJECT_MAP)) {
    if (lower.includes(frag)) return canonical;
  }
  return null;
}

function parseFilename(url: string, subject: string): CatalogEntry[] {
  const file = decodeURIComponent(url.split("/").pop() ?? "").replace(/\.pdf$/i, "");
  const lower = file.toLowerCase();

  // Skip obvious non-paper material
  if (
    lower.includes("scope") ||
    lower.includes("guidelines") ||
    lower.includes("atp") ||
    lower.includes("manual") ||
    lower.includes("study-guide") ||
    lower.includes("notes") ||
    lower.includes("revision") ||
    lower.includes("textbook") ||
    lower.includes("summary") ||
    lower.includes("syllabus")
  ) {
    return [];
  }

  // Year — first 4-digit run between 2010 and 2027
  const years = file.match(/(20[1-2][0-9])/g) ?? [];
  const year = years.length ? parseInt(years[years.length - 1], 10) : 0;
  if (!year) return [];

  // Paper number — look for P1/P2/P3 or " 1", "Paper 1"
  let paperNumber = 0;
  const pMatch = file.match(/[\b\-_ ]P([1-3])\b/i) ?? file.match(/Paper[\b\-_ ]([1-3])/i);
  if (pMatch) paperNumber = parseInt(pMatch[1], 10);
  // Some single-paper subjects (LO, CAT, etc.) — default to 1
  if (!paperNumber) paperNumber = 1;

  // Session
  let session = "November";
  if (/may[\b\-_ ]june|june|midyear/i.test(file)) session = "May/June";
  else if (/march/i.test(file)) session = "March";
  else if (/sept|trial|prelim/i.test(file)) session = "September";
  else if (/feb/i.test(file)) session = "February";

  // Language
  const language = /afrikaans/i.test(file) ? "Afrikaans" : "English";

  const linkText = file.replace(/[-_]+/g, " ");

  // Combined "QP and Memo" PDFs — emit two entries (one QP, one memo) sharing
  // the same URL so the ingestion pipeline can extract both.
  const hasQP = /qp|question[\b\-_ ]paper/i.test(file) || !/memo|memorand/i.test(file);
  const hasMemo = /memo|memorand/i.test(file);

  const entries: CatalogEntry[] = [];
  if (hasQP) {
    entries.push({
      subject, paperNumber, isMemo: false, year, session, language, url, linkText,
    });
  }
  if (hasMemo) {
    entries.push({
      subject, paperNumber, isMemo: true, year, session, language, url,
      linkText: linkText + " memo",
    });
  }
  return entries;
}

async function main() {
  console.log("Fetching homepage...");
  const home = await fetchHtml(ROOT);

  // Extract all internal grade-12 page URLs
  const pageUrls = uniq(
    Array.from(home.matchAll(/href="(https:\/\/stanmorephysics\.com\/[^"]*grade-?12[^"]*)"/gi))
      .map((m) => m[1].replace(/\/$/, "") + "/")
      .filter((u) => !u.includes(".pdf") && !u.includes("?")),
  );
  console.log(`Found ${pageUrls.length} grade-12 subject pages`);

  const entries: CatalogEntry[] = [];
  const skippedSubjects = new Set<string>();

  for (const pageUrl of pageUrls) {
    const slug = pageUrl.replace(ROOT, "").replace(/\/$/, "");
    const subject = classifySubjectFromUrl(slug);
    if (!subject) {
      skippedSubjects.add(slug);
      continue;
    }
    try {
      console.log(`  → ${subject} (${slug})`);
      const html = await fetchHtml(pageUrl);
      const pdfs = uniq(
        Array.from(html.matchAll(/href="(https?:\/\/[^"]*\.pdf)"/gi)).map((m) =>
          m[1].replace(/^http:\/\//, "https://"),
        ),
      );
      for (const pdfUrl of pdfs) {
        entries.push(...parseFilename(pdfUrl, subject));
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

  const outPath = join(process.cwd(), "server/data/dbe-papers-catalog-stanmore.json");
  await writeFile(outPath, JSON.stringify(deduped, null, 2));

  console.log(`\nWrote ${deduped.length} entries to ${outPath}`);
  console.log(`Skipped subject slugs (no mapping): ${Array.from(skippedSubjects).join(", ") || "none"}`);
  // Per-subject summary
  const bySubject = new Map<string, number>();
  for (const e of deduped) bySubject.set(e.subject, (bySubject.get(e.subject) ?? 0) + 1);
  for (const [s, n] of [...bySubject.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${s.padEnd(40)} ${n}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
