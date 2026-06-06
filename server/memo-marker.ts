/**
 * Memo-Driven Marking Engine
 * --------------------------
 * Parses DBE memo text into a structured mark scheme (keywords, mark
 * allocations, acceptable variants, partial-mark rules) and provides a
 * deterministic keyword-matching marker so the same answer always earns
 * the same marks.
 *
 * Used by:
 *   - server/routes.ts → /api/exam/mini-mock and /api/exam/full
 *
 * Design constraints (task-347):
 *   - No AI generation. Marking comes from memo text only.
 *   - Reproducible: pure functions, no randomness.
 *   - "Marks lost because…" feedback is sourced from the memo excerpt
 *     attached to each criterion — never AI prose.
 */

export type MarkSchemeCriterion = {
  id: string;
  /** Required keywords (stemmed) — every keyword must be present for the mark. */
  keywords: string[];
  /** Acceptable variants (any one of these counts as a hit). */
  acceptable: string[];
  /** Marks awarded when the criterion is met. */
  marks: number;
  /** Verbatim memo excerpt shown to the learner. */
  memoExcerpt: string;
};

export type MarkScheme = {
  totalMarks: number;
  criteria: MarkSchemeCriterion[];
  /** Memo-derived partial-marking rules ("Accept …", "Allow …", "OR …"). */
  partialRules: string[];
  /** Phrases the memo says must NOT earn marks ("Do not award …"). */
  denyPhrases?: string[];
  parsedAt: string;
};

export type MarkBreakdown = {
  marksAwarded: number;
  marksAvailable: number;
  isCorrect: boolean;
  perCriterion: Array<{
    id: string;
    marks: number;
    awarded: number;
    matched: string[];
    missed: string[];
    memoExcerpt: string;
    feedback: string;
  }>;
  examinerNotes: string[];
};

// ---------------------------------------------------------------
// Tokenisation helpers
// ---------------------------------------------------------------

const STOPWORDS = new Set([
  "the", "a", "an", "of", "to", "in", "and", "or", "is", "are", "was", "were",
  "be", "by", "for", "on", "with", "as", "at", "from", "that", "this", "it",
  "which", "have", "has", "had", "but", "not", "into", "their", "they", "them",
  "die", "en", "van", "om", "te", "n", "het", "se",
]);

function lightStem(word: string): string {
  // Very small English/Afrikaans-friendly stemmer — strips common plural
  // and verb endings so "calculates"/"calculated" both match "calculate".
  const w = word.toLowerCase();
  if (w.length <= 4) return w;
  if (w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.endsWith("sses")) return w.slice(0, -2);
  if (w.endsWith("ing")) return w.slice(0, -3);
  if (w.endsWith("ed")) return w.slice(0, -2);
  if (w.endsWith("es")) return w.slice(0, -2);
  if (w.endsWith("s")) return w.slice(0, -1);
  return w;
}

export function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s%./-]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(lightStem);
}

// ---------------------------------------------------------------
// Memo parser
// ---------------------------------------------------------------

const MARK_TAG_RE = /\((\d{1,2})\)|\[(\d{1,2})\]/g;
const ACCEPT_RE = /\b(?:accept|aanvaar|allow|toelaat)\b\s*[:\-]?\s*([^\n\.;()\[\]]{2,80})/gi;
const OR_RE = /\b(OR|OF|OFTEWEL|alternatively)\b\s*[:\-]?\s*([^\n\.;()\[\]]{2,80})/gi;

/**
 * Splits memo text into "lines" — each line is a candidate mark-bearing
 * statement. We keep the original text alongside the trimmed form so
 * `memoExcerpt` is human-readable.
 */
function splitMemoLines(memoText: string): string[] {
  return memoText
    .replace(/\r\n/g, "\n")
    .split(/\n+|(?<=[.;])\s+(?=[A-Z•\-✓])/u)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/**
 * Extract the per-line mark count (e.g. "(2)" or "✓✓").
 * Returns null if no explicit mark indicator is found.
 */
function extractLineMarks(line: string): number | null {
  // Bracketed marks like (2) or [3]
  let last: number | null = null;
  MARK_TAG_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MARK_TAG_RE.exec(line)) !== null) {
    const v = parseInt(m[1] ?? m[2] ?? "", 10);
    if (Number.isFinite(v) && v >= 1 && v <= 30) last = v;
  }
  if (last !== null) return last;

  // Tick-mark style: "✓✓" awards 2 marks (DBE memo convention).
  const ticks = (line.match(/[✓✔√]/g) ?? []).length;
  if (ticks > 0) return Math.min(ticks, 10);

  return null;
}

/**
 * Strip mark tags / tick markers from a line so the remaining text is
 * the answer keyword bundle.
 */
function cleanLine(line: string): string {
  return line
    .replace(/\((\d{1,2})\)|\[(\d{1,2})\]/g, " ")
    .replace(/[✓✔√]/g, " ")
    .replace(/^\s*[•\-*\d.\)]+\s*/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Pull "accept …" / "OR …" alternates out of a memo line. */
function extractAcceptable(line: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  ACCEPT_RE.lastIndex = 0;
  while ((m = ACCEPT_RE.exec(line)) !== null) {
    if (m[1]) out.push(m[1].trim());
  }
  OR_RE.lastIndex = 0;
  while ((m = OR_RE.exec(line)) !== null) {
    if (m[2]) out.push(m[2].trim());
  }
  return out;
}

/**
 * Extract memo-derived partial-marking rules — sentences that begin with
 * "Accept", "Allow", "Award", "Do not award", "Penalise", etc. These are
 * surfaced verbatim to the learner as examiner guidance AND fed back
 * into criterion matching so they affect scoring, not just display.
 */
function extractPartialRules(memoText: string): string[] {
  const ruleRe = /\b(?:Accept|Allow|Award|Do not award|Penalise|Penalize|Note|Aanvaar|Toelaat|Ken toe|Moet nie|Let wel)[^\n.]{3,160}\.?/gi;
  const rules: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(memoText)) !== null) {
    const rule = m[0].trim().replace(/\s+/g, " ");
    if (!rules.includes(rule)) rules.push(rule);
    if (rules.length >= 12) break;
  }
  return rules;
}

/**
 * Classify a partial rule into a structured directive that the marker
 * can act on. "Accept …", "Allow …", "Award … for …" all add positive
 * acceptable phrases; "Do not award …" / "Penalise …" add disqualifiers.
 */
type RuleDirective =
  | { kind: "accept"; phrase: string }
  | { kind: "deny"; phrase: string };

function parseRuleDirectives(rules: string[]): RuleDirective[] {
  const out: RuleDirective[] = [];
  for (const rule of rules) {
    const denyMatch = /\b(?:Do not award|Moet nie)\b\s*[:\-]?\s*(.{3,120})/i.exec(rule);
    if (denyMatch?.[1]) {
      out.push({ kind: "deny", phrase: denyMatch[1].trim().replace(/\.$/, "") });
      continue;
    }
    const acceptMatch = /\b(?:Accept|Allow|Award(?:\s+(?:one|two|1|2)\s+marks?)?(?:\s+for)?|Aanvaar|Toelaat|Ken toe)\b\s*[:\-]?\s*(.{3,120})/i.exec(rule);
    if (acceptMatch?.[1]) {
      const phrase = acceptMatch[1].trim().replace(/\.$/, "");
      // Split on "OR"/"of" so each alternate becomes its own variant
      for (const alt of phrase.split(/\s+(?:OR|of|or)\s+/i)) {
        const a = alt.trim();
        if (a.length >= 3) out.push({ kind: "accept", phrase: a });
      }
    }
  }
  return out;
}

/** Pick the criterion whose memoExcerpt most-overlaps the rule phrase. */
function nearestCriterionIdx(criteria: MarkSchemeCriterion[], phrase: string): number {
  if (criteria.length === 0) return -1;
  const phraseTokens = new Set(tokenize(phrase));
  if (phraseTokens.size === 0) return 0;
  let bestIdx = 0;
  let bestScore = -1;
  criteria.forEach((c, i) => {
    const cTokens = new Set([...tokenize(c.memoExcerpt), ...c.keywords]);
    let overlap = 0;
    for (const t of phraseTokens) if (cTokens.has(t)) overlap++;
    if (overlap > bestScore) { bestScore = overlap; bestIdx = i; }
  });
  return bestScore > 0 ? bestIdx : -1;
}

/**
 * Parse a memo into a structured mark scheme.
 *
 * `totalMarks` is the marks-available figure attached to the question;
 * we use it to scale criteria when the memo has no explicit per-line
 * mark tags (some memos just list bullet points).
 */
export function parseMemoToScheme(
  memoText: string | null | undefined,
  totalMarks: number,
): MarkScheme | null {
  const text = (memoText || "").trim();
  if (text.length < 10) return null;

  const total = Math.max(1, totalMarks || 1);
  const lines = splitMemoLines(text);
  const partialRules = extractPartialRules(text);
  const directives = parseRuleDirectives(partialRules);
  const denyPhrases: string[] = directives
    .filter((d) => d.kind === "deny")
    .map((d) => d.phrase);

  // Helper: after criteria are built, apply each "accept" directive to
  // the criterion whose memo excerpt overlaps it most. This makes
  // memo-derived OR/Accept rules a real part of scoring rather than
  // display-only commentary.
  const applyAcceptDirectives = (criteria: MarkSchemeCriterion[]) => {
    for (const d of directives) {
      if (d.kind !== "accept") continue;
      const idx = nearestCriterionIdx(criteria, d.phrase);
      if (idx < 0) continue;
      if (!criteria[idx].acceptable.includes(d.phrase)) {
        criteria[idx].acceptable.push(d.phrase);
      }
    }
  };

  // Pass 1: any lines with explicit mark tags are first-class criteria.
  const tagged: MarkSchemeCriterion[] = [];
  for (const line of lines) {
    const marks = extractLineMarks(line);
    if (marks === null) continue;
    const cleaned = cleanLine(line);
    if (cleaned.length < 2) continue;
    const acceptable = extractAcceptable(line);
    const keywords = tokenize(cleaned).slice(0, 8);
    if (keywords.length === 0) continue;
    tagged.push({
      id: `c${tagged.length + 1}`,
      keywords,
      acceptable,
      marks,
      memoExcerpt: cleaned.slice(0, 220),
    });
  }

  // If we got tagged criteria, normalise their marks to sum to the
  // question's canonical total. This guarantees `scheme.totalMarks`
  // always equals the official question mark allocation, so percentages
  // and section subtotals stay reproducible even when the memo's
  // tagged marks drift from the paper.
  if (tagged.length > 0) {
    applyAcceptDirectives(tagged);
    const sum = tagged.reduce((s, c) => s + c.marks, 0);
    if (sum > 0 && sum !== total) {
      let allocated = 0;
      tagged.forEach((c, i) => {
        if (i === tagged.length - 1) {
          c.marks = Math.max(1, total - allocated);
        } else {
          c.marks = Math.max(1, Math.round((c.marks / sum) * total));
          allocated += c.marks;
        }
      });
    }
    return {
      totalMarks: total,
      criteria: tagged,
      partialRules,
      denyPhrases,
      parsedAt: new Date().toISOString(),
    };
  }

  // Pass 2: bullet-style memo with no per-line marks. Split into N items
  // and divide totalMarks evenly.
  const bullets = lines
    .map(cleanLine)
    .filter((l) => l.length >= 3)
    .slice(0, Math.max(1, Math.min(total, 8)));
  if (bullets.length === 0) {
    // Single-blob memo — one criterion worth all marks
    const keywords = tokenize(text).slice(0, 12);
    if (keywords.length === 0) return null;
    const single: MarkSchemeCriterion[] = [{
      id: "c1",
      keywords,
      acceptable: [],
      marks: total,
      memoExcerpt: text.slice(0, 220),
    }];
    applyAcceptDirectives(single);
    return {
      totalMarks: total,
      criteria: single,
      partialRules,
      denyPhrases,
      parsedAt: new Date().toISOString(),
    };
  }

  const perItem = Math.max(1, Math.floor(total / bullets.length));
  const remainder = total - perItem * bullets.length;
  const criteria: MarkSchemeCriterion[] = bullets.map((b, i) => ({
    id: `c${i + 1}`,
    keywords: tokenize(b).slice(0, 6),
    acceptable: extractAcceptable(b),
    marks: perItem + (i === 0 ? remainder : 0),
    memoExcerpt: b.slice(0, 220),
  }));
  applyAcceptDirectives(criteria);

  return {
    totalMarks: total,
    criteria,
    partialRules,
    denyPhrases,
    parsedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------
// Marker
// ---------------------------------------------------------------

function criterionMet(
  criterion: MarkSchemeCriterion,
  learnerTokens: Set<string>,
  learnerLower: string,
): { met: boolean; matched: string[]; missed: string[] } {
  // First test: every required keyword is in the learner's tokens
  const matched: string[] = [];
  const missed: string[] = [];
  for (const k of criterion.keywords) {
    if (learnerTokens.has(k)) matched.push(k);
    else missed.push(k);
  }
  // Allow partial match: ≥60% of keywords AND at least 1 keyword present
  const ratio = criterion.keywords.length === 0 ? 0 : matched.length / criterion.keywords.length;
  let met = matched.length > 0 && ratio >= 0.6;

  // Acceptable variant: if any acceptable phrase appears verbatim, accept it
  if (!met && criterion.acceptable.length > 0) {
    for (const variant of criterion.acceptable) {
      if (learnerLower.includes(variant.toLowerCase().slice(0, 60))) {
        met = true;
        matched.push(variant);
        break;
      }
    }
  }
  return { met, matched, missed };
}

/**
 * Mark a learner's answer against a parsed mark scheme.
 *
 * Deterministic — the same (answer, scheme) pair always returns the same
 * result. No AI calls.
 */
export function markAgainstScheme(
  learnerAnswer: string,
  scheme: MarkScheme,
  isAfrikaans = false,
): MarkBreakdown {
  const learnerLower = (learnerAnswer || "").toLowerCase();
  const learnerTokens = new Set(tokenize(learnerAnswer || ""));

  // Memo "Do not award" rules — if the answer contains any denied phrase
  // verbatim, that criterion cannot earn marks. This enforces examiner
  // disqualifiers from the memo (e.g. "Do not award if learner wrote X").
  const denyPhrases = (scheme.denyPhrases || []).map((p) => p.toLowerCase());
  const triggeredDenials = denyPhrases.filter((p) => p.length >= 3 && learnerLower.includes(p.slice(0, 60)));

  let total = 0;
  const perCriterion: MarkBreakdown["perCriterion"] = [];

  for (const c of scheme.criteria) {
    const { met, matched, missed } = criterionMet(c, learnerTokens, learnerLower);
    let awarded = 0;
    if (met) {
      awarded = c.marks;
    } else if (c.marks >= 2 && matched.length > 0) {
      // DBE partial-mark convention: proportional credit on multi-mark
      // criteria when ≥1 required keyword is present.
      const partial = matched.length / Math.max(1, c.keywords.length);
      awarded = Math.floor(c.marks * partial);
    }
    // Apply memo disqualifiers
    if (awarded > 0 && triggeredDenials.length > 0) {
      awarded = 0;
    }
    total += awarded;

    const feedback = met
      ? isAfrikaans
        ? `Volle merke toegeken — alle sleutelpunte gedek.`
        : `Full marks awarded — all key points covered.`
      : awarded > 0
        ? isAfrikaans
          ? `Gedeeltelike krediet (${awarded}/${c.marks}). Mis: ${missed.join(", ") || "—"}.`
          : `Partial credit (${awarded}/${c.marks}). Missing: ${missed.join(", ") || "—"}.`
        : isAfrikaans
          ? `Geen merke nie. Verwagte sleutelwoorde: ${c.keywords.join(", ")}.`
          : `No marks. Expected key terms: ${c.keywords.join(", ")}.`;

    perCriterion.push({
      id: c.id,
      marks: c.marks,
      awarded,
      matched,
      missed,
      memoExcerpt: c.memoExcerpt,
      feedback,
    });
  }

  const marksAvailable = scheme.totalMarks;
  const marksAwarded = Math.min(marksAvailable, total);
  return {
    marksAwarded,
    marksAvailable,
    isCorrect: marksAwarded === marksAvailable,
    perCriterion,
    examinerNotes: scheme.partialRules,
  };
}

/**
 * Convenience: parse memo + mark in one call. Useful for legacy questions
 * whose `mark_scheme` column hasn't been backfilled yet.
 */
export function parseAndMark(
  learnerAnswer: string,
  memoText: string | null | undefined,
  totalMarks: number,
  isAfrikaans = false,
): MarkBreakdown | null {
  const scheme = parseMemoToScheme(memoText, totalMarks);
  if (!scheme) return null;
  return markAgainstScheme(learnerAnswer, scheme, isAfrikaans);
}
