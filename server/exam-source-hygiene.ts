/**
 * exam-source-hygiene.ts — pure, dependency-free source filtering for every
 * generator that reads `dbe_verbatim_questions`.
 *
 * WHY THIS EXISTS
 * ---------------
 * `/api/flashcards/deck` shipped cards like:
 *
 *   front: "The cost of developing infrastructure in blocks C4 and C5 will be
 *           (more/less) expensive. (1 x 1) (1)"
 *   back:  "More (1) (1 x 1) (1)"
 *
 * Three separate defects in one card:
 *   1. DBE mark notation ("(1 x 1) (1)") leaked to the learner.
 *   2. It depends on a topographic map the learner cannot see — "blocks C4 and
 *      C5" is meaningless without it.
 *   3. The answer teaches nothing.
 *
 * (1) and (2) are pure text problems, so they live here as pure functions with
 * direct unit tests. (3) needs a model and lives in the generators.
 *
 * THE `needs_stimulus` COLUMN IS NOT ENOUGH. It is set on 284 of 61 811
 * released rows (0.46%). The Geography card above is stimulus-dependent and
 * NOT flagged. So the column is treated as one signal among many, never as the
 * authority — text detection does the real work.
 *
 * Bias: these functions are deliberately AGGRESSIVE. A rejected source costs
 * nothing (the bank has 61 811 rows). A card a learner cannot answer costs
 * trust, and trust is the product.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Mark-notation stripping
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DBE cognitive-weighting notation: "(1 x 1)", "(2 x 2)", "(3 × 2)".
 * Always mark bookkeeping, never content.
 */
const MULTIPLIER_RE = /\(\s*\d+\s*[x×*]\s*\d+\s*\)/gi;

/** Section/question totals in square brackets: "[10]", "[ 40 ]". */
const BRACKET_TOTAL_RE = /\[\s*\d+\s*\]/g;

/** Explicit mark words: "(4 marks)", "(1 mark)", "(3 punte)", "(1 punt)". */
const MARK_WORD_RE = /\(\s*\d+\s*(?:marks?|punte|punt)\s*\)/gi;

/**
 * A bare parenthesised integer: "(4)".
 *
 * This is the risky one — "(aq)" and "(more/less)" must survive. Restricting
 * the class to digits only, with nothing else inside, keeps those safe. A bare
 * number in parentheses in a DBE paper is a mark allocation essentially always.
 */
const BARE_NUMBER_PARENS_RE = /\(\s*\d{1,3}\s*\)/g;

/** Marker ticks used throughout DBE memoranda: "√√", "✓", "√". */
const TICK_RE = /[√✓]+/g;

/** Trailing totals lines: "TOTAL: 150", "TOTAAL: 60", "GRAND TOTAL: 300". */
const TOTAL_LINE_RE = /\b(?:GRAND\s+)?(?:TOTAL|TOTAAL|SUBTOTAL|SUBTOTAAL)\s*:?\s*\d+/gi;

/** A leading DBE question number: "2.3.2 ", "1.1 ", "QUESTION 4 ", "VRAAG 4 ". */
const LEADING_QNUM_RE = /^\s*(?:(?:QUESTION|VRAAG)\s+)?\d+(?:\.\d+)*\.?\s+/i;

/**
 * Strip DBE mark notation from a question or memo so nothing that is
 * bookkeeping-for-the-marker reaches a learner-facing card.
 *
 * Order matters: multipliers and mark-words are removed BEFORE the bare-number
 * rule, so "(1 x 1) (1)" loses the multiplier first and the trailing "(1)"
 * second, rather than the bare rule chewing the "1"s out of the multiplier and
 * leaving "( x )" behind.
 *
 * @param opts.stripLeadingQuestionNumber
 *   Remove a leading "2.3.2" / "QUESTION 4". Off by default because a memo
 *   legitimately opens with a numbered list.
 */
export function stripMarkNotation(
  input: string | null | undefined,
  opts: { stripLeadingQuestionNumber?: boolean } = {},
): string {
  if (!input) return "";
  let s = String(input);

  s = s.replace(MULTIPLIER_RE, " ");
  s = s.replace(MARK_WORD_RE, " ");
  s = s.replace(BRACKET_TOTAL_RE, " ");
  s = s.replace(TOTAL_LINE_RE, " ");
  s = s.replace(BARE_NUMBER_PARENS_RE, " ");
  s = s.replace(TICK_RE, " ");

  if (opts.stripLeadingQuestionNumber) {
    s = s.replace(LEADING_QNUM_RE, "");
  }

  // Tidy the debris the removals leave behind.
  s = s.replace(/\(\s*\)/g, " ");          // emptied parentheses
  s = s.replace(/\[\s*\]/g, " ");          // emptied brackets
  s = s.replace(/[ \t]+/g, " ");           // runs of spaces
  s = s.replace(/\s+([,.;:?!])/g, "$1");   // space before punctuation
  s = s.replace(/\s*\n\s*/g, "\n");        // tidy line breaks
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.replace(/^[\s.,;:]+/, "");         // leading punctuation debris
  s = s.replace(/[ \t]+$/gm, "");

  return s.trim();
}

/** True when the text still carries any mark notation. Used by tests + gates. */
export function hasMarkNotation(input: string | null | undefined): boolean {
  if (!input) return false;
  const s = String(input);
  return (
    new RegExp(MULTIPLIER_RE.source, "i").test(s) ||
    new RegExp(MARK_WORD_RE.source, "i").test(s) ||
    new RegExp(BRACKET_TOTAL_RE.source).test(s) ||
    new RegExp(BARE_NUMBER_PARENS_RE.source).test(s) ||
    new RegExp(TICK_RE.source).test(s)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Stimulus-dependency rejection
// ─────────────────────────────────────────────────────────────────────────────

export interface StimulusVerdict {
  /** True when the learner could NOT answer this from the card alone. */
  dependent: boolean;
  /** Machine-readable rule codes that fired, for auditing the rejection rate. */
  reasons: string[];
}

export interface StimulusInput {
  questionText: string | null | undefined;
  memoText?: string | null;
  /** `dbe_verbatim_questions.needs_stimulus` — advisory only, see file header. */
  needsStimulus?: boolean | null;
  /** `dbe_verbatim_questions.stimulus_text` — presence implies dependency. */
  stimulusText?: string | null;
}

/**
 * Named stimulus artefacts followed by an identifier:
 * "FIGURE 2", "SOURCE 1B", "TEXT A", "DIAGRAM 3", "BRON 1B", "FIGUUR 2".
 */
const LABELLED_STIMULUS_RE =
  /\b(?:source|text|figure|diagram|table|map|extract|annexure|addendum|sketch|graph|chart|photograph|picture|cartoon|passage|bron|teks|figuur|diagram|tabel|kaart|uittreksel|bylae|aanhangsel|skets|grafiek|prent|foto|spotprent|leesstuk)\s*[A-Z0-9]{1,3}\b/i;

/**
 * Explicit instructions to consult something external.
 * "Refer to FIGURE 1", "Study the extract", "Verwys na BRON 2".
 */
const REFER_INSTRUCTION_RE =
  /\b(?:refer(?:ring)?\s+to|study|examine|look\s+at|consider\s+the|read\s+the|use\s+the\s+(?:information|data|extract|source|table|map|graph|diagram)|based\s+on\s+the|according\s+to\s+the|with\s+reference\s+to|verwys\s+na|bestudeer|kyk\s+na|lees\s+die|gebruik\s+die|volgens\s+die|met\s+verwysing\s+na)\b/i;

/**
 * Positional deixis — the question points at something laid out on the page.
 * "the table above", "shown below", "the diagram alongside", "hierbo".
 */
const DEIXIS_RE =
  /\b(?:above|below|alongside|opposite|overleaf|on\s+the\s+opposite\s+page|shown|given|provided|attached|hierbo|hieronder|langsaan|oorkant|hiernaas|getoon|gegee|verskaf|aangeheg)\b/i;

/**
 * Map/grid references: "block C4", "blocks C4 and C5", "at spot height 1234",
 * "area B3", "the feature at A". This is the rule that catches the Geography
 * card that started this whole task.
 */
const MAP_GRID_RE =
  /\b(?:block|blocks|grid|square|area|zone|point|feature|landform|spot\s*height|trig(?:onometrical)?\s*(?:beacon|station)|blok|blokke|ruit|gebied|punt|kenmerk|hoogte)\s+(?:[A-Z]\d{1,2}|\d{1,2}[A-Z]|[A-Z])\b(?![a-z])/;

/**
 * Bare definite reference to an unnamed work or artefact:
 * "the passage", "the novel", "the cartoon", "die gedig".
 * Only fires when no quoted title rescues it.
 */
const BARE_ARTEFACT_RE =
  /\b(?:the|this|die|hierdie)\s+(?:passage|extract|novel|poem|drama|play|short\s+story|story|cartoon|comic|advertisement|advert|photograph|picture|image|diagram|sketch|table|graph|chart|map|source|text|article|scenario|case\s+study|stimulus|leesstuk|uittreksel|roman|gedig|drama|toneelstuk|kortverhaal|verhaal|spotprent|advertensie|foto|prent|beeld|diagram|skets|tabel|grafiek|kaart|bron|teks|artikel|senario|gevallestudie)\b/i;

/** A quoted title names the work, so a bare artefact reference is answerable. */
const QUOTED_TITLE_RE = /['"“”‘’][^'"“”‘’]{3,}['"“”‘’]/;

/**
 * Cross-question dependency: "identified in QUESTION 2.3.1", "in VRAAG 4".
 * The learner does not have that question on the flashcard.
 */
const CROSS_QUESTION_RE =
  /\b(?:question|vraag)\s+\d+(?:\.\d+)+/i;

/**
 * Data-response scaffolding: the question hands over numbers the card cannot.
 * "from the information given", "using the data in", "the figures shown".
 */
const DATA_HANDOFF_RE =
  /\b(?:the\s+(?:information|data|figures|statistics|values|readings)\s+(?:given|provided|shown|above|below|in\s+the)|die\s+(?:inligting|data|syfers|statistiek|waardes)\s+(?:gegee|verskaf|getoon|hierbo|hieronder))\b/i;

/**
 * Decide whether a source question depends on a stimulus the learner will not
 * have on a flashcard.
 *
 * A card the learner cannot answer from the card alone is worse than no card,
 * so every rule here rejects on suspicion rather than on proof.
 */
export function isStimulusDependent(input: StimulusInput): StimulusVerdict {
  const reasons: string[] = [];
  const q = String(input.questionText ?? "");
  const m = String(input.memoText ?? "");

  if (!q.trim()) {
    return { dependent: true, reasons: ["empty_question"] };
  }

  // ── Column signals (advisory — present on <1% of rows, never sufficient) ──
  if (input.needsStimulus === true) reasons.push("column_needs_stimulus");
  if (input.stimulusText && input.stimulusText.trim().length > 0) {
    reasons.push("column_stimulus_text_present");
  }

  // ── Text signals — the ones that do the real work ────────────────────────
  if (LABELLED_STIMULUS_RE.test(q)) reasons.push("labelled_stimulus");
  if (REFER_INSTRUCTION_RE.test(q)) reasons.push("refer_instruction");
  if (DEIXIS_RE.test(q)) reasons.push("positional_deixis");
  if (MAP_GRID_RE.test(q)) reasons.push("map_grid_reference");
  if (CROSS_QUESTION_RE.test(q)) reasons.push("cross_question_reference");
  if (DATA_HANDOFF_RE.test(q)) reasons.push("data_handoff");
  if (BARE_ARTEFACT_RE.test(q) && !QUOTED_TITLE_RE.test(q)) {
    reasons.push("bare_artefact_reference");
  }

  // A memo that points at a stimulus proves the question did too, even when the
  // question text alone looked clean.
  if (LABELLED_STIMULUS_RE.test(m)) reasons.push("memo_labelled_stimulus");

  return { dependent: reasons.length > 0, reasons };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Combined source gate
// ─────────────────────────────────────────────────────────────────────────────

export interface SourceGateVerdict {
  usable: boolean;
  reasons: string[];
  /** Mark-notation-free question text, safe to send to the model. */
  cleanQuestion: string;
  /** Mark-notation-free memo text, safe to send to the model. */
  cleanMemo: string;
}

/** Shortest question that can carry a real concept, in characters. */
export const MIN_QUESTION_CHARS = 25;
/** Longest question worth turning into a card; beyond this it is a case study. */
export const MAX_QUESTION_CHARS = 600;
/** A memo shorter than this teaches nothing ("B", "√√"). */
export const MIN_MEMO_CHARS = 12;

/**
 * The single gate every generator calls before spending a token on a source.
 * Returns cleaned text alongside the verdict so callers never re-strip.
 */
export function gateSource(input: StimulusInput): SourceGateVerdict {
  const cleanQuestion = stripMarkNotation(input.questionText, {
    stripLeadingQuestionNumber: true,
  });
  const cleanMemo = stripMarkNotation(input.memoText);
  const reasons: string[] = [];

  const stim = isStimulusDependent({
    ...input,
    // Gate the CLEANED text: mark notation must not create false positives.
    questionText: cleanQuestion,
    memoText: cleanMemo,
  });
  if (stim.dependent) reasons.push(...stim.reasons);

  if (cleanQuestion.length < MIN_QUESTION_CHARS) reasons.push("question_too_short");
  if (cleanQuestion.length > MAX_QUESTION_CHARS) reasons.push("question_too_long");
  if (cleanMemo.length < MIN_MEMO_CHARS) reasons.push("memo_too_thin");

  return {
    usable: reasons.length === 0,
    reasons,
    cleanQuestion,
    cleanMemo,
  };
}
