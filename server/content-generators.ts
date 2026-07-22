/**
 * Content generators — Content Studio's learner-facing study material.
 *
 * WHY THIS EXISTS
 * ---------------
 * Content Studio was only an *ingestion* console (run-all / simulate-all /
 * verify / regenerate-timetable). It generated no study material, and three
 * learner surfaces were serving raw or wrong content:
 *
 *   • /api/daily-challenge  → hardcoded trivia ("powerhouse of the cell?"),
 *     because every subject_daily_challenges row was the WRONG SHAPE
 *     ({n,marks,topic,memoText,questionText}) and the isUsableSeed guard
 *     correctly dropped all of them.
 *   • /api/flashcards/deck  → raw exam fragments carrying mark notation and
 *     references to stimuli the learner never sees.
 *   • examiner tips / exam tips → did not exist at all.
 *
 * This module turns the verbatim DBE bank (+ examiner_profiles + the official
 * SACAI timetable) into four kinds of validated, bilingual study material:
 *
 *   1. generateFlashcards          — concept→explanation cards (wraps
 *                                    server/flashcard-generator.ts).
 *   2. generateExaminerTips        — "what earns marks", per subject.
 *   3. generateExamTips            — practical technique (time-per-mark, order,
 *                                    common mistakes), per subject.
 *   4. generateDailyChallengeMcqs  — proper {question,options,correctIndex,
 *                                    explanation} MCQs in the shape
 *                                    isUsableSeed accepts.
 *
 * SAFETY
 *   • Reads dbe_verbatim_questions / examiner_profiles ONLY. Never writes them.
 *   • Writes only to flashcards, subject_daily_challenges, subject_study_tips.
 *   • Every generator supports preview (generate + validate, write nothing).
 *   • REJECTS stimulus-dependent questions and STRIPS mark notation before any
 *     text reaches a learner. Both are unit-tested (tests/unit/content-generators).
 */
import { and, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "./db";
import {
  dbeVerbatimQuestions,
  subjectDailyChallenges,
  subjectStudyTips,
  flashcards as flashcardsTable,
} from "@shared/schema";
import {
  getOpenAI,
  DEFAULT_MODEL,
  generateCardsForBatch,
  loadSourceQuestions,
  loadTopicPriorities,
  selectSources,
  toFlashcardRows,
  validateCard,
  bucketQuestionToTopic,
  type GeneratedCard,
  type SourceQuestion,
  type TopicPriority,
} from "./flashcard-generator";
import {
  enumerateCapsTopics,
  subjectNameToCode,
  isLiteratureSubject,
  getLiteratureWorks,
  literatureTopicName,
  topicKeywords,
  buildSyllabusCardsPrompt,
  SYLLABUS_CARD_SYSTEM,
  buildLiteratureCardsPrompt,
  LITERATURE_CARD_SYSTEM,
  toCapsFlashcardRows,
  exceedsQuoteAllowance,
  type CapsCardSource,
} from "./caps-syllabus";
import { NSC_2026_TIMETABLE } from "./data/nsc-2026-timetable";

export { DEFAULT_MODEL };

// ─────────────────────────────────────────────────────────────────────────────
// Shared text hygiene — mark-notation stripper (unit-tested)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Remove DBE mark-allocation notation from a question/answer string so a
 * learner never sees examiner scaffolding on a card.
 *
 * Handles, anywhere in the string and in any combination:
 *   "[10]" "[ 20 ]"                    — bracketed section/paper totals
 *   "(1 x 1) (1)" "(2 x 2) (4)" "(1x1)"— allocation formulas
 *   "(2)" "(10)"                       — bare parenthesised mark counts
 *   "(2 marks)" "(3 punte)"           — spelled-out allocations
 *   "2 x 2 (4)"                        — un-parenthesised leading factor
 * then collapses the whitespace and any empty brackets left behind.
 *
 * Deliberately conservative about bare "(n)": only integers 1–199 are treated
 * as marks, so chemistry like "Fe(3)"-style tokens and years are less likely to
 * be clipped. This is exactly the notation seen on the live broken cards
 * (e.g. `... (more/less) expensive. (1 x 1) (1)` and `More (1) (1 x 1) (1)`).
 */
export function stripMarkNotation(input: string | null | undefined): string {
  let s = String(input ?? "");
  // spelled-out allocations first: (2 marks) / (3 punte)
  s = s.replace(/\(\s*\d{1,3}\s*(?:marks?|mark|punte|punt)\s*\)/gi, " ");
  // allocation formulas: (1 x 1) (4 × 2) (1x1)
  s = s.replace(/\(\s*\d{1,3}\s*[x×*]\s*\d{1,3}\s*\)/gi, " ");
  // un-parenthesised leading factor immediately before a bracket total: "2 x 2 (4)"
  s = s.replace(/\b\d{1,3}\s*[x×]\s*\d{1,3}\s*(?=[\(\[])/gi, " ");
  // bracketed totals: [10] [ 20 ]
  s = s.replace(/\[\s*\d{1,3}\s*\]/g, " ");
  // bare parenthesised mark counts: (2) (10) — integers 1..199 only
  s = s.replace(/\(\s*(?:[1-9]\d?|1\d\d)\s*\)/g, " ");
  // any empty brackets that survived
  s = s.replace(/\(\s*\)|\[\s*\]/g, " ");
  // tidy spacing around punctuation and collapse runs
  s = s.replace(/\s+([.,;:?!])/g, "$1").replace(/[ \t]{2,}/g, " ").replace(/\s+\n/g, "\n").trim();
  return s;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared text hygiene — stimulus-dependency rejector (unit-tested)
// ─────────────────────────────────────────────────────────────────────────────

export interface StimulusCheckInput {
  questionText: string;
  needsStimulus?: boolean | null;
  stimulusText?: string | null;
}

/**
 * Phrases that prove a question leans on material the learner will not have in
 * front of them (a figure, source, map block, passage, cartoon, table…). A card
 * or MCQ built from such a question is unanswerable in isolation.
 */
const STIMULUS_PHRASE_RES: RegExp[] = [
  /\brefer(?:ring|s)?\s+to\s+(?:the\s+)?(?:figure|fig\.?|table|graph|source|text|extract|diagram|map|cartoon|passage|picture|image|photograph|annexure|addendum|sketch|advert(?:isement)?|stimulus|data)\b/i,
  /\b(?:figure|fig\.?|source|text|extract|annexure|addendum|diagram|table|graph|sketch|item)\s+[A-Z0-9]{1,3}\b/i,
  /\bthe\s+(?:map|passage|extract|graph|table|diagram|cartoon|source|figure|picture|photograph|sketch|poem|novel|drama|advert(?:isement)?|article|scenario|case\s+study|text|data|stimulus)\s+(?:above|below|provided|shown|given|opposite|alongside)\b/i,
  /\b(?:above|below|shown|provided|given)\s+(?:map|passage|extract|graph|table|diagram|cartoon|source|figure|picture|sketch|text|data)\b/i,
  /\baccording\s+to\s+(?:the\s+)?(?:passage|source|text|extract|author|graph|table|diagram|cartoon|figure|data|map)\b/i,
  /\bin\s+the\s+(?:figure|diagram|table|graph|map|cartoon|source|extract|passage|photograph|sketch|picture)\b/i,
  /\bblocks?\s+[A-Z]\s?\d/i,                       // "blocks C4 and C5"
  /\b(?:grid\s+)?reference\s+[A-Z0-9]{2,}\b/i,     // topo-map grid refs
  /\bline[s]?\s+\d+\s*(?:to|–|-|and)\s*\d+\b/i,    // "lines 4 to 7"
  /\bstudy\s+(?:the\s+)?(?:figure|table|graph|source|text|extract|diagram|map|cartoon|passage|picture|image|addendum|advert(?:isement)?)\b/i,
  /\buse\s+(?:the\s+)?(?:information\s+in\s+the\s+|data\s+in\s+the\s+)?(?:figure|table|graph|source|text|extract|diagram|map|cartoon|passage|addendum)\b/i,
];

/**
 * True when a bank question cannot stand on its own because it depends on an
 * unseen stimulus. Uses the ingestion flags (`needs_stimulus`, `stimulus_text`)
 * AND the language of the question itself, so a row is rejected even when the
 * flags were never populated.
 */
export function isStimulusDependent(q: StimulusCheckInput): boolean {
  if (q.needsStimulus === true) return true;
  if (typeof q.stimulusText === "string" && q.stimulusText.trim().length > 0) return true;
  const text = q.questionText ?? "";
  return STIMULUS_PHRASE_RES.some((re) => re.test(text));
}

// ─────────────────────────────────────────────────────────────────────────────
// Source loading from the verbatim bank
// ─────────────────────────────────────────────────────────────────────────────

export interface BankQuestion {
  id: number;
  subject: string;
  year: number;
  session: string;
  paperNumber: number;
  questionNumber: string;
  questionText: string;
  memoText: string;
  marks: number | null;
  cognitiveLevel: string | null;
  language: string;
  needsStimulus: boolean | null;
  stimulusText: string | null;
  topic: string | null;
}

export interface LoadBankOptions {
  subject: string;
  limit?: number;
  minQuality?: number;
  /** Drop stimulus-dependent questions (default true). */
  rejectStimulus?: boolean;
  /** Restrict to a single language (e.g. "English"). */
  language?: string;
  /** Cap the question length — long data-response prompts card badly. */
  maxQuestionChars?: number;
}

export interface LoadBankResult {
  questions: BankQuestion[];
  considered: number;
  rejectedStimulus: number;
}

/**
 * Released, clean, quality-gated verbatim rows with a usable memo, optionally
 * filtered down to self-contained questions. Read-only — never writes the bank.
 */
export async function loadBankQuestions(opts: LoadBankOptions): Promise<LoadBankResult> {
  const minQuality = opts.minQuality ?? 70;
  const maxChars = opts.maxQuestionChars ?? 600;
  const rejectStimulus = opts.rejectStimulus ?? true;

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
      needsStimulus: dbeVerbatimQuestions.needsStimulus,
      stimulusText: dbeVerbatimQuestions.stimulusText,
      topic: dbeVerbatimQuestions.topic,
    })
    .from(dbeVerbatimQuestions)
    .where(
      and(
        eq(dbeVerbatimQuestions.subject, opts.subject),
        isNotNull(dbeVerbatimQuestions.releasedAt),
        eq(dbeVerbatimQuestions.accuracyFlag, "clean"),
        gte(dbeVerbatimQuestions.qualityScore, minQuality),
        isNotNull(dbeVerbatimQuestions.memoText),
        sql`length(trim(${dbeVerbatimQuestions.memoText})) >= 20`,
        sql`length(trim(${dbeVerbatimQuestions.questionText})) BETWEEN 20 AND ${maxChars}`,
        ...(opts.language ? [eq(dbeVerbatimQuestions.language, opts.language)] : []),
      ),
    )
    .orderBy(sql`${dbeVerbatimQuestions.qualityScore} DESC, ${dbeVerbatimQuestions.year} DESC`)
    .limit(opts.limit ?? 3000);

  let rejectedStimulus = 0;
  const questions: BankQuestion[] = [];
  for (const r of rows) {
    const bq: BankQuestion = {
      ...r,
      questionText: r.questionText.trim(),
      memoText: (r.memoText ?? "").trim(),
    };
    if (rejectStimulus && isStimulusDependent(bq)) {
      rejectedStimulus++;
      continue;
    }
    questions.push(bq);
  }

  return { questions, considered: rows.length, rejectedStimulus };
}

// ─────────────────────────────────────────────────────────────────────────────
// Examiner-profile access (examiner_profiles is created out-of-band by
// _examiner-profiles.mjs; read it with raw SQL rather than a drizzle model).
// ─────────────────────────────────────────────────────────────────────────────

export interface ExaminerProfile {
  subject: string;
  paperNumber: number;
  profile: any;
  sampleSize: number;
}

export async function loadExaminerProfiles(subject: string): Promise<ExaminerProfile[]> {
  try {
    const res: any = await db.execute(sql`
      SELECT subject, paper_number, profile, question_sample_size
      FROM examiner_profiles
      WHERE subject = ${subject}
      ORDER BY paper_number
    `);
    const rows = Array.isArray(res) ? res : res.rows ?? [];
    return rows.map((r: any) => ({
      subject: r.subject,
      paperNumber: Number(r.paper_number),
      profile: typeof r.profile === "string" ? JSON.parse(r.profile) : r.profile,
      sampleSize: Number(r.question_sample_size ?? 0),
    }));
  } catch (err: any) {
    // examiner_profiles may not exist in a bare local DB — degrade gracefully.
    console.warn(`[content-gen] examiner_profiles unavailable for ${subject}: ${err?.message}`);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bilingual JSON helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseJson(content: string | null | undefined): any {
  try {
    return JSON.parse(content ?? "{}");
  } catch {
    return {};
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 1) DAILY-CHALLENGE MCQ GENERATOR
// ═════════════════════════════════════════════════════════════════════════════

export interface GeneratedMcq {
  question: string;
  questionAf: string;
  options: string[];
  optionsAf: string[];
  correctIndex: number;
  explanation: string;
  explanationAf: string;
  topic: string | null;
  difficulty: "easy" | "medium" | "hard";
  sourceQuestionId: number;
  provenance: string;
}

export interface McqResult {
  mcqs: GeneratedMcq[];
  rejected: Array<{ reason: string; sourceQuestionId: number | null }>;
  rawCount: number;
  sourcesConsidered: number;
  rejectedStimulus: number;
}

/**
 * A generated MCQ is only usable if it carries every field the learner render
 * path and the /api/daily-challenge isUsableSeed guard require, and if the stem
 * and options are self-contained after mark notation is stripped.
 */
export function isUsableMcq(m: any): { ok: boolean; reason: string } {
  if (!m || typeof m.question !== "string" || m.question.trim().length < 8)
    return { ok: false, reason: "question_empty" };
  if (!Array.isArray(m.options) || m.options.length !== 4)
    return { ok: false, reason: "needs_4_options" };
  if (m.options.some((o: any) => typeof o !== "string" || o.trim().length === 0))
    return { ok: false, reason: "blank_option" };
  if (!Array.isArray(m.optionsAf) || m.optionsAf.length !== 4 || m.optionsAf.some((o: any) => typeof o !== "string" || o.trim().length === 0))
    return { ok: false, reason: "af_options_missing" };
  if (typeof m.correctIndex !== "number" || m.correctIndex < 0 || m.correctIndex > 3)
    return { ok: false, reason: "bad_correct_index" };
  if (typeof m.questionAf !== "string" || m.questionAf.trim().length < 8)
    return { ok: false, reason: "af_question_missing" };
  // distinct options
  const lc = m.options.map((o: string) => o.trim().toLowerCase());
  if (new Set(lc).size !== lc.length) return { ok: false, reason: "duplicate_options" };
  // must not still reference an unseen stimulus
  if (isStimulusDependent({ questionText: m.question })) return { ok: false, reason: "references_stimulus" };
  // mark notation must be gone
  if (/\[\s*\d+\s*\]|\(\s*\d+\s*(?:marks?|punte)?\s*\)/i.test(m.question))
    return { ok: false, reason: "mark_notation_in_stem" };
  return { ok: true, reason: "" };
}

const MCQ_SYSTEM = `You convert South African NSC (matric) past-paper questions into clean multiple-choice questions for a daily challenge.

You are given real DBE questions with their official marking memo. The memo holds the correct answer — use it. Your job: write ONE self-contained MCQ per source that a Grade 12 learner can answer with no other material in front of them.

HARD RULES
1. SELF-CONTAINED. Never reference a figure, source, table, graph, map, passage, cartoon, extract, "block C4", or any stimulus the learner cannot see. If the source needs one, SKIP it (return nothing for that source).
2. FOUR options exactly. Exactly one is correct (grounded in the memo). The other three are plausible, subject-appropriate distractors — common misconceptions, not obviously silly. Do not make one option absurd.
3. NO MARK NOTATION anywhere — no "[10]", "(2)", "(1 x 1)", "(3 marks)".
4. correct_index is the 0-based position of the correct option.
5. EXPLANATION: one or two sentences saying why the correct option is right, grounded in the memo. Never "see memo".
6. BILINGUAL. Natural English AND natural Afrikaans (CAPS subject terminology) for the question, all four options (same order, same correct index), and the explanation. Afrikaans may never be empty or a copy of the English.
7. DIFFICULTY: "easy" | "medium" | "hard" — from the cognitive demand.
8. STAY ON THE MEMO. Never invent facts the memo does not support. A skipped source is better than a wrong MCQ.
9. TOPIC: a short syllabus topic label (e.g. "Demand and supply", "Photosynthesis"). Use "General" if unsure.
10. PROVENANCE: every MCQ carries "source_index" — the 1-based number of the SOURCE block it came from.

OUTPUT strict JSON: {"mcqs":[{"source_index","question","question_af","options","options_af","correct_index","explanation","explanation_af","topic","difficulty"}]}
options / options_af are arrays of exactly 4 strings. Return {"mcqs":[]} if nothing usable. Never wrap in markdown.`;

function buildMcqPrompt(batch: BankQuestion[]): string {
  const items = batch
    .map((s, i) =>
      [
        `### SOURCE ${i + 1}`,
        `subject: ${s.subject}`,
        `paper: ${s.year} ${s.session} P${s.paperNumber} Q${s.questionNumber}`,
        `marks: ${s.marks ?? "unknown"}  cognitive_level: ${s.cognitiveLevel ?? "knowledge"}`,
        `QUESTION:\n${stripMarkNotation(s.questionText)}`,
        `MEMO (holds the correct answer):\n${s.memoText.slice(0, 1200)}`,
      ].join("\n"),
    )
    .join("\n\n");
  return `Subject: ${batch[0]?.subject ?? "unknown"}

Turn each SOURCE into at most ONE self-contained MCQ. Skip any that need an unseen stimulus.

${items}`;
}

export interface GenerateMcqOptions {
  subject: string;
  count?: number;         // target usable MCQs
  model?: string;
  batchSize?: number;
  minQuality?: number;
  /**
   * Cap the number of sequential OpenAI batches. Preview mode passes 1 so
   * the endpoint answers in a single-batch wall-time (~15-25s) even when
   * hygiene rejects everything the model produces — otherwise a bad-luck
   * subject could loop through five batches and blow past the Cloudflare
   * 100s origin timeout, dropping the reply and leaving the client hanging.
   */
  maxBatches?: number;
}

export async function generateDailyChallengeMcqs(opts: GenerateMcqOptions): Promise<McqResult> {
  const model = opts.model ?? DEFAULT_MODEL;
  const target = opts.count ?? 20;
  const batchSize = opts.batchSize ?? 5;
  const maxBatches = Math.max(1, opts.maxBatches ?? Number.POSITIVE_INFINITY);

  // Prefer knowledge/comprehension short-answer questions — they convert to
  // clean MCQs far more reliably than multi-mark essay tasks.
  const loaded = await loadBankQuestions({
    subject: opts.subject,
    limit: Math.max(target * 12, 300),
    minQuality: opts.minQuality ?? 70,
    rejectStimulus: true,
    maxQuestionChars: 340,
  });

  // Draw a spread: shorter, lower-mark questions first — these convert to clean
  // MCQs far more reliably than scenario/essay tasks (which the model skips).
  const pool = [...loaded.questions]
    .filter((q) => (q.marks ?? 99) <= 8)
    .sort((a, b) => (a.marks ?? 9) - (b.marks ?? 9) || a.questionText.length - b.questionText.length);
  // Cap loaded sources to what maxBatches × batchSize can consume, so preview
  // mode (maxBatches=1) never buffers 25 rows just to throw 20 away — and,
  // more importantly, the `sources.length` bound in the batch loop matches
  // the maxBatches ceiling.
  const sliceMax = Number.isFinite(maxBatches)
    ? Math.min(target * 5, maxBatches * batchSize)
    : target * 5;
  const sources = (pool.length >= target ? pool : loaded.questions).slice(0, sliceMax);

  const result: McqResult = {
    mcqs: [],
    rejected: [],
    rawCount: 0,
    sourcesConsidered: loaded.considered,
    rejectedStimulus: loaded.rejectedStimulus,
  };

  const openai = getOpenAI();
  const seen = new Set<string>();
  let batchesUsed = 0;

  for (let i = 0; i < sources.length && result.mcqs.length < target && batchesUsed < maxBatches; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    batchesUsed++;
    let parsed: any;
    const t0 = Date.now();
    try {
      const completion = await openai.chat.completions.create({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: MCQ_SYSTEM },
          { role: "user", content: buildMcqPrompt(batch) },
        ],
      });
      parsed = parseJson(completion.choices[0]?.message?.content);
      console.log(`[daily-challenge] ${opts.subject} batch ${batchesUsed}/${Number.isFinite(maxBatches) ? maxBatches : "∞"}: openai returned ${Array.isArray(parsed?.mcqs) ? parsed.mcqs.length : 0} in ${Date.now() - t0}ms`);
    } catch (err: any) {
      console.warn(`[daily-challenge] ${opts.subject} batch ${batchesUsed} failed after ${Date.now() - t0}ms: ${err?.message ?? err}`);
      result.rejected.push({ reason: `llm_error:${err?.message ?? err}`, sourceQuestionId: null });
      continue;
    }

    const raw: any[] = Array.isArray(parsed?.mcqs) ? parsed.mcqs : [];
    result.rawCount += raw.length;

    for (const r of raw) {
      const idx = Number(r?.source_index);
      const src = Number.isInteger(idx) && idx >= 1 && idx <= batch.length ? batch[idx - 1] : null;
      if (!src) {
        result.rejected.push({ reason: "untraceable_source_index", sourceQuestionId: null });
        continue;
      }
      const mcq = {
        question: stripMarkNotation(r?.question),
        questionAf: stripMarkNotation(r?.question_af),
        options: Array.isArray(r?.options) ? r.options.map((o: any) => stripMarkNotation(o)) : [],
        optionsAf: Array.isArray(r?.options_af) ? r.options_af.map((o: any) => stripMarkNotation(o)) : [],
        correctIndex: Number(r?.correct_index),
        explanation: String(r?.explanation ?? "").trim(),
        explanationAf: String(r?.explanation_af ?? "").trim(),
        topic: typeof r?.topic === "string" && r.topic.trim() ? r.topic.trim() : null,
        difficulty: (["easy", "medium", "hard"].includes(r?.difficulty) ? r.difficulty : "medium") as GeneratedMcq["difficulty"],
        sourceQuestionId: src.id,
        provenance: `${src.subject} ${src.year} ${src.session} P${src.paperNumber} Q${src.questionNumber} (src #${src.id})`,
      };
      const verdict = isUsableMcq(mcq);
      if (!verdict.ok) {
        result.rejected.push({ reason: verdict.reason, sourceQuestionId: src.id });
        continue;
      }
      const key = mcq.question.toLowerCase().replace(/\s+/g, " ").trim();
      if (seen.has(key)) {
        result.rejected.push({ reason: "duplicate_question", sourceQuestionId: src.id });
        continue;
      }
      seen.add(key);
      result.mcqs.push(mcq as GeneratedMcq);
    }
  }

  return result;
}

/** Row shape written into subject_daily_challenges.questions_json (isUsableSeed-compatible). */
export function mcqToSeedItem(m: GeneratedMcq) {
  return {
    question: m.question,
    questionAf: m.questionAf,
    options: m.options,
    optionsAf: m.optionsAf,
    correctIndex: m.correctIndex,
    explanation: m.explanation,
    explanationAf: m.explanationAf,
    topic: m.topic,
    difficulty: m.difficulty,
    source: "dbe",
    sourceQuestionId: m.sourceQuestionId,
  };
}

/**
 * Replace the daily-challenge pool for a subject with fresh, correctly-shaped
 * MCQs. Per-subject replace (delete-then-insert) so re-runs never accumulate or
 * leave the old wrong-shape rows behind. Additive across subjects.
 */
export async function persistDailyChallengeMcqs(subject: string, mcqs: GeneratedMcq[]): Promise<number> {
  if (mcqs.length === 0) return 0;
  const items = mcqs.map(mcqToSeedItem);
  await db.transaction(async (tx) => {
    await tx.delete(subjectDailyChallenges).where(eq(subjectDailyChallenges.subject, subject));
    await tx.insert(subjectDailyChallenges).values({
      subject,
      questionsJson: items,
      totalQuestions: items.length,
    });
  });
  return items.length;
}

// ═════════════════════════════════════════════════════════════════════════════
// 2) EXAMINER TIPS GENERATOR
// ═════════════════════════════════════════════════════════════════════════════

export interface GeneratedTip {
  category: string;
  tip: string;
  tipAf: string;
  topic: string | null;
  paperNumber: number | null;
  evidence: Array<{ year?: number; paper?: number; note: string }>;
  sourceQuestionIds: number[];
}

export interface TipResult {
  tips: GeneratedTip[];
  rejected: Array<{ reason: string }>;
  rawCount: number;
  basis: string[];
}

const EXAMINER_SYSTEM = `You are an experienced South African NSC examiner writing "how to earn the marks" tips for Grade 12 learners.

You are given, for one subject: (a) machine-extracted examiner profiles per paper (mark-allocation histograms, cognitive spread, most-rotated topics, marking conventions), and (b) real past-paper questions with their official memos. Everything you are given is REAL DBE material.

Write concise, practical tips a learner can act on. Each tip must be grounded in the evidence — cite the year/paper where you can. Cover a spread of these categories:
  - "command_words"   : what "discuss / explain / evaluate / name / state" demand and how much to write.
  - "mark_allocation" : how marks map to points (e.g. a 4-mark question wants four distinct points; one tick per fact).
  - "recurring_stems" : topics/question types that come back year after year.
  - "memo_phrasing"   : the exact wording/keywords the memo rewards.
  - "structure"       : how the paper is built (MCQ share, sub-question depth) and how to budget attention.

HARD RULES
1. Be specific to THIS subject and cite real evidence (a year, a paper, a mark value, a command word). No generic study fluff.
2. NO MARK NOTATION artefacts like "(1 x 1)" — describe the allocation in words.
3. BILINGUAL: natural English (tip) and natural Afrikaans (tip_af, CAPS terminology). Afrikaans may not be empty or an English copy.
4. Each tip 1–3 sentences. Actionable. Never invent facts the evidence does not support.
5. "evidence" lists 1–3 short {year,paper,note} citations backing the tip.

OUTPUT strict JSON: {"tips":[{"category","tip","tip_af","paper_number","evidence":[{"year","paper","note"}]}]}
paper_number may be null for whole-subject tips. Return up to the number requested. Never wrap in markdown.`;

function summariseProfile(p: ExaminerProfile): string {
  const pr = p.profile ?? {};
  const marks = pr.markAllocation?.histogram
    ? Object.entries(pr.markAllocation.histogram)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 6)
        .map(([m, n]) => `${m}m×${n}`)
        .join(", ")
    : "n/a";
  const topics = Array.isArray(pr.topicRotation)
    ? pr.topicRotation.slice(0, 8).map((t: any) => `${t.topic} (${t.years?.join("/")})`).join("; ")
    : "n/a";
  const conv = pr.markingConventions
    ? Object.entries(pr.markingConventions)
        .filter(([, v]: any) => Number(v) >= 0.25)
        .map(([k, v]: any) => `${k}=${(Number(v) * 100).toFixed(0)}%`)
        .join(", ")
    : "n/a";
  return [
    `PAPER ${p.paperNumber} (sample ${p.sampleSize}, years ${(pr.yearsCovered ?? []).join("/")})`,
    `  modal marks: ${pr.markAllocation?.modalMarks ?? "?"}; mark histogram: ${marks}`,
    `  MCQ share: ${pr.structure?.mcqShare ?? "?"}; max numbering depth: ${pr.structure?.maxNumberingDepth ?? "?"}`,
    `  cognitive spread: ${JSON.stringify(pr.cognitiveSpread ?? {})}`,
    `  most-rotated topics: ${topics}`,
    `  marking conventions (share of memos): ${conv}`,
  ].join("\n");
}

export interface GenerateTipsOptions {
  subject: string;
  count?: number;
  model?: string;
}

export async function generateExaminerTips(opts: GenerateTipsOptions): Promise<TipResult> {
  const model = opts.model ?? DEFAULT_MODEL;
  const count = opts.count ?? 6;

  const profiles = await loadExaminerProfiles(opts.subject);
  const loaded = await loadBankQuestions({
    subject: opts.subject,
    limit: 60,
    minQuality: 72,
    rejectStimulus: true,
    maxQuestionChars: 400,
  });

  const result: TipResult = { tips: [], rejected: [], rawCount: 0, basis: [] };
  if (profiles.length === 0 && loaded.questions.length === 0) {
    result.rejected.push({ reason: "no_examiner_profile_or_bank_questions" });
    return result;
  }
  result.basis = profiles.map((p) => `P${p.paperNumber} (n=${p.sampleSize})`);

  // A dozen real memo excerpts anchor the "what the memo rewards" tips.
  const memoSamples = loaded.questions.slice(0, 12).map((q, i) =>
    `#${i + 1} [${q.year} P${q.paperNumber} Q${q.questionNumber}, ${q.marks ?? "?"}m] Q: ${stripMarkNotation(q.questionText).slice(0, 220)}\n   MEMO: ${q.memoText.slice(0, 260)}`,
  );

  const userPrompt = `SUBJECT: ${opts.subject}

EXAMINER PROFILES (deterministic extraction from the verbatim bank):
${profiles.map(summariseProfile).join("\n\n") || "(none available)"}

REAL QUESTION+MEMO EXCERPTS:
${memoSamples.join("\n\n") || "(none available)"}

Write ${count} examiner tips for this subject, spread across the categories.`;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EXAMINER_SYSTEM },
        { role: "user", content: userPrompt },
      ],
    });
    const parsed = parseJson(completion.choices[0]?.message?.content);
    const raw: any[] = Array.isArray(parsed?.tips) ? parsed.tips : [];
    result.rawCount = raw.length;
    const srcIds = loaded.questions.slice(0, 12).map((q) => q.id);
    for (const r of raw) {
      const tip = stripMarkNotation(r?.tip);
      const tipAf = stripMarkNotation(r?.tip_af);
      if (tip.length < 12 || tipAf.length < 12) {
        result.rejected.push({ reason: "tip_too_short_or_missing_af" });
        continue;
      }
      if (tip.trim().toLowerCase() === tipAf.trim().toLowerCase()) {
        result.rejected.push({ reason: "af_identical_to_en" });
        continue;
      }
      result.tips.push({
        category: typeof r?.category === "string" ? r.category : "general",
        tip,
        tipAf,
        topic: null,
        paperNumber: Number.isInteger(r?.paper_number) ? r.paper_number : null,
        evidence: Array.isArray(r?.evidence)
          ? r.evidence.slice(0, 3).map((e: any) => ({
              year: Number.isInteger(e?.year) ? e.year : undefined,
              paper: Number.isInteger(e?.paper) ? e.paper : undefined,
              note: String(e?.note ?? "").slice(0, 200),
            }))
          : [],
        sourceQuestionIds: srcIds,
      });
    }
  } catch (err: any) {
    result.rejected.push({ reason: `llm_error:${err?.message ?? err}` });
  }

  return result;
}

// ═════════════════════════════════════════════════════════════════════════════
// 3) EXAM TIPS GENERATOR
// ═════════════════════════════════════════════════════════════════════════════

export interface PaperTiming {
  paperNumber: number;
  durationMinutes: number;
  totalMarks: number | null;
  minutesPerMark: number | null;
}

/**
 * Curated, authoritative NSC Grade-12 paper mark totals for the subjects most
 * learners take. Deriving totals from the bank is UNRELIABLE — capture
 * completeness varies wildly by subject (Life Sciences reads ~60, Business
 * Studies P1 reads ~336 when languages are summed), and a wrong per-mark number
 * misleads a learner worse than none. These are the published totals; the bank
 * is only used as a strictly-gated fallback for subjects not listed here.
 * Keys are lowercased subject names → { [paperNumber]: totalMarks }.
 */
const CURATED_PAPER_TOTALS: Record<string, Record<number, number>> = {
  "mathematics": { 1: 150, 2: 150 },
  "mathematical literacy": { 1: 150, 2: 150 },
  "technical mathematics": { 1: 150, 2: 150 },
  "physical sciences": { 1: 150, 2: 150 },
  "technical sciences": { 1: 150, 2: 150 },
  "life sciences": { 1: 150, 2: 150 },
  "agricultural sciences": { 1: 150, 2: 150 },
  "economics": { 1: 150, 2: 150 },
  "business studies": { 1: 150, 2: 150 },
  "accounting": { 1: 150, 2: 150 },
  "geography": { 1: 225, 2: 100 },
  "history": { 1: 150, 2: 150 },
  "religion studies": { 1: 150, 2: 150 },
  "tourism": { 1: 200 },
  "consumer studies": { 1: 200 },
  "hospitality studies": { 1: 200 },
  "information technology": { 1: 150, 2: 150 },
  "computer applications technology": { 1: 150, 2: 150 },
  "engineering graphics and design": { 1: 200, 2: 200 },
};

/** Language papers share fixed totals by paper number, keyed by tier. */
function curatedLanguageTotal(subject: string, paperNumber: number): number | null {
  const s = subject.toLowerCase();
  if (/home language/.test(s)) return ({ 1: 70, 2: 80, 3: 100 } as Record<number, number>)[paperNumber] ?? null;
  if (/first additional language/.test(s)) return ({ 1: 80, 2: 70, 3: 100 } as Record<number, number>)[paperNumber] ?? null;
  if (/second additional language/.test(s)) return ({ 1: 100, 2: 100, 3: 100 } as Record<number, number>)[paperNumber] ?? null;
  return null;
}

function curatedPaperTotal(subject: string, paperNumber: number): number | null {
  const direct = CURATED_PAPER_TOTALS[subject.toLowerCase()]?.[paperNumber];
  if (direct) return direct;
  return curatedLanguageTotal(subject, paperNumber);
}

const STANDARD_TOTALS = [50, 60, 70, 75, 80, 100, 120, 125, 150, 160, 175, 180, 200, 225, 250, 300, 400];

/** Official SACAI November durations for a subject, paired with mark totals from
 *  the curated map (authoritative). For subjects not in the map, a bank-derived
 *  median is used ONLY when it snaps tightly to a standard total with good year
 *  coverage; otherwise the total is left null and no per-mark number is stated. */
export async function computePaperTimings(subject: string): Promise<PaperTiming[]> {
  const entries = NSC_2026_TIMETABLE.filter(
    (e) => !e.isNonExaminationDay && e.subjectName.toLowerCase() === subject.toLowerCase(),
  );

  const markTotals: Record<number, number> = {};
  // Strict bank fallback only for papers with no curated total.
  const needBank = entries.some((e) => curatedPaperTotal(subject, e.paperNumber) == null);
  if (needBank) {
    try {
      const res: any = await db.execute(sql`
        SELECT paper_number, language,
               percentile_cont(0.5) WITHIN GROUP (ORDER BY s)::numeric AS med,
               COUNT(*)::int AS yrs
        FROM (
          SELECT paper_number, language, year, session, SUM(marks)::int AS s
          FROM dbe_verbatim_questions
          WHERE subject = ${subject} AND marks IS NOT NULL AND released_at IS NOT NULL
            AND paper_number IS NOT NULL
          GROUP BY paper_number, language, year, session
        ) t
        GROUP BY paper_number, language
      `);
      const rows = Array.isArray(res) ? res : res.rows ?? [];
      const bestByPaper = new Map<number, { med: number; yrs: number }>();
      for (const r of rows) {
        const paper = Number(r.paper_number);
        const med = Number(r.med);
        const yrs = Number(r.yrs);
        if (!Number.isFinite(med) || med < 30 || med > 500) continue;
        const cur = bestByPaper.get(paper);
        if (!cur || med > cur.med) bestByPaper.set(paper, { med, yrs });
      }
      for (const [paper, { med, yrs }] of bestByPaper) {
        // Only trust the bank when it lands within 4% of a standard total AND we
        // have enough years to believe the median — otherwise leave it null.
        let snapped: number | null = null;
        for (const t of STANDARD_TOTALS) {
          if (Math.abs(t - med) <= t * 0.04) { snapped = t; break; }
        }
        if (snapped != null && yrs >= 5) markTotals[paper] = snapped;
      }
    } catch {
      /* bank total is best-effort */
    }
  }
  // Curated totals win outright.
  for (const e of entries) {
    const curated = curatedPaperTotal(subject, e.paperNumber);
    if (curated != null) markTotals[e.paperNumber] = curated;
  }

  const byPaper = new Map<number, PaperTiming>();
  for (const e of entries) {
    if (byPaper.has(e.paperNumber)) continue;
    const totalMarks = markTotals[e.paperNumber] ?? null;
    byPaper.set(e.paperNumber, {
      paperNumber: e.paperNumber,
      durationMinutes: e.durationMinutes,
      totalMarks,
      minutesPerMark: totalMarks ? +(e.durationMinutes / totalMarks).toFixed(2) : null,
    });
  }
  return [...byPaper.values()].sort((a, b) => a.paperNumber - b.paperNumber);
}

/** Mine memos for the phrasings that signal where learners lose marks. */
async function mineCommonMistakes(subject: string): Promise<string[]> {
  const { questions } = await loadBankQuestions({
    subject,
    limit: 400,
    minQuality: 70,
    rejectStimulus: false,
    maxQuestionChars: 600,
  });
  const signals: Array<{ re: RegExp; note: string }> = [
    { re: /\bone word (?:only|answer)|slegs een woord\b/i, note: "some answers must be ONE word only — extra words can cost the mark" },
    { re: /\bdo not (?:accept|award)|moenie aanvaar\b/i, note: "the memo explicitly refuses certain near-miss answers" },
    { re: /\bpenali[sz]e|penaliseer\b/i, note: "specific mistakes are penalised, not just left unmarked" },
    { re: /\b(?:show|showing) (?:all )?(?:your )?working|wys(?:\s+alle)? bewerking\b/i, note: "method marks require you to show working, not just the answer" },
    { re: /\bunit[s]?\b.*\bmark|correct unit|regte eenheid\b/i, note: "units carry marks — a bare number loses the unit mark" },
    { re: /\bany (?:one|two|three|valid|relevant)|enige (?:een|twee|drie)\b/i, note: "several answers are accepted — give the required NUMBER of distinct points" },
    { re: /\bmax(?:imum)?\.?\s*\d+\b/i, note: "there is a capped maximum — extra points beyond the cap earn nothing" },
    { re: /\bfull sentence|volsin|in your own words|in jou eie woorde\b/i, note: "some answers must be in full sentences / your own words" },
  ];
  const hits = new Set<string>();
  for (const q of questions) {
    for (const s of signals) if (s.re.test(q.memoText)) hits.add(s.note);
  }
  return [...hits];
}

const EXAM_SYSTEM = `You are a South African NSC exam-technique coach writing practical tips for Grade 12 learners about how to WRITE the exam well (not the content).

You are given, for one subject: the official SACAI paper durations with mark totals and the minutes-per-mark those imply, plus memo-derived signals about where learners commonly lose marks. Everything is REAL.

Write concise, practical technique tips. Cover a spread of:
  - "time_management" : use the real minutes-per-mark. Give a concrete number ("~1.2 min per mark; a 20-mark question deserves about 24 minutes").
  - "question_order"  : start with what scores fastest / your strongest section; do not get stuck.
  - "common_mistakes" : the memo-derived signals (units, showing working, one-word answers, distinct points, caps).
  - "paper_structure" : how the paper is laid out and how to pace across sections.

HARD RULES
1. Use the REAL numbers you are given. Never invent a duration or mark total.
2. Practical and specific to THIS subject. No generic "get enough sleep" filler.
3. BILINGUAL: natural English (tip) and natural Afrikaans (tip_af). Afrikaans may not be empty or an English copy.
4. Each tip 1–3 sentences, actionable.
5. "evidence" lists 1–2 short {paper,note} items (the timing fact or memo signal you used).

OUTPUT strict JSON: {"tips":[{"category","tip","tip_af","paper_number","evidence":[{"paper","note"}]}]}
paper_number may be null. Never wrap in markdown.`;

export async function generateExamTips(opts: GenerateTipsOptions): Promise<TipResult> {
  const model = opts.model ?? DEFAULT_MODEL;
  const count = opts.count ?? 6;

  const timings = await computePaperTimings(opts.subject);
  const mistakes = await mineCommonMistakes(opts.subject);

  const result: TipResult = { tips: [], rejected: [], rawCount: 0, basis: [] };
  if (timings.length === 0) {
    result.rejected.push({ reason: "no_timetable_entry_for_subject" });
    return result;
  }
  result.basis = timings.map(
    (t) => `P${t.paperNumber}: ${t.durationMinutes}min${t.totalMarks ? `/${t.totalMarks}m = ${t.minutesPerMark}min/mark` : ""}`,
  );

  const userPrompt = `SUBJECT: ${opts.subject}

OFFICIAL PAPER TIMINGS (SACAI 2026 durations; mark totals derived from real papers):
${timings.map((t) => `  Paper ${t.paperNumber}: ${t.durationMinutes} minutes${t.totalMarks ? `, ${t.totalMarks} marks → ${t.minutesPerMark} minutes per mark` : " (mark total unknown — do not state a per-mark number)"}`).join("\n")}

MEMO-DERIVED COMMON MARK-LOSING MISTAKES:
${mistakes.length ? mistakes.map((m) => `  - ${m}`).join("\n") : "  (none detected — cover general technique + the timing facts above)"}

Write ${count} exam-technique tips for this subject, spread across the categories.`;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EXAM_SYSTEM },
        { role: "user", content: userPrompt },
      ],
    });
    const parsed = parseJson(completion.choices[0]?.message?.content);
    const raw: any[] = Array.isArray(parsed?.tips) ? parsed.tips : [];
    result.rawCount = raw.length;
    for (const r of raw) {
      const tip = stripMarkNotation(r?.tip);
      const tipAf = stripMarkNotation(r?.tip_af);
      if (tip.length < 12 || tipAf.length < 12) {
        result.rejected.push({ reason: "tip_too_short_or_missing_af" });
        continue;
      }
      if (tip.trim().toLowerCase() === tipAf.trim().toLowerCase()) {
        result.rejected.push({ reason: "af_identical_to_en" });
        continue;
      }
      result.tips.push({
        category: typeof r?.category === "string" ? r.category : "general",
        tip,
        tipAf,
        topic: null,
        paperNumber: Number.isInteger(r?.paper_number) ? r.paper_number : null,
        evidence: Array.isArray(r?.evidence)
          ? r.evidence.slice(0, 2).map((e: any) => ({
              paper: Number.isInteger(e?.paper) ? e.paper : undefined,
              note: String(e?.note ?? "").slice(0, 200),
            }))
          : [],
        sourceQuestionIds: [],
      });
    }
  } catch (err: any) {
    result.rejected.push({ reason: `llm_error:${err?.message ?? err}` });
  }

  return result;
}

/** Replace study tips of one kind for a subject. Additive across subjects/kinds. */
export async function persistStudyTips(
  subject: string,
  kind: "examiner" | "exam",
  tips: GeneratedTip[],
  model: string,
): Promise<number> {
  if (tips.length === 0) return 0;
  await db.transaction(async (tx) => {
    await tx
      .delete(subjectStudyTips)
      .where(and(eq(subjectStudyTips.subject, subject), eq(subjectStudyTips.kind, kind)));
    await tx.insert(subjectStudyTips).values(
      tips.map((t) => ({
        subject,
        kind,
        topic: t.topic,
        paperNumber: t.paperNumber,
        category: t.category.slice(0, 48),
        tip: t.tip,
        tipAf: t.tipAf,
        evidence: t.evidence,
        sourceQuestionIds: t.sourceQuestionIds,
        model,
      })),
    );
  });
  return tips.length;
}

// ═════════════════════════════════════════════════════════════════════════════
// 4) FLASHCARD GENERATOR (orchestrates server/flashcard-generator.ts)
// ═════════════════════════════════════════════════════════════════════════════

export interface FlashcardSample {
  topic: string | null;
  difficulty: string;
  cardType: string;
  front: string;
  back: string;
  frontAf: string;
  backAf: string;
  provenance: string;
}

export interface FlashcardGenResult {
  subject: string;
  sourcesUsed: number;
  rawCount: number;
  accepted: number;
  rejected: number;
  rejectionRate: number;
  rejectionsByReason: Record<string, number>;
  samples: FlashcardSample[];
  /** EN+AF rows ready for the flashcards table (empty in preview). */
  rows: any[];
  topTopics: string[];
}

export interface GenerateFlashcardsOptions {
  subject: string;
  limit?: number;
  model?: string;
  batchSize?: number;
  cardsPerSource?: number;
  /** Skip sources already carded (resume/idempotency). */
  excludeExisting?: boolean;
}

/**
 * Generate humanised flashcards for one subject. Pure generation + validation —
 * writing is the caller's decision (persistFlashcards). Language subjects' P2
 * set-work literature is excluded (context-bound, rejects at ~70%).
 */
export async function generateFlashcardsForSubject(
  opts: GenerateFlashcardsOptions,
): Promise<FlashcardGenResult> {
  const model = opts.model ?? DEFAULT_MODEL;
  const limit = opts.limit ?? 40;
  const batchSize = opts.batchSize ?? 4;
  const cardsPerSource = opts.cardsPerSource ?? 3;

  const priorities = await loadTopicPriorities(opts.subject);
  const topTopics = priorities.slice(0, 6).map((p) => p.name);

  const excludeIds = new Set<number>();
  if (opts.excludeExisting) {
    const existing = await db
      .selectDistinct({ id: flashcardsTable.sourceQuestionId })
      .from(flashcardsTable)
      .where(and(eq(flashcardsTable.subject, opts.subject), isNotNull(flashcardsTable.sourceQuestionId)));
    for (const r of existing) if (r.id != null) excludeIds.add(r.id);
  }

  // Language subjects: P2 is set-work literature (context-bound) — skip it.
  const isLanguage = /language|taal|huistaal|home language|first additional/i.test(opts.subject);
  const sources = await loadSourceQuestions({
    subject: opts.subject,
    limit: 2500,
    minQuality: 70,
    excludeIds,
    excludePapers: isLanguage ? [2] : [],
  });

  const selected = selectSources(sources, priorities, limit);
  const allowedTopics = priorities.slice(0, 20).map((p) => p.name);

  const batches: Array<Array<{ source: SourceQuestion; topic: TopicPriority | null }>> = [];
  for (let i = 0; i < selected.length; i += batchSize) batches.push(selected.slice(i, i + batchSize));

  const result: FlashcardGenResult = {
    subject: opts.subject,
    sourcesUsed: selected.length,
    rawCount: 0,
    accepted: 0,
    rejected: 0,
    rejectionRate: 0,
    rejectionsByReason: {},
    samples: [],
    rows: [],
    topTopics,
  };

  for (const batch of batches) {
    const res = await generateCardsForBatch(batch, allowedTopics, { model, cardsPerSource });
    if (res.error) {
      result.rejectionsByReason[`llm_error`] = (result.rejectionsByReason["llm_error"] ?? 0) + 1;
      continue;
    }
    result.rawCount += res.rawCount;
    result.accepted += res.cards.length;
    result.rejected += res.rejected.length;
    for (const r of res.rejected) {
      for (const reason of r.validation.reasons.length ? r.validation.reasons : ["low_score"]) {
        result.rejectionsByReason[reason] = (result.rejectionsByReason[reason] ?? 0) + 1;
      }
    }
    for (const { card, validation, source } of res.cards) {
      result.rows.push(...toFlashcardRows(card as GeneratedCard, source, validation, model));
      if (result.samples.length < 8) {
        result.samples.push({
          topic: card.topic,
          difficulty: card.difficulty,
          cardType: card.cardType,
          front: card.front,
          back: card.back,
          frontAf: card.frontAf,
          backAf: card.backAf,
          provenance: `${source.subject} ${source.year} ${source.session} P${source.paperNumber} Q${source.questionNumber} (src #${source.id})`,
        });
      }
    }
  }

  result.rejectionRate = result.rawCount > 0 ? +((result.rejected / result.rawCount) * 100).toFixed(1) : 0;
  return result;
}

/** Insert generated flashcard rows. Additive — never deletes existing cards. */
export async function persistFlashcards(rows: any[]): Promise<number> {
  if (rows.length === 0) return 0;
  for (let i = 0; i < rows.length; i += 200) {
    await db.insert(flashcardsTable).values(rows.slice(i, i + 200));
  }
  return rows.length;
}

/** Subjects that actually have usable released bank content (for scoping UI). */
export async function subjectsWithUsableBank(minSources = 40): Promise<Array<{ subject: string; usable: number }>> {
  const rows = await db
    .select({ subject: dbeVerbatimQuestions.subject, usable: sql<number>`count(*)::int` })
    .from(dbeVerbatimQuestions)
    .where(
      and(
        isNotNull(dbeVerbatimQuestions.releasedAt),
        eq(dbeVerbatimQuestions.accuracyFlag, "clean"),
        gte(dbeVerbatimQuestions.qualityScore, 70),
        isNotNull(dbeVerbatimQuestions.memoText),
        sql`length(trim(${dbeVerbatimQuestions.memoText})) >= 20`,
        sql`length(trim(${dbeVerbatimQuestions.questionText})) BETWEEN 20 AND 600`,
      ),
    )
    .groupBy(dbeVerbatimQuestions.subject)
    .orderBy(sql`count(*) DESC`);
  return rows.filter((r) => r.usable >= minSources);
}

// ═════════════════════════════════════════════════════════════════════════════
// 5) CAPS-SYLLABUS + LITERATURE COVERAGE
//
// The bank flashcard path above (generateFlashcardsForSubject) can only cover
// topics the past papers examined, and it excludes language P2 (set-work
// literature) entirely. This path closes both gaps:
//
//   • It enumerates the OFFICIAL CAPS Grade 12 topic list per subject and
//     guarantees every topic gets cards — grounded in the bank where the bank
//     has material for that topic (source_question_id kept), generated from the
//     syllabus where it does not (source_question_id null; the column is
//     nullable).
//   • For language subjects it generates study cards ABOUT the prescribed set
//     works (themes / characters / plot / context / analysis) without ever
//     reproducing the copyrighted text.
//
// Reuses the same hygiene as the bank path: generateCardsForBatch (which already
// scrubs + validates), validateCard, stripMarkNotation, bucketQuestionToTopic.
// Writes are idempotent per (subject, source-tag) so re-runs replace, never
// accumulate; the bank-derived "ai_humanised" rows are never touched.
// ═════════════════════════════════════════════════════════════════════════════

function coerceCardTypeLocal(v: unknown): "basic" | "cloze" | "reversed" {
  return v === "cloze" ? "cloze" : v === "reversed" ? "reversed" : "basic";
}
function coerceDifficultyLocal(v: unknown): "easy" | "medium" | "hard" {
  return v === "easy" || v === "medium" || v === "hard" ? v : "medium";
}
function normFront(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9à-ɏ ]+/g, " ").replace(/\s+/g, " ").trim();
}

export interface CapsCoverageOptions {
  subject: string;
  model?: string;
  /** Target cards per CAPS topic (grounded + syllabus combined). */
  cardsPerTopic?: number;
  /** Enumerate + generate topic cards (default true). */
  includeTopics?: boolean;
  /** Generate prescribed set-work cards for language subjects (default true). */
  includeLiterature?: boolean;
  /** Ground topic cards in bank questions where available (default true). */
  includeBankGrounding?: boolean;
  /** Cap topics processed this run (cost / preview). */
  maxTopics?: number;
  /** Cap set works this run (cost / preview). */
  maxWorks?: number;
  /** Cards asked for per set work. */
  cardsPerWork?: number;
  /** CAPS topics per syllabus LLM call. */
  topicBatchSize?: number;
  /** Max bank sources loaded for grounding. */
  maxSources?: number;
  /**
   * Preview mode: stop each sub-pass after ONE OpenAI batch. Without this
   * cap, "preview" for a big bank+syllabus+literature subject can queue up
   * five sequential model calls and blow past the 100s Cloudflare origin
   * timeout — leaving the Content Studio Preview spinner hanging.
   */
  previewSingleBatch?: boolean;
}

export interface CapsCoverageResult {
  subject: string;
  capsCode: string | null;
  topicsTotal: number;
  topicsProcessed: number;
  topicsCovered: number;
  topicCoverage: Array<{ topic: string; grounded: number; syllabus: number }>;
  literatureWorksTotal: number;
  literatureWorksCovered: string[];
  groundedCards: number;
  syllabusCards: number;
  literatureCards: number;
  rawCount: number;
  accepted: number;
  rejected: number;
  rejectionRate: number;
  rejectionsByReason: Record<string, number>;
  samples: FlashcardSample[];
  /** EN+AF rows ready for the flashcards table (empty in preview). */
  rows: any[];
  /** Source tags this run wrote, for idempotent replacement. */
  sourcesWritten: CapsCardSource[];
}

const GROUND_SOURCES_PER_TOPIC = 3;

export async function generateCapsCoverageForSubject(
  opts: CapsCoverageOptions,
): Promise<CapsCoverageResult> {
  const model = opts.model ?? DEFAULT_MODEL;
  const cardsPerTopic = Math.max(1, opts.cardsPerTopic ?? 2);
  const includeTopics = opts.includeTopics !== false;
  const includeLiterature = opts.includeLiterature !== false;
  const includeBankGrounding = opts.includeBankGrounding !== false;
  const cardsPerWork = Math.max(1, opts.cardsPerWork ?? 4);
  const topicBatchSize = Math.max(1, opts.topicBatchSize ?? 6);
  const maxSources = Math.max(60, opts.maxSources ?? 700);
  const previewSingleBatch = opts.previewSingleBatch === true;

  const subject = opts.subject;
  const capsCode = subjectNameToCode(subject);
  const isLitSubj = isLiteratureSubject(subject);
  const enumerated = includeTopics ? enumerateCapsTopics(subject) : [];
  // For literature subjects, the "Literature: Novel/Drama/Poetry/Short Stories"
  // CAPS topics are covered by the set-works pass (self-contained, per named
  // work) — a card about "poetry" in the abstract is unanswerable, so those
  // topics are not carded as generic syllabus topics. Language-structure topics
  // (grammar, comprehension, writing) are still carded normally.
  const allTopics = isLitSubj ? enumerated.filter((t) => !/^literature\s*:/i.test(t.name)) : enumerated;
  const topics = typeof opts.maxTopics === "number" ? allTopics.slice(0, opts.maxTopics) : allTopics;
  const topicNames = new Set(topics.map((t) => t.name));

  const result: CapsCoverageResult = {
    subject,
    capsCode,
    topicsTotal: allTopics.length,
    topicsProcessed: topics.length,
    topicsCovered: 0,
    topicCoverage: [],
    literatureWorksTotal: 0,
    literatureWorksCovered: [],
    groundedCards: 0,
    syllabusCards: 0,
    literatureCards: 0,
    rawCount: 0,
    accepted: 0,
    rejected: 0,
    rejectionRate: 0,
    rejectionsByReason: {},
    samples: [],
    rows: [],
    sourcesWritten: [],
  };

  const openai = getOpenAI();
  const seen = new Set<string>();
  const groundedByTopic = new Map<string, number>();
  const syllabusByTopic = new Map<string, number>();
  const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
  const reject = (reason: string) => {
    result.rejected++;
    result.rejectionsByReason[reason] = (result.rejectionsByReason[reason] ?? 0) + 1;
  };
  const groundedSamples: FlashcardSample[] = [];
  const syllabusSamples: FlashcardSample[] = [];
  const litSamples: FlashcardSample[] = [];

  // Build CAPS-topic "priorities" so bank sources can be bucketed to CAPS topics
  // with the very same lexical scheme the bank pipeline uses.
  const capsPriorities: TopicPriority[] = topics.map((t, i) => ({
    topicId: null,
    name: t.name,
    nameAfrikaans: t.nameAfrikaans,
    appearancesCount: 1,
    totalYearsSampled: 0,
    avgMarksPerAppearance: 0,
    frequencyRank: i + 1,
    keywords: topicKeywords(t.name),
  }));
  const priByName = new Map(capsPriorities.map((p) => [p.name, p] as const));

  // ── Grounded pass: card the CAPS topics the bank actually examined ──────────
  if (includeTopics && includeBankGrounding && topics.length > 0) {
    const isLang = /language|taal|huistaal/i.test(subject);
    let sources: SourceQuestion[] = [];
    try {
      sources = await loadSourceQuestions({
        subject,
        limit: maxSources,
        minQuality: 70,
        excludePapers: isLang ? [2] : [],
      });
    } catch {
      /* bank may be empty locally — grounding just contributes nothing */
    }
    const perTopic = new Map<string, SourceQuestion[]>();
    for (const s of sources) {
      const t = bucketQuestionToTopic(`${s.questionText} ${s.memoText.slice(0, 300)}`, capsPriorities);
      if (!t) continue;
      const list = perTopic.get(t.name) ?? [];
      if (list.length < GROUND_SOURCES_PER_TOPIC) {
        list.push(s);
        perTopic.set(t.name, list);
      }
    }
    const selected: Array<{ source: SourceQuestion; topic: TopicPriority | null }> = [];
    for (const [name, list] of perTopic) {
      for (const s of list) selected.push({ source: s, topic: priByName.get(name) ?? null });
    }
    const allowed = [...topicNames];
    // Preview: stop after the first batch so a big subject can't queue up
    // multiple sequential OpenAI calls in this pass alone.
    const groundedLimit = previewSingleBatch ? Math.min(selected.length, 4) : selected.length;
    for (let i = 0; i < groundedLimit; i += 4) {
      const batch = selected.slice(i, i + 4);
      const t0 = Date.now();
      const res = await generateCardsForBatch(batch, allowed, { model, cardsPerSource: cardsPerTopic });
      console.log(`[caps-coverage] ${subject} grounded batch ${(i / 4) + 1}: ${res.cards.length}/${res.rawCount} in ${Date.now() - t0}ms`);
      if (res.error) {
        reject("llm_error");
        continue;
      }
      result.rawCount += res.rawCount;
      for (const r of res.rejected) {
        for (const reason of r.validation.reasons.length ? r.validation.reasons : ["low_score"]) {
          result.rejectionsByReason[reason] = (result.rejectionsByReason[reason] ?? 0) + 1;
        }
        result.rejected++;
      }
      for (const { card, validation, source } of res.cards) {
        const key = normFront(card.front);
        if (seen.has(key)) { reject("duplicate_front"); continue; }
        seen.add(key);
        const topicName = card.topic && topicNames.has(card.topic)
          ? card.topic
          : bucketQuestionToTopic(source.questionText, capsPriorities)?.name ?? card.topic ?? "General";
        result.rows.push(
          ...toCapsFlashcardRows(
            { front: card.front, back: card.back, frontAf: card.frontAf, backAf: card.backAf, cardType: card.cardType, difficulty: card.difficulty, topic: topicName },
            { subject, source: "caps_syllabus", sourceQuestionId: source.id, qualityScore: validation.score, model, capsCode, grounded: true },
          ),
        );
        result.accepted++;
        result.groundedCards++;
        bump(groundedByTopic, topicName);
        if (groundedSamples.length < 4) {
          groundedSamples.push({
            topic: topicName, difficulty: card.difficulty, cardType: card.cardType,
            front: card.front, back: card.back, frontAf: card.frontAf, backAf: card.backAf,
            provenance: `Bank-grounded · ${source.year} ${source.session} P${source.paperNumber} Q${source.questionNumber} (src #${source.id})`,
          });
        }
      }
    }
  }

  // ── Syllabus fill: guarantee every CAPS topic reaches cardsPerTopic ─────────
  if (includeTopics && topics.length > 0) {
    const need = topics.filter((t) => (groundedByTopic.get(t.name) ?? 0) < cardsPerTopic);
    // Preview: at most one syllabus batch.
    const syllabusLimit = previewSingleBatch ? Math.min(need.length, topicBatchSize) : need.length;
    for (let i = 0; i < syllabusLimit; i += topicBatchSize) {
      const batch = need.slice(i, i + topicBatchSize);
      let parsed: any;
      const t0 = Date.now();
      try {
        const completion = await openai.chat.completions.create({
          model,
          temperature: 0.4,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYLLABUS_CARD_SYSTEM },
            { role: "user", content: buildSyllabusCardsPrompt(subject, batch, cardsPerTopic) },
          ],
        });
        parsed = parseJson(completion.choices[0]?.message?.content);
        console.log(`[caps-coverage] ${subject} syllabus batch ${(i / topicBatchSize) + 1}: ${Array.isArray(parsed?.cards) ? parsed.cards.length : 0} in ${Date.now() - t0}ms`);
      } catch (err: any) {
        console.warn(`[caps-coverage] ${subject} syllabus batch failed after ${Date.now() - t0}ms: ${err?.message ?? err}`);
        reject(`llm_error`);
        continue;
      }
      const raw: any[] = Array.isArray(parsed?.cards) ? parsed.cards : [];
      result.rawCount += raw.length;
      for (const r of raw) {
        const idx = Number(r?.topic_index);
        const topic = Number.isInteger(idx) && idx >= 1 && idx <= batch.length ? batch[idx - 1] : null;
        if (!topic) { reject("untraceable_topic_index"); continue; }
        const card: GeneratedCard = {
          front: stripMarkNotation(r?.front),
          back: stripMarkNotation(r?.back),
          frontAf: stripMarkNotation(r?.front_af),
          backAf: stripMarkNotation(r?.back_af),
          cardType: coerceCardTypeLocal(r?.card_type),
          difficulty: coerceDifficultyLocal(r?.difficulty),
          topic: topic.name,
          hook: null,
        };
        const validation = validateCard(card);
        if (!validation.ok) {
          for (const reason of validation.reasons.length ? validation.reasons : ["low_score"]) reject(reason);
          continue;
        }
        const key = normFront(card.front);
        if (seen.has(key)) { reject("duplicate_front"); continue; }
        seen.add(key);
        result.rows.push(
          ...toCapsFlashcardRows(
            { front: card.front, back: card.back, frontAf: card.frontAf, backAf: card.backAf, cardType: card.cardType, difficulty: card.difficulty, topic: topic.name },
            { subject, source: "caps_syllabus", sourceQuestionId: null, qualityScore: validation.score, model, capsCode, grounded: false },
          ),
        );
        result.accepted++;
        result.syllabusCards++;
        bump(syllabusByTopic, topic.name);
        if (syllabusSamples.length < 4) {
          syllabusSamples.push({
            topic: topic.name, difficulty: card.difficulty, cardType: card.cardType,
            front: card.front, back: card.back, frontAf: card.frontAf, backAf: card.backAf,
            provenance: `CAPS syllabus · ${topic.name} (no bank source)`,
          });
        }
      }
    }
  }

  // ── Literature pass: study cards about prescribed set works ─────────────────
  if (includeLiterature && isLiteratureSubject(subject)) {
    const allWorks = getLiteratureWorks(subject);
    result.literatureWorksTotal = allWorks.length;
    const worksCap = typeof opts.maxWorks === "number" ? opts.maxWorks : allWorks.length;
    // Preview: at most one work, regardless of what the caller passed.
    const works = allWorks.slice(0, previewSingleBatch ? Math.min(1, worksCap) : worksCap);
    let workIdx = 0;
    for (const work of works) {
      workIdx++;
      let parsed: any;
      const t0 = Date.now();
      try {
        const completion = await openai.chat.completions.create({
          model,
          temperature: 0.45,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: LITERATURE_CARD_SYSTEM },
            { role: "user", content: buildLiteratureCardsPrompt(subject, work, cardsPerWork) },
          ],
        });
        parsed = parseJson(completion.choices[0]?.message?.content);
        console.log(`[caps-coverage] ${subject} literature work ${workIdx}/${works.length} (${work.title}): ${Array.isArray(parsed?.cards) ? parsed.cards.length : 0} in ${Date.now() - t0}ms`);
      } catch (err: any) {
        console.warn(`[caps-coverage] ${subject} literature work "${work.title}" failed after ${Date.now() - t0}ms: ${err?.message ?? err}`);
        reject("llm_error");
        continue;
      }
      const raw: any[] = Array.isArray(parsed?.cards) ? parsed.cards : [];
      result.rawCount += raw.length;
      const topicName = literatureTopicName(work.type);
      let acceptedForWork = 0;
      for (const r of raw) {
        const card: GeneratedCard = {
          front: stripMarkNotation(r?.front),
          back: stripMarkNotation(r?.back),
          frontAf: stripMarkNotation(r?.front_af),
          backAf: stripMarkNotation(r?.back_af),
          cardType: coerceCardTypeLocal(r?.card_type),
          difficulty: coerceDifficultyLocal(r?.difficulty),
          topic: topicName,
          hook: null,
        };
        // Copyright: never reproduce the work. Reject any side that over-quotes.
        if ([card.front, card.back, card.frontAf, card.backAf].some((t) => exceedsQuoteAllowance(t))) {
          reject("copyright_over_quote");
          continue;
        }
        // Self-contained: the card must name the work (the guard against the very
        // "which novel?" defect the bank literature path suffered from).
        const titleLc = work.title.toLowerCase();
        if (!card.front.toLowerCase().includes(titleLc) && !card.back.toLowerCase().includes(titleLc)) {
          reject("work_not_named");
          continue;
        }
        const validation = validateCard(card);
        if (!validation.ok) {
          for (const reason of validation.reasons.length ? validation.reasons : ["low_score"]) reject(reason);
          continue;
        }
        const key = normFront(card.front);
        if (seen.has(key)) { reject("duplicate_front"); continue; }
        seen.add(key);
        const aspect = typeof r?.aspect === "string" ? r.aspect : null;
        result.rows.push(
          ...toCapsFlashcardRows(
            { front: card.front, back: card.back, frontAf: card.frontAf, backAf: card.backAf, cardType: card.cardType, difficulty: card.difficulty, topic: topicName },
            { subject, source: "caps_literature", sourceQuestionId: null, qualityScore: validation.score, model, capsCode, grounded: false, work: work.title, aspect },
          ),
        );
        result.accepted++;
        result.literatureCards++;
        acceptedForWork++;
        if (litSamples.length < 4) {
          litSamples.push({
            topic: topicName, difficulty: card.difficulty, cardType: card.cardType,
            front: card.front, back: card.back, frontAf: card.frontAf, backAf: card.backAf,
            provenance: `Literature · "${work.title}"${aspect ? ` (${aspect})` : ""}`,
          });
        }
      }
      if (acceptedForWork > 0) result.literatureWorksCovered.push(work.title);
    }
  }

  // Coverage + interleaved sample mix (grounded, syllabus, literature).
  for (const t of topics) {
    const g = groundedByTopic.get(t.name) ?? 0;
    const s = syllabusByTopic.get(t.name) ?? 0;
    if (g + s > 0) result.topicsCovered++;
    result.topicCoverage.push({ topic: t.name, grounded: g, syllabus: s });
  }
  for (let i = 0; i < 4 && result.samples.length < 8; i++) {
    if (groundedSamples[i]) result.samples.push(groundedSamples[i]);
    if (syllabusSamples[i] && result.samples.length < 8) result.samples.push(syllabusSamples[i]);
    if (litSamples[i] && result.samples.length < 8) result.samples.push(litSamples[i]);
  }
  const denom = result.accepted + result.rejected;
  result.rejectionRate = denom > 0 ? +((result.rejected / denom) * 100).toFixed(1) : 0;
  const written = new Set<CapsCardSource>();
  if (result.groundedCards + result.syllabusCards > 0) written.add("caps_syllabus");
  if (result.literatureCards > 0) written.add("caps_literature");
  result.sourcesWritten = [...written];
  return result;
}

/**
 * Insert CAPS-path flashcard rows idempotently. Deletes prior rows for this
 * subject that carry the same source tags (caps_syllabus / caps_literature),
 * then inserts the fresh batch — so re-runs replace instead of accumulating, and
 * the bank-derived "ai_humanised" rows and the verbatim bank are never touched.
 */
export async function persistCapsFlashcards(
  subject: string,
  rows: any[],
  sources: CapsCardSource[],
): Promise<number> {
  if (rows.length === 0 || sources.length === 0) return 0;
  await db.transaction(async (tx) => {
    await tx
      .delete(flashcardsTable)
      .where(and(eq(flashcardsTable.subject, subject), inArray(flashcardsTable.source, sources)));
    for (let i = 0; i < rows.length; i += 200) {
      await tx.insert(flashcardsTable).values(rows.slice(i, i + 200));
    }
  });
  return rows.length;
}
