import { db } from "./db";
import { dbeIngestionLog, dbeTopicCoverage, dbeMemoRubrics, dbeTopicFrequency, dbeVerbatimQuestions, topics, subjects } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { PDFParse } from "pdf-parse";
import { createHash } from "crypto";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { pathToFileURL } from "url";
import OpenAI from "openai";
import { CAPS_TOPICS } from "../client/src/lib/constants";

// Lazy OpenAI client used by the AI fallback splitter for unstructured language papers.
let _ingestionOpenAI: OpenAI | null = null;
function getIngestionOpenAI(): OpenAI | null {
  const key = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!key) return null;
  if (!_ingestionOpenAI) {
    _ingestionOpenAI = new OpenAI({
      apiKey: key,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return _ingestionOpenAI;
}

// Subjects whose papers commonly have no English/Afrikaans QUESTION/VRAAG headers.
// Restricted to language papers so we don't burn tokens on STEM subjects.
const LANGUAGE_AI_FALLBACK_SUBJECTS = new Set([
  "sepedi home language", "sepedi first additional language", "sepedi second additional language",
  "sesotho home language", "sesotho first additional language", "sesotho second additional language",
  "setswana home language", "setswana first additional language", "setswana second additional language",
  "isizulu home language", "isizulu first additional language", "isizulu second additional language",
  "isixhosa home language", "isixhosa first additional language", "isixhosa second additional language",
  "isindebele home language", "isindebele first additional language", "isindebele second additional language",
  "siswati", "siswati home language", "siswati first additional language", "siswati second additional language",
  "xitsonga home language", "xitsonga first additional language", "xitsonga second additional language",
  "tshivenda home language", "tshivenda first additional language", "tshivenda second additional language",
  "afrikaans home language", "afrikaans first additional language", "afrikaans second additional language",
  "english home language", "english first additional language", "english second additional language",
]);

function isLanguageAiFallbackSubject(subject: string): boolean {
  return LANGUAGE_AI_FALLBACK_SUBJECTS.has(subject.toLowerCase().trim());
}

// ============================================================
// DATA ASSET SUBJECTS — ringfenced from ingestion pipeline
// These are CAT/IT programming & data files (Excel, Access, Java, Delphi source)
// disguised as PDFs. They will NEVER parse as text. Skip them cleanly.
// ============================================================
export const DATA_ASSET_SUBJECTS = new Set([
  "data files",
  "data files (afr)",
  "data files (afrikaans)",
  "data files (eng)",
  "data files (english)",
  "data files (ms office)",
  "data files (ms office) rewrite",
  "java (afrikaans)",
  "java (english)",
  "delphi (afrikaans)",
  "delphi (english)",
  "it solutions (afr)",
  "learner files",
  "answerbook (afrikaans)",
  "answerbook (english)",
  "memo 1 (afrikaans) rewrite",
  "memo 1 (english) rewrite",
]);

export function isDataAssetSubject(subject: string): boolean {
  return DATA_ASSET_SUBJECTS.has(subject.toLowerCase().trim());
}

// ============================================================
// EXPLICIT CATALOG SUBJECT → CAPS CODE MAPPING
// The catalog uses full names like "English FAL" but CAPS_TOPICS uses codes like "ENGF".
// This lookup fixes subject code resolution for topic coverage extraction.
// ============================================================
const CATALOG_TO_CAPS: Record<string, string> = {
  "english fal": "ENGF",
  "english first additional language": "ENGF",
  "english hl": "ENGH",
  "english home language": "ENGH",
  "afrikaans fal": "AFRF",
  "afrikaans first additional language": "AFRF",
  "afrikaans hl": "AFRH",
  "afrikaans home language": "AFRH",
  "afrikaans sal": "AFRS",
  "business studies": "BUS",
  "mathematics": "MATH",
  "mathematical literacy": "MATL",
  "physical sciences": "PHYS",
  "life sciences": "LIFE",
  "accounting": "ACC",
  "geography": "GEO",
  "history": "HIS",
  "economics": "ECO",
  "tourism": "TOUR",
  "computer applications technology": "CAT",
  "information technology": "IT",
  "consumer studies": "CON",
  "agricultural sciences": "AGR",
  "engineering graphics and design": "EGD",
  "visual arts": "ART",
};

function resolveCapsCode(subject: string): string | null {
  const lower = subject.toLowerCase().trim();
  if (CATALOG_TO_CAPS[lower]) return CATALOG_TO_CAPS[lower];
  // Fallback: check if any CAPS_TOPICS key is found via substring
  for (const [code] of Object.entries(CAPS_TOPICS)) {
    if (lower.includes(code.toLowerCase()) || code.toLowerCase().includes(lower.slice(0, 4))) {
      return code;
    }
  }
  return null;
}

// ============================================================
// TYPES
// ============================================================

export interface DBECatalogEntry {
  subject: string;
  paperNumber: number;
  isMemo: boolean;
  year: number;
  session: string;
  language: string;
  url: string;
  linkText: string;
}

export interface PaperMemoPair {
  subject: string;
  year: number;
  session: string;
  paperNumber: number;
  language: string;
  paper: DBECatalogEntry | null;
  memo: DBECatalogEntry | null;
}

export interface IngestionSummary {
  total: number;
  completed: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export interface TopicCoverageRecord {
  subject: string;
  year: number;
  paperNumber: number;
  topicId: number | null;
  topicName: string;
  coverageWeight: number;
  questionCount: number;
  totalMarks: number;
  questionTypes: string[];
}

export interface MemoRubricRecord {
  subject: string;
  year: number;
  paperNumber: number;
  topicId: number | null;
  topicName: string;
  markAllocation: number;
  keyConcepts: string[];
  commonErrors: string[];
  cognitiveLevel: "knowledge" | "comprehension" | "analysis" | "synthesis";
}

// ============================================================
// CORE FETCH & PARSE
// ============================================================

/**
 * Fetches a PDF from the given URL and extracts full text using pdf-parse v2.
 * Raw text is returned only in-memory and must never be persisted to DB or disk.
 * Applies a 30-second timeout. On failure, throws with a descriptive message.
 */
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export async function fetchAndParsePDF(url: string, retries = 2): Promise<string> {
  const timeoutMs = 45_000;
  const tmpPath = join(tmpdir(), `dbe_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`);

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": BROWSER_UA,
          "Accept": "application/pdf,application/octet-stream,*/*",
          "Accept-Language": "en-ZA,en;q=0.9,af;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Referer": "https://www.education.gov.za/",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "same-origin",
        },
      });

      clearTimeout(timer);

      if (response.status === 403) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
          continue;
        }
        throw new Error(`HTTP 403 Access Denied — DBE site blocked this request after ${retries + 1} attempts: ${url}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching PDF: ${url}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 100) throw new Error(`PDF too small (${buffer.length} bytes) — likely an error page`);

      await writeFile(tmpPath, buffer);

      const parser = new PDFParse({ url: pathToFileURL(tmpPath).href });
      const result = await parser.getText();
      let text = (result as any).text as string ?? "";

      // ── OCR fallback for scanned / image-only / garbled PDFs ──────
      // Trigger when pdf-parse returns:
      //   (a) empty or nearly-empty text (typical of scanned memos), OR
      //   (b) garbled text — alphabetic-character ratio below 35 % (the
      //       fingerprint of mojibake/CID-encoded fonts where pdf-parse
      //       returns punctuation soup but no real letters).
      // Gated by env var ENABLE_OCR_FALLBACK so it doesn't unleash OpenAI
      // vision costs unintentionally.
      if (process.env.ENABLE_OCR_FALLBACK === "1" && buffer.length > 1024) {
        const collapsed = text.replace(/\s+/g, " ").trim();
        const compact = collapsed.length;
        const alphaCount = (collapsed.match(/[A-Za-z]/g) || []).length;
        const alphaRatio = compact > 0 ? alphaCount / compact : 0;
        const isEmpty = compact < 200;
        const isGarbled = compact >= 200 && compact < 4000 && alphaRatio < 0.35;
        if (isEmpty || isGarbled) {
          try {
            const ocrText = await ocrPdfWithOpenAI(buffer, url);
            const ocrAlpha = (ocrText.match(/[A-Za-z]/g) || []).length;
            // Accept OCR result if it has materially more alphabetic content
            // than the pdf-parse output (guards against hallucinated empties).
            if (ocrText && ocrAlpha > Math.max(alphaCount, 80)) {
              console.log(
                `[OCR] Fallback recovered ${ocrText.length} chars (alpha ${ocrAlpha} vs ${alphaCount}) for ${url}`,
              );
              text = ocrText;
            } else {
              console.warn(
                `[OCR] Fallback produced no usable text (${ocrText.length} chars, alpha ${ocrAlpha}) for ${url}`,
              );
            }
          } catch (ocrErr: any) {
            console.warn(`[OCR] Fallback failed for ${url}: ${ocrErr?.message ?? String(ocrErr)}`);
          }
        }
      }

      return text;
    } catch (err: any) {
      clearTimeout(timer);
      if (attempt < retries && !String(err?.message).includes("403")) {
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      throw err;
    } finally {
      unlink(tmpPath).catch(() => {});
    }
  }
  throw new Error(`fetchAndParsePDF: exhausted retries for ${url}`);
}

/**
 * OCR fallback for scanned / image-only PDFs that pdf-parse cannot read.
 * Sends the PDF buffer to OpenAI's Responses API as an `input_file` and
 * asks the model to transcribe the visible text verbatim (preserving
 * QUESTION/MEMO numbering so the downstream regex splitter still works).
 *
 * Cost-controlled: caller must already have gated this on a near-empty
 * pdf-parse result via ENABLE_OCR_FALLBACK=1.
 *
 * Returns the transcribed text on success; throws on any error so the
 * caller can fall back to the (possibly empty) pdf-parse output.
 */
export async function ocrPdfWithOpenAI(buffer: Buffer, sourceUrl: string): Promise<string> {
  const client = getIngestionOpenAI();
  if (!client) throw new Error("OpenAI client unavailable for OCR fallback");

  // 25 MB cap — OpenAI file-input limit; larger PDFs are usually corrupt anyway.
  if (buffer.length > 25 * 1024 * 1024) {
    throw new Error(`PDF too large for OCR fallback: ${buffer.length} bytes`);
  }

  const dataUrl = `data:application/pdf;base64,${buffer.toString("base64")}`;
  const filename = (sourceUrl.split("/").pop() || "memo.pdf").replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 60);

  const resp = await (client as any).responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              "Transcribe ALL visible text in this PDF verbatim, preserving line breaks and any " +
              "section headings such as 'QUESTION 1', 'VRAAG 2', 'MEMORANDUM', '1.1', '2.1.1' etc. " +
              "Do not summarise, translate, or add commentary. Output ONLY the raw text.",
          },
          { type: "input_file", filename, file_data: dataUrl },
        ],
      },
    ],
  });

  const txt: string =
    (resp as any).output_text ??
    ((resp as any).output ?? [])
      .flatMap((o: any) => o?.content ?? [])
      .map((c: any) => c?.text ?? "")
      .join("\n");

  return (typeof txt === "string" ? txt : "").trim();
}

// ============================================================
// CONTENT HASHING — integrity verification
// ============================================================

/**
 * Normalises extracted PDF text before hashing.
 * Strips leading/trailing whitespace per line, collapses blank lines,
 * and normalises line endings — so that minor PDF re-render differences
 * (different compression, metadata timestamps, etc.) do not produce
 * false hash mismatches when the verbatim content is identical.
 */
function normalizeForHash(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .trim();
}

/**
 * Computes a SHA-256 hex hash of the given text after normalisation.
 * Used to verify stored verbatim content against re-fetched source PDFs.
 */
export function computeContentHash(text: string): string {
  return createHash("sha256").update(normalizeForHash(text), "utf8").digest("hex");
}

// ============================================================
// QUALITY CROSS-CHECK — accuracy scoring + predictive rating
// ============================================================

/**
 * Computes a quality score (0–100) for an extracted question text.
 *
 * Criteria:
 *  - Length adequacy  (too short = garbled/truncated)
 *  - Control-character / PDF-artifact ratio
 *  - Repeated-character runs (OCR glitches)
 *  - Sentence structure presence
 *  - Bonus for numbered questions and maths notation
 */
function scoreText(text: string, isQuestion: boolean): { score: number; flag: "clean" | "partial" | "garbled" } {
  const t = text.trim();
  let score = 100;

  // ── Length penalty ────────────────────────────────────────
  if (t.length < 20) score -= 60;
  else if (t.length < 60) score -= 30;
  else if (t.length < 120) score -= 10;

  // ── Control / garbage characters ─────────────────────────
  const ctrlChars = (t.match(/[\x00-\x08\x0E-\x1F\x80-\x9F]/g) ?? []).length;
  const ctrlRatio = ctrlChars / Math.max(t.length, 1);
  if (ctrlRatio > 0.05) score -= 40;
  else if (ctrlRatio > 0.01) score -= 20;

  // ── Unusual unicode / garbled symbols ────────────────────
  const strange = (t.match(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F\u2000-\u206F\u2200-\u22FF]/gu) ?? []).length;
  const strangeRatio = strange / Math.max(t.length, 1);
  if (strangeRatio > 0.12) score -= 30;
  else if (strangeRatio > 0.04) score -= 15;

  // ── Repeated-character runs ───────────────────────────────
  if (/(.)\1{5,}/.test(t)) score -= 20;

  // ── Positive signals ─────────────────────────────────────
  if (isQuestion && /^\d/.test(t)) score += 5;            // starts with question number
  if (/[.?!:;]/.test(t)) score += 5;                      // has sentence structure
  if (/[=+÷×√∑∫∈αβγ]/u.test(t)) score += 5;              // maths / science notation

  score = Math.max(0, Math.min(100, score));
  const flag: "clean" | "partial" | "garbled" =
    score >= 75 ? "clean" : score >= 45 ? "partial" : "garbled";
  return { score, flag };
}

export function computeQualityScore(questionText: string, memoText: string | null): {
  qualityScore: number;
  accuracyFlag: "clean" | "partial" | "garbled";
  questionQualityScore: number;
  questionAccuracyFlag: "clean" | "partial" | "garbled";
  memoQualityScore: number;
  memoAccuracyFlag: "clean" | "partial" | "garbled" | "unscored";
} {
  const q = scoreText(questionText, true);

  let memoQualityScore = 0;
  let memoAccuracyFlag: "clean" | "partial" | "garbled" | "unscored" = "unscored";

  if (memoText && memoText.trim().length > 10) {
    const m = scoreText(memoText, false);
    memoQualityScore = m.score;
    memoAccuracyFlag = m.flag;
  }

  // Combined overall = average of question + memo (if memo present), else question only
  const combined = memoQualityScore > 0
    ? Math.round((q.score + memoQualityScore) / 2)
    : q.score;
  const combinedFlag: "clean" | "partial" | "garbled" =
    combined >= 75 ? "clean" : combined >= 45 ? "partial" : "garbled";

  return {
    qualityScore: combined,
    accuracyFlag: combinedFlag,
    questionQualityScore: q.score,
    questionAccuracyFlag: q.flag,
    memoQualityScore,
    memoAccuracyFlag,
  };
}

/**
 * Computes a predictive exam-likelihood rating (0–100) for a question.
 *
 * Factors:
 *  - Year recency (2022–2024 papers weighted higher)
 *  - Question marks (higher-mark questions appear regularly)
 *  - Cognitive level (analysis/synthesis tend to recur)
 *  - Memo presence (paired questions are more authoritative)
 */
export function computePredictiveRating(
  year: number,
  marks: number | null,
  cognitiveLevel: string | null,
  hasMemo: boolean,
  subjectYearCounts: Map<number, number>
): number {
  let rating = 50; // baseline

  // ── Recency bonus ──────────────────────────────────────────
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  if (age <= 2) rating += 20;
  else if (age <= 4) rating += 12;
  else if (age <= 6) rating += 6;
  else if (age >= 10) rating -= 10;

  // ── Marks-based weighting ─────────────────────────────────
  if (marks !== null) {
    if (marks >= 10) rating += 15;
    else if (marks >= 5) rating += 8;
    else if (marks <= 1) rating -= 5;
  }

  // ── Cognitive-level weighting ─────────────────────────────
  if (cognitiveLevel === "analysis" || cognitiveLevel === "synthesis") rating += 10;
  else if (cognitiveLevel === "comprehension") rating += 5;

  // ── Memo coverage ─────────────────────────────────────────
  if (hasMemo) rating += 8;

  // ── Frequency boost (topic appears in multiple years) ─────
  const appearsInYears = Array.from(subjectYearCounts.values()).filter((v) => v > 0).length;
  if (appearsInYears >= 5) rating += 10;
  else if (appearsInYears >= 3) rating += 5;

  return Math.max(0, Math.min(100, rating));
}

// ============================================================
// VERBATIM QUESTION EXTRACTION — NSC paper parser
// ============================================================

interface VerbatimQuestion {
  questionNumber: string;
  questionText: string;
  memoText: string | null;
  marks: number | null;
  cognitiveLevel: "knowledge" | "comprehension" | "analysis" | "synthesis";
  mcqOptions: Array<{ letter: "A" | "B" | "C" | "D" | "E"; text: string }> | null;
  correctOption: "A" | "B" | "C" | "D" | "E" | null;
}

/**
 * Splits raw paper text into sections by QUESTION N / VRAAG N headers.
 * Returns a map of question number → raw section text.
 */
// Multi-language equivalents of "QUESTION" found in NSC papers.
// Used as headers in the form "POTŠIŠO 1", "UMBUZO 2", etc.
const QUESTION_KEYWORDS = [
  "QUESTION", "QUESTIONS",                            // English
  "VRAAG", "VRAE",                                    // Afrikaans
  "POTŠIŠO", "POTSISO", "DIPOTŠIŠO", "DIPOTSISO",     // Sepedi
  "POTSO", "DIPOTSO",                                 // Sesotho / Setswana
  "UMBUZO", "IMIBUZO",                                // isiZulu / isiXhosa / isiNdebele
  "UMBUTO", "IMIBUTO",                                // siSwati
  "XIVUTISO", "SWIVUTISO",                            // Xitsonga
  "MBUDZISO", "MBUDZISO",                             // Tshivenda
];

// Multi-language section markers (e.g. "SECTION A", "KAROLO YA A").
const SECTION_KEYWORDS = [
  "SECTION", "AFDELING",                              // English / Afrikaans
  "KAROLO YA", "KAROLO",                              // Sepedi / Sesotho / Setswana
  "ICANDELO", "INGXENYE",                             // isiXhosa / isiZulu
  "ISIGABA", "SIGABA",                                // isiNdebele / siSwati
  "XIYENGE",                                          // Xitsonga
  "TSHIPIDA",                                         // Tshivenda
];

function buildKeywordAlternation(keywords: string[]): string {
  // Sort by length desc so longer multi-word forms (e.g. "KAROLO YA") win first.
  return keywords
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+"))
    .join("|");
}

export function splitByQuestionHeaders(text: string): Map<string, string> {
  // 1) Try multi-language QUESTION headers (relaxed: allow trailing text after the number).
  const headerAlt = buildKeywordAlternation(QUESTION_KEYWORDS);
  // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp -- alternation built from a hard-coded keyword whitelist
  const headerRe = new RegExp(
    `(?:^|\\n)\\s*(?:${headerAlt})\\s+(\\d+[A-Z]?)\\b`,
    "gi"
  );
  const sections = collectSectionsFromMatches(text, headerRe, (m) => m[1].toUpperCase());
  if (sections.size >= 2) return sections;

  // 2) Fallback: plain sequential numbered top-level items like "1.", "2." at line start.
  //    Only accept when we find at least 2 strictly increasing numbers starting from 1 or 2,
  //    so we don't mistakenly match cover-page instruction lists.
  const numericRe = /(?:^|\n)\s*(\d{1,2})\.(?!\d)\s+\S/g;
  const candidates: Array<{ num: number; index: number }> = [];
  let nm: RegExpExecArray | null;
  while ((nm = numericRe.exec(text)) !== null) {
    const n = parseInt(nm[1], 10);
    if (n >= 1 && n <= 30) candidates.push({ num: n, index: nm.index });
  }
  if (candidates.length >= 2) {
    // Find the longest sequential run starting at 1 (preferred) or 2.
    let bestRun: Array<{ num: number; index: number }> = [];
    for (let startIdx = 0; startIdx < candidates.length; startIdx++) {
      const startNum = candidates[startIdx].num;
      if (startNum > 2) continue;
      const run: Array<{ num: number; index: number }> = [candidates[startIdx]];
      let expected = startNum + 1;
      for (let j = startIdx + 1; j < candidates.length; j++) {
        if (candidates[j].num === expected) {
          run.push(candidates[j]);
          expected++;
        } else if (candidates[j].num <= run[run.length - 1].num) {
          // Reset on regression — usually a TOC repeat further down the page
          continue;
        }
      }
      if (run.length > bestRun.length) bestRun = run;
    }
    if (bestRun.length >= 2) {
      const numbered = new Map<string, string>();
      for (let i = 0; i < bestRun.length; i++) {
        const start = bestRun[i].index;
        const end = i + 1 < bestRun.length ? bestRun[i + 1].index : text.length;
        numbered.set(String(bestRun[i].num), text.slice(start, end).trim());
      }
      return numbered;
    }
  }

  // 3) Section-level fallback: "SECTION A", "AFDELING B", "KAROLO YA A", etc.
  const sectionAlt = buildKeywordAlternation(SECTION_KEYWORDS);
  // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp -- alternation built from a hard-coded keyword whitelist
  const sectionRe = new RegExp(
    `(?:^|\\n)\\s*(?:${sectionAlt})\\s+([A-E])\\b`,
    "gi"
  );
  const lastByLetter = new Map<string, number>();
  let sm: RegExpExecArray | null;
  while ((sm = sectionRe.exec(text)) !== null) {
    // Use last occurrence so cover/TOC repeats don't pull section start backwards.
    lastByLetter.set(sm[1].toUpperCase(), sm.index);
  }
  if (lastByLetter.size >= 2) {
    const arr = Array.from(lastByLetter.entries()).sort((a, b) => a[1] - b[1]);
    const sectMap = new Map<string, string>();
    for (let i = 0; i < arr.length; i++) {
      const start = arr[i][1];
      const end = i + 1 < arr.length ? arr[i + 1][1] : text.length;
      sectMap.set(arr[i][0], text.slice(start, end).trim());
    }
    return sectMap;
  }

  // 4) If we found exactly 1 keyword-headed section, return it (better than nothing).
  return sections;
}

function collectSectionsFromMatches(
  text: string,
  re: RegExp,
  keyOf: (m: RegExpExecArray) => string
): Map<string, string> {
  const result = new Map<string, string>();
  const matches: Array<{ key: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push({ key: keyOf(m), index: m.index });
  }
  // Dedupe: keep first occurrence of each key (later occurrences are usually
  // continuation references in the body of the paper).
  const seen = new Set<string>();
  const filtered: typeof matches = [];
  for (const match of matches) {
    if (seen.has(match.key)) continue;
    seen.add(match.key);
    filtered.push(match);
  }
  for (let i = 0; i < filtered.length; i++) {
    const start = filtered[i].index;
    const end = i + 1 < filtered.length ? filtered[i + 1].index : text.length;
    result.set(filtered[i].key, text.slice(start, end).trim());
  }
  return result;
}

/**
 * Extracts sub-questions from a question section block.
 * Matches patterns like "1.1", "1.1.1", "2.3" at the start of a line.
 *
 * If `qNum` is numeric, only sub-questions sharing that parent number are
 * returned. If it's a section letter (e.g. "A"), every numeric sub-question
 * inside the section block is returned.
 */
function extractSubQuestions(sectionText: string, qNum: string): Array<{ num: string; text: string; marks: number | null }> {
  const results: Array<{ num: string; text: string; marks: number | null }> = [];
  const isNumericParent = /^\d+[A-Z]?$/.test(qNum);
  // For numeric parents, only match `qNum.X[.Y]`. For non-numeric (section letters),
  // match any `D.D[.D]` numbered sub-item inside the block.
  const headPattern = isNumericParent
    ? `${qNum.replace(/[A-Z]$/, "")}\\.\\d+(?:\\.\\d+)?`
    : `\\d{1,2}\\.\\d+(?:\\.\\d+)?`;
  // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp -- pattern is built from validated structural data, not user input
  const subRe = new RegExp(
    `(?:^|\\n)\\s*(${headPattern})\\s+(.+?)(?=\\n\\s*\\d+\\.\\d|\\n\\s*QUESTION|\\n\\s*VRAAG|\\n\\s*TOTAL|$)`,
    "gis"
  );
  let sm: RegExpExecArray | null;
  while ((sm = subRe.exec(sectionText)) !== null) {
    const rawText = sm[2].replace(/\s+/g, " ").trim();
    // Extract marks from trailing [N] or (N)
    const marksMatch = rawText.match(/\[(\d+)\]\s*$|\((\d+)\)\s*$|\((\d+)\s*marks?\)\s*$/i);
    const marks = marksMatch
      ? parseInt(marksMatch[1] ?? marksMatch[2] ?? marksMatch[3], 10)
      : null;
    results.push({ num: sm[1].trim(), text: rawText, marks });
  }
  return results;
}

/**
 * AI-assisted fallback splitter for unstructured language papers.
 * Calls OpenAI to break the raw paper text into discrete numbered questions
 * with paired memo answers. Gated to language subjects only (token cost control).
 */
async function aiSplitLanguagePaper(
  paperText: string,
  memoText: string | null,
  subject: string
): Promise<VerbatimQuestion[]> {
  const ai = getIngestionOpenAI();
  if (!ai) return [];
  const truncatedPaper = paperText.slice(0, 14000);
  const truncatedMemo = memoText ? memoText.slice(0, 8000) : "";
  const sys =
    `You are an NSC Grade 12 ${subject} paper parser. Extract every distinct exam question from the paper text. ` +
    `Return STRICT JSON only: {"questions":[{"number":"1.1","text":"...","memo":"... or null","marks": N or null}]}. ` +
    `Use the paper's own question numbering verbatim (e.g. 1.1, 1.2.1, 2, 3.4). Skip cover-page instructions, mark schedules, ` +
    `section headers, and table-of-contents lines. Maximum 60 questions. Each text up to 600 chars. Memo up to 400 chars.`;
  const user = `PAPER TEXT:\n${truncatedPaper}\n\n---\n\nMEMO TEXT:\n${truncatedMemo}`;
  try {
    const resp = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4000,
    });
    const raw = resp.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    const arr: any[] = Array.isArray(parsed?.questions) ? parsed.questions : [];
    return arr
      .slice(0, 60)
      .map((q: any) => {
        const text = String(q?.text ?? "").trim();
        const memo = q?.memo ? String(q.memo).trim() : null;
        const marksRaw = typeof q?.marks === "number" ? q.marks : Number(q?.marks);
        const marks = Number.isFinite(marksRaw) && marksRaw > 0 && marksRaw <= 150 ? Math.floor(marksRaw) : null;
        return {
          questionNumber: String(q?.number ?? "1").slice(0, 16) || "1",
          questionText: text.slice(0, 4000),
          memoText: memo ? memo.slice(0, 2000) : null,
          marks,
          cognitiveLevel: detectCognitiveLevel(text),
          mcqOptions: null,
          correctOption: null,
        } as VerbatimQuestion;
      })
      .filter((q) => q.questionText.length >= 10);
  } catch (err) {
    console.warn(`[DBE] aiSplitLanguagePaper failed for ${subject}:`, (err as any)?.message ?? err);
    return [];
  }
}

/**
 * Extracts verbatim questions from a paper + paired memo.
 * Stores each extracted question (with its verbatim memo answer) in dbe_verbatim_questions.
 * Returns the count of questions stored.
 */
export async function extractAndStoreVerbatimQuestions(
  paperText: string,
  memoText: string | null,
  subject: string,
  year: number,
  session: string,
  paperNumber: number,
  language: string,
  sourcePaperUrl: string,
  sourceMemoUrl: string | null
): Promise<number> {
  const paperSections = splitByQuestionHeaders(paperText);
  const memoSections = memoText ? splitByQuestionHeaders(memoText) : new Map<string, string>();

  const toInsert: VerbatimQuestion[] = [];

  if (paperSections.size === 0) {
    // No structural headers detected. For language papers, ask the AI to split.
    if (isLanguageAiFallbackSubject(subject) && paperText.trim().length > 1000) {
      const aiQs = await aiSplitLanguagePaper(paperText, memoText, subject);
      if (aiQs.length > 1) {
        toInsert.push(...aiQs);
      }
    }
    if (toInsert.length === 0) {
      // Last-ditch fallback: store the whole paper text as a single "Q1" entry
      const fallbackText = paperText.slice(0, 8000).trim();
      const fallbackMemo = memoText ? memoText.slice(0, 8000).trim() : null;
      const fallbackOpts = extractMcqOptions(fallbackText);
      toInsert.push({
        questionNumber: "1",
        questionText: fallbackText,
        memoText: fallbackMemo,
        marks: null,
        cognitiveLevel: "knowledge",
        mcqOptions: fallbackOpts.length >= 2 ? fallbackOpts : null,
        correctOption: extractMcqAnswer(fallbackMemo),
      });
    }
  } else {
    for (const [qNum, paperSection] of paperSections) {
      const memoSection = memoSections.get(qNum) ?? null;
      const subs = extractSubQuestions(paperSection, qNum);

      if (subs.length === 0) {
        // No sub-questions detected — store the whole section
        const memoSubText = memoSection ? memoSection.slice(0, 4000).trim() : null;
        const sectionText = paperSection.slice(0, 4000).trim();
        const sectionOpts = extractMcqOptions(sectionText);
        toInsert.push({
          questionNumber: qNum,
          questionText: sectionText,
          memoText: memoSubText,
          marks: null,
          cognitiveLevel: detectCognitiveLevel(paperSection),
          mcqOptions: sectionOpts.length >= 2 ? sectionOpts : null,
          correctOption: sectionOpts.length >= 2 ? extractMcqAnswer(memoSubText) : null,
        });
      } else {
        for (const sub of subs) {
          // Find the corresponding memo sub-answer
          const memoSubRe = new RegExp(
            `(?:^|\\n)\\s*${sub.num.replace(".", "\\.")}\\s+(.+?)(?=\\n\\s*${qNum}\\.\\d|\\n\\s*QUESTION|\\n\\s*VRAAG|$)`,
            "is"
          );
          const memoSubMatch = memoSection ? memoSection.match(memoSubRe) : null;
          const memoSubText = memoSubMatch ? memoSubMatch[1].replace(/\s+/g, " ").trim().slice(0, 2000) : null;
          const subOpts = extractMcqOptions(sub.text);

          toInsert.push({
            questionNumber: sub.num,
            questionText: sub.text.slice(0, 4000),
            memoText: memoSubText,
            marks: sub.marks,
            cognitiveLevel: detectCognitiveLevel(sub.text),
            mcqOptions: subOpts.length >= 2 ? subOpts : null,
            correctOption: subOpts.length >= 2 ? extractMcqAnswer(memoSubText) : null,
          });
        }
      }
    }
  }

  // If the structural parser still produced only 1 question for a language paper
  // with substantial text, the headers were unrecognised — try the AI splitter.
  if (
    toInsert.length <= 1 &&
    isLanguageAiFallbackSubject(subject) &&
    paperText.trim().length > 1000
  ) {
    const aiQs = await aiSplitLanguagePaper(paperText, memoText, subject);
    if (aiQs.length > 1) {
      toInsert.length = 0;
      toInsert.push(...aiQs);
    }
  }

  // Delete any existing verbatim questions for this exact paper before reinserting
  await db
    .delete(dbeVerbatimQuestions)
    .where(
      and(
        eq(dbeVerbatimQuestions.subject, subject),
        eq(dbeVerbatimQuestions.year, year),
        eq(dbeVerbatimQuestions.paperNumber, paperNumber),
        eq(dbeVerbatimQuestions.language, language)
      )
    );

  // Pre-build year→count map for predictive rating
  const yearCountMap = new Map<number, number>();
  yearCountMap.set(year, toInsert.length);

  // Truncation cap removed — store every parsed question per the final QA
  // requirement. We still log the running subject total for visibility.
  const existingCount = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(dbeVerbatimQuestions)
    .where(eq(dbeVerbatimQuestions.subject, subject));
  const currentTotal = existingCount[0]?.count ?? 0;
  const capped = toInsert;
  console.log(`[DBE] Storing ${subject} ${year} P${paperNumber}: ${capped.length} questions (subject running total: ${currentTotal + capped.length})`);

  // Memo-Driven Marking Engine: parse memo into structured scheme at
  // ingestion so the learner-facing endpoints don't have to do it lazily.
  // Note: the delete-then-insert pattern above guarantees that any
  // re-ingestion of a paper rebuilds `mark_scheme` from the fresh memo
  // text — there is no stale cache path through this function. Other
  // callers that mutate `memo_text` on existing rows (e.g. the admin
  // fill-missing endpoints in `server/routes.ts`) are responsible for
  // recomputing `markScheme` via `parseMemoToScheme` in the same UPDATE.
  const { parseMemoToScheme } = await import("./memo-marker");

  for (const q of capped) {
    const contentHash = computeContentHash(q.questionText + "|" + (q.memoText ?? ""));
    const { qualityScore, accuracyFlag } = computeQualityScore(q.questionText, q.memoText ?? null);
    const predictiveRating = computePredictiveRating(
      year,
      q.marks ?? null,
      q.cognitiveLevel ?? null,
      !!(q.memoText && q.memoText.trim().length > 20),
      yearCountMap
    );
    const markScheme = parseMemoToScheme(q.memoText ?? null, q.marks ?? 1);
    await db.insert(dbeVerbatimQuestions).values({
      subject,
      year,
      session,
      paperNumber,
      language,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      memoText: q.memoText,
      marks: q.marks,
      cognitiveLevel: q.cognitiveLevel,
      contentHash,
      sourcePaperUrl,
      sourceMemoUrl,
      qualityScore,
      accuracyFlag,
      predictiveRating,
      mcqOptions: q.mcqOptions,
      correctOption: q.correctOption,
      markScheme: markScheme,
    });
  }

  return capped.length;
}

// ============================================================
// INTEGRITY VERIFICATION — re-fetch and compare hash
// ============================================================

export interface VerificationResult {
  subject: string;
  year: number;
  paperNumber: number;
  isMemo: boolean;
  storedHash: string;
  recomputedHash: string;
  passed: boolean;
  errorMessage?: string;
}

/**
 * Re-fetches PDFs from education.gov.za and compares their SHA-256 hash
 * against the stored hash in dbe_ingestion_log.
 * Returns a pass/fail result per paper.
 */
export async function verifyContentIntegrity(
  subject?: string,
  year?: number
): Promise<VerificationResult[]> {
  const conditions = [];
  if (subject) conditions.push(eq(dbeIngestionLog.subject, subject));
  if (year) conditions.push(eq(dbeIngestionLog.year, year));
  conditions.push(eq(dbeIngestionLog.status, "completed"));

  const logs = await db
    .select()
    .from(dbeIngestionLog)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Only verify entries that have a stored hash
  const hashLogs = logs.filter((l) => l.contentHash);
  const results: VerificationResult[] = [];

  // Load catalog to find URLs
  const catalog: DBECatalogEntry[] = (await import("./data/dbe-papers-catalog.json")).default as DBECatalogEntry[];

  for (const log of hashLogs) {
    const match = catalog.find(
      (e) =>
        e.subject === log.subject &&
        e.year === log.year &&
        e.paperNumber === log.paperNumber &&
        e.isMemo === log.isMemo
    );

    if (!match) {
      results.push({
        subject: log.subject,
        year: log.year,
        paperNumber: log.paperNumber,
        isMemo: log.isMemo,
        storedHash: log.contentHash!,
        recomputedHash: "",
        passed: false,
        errorMessage: "Catalog entry not found",
      });
      continue;
    }

    try {
      const freshText = await fetchAndParsePDF(match.url);
      const freshHash = computeContentHash(freshText);
      const passed = freshHash === log.contentHash;

      // Update verification status in DB
      await db
        .update(dbeIngestionLog)
        .set({
          verifiedAt: new Date(),
          verificationStatus: passed ? "passed" : "failed",
        })
        .where(eq(dbeIngestionLog.id, log.id));

      results.push({
        subject: log.subject,
        year: log.year,
        paperNumber: log.paperNumber,
        isMemo: log.isMemo,
        storedHash: log.contentHash!,
        recomputedHash: freshHash,
        passed,
      });

      await sleep(2000);
    } catch (err: any) {
      results.push({
        subject: log.subject,
        year: log.year,
        paperNumber: log.paperNumber,
        isMemo: log.isMemo,
        storedHash: log.contentHash!,
        recomputedHash: "",
        passed: false,
        errorMessage: err?.message ?? String(err),
      });
    }
  }

  return results;
}

// ============================================================
// PAPER–MEMO PAIRING
// ============================================================

function parsePaperNumberFromLinkText(linkText?: string): number | null {
  if (!linkText) return null;
  const m = linkText.match(/(?:Memo|P)\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Groups catalog entries by subject + year + session + paperNumber + language,
 * pairing each question paper (isMemo: false) with its corresponding memo (isMemo: true).
 * Papers without a matching memo are still returned with memo: null.
 */
export function pairPapersWithMemos(catalog: DBECatalogEntry[]): PaperMemoPair[] {
  const pairMap = new Map<string, PaperMemoPair>();

  for (const entry of catalog) {
    const pn = entry.paperNumber ?? parsePaperNumberFromLinkText(entry.linkText) ?? 1;
    const key = `${entry.subject}|${entry.year}|${entry.session}|${pn}|${entry.language}`;

    if (!pairMap.has(key)) {
      pairMap.set(key, {
        subject: entry.subject,
        year: entry.year,
        session: entry.session,
        paperNumber: pn,
        language: entry.language,
        paper: null,
        memo: null,
      });
    }

    const pair = pairMap.get(key)!;
    if (entry.isMemo) {
      pair.memo = entry;
    } else {
      pair.paper = entry;
    }
  }

  return Array.from(pairMap.values()).filter((p) => p.paper !== null || p.memo !== null);
}

// ============================================================
// INGESTION LOG HELPERS
// ============================================================

export async function logIngestionStart(
  subject: string,
  paperNumber: number,
  year: number,
  session: string,
  isMemo: boolean
): Promise<number> {
  const [row] = await db
    .insert(dbeIngestionLog)
    .values({
      subject,
      paperNumber,
      year,
      session,
      isMemo,
      status: "pending",
    })
    .returning({ id: dbeIngestionLog.id });
  return row.id;
}

export async function logIngestionComplete(
  id: number,
  contentHash?: string,
  questionCount?: number
): Promise<void> {
  await db
    .update(dbeIngestionLog)
    .set({
      status: "completed",
      ...(contentHash ? { contentHash } : {}),
      ...(questionCount !== undefined ? { questionCount } : {}),
    })
    .where(eq(dbeIngestionLog.id, id));
}

async function logIngestionFailure(id: number, errorMessage: string): Promise<void> {
  await db
    .update(dbeIngestionLog)
    .set({ status: "failed", errorMessage })
    .where(eq(dbeIngestionLog.id, id));
}

// ============================================================
// SLEEP HELPER — 2-second delay between fetches
// ============================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// SAFETY GUARD — prevents accidental raw content persistence
// ============================================================

/**
 * Unit-testable guard: verifies that no record being written to any DBE table
 * contains more than 500 characters of continuous text. This prevents accidentally
 * persisting raw DBE passages as derived intelligence fields.
 */
export function assertNoRawContent(record: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string" && value.length > 500) {
      throw new Error(
        `assertNoRawContent: field "${key}" contains ${value.length} characters — exceeds 500 char limit. Raw content must not be persisted.`
      );
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string" && item.length > 500) {
          throw new Error(
            `assertNoRawContent: array field "${key}" contains an item with ${item.length} characters — exceeds 500 char limit. Raw content must not be persisted.`
          );
        }
      }
    }
  }
}

// ============================================================
// COGNITIVE LEVEL DETECTION
// ============================================================

const KNOWLEDGE_VERBS = [
  "define", "state", "list", "name", "identify", "label", "recall", "recognise", "recognize",
  "what is", "who is", "where is", "when did", "give", "write down", "state two",
];

const COMPREHENSION_VERBS = [
  "explain", "describe", "summarise", "summarize", "outline", "illustrate",
  "classify", "paraphrase", "interpret", "convert", "distinguish", "infer",
];

const ANALYSIS_VERBS = [
  "analyse", "analyze", "compare", "contrast", "differentiate", "examine",
  "calculate", "determine", "investigate", "test", "break down", "categorise", "categorize",
];

const SYNTHESIS_VERBS = [
  "evaluate", "discuss", "argue", "justify", "assess", "critique", "recommend",
  "propose", "design", "formulate", "debate", "synthesise", "synthesize", "to what extent",
];

function detectCognitiveLevel(
  text: string
): "knowledge" | "comprehension" | "analysis" | "synthesis" {
  const lower = text.toLowerCase();

  let synthesisCount = 0;
  let analysisCount = 0;
  let comprehensionCount = 0;
  let knowledgeCount = 0;

  for (const v of SYNTHESIS_VERBS) if (lower.includes(v)) synthesisCount++;
  for (const v of ANALYSIS_VERBS) if (lower.includes(v)) analysisCount++;
  for (const v of COMPREHENSION_VERBS) if (lower.includes(v)) comprehensionCount++;
  for (const v of KNOWLEDGE_VERBS) if (lower.includes(v)) knowledgeCount++;

  if (synthesisCount > 0) return "synthesis";
  if (analysisCount > 0) return "analysis";
  if (comprehensionCount > 0) return "comprehension";
  return "knowledge";
}

// ============================================================
// MARKS EXTRACTION HELPERS
// ============================================================

/**
 * Extracts mark values from patterns like "[8]", "(8 marks)", "(8)", "8 marks"
 * as found in NSC question papers and memos.
 */
function extractMarksFromText(text: string): number[] {
  const marks: number[] = [];

  // Pattern: [8] or [10]
  const bracketPattern = /\[(\d{1,3})\]/g;
  let m: RegExpExecArray | null;
  while ((m = bracketPattern.exec(text)) !== null) {
    const v = parseInt(m[1], 10);
    if (v > 0 && v <= 150) marks.push(v);
  }

  // Pattern: (8 marks) or (8 mark)
  const marksPattern = /\((\d{1,3})\s*marks?\)/gi;
  while ((m = marksPattern.exec(text)) !== null) {
    const v = parseInt(m[1], 10);
    if (v > 0 && v <= 150) marks.push(v);
  }

  return marks;
}

/**
 * Splits paper text into numbered question sections.
 * Returns an array of { questionNumber, sectionText } objects.
 */
function splitIntoQuestionSections(
  text: string
): Array<{ questionNumber: string; sectionText: string }> {
  const sections: Array<{ questionNumber: string; sectionText: string }> = [];

  // Match top-level question headers: "QUESTION 1", "Question 1", or just "1." at start of line
  const questionHeaderRegex = /^(?:QUESTION|Question)\s+(\d+)|^(\d+)\.\s+/gm;

  let lastIndex = 0;
  let lastQNum = "0";
  let match: RegExpExecArray | null;

  while ((match = questionHeaderRegex.exec(text)) !== null) {
    if (lastIndex > 0) {
      sections.push({
        questionNumber: lastQNum,
        sectionText: text.slice(lastIndex, match.index),
      });
    }
    lastQNum = match[1] || match[2];
    lastIndex = match.index;
  }

  if (lastIndex > 0) {
    sections.push({
      questionNumber: lastQNum,
      sectionText: text.slice(lastIndex),
    });
  }

  // If no recognisable sections found, treat the whole text as one section
  if (sections.length === 0 && text.trim().length > 0) {
    sections.push({ questionNumber: "1", sectionText: text });
  }

  return sections;
}

// ============================================================
// QUESTION TYPE DETECTION
// ============================================================

function detectQuestionTypes(sectionText: string): string[] {
  const types: Set<string> = new Set();
  const lower = sectionText.toLowerCase();

  if (
    /multiple.?choice|choose the correct|select the correct/i.test(lower) ||
    extractMcqOptions(sectionText).length >= 2
  ) {
    types.add("mcq");
  }
  if (/write an essay|essay on|discuss in an essay/i.test(lower)) {
    types.add("essay");
  }
  if (types.size === 0) {
    types.add("structured");
  }

  return Array.from(types);
}

// ============================================================
// MCQ OPTION EXTRACTION
// ============================================================

export interface McqOption {
  letter: "A" | "B" | "C" | "D" | "E";
  text: string;
}

/**
 * Extracts real A/B/C/D (and occasionally E) options from a question
 * section. Handles the common DBE NSC styles:
 *   "A  apartheid"            (letter then whitespace)
 *   "A.  apartheid"
 *   "A) apartheid"
 *   "(A) apartheid"
 *   "A apartheid\nB ..."
 *
 * Returns ordered options. Caller can attach to question payload so the
 * learner sees the real choices, not generic "Option A/B/C/D".
 */
export function extractMcqOptions(sectionText: string): McqOption[] {
  if (!sectionText) return [];
  const out: McqOption[] = [];
  const seen = new Set<string>();

  // Anchored to start of line; stops at the next option letter or end of text.
  // We use a multiline pattern that captures letter + body until the next option.
  const pattern =
    /(^|\n)\s*\(?([A-E])[\.\)]?\s+([^\n][^\n]{0,400}?)(?=(?:\n\s*\(?[A-E][\.\)]?\s+)|\n{2,}|$)/g;

  let m: RegExpExecArray | null;
  while ((m = pattern.exec(sectionText)) !== null) {
    const letter = m[2] as McqOption["letter"];
    const text = m[3].trim().replace(/\s+/g, " ");
    if (!text || text.length < 1) continue;
    if (seen.has(letter)) continue;
    // Reject if the body looks like a sub-question header rather than an option
    if (/^(QUESTION|Question|MARKS|TOTAL)\b/.test(text)) continue;
    seen.add(letter);
    out.push({ letter, text: text.slice(0, 240) });
  }

  // Must have a contiguous A,B,(C[,D[,E]]) — otherwise reject
  const letters = out.map(o => o.letter).join("");
  const valid = ["AB", "ABC", "ABCD", "ABCDE"];
  if (!valid.includes(letters)) return [];
  return out;
}

/**
 * Best-effort extraction of the correct MCQ answer letter from a memo block.
 * Looks for patterns like "1.1 C", "1.1  C ✓", "Answer: B".
 */
export function extractMcqAnswer(memoText: string | null | undefined): "A" | "B" | "C" | "D" | "E" | null {
  if (!memoText) return null;
  const patterns = [
    /^\s*\d+(?:\.\d+)*\s+([A-E])\b/m,
    /\bAnswer\s*[:\-]?\s*([A-E])\b/i,
    /\bCorrect\s*[:\-]?\s*([A-E])\b/i,
    /^\s*([A-E])\s*✓/m,
  ];
  for (const p of patterns) {
    const m = memoText.match(p);
    if (m) return m[1] as "A" | "B" | "C" | "D" | "E";
  }
  return null;
}

// ============================================================
// TOPIC LOOKUP FROM DB
// ============================================================

/**
 * Retrieves topic IDs for a given subject from the database topics table.
 * Falls back gracefully if the database has no seeded topics for this subject.
 */
async function getTopicIdsForSubject(
  subjectCode: string
): Promise<Map<string, number>> {
  const topicMap = new Map<string, number>();

  try {
    const rows = await db
      .select({ id: topics.id, name: topics.name, capsCode: topics.capsCode })
      .from(topics);

    for (const row of rows) {
      if (row.capsCode && row.capsCode.startsWith(subjectCode + "-")) {
        topicMap.set(row.name.toLowerCase(), row.id);
      }
    }
  } catch {
    // Non-fatal: topic IDs will be null in records if DB is unavailable
  }

  return topicMap;
}

// ============================================================
// EXTRACTION — TOPIC COVERAGE
// ============================================================

/**
 * Extracts topic coverage intelligence from raw question paper text.
 * Uses CAPS_TOPICS definitions as the topic vocabulary.
 * Writes results to dbe_topic_coverage.
 * Raw text variable is never persisted — only derived counts are stored.
 */
export async function extractTopicCoverage(
  paperText: string,
  subject: string,
  year: number,
  paperNumber: number
): Promise<TopicCoverageRecord[]> {
  const records: TopicCoverageRecord[] = [];

  const resolvedCode = resolveCapsCode(subject);
  const capsTopicList = resolvedCode ? (CAPS_TOPICS[resolvedCode] ?? []) : [];
  const subjectCode = resolvedCode ?? subject.toUpperCase().slice(0, 4);

  const topicIdMap = await getTopicIdsForSubject(subjectCode);
  const paperTextLower = paperText.toLowerCase();
  const questionSections = splitIntoQuestionSections(paperText);

  for (const topic of capsTopicList) {
    const topicKeywords = [
      topic.name,
      ...(topic.nameAfrikaans ? [topic.nameAfrikaans] : []),
      // Split multi-word topic names into individual key terms (skip very common short words)
      ...topic.name
        .split(/[\s,&]+/)
        .filter((w) => w.length > 3)
        .map((w) => w.toLowerCase()),
    ];

    // Count keyword appearances in the full paper text
    let coverageWeight = 0;
    for (const kw of topicKeywords) {
      const kwLower = kw.toLowerCase();
      let idx = 0;
      while ((idx = paperTextLower.indexOf(kwLower, idx)) !== -1) {
        coverageWeight++;
        idx += kwLower.length;
      }
    }

    if (coverageWeight === 0) continue; // Topic not mentioned — skip

    // Count question sections that contain this topic's keywords
    let questionCount = 0;
    let totalMarks = 0;
    const questionTypesSet: Set<string> = new Set();

    for (const section of questionSections) {
      const sectionLower = section.sectionText.toLowerCase();
      const mentioned = topicKeywords.some((kw) => sectionLower.includes(kw.toLowerCase()));

      if (mentioned) {
        questionCount++;
        const sectionMarks = extractMarksFromText(section.sectionText);
        totalMarks += sectionMarks.reduce((a, b) => a + b, 0);
        const types = detectQuestionTypes(section.sectionText);
        types.forEach((t) => questionTypesSet.add(t));
      }
    }

    const topicId = topicIdMap.get(topic.name.toLowerCase()) ?? null;

    const record: TopicCoverageRecord = {
      subject,
      year,
      paperNumber,
      topicId,
      topicName: topic.name,
      coverageWeight,
      questionCount,
      totalMarks,
      questionTypes: Array.from(questionTypesSet),
    };

    assertNoRawContent({
      topicName: record.topicName,
      subject: record.subject,
    });

    records.push(record);

    // Persist derived intelligence only — no raw text
    await db.insert(dbeTopicCoverage).values({
      subject,
      year,
      paperNumber,
      topicId,
      coverageWeight,
      questionCount,
      totalMarks,
      questionTypes: Array.from(questionTypesSet),
    });
  }

  return records;
}

// ============================================================
// EXTRACTION — MEMO RUBRICS
// ============================================================

/**
 * Pairs memo answer blocks with corresponding paper questions,
 * extracts key concepts and common error patterns, and writes to dbe_memo_rubrics.
 * Raw text is never persisted.
 */
export async function extractMemoRubric(
  memoText: string,
  paperText: string,
  subject: string,
  year: number,
  paperNumber: number
): Promise<MemoRubricRecord[]> {
  const records: MemoRubricRecord[] = [];

  const resolvedCode = resolveCapsCode(subject);
  const capsTopicList = resolvedCode ? (CAPS_TOPICS[resolvedCode] ?? []) : [];
  const subjectCode = resolvedCode ?? subject.toUpperCase().slice(0, 4);
  const topicIdMap = await getTopicIdsForSubject(subjectCode);

  const memoSections = splitIntoQuestionSections(memoText);
  const paperSections = splitIntoQuestionSections(paperText);

  // Build a map of paper sections by question number for pairing
  const paperSectionMap = new Map<string, string>();
  for (const s of paperSections) {
    paperSectionMap.set(s.questionNumber, s.sectionText);
  }

  // Process each memo section
  for (const memoSection of memoSections) {
    const correspondingPaperSection = paperSectionMap.get(memoSection.questionNumber) ?? "";

    // Determine which topic this question section is most likely about
    let bestTopic: (typeof capsTopicList)[number] | null = null;
    let bestScore = 0;

    const combinedText = (correspondingPaperSection + " " + memoSection.sectionText).toLowerCase();

    for (const topic of capsTopicList) {
      const keywords = [
        topic.name,
        ...(topic.nameAfrikaans ? [topic.nameAfrikaans] : []),
        ...topic.name.split(/[\s,&]+/).filter((w) => w.length > 3),
      ];

      let score = 0;
      for (const kw of keywords) {
        if (combinedText.includes(kw.toLowerCase())) score++;
      }

      if (score > bestScore) {
        bestScore = score;
        bestTopic = topic;
      }
    }

    // Extract mark allocation from the memo section
    const memoMarks = extractMarksFromText(memoSection.sectionText);
    const markAllocation = memoMarks.reduce((a, b) => a + b, 0);

    // Extract key concepts: look for noun phrases after "accept", "award", "allocate",
    // or lines starting with tick marks (✓) or dashes indicating accepted answers
    const keyConcepts: string[] = [];

    const acceptLines = memoSection.sectionText.split("\n").filter((line) => {
      const l = line.toLowerCase().trim();
      return l.startsWith("✓") ||
        l.startsWith("•") ||
        l.startsWith("-") ||
        /^accept[:\s]/.test(l) ||
        /^award[:\s]/.test(l) ||
        /^any (one|two|three|four|of) the following/.test(l);
    });

    for (const line of acceptLines) {
      // Strip leading markers and clean up
      const cleaned = line
        .replace(/^[✓•\-\s]+/, "")
        .replace(/\[.*?\]/g, "")
        .replace(/\(.*?\)/g, "")
        .trim();

      if (cleaned.length > 3 && cleaned.length <= 200) {
        keyConcepts.push(cleaned);
      }
    }

    // Extract common errors: look for "do not accept", "penalise if", "incorrect if",
    // "not acceptable", "wrong" indicators in memo
    const commonErrors: string[] = [];

    const errorLines = memoSection.sectionText.split("\n").filter((line) => {
      const l = line.toLowerCase().trim();
      return l.includes("do not accept") ||
        l.includes("penalis") ||
        l.includes("incorrect if") ||
        l.includes("not acceptable") ||
        l.includes("penalize") ||
        l.includes("note:") ||
        l.includes("do not award");
    });

    for (const line of errorLines) {
      const cleaned = line.trim();
      if (cleaned.length > 3 && cleaned.length <= 300) {
        commonErrors.push(cleaned);
      }
    }

    // Determine cognitive level from the question paper text for this question
    const cognitiveLevel = detectCognitiveLevel(
      correspondingPaperSection || memoSection.sectionText
    );

    const topicId = bestTopic ? (topicIdMap.get(bestTopic.name.toLowerCase()) ?? null) : null;
    const topicName = bestTopic ? bestTopic.name : subject;

    // Safety guard before persisting
    const safeKeyConcepts = keyConcepts.slice(0, 20).map((c) => c.slice(0, 200));
    const safeCommonErrors = commonErrors.slice(0, 10).map((e) => e.slice(0, 300));

    assertNoRawContent({
      topicName,
      subject,
    });

    const record: MemoRubricRecord = {
      subject,
      year,
      paperNumber,
      topicId,
      topicName,
      markAllocation,
      keyConcepts: safeKeyConcepts,
      commonErrors: safeCommonErrors,
      cognitiveLevel,
    };

    records.push(record);

    // Persist derived intelligence only — no raw text ever stored
    await db.insert(dbeMemoRubrics).values({
      subject,
      year,
      paperNumber,
      topicId,
      markAllocation,
      keyConcepts: safeKeyConcepts,
      commonErrors: safeCommonErrors,
      cognitiveLevel,
    });
  }

  return records;
}

// ============================================================
// UPDATE TOPIC FREQUENCY AGGREGATES
// ============================================================

/**
 * Recalculates dbe_topic_frequency aggregates for a subject after ingestion.
 * Reads from dbe_topic_coverage to compute appearances_count, avg_marks, etc.
 * Updates or inserts into dbe_topic_frequency.
 */
export async function updateTopicFrequency(subject: string): Promise<void> {
  // Aggregate coverage data grouped by topicId
  const coverageRows = await db
    .select()
    .from(dbeTopicCoverage)
    .where(eq(dbeTopicCoverage.subject, subject));

  const topicStats = new Map<
    number,
    { appearances: number; yearsSeen: Set<number>; totalMarks: number }
  >();

  for (const row of coverageRows) {
    if (!row.topicId) continue;

    if (!topicStats.has(row.topicId)) {
      topicStats.set(row.topicId, { appearances: 0, yearsSeen: new Set(), totalMarks: 0 });
    }

    const stats = topicStats.get(row.topicId)!;
    if (row.questionCount > 0) {
      stats.appearances += row.questionCount;
      stats.yearsSeen.add(row.year);
      stats.totalMarks += row.totalMarks;
    }
  }

  // Sort topics by appearances to assign frequency rank
  const sorted = Array.from(topicStats.entries()).sort(
    (a, b) => b[1].appearances - a[1].appearances
  );

  for (let rank = 0; rank < sorted.length; rank++) {
    const [topicId, stats] = sorted[rank];
    const totalYearsSampled = stats.yearsSeen.size;
    const avgMarks =
      stats.appearances > 0 ? Math.round(stats.totalMarks / stats.appearances) : 0;

    // Check if a record already exists for this subject + topicId
    const existing = await db
      .select({ id: dbeTopicFrequency.id })
      .from(dbeTopicFrequency)
      .where(
        and(
          eq(dbeTopicFrequency.subject, subject),
          eq(dbeTopicFrequency.topicId, topicId)
        )
      );

    if (existing.length > 0) {
      await db
        .update(dbeTopicFrequency)
        .set({
          appearancesCount: stats.appearances,
          totalYearsSampled,
          avgMarksPerAppearance: avgMarks,
          frequencyRank: rank + 1,
        })
        .where(eq(dbeTopicFrequency.id, existing[0].id));
    } else {
      await db.insert(dbeTopicFrequency).values({
        subject,
        topicId,
        appearancesCount: stats.appearances,
        totalYearsSampled,
        avgMarksPerAppearance: avgMarks,
        frequencyRank: rank + 1,
      });
    }
  }
}

// ============================================================
// BATCH INGESTION RUNNER
// ============================================================

/**
 * Processes all (or filtered) catalog entries in sequence — never parallel —
 * to respect the education.gov.za source server.
 * Enforces a minimum 2-second delay between each PDF fetch.
 * Raw text is kept in-memory only during processing and is never persisted.
 */
// Grade 12 NSC catalogue spans 2015–2025 (11 years). Setting the cap to the
// full eleven-year window so a single ingestion pass covers every available
// year per subject without truncation.
const MAX_YEARS_PER_SUBJECT = 11;

export async function runIngestionBatch(
  catalog: DBECatalogEntry[],
  options?: { subject?: string; year?: number; force?: boolean }
): Promise<IngestionSummary> {
  const summary: IngestionSummary = {
    total: 0,
    completed: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  // Ringfence: data asset / programming subjects are not ingestible as text PDFs
  if (options?.subject && isDataAssetSubject(options.subject)) {
    summary.total = 0;
    summary.skipped = 0;
    (summary as any).dataAsset = true;
    return summary;
  }

  let filtered = catalog;

  if (options?.subject) {
    // Also filter out any data asset entries that snuck into a bulk run
    filtered = filtered.filter(
      (e) =>
        e.subject.toLowerCase() === options.subject!.toLowerCase() &&
        !isDataAssetSubject(e.subject)
    );
  }
  if (options?.year) {
    filtered = filtered.filter((e) => e.year === options.year);
  }

  // Always exclude data asset subjects from any ingestion run
  filtered = filtered.filter((e) => !isDataAssetSubject(e.subject));

  // Sort newest-first so we get the most recent 10 years
  filtered = [...filtered].sort((a, b) => b.year - a.year);

  const pairs = pairPapersWithMemos(filtered);
  summary.total = pairs.length;

  const processedSubjects = new Set<string>();

  // Force re-download: wipe existing questions + logs for the target subject+year
  if (options?.force && options?.subject) {
    // NULL out attempts FK first to avoid the dbe_verbatim_questions FK constraint
    if (options.year) {
      await db.execute(sql`
        UPDATE attempts SET dbe_verbatim_question_id = NULL
        WHERE dbe_verbatim_question_id IN (
          SELECT id FROM dbe_verbatim_questions WHERE subject = ${options.subject} AND year = ${options.year}
        )
      `);
    } else {
      await db.execute(sql`
        UPDATE attempts SET dbe_verbatim_question_id = NULL
        WHERE dbe_verbatim_question_id IN (
          SELECT id FROM dbe_verbatim_questions WHERE subject = ${options.subject}
        )
      `);
    }
    const delWhere = options.year
      ? and(eq(dbeVerbatimQuestions.subject, options.subject), eq(dbeVerbatimQuestions.year, options.year))
      : eq(dbeVerbatimQuestions.subject, options.subject);
    await db.delete(dbeVerbatimQuestions).where(delWhere);

    const logDelWhere = options.year
      ? and(eq(dbeIngestionLog.subject, options.subject), eq(dbeIngestionLog.year, options.year))
      : eq(dbeIngestionLog.subject, options.subject);
    await db.delete(dbeIngestionLog).where(logDelWhere);
    console.log(`[FORCE-REINGEST] Cleared existing data for ${options.subject}${options.year ? ` / ${options.year}` : ""}`);
  }

  // Build set of already-completed (subject, year, paperNumber, isMemo) to skip re-ingestion.
  // IMPORTANT: a paper log row marked "completed" with question_count = 0 is
  // treated as NOT done — those are failed extractions that should be retried
  // automatically on the next run. (Memo rows have no question_count, so they
  // count as done whenever status='completed'.)
  const completedKeys = new Set<string>();
  if (options?.subject && !options?.force) {
    const existingLogs = await db
      .select({
        year: dbeIngestionLog.year,
        paperNumber: dbeIngestionLog.paperNumber,
        isMemo: dbeIngestionLog.isMemo,
        questionCount: dbeIngestionLog.questionCount,
      })
      .from(dbeIngestionLog)
      .where(
        and(
          eq(dbeIngestionLog.subject, options.subject),
          eq(dbeIngestionLog.status, "completed")
        )
      );
    for (const log of existingLogs) {
      const isMemo = !!log.isMemo;
      // Skip empty / single-blob paper extractions so they are retried.
      // question_count == 1 is the sentinel value the old splitter wrote
      // when it could not detect any QUESTION/VRAAG headers and dumped the
      // whole paper as a single Q1 record. With the multi-language splitter
      // and AI fallback now in place, those papers must be re-parsed.
      if (!isMemo && (!log.questionCount || log.questionCount <= 1)) continue;
      completedKeys.add(`${log.year}-${log.paperNumber}-${isMemo ? 1 : 0}`);
    }
  }

  // Track how many distinct years are already in DB for this subject
  const alreadyDoneYears = new Set<number>();
  for (const key of completedKeys) {
    const yr = Number(key.split("-")[0]);
    if (!isNaN(yr)) alreadyDoneYears.add(yr);
  }

  // Years ingested in this batch (new ones only)
  const batchYears = new Set<number>();

  for (const pair of pairs) {
    // ── Stop condition: 10 years reached ──────────────────────────
    const totalDistinctYears = alreadyDoneYears.size + batchYears.size;
    if (totalDistinctYears >= MAX_YEARS_PER_SUBJECT && !batchYears.has(pair.year) && !alreadyDoneYears.has(pair.year)) {
      summary.skipped++;
      continue;
    }

    // ── Skip already-completed pairs ──────────────────────────────
    const paperKey = `${pair.year}-${pair.paperNumber}-0`;
    const memoKey = `${pair.year}-${pair.paperNumber}-1`;
    const paperAlreadyDone = completedKeys.has(paperKey);
    const memoAlreadyDone = completedKeys.has(memoKey);
    if ((!pair.paper || paperAlreadyDone) && (!pair.memo || memoAlreadyDone)) {
      summary.skipped++;
      continue;
    }
    let rawPaperText: string | null = null;
    let rawMemoText: string | null = null;
    let paperLogId: number | null = null;

    // ── 1. Fetch and process question paper ──────────────────────
    if (pair.paper) {
      paperLogId = await logIngestionStart(
        pair.subject,
        pair.paperNumber,
        pair.year,
        pair.session,
        false
      );

      try {
        rawPaperText = await fetchAndParsePDF(pair.paper.url);
        const paperHash = computeContentHash(rawPaperText);

        // Extract CAPS topic coverage intelligence
        await extractTopicCoverage(rawPaperText, pair.subject, pair.year, pair.paperNumber);

        await logIngestionComplete(paperLogId, paperHash);
        summary.completed++;
      } catch (err: any) {
        const msg = err?.message ?? String(err);
        await logIngestionFailure(paperLogId, msg);
        summary.failed++;
        summary.errors.push(`[${pair.subject} ${pair.year} P${pair.paperNumber}] ${msg}`);
      }

      await sleep(2000);
    }

    // ── 2. Fetch and process memo ─────────────────────────────────
    if (pair.memo) {
      const memoLogId = await logIngestionStart(
        pair.subject,
        pair.paperNumber,
        pair.year,
        pair.session,
        true
      );

      try {
        rawMemoText = await fetchAndParsePDF(pair.memo.url);
        const memoHash = computeContentHash(rawMemoText);

        // Extract memo rubric intelligence (needs paper text for question pairing)
        await extractMemoRubric(rawMemoText, rawPaperText ?? "", pair.subject, pair.year, pair.paperNumber);

        await logIngestionComplete(memoLogId, memoHash);
        summary.completed++;
      } catch (err: any) {
        const msg = err?.message ?? String(err);
        await logIngestionFailure(memoLogId, msg);
        summary.failed++;
        summary.errors.push(`[${pair.subject} ${pair.year} P${pair.paperNumber} memo] ${msg}`);
      }

      await sleep(2000);
    }

    // ── 3. Extract verbatim questions (paper text required) ───────
    // Done after both fetches so memo text can be paired with paper questions.
    if (rawPaperText) {
      try {
        const questionCount = await extractAndStoreVerbatimQuestions(
          rawPaperText,
          rawMemoText,
          pair.subject,
          pair.year,
          pair.session,
          pair.paperNumber,
          pair.language,
          pair.paper?.url ?? "",
          pair.memo?.url ?? null
        );

        // Update paper log entry with how many questions were extracted
        if (paperLogId) {
          await db
            .update(dbeIngestionLog)
            .set({ questionCount })
            .where(eq(dbeIngestionLog.id, paperLogId));
        }
      } catch (err: any) {
        summary.errors.push(
          `[${pair.subject} ${pair.year} P${pair.paperNumber} verbatim] ${err?.message ?? String(err)}`
        );
      }
    }

    // Explicit null — raw text must not outlive this block
    rawPaperText = null;
    rawMemoText = null;

    processedSubjects.add(pair.subject);

    if (!pair.paper && !pair.memo) {
      summary.skipped++;
    }
  }

  // After all pairs for a batch, recalculate topic frequency aggregates per subject
  for (const subject of Array.from(processedSubjects)) {
    try {
      await updateTopicFrequency(subject);
    } catch (err: any) {
      summary.errors.push(`[updateTopicFrequency ${subject}] ${err?.message ?? String(err)}`);
    }
  }

  return summary;
}

// ============================================================
// REBUILD MASTERY INTELLIGENCE FROM EXISTING DB QUESTIONS
// ============================================================

export interface RebuildSummary {
  subjectsProcessed: string[];
  coverageRowsCreated: number;
  frequencyRowsUpdated: number;
  errors: string[];
}

/**
 * Rebuilds dbe_topic_coverage and dbe_topic_frequency from verbatim questions
 * already stored in the DB — no PDF re-download needed.
 * Safe to run multiple times; clears and re-creates coverage for each subject.
 */
async function syncCapsTopicsToDb(): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  const allSubjects = await db.select().from(subjects);
  const subjectByCode = new Map<string, number>();
  for (const s of allSubjects) {
    subjectByCode.set(s.code, s.id);
  }

  const existingTopics = await db.select().from(topics);
  const existingByCapsCode = new Map<string, typeof existingTopics[0]>();
  for (const t of existingTopics) {
    if (t.capsCode) existingByCapsCode.set(t.capsCode, t);
  }

  for (const [subjectCode, topicList] of Object.entries(CAPS_TOPICS)) {
    const subjectId = subjectByCode.get(subjectCode);
    if (!subjectId) continue;

    for (let i = 0; i < topicList.length; i++) {
      const topic = topicList[i];
      const existing = existingByCapsCode.get(topic.capsCode);

      if (existing) {
        if (existing.name !== topic.name || existing.nameAfrikaans !== topic.nameAfrikaans) {
          await db.update(topics)
            .set({ name: topic.name, nameAfrikaans: topic.nameAfrikaans, orderIndex: i })
            .where(eq(topics.id, existing.id));
          updated++;
        }
      } else {
        await db.insert(topics).values({
          subjectId,
          name: topic.name,
          nameAfrikaans: topic.nameAfrikaans,
          capsCode: topic.capsCode,
          orderIndex: i,
        });
        created++;
      }
    }
  }

  return { created, updated };
}

export async function rebuildMasteryFromExisting(
  filterSubject?: string
): Promise<RebuildSummary> {
  const summary: RebuildSummary = {
    subjectsProcessed: [],
    coverageRowsCreated: 0,
    frequencyRowsUpdated: 0,
    errors: [],
  };

  try {
    const syncResult = await syncCapsTopicsToDb();
    if (syncResult.created > 0 || syncResult.updated > 0) {
      console.log(`[rebuildMastery] Synced CAPS topics: ${syncResult.created} created, ${syncResult.updated} updated`);
    }
  } catch (syncErr: any) {
    summary.errors.push(`[syncCapsTopics] ${syncErr?.message ?? String(syncErr)}`);
  }

  // Get distinct subject/year/paper combos from existing verbatim questions
  const papers = await db
    .selectDistinct({
      subject: dbeVerbatimQuestions.subject,
      year: dbeVerbatimQuestions.year,
      paperNumber: dbeVerbatimQuestions.paperNumber,
    })
    .from(dbeVerbatimQuestions)
    .where(
      filterSubject
        ? eq(dbeVerbatimQuestions.subject, filterSubject)
        : undefined
    );

  const subjectsToProcess = [...new Set(papers.map((p) => p.subject))];

  // Clear existing coverage for subjects being rebuilt
  for (const subject of subjectsToProcess) {
    await db
      .delete(dbeTopicCoverage)
      .where(eq(dbeTopicCoverage.subject, subject));
  }

  for (const paper of papers) {
    try {
      const resolvedCode = resolveCapsCode(paper.subject);
      if (!resolvedCode) {
        continue;
      }

      const capsTopicList = CAPS_TOPICS[resolvedCode] ?? [];
      if (capsTopicList.length === 0) {
        continue;
      }

      const topicIdMap = await getTopicIdsForSubject(resolvedCode);

      // Load all verbatim question text for this paper
      const questions = await db
        .select({
          questionText: dbeVerbatimQuestions.questionText,
          memoText: dbeVerbatimQuestions.memoText,
          marks: dbeVerbatimQuestions.marks,
          cognitiveLevel: dbeVerbatimQuestions.cognitiveLevel,
        })
        .from(dbeVerbatimQuestions)
        .where(
          and(
            eq(dbeVerbatimQuestions.subject, paper.subject),
            eq(dbeVerbatimQuestions.year, paper.year),
            eq(dbeVerbatimQuestions.paperNumber, paper.paperNumber)
          )
        );

      const combinedText = questions
        .map((q) => q.questionText + " " + (q.memoText ?? ""))
        .join("\n");
      const combinedLower = combinedText.toLowerCase();

      for (const topic of capsTopicList) {
        const keywords = [
          topic.name,
          topic.nameAfrikaans,
          ...topic.name.split(/[\s,&]+/).filter((w) => w.length > 3),
        ].filter(Boolean);

        let coverageWeight = 0;
        for (const kw of keywords) {
          const kwLower = kw.toLowerCase();
          let idx = 0;
          while ((idx = combinedLower.indexOf(kwLower, idx)) !== -1) {
            coverageWeight++;
            idx += kwLower.length;
          }
        }

        if (coverageWeight === 0) continue;

        const matchingQs = questions.filter((q) => {
          const ql = (q.questionText + " " + (q.memoText ?? "")).toLowerCase();
          return keywords.some((kw) => ql.includes(kw.toLowerCase()));
        });

        const questionCount = matchingQs.length;
        const totalMarks = matchingQs.reduce((sum, q) => sum + (q.marks ?? 0), 0);
        const typesSet = new Set<string>();
        for (const q of matchingQs) {
          detectQuestionTypes(q.questionText).forEach((t) => typesSet.add(t));
        }

        const topicId = topicIdMap.get(topic.name.toLowerCase()) ?? null;

        await db.insert(dbeTopicCoverage).values({
          subject: paper.subject,
          year: paper.year,
          paperNumber: paper.paperNumber,
          topicId,
          coverageWeight,
          questionCount,
          totalMarks,
          questionTypes: Array.from(typesSet),
        });

        summary.coverageRowsCreated++;
      }
    } catch (err: any) {
      summary.errors.push(
        `[${paper.subject} ${paper.year} P${paper.paperNumber}] ${err?.message ?? String(err)}`
      );
    }
  }

  // Rebuild topic frequency for all processed subjects
  for (const subject of subjectsToProcess) {
    try {
      await updateTopicFrequency(subject);
      summary.frequencyRowsUpdated++;
      summary.subjectsProcessed.push(subject);
    } catch (err: any) {
      summary.errors.push(`[updateTopicFrequency ${subject}] ${err?.message ?? String(err)}`);
    }
  }

  return summary;
}
