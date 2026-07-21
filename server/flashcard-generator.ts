/**
 * Flashcard Generator — humanised, learner-facing study cards.
 *
 * WHY THIS EXISTS
 * ---------------
 * The `flashcards` table was previously filled by copying `dbe_verbatim_questions`
 * straight through: front = question_text, back = memo_text. That produces cards
 * like:
 *
 *   front: "SPELETJIE Ontwerp 'n speletjie wat kinders kan speel. … [20]"
 *   back:  "SPELETJIE FOKUS Die kandidaat ontwerp … KENMERKE • Die speletjie het 'n naam. …"
 *
 * which is the *examiner's marking rubric*, written in third person about the
 * candidate, addressed to a marker. A learner opening that card is reading the
 * mark sheet, not studying. It is also a 20-mark essay task, which is not a
 * flashcard at all.
 *
 * This module instead treats verbatim questions + memos as *source material* and
 * synthesises atomic, second-person recall cards from them, in EN and AF, with a
 * memory hook, provenance back to the real paper, and a hard validation gate so
 * nothing unvalidated can reach the table again.
 *
 * PIPELINE
 *   loadTopicPriorities()  → rank topics per subject by dbe_topic_frequency
 *   loadSourceQuestions()  → quality-gated verbatim rows (clean + scored)
 *   selectSources()        → weight the draw toward high-yield topics
 *   generateCardsForBatch()→ LLM turns sources into atomic bilingual cards
 *   validateCard()         → hard reject / soft score before anything is stored
 *
 * Nothing in here writes to `dbe_verbatim_questions`, `dbe_simulated_questions`
 * or `generated_questions`. Flashcards only.
 */
import OpenAI from "openai";
import { and, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "./db";
import {
  dbeVerbatimQuestions,
  dbeTopicFrequency,
  topics as topicsTable,
  subjects as subjectsTable,
} from "@shared/schema";

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI client — same convention as server/routes.ts
// ─────────────────────────────────────────────────────────────────────────────

let _openai: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (_openai) return _openai;
  const apiKey =
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_API_KEY (or OPENAI_API_KEY) is not set. " +
        "Source your key file before running the generator.",
    );
  }
  _openai = new OpenAI({
    apiKey,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
  return _openai;
}

export const DEFAULT_MODEL = "gpt-4o-mini";

// ─────────────────────────────────────────────────────────────────────────────
// Card shape
// ─────────────────────────────────────────────────────────────────────────────

export type CardType = "basic" | "cloze" | "reversed";
export type Difficulty = "easy" | "medium" | "hard";
export type CognitiveLevel =
  | "knowledge"
  | "comprehension"
  | "analysis"
  | "synthesis";

/** One conceptual card, before it is split into per-language rows. */
export interface GeneratedCard {
  front: string;
  back: string;
  frontAf: string;
  backAf: string;
  cardType: CardType;
  difficulty: Difficulty;
  topic: string | null;
  /** Short "why this matters" / mnemonic line. Already folded into back. */
  hook?: string | null;
}

export interface SourceQuestion {
  id: number;
  subject: string;
  year: number;
  session: string;
  paperNumber: number;
  questionNumber: string;
  questionText: string;
  memoText: string;
  marks: number | null;
  cognitiveLevel: CognitiveLevel | null;
  language: string;
  qualityScore: number | null;
}

export interface CardProvenance {
  sourceQuestionId: number;
  subject: string;
  year: number;
  session: string;
  paperNumber: number;
  questionNumber: string;
  sourceMarks: number | null;
  sourceCognitiveLevel: string | null;
  generator: string;
  model: string;
  generatedAt: string;
  qualityScore: number;
  pairKey: string;
}

export interface ValidationResult {
  ok: boolean;
  /** 0–100. Soft-quality score; cards below MIN_QUALITY_SCORE are rejected. */
  score: number;
  /** Hard-failure codes. Non-empty ⇒ ok === false. */
  reasons: string[];
  /** Non-fatal observations that cost points. */
  warnings: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Card design constants
//
// These are deliberately tight. A flashcard is a *recall prompt*, not a
// worked answer. If the back does not fit on a phone screen without
// scrolling, it is a notes page wearing a flashcard costume.
// ─────────────────────────────────────────────────────────────────────────────

export const MAX_FRONT_CHARS = 180;
export const MAX_BACK_CHARS = 450;
export const MIN_BACK_CHARS = 8;
export const MIN_FRONT_CHARS = 8;
export const MIN_QUALITY_SCORE = 60;

/** Source-side gate: below this the OCR/memo text is not trustworthy. */
export const MIN_SOURCE_QUALITY = 70;
/** Source questions worth this many marks are essay tasks — decompose or skip. */
export const ESSAY_MARK_THRESHOLD = 8;
export const MAX_SOURCE_QUESTION_CHARS = 600;
export const MIN_SOURCE_MEMO_CHARS = 20;

/**
 * Marking-rubric fingerprints. Any of these in a generated card means the model
 * leaked examiner voice instead of teaching, and the card is thrown away.
 * These are exactly the patterns present in the 95 broken rows.
 */
export const RUBRIC_PATTERNS: Array<{ code: string; re: RegExp }> = [
  { code: "rubric_candidate", re: /\b(kandidaat|candidate)\b/i },
  { code: "rubric_marker", re: /\b(marker|nasiener|moderator|examiner|eksaminator)\b/i },
  { code: "rubric_heading", re: /\b(FOKUS|KENMERKE|RUBRIEK|RUBRIC|ASSESSMENT CRITERIA|ASSESSERINGSKRITERIA)\b/ },
  { code: "rubric_award", re: /\b(award(ing)? (the )?marks?|ken punte toe|allocate marks?|mark allocation|puntetoekenning)\b/i },
  { code: "rubric_accept", re: /\b(accept any|aanvaar enige|any relevant answer|enige relevante antwoord|max\.?\s*\d+\s*marks?)\b/i },
  { code: "rubric_instruction", re: /\b(die leerder moet|the learner must|the candidate (must|should|will)|leerders moet)\b/i },
  { code: "rubric_tick", re: /(✓✓|√√|\btick\b|\bmerkie\b)/i },
];

/** Mark allocations — "[20]", "(4)", "(2 marks)", "(3 punte)". */
export const MARK_ALLOCATION_RE =
  /(\[\s*\d+\s*\]|\(\s*\d+\s*(marks?|punte)\s*\)|\(\s*\d+\s*\)\s*$)/i;

/** Essay / extended-writing prompts — never a flashcard. */
export const ESSAY_PROMPT_RE =
  /\b(write an essay|skryf 'n opstel|in the form of an essay|in die vorm van 'n opstel|essay format|opstelformaat|write a (letter|speech|report|dialogue|review)|skryf 'n (brief|toespraak|verslag|dialoog|resensie)|discuss in detail|bespreek in detail|essay question|opstelvraag)\b/i;

/** Placeholder / non-answer backs. */
export const PLACEHOLDER_RE =
  /\b(see memo|sien memo|as above|soos hierbo|refer to|verwys na|n\/a|tbd|todo|answer will vary|antwoord sal verskil|any of the above)\b/i;

/**
 * References to material the learner cannot see on the card.
 * "Write the events in the correct order as they occur in the novel" is
 * unanswerable when the card never says *which* novel — a defect that survived
 * the first validation pass because it reads like a well-formed prompt.
 */
export const CONTEXT_REFERENCE_RE =
  /\b(the|this|in the|die|hierdie|in die)\s+(novel|poem|passage|extract|drama|play|short story|story|cartoon|comic|diagram|table|graph|chart|source|text|article|advertisement|scenario|case study|playwright|author|poet|narrator|speaker|writer|roman|gedig|teks|uittreksel|verhaal|kortverhaal|spotprent|tabel|grafiek|bron|artikel|advertensie|senario|gevallestudie|dramaturg|skrywer|digter|verteller|spreker)\b/i;

/** Explicit stimulus labels — "SOURCE 1B", "TEXT A", "FIGURE 2", "BRON 3". */
export const STIMULUS_LABEL_RE =
  /\b(source|text|figure|extract|annexure|bron|teks|figuur|uittreksel|bylae)\s+[A-Z0-9]{1,3}\b/i;

/**
 * Only an explicitly QUOTED title rescues a generic reference. Character names
 * are not enough: "the correct sequence of events in the drama involving
 * Hendrik and Katrien" names people, not the set work, so the learner still
 * cannot tell which text is being examined.
 */
const QUOTED_TITLE_RE = /['"“”‘’][^'"“”‘’]{3,}['"“”‘’]/;

/** Dangling MCQ option letters left behind after the options were stripped. */
export const DANGLING_MCQ_RE = /(?:\b[A-D]\b[\s.,/]+){2,}\b[A-D]\b/;

/** A leftover MCQ answer key prefix — "D/the last piece…", "B - because…". */
export const MCQ_ANSWER_PREFIX_RE = /^\s*[A-D]\s*[\/\-–]\s*\S/;

/**
 * Sequence/ordering tasks. "Put these four events in the order they occur in
 * the novel" is a comprehension exercise over a text the learner must have in
 * front of them — it is never an atomic recall card, in any subject.
 */
export const ORDERING_TASK_RE =
  /\b(correct (sequence|order)|sequence of events|in the order (in )?which|chronological order|korrekte (volgorde|orde)|volgorde van gebeure|in die volgorde)\b/i;

/**
 * Bare map/diagram labels — "the stream at G", "the feature marked B", "block
 * A3". Geography and Physical Sciences questions lean on a topographic map or
 * a figure the learner does not have, so the resulting card is unanswerable
 * even though it reads like a well-formed question.
 */
export const MAP_LABEL_RE =
  /\b(at|by|labelled|labeled|marked|numbered|shown at|in block|block|point|area|feature|gemerk|by punt|blok|punt|area)\s+["'“”]?[A-Z]\d{0,2}\b(?![a-z])/;

/** Afrikaans function words used to detect an untranslated English side. */
const AF_MARKERS =
  /\b(nie|het|vir|jou|hulle|omdat|sodat|gebeure|voorkom|weggevat|besluit|gesin|hierdie|waarom|deur die|van die|in die|op die)\b/gi;

/** Openers that make a bare imperative front read as a real recall prompt. */
const RECALL_OPENERS =
  /^(what|which|who|when|where|why|how|name|list|state|define|give|explain|describe|identify|calculate|write|complete|match|convert|distinguish|compare|wat|watter|wie|wanneer|waar|hoekom|waarom|hoe|noem|lys|gee|definieer|verduidelik|beskryf|identifiseer|bereken|skryf|voltooi|onderskei|vergelyk)\b/i;

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function uppercaseRatio(s: string): number {
  const letters = s.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 12) return 0;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length;
}

function normaliseForDedupe(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9À-ɏ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Validate one language-side of a card. Hard reasons block storage entirely;
 * warnings only cost quality points.
 *
 * This is the gate that did not exist before. Every rule here maps to a defect
 * observed in the 95 live rows or in early generator output.
 */
export function validateCardSide(
  front: string,
  back: string,
  cardType: CardType,
  opts: { label?: string } = {},
): ValidationResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const label = opts.label ? `${opts.label}:` : "";
  const f = (front ?? "").trim();
  const b = (back ?? "").trim();

  // ── Structural ───────────────────────────────────────────────────────────
  if (f.length < MIN_FRONT_CHARS) reasons.push(`${label}front_empty_or_too_short`);
  if (b.length < MIN_BACK_CHARS) reasons.push(`${label}back_empty_or_too_short`);
  if (f.length > MAX_FRONT_CHARS) reasons.push(`${label}front_too_long`);
  if (b.length > MAX_BACK_CHARS) reasons.push(`${label}back_too_long`);

  // ── Rubric / examiner voice ──────────────────────────────────────────────
  for (const { code, re } of RUBRIC_PATTERNS) {
    if (re.test(f) || re.test(b)) reasons.push(`${label}${code}`);
  }
  if (MARK_ALLOCATION_RE.test(f) || MARK_ALLOCATION_RE.test(b)) {
    reasons.push(`${label}mark_allocation`);
  }
  if (ESSAY_PROMPT_RE.test(f)) reasons.push(`${label}essay_prompt`);
  if (PLACEHOLDER_RE.test(b)) reasons.push(`${label}placeholder_answer`);

  // A back that is a long bullet checklist is a rubric in disguise.
  const bulletCount = (b.match(/(^|\n)\s*[•\-•*]\s+/g) ?? []).length;
  if (bulletCount >= 6) reasons.push(`${label}rubric_checklist`);

  // ── Shape of a real recall prompt ────────────────────────────────────────
  if (cardType === "cloze") {
    if (!f.includes("{{___}}")) reasons.push(`${label}cloze_missing_blank`);
  } else if (!f.includes("?") && !RECALL_OPENERS.test(f)) {
    reasons.push(`${label}front_not_a_prompt`);
  }

  // ALL-CAPS fronts are a direct copy artefact of the old pipeline.
  if (uppercaseRatio(f) > 0.6) reasons.push(`${label}front_all_caps`);

  // Cards that lean on material the learner cannot see are unanswerable.
  // Only a quoted title rescues an otherwise generic reference.
  if (CONTEXT_REFERENCE_RE.test(f) && !QUOTED_TITLE_RE.test(f)) {
    reasons.push(`${label}context_not_on_card`);
  }
  if (STIMULUS_LABEL_RE.test(f) || STIMULUS_LABEL_RE.test(b)) {
    reasons.push(`${label}references_unseen_stimulus`);
  }
  // "…symbolise for Lukas… A B C D" — an MCQ whose options were stripped.
  if (DANGLING_MCQ_RE.test(f)) reasons.push(`${label}dangling_mcq_options`);
  if (MCQ_ANSWER_PREFIX_RE.test(b)) reasons.push(`${label}mcq_answer_key_prefix`);
  // Ordering tasks are comprehension exercises, not recall cards.
  if (ORDERING_TASK_RE.test(f)) reasons.push(`${label}ordering_task`);
  // "the stream at G" — needs a map the learner does not have.
  if (MAP_LABEL_RE.test(f)) reasons.push(`${label}references_map_label`);

  // Answer leaking into the prompt makes the card untestable.
  const bHead = normaliseForDedupe(b).slice(0, 40);
  if (bHead.length >= 20 && normaliseForDedupe(f).includes(bHead)) {
    reasons.push(`${label}answer_leaked_into_front`);
  }

  // Front restating the whole memo = not atomic.
  if (f.length > 0 && b.length > 0 && f.length > b.length * 1.6 && f.length > 120) {
    warnings.push(`${label}front_longer_than_answer`);
  }

  // ── Soft quality ─────────────────────────────────────────────────────────
  let score = 100;
  if (b.length > MAX_BACK_CHARS * 0.8) { score -= 10; warnings.push(`${label}back_near_limit`); }
  if (f.length > MAX_FRONT_CHARS * 0.85) { score -= 5; warnings.push(`${label}front_near_limit`); }
  if (b.split(/\s+/).length < 3) { score -= 15; warnings.push(`${label}back_very_terse`); }
  if (bulletCount >= 4) { score -= 10; warnings.push(`${label}many_bullets`); }
  score -= warnings.length * 2;

  if (reasons.length > 0) score = Math.min(score, 0);
  return { ok: reasons.length === 0 && score >= MIN_QUALITY_SCORE, score, reasons, warnings };
}

/** Validate both language sides of a card plus cross-language coherence. */
export function validateCard(card: GeneratedCard): ValidationResult {
  const en = validateCardSide(card.front, card.back, card.cardType, { label: "en" });
  const af = validateCardSide(card.frontAf, card.backAf, card.cardType, { label: "af" });

  const reasons = [...en.reasons, ...af.reasons];
  const warnings = [...en.warnings, ...af.warnings];

  // Untranslated EN side — the model sometimes echoes the Afrikaans memo
  // verbatim into the English back, leaving an English learner with an
  // Afrikaans answer.
  const enText = `${card.front} ${card.back}`;
  const afHits = new Set((enText.match(AF_MARKERS) ?? []).map((m) => m.toLowerCase()));
  if (afHits.size >= 3) reasons.push("en_side_not_translated");

  // Untranslated AF side — a straight copy of EN means the model gave up.
  if (
    normaliseForDedupe(card.front) === normaliseForDedupe(card.frontAf) &&
    normaliseForDedupe(card.back) === normaliseForDedupe(card.backAf) &&
    card.front.split(/\s+/).length > 4
  ) {
    warnings.push("af_identical_to_en");
  }

  const score = Math.min(en.score, af.score) - (warnings.length > 4 ? 5 : 0);
  return { ok: reasons.length === 0 && score >= MIN_QUALITY_SCORE, score, reasons, warnings };
}

export function difficultyFromCognitive(level: string | null | undefined): Difficulty {
  switch (level) {
    case "knowledge":
      return "easy";
    case "comprehension":
      return "medium";
    case "analysis":
    case "synthesis":
      return "hard";
    default:
      return "medium";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Topic prioritisation
// ─────────────────────────────────────────────────────────────────────────────

export interface TopicPriority {
  topicId: number | null;
  name: string;
  nameAfrikaans: string | null;
  /** Times the topic appeared across sampled papers. NOT a fraction of years. */
  appearancesCount: number;
  /** Distinct years sampled. A different unit from appearancesCount — never
   *  render these as "X of Y"; appearancesCount routinely exceeds it. */
  totalYearsSampled: number;
  avgMarksPerAppearance: number;
  frequencyRank: number;
  /** Lexical keys used to bucket source questions into this topic. */
  keywords: string[];
}

const TOPIC_STOPWORDS = new Set([
  "and", "the", "of", "in", "to", "for", "with", "on", "a", "an",
  "en", "die", "van", "in", "vir", "met", "op", "'n",
  "studies", "general", "other", "introduction",
]);

function topicKeywords(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-zÀ-ɏ]+/)
    .filter((w) => w.length > 3 && !TOPIC_STOPWORDS.has(w));
}

/**
 * Ranked topics for a subject, high-yield first, from `dbe_topic_frequency`.
 * Falls back to the CAPS `topics` table when the subject has no frequency rows
 * (only 35 of 54 subjects are covered).
 */
export async function loadTopicPriorities(subject: string): Promise<TopicPriority[]> {
  const freqRows = await db
    .select({
      topicId: dbeTopicFrequency.topicId,
      name: topicsTable.name,
      nameAfrikaans: topicsTable.nameAfrikaans,
      appearancesCount: dbeTopicFrequency.appearancesCount,
      totalYearsSampled: dbeTopicFrequency.totalYearsSampled,
      avgMarksPerAppearance: dbeTopicFrequency.avgMarksPerAppearance,
      frequencyRank: dbeTopicFrequency.frequencyRank,
    })
    .from(dbeTopicFrequency)
    .leftJoin(topicsTable, eq(topicsTable.id, dbeTopicFrequency.topicId))
    .where(eq(dbeTopicFrequency.subject, subject));

  const ranked = freqRows
    .filter((r) => r.name)
    .map((r) => ({
      topicId: r.topicId,
      name: r.name as string,
      nameAfrikaans: r.nameAfrikaans ?? null,
      appearancesCount: r.appearancesCount ?? 0,
      totalYearsSampled: r.totalYearsSampled ?? 0,
      avgMarksPerAppearance: r.avgMarksPerAppearance ?? 0,
      frequencyRank: r.frequencyRank ?? 999,
      keywords: topicKeywords(r.name as string),
    }))
    .sort((a, b) => a.frequencyRank - b.frequencyRank);

  if (ranked.length > 0) return ranked;

  // Fallback: CAPS topic list, ordered by curriculum weighting.
  const capsRows = await db
    .select({
      id: topicsTable.id,
      name: topicsTable.name,
      nameAfrikaans: topicsTable.nameAfrikaans,
      capsWeighting: topicsTable.capsWeighting,
      typicalMarks: topicsTable.typicalMarks,
      orderIndex: topicsTable.orderIndex,
    })
    .from(topicsTable)
    .leftJoin(subjectsTable, eq(subjectsTable.id, topicsTable.subjectId))
    .where(eq(subjectsTable.name, subject));

  const weight = (w: string) => (w === "high" ? 0 : w === "medium" ? 1 : 2);
  return capsRows
    .sort((a, b) => weight(a.capsWeighting) - weight(b.capsWeighting) || a.orderIndex - b.orderIndex)
    .map((r, i) => ({
      topicId: r.id,
      name: r.name,
      nameAfrikaans: r.nameAfrikaans,
      appearancesCount: 0,
      totalYearsSampled: 0,
      avgMarksPerAppearance: r.typicalMarks ?? 0,
      frequencyRank: i + 1,
      keywords: topicKeywords(r.name),
    }));
}

/**
 * Best-effort lexical bucketing of a source question into a ranked topic.
 * `dbe_verbatim_questions.topic` is NULL for all 37,906 released rows, so there
 * is no stored mapping to lean on. Returns null when nothing matches — the LLM
 * is then asked to pick from the allowed topic list.
 */
export function bucketQuestionToTopic(
  text: string,
  priorities: TopicPriority[],
): TopicPriority | null {
  const hay = text.toLowerCase();
  let best: TopicPriority | null = null;
  let bestScore = 0;
  for (const t of priorities) {
    if (t.keywords.length === 0) continue;
    let hits = 0;
    for (const k of t.keywords) if (hay.includes(k)) hits++;
    // Require a real signal: at least one keyword, and for multi-word topics
    // prefer those matching more of their keywords.
    const score = hits === 0 ? 0 : hits / t.keywords.length + hits * 0.1;
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }
  return bestScore >= 0.34 ? best : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Source loading — quality gated
// ─────────────────────────────────────────────────────────────────────────────

export interface LoadSourcesOptions {
  subject: string;
  limit?: number;
  minQuality?: number;
  /** Source ids already turned into cards (resume / idempotency). */
  excludeIds?: Set<number>;
  language?: string;
  /**
   * Paper numbers to skip. Language subjects put set-work literature in P2,
   * which is inherently context-bound (the learner needs the novel or drama in
   * front of them) and rejects at ~70%. Excluding it concentrates the deck on
   * grammar and language structures, which card very well.
   */
  excludePapers?: number[];
}

/**
 * Released, clean, decently-scored verbatim rows with a usable memo.
 *
 * The gate matters: the previous pipeline had none, which is why garbled OCR
 * and rubric prose ended up on learner cards.
 */
export async function loadSourceQuestions(
  opts: LoadSourcesOptions,
): Promise<SourceQuestion[]> {
  const minQuality = opts.minQuality ?? MIN_SOURCE_QUALITY;
  const rows = await db
    .select({
      id: dbeVerbatimQuestions.id,
      subject: dbeVerbatimQuestions.subject,
      year: dbeVerbatimQuestions.year,
      session: dbeVerbatimQuestions.session,
      paperNumber: dbeVerbatimQuestions.paperNumber,
      questionNumber: dbeVerbatimQuestions.questionNumber,
      questionText: dbeVerbatimQuestions.questionText,
      memoText: dbeVerbatimQuestions.memoText,
      marks: dbeVerbatimQuestions.marks,
      cognitiveLevel: dbeVerbatimQuestions.cognitiveLevel,
      language: dbeVerbatimQuestions.language,
      qualityScore: dbeVerbatimQuestions.qualityScore,
    })
    .from(dbeVerbatimQuestions)
    .where(
      and(
        eq(dbeVerbatimQuestions.subject, opts.subject),
        isNotNull(dbeVerbatimQuestions.releasedAt),
        eq(dbeVerbatimQuestions.accuracyFlag, "clean"),
        gte(dbeVerbatimQuestions.qualityScore, minQuality),
        isNotNull(dbeVerbatimQuestions.memoText),
        sql`length(trim(${dbeVerbatimQuestions.memoText})) >= ${MIN_SOURCE_MEMO_CHARS}`,
        sql`length(trim(${dbeVerbatimQuestions.questionText})) BETWEEN 20 AND ${MAX_SOURCE_QUESTION_CHARS}`,
        ...(opts.language ? [eq(dbeVerbatimQuestions.language, opts.language)] : []),
        ...(opts.excludePapers?.length
          ? [sql`${dbeVerbatimQuestions.paperNumber} NOT IN ${opts.excludePapers}`]
          : []),
      ),
    )
    .orderBy(sql`${dbeVerbatimQuestions.qualityScore} DESC, ${dbeVerbatimQuestions.year} DESC`)
    .limit(opts.limit ?? 4000);

  return rows
    .filter((r) => !opts.excludeIds?.has(r.id))
    .map((r) => ({
      id: r.id,
      subject: r.subject,
      year: r.year,
      session: r.session,
      paperNumber: r.paperNumber,
      questionNumber: r.questionNumber,
      questionText: r.questionText.trim(),
      memoText: (r.memoText ?? "").trim(),
      marks: r.marks,
      cognitiveLevel: (r.cognitiveLevel as CognitiveLevel) ?? null,
      language: r.language,
      qualityScore: r.qualityScore,
    }));
}

/**
 * Draw sources so that high-yield topics dominate the deck.
 *
 * Sources are bucketed lexically against the frequency-ranked topic list, then
 * drawn round-robin with a per-topic quota proportional to `appearancesCount`.
 * Unbucketed sources are capped at UNBUCKETED_SHARE so an unmatched long tail
 * cannot swamp the deck.
 */
export function selectSources(
  sources: SourceQuestion[],
  priorities: TopicPriority[],
  targetCount: number,
): Array<{ source: SourceQuestion; topic: TopicPriority | null }> {
  const UNBUCKETED_SHARE = 0.2;
  const buckets = new Map<string, Array<{ source: SourceQuestion; topic: TopicPriority | null }>>();
  const unbucketed: Array<{ source: SourceQuestion; topic: TopicPriority | null }> = [];

  for (const s of sources) {
    const t = bucketQuestionToTopic(`${s.questionText} ${s.memoText.slice(0, 300)}`, priorities);
    if (!t) {
      unbucketed.push({ source: s, topic: null });
      continue;
    }
    const list = buckets.get(t.name) ?? [];
    list.push({ source: s, topic: t });
    buckets.set(t.name, list);
  }

  const totalWeight = priorities.reduce(
    (acc, p) => acc + Math.max(1, p.appearancesCount),
    0,
  );
  const bucketedTarget = Math.ceil(targetCount * (1 - UNBUCKETED_SHARE));
  const picked: Array<{ source: SourceQuestion; topic: TopicPriority | null }> = [];

  for (const p of priorities) {
    const list = buckets.get(p.name);
    if (!list || list.length === 0) continue;
    const share = Math.max(1, p.appearancesCount) / (totalWeight || 1);
    const quota = Math.max(1, Math.round(bucketedTarget * share));
    picked.push(...list.slice(0, quota));
  }

  // Top up from whatever is left, high-yield buckets first, then unbucketed.
  if (picked.length < targetCount) {
    const chosen = new Set(picked.map((p) => p.source.id));
    for (const p of priorities) {
      if (picked.length >= targetCount) break;
      for (const item of buckets.get(p.name) ?? []) {
        if (picked.length >= targetCount) break;
        if (!chosen.has(item.source.id)) {
          picked.push(item);
          chosen.add(item.source.id);
        }
      }
    }
    for (const item of unbucketed) {
      if (picked.length >= targetCount) break;
      picked.push(item);
    }
  }

  return picked.slice(0, targetCount);
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompting
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You write flashcards for South African NSC (matric) learners preparing for DBE exams.

You are given real past-paper questions together with the official marking memo. The memo is REFERENCE MATERIAL FOR YOU — it is written for a marker, in third person, about "the candidate". The learner must never see that voice. Your job is to convert the underlying knowledge into small study cards that teach.

HARD RULES

1. ATOMIC. One fact, definition, process step, formula, or cause-effect link per card. If the source is a 20-mark essay task, an extended-writing task, or a data-response task with a stimulus the learner cannot see, do NOT make a card of it — instead produce 2-4 small cards covering the underlying knowledge a learner needs to answer it. If there is no such recallable knowledge, return no cards for that source.

2. LEARNER VOICE, SECOND PERSON. The back states the actual answer directly, as if you were explaining it to the learner. Never "The candidate names three factors" — instead give the three factors. Never describe what an answer should contain; give the content.
   BAD  front: "Noem DRIE faktore wat die vraagkurwe verskuif. (3)"
        back:  "Die kandidaat noem drie faktore. KENMERKE • Inkomste • Smaak"
   GOOD front: "Name three factors that shift a demand curve."
        back:  "Income, price of substitutes, and consumer taste.\\nHook: anything EXCEPT the good's own price — that moves you along the curve, not the whole curve."

3. STRIP ALL RUBRIC SCAFFOLDING. No "FOKUS", "KENMERKE", "RUBRIEK", no "the candidate", no "accept any", no marker instructions, no tick marks, and no mark allocations of any kind — remove "[20]", "(4)", "(2 marks)", "(3 punte)".

4. MEMORY HOOK. Where it genuinely helps recall, end the back with one short line starting "Hook: " (EN) / "Onthou: " (AF). It must ADD something the answer does not already say — a mnemonic, a contrast with the concept learners confuse this with, a common exam trap, or the one word that earns the mark. Never restate the answer in different words. A hook like "Hook: high inflation discourages investment" on a card whose answer is "investment falls under high inflation" is worthless — omit it instead. Most cards should have a hook; a bad hook is worse than none.

5. LENGTH. Front at most 180 characters. Back at most 450 characters INCLUDING the hook. If the answer cannot fit, the card is not atomic enough — split it.

6. BILINGUAL. Every card needs natural English and natural Afrikaans. The Afrikaans must read as if written by an Afrikaans teacher, not machine-translated. Keep subject terminology in the standard CAPS Afrikaans form.

7. CARD TYPE. Use "basic" for question/answer. Use "cloze" only for formulas, definitions and rules where a fill-in-the-blank aids recall — mark the blank exactly as {{___}} in BOTH languages and put the missing text in the back.

8. TOPIC. Tag each card with exactly one topic name from the allowed list you are given. If none fit, use "General".

9. SELF-CONTAINED. The learner sees ONLY the card. Never refer to material that is not on it — no "the novel", "the poem", "the passage", "the diagram", "SOURCE 1B", "TEXT A", "the table above". A question like "Write the events in the correct order as they occur in the novel" is useless because the card never says which novel. Either name the work explicitly ("In Fiela se Kind, …") or skip. Never leave stripped multiple-choice option letters like "A B C D" dangling in the front.

10. ACCURACY. Never invent facts the memo does not support. If the memo is garbled, or the question only makes sense alongside a stimulus the learner cannot see, skip that source. A skipped source is always better than a wrong card.

11. BOTH LANGUAGES ARE MANDATORY. front_af and back_af may never be empty, and may never be a copy of the English. A card without real Afrikaans is discarded.

12. PROVENANCE. Every card MUST carry "source_index": the 1-based number of the SOURCE block it was distilled from. Learners can trace a card back to the real paper, so a wrong index is a broken citation. Never guess — if a card draws on more than one source, pick the one that carries the fact being tested.

OUTPUT
Return strict JSON: {"cards":[{"source_index","front","back","front_af","back_af","card_type","difficulty","topic"}]}
- source_index: integer, 1-based, referring to the SOURCE blocks below
- card_type: "basic" | "cloze"
- difficulty: "easy" | "medium" | "hard"
Return {"cards":[]} if nothing usable. Never wrap in markdown.`;

export function buildUserPrompt(
  batch: Array<{ source: SourceQuestion; topic: TopicPriority | null }>,
  allowedTopics: string[],
  cardsPerSource: number,
): string {
  const topicList = allowedTopics.length
    ? allowedTopics.map((t) => `- ${t}`).join("\n")
    : "- General";

  const items = batch
    .map(({ source, topic }, i) => {
      const isEssay =
        (source.marks ?? 0) >= ESSAY_MARK_THRESHOLD || ESSAY_PROMPT_RE.test(source.questionText);
      return [
        `### SOURCE ${i + 1}`,
        `subject: ${source.subject}`,
        `paper: ${source.year} ${source.session} P${source.paperNumber} Q${source.questionNumber}`,
        `marks: ${source.marks ?? "unknown"}`,
        `cognitive_level: ${source.cognitiveLevel ?? "knowledge"}`,
        `likely_topic: ${topic?.name ?? "unknown"}`,
        isEssay
          ? `NOTE: ${source.marks ?? "high"}-mark extended task — DECOMPOSE into atomic recall cards on the underlying knowledge, or return none.`
          : "",
        `QUESTION:\n${source.questionText}`,
        `MEMO (reference only — never quote its voice):\n${source.memoText.slice(0, 1800)}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return `Subject: ${batch[0]?.source.subject ?? "unknown"}

ALLOWED TOPICS (tag each card with one of these exact names, or "General"):
${topicList}

Produce up to ${cardsPerSource} cards per source. Fewer is fine. Skip any source that cannot make a self-contained card.

${items}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generation
// ─────────────────────────────────────────────────────────────────────────────

export interface GenerateOptions {
  model?: string;
  cardsPerSource?: number;
  temperature?: number;
  /** Retry the Afrikaans side when it comes back empty. Default true. */
  repairAfrikaans?: boolean;
}

export interface BatchResult {
  cards: Array<{ card: GeneratedCard; validation: ValidationResult; source: SourceQuestion }>;
  rejected: Array<{ card: GeneratedCard; validation: ValidationResult; source: SourceQuestion | null }>;
  rawCount: number;
  error?: string;
}

function coerceCardType(v: unknown): CardType {
  return v === "cloze" ? "cloze" : v === "reversed" ? "reversed" : "basic";
}

function coerceDifficulty(v: unknown, fallback: Difficulty): Difficulty {
  return v === "easy" || v === "medium" || v === "hard" ? v : fallback;
}

/** Trim residual mark allocations and rubric headings the model may echo. */
function scrub(s: string): string {
  return (s ?? "")
    .replace(/\[\s*\d+\s*\]/g, "")
    .replace(/\(\s*\d+\s*(marks?|punte)\s*\)/gi, "")
    .replace(/\s*\(\s*\d+\s*\)\s*$/g, "")
    .replace(/\b(FOKUS|KENMERKE|RUBRIEK|RUBRIC)\b\s*:?\s*/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** AF-side failures that are worth one repair attempt rather than a discard. */
const AF_REPAIRABLE = /^af:(front|back)_empty_or_too_short$|^af:front_not_a_prompt$/;

function isAfOnlyMissing(v: ValidationResult): boolean {
  return (
    v.reasons.length > 0 &&
    v.reasons.every((r) => AF_REPAIRABLE.test(r)) &&
    v.reasons.some((r) => r.endsWith("_empty_or_too_short"))
  );
}

const TRANSLATE_PROMPT = `You translate South African NSC flashcards from English into natural Afrikaans for matric learners.

Rules:
- Use standard CAPS Afrikaans subject terminology.
- Write as an Afrikaans teacher would, not a literal word-for-word translation.
- Keep the exact structure: if the English back ends with a "Hook: …" line, the Afrikaans back ends with an equivalent "Onthou: …" line.
- Preserve any {{___}} cloze blanks exactly.
- Never add mark allocations, rubric wording, or commentary.
- Check your spelling carefully.

Return strict JSON: {"cards":[{"index","front_af","back_af"}]} where index is the 1-based position of the card given to you.`;

/**
 * Second-chance translation for cards whose English side is good but whose
 * Afrikaans side came back empty. Without this, a well-formed card is thrown
 * away purely because the model skipped the translation — which accounted for
 * roughly a quarter of all rejections on the validation subjects.
 */
export async function repairAfrikaans(
  cards: GeneratedCard[],
  model: string,
): Promise<GeneratedCard[]> {
  if (cards.length === 0) return cards;
  try {
    const openai = getOpenAI();
    const payload = cards
      .map((c, i) => `### CARD ${i + 1}\nFRONT: ${c.front}\nBACK: ${c.back}`)
      .join("\n\n");
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: TRANSLATE_PROMPT },
        { role: "user", content: payload },
      ],
    });
    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
    const out = [...cards];
    for (const r of Array.isArray(parsed?.cards) ? parsed.cards : []) {
      const i = Number(r?.index) - 1;
      if (!Number.isInteger(i) || i < 0 || i >= out.length) continue;
      const frontAf = scrub(String(r?.front_af ?? ""));
      const backAf = scrub(String(r?.back_af ?? ""));
      if (frontAf && backAf) out[i] = { ...out[i], frontAf, backAf };
    }
    return out;
  } catch {
    // Repair is best-effort — the card still faces the same validation gate.
    return cards;
  }
}

/**
 * Turn a batch of source questions into validated cards.
 * Rejected cards are returned too, so the caller can report rejection rates
 * rather than silently losing them.
 */
export async function generateCardsForBatch(
  batch: Array<{ source: SourceQuestion; topic: TopicPriority | null }>,
  allowedTopics: string[],
  opts: GenerateOptions = {},
): Promise<BatchResult> {
  if (batch.length === 0) return { cards: [], rejected: [], rawCount: 0 };

  const model = opts.model ?? DEFAULT_MODEL;
  const cardsPerSource = opts.cardsPerSource ?? 3;
  const openai = getOpenAI();

  let parsed: any;
  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: opts.temperature ?? 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(batch, allowedTopics, cardsPerSource) },
      ],
    });
    parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
  } catch (err: any) {
    return { cards: [], rejected: [], rawCount: 0, error: err?.message ?? String(err) };
  }

  const raw: any[] = Array.isArray(parsed?.cards) ? parsed.cards : [];
  const accepted: BatchResult["cards"] = [];
  const rejected: BatchResult["rejected"] = [];
  const seenFronts = new Set<string>();

  for (const r of raw) {
    // Provenance must be explicit. A card whose source_index is missing or out
    // of range cannot be traced back to a real paper, and guessing an anchor
    // produces a card that cites the wrong question — worse than no card.
    const rawIdx = Number(r?.source_index);
    const sourceIdx =
      Number.isInteger(rawIdx) && rawIdx >= 1 && rawIdx <= batch.length ? rawIdx - 1 : null;

    if (sourceIdx === null) {
      rejected.push({
        card: {
          front: scrub(String(r?.front ?? "")),
          back: scrub(String(r?.back ?? "")),
          frontAf: scrub(String(r?.front_af ?? "")),
          backAf: scrub(String(r?.back_af ?? "")),
          cardType: coerceCardType(r?.card_type),
          difficulty: coerceDifficulty(r?.difficulty, "medium"),
          topic: typeof r?.topic === "string" ? r.topic.trim() : null,
          hook: null,
        },
        validation: { ok: false, score: 0, reasons: ["untraceable_source_index"], warnings: [] },
        source: null,
      });
      continue;
    }

    const source = batch[sourceIdx].source;

    const card: GeneratedCard = {
      front: scrub(String(r?.front ?? "")),
      back: scrub(String(r?.back ?? "")),
      frontAf: scrub(String(r?.front_af ?? "")),
      backAf: scrub(String(r?.back_af ?? "")),
      cardType: coerceCardType(r?.card_type),
      difficulty: coerceDifficulty(
        r?.difficulty,
        difficultyFromCognitive(source.cognitiveLevel),
      ),
      topic:
        typeof r?.topic === "string" && r.topic.trim().length > 0
          ? r.topic.trim()
          : null,
      hook: null,
    };

    const validation = validateCard(card);

    const dedupeKey = normaliseForDedupe(card.front);
    if (validation.ok && seenFronts.has(dedupeKey)) {
      rejected.push({
        card,
        validation: { ...validation, ok: false, reasons: ["duplicate_front"] },
        source,
      });
      continue;
    }

    if (validation.ok) {
      seenFronts.add(dedupeKey);
      accepted.push({ card, validation, source });
    } else {
      rejected.push({ card, validation, source });
    }
  }

  // ── Repair pass: rescue cards whose only defect is a missing AF side ──────
  if (opts.repairAfrikaans !== false) {
    const repairable = rejected.filter((r) => r.source && isAfOnlyMissing(r.validation));
    if (repairable.length > 0) {
      const repaired = await repairAfrikaans(repairable.map((r) => r.card), model);
      for (let i = 0; i < repairable.length; i++) {
        const entry = repairable[i];
        const card = repaired[i];
        const validation = validateCard(card);
        const dedupeKey = normaliseForDedupe(card.front);
        if (!validation.ok || seenFronts.has(dedupeKey)) continue;
        seenFronts.add(dedupeKey);
        accepted.push({ card, validation, source: entry.source! });
        const idx = rejected.indexOf(entry);
        if (idx >= 0) rejected.splice(idx, 1);
      }
    }
  }

  return { cards: accepted, rejected, rawCount: raw.length };
}

/** Stable key linking the EN and AF rows of one conceptual card. */
export function makePairKey(sourceId: number, front: string): string {
  let h = 0;
  const s = `${sourceId}::${normaliseForDedupe(front)}`;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return `fc_${sourceId}_${(h >>> 0).toString(36)}`;
}

/** Build the two per-language rows for the `flashcards` table. */
export function toFlashcardRows(
  card: GeneratedCard,
  source: SourceQuestion,
  validation: ValidationResult,
  model: string,
): Array<{
  subject: string;
  topic: string | null;
  language: string;
  front: string;
  back: string;
  cardType: string;
  difficulty: string;
  source: string;
  qualityScore: number;
  sourceQuestionId: number;
  metadata: CardProvenance;
}> {
  const pairKey = makePairKey(source.id, card.front);
  const provenance: CardProvenance = {
    sourceQuestionId: source.id,
    subject: source.subject,
    year: source.year,
    session: source.session,
    paperNumber: source.paperNumber,
    questionNumber: source.questionNumber,
    sourceMarks: source.marks,
    sourceCognitiveLevel: source.cognitiveLevel,
    generator: "flashcard-generator/v1",
    model,
    generatedAt: new Date().toISOString(),
    qualityScore: validation.score,
    pairKey,
  };

  const base = {
    subject: source.subject,
    topic: card.topic,
    cardType: card.cardType,
    difficulty: card.difficulty,
    source: "ai_humanised",
    qualityScore: validation.score,
    sourceQuestionId: source.id,
    metadata: provenance,
  };

  return [
    { ...base, language: "en", front: card.front, back: card.back },
    { ...base, language: "af", front: card.frontAf, back: card.backAf },
  ];
}
