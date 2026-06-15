import * as cheerio from "cheerio";
import * as fs from "fs";
import * as https from "https";
import * as http from "http";
import { URL, fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = "https://www.education.gov.za";
const NSC_PAST_PAPERS_URL =
  "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx";
const CATALOG_PATH = join(__dirname, "../data/dbe-papers-catalog.json");

interface CatalogEntry {
  subject: string;
  paperNumber: number;
  isMemo: boolean;
  year: number;
  session: string;
  language: string;
  url: string;
  linkText: string;
}

function fetchUrl(url: string, redirectCount = 0): Promise<string> {
  if (redirectCount > 5) {
    return Promise.reject(new Error("Too many redirects"));
  }
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const protocol = parsed.protocol === "https:" ? https : http;
    const req = protocol.get(url, { timeout: 30000 }, (res) => {
      if (
        res.statusCode &&
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        const redirectUrl = new URL(res.headers.location, url).href;
        console.log(`  -> Redirect to: ${redirectUrl}`);
        fetchUrl(redirectUrl, redirectCount + 1).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode && res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      let data = "";
      res.on("data", (chunk: Buffer) => (data += chunk.toString()));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePaperLinkText(linkText: string): {
  subject: string;
  paperNumber: number;
  isMemo: boolean;
} | null {
  const text = linkText.trim();
  if (!text) return null;

  const isMemo = /memo/i.test(text);

  const paperMatch = text.match(/\bP(\d+)\b/i);
  const paperMatch2 = text.match(/\bPaper\s*(\d+)\b/i);
  let paperNumber = 1;
  if (paperMatch) {
    paperNumber = parseInt(paperMatch[1]);
  } else if (paperMatch2) {
    paperNumber = parseInt(paperMatch2[1]);
  }

  let subject = text
    .replace(/\s*memo\b.*/i, "")
    .replace(/\s*P\d+\b.*/i, "")
    .replace(/\s*Paper\s*\d+\b.*/i, "")
    .replace(/\s*\(.*\)\s*$/, "")
    .trim();

  if (!subject || subject.length < 2) return null;

  return { subject, paperNumber, isMemo };
}

function extractEntriesFromPage(
  html: string,
  year: number,
  session: string
): CatalogEntry[] {
  const $ = cheerio.load(html);
  const entries: CatalogEntry[] = [];
  const seen = new Set<string>();

  $("td.TitleCell a, .TitleCell a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();

    if (!href.includes("fileticket=") || !text) return;

    let cleanUrl = href.replace(/&amp;/g, "&");
    if (!cleanUrl.startsWith("http")) {
      cleanUrl = `${BASE_URL}${cleanUrl.startsWith("/") ? "" : "/"}${cleanUrl}`;
    }

    const ticketMatch = cleanUrl.match(/fileticket=([^&]+)/);
    const dedupeKey = ticketMatch ? ticketMatch[1] : cleanUrl;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);

    const parsed = parsePaperLinkText(text);
    if (!parsed) return;

    const { subject, paperNumber, isMemo } = parsed;

    entries.push({
      subject,
      paperNumber,
      isMemo,
      year,
      session,
      language: "English",
      url: cleanUrl,
      linkText: text,
    });
  });

  if (entries.length === 0) {
    $("a").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();

      if (!href.includes("fileticket=") || !text) return;
      if (href.includes("forcedownload=true")) return;

      let cleanUrl = href.replace(/&amp;/g, "&");
      if (!cleanUrl.startsWith("http")) {
        cleanUrl = `${BASE_URL}${cleanUrl.startsWith("/") ? "" : "/"}${cleanUrl}`;
      }

      const ticketMatch = cleanUrl.match(/fileticket=([^&]+)/);
      const dedupeKey = ticketMatch ? ticketMatch[1] : cleanUrl;
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);

      const parsed = parsePaperLinkText(text);
      if (!parsed) return;

      const { subject, paperNumber, isMemo } = parsed;

      entries.push({
        subject,
        paperNumber,
        isMemo,
        year,
        session,
        language: "English",
        url: cleanUrl,
        linkText: text,
      });
    });
  }

  return entries;
}

function deduplicateEntries(
  existing: CatalogEntry[],
  newEntries: CatalogEntry[]
): CatalogEntry[] {
  const existingUrls = new Set(existing.map((e) => e.url));
  const existingKeys = new Set(
    existing.map(
      (e) =>
        `${e.subject}|${e.paperNumber}|${e.isMemo}|${e.year}|${e.session}`
    )
  );

  return newEntries.filter((e) => {
    if (existingUrls.has(e.url)) return false;
    const key = `${e.subject}|${e.paperNumber}|${e.isMemo}|${e.year}|${e.session}`;
    return !existingKeys.has(key);
  });
}

async function findSectionLinks(
  html: string,
  year: number,
  session: string
): Promise<string[]> {
  const $ = cheerio.load(html);
  const links: string[] = [];

  const yearStr = String(year);
  const sessionLower = session.toLowerCase();

  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();

    if (!href || href.includes("fileticket=")) return;

    const textLower = text.toLowerCase();
    // Looser check: if it contains the year, check if it's the right session
    if (textLower.includes(yearStr)) {
      if (
        textLower.includes(sessionLower) ||
        (sessionLower === "november" && (textLower.includes("nov") || textLower.includes("nsc") || textLower.includes("past papers"))) ||
        (sessionLower === "may/june" && (textLower.includes("may") || textLower.includes("june") || textLower.includes("sc")))
      ) {
        let fullUrl = href.replace(/&amp;/g, "&");
        if (!fullUrl.startsWith("http")) {
          fullUrl = `${BASE_URL}${fullUrl.startsWith("/") ? "" : "/"}${fullUrl}`;
        }
        if (fullUrl.includes("education.gov.za")) {
          links.push(fullUrl);
        }
      }
    }
  });

  return Array.from(new Set(links));
}

async function discoverAndExtract(
  year: number,
  session: string
): Promise<CatalogEntry[]> {
  console.log(`\nFetching NSC past papers index...`);
  const indexHtml = await fetchUrl(NSC_PAST_PAPERS_URL);
  await sleep(2000);

  console.log(`Looking for ${year} ${session} section links...`);
  const sectionLinks = await findSectionLinks(indexHtml, year, session);

  if (sectionLinks.length === 0) {
    console.log(`  No section links found for ${year} ${session}.`);
    return [];
  }

  console.log(`  Found ${sectionLinks.length} section link(s):`);
  sectionLinks.forEach((l) => console.log(`    ${l}`));

  const allEntries: CatalogEntry[] = [];

  for (const link of sectionLinks) {
    console.log(`\nFetching: ${link}`);
    try {
      const pageHtml = await fetchUrl(link);
      await sleep(2000);

      const entries = extractEntriesFromPage(pageHtml, year, session);
      console.log(`  Found ${entries.length} entries.`);
      allEntries.push(...entries);
    } catch (err: any) {
      console.error(`  Error fetching ${link}: ${err.message}`);
    }
  }

  return allEntries;
}

async function main() {
  const args = process.argv.slice(2);
  const yearArg = args.find((a) => a.startsWith("--year="));
  const sessionArg = args.find((a) => a.startsWith("--session="));
  const year = yearArg ? parseInt(yearArg.split("=")[1]) : 2025;
  const session = sessionArg ? sessionArg.split("=")[1] : "November";

  console.log(`=== DBE Catalog Discovery Script ===`);
  console.log(`Target: ${year} ${session} NSC Papers`);
  console.log(`Catalog: ${CATALOG_PATH}`);

  const existing: CatalogEntry[] = JSON.parse(
    fs.readFileSync(CATALOG_PATH, "utf8")
  );
  console.log(`\nExisting catalog: ${existing.length} entries`);

  const existingYearSessionCount = existing.filter(
    (e) => e.year === year && e.session === session
  ).length;
  if (existingYearSessionCount > 0) {
    console.log(
      `  Note: ${existingYearSessionCount} entries already exist for ${year} ${session}.`
    );
  }

  let discovered: CatalogEntry[] = [];
  try {
    discovered = await discoverAndExtract(year, session);
  } catch (err: any) {
    console.error(`\nFailed to discover papers: ${err.message}`);
    process.exit(1);
  }

  if (discovered.length === 0) {
    console.log(
      `\nNo entries discovered for ${year} ${session}. Catalog unchanged.`
    );
    console.log(
      `Note: ${year} ${session} papers may not yet be published on education.gov.za.`
    );
    console.log(
      `Re-run this script once papers are published to add them to the catalog.`
    );
    process.exit(0);
  }

  console.log(`\nDiscovered ${discovered.length} raw entries.`);

  const newEntries = deduplicateEntries(existing, discovered);
  console.log(`After deduplication: ${newEntries.length} new unique entries.`);

  if (newEntries.length === 0) {
    console.log(`All discovered entries already exist in catalog. No changes made.`);
    process.exit(0);
  }

  const updated = [...existing, ...newEntries];
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(updated, null, 2));

  console.log(`\n=== Catalog Updated ===`);
  console.log(`  Previous count: ${existing.length}`);
  console.log(`  Added: ${newEntries.length}`);
  console.log(`  New total: ${updated.length}`);

  const subjects = Array.from(new Set(newEntries.map((e) => e.subject))).sort();
  console.log(`\nSubjects added (${subjects.length}):`);
  subjects.forEach((s) => {
    const count = newEntries.filter((e) => e.subject === s).length;
    console.log(`  ${s}: ${count} entries`);
  });

  const memoCount = newEntries.filter((e) => e.isMemo).length;
  const paperCount = newEntries.filter((e) => !e.isMemo).length;
  console.log(`\nBreakdown: ${paperCount} papers, ${memoCount} memos`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
