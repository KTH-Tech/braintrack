/**
 * fill-missing-catalog-memos.ts
 *
 * Targeted pass to attach memo URLs for the 18 paper groups marked
 * MEMO_MISSING_FROM_CATALOG in reports/missing-memos-triage.csv.
 *
 * Strategy:
 *  1. Mine backup catalogs (mirror-backup, saexampapers, stanmore) for already-
 *     scraped memo entries that weren't merged into the live catalog.
 *  2. Probe candidate saexampapers URL patterns (HTTP HEAD) for subjects where
 *     no backup entry exists (primarily Design P2 and older isiXhosa HL P3).
 *  3. Merge successful memo entries into server/data/dbe-papers-catalog.json.
 *
 * Run:  npx tsx scripts/fill-missing-catalog-memos.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

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

// ── Missing tuples ──────────────────────────────────────────────────────────
// Each entry is (subject, year, paperNumber, catalogLanguage) where catalogLanguage
// is the value stored in dbe-papers-catalog.json (matches the language of study
// for official-language subjects).
const MISSING: Array<{ subject: string; year: number; paper: number; language: string }> = [
  { subject: "isiXhosa Second Additional Language", year: 2022, paper: 1, language: "isiXhosa" },
  { subject: "Afrikaans Home Language",             year: 2020, paper: 1, language: "Afrikaans" },
  { subject: "isiXhosa Home Language",              year: 2017, paper: 3, language: "isiXhosa" },
  { subject: "Design",                              year: 2024, paper: 2, language: "English" },
  { subject: "Design",                              year: 2024, paper: 2, language: "Afrikaans" },
  { subject: "Design",                              year: 2021, paper: 2, language: "English" },
  { subject: "Design",                              year: 2017, paper: 2, language: "Afrikaans" },
  { subject: "Design",                              year: 2023, paper: 2, language: "English" },
  { subject: "Design",                              year: 2017, paper: 2, language: "English" },
  { subject: "Design",                              year: 2015, paper: 2, language: "Afrikaans" },
  { subject: "Design",                              year: 2021, paper: 2, language: "Afrikaans" },
  { subject: "Design",                              year: 2020, paper: 2, language: "Afrikaans" },
  { subject: "Design",                              year: 2020, paper: 2, language: "English" },
  { subject: "Design",                              year: 2023, paper: 2, language: "Afrikaans" },
  { subject: "isiXhosa Home Language",              year: 2015, paper: 3, language: "isiXhosa" },
  { subject: "Engineering Graphics and Design",     year: 2022, paper: 2, language: "Afrikaans" },
  { subject: "Technical Mathematics",               year: 2020, paper: 2, language: "Afrikaans" },
  { subject: "Technical Mathematics",               year: 2020, paper: 2, language: "English" },
];

// ── Backup catalog paths ─────────────────────────────────────────────────────
const BACKUP_CATALOGS = [
  path.join(ROOT, "server/data/dbe-papers-catalog-saexampapers.json"),
  path.join(ROOT, "server/data/dbe-papers-catalog-mirror-backup.json"),
  path.join(ROOT, "server/data/dbe-papers-catalog-stanmore.json"),
  path.join(ROOT, "server/data/dbe-papers-catalog-dbe.json"),
];

// ── Candidate URL patterns for Design P2 and older isiXhosa HL P3 ───────────
// saexampapers URL patterns observed for Design P1:
//   2015-2019: https://www.saexampapers.co.za/wp-content/uploads/YYYY/MM/Design-P1-Nov-YEAR-Memo-Eng.pdf
//   2020-2022: similar + "NSC" prefix for newer years
//   2023+:     Design-NSC-P1-MEMO-Nov-YEAR-Eng.pdf
//
// We construct equivalent patterns for P2 since saexampapers has Design P2 QPs
// but no memos scraped.  If the site published them, they'd follow these templates.

function designP2Candidates(year: number, lang: "Eng" | "Afr"): string[] {
  const base = "https://www.saexampapers.co.za/wp-content/uploads";
  const suffix = lang === "Eng" ? "Eng" : "Afr";
  const candidates: string[] = [];

  if (year >= 2023) {
    // e.g. Design-NSC-P2-MEMO-Nov-2023-Eng.pdf
    candidates.push(`${base}/${year + 1}/04/Design-NSC-P2-MEMO-Nov-${year}-${suffix}.pdf`);
    candidates.push(`${base}/${year + 1}/05/Design-NSC-P2-MEMO-Nov-${year}-${suffix}.pdf`);
    candidates.push(`${base}/${year + 1}/04/Design-Grade-12-NSC-P2-MEMO-Nov-${year}-${suffix}.pdf`);
    candidates.push(`${base}/${year}/10/Design-NSC-MEMO-P2-May-June-${year}-${suffix}.pdf`);
    candidates.push(`${base}/${year}/10/Design-NSC-P2-MEMO-May-June-${year}-${suffix}.pdf`);
  } else if (year >= 2021) {
    // e.g. Design-NSC-P2-Memo-Nov-2021-Eng.pdf
    candidates.push(`${base}/${year + 1}/04/Design-NSC-P2-Memo-Nov-${year}-${suffix}.pdf`);
    candidates.push(`${base}/${year + 1}/01/Design-NSC-P2-Memo-Nov-${year}-${suffix}.pdf`);
    candidates.push(`${base}/${year + 1}/04/Design-P2-Nov-${year}-Memo-${suffix}.pdf`);
    candidates.push(`${base}/${year}/10/Design-P2-Sept-${year}-Memo-${suffix}.pdf`);
  } else if (year >= 2018) {
    // e.g. Design-P2-Nov-2020-Memo-Eng.pdf
    candidates.push(`${base}/${year + 1}/05/Design-P2-Nov-${year}-Memo-${suffix}.pdf`);
    candidates.push(`${base}/${year + 1}/01/Design-P2-Nov-${year}-Memo-${suffix}.pdf`);
    candidates.push(`${base}/${year + 1}/02/Design-P2-Nov-${year}-Memo-${suffix}.pdf`);
  } else {
    // 2015-2017
    candidates.push(`${base}/${year + 3}/06/Design-P2-Nov-${year}-Memo-${suffix}.pdf`);
    candidates.push(`${base}/${year + 3}/09/Design-P2-Nov-${year}-Memo-${suffix}.pdf`);
    candidates.push(`${base}/2020/01/Design-P2-Nov-${year}-Memo-${suffix}.pdf`);
    candidates.push(`${base}/2020/09/Design-P2-Nov-${year}-Memo-${suffix}.pdf`);
  }

  return candidates;
}

function isiXhosaHL_P3Candidates(year: number): string[] {
  const base = "https://www.saexampapers.co.za/wp-content/uploads";
  const candidates: string[] = [];
  // Observed patterns from 2022+ in saexampapers:
  //   IsiXhosa-NSC-HL-P3-Memo-Nov-2022.pdf  (upload 2023/02)
  //   iSiXhosa-NSC-HL-P3-MEMO-Nov-2023.pdf  (upload 2024/04)
  if (year === 2017) {
    candidates.push(`${base}/2018/04/IsiXhosa-NSC-HL-P3-Memo-Nov-${year}.pdf`);
    candidates.push(`${base}/2018/05/IsiXhosa-HL-P3-Memo-Nov-${year}.pdf`);
    candidates.push(`${base}/2020/09/IsiXhosa-HL-P3-Memo-Nov-${year}.pdf`);
    candidates.push(`${base}/2020/09/IsiXhosa-NSC-HL-P3-Memo-Nov-${year}.pdf`);
    candidates.push(`${base}/2020/01/IsiXhosa-HL-P3-Nov-${year}-Memo.pdf`);
    candidates.push(`https://stanmorephysics.com/wp-content/uploads/2022/04/isiXhosa-HL-P3-Nov-${year}-Memo.pdf`);
    candidates.push(`https://stanmorephysics.com/wp-content/uploads/2021/10/isiXhosa-HL-P3-Nov-${year}-Memo.pdf`);
  } else if (year === 2015) {
    candidates.push(`${base}/2020/09/IsiXhosa-HL-P3-Memo-Nov-${year}.pdf`);
    candidates.push(`${base}/2020/09/IsiXhosa-NSC-HL-P3-Memo-Nov-${year}.pdf`);
    candidates.push(`${base}/2022/06/IsiXhosa-HL-P3-Memo-Nov-${year}.pdf`);
    candidates.push(`${base}/2022/06/IsiXhosa-NSC-HL-P3-Memo-Nov-${year}.pdf`);
    candidates.push(`https://stanmorephysics.com/wp-content/uploads/2021/10/isiXhosa-HL-P3-Nov-${year}-Memo.pdf`);
  }
  return candidates;
}

async function headOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });
    return res.ok && res.status === 200;
  } catch {
    return false;
  }
}

async function probeUrls(candidates: string[]): Promise<string | null> {
  for (const url of candidates) {
    const ok = await headOk(url);
    if (ok) return url;
  }
  return null;
}

// Key used to check whether an entry already exists in the catalog
function entryKey(e: { subject: string; year: number; paperNumber: number; language: string; isMemo: boolean }): string {
  return `${e.subject}|${e.year}|${e.paperNumber}|${e.language}|${e.isMemo ? "memo" : "qp"}`;
}

async function main() {
  const catalogPath = path.join(ROOT, "server/data/dbe-papers-catalog.json");
  const catalog: CatalogEntry[] = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
  const existingKeys = new Set(catalog.map(entryKey));

  log(`Loaded catalog: ${catalog.length} entries`);

  // ── 1. Mine backup catalogs ────────────────────────────────────────────────
  log("\n── Step 1: Mining backup catalogs ──");

  // Build a quick lookup: (subject, year, paper, isMemo) → entries[]
  // across all backup catalogs, keyed by the catalogLanguage.
  // Note: saexampapers stores all language subjects with language="English"
  // so we try to map back using the study-language.
  const backupMemos = new Map<string, CatalogEntry[]>();

  for (const bPath of BACKUP_CATALOGS) {
    if (!fs.existsSync(bPath)) continue;
    const bCatalog: CatalogEntry[] = JSON.parse(fs.readFileSync(bPath, "utf-8"));
    for (const e of bCatalog) {
      if (!e.isMemo) continue;
      // Index by subject+year+paper (no language — we'll pick best match later)
      const k = `${e.subject}|${e.year}|${e.paperNumber}`;
      if (!backupMemos.has(k)) backupMemos.set(k, []);
      backupMemos.get(k)!.push(e);
    }
  }

  const toAdd: CatalogEntry[] = [];
  const stillMissing: typeof MISSING = [];

  for (const m of MISSING) {
    const lookupKey = `${m.subject}|${m.year}|${m.paper}`;
    const backups = backupMemos.get(lookupKey) ?? [];

    if (backups.length > 0) {
      // Try to find a language-matching entry, fallback to first
      const pick =
        backups.find((b) => b.language.toLowerCase() === m.language.toLowerCase()) ??
        backups[0];

      // Build entry with correct catalog language
      const newEntry: CatalogEntry = {
        subject: m.subject,
        paperNumber: m.paper,
        isMemo: true,
        year: m.year,
        session: pick.session ?? "November",
        language: m.language,
        url: pick.url,
        linkText: pick.linkText ?? `Memo P${m.paper} (${m.language}) [mirror]`,
      };

      const key = entryKey(newEntry);
      if (!existingKeys.has(key)) {
        log(`  ✓ backup  ${m.subject} ${m.year} P${m.paper} ${m.language} → ${pick.url.slice(0, 80)}`);
        toAdd.push(newEntry);
        existingKeys.add(key);
      } else {
        log(`  · exists  ${m.subject} ${m.year} P${m.paper} ${m.language}`);
      }
    } else {
      log(`  ? no backup for ${m.subject} ${m.year} P${m.paper} ${m.language} — will probe`);
      stillMissing.push(m);
    }
  }

  // ── 2. Probe candidate URLs for Design P2 and older isiXhosa HL P3 ─────────
  log(`\n── Step 2: Probing candidate URLs for ${stillMissing.length} still-missing entries ──`);

  const probeResults: { m: typeof MISSING[0]; url: string }[] = [];

  for (const m of stillMissing) {
    let candidates: string[] = [];

    if (m.subject === "Design" && m.paper === 2) {
      const lang: "Eng" | "Afr" = m.language === "Afrikaans" ? "Afr" : "Eng";
      candidates = designP2Candidates(m.year, lang);
    } else if (m.subject === "isiXhosa Home Language" && m.paper === 3) {
      candidates = isiXhosaHL_P3Candidates(m.year);
    }

    if (candidates.length === 0) {
      log(`  ✗ no probe strategy for ${m.subject} ${m.year} P${m.paper} ${m.language}`);
      continue;
    }

    log(`  probing ${m.subject} ${m.year} P${m.paper} ${m.language} (${candidates.length} candidates)…`);
    const found = await probeUrls(candidates);
    if (found) {
      log(`    ✓ found: ${found.slice(0, 90)}`);
      probeResults.push({ m, url: found });
    } else {
      log(`    ✗ all ${candidates.length} candidates returned 404/error`);
    }
  }

  for (const { m, url } of probeResults) {
    // Infer session from URL text
    let session = "November";
    if (/may.june|may-june/i.test(url)) session = "May/June";
    else if (/sept|jun/i.test(url)) session = "November"; // DBE Sept = "November" session alternate sitting

    const newEntry: CatalogEntry = {
      subject: m.subject,
      paperNumber: m.paper,
      isMemo: true,
      year: m.year,
      session,
      language: m.language,
      url,
      linkText: `Memo P${m.paper} (${m.language}) [mirror-probe]`,
    };
    const key = entryKey(newEntry);
    if (!existingKeys.has(key)) {
      toAdd.push(newEntry);
      existingKeys.add(key);
    }
  }

  // ── 3. Merge into catalog and write ─────────────────────────────────────────
  log(`\n── Step 3: Merging ${toAdd.length} new memo entries into catalog ──`);

  if (toAdd.length === 0) {
    log("Nothing new to add — catalog unchanged.");
    process.exit(0);
  }

  const updated = [...catalog, ...toAdd];
  updated.sort(
    (a, b) =>
      a.subject.localeCompare(b.subject) ||
      b.year - a.year ||
      a.paperNumber - b.paperNumber ||
      Number(a.isMemo) - Number(b.isMemo)
  );

  // Backup current catalog before modifying
  const backupPath = catalogPath.replace(".json", `-pre-task389-backup.json`);
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(catalogPath, backupPath);
    log(`Backup written → ${path.basename(backupPath)}`);
  }

  fs.writeFileSync(catalogPath, JSON.stringify(updated, null, 2));
  log(`Catalog updated: ${catalog.length} → ${updated.length} entries (+${toAdd.length})`);

  log("\n── Added entries ──");
  for (const e of toAdd) {
    log(`  ${e.subject} | ${e.year} | P${e.paperNumber} | ${e.language} | ${e.url.slice(0, 90)}`);
  }

  // ── 4. Summary ──────────────────────────────────────────────────────────────
  const stillMissingFinal = MISSING.filter((m) => {
    const key = `${m.subject}|${m.year}|${m.paper}|${m.language}|memo`;
    return !existingKeys.has(key);
  });

  log(`\n── Summary ──`);
  log(`  Missing before: ${MISSING.length}`);
  log(`  Filled:         ${MISSING.length - stillMissingFinal.length}`);
  log(`  Still missing:  ${stillMissingFinal.length}`);
  if (stillMissingFinal.length > 0) {
    log(`  Still-missing list:`);
    for (const m of stillMissingFinal) {
      log(`    ${m.subject} | ${m.year} | P${m.paper} | ${m.language}`);
    }
  }

  process.exit(0);
}

main().catch((e) => {
  log("FATAL", e);
  process.exit(1);
});
