/**
 * Memo Artifact Cleaning
 * ----------------------
 * DBE marking guidelines are examiner documents, not answer keys. Alongside the
 * actual expected answer they carry three kinds of text that must never reach a
 * learner or, worse, become an "expected key term" the learner is marked against:
 *
 *   1. LAYOUT / SOURCE CODES — "M194 F37", "M53/F165", "M 85/86", "F199/200".
 *      These are cross-references into the examiner's own source documents.
 *      They survive PDF extraction and look like content to a tokenizer.
 *
 *   2. MARKER INSTRUCTIONS — "(Any order)", "Enige volgorde", "Any TWO relevant
 *      responses", "Max. (4)", "NOTE:", "NOTA:", "LET WEL", "(2 x 2)".
 *      These tell the marker HOW to award marks. They are not the answer.
 *
 *   3. TICK GLYPHS — "✓" marks one awarded mark in DBE convention.
 *
 * Why this module exists
 * ----------------------
 * A real learner answered Hospitality Studies 2025 P1 Q1.4.2 (row 85619) with
 * "A\nD" and scored 0/2. The memo was:
 *
 *     "A C Enige volgorde M194 F37 (2)"
 *
 * The marking engine tokenized that whole string and told the learner the
 * expected key terms were `enige`, `volgorde`, `m194`, `f37` — i.e. it was
 * marking the answer against the examiner's formatting notes. The only real
 * content in that memo is "A C".
 *
 * Corpus scan of the 38,299 released rows found this is not a fringe case:
 * "enige"/"any" appear as expected key terms 3,489 times, "max" 608 times,
 * and 406 rows carry a literal M##/F## layout code as a key term.
 *
 * Two consumption points (both matter)
 * ------------------------------------
 *   - `cleanMemoText()` runs at PARSE time (server/memo-marker.ts) so newly
 *     ingested / re-parsed memos never produce artifact keywords.
 *   - `sanitizeKeywords()` runs at MARK time as a defensive filter, because
 *     `mark_scheme` is persisted jsonb and ~31,600 released rows already have
 *     artifact keywords baked into stored schemes. Those rows are marked from
 *     the stored scheme and would otherwise stay broken until a full re-ingest.
 */

// ---------------------------------------------------------------
// 1. Layout / source codes
// ---------------------------------------------------------------

/**
 * An examiner source code: "M194", "F37", "M53/F165", "M 85/86", "F199/200".
 *
 * Guarded deliberately: a bare "M12" could in principle be legitimate content
 * (a Maths label, a motorway). We therefore only strip these when the memo
 * shows the *pair* signature — an M-code and an F-code both present — or when
 * the code sits alone at the end of a line, which is where the marking
 * guideline's cross-reference column lands after PDF flattening.
 */
const MF_PAIR_RE = /\bM\s?\d+(?:\/\d+)*\s*[\/\s]\s*F\s?\d+(?:\/\d+)*\b/gi;
const M_CODE_RE = /\bM\s?\d+(?:\/\d+)*\b/gi;
const F_CODE_RE = /\bF\s?\d+(?:\/\d+)*\b/gi;

/** True when the text carries the M##…F## cross-reference signature. */
function hasSourceCodePair(text: string): boolean {
  return /\bM\s?\d+/i.test(text) && /\bF\s?\d+/i.test(text);
}

function stripSourceCodes(text: string): string {
  let out = text.replace(MF_PAIR_RE, " ");
  if (hasSourceCodePair(text)) {
    // Both families present — safe to strip the stragglers on their own lines.
    out = out.replace(M_CODE_RE, " ").replace(F_CODE_RE, " ");
  } else {
    // Only strip a lone code when it is trailing furniture at end of line.
    out = out
      .replace(/\s+M\s?\d+(?:\/\d+)*\s*$/gim, " ")
      .replace(/\s+F\s?\d+(?:\/\d+)*\s*$/gim, " ");
  }
  return out;
}

// ---------------------------------------------------------------
// 2. Marker instructions
// ---------------------------------------------------------------

/**
 * Instruction clauses removed wherever they appear. Ordered most-specific
 * first so "Any TWO relevant responses" is consumed before a bare "Any TWO".
 *
 * These are CLAUSE-level removals, not word-level. That precision matters:
 * blanket-dropping the word "two" would corrupt a legitimate answer such as
 * "the two chambers of the heart", whereas dropping the clause "Any TWO
 * relevant responses" removes exactly the instruction and nothing else.
 */
const INSTRUCTION_CLAUSES: RegExp[] = [
  // "NOTE: …" / "NOTA: …" / "LET WEL …" / "NB: …" — instruction to end of line.
  /\b(?:NOTE|NOTA|N\.?B)\s*:[^\n]*/gi,
  /\bLET\s+WEL\b[^\n]*/gi,
  // "(Any order)" / "in any order" / "Enige volgorde"
  /\(?\s*\b(?:in\s+)?any\s+order\b\s*\)?/gi,
  /\(?\s*\benige\s+volgorde\b\s*\)?/gi,
  // "Any TWO relevant responses/answers/facts/examples/points"
  /\(?\s*\bany\s+(?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|\d+)\b(?:\s+(?:relevant|correct|other|suitable|applicable))*(?:\s+(?:responses?|answers?|facts?|examples?|points?|reasons?|aspects?|factors?))?\s*\)?/gi,
  // Afrikaans equivalent: "Enige TWEE relevante response"
  /\(?\s*\benige\s+(?:EEN|TWEE|DRIE|VIER|VYF|SES|SEWE|AGT|\d+)\b(?:\s+(?:relevante?|korrekte?|ander|toepaslike))*(?:\s+(?:response?|antwoorde?|feite?|voorbeelde?|punte?|redes?|aspekte?|faktore?))?\s*\)?/gi,
  // "Max. (4)" / "Maks. 4" / "Maximum 4"
  /\b(?:Max|Maks|Maximum|Maksimum)\.?\s*\(?\s*\d+\s*\)?/gi,
  // Mark-allocation cells: "(2 x 2)", "(10 × 1)"
  /\(\s*\d+\s*[x×]\s*\d+\s*\)/gi,
  // "(Mark the first TWO only)" style bracketed marker directives
  /\(\s*(?:mark|merk)\s+[^)\n]{0,60}\)/gi,
];

function stripInstructions(text: string): string {
  let out = text;
  for (const re of INSTRUCTION_CLAUSES) out = out.replace(re, " ");
  return out;
}

// ---------------------------------------------------------------
// 3. Public API
// ---------------------------------------------------------------

/**
 * Strip examiner artifacts from raw memo text, leaving only answer content.
 *
 * Tick glyphs are deliberately PRESERVED: `server/memo-marker.ts` counts them
 * to derive per-criterion mark allocations ("✓✓" = 2 marks) before it derives
 * keywords, and its own `cleanLine()` removes them afterwards. Stripping them
 * here would silently destroy mark allocation.
 *
 * @example
 *   cleanMemoText("A C Enige volgorde M194 F37 (2)")  // → "A C (2)"
 *   cleanMemoText("Lewer✓ M22 F76 (1)")               // → "Lewer✓ (1)"
 */
export function cleanMemoText(raw: string | null | undefined): string {
  if (!raw) return "";
  let out = String(raw);
  out = stripSourceCodes(out);
  out = stripInstructions(out);
  // Collapse punctuation debris left behind by the removals — runs of dashes,
  // orphaned bullets, empty brackets, doubled separators.
  out = out
    .replace(/\(\s*\)/g, " ")
    .replace(/(?:^|\s)[-–—]{2,}(?=\s|$)/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+(\r?\n)/g, "$1")
    .replace(/(\r?\n){3,}/g, "\n\n");
  return out.trim();
}

/**
 * True when a memo contains no answer content at all once artifacts are
 * removed — e.g. a memo that was nothing but "M194 F37 (2)". Such a question
 * cannot be auto-marked and must be flagged rather than served as answerable.
 */
export function isMemoContentless(raw: string | null | undefined): boolean {
  const cleaned = cleanMemoText(raw)
    .replace(/[✓✔√]/g, "")
    .replace(/\(\s*\d+\s*\)/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
  return cleaned.length === 0;
}

// ---------------------------------------------------------------
// 4. Defensive keyword filter for ALREADY-STORED mark schemes
// ---------------------------------------------------------------

/**
 * Stemmed tokens that are marker vocabulary, never answer content.
 *
 * This list is applied ONLY to keywords recovered from a persisted
 * `mark_scheme` — by that point the clause structure `cleanMemoText()` relies
 * on has been destroyed, so word-level filtering is the only option left.
 *
 * Terms were chosen from a frequency scan of the 31,606 stored schemes in the
 * released corpus, restricted to words that cannot plausibly carry an answer
 * on their own. Words that are ambiguous in isolation ("two", "one", "mark")
 * are handled by clause removal at parse time and deliberately NOT listed
 * here, to avoid corrupting legitimate answers.
 *
 * Note the values are stored post-stemming (see `lightStem` in memo-marker.ts):
 * "responses" → "response", "any" → "any", "enige" → "enige".
 */
const ARTIFACT_KEYWORDS = new Set<string>([
  // English marker instructions
  "any", "max", "maximum", "note", "nb", "accept", "allow", "award",
  "order", "relevant", "applicable", "suitable", "marker", "candidate",
  // Afrikaans marker instructions
  "enige", "maks", "maksimum", "nota", "aanvaar", "toelaat", "volgorde",
  "relevante", "toepaslik", "kandidaat", "merker",
  // Tokenizer debris
  "--", "---", "x",
]);

/** Layout/source code that became a keyword: "m194", "f37", "m53". */
const CODE_KEYWORD_RE = /^[mf]\s?\d+$/i;

/**
 * Remove marker-instruction and layout-code tokens from a stored scheme's
 * keyword list.
 *
 * Returns the filtered list. An EMPTY result is meaningful: it means the
 * criterion contained nothing but examiner furniture and can never be
 * legitimately satisfied — the caller must drop the criterion rather than
 * mark the learner against it.
 */
export function sanitizeKeywords(keywords: readonly string[] | null | undefined): string[] {
  if (!keywords) return [];
  return keywords.filter((k) => {
    const t = String(k).trim().toLowerCase();
    if (!t) return false;
    if (CODE_KEYWORD_RE.test(t)) return false;
    if (ARTIFACT_KEYWORDS.has(t)) return false;
    // Pure punctuation / digit-only debris carries no answer meaning.
    if (!/\p{L}/u.test(t)) return false;
    return true;
  });
}

/** Exposed for tests and for the ingestion-side reporting scripts. */
export const __testing = { ARTIFACT_KEYWORDS, stripSourceCodes, stripInstructions };
