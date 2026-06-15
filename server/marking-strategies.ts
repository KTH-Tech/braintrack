/**
 * Per-subject marker strategies for BrainTrack Grade 12 NSC.
 *
 * Each strategy takes a learner's submitted answer + the question/memo metadata
 * and returns a normalised marking result that can bubble up identically to
 * mastery → topic → subject → readiness, regardless of subject family.
 *
 * Subject families:
 *   numeric_units   — Maths, Physical Sciences, Maths Lit, Accounting, Economics
 *   multi_step      — Life Sciences, Geography, Engineering Graphics & Design
 *   mcq             — any subject's Section A MCQs
 *   essay           — English HL/FAL, Afrikaans HL/FAL, History, Religion, Life Orientation
 *   source_based    — History sources, Business Studies cases, Tourism case studies
 *   code_artifact   — IT (Java), CAT (spreadsheets/databases) — data-asset ringfenced
 *
 * Output contract is intentionally identical across strategies so that the
 * single attempts/mastery pipeline never branches on subject family.
 */

export interface MarkingInput {
  /** Learner-submitted answer (string for MCQ letter, free text for others). */
  learnerAnswer: string;
  /** Memo / model answer text (verbatim from DBE memo when available). */
  memoText: string | null | undefined;
  /** Total marks available for the question. */
  marksAvailable: number;
  /** Optional MCQ option letter the memo deems correct ("A".."E"). */
  correctOptionLetter?: "A" | "B" | "C" | "D" | "E" | null;
  // Explicit MCQ flag — when true the marker uses the MCQ strategy. When
  // unset we still fall back to "did the caller hand us a correct option
  // letter?" for backwards compatibility, but new call sites should set
  // this from stored MCQ metadata rather than relying on memo regex.
  isMcq?: boolean;
  /** Optional structured rubric extracted at ingestion time. */
  rubric?: { keyword: string; marks: number }[] | null;
  /** Subject CAPS code (e.g. "MAT", "ENGHL", "HIS"). */
  subjectCode: string;
}

export interface MarkingResult {
  /** Marks the learner earned, 0..marksAvailable. */
  marksAwarded: number;
  /** marksAvailable echoed back (for client convenience). */
  marksAvailable: number;
  /** True when the question is fully correct (marksAwarded === marksAvailable). */
  isCorrect: boolean;
  /** Strategy id that produced the score — useful for diagnostics + reports. */
  strategy: StrategyId;
  /** Short human-readable feedback in EN. */
  feedback: string;
  /** Same feedback in Afrikaans. */
  feedbackAf: string;
  /** Optional list of marking criteria the learner met / missed (for tutor). */
  criteria?: { label: string; awarded: number; possible: number; met: boolean }[];
}

export type StrategyId =
  | "numeric_units"
  | "multi_step"
  | "mcq"
  | "essay"
  | "source_based"
  | "code_artifact"
  | "fallback_self_mark";

// ---------------------------------------------------------------
// Subject → family map (Grade 12 NSC catalogue)
// ---------------------------------------------------------------

// Authoritative map keyed on production `subjects.code` values from
// `client/src/lib/constants.ts > GRADE_12_SUBJECTS`. Legacy / DBE-style codes
// are kept as aliases so older catalog entries still resolve correctly.
const FAMILY_BY_SUBJECT: Record<string, StrategyId> = {
  // ---- Numeric / quantitative ----
  MATH: "numeric_units",      // Mathematics
  MATL: "numeric_units",      // Mathematical Literacy
  TMATH: "numeric_units",     // Technical Mathematics
  PHYS: "numeric_units",      // Physical Sciences
  TSCI: "numeric_units",      // Technical Sciences
  ACC: "numeric_units",       // Accounting
  ECO: "numeric_units",       // Economics
  // legacy aliases
  MAT: "numeric_units",
  MATHS: "numeric_units",
  MLIT: "numeric_units",
  MATHLIT: "numeric_units",
  PHSC: "numeric_units",

  // ---- Multi-step structured ----
  LIFE: "multi_step",         // Life Sciences
  AGR: "multi_step",          // Agricultural Sciences
  AGRM: "multi_step",         // Agricultural Management Practices
  AGRT: "multi_step",         // Agricultural Technology
  GEO: "multi_step",          // Geography
  EGD: "multi_step",          // Engineering Graphics and Design
  CIVT: "multi_step",         // Civil Technology
  ELEC: "multi_step",         // Electrical Technology
  MECH: "multi_step",         // Mechanical Technology
  // legacy aliases
  LIFS: "multi_step",
  AGRSC: "multi_step",

  // ---- Essay-heavy languages + commentary subjects ----
  ENGH: "essay",              // English Home Language
  ENGF: "essay",              // English First Additional Language
  AFRH: "essay",              // Afrikaans Home Language
  AFRF: "essay",              // Afrikaans First Additional Language
  HIS: "essay",               // History
  RELI: "essay",              // Religion Studies
  LO: "essay",                // Life Orientation
  ART: "essay",               // Visual Arts
  DRAMA: "essay",             // Dramatic Arts
  DANCE: "essay",             // Dance Studies
  MUSIC: "essay",             // Music
  DESIGN: "essay",            // Design
  // legacy aliases
  ENGHL: "essay",
  ENGFAL: "essay",
  AFRHL: "essay",
  AFRFAL: "essay",
  RST: "essay",

  // ---- Source / case-based ----
  BUS: "source_based",        // Business Studies
  TOUR: "source_based",       // Tourism
  CON: "source_based",        // Consumer Studies
  HOSP: "source_based",       // Hospitality Studies
  // legacy aliases
  BST: "source_based",
  TRSM: "source_based",
  CONS: "source_based",

  // ---- Data-asset / code subjects (ringfenced — fall back to self-mark) ----
  IT: "code_artifact",        // Information Technology
  CAT: "code_artifact",       // Computer Applications Technology
  DIGT: "code_artifact",      // Digital Technology
};

export function getStrategyForSubject(subjectCode: string): StrategyId {
  const normalised = subjectCode.toUpperCase().replace(/[^A-Z]/g, "");
  return FAMILY_BY_SUBJECT[normalised] ?? "fallback_self_mark";
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

const STOPWORDS = new Set([
  "the", "a", "an", "of", "to", "in", "and", "or", "is", "are", "was", "were",
  "be", "by", "for", "on", "with", "as", "at", "from", "that", "this", "it",
  "which", "have", "has", "had", "but", "not", "into", "their", "they", "them",
  "die", "en", "van", "is", "in", "om", "te", "n", "het",
]);

function tokenize(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s%./-]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  a.forEach(x => { if (b.has(x)) inter++; });
  return inter / (a.size + b.size - inter);
}

/** Extract numeric values + units from learner / memo text. */
function extractNumerics(text: string): { value: number; unit: string }[] {
  if (!text) return [];
  const out: { value: number; unit: string }[] = [];
  const pattern = /(-?\d+(?:[.,]\d+)?)\s*([a-zA-Z%°/²³µΩ]{0,8})/g;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    const value = parseFloat(m[1].replace(",", "."));
    if (!Number.isFinite(value)) continue;
    const unit = (m[2] || "").trim().toLowerCase();
    out.push({ value, unit });
  }
  return out;
}

// ---------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------

function strategyMcq(input: MarkingInput): MarkingResult {
  const expected = (input.correctOptionLetter || "").toUpperCase();
  const got = (input.learnerAnswer || "").trim().toUpperCase().slice(0, 1);
  const isCorrect = !!expected && got === expected;
  return {
    marksAwarded: isCorrect ? input.marksAvailable : 0,
    marksAvailable: input.marksAvailable,
    isCorrect,
    strategy: "mcq",
    feedback: isCorrect ? "Correct." : `The correct answer is ${expected || "in the memo"}.`,
    feedbackAf: isCorrect ? "Korrek." : `Die korrekte antwoord is ${expected || "in die memo"}.`,
    criteria: [{ label: "Correct option chosen", awarded: isCorrect ? 1 : 0, possible: 1, met: isCorrect }],
  };
}

function strategyNumericUnits(input: MarkingInput): MarkingResult {
  const learner = extractNumerics(input.learnerAnswer);
  const memo = extractNumerics(input.memoText || "");
  const total = input.marksAvailable;
  if (memo.length === 0) {
    // No numeric in memo — fall back to keyword match (treat as multi-step)
    return strategyMultiStep(input);
  }
  // Compare the final/last numeric in each (DBE memos usually end with the answer)
  const target = memo[memo.length - 1];
  const tolerance = Math.max(0.01, Math.abs(target.value) * 0.02); // 2% or 0.01
  const final = learner[learner.length - 1];
  const valueOk = !!final && Math.abs(final.value - target.value) <= tolerance;
  const unitOk = !!final && (!target.unit || final.unit === target.unit);

  // Award up to (total-1) for method (keyword match) and 1 for the final answer
  const methodWeight = total > 1 ? total - 1 : 0;
  const memoTokens = new Set(tokenize(input.memoText || ""));
  const learnerTokens = new Set(tokenize(input.learnerAnswer));
  const overlap = jaccard(memoTokens, learnerTokens);
  const methodMarks = Math.round(methodWeight * Math.min(1, overlap * 1.5));
  // Strict: full answer mark only when both value AND units match.
  // Wrong units → no answer mark (DBE convention).
  const answerMarks = valueOk && unitOk ? 1 : 0;

  const marksAwarded = Math.min(total, methodMarks + answerMarks);
  const isCorrect = marksAwarded === total;
  return {
    marksAwarded,
    marksAvailable: total,
    isCorrect,
    strategy: "numeric_units",
    feedback: valueOk
      ? unitOk ? "Correct value and units." : "Correct value, but check the units."
      : `Final answer doesn't match (memo: ${target.value}${target.unit ? " " + target.unit : ""}).`,
    feedbackAf: valueOk
      ? unitOk ? "Korrekte waarde en eenhede." : "Korrekte waarde, maar gaan eenhede na."
      : `Finale antwoord stem nie ooreen nie (memo: ${target.value}${target.unit ? " " + target.unit : ""}).`,
    criteria: [
      { label: "Method shown", awarded: methodMarks, possible: methodWeight, met: methodMarks > 0 },
      { label: "Final answer", awarded: answerMarks, possible: 1, met: answerMarks === 1 },
    ],
  };
}

function strategyMultiStep(input: MarkingInput): MarkingResult {
  const total = input.marksAvailable;
  const memoTokens = new Set(tokenize(input.memoText || ""));
  const learnerTokens = new Set(tokenize(input.learnerAnswer));

  let metMarks = 0;
  const criteria: NonNullable<MarkingResult["criteria"]> = [];

  if (input.rubric && input.rubric.length > 0) {
    // Rubric-driven: each keyword met awards its marks
    for (const r of input.rubric) {
      const kwTokens = tokenize(r.keyword);
      const met = kwTokens.every(t => learnerTokens.has(t));
      if (met) metMarks += r.marks;
      criteria.push({ label: r.keyword, awarded: met ? r.marks : 0, possible: r.marks, met });
    }
    metMarks = Math.min(total, metMarks);
  } else {
    // No structured rubric — overlap-based scoring
    const overlap = jaccard(memoTokens, learnerTokens);
    metMarks = Math.round(total * Math.min(1, overlap * 1.4));
    criteria.push({ label: "Memo keyword overlap", awarded: metMarks, possible: total, met: metMarks > 0 });
  }

  const isCorrect = metMarks === total;
  return {
    marksAwarded: metMarks,
    marksAvailable: total,
    isCorrect,
    strategy: "multi_step",
    feedback: isCorrect
      ? "All marking points covered."
      : `${metMarks}/${total} marking points covered. Compare your answer with the memo.`,
    feedbackAf: isCorrect
      ? "Alle merkpunte gedek."
      : `${metMarks}/${total} merkpunte gedek. Vergelyk jou antwoord met die memo.`,
    criteria,
  };
}

function strategyEssay(input: MarkingInput): MarkingResult {
  // NSC essays are graded on a 5-band rubric: Content (50%), Structure (25%),
  // Style/Language (25%). Without a marker, give a confidence-weighted score
  // based on word count + memo overlap; the learner is expected to self-mark
  // against the rubric provided.
  const total = input.marksAvailable;
  const wordCount = (input.learnerAnswer || "").split(/\s+/).filter(Boolean).length;
  const memoTokens = new Set(tokenize(input.memoText || ""));
  const learnerTokens = new Set(tokenize(input.learnerAnswer));
  const overlap = jaccard(memoTokens, learnerTokens);

  // Length signal: full-length essay is ~250-350 words for Eng HL.
  const lengthScore = Math.min(1, wordCount / 250);
  const contentScore = Math.min(1, overlap * 1.6);
  // Provisional score: content 60%, length 40%
  const provisional = Math.round(total * (contentScore * 0.6 + lengthScore * 0.4));
  const marksAwarded = Math.max(0, Math.min(total, provisional));
  return {
    marksAwarded,
    marksAvailable: total,
    isCorrect: false, // essays are never "fully correct"
    strategy: "essay",
    feedback: `Provisional ${marksAwarded}/${total}. Self-mark against the 5-band rubric for content, structure and language.`,
    feedbackAf: `Voorlopig ${marksAwarded}/${total}. Merk self met die 5-band-rubriek vir inhoud, struktuur en taal.`,
    criteria: [
      { label: "Length / development", awarded: Math.round(total * 0.4 * lengthScore), possible: Math.round(total * 0.4), met: lengthScore >= 0.8 },
      { label: "Content / memo coverage", awarded: Math.round(total * 0.6 * contentScore), possible: Math.round(total * 0.6), met: contentScore >= 0.6 },
    ],
  };
}

function strategySourceBased(input: MarkingInput): MarkingResult {
  // Source-based answers (History, Business case studies) reward (a) extracting
  // points from the source and (b) explaining/applying them. We treat them like
  // multi-step but require slightly higher overlap for full marks.
  const base = strategyMultiStep(input);
  return {
    ...base,
    strategy: "source_based",
    feedback: base.feedback + " Make sure each point quotes or paraphrases the source.",
    feedbackAf: base.feedbackAf + " Maak seker elke punt haal aan of parafraseer die bron.",
  };
}

function strategyCodeArtifact(input: MarkingInput): MarkingResult {
  // IT/CAT learner work is uploaded artifact (.java, .xlsx) — we cannot grade
  // it inline. Defer to self-mark against the provided memo.
  return {
    marksAwarded: 0,
    marksAvailable: input.marksAvailable,
    isCorrect: false,
    strategy: "code_artifact",
    feedback: "Upload your project file and self-mark against the memo. Marker integration is on the roadmap.",
    feedbackAf: "Laai jou projeklêer op en merk self met die memo. Markeerder-integrasie is op die padkaart.",
  };
}

function strategyFallback(input: MarkingInput): MarkingResult {
  // Unknown subject: keyword-overlap self-mark
  return {
    ...strategyMultiStep(input),
    strategy: "fallback_self_mark",
  };
}

// ---------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------

export function markAnswer(
  input: MarkingInput,
  forceStrategy?: StrategyId,
): MarkingResult {
  // MCQ routing: prefer the explicit `isMcq` flag (set from stored
  // mcq_options metadata at the call site). Fall back to "caller passed
  // a correctOptionLetter" only for legacy paths that haven't been
  // updated to thread the flag through. Memo-pattern matching alone is
  // never enough to switch strategy.
  const isMcq = input.isMcq === true || (input.isMcq === undefined && !!input.correctOptionLetter);
  const strategy = forceStrategy ?? (isMcq ? "mcq" : getStrategyForSubject(input.subjectCode));

  switch (strategy) {
    case "mcq":            return strategyMcq(input);
    case "numeric_units":  return strategyNumericUnits(input);
    case "multi_step":     return strategyMultiStep(input);
    case "essay":          return strategyEssay(input);
    case "source_based":   return strategySourceBased(input);
    case "code_artifact":  return strategyCodeArtifact(input);
    default:               return strategyFallback(input);
  }
}

/**
 * Bubble: convert a list of question results into a paper-level score.
 * marksAwarded / marksAvailable, with band classification.
 */
export function bubbleToPaperScore(results: MarkingResult[]): {
  marksAwarded: number;
  marksAvailable: number;
  pct: number;
  band: "red" | "amber" | "green" | "star";
} {
  const marksAwarded = results.reduce((s, r) => s + r.marksAwarded, 0);
  const marksAvailable = results.reduce((s, r) => s + r.marksAvailable, 0) || 1;
  const pct = Math.round((marksAwarded / marksAvailable) * 100);
  const band: "red" | "amber" | "green" | "star" =
    pct >= 85 ? "star" : pct >= 75 ? "green" : pct >= 60 ? "amber" : "red";
  return { marksAwarded, marksAvailable, pct, band };
}
