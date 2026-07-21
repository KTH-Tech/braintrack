/**
 * server/content-verifier.ts — factual-correctness verification for generated
 * learner content.
 *
 * Requirement (verbatim, from the owner):
 *   "the content must be accurate and checked"
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS FILE EXISTS — a specific, verified failure.
 *
 * Two independent generators — server/question-generator.ts and
 * server/flashcard-generator.ts — each produced Accounting content teaching
 * **LIFO** as an inventory valuation method. LIFO is prohibited under IAS 2 and
 * is not in the South African CAPS Grade 12 Accounting syllabus, which teaches
 * FIFO, weighted average and specific identification.
 *
 *   generated_questions #32 (English MCQ)  quality_score 86  → flagged `pass`, RELEASED
 *   generated_questions #28 (Afrikaans)    quality_score 87  → flagged `pass`, RELEASED
 *   flashcards          #49                                  → live in production
 *
 * Both scorers passed it because both score STRUCTURE, VOICE and COMPLETENESS.
 * `scoreGeneratedQuestion`'s "capsAlignment" check is a lexical test of whether
 * the question mentions its own topic name — question #32 is genuinely about
 * "Inventory Valuation", so it scored well. Nothing anywhere asked the only
 * question that matters: *is this true, and is it taught in South Africa?*
 *
 * Same blind spot, two independent code paths — so this is a systemic gap, and
 * the checks here are written to run over BOTH tables through one abstraction.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * TWO CHECKS.
 *
 *  1. SOLVER VERIFICATION (`solverVerify`) — independently re-answer the item
 *     WITHOUT sight of the stored memo, then adjudicate the two answers. Catches
 *     wrong memos, wrong MCQ keys, incoherent working and unanswerable items.
 *
 *  2. CAPS SYLLABUS ALIGNMENT (`capsVerify`) — is this subject matter actually
 *     in the SA CAPS Grade 12 syllabus? This is the check that catches LIFO.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GROUND TRUTH, AND WHY IT IS NOT THE `topics` TABLE.
 *
 * The obvious implementation — "reject anything whose topic is not in `topics`"
 * — is wrong, and would be actively harmful. `topics` (375 rows / 54 subjects)
 * is a VERIFIED-INCOMPLETE allowlist:
 *
 *   Physical Sciences is missing "Rate and Extent of Reaction", "Chemical
 *   Equilibrium" and "Acids and Bases" — all examined every single year.
 *   Life Sciences is missing "Population Ecology" and "Human Impact on the
 *   Environment" — CAPS Strand 3.
 *
 * Rejecting on absence from `topics` would therefore throw away correct,
 * high-yield content. So `topics` is used here as a POSITIVE signal only
 * (`topicKnown`), and can never on its own produce an off-syllabus verdict.
 *
 * `dbe_topic_frequency` is worse: 32 of its 181 rows point at a `topics` row
 * owned by a DIFFERENT subject. It is not consulted here at all.
 *
 * The strongest ground truth available is the verbatim bank itself:
 * `dbe_verbatim_questions`, ~47.5k clean rows over ten years of real NSC papers
 * and memoranda. If a concept genuinely appears in a decade of real papers for
 * a subject, it is on-syllabus. Measured against Accounting's 757 released+clean
 * rows:
 *
 *     FIFO                12 matches      ← taught, examined
 *     weighted average     7 matches      ← taught, examined
 *     LIFO / "last in"     0 matches      ← never once examined in SA
 *
 * That is the decisive signal, and it is evidence rather than opinion. It is
 * combined with an LLM syllabus judgement that is explicitly anchored to SA
 * CAPS (the LIFO error is precisely an international-accounting assumption
 * leaking into a South African syllabus), and the corpus evidence is put IN
 * FRONT of that judge so it reasons from data rather than from recall.
 *
 * A zero-match concept is suspicious, NOT proof: extraction is imperfect, memos
 * were OCR'd, and paraphrase defeats substring search. So zero matches alone
 * never rejects either — it only becomes `off_syllabus` when the LLM judge
 * independently agrees AND the subject's corpus is dense enough for absence to
 * mean something (`CORPUS_MIN_ROWS`).
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * NOTHING HERE DELETES OR UNPUBLISHES ANYTHING. Both checks are advisory: they
 * write a verdict and a reason, and a human decides. A solver disagreement in
 * particular is NOT evidence the memo is wrong — the solver can be wrong too,
 * which is why the outcome space is agree / disagree / uncertain and both of
 * the latter mean "needs human review".
 */
import OpenAI from "openai";
import { sql } from "drizzle-orm";
import { db } from "./db";

// ─────────────────────────── configuration ───────────────────────────────────

/**
 * Lazily constructed, same convention as server/question-generator.ts: the
 * OpenAI constructor throws on a missing key, and `--dry` exists precisely to
 * validate prompts and planning WITHOUT a live credential or any spend.
 */
let _openai: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (_openai) return _openai;
  const apiKey =
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_API_KEY (or OPENAI_API_KEY) is not set. " +
        "Source your key file before running the verifier.",
    );
  }
  _openai = new OpenAI({ apiKey, baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL });
  return _openai;
}

/** Reset the memoised client. Tests only. */
export function __resetOpenAI(): void { _openai = null; }

export const VERIFY_MODEL = process.env.CONTENT_VERIFY_MODEL ?? "gpt-4o";

/**
 * The model that re-answers the question. Defaults to VERIFY_MODEL but is
 * deliberately separable: the content under test was written by gpt-4o, so a
 * gpt-4o solver shares its priors and will reproduce its mistakes. Pointing
 * this at a different model materially reduces correlated blindness. See the
 * false-negative note on `solverVerify`.
 */
export const SOLVER_MODEL = process.env.CONTENT_SOLVER_MODEL ?? VERIFY_MODEL;

/**
 * Below this many released+clean verbatim rows, a concept's absence from the
 * corpus carries no information and can never contribute to `off_syllabus`.
 * Accounting has 757, Business Studies 1937, Geography 1299 — comfortably over.
 * Thin subjects degrade to `uncertain`, which is the honest outcome.
 */
export const CORPUS_MIN_ROWS = 300;

/** Corpus matches at/above this count = the concept is definitely examined in SA. */
export const CONCEPT_STRONG_HITS = 3;

// ──────────────────────────── types ──────────────────────────────────────────

export type ContentSource = "generated" | "flashcards";
export type ItemKind = "mcq" | "calculation" | "prose";

/**
 * One unit of content to verify, normalised across both tables so the checks
 * are written once. `prompt` is the learner-facing side (question text /
 * flashcard front); `memo` is the stored expected answer (memo / flashcard
 * back) and is NEVER passed to the solver.
 */
export interface VerifiableItem {
  source: ContentSource;
  id: number;
  subject: string;
  language: string;
  topic: string | null;
  paperNumber: number | null;
  marks: number | null;
  cognitiveLevel: string | null;
  prompt: string;
  memo: string;
  mcqOptions: Array<{ letter: string; text: string }> | null;
  correctOption: string | null;
  /** Context only, never a verdict input — recorded so a human can see whether
   *  the old structural scorer and this checker disagree. */
  priorQualityScore: number | null;
  released: boolean;
}

/** The solver's own answer, produced with no sight of `memo`. */
export interface SolveOutput {
  answer: string;
  finalValue: string | null;
  chosenOption: string | null;
  keyPoints: string[];
  workingSteps: string[];
  /** Self-reported 0–1. Used only to downgrade `disagree` → `uncertain`. */
  confidence: number;
  /** The item cannot be answered as written — missing data, contradictory
   *  figures, no correct option. A defect in its own right. */
  unanswerable: boolean;
  unanswerableReason: string | null;
}

export interface SolverVerdict {
  verdict: "agree" | "disagree" | "uncertain";
  /** 0–1 semantic agreement. Persisted to `solver_answer_match`. */
  matchScore: number;
  reason: string;
  /** On a non-agree outcome, which side the adjudicator thinks is at fault.
   *  Explicitly allowed to be "unclear" — forcing a call here would be a lie. */
  suspect: "memo" | "solver" | "both" | "unclear" | null;
  kind: ItemKind;
  solve: SolveOutput | null;
  ran: boolean;
  error: string | null;
}

export interface ConceptEvidence {
  concept: string;
  variants: string[];
  /** Rows in this subject's released+clean verbatim corpus matching any variant. */
  hits: number;
}

export interface CapsVerdict {
  verdict: "on_syllabus" | "off_syllabus" | "uncertain";
  confidence: number;
  reason: string;
  concepts: ConceptEvidence[];
  /** Concepts the LLM judged to be outside SA CAPS Grade 12. */
  offSyllabusConcepts: string[];
  corpusSize: number;
  corpusTrusted: boolean;
  /** Whether the item's topic exists in `topics` under this subject. Positive
   *  signal only — `topics` is a verified-incomplete allowlist. */
  topicKnown: boolean;
  llm: LlmSyllabusJudgement | null;
  ran: boolean;
  error: string | null;
}

export interface LlmSyllabusJudgement {
  verdict: "on_syllabus" | "off_syllabus" | "uncertain";
  offSyllabusConcepts: string[];
  reason: string;
  confidence: number;
}

export interface ItemVerification {
  item: VerifiableItem;
  solver: SolverVerdict | null;
  caps: CapsVerdict | null;
  /** `needs_review` = a human must look. Never an automatic deletion. */
  flag: "ok" | "needs_review";
  reasons: string[];
  verifiedAt: string;
}

// ───────────────────────── item classification ───────────────────────────────

/**
 * How the two answers must be compared. Pure and exported so the comparison
 * policy is unit-testable without a network call.
 *
 * `calculation` deliberately requires an explicit calculation verb OR a real
 * density of money/percentage figures: Accounting prose about ratios mentions
 * numbers constantly without being a calculation, and mis-classifying prose as
 * calculation makes the adjudicator demand a numeric match that does not exist.
 */
export function classifyItem(item: Pick<VerifiableItem, "prompt" | "memo" | "mcqOptions">): ItemKind {
  if (item.mcqOptions && item.mcqOptions.length > 0) return "mcq";
  const text = `${item.prompt}\n${item.memo}`;
  const calcVerb =
    /\b(calculate|bereken|compute|work out|determine the (?:value|amount|cost|total|balance)|prepare the|complete the|toon aan|bepaal die (?:waarde|bedrag|koste))\b/i
      .test(item.prompt);
  const money = (text.match(/(?:^|\s)R\s?\d|(?:\d[\d ,.]*\s?%)/g) ?? []).length;
  const digits = (text.match(/\d/g) ?? []).length;
  if (calcVerb) return "calculation";
  if (money >= 2 && digits >= 8) return "calculation";
  return "prose";
}

/** Escape ILIKE metacharacters so an extracted concept can never act as a
 *  wildcard — "100%" must not match everything. */
export function escapeLike(s: string): string {
  return s.replace(/([\\%_])/g, "\\$1");
}

// ────────────────────────────── loaders ──────────────────────────────────────

export interface LoadOptions {
  subjects?: string[];
  ids?: number[];
  limit?: number;
  /** Only rows already visible to learners. */
  onlyReleased?: boolean;
  /** Skip rows that already carry a verdict (cheap resume across runs). */
  skipVerified?: boolean;
}

function whereClauses(o: LoadOptions, released: string | null): ReturnType<typeof sql>[] {
  const w: ReturnType<typeof sql>[] = [];
  if (o.subjects?.length) w.push(sql`subject = ANY(${o.subjects}::text[])`);
  if (o.ids?.length) w.push(sql`id = ANY(${o.ids}::int[])`);
  if (o.onlyReleased && released) w.push(sql`${sql.raw(released)} IS NOT NULL`);
  if (o.skipVerified) w.push(sql`verified_at IS NULL`);
  return w;
}

const AND = (w: ReturnType<typeof sql>[]) =>
  w.length ? sql` WHERE ${sql.join(w, sql` AND `)}` : sql``;

export async function loadGeneratedItems(o: LoadOptions = {}): Promise<VerifiableItem[]> {
  const r = await db.execute<any>(sql`
    SELECT id, subject, paper_number, language, topic, marks, cognitive_level,
           question_text, answer_text, mcq_options, correct_option,
           quality_score, released_at
      FROM generated_questions
      ${AND(whereClauses(o, "released_at"))}
     ORDER BY id
     ${o.limit ? sql`LIMIT ${o.limit}` : sql``}
  `);
  return (r.rows ?? []).map((x) => ({
    source: "generated" as const,
    id: Number(x.id),
    subject: String(x.subject),
    language: String(x.language ?? "English"),
    topic: x.topic ?? null,
    paperNumber: x.paper_number ?? null,
    marks: x.marks ?? null,
    cognitiveLevel: x.cognitive_level ?? null,
    prompt: String(x.question_text ?? ""),
    memo: String(x.answer_text ?? ""),
    mcqOptions: Array.isArray(x.mcq_options) ? x.mcq_options : null,
    correctOption: x.correct_option ?? null,
    priorQualityScore: x.quality_score ?? null,
    released: x.released_at != null,
  }));
}

/**
 * NOTE: `flashcards` in production does NOT yet have the columns from
 * migrations/0029_flashcards_humanised.sql (language, card_type, quality_score,
 * source_question_id) — 0029 has never been applied. This loader therefore
 * reads only columns that exist today and defaults language to English, so the
 * verifier works against production as it actually is rather than as the
 * Drizzle schema describes it. `flashcards` has no release gate; every row is
 * live, which is why flashcard #49 is in front of learners right now.
 */
export async function loadFlashcardItems(o: LoadOptions = {}): Promise<VerifiableItem[]> {
  const r = await db.execute<any>(sql`
    SELECT id, subject, topic, front, back, difficulty, metadata
      FROM flashcards
      ${AND(whereClauses(o, null))}
     ORDER BY id
     ${o.limit ? sql`LIMIT ${o.limit}` : sql``}
  `);
  return (r.rows ?? []).map((x) => ({
    source: "flashcards" as const,
    id: Number(x.id),
    subject: String(x.subject),
    language: "English",
    topic: x.topic ?? null,
    paperNumber: null,
    marks: x.metadata?.marks ?? null,
    cognitiveLevel: null,
    prompt: String(x.front ?? ""),
    memo: String(x.back ?? ""),
    mcqOptions: null,
    correctOption: null,
    priorQualityScore: null,
    released: true,
  }));
}

export function loadItems(source: ContentSource, o: LoadOptions = {}): Promise<VerifiableItem[]> {
  return source === "generated" ? loadGeneratedItems(o) : loadFlashcardItems(o);
}

// ═════════════════════════ CHECK 1 — SOLVER ══════════════════════════════════

/**
 * The solve prompt. The memo is structurally absent — it is never interpolated
 * here, so there is no leak to guard against, only marks/level as calibration
 * for how long an answer should be.
 */
export function buildSolvePrompt(item: VerifiableItem): { system: string; user: string } {
  const isCard = item.source === "flashcards";
  const noun = isCard ? "revision flashcard prompt" : "examination question";

  const system = [
    `You are a top-performing South African NSC Grade 12 candidate sitting the ${item.subject} examination.`,
    `You answer in ${item.language}.`,
    ``,
    `You are given ONE ${noun}. Answer it from your own subject knowledge.`,
    `You have NOT been given the marking memorandum. Do not speculate about what a memo might say — produce YOUR answer and YOUR working.`,
    ``,
    `Work strictly within the South African CAPS Grade 12 curriculum and South African conventions:`,
    `IFRS/IAS as taught in CAPS, rand amounts, South African terminology, South African legislation and context.`,
    `Do not import methods from international curricula that are not taught in South Africa.`,
    ``,
    `If the ${noun} cannot be answered as written — missing data, contradictory figures, no correct option among those offered —`,
    `set "unanswerable": true and explain why. Do not invent data to make it answerable.`,
    ``,
    `Respond ONLY with JSON of this exact shape:`,
    `{`,
    `  "answer": "your full answer, as you would write it in the exam",`,
    `  "finalValue": "the single final numeric result if this is a calculation, else null",`,
    `  "chosenOption": "the option letter if this is multiple choice, else null",`,
    `  "keyPoints": ["the distinct marking points your answer makes"],`,
    `  "workingSteps": ["each calculation step, in order — empty if not a calculation"],`,
    `  "confidence": 0.0,`,
    `  "unanswerable": false,`,
    `  "unanswerableReason": null`,
    `}`,
    `"confidence" is your honest 0–1 certainty that your answer is correct.`,
  ].join("\n");

  const meta = [
    `Subject: ${item.subject}`,
    item.paperNumber != null ? `Paper: ${item.paperNumber}` : null,
    item.marks != null ? `Marks: ${item.marks}` : null,
    item.cognitiveLevel ? `Cognitive level: ${item.cognitiveLevel}` : null,
    item.topic ? `Topic: ${item.topic}` : null,
  ].filter(Boolean).join("\n");

  const options = item.mcqOptions?.length
    ? `\n\nOPTIONS:\n${item.mcqOptions.map((o) => `${o.letter}) ${o.text}`).join("\n")}`
    : "";

  const user = `${meta}\n\n${noun.toUpperCase()}:\n${item.prompt}${options}`;
  return { system, user };
}

/**
 * The adjudication prompt. This one DOES see both answers — that is its job —
 * and is told in terms that the memo is not privileged.
 */
export function buildComparePrompt(
  item: VerifiableItem, solve: SolveOutput, kind: ItemKind,
): { system: string; user: string } {
  const rule = {
    mcq: `This is MULTIPLE CHOICE. They agree ONLY if the same option letter is selected. Nothing else matters.`,
    calculation: `This is a CALCULATION. They agree if the FINAL numeric result matches — allow rounding to the nearest cent, thousands separators and currency formatting. Also state whether the stored memo's working is internally coherent (does it actually produce its own stated answer?). A memo whose steps do not produce its own final figure is a disagreement even if the final figure happens to be right.`,
    prose: `This is a PROSE / DISCUSSION answer. They agree if the KEY MARKING POINTS substantially coincide. Different wording, different ordering, or extra valid points in either answer are NOT disagreement. A different or contradictory core claim IS disagreement. A memo that asserts something factually false is disagreement even if the solver also mentioned it.`,
  }[kind];

  const system = [
    `You are a senior South African NSC marker adjudicating whether two answers to the same question agree on substance.`,
    ``,
    `You are shown the question, the STORED MEMO (the answer currently published alongside it), and an INDEPENDENT SOLVER'S ANSWER`,
    `produced by a competent candidate who was NOT shown the memo.`,
    ``,
    rule,
    ``,
    `CRITICAL: the stored memo is NOT automatically correct. A disagreement does not mean the memo is wrong — the solver can be wrong too.`,
    `Say which side you believe is at fault: "memo", "solver", "both", or "unclear". Use "unclear" freely; do not force a call you cannot justify.`,
    `If you genuinely cannot tell whether they agree, return "uncertain". "uncertain" is a correct answer, not a failure.`,
    ``,
    `Judge against the SOUTH AFRICAN CAPS Grade 12 curriculum, not an international one.`,
    ``,
    `Respond ONLY with JSON:`,
    `{ "verdict": "agree" | "disagree" | "uncertain",`,
    `  "matchScore": 0.0,`,
    `  "suspect": "memo" | "solver" | "both" | "unclear",`,
    `  "reason": "one or two sentences, concrete about what differs" }`,
    `"matchScore" is 0–1: how much of the substance coincides.`,
  ].join("\n");

  const options = item.mcqOptions?.length
    ? `\nOPTIONS:\n${item.mcqOptions.map((o) => `${o.letter}) ${o.text}`).join("\n")}`
    : "";

  const user = [
    `Subject: ${item.subject}${item.marks != null ? ` | Marks: ${item.marks}` : ""}`,
    ``,
    `QUESTION:`,
    item.prompt,
    options,
    ``,
    `STORED MEMO:`,
    item.memo,
    item.correctOption ? `(stored correct option: ${item.correctOption})` : "",
    ``,
    `INDEPENDENT SOLVER'S ANSWER:`,
    solve.answer,
    solve.chosenOption ? `(solver chose option: ${solve.chosenOption})` : "",
    solve.finalValue ? `(solver final value: ${solve.finalValue})` : "",
    solve.keyPoints.length ? `(solver key points: ${solve.keyPoints.join(" | ")})` : "",
    solve.workingSteps.length ? `(solver working: ${solve.workingSteps.join(" → ")})` : "",
  ].filter((l) => l !== "").join("\n");

  return { system, user };
}

/**
 * Post-process the adjudicator. Pure, so the escalation policy is testable.
 *
 * Two deliberate downgrades, both in the direction of "we are not sure":
 *  - A `disagree` from a solver that reported low confidence in its OWN answer
 *    is weak evidence against the memo, so it becomes `uncertain`.
 *  - An `unanswerable` item can't produce a meaningful comparison at all.
 * Neither downgrade ever turns a non-agree outcome INTO an agree — the failure
 * direction is always toward more human review, never less.
 */
export function reconcileSolver(
  judge: { verdict: SolverVerdict["verdict"]; matchScore: number; suspect: SolverVerdict["suspect"]; reason: string },
  solve: SolveOutput,
  kind: ItemKind,
  opts: { lowConfidence?: number } = {},
): SolverVerdict {
  const lowConfidence = opts.lowConfidence ?? 0.5;

  if (solve.unanswerable) {
    return {
      verdict: "uncertain", matchScore: 0, suspect: "unclear", kind, solve, ran: true, error: null,
      reason: `Solver could not answer the item as written: ${solve.unanswerableReason ?? "no reason given"}. ` +
        `This is itself a defect worth a human look.`,
    };
  }
  if (judge.verdict === "disagree" && solve.confidence < lowConfidence) {
    return {
      verdict: "uncertain", matchScore: judge.matchScore, suspect: "unclear", kind, solve, ran: true, error: null,
      reason: `Adjudicator said disagree, but the solver reported low confidence (${solve.confidence.toFixed(2)}) ` +
        `in its own answer, so this is not evidence against the memo. Original reason: ${judge.reason}`,
    };
  }
  return {
    verdict: judge.verdict,
    matchScore: judge.matchScore,
    suspect: judge.verdict === "agree" ? null : judge.suspect,
    reason: judge.reason,
    kind, solve, ran: true, error: null,
  };
}

async function jsonCall(model: string, system: string, user: string, temperature: number): Promise<any> {
  const res = await getOpenAI().chat.completions.create({
    model, temperature,
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
  });
  const raw = res.choices[0]?.message?.content ?? "{}";
  try { return JSON.parse(raw); }
  catch { throw new Error(`model returned non-JSON: ${raw.slice(0, 160)}`); }
}

/**
 * CHECK 1. Independently re-answer, then adjudicate.
 *
 * FALSE-NEGATIVE WARNING, stated in the code because it bounds what this check
 * can promise: by default the solver is the same model family that wrote the
 * content. Shared training priors mean a confidently-wrong generation can be
 * confidently re-derived, and the pair will agree. That is exactly what happens
 * with LIFO — the solver "knows" the LIFO rule and reproduces it, so this check
 * does NOT catch the LIFO items. Check 2 is what catches those, and the two are
 * deliberately independent for that reason. Set CONTENT_SOLVER_MODEL to a
 * different model to reduce (not eliminate) the correlation.
 */
export async function solverVerify(item: VerifiableItem): Promise<SolverVerdict> {
  const kind = classifyItem(item);
  try {
    const sp = buildSolvePrompt(item);
    const solveRaw = await jsonCall(SOLVER_MODEL, sp.system, sp.user, 0.2);
    const solve: SolveOutput = {
      answer: String(solveRaw.answer ?? "").trim(),
      finalValue: solveRaw.finalValue != null ? String(solveRaw.finalValue) : null,
      chosenOption: solveRaw.chosenOption != null
        ? String(solveRaw.chosenOption).trim().toUpperCase().slice(0, 1) : null,
      keyPoints: Array.isArray(solveRaw.keyPoints) ? solveRaw.keyPoints.map(String) : [],
      workingSteps: Array.isArray(solveRaw.workingSteps) ? solveRaw.workingSteps.map(String) : [],
      confidence: Number.isFinite(Number(solveRaw.confidence)) ? Number(solveRaw.confidence) : 0.5,
      unanswerable: solveRaw.unanswerable === true,
      unanswerableReason: solveRaw.unanswerableReason ? String(solveRaw.unanswerableReason) : null,
    };

    const cp = buildComparePrompt(item, solve, kind);
    const j = await jsonCall(VERIFY_MODEL, cp.system, cp.user, 0);
    const verdict = ["agree", "disagree", "uncertain"].includes(j.verdict) ? j.verdict : "uncertain";
    const suspect = ["memo", "solver", "both", "unclear"].includes(j.suspect) ? j.suspect : "unclear";
    const matchScore = Math.max(0, Math.min(1, Number(j.matchScore) || 0));

    return reconcileSolver(
      { verdict, matchScore, suspect, reason: String(j.reason ?? "").trim() }, solve, kind,
    );
  } catch (err: any) {
    return {
      verdict: "uncertain", matchScore: 0, suspect: null, reason: `Solver check failed to run: ${err.message}`,
      kind, solve: null, ran: false, error: err.message,
    };
  }
}

// ═══════════════════════ CHECK 2 — CAPS ALIGNMENT ════════════════════════════

export function buildConceptPrompt(item: VerifiableItem): { system: string; user: string } {
  const system = [
    `You extract the subject-matter concepts that a South African NSC Grade 12 ${item.subject} item actually TEACHES or TESTS.`,
    ``,
    `Return 1–6 concepts. For each, give:`,
    `  "concept"  — the canonical ENGLISH term as it would be named in a real South African NSC ${item.subject} paper.`,
    `  "variants" — up to 4 alternative search strings that would find this concept in the raw text of real exam papers`,
    `               and memoranda: abbreviations, the expanded form, the Afrikaans term, common spelling variants.`,
    ``,
    `Rules:`,
    `  - Domain terms ONLY. Never return exam-process words ("calculate", "explain", "table", "discuss", "marks").`,
    `  - Each variant must be at least 3 characters and specific enough that a substring search for it would not match`,
    `    unrelated text. Prefer "weighted average" over "average".`,
    `  - Name the METHOD or PRINCIPLE being taught, not the scenario dressing. If an item teaches a named valuation`,
    `    method, the method name is the concept.`,
    ``,
    `Respond ONLY with JSON: { "concepts": [ { "concept": "...", "variants": ["...", "..."] } ] }`,
  ].join("\n");

  const user = [
    `Subject: ${item.subject}${item.topic ? ` | Stated topic: ${item.topic}` : ""} | Language: ${item.language}`,
    ``,
    `PROMPT SIDE:`, item.prompt,
    item.mcqOptions?.length ? `\nOPTIONS:\n${item.mcqOptions.map((o) => `${o.letter}) ${o.text}`).join("\n")}` : "",
    ``,
    `ANSWER SIDE:`, item.memo,
  ].filter((l) => l !== "").join("\n");

  return { system, user };
}

/**
 * The syllabus judge. Corpus evidence goes IN so it reasons from a decade of
 * real papers rather than from recall, and the LIFO case is named explicitly —
 * it is the canonical example of the failure mode (an international-accounting
 * assumption leaking into a South African syllabus) and stating it calibrates
 * the judge on exactly the axis that matters.
 */
export function buildSyllabusPrompt(
  item: VerifiableItem, evidence: ConceptEvidence[], corpusSize: number, corpusTrusted: boolean,
): { system: string; user: string } {
  const system = [
    `You are a South African CAPS curriculum specialist for Grade 12 NSC ${item.subject}.`,
    ``,
    `Decide whether the subject matter of the item below is part of the SOUTH AFRICAN CAPS Grade 12 syllabus for ${item.subject}.`,
    ``,
    `CRITICAL: judge against the SOUTH AFRICAN CAPS curriculum — NOT a United States, United Kingdom, IB or other`,
    `international curriculum. Content that is standard elsewhere but is not taught, or is not permitted, in South Africa`,
    `MUST be flagged as off-syllabus.`,
    ``,
    `The exact failure you are guarding against, as a worked example:`,
    `  LIFO (last-in-first-out) inventory valuation is routinely taught in United States accounting courses.`,
    `  It is PROHIBITED under IAS 2 and is NOT in the CAPS Grade 12 Accounting syllabus, which teaches FIFO,`,
    `  weighted average and specific identification. An item presenting LIFO as a valid South African method is`,
    `  off-syllabus AND factually misleading to a South African learner, no matter how well written it is.`,
    ``,
    `Also flag content that is on-syllabus in name but factually wrong, or that belongs to a different subject`,
    `or a different grade.`,
    ``,
    `HOW TO WEIGH THE CORPUS EVIDENCE below: it is an independent substring search over ${corpusSize} released, clean`,
    `questions and memoranda from ten years of real NSC ${item.subject} papers.`,
    `  - Many matches = the concept is definitely examined in South Africa. This OVERRIDES your own doubt.`,
    `  - Zero matches = suspicious, but NOT proof of absence. Extraction is imperfect, memoranda were OCR'd, and`,
    `    paraphrase defeats substring search. Treat zero as evidence to weigh, never as a verdict on its own.`,
    corpusTrusted
      ? `  - This subject's corpus is dense enough (${corpusSize} rows) for absence to be meaningful.`
      : `  - WARNING: this subject's corpus is THIN (${corpusSize} rows). Absence means almost nothing here. Prefer "uncertain".`,
    ``,
    `Return "uncertain" whenever the signals genuinely conflict or you cannot tell. "uncertain" is a correct answer.`,
    ``,
    `Respond ONLY with JSON:`,
    `{ "verdict": "on_syllabus" | "off_syllabus" | "uncertain",`,
    `  "offSyllabusConcepts": ["only concepts you judge outside SA CAPS Grade 12"],`,
    `  "reason": "one or two sentences naming the specific concept and why",`,
    `  "confidence": 0.0 }`,
  ].join("\n");

  const evidenceBlock = evidence.length
    ? evidence.map((e) =>
        `  "${e.concept}" — ${e.hits} match${e.hits === 1 ? "" : "es"} ` +
        `(searched: ${e.variants.map((v) => `"${v}"`).join(", ")})`).join("\n")
    : "  (no concepts were extracted)";

  const user = [
    `Subject: ${item.subject}${item.topic ? ` | Stated topic: ${item.topic}` : ""} | Language: ${item.language}`,
    ``,
    `PROMPT SIDE:`, item.prompt,
    item.mcqOptions?.length ? `\nOPTIONS:\n${item.mcqOptions.map((o) => `${o.letter}) ${o.text}`).join("\n")}` : "",
    ``,
    `ANSWER SIDE:`, item.memo,
    ``,
    `CORPUS EVIDENCE — occurrences in ten years of real NSC ${item.subject} papers and memoranda:`,
    evidenceBlock,
  ].filter((l) => l !== "").join("\n");

  return { system, user };
}

/**
 * Count, in one query, how many released+clean verbatim rows for this subject
 * mention each concept (any variant). This is the ground-truth half of check 2.
 *
 * Language is deliberately NOT filtered: method names like "LIFO" and "FIFO"
 * are identical across the English and Afrikaans papers, and an Afrikaans item
 * should be corroborated by the English corpus too. Filtering by language would
 * halve the evidence for no gain.
 */
export async function corroborateConcepts(
  subject: string, concepts: Array<{ concept: string; variants: string[] }>,
): Promise<{ evidence: ConceptEvidence[]; corpusSize: number }> {
  const cleaned = concepts.map((c) => {
    const variants = [c.concept, ...(c.variants ?? [])]
      .map((v) => String(v ?? "").trim())
      .filter((v) => v.length >= 3)
      .filter((v, i, a) => a.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i)
      .slice(0, 6);
    return { concept: c.concept, variants };
  }).filter((c) => c.variants.length > 0);

  if (!cleaned.length) {
    const r0 = await db.execute<any>(sql`
      SELECT count(*)::int AS corpus_size FROM dbe_verbatim_questions
       WHERE subject = ${subject} AND released_at IS NOT NULL AND accuracy_flag = 'clean'`);
    return { evidence: [], corpusSize: Number(r0.rows?.[0]?.corpus_size ?? 0) };
  }

  const cols = cleaned.map((c, i) => {
    const likes = c.variants.map((v) => {
      const pat = `%${escapeLike(v)}%`;
      return sql`(question_text ILIKE ${pat} OR memo_text ILIKE ${pat})`;
    });
    return sql`count(*) FILTER (WHERE ${sql.join(likes, sql` OR `)})::int AS ${sql.raw(`c${i}`)}`;
  });

  const r = await db.execute<any>(sql`
    SELECT count(*)::int AS corpus_size, ${sql.join(cols, sql`, `)}
      FROM dbe_verbatim_questions
     WHERE subject = ${subject} AND released_at IS NOT NULL AND accuracy_flag = 'clean'
  `);
  const row = r.rows?.[0] ?? {};
  return {
    corpusSize: Number(row.corpus_size ?? 0),
    evidence: cleaned.map((c, i) => ({
      concept: c.concept, variants: c.variants, hits: Number(row[`c${i}`] ?? 0),
    })),
  };
}

/** Is the item's stated topic a known topic OF THIS SUBJECT? Positive signal
 *  only — `topics` is verifiably incomplete, so a miss proves nothing. The join
 *  through `subjects` is what stops the 32 cross-wired `dbe_topic_frequency`
 *  rows from making another subject's topic look valid here. */
export async function topicIsKnown(subject: string, topic: string | null): Promise<boolean> {
  if (!topic) return false;
  const r = await db.execute<any>(sql`
    SELECT 1 FROM topics t JOIN subjects s ON s.id = t.subject_id
     WHERE lower(btrim(s.name)) = lower(btrim(${subject}))
       AND lower(btrim(t.name)) = lower(btrim(${topic}))
     LIMIT 1`);
  return (r.rows ?? []).length > 0;
}

/**
 * Combine corpus evidence with the LLM judgement into a final CAPS verdict.
 * Pure and exported — this is the decision table, and it is the part most worth
 * arguing about, so it is testable without a network call.
 *
 * The asymmetry is intentional. `off_syllabus` requires BOTH an independent LLM
 * judgement AND corpus silence AND a corpus dense enough for silence to mean
 * something. Everything else that is not a clean pass degrades to `uncertain`,
 * because the cost of a false `off_syllabus` (a human deletes correct,
 * high-yield content — exactly what would happen to Chemical Equilibrium if we
 * trusted `topics`) is higher than the cost of an extra review.
 */
export function decideCapsVerdict(args: {
  llm: LlmSyllabusJudgement;
  evidence: ConceptEvidence[];
  corpusSize: number;
  topicKnown: boolean;
}): Pick<CapsVerdict, "verdict" | "confidence" | "reason" | "offSyllabusConcepts" | "corpusTrusted"> {
  const { llm, evidence, corpusSize, topicKnown } = args;
  const corpusTrusted = corpusSize >= CORPUS_MIN_ROWS;
  const flagged = llm.offSyllabusConcepts ?? [];
  const byName = (n: string) => evidence.find((e) => e.concept.toLowerCase() === n.toLowerCase());

  const flaggedEvidence = flagged.map((n) => ({ name: n, hits: byName(n)?.hits ?? 0 }));
  const flaggedAllSilent = flaggedEvidence.length > 0 && flaggedEvidence.every((f) => f.hits === 0);
  const flaggedCorroborated = flaggedEvidence.filter((f) => f.hits >= CONCEPT_STRONG_HITS);
  const anyStrong = evidence.some((e) => e.hits >= CONCEPT_STRONG_HITS);
  const allSilent = evidence.length > 0 && evidence.every((e) => e.hits === 0);
  const ev = (list: Array<{ name: string; hits: number }>) =>
    list.map((f) => `"${f.name}"=${f.hits}`).join(", ");

  if (llm.verdict === "off_syllabus") {
    // The corpus contradicts the judge: the concept it flagged demonstrably IS
    // examined in real SA papers. Evidence beats opinion — but the conflict is
    // itself worth a human look, so this is `uncertain`, not `on_syllabus`.
    if (flaggedCorroborated.length) {
      return {
        verdict: "uncertain", corpusTrusted, confidence: 0.4, offSyllabusConcepts: flagged,
        reason: `CONFLICT: syllabus judge flagged ${ev(flaggedCorroborated)} as off-syllabus, but ` +
          `${flaggedCorroborated.length === 1 ? "it appears" : "they appear"} in real NSC papers for this subject ` +
          `(corpus ${corpusSize} rows). Corpus evidence contradicts the judge — human call. Judge said: ${llm.reason}`,
      };
    }
    if (!corpusTrusted) {
      return {
        verdict: "uncertain", corpusTrusted, confidence: 0.35, offSyllabusConcepts: flagged,
        reason: `Syllabus judge flagged ${flagged.map((f) => `"${f}"`).join(", ") || "this item"} as off-syllabus, but ` +
          `this subject's verbatim corpus is too thin (${corpusSize} < ${CORPUS_MIN_ROWS} rows) to corroborate. ` +
          `Unconfirmed. Judge said: ${llm.reason}`,
      };
    }
    if (flaggedAllSilent || allSilent) {
      return {
        verdict: "off_syllabus", corpusTrusted, confidence: Math.max(0.75, Math.min(0.98, llm.confidence || 0.8)),
        offSyllabusConcepts: flagged,
        reason: `OFF-SYLLABUS: ${llm.reason} Corroborated independently — ${ev(flaggedEvidence) || "the extracted concepts"} ` +
          `appear ZERO times in ${corpusSize} released, clean NSC ${"questions and memoranda"} for this subject.` +
          (topicKnown ? "" : ` (Stated topic is also not in the topics taxonomy, though that alone proves nothing.)`),
      };
    }
    return {
      verdict: "uncertain", corpusTrusted, confidence: 0.45, offSyllabusConcepts: flagged,
      reason: `Syllabus judge flagged ${flagged.map((f) => `"${f}"`).join(", ") || "this item"}, but corpus evidence is ` +
        `mixed (${ev(flaggedEvidence)}). Not decisive either way. Judge said: ${llm.reason}`,
    };
  }

  if (llm.verdict === "on_syllabus") {
    if (anyStrong) {
      return {
        verdict: "on_syllabus", corpusTrusted, confidence: Math.max(0.7, Math.min(0.98, llm.confidence || 0.8)),
        offSyllabusConcepts: [],
        reason: `On CAPS Grade 12 syllabus. Corroborated by the verbatim corpus: ` +
          `${ev(evidence.filter((e) => e.hits >= CONCEPT_STRONG_HITS).map((e) => ({ name: e.concept, hits: e.hits })))}.`,
      };
    }
    if (allSilent && corpusTrusted) {
      // Not a reject. This is the shape of a real taxonomy/extraction gap — and
      // paraphrase alone puts correct content here.
      return {
        verdict: "uncertain", corpusTrusted, confidence: 0.5, offSyllabusConcepts: [],
        reason: `Syllabus judge says on-syllabus, but none of the extracted concepts ` +
          `(${evidence.map((e) => `"${e.concept}"`).join(", ")}) appear anywhere in ${corpusSize} real NSC rows for ` +
          `this subject. Probably paraphrase or an extraction gap rather than an error, but unconfirmed — worth an eye.`,
      };
    }
    return {
      verdict: "on_syllabus", corpusTrusted, confidence: 0.6, offSyllabusConcepts: [],
      reason: `On CAPS Grade 12 syllabus per the syllabus judge; corpus support is weak but present ` +
        `(${ev(evidence.map((e) => ({ name: e.concept, hits: e.hits })))}).`,
    };
  }

  return {
    verdict: "uncertain", corpusTrusted, confidence: llm.confidence || 0.4, offSyllabusConcepts: flagged,
    reason: `Syllabus judge could not decide: ${llm.reason} Corpus: ${ev(evidence.map((e) => ({ name: e.concept, hits: e.hits }))) || "no concepts extracted"}.`,
  };
}

/** CHECK 2. Concept extraction → corpus corroboration → SA-CAPS-anchored judgement. */
export async function capsVerify(item: VerifiableItem): Promise<CapsVerdict> {
  try {
    const cp = buildConceptPrompt(item);
    const conceptsRaw = await jsonCall(VERIFY_MODEL, cp.system, cp.user, 0);
    const concepts: Array<{ concept: string; variants: string[] }> =
      (Array.isArray(conceptsRaw.concepts) ? conceptsRaw.concepts : [])
        .map((c: any) => ({
          concept: String(c?.concept ?? "").trim(),
          variants: Array.isArray(c?.variants) ? c.variants.map((v: any) => String(v ?? "").trim()) : [],
        }))
        .filter((c: any) => c.concept.length >= 3)
        .slice(0, 6);

    const [{ evidence, corpusSize }, topicKnown] = await Promise.all([
      corroborateConcepts(item.subject, concepts),
      topicIsKnown(item.subject, item.topic),
    ]);

    const corpusTrusted = corpusSize >= CORPUS_MIN_ROWS;
    const sp = buildSyllabusPrompt(item, evidence, corpusSize, corpusTrusted);
    const j = await jsonCall(VERIFY_MODEL, sp.system, sp.user, 0);
    const llm: LlmSyllabusJudgement = {
      verdict: ["on_syllabus", "off_syllabus", "uncertain"].includes(j.verdict) ? j.verdict : "uncertain",
      offSyllabusConcepts: Array.isArray(j.offSyllabusConcepts) ? j.offSyllabusConcepts.map(String) : [],
      reason: String(j.reason ?? "").trim(),
      confidence: Math.max(0, Math.min(1, Number(j.confidence) || 0)),
    };

    const decided = decideCapsVerdict({ llm, evidence, corpusSize, topicKnown });
    return { ...decided, concepts: evidence, corpusSize, topicKnown, llm, ran: true, error: null };
  } catch (err: any) {
    return {
      verdict: "uncertain", confidence: 0, reason: `CAPS check failed to run: ${err.message}`,
      concepts: [], offSyllabusConcepts: [], corpusSize: 0, corpusTrusted: false,
      topicKnown: false, llm: null, ran: false, error: err.message,
    };
  }
}

// ═══════════════════════════ orchestration ═══════════════════════════════════

export interface VerifyOptions { solver?: boolean; caps?: boolean; }

/** Run both checks and fold them into one advisory flag. Never deletes,
 *  never unpublishes — `needs_review` is the strongest thing it can say. */
export async function verifyItem(item: VerifiableItem, o: VerifyOptions = {}): Promise<ItemVerification> {
  const doSolver = o.solver !== false;
  const doCaps = o.caps !== false;

  const [solver, caps] = await Promise.all([
    doSolver ? solverVerify(item) : Promise.resolve(null),
    doCaps ? capsVerify(item) : Promise.resolve(null),
  ]);

  const reasons: string[] = [];
  if (caps && caps.verdict === "off_syllabus") reasons.push(`CAPS off-syllabus: ${caps.reason}`);
  else if (caps && caps.verdict === "uncertain") reasons.push(`CAPS uncertain: ${caps.reason}`);
  if (solver && solver.verdict === "disagree") {
    reasons.push(`Solver disagrees with the memo (suspect: ${solver.suspect}): ${solver.reason}`);
  } else if (solver && solver.verdict === "uncertain") {
    reasons.push(`Solver uncertain: ${solver.reason}`);
  }

  const flag: ItemVerification["flag"] =
    (caps && caps.verdict !== "on_syllabus") || (solver && solver.verdict !== "agree")
      ? "needs_review" : "ok";

  return { item, solver, caps, flag, reasons, verifiedAt: new Date().toISOString() };
}

// ═══════════════════════════ persistence ═════════════════════════════════════

/**
 * Additive only, `IF NOT EXISTS` throughout — safe to run against production
 * while anything else is working. Deliberately NOT left to `drizzle-kit push`:
 * push drops what it does not know about, which is how an earlier version of
 * the simulated tables was lost (see shared/models/simulated.ts).
 *
 * `generated_questions.solver_verified` and `solver_answer_match` already exist
 * — they were designed for exactly this check and were never implemented. They
 * are reused rather than duplicated.
 */
export const VERIFICATION_DDL: string[] = [
  // generated_questions — solver_verified / solver_answer_match already exist.
  `ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS solver_verdict text`,
  `ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS solver_reason text`,
  `ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS caps_verdict text`,
  `ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS caps_confidence numeric`,
  `ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS caps_reason text`,
  `ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS verification_flag text`,
  `ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS verification_detail jsonb`,
  `ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS verification_model text`,
  `ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS verified_at timestamptz`,
  `CREATE INDEX IF NOT EXISTS generated_questions_verification_idx
     ON generated_questions (verification_flag, caps_verdict)`,
  // flashcards — no solver columns here yet, so both are added.
  `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS solver_verified boolean`,
  `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS solver_answer_match numeric`,
  `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS solver_verdict text`,
  `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS solver_reason text`,
  `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS caps_verdict text`,
  `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS caps_confidence numeric`,
  `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS caps_reason text`,
  `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS verification_flag text`,
  `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS verification_detail jsonb`,
  `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS verification_model text`,
  `ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS verified_at timestamptz`,
  `CREATE INDEX IF NOT EXISTS flashcards_verification_idx
     ON flashcards (verification_flag, caps_verdict)`,
];

export async function ensureVerificationSchema(): Promise<void> {
  for (const stmt of VERIFICATION_DDL) await db.execute(sql.raw(stmt));
}

/**
 * Write the verdict back. Updates ONLY verification columns — never
 * `released_at`, never a delete. Making content invisible is the owner's call,
 * and this function is deliberately incapable of it.
 *
 * `solver_verified` means "independently re-answered AND the two answers
 * agreed". A false therefore means *either* disagreed *or* uncertain *or* the
 * check errored — read `solver_verdict` for which.
 */
export async function persistVerification(v: ItemVerification): Promise<void> {
  const table = v.item.source === "generated" ? sql.raw("generated_questions") : sql.raw("flashcards");
  const detail = {
    solver: v.solver
      ? {
          verdict: v.solver.verdict, matchScore: v.solver.matchScore, suspect: v.solver.suspect,
          kind: v.solver.kind, reason: v.solver.reason, ran: v.solver.ran, error: v.solver.error,
          solverAnswer: v.solver.solve?.answer?.slice(0, 2000) ?? null,
          solverFinalValue: v.solver.solve?.finalValue ?? null,
          solverChosenOption: v.solver.solve?.chosenOption ?? null,
          solverConfidence: v.solver.solve?.confidence ?? null,
          unanswerable: v.solver.solve?.unanswerable ?? null,
          solverModel: SOLVER_MODEL,
        }
      : null,
    caps: v.caps
      ? {
          verdict: v.caps.verdict, confidence: v.caps.confidence, reason: v.caps.reason,
          concepts: v.caps.concepts, offSyllabusConcepts: v.caps.offSyllabusConcepts,
          corpusSize: v.caps.corpusSize, corpusTrusted: v.caps.corpusTrusted,
          topicKnown: v.caps.topicKnown, llm: v.caps.llm, ran: v.caps.ran, error: v.caps.error,
        }
      : null,
    flag: v.flag, reasons: v.reasons, priorQualityScore: v.item.priorQualityScore,
  };

  await db.execute(sql`
    UPDATE ${table} SET
      solver_verified     = ${v.solver ? v.solver.verdict === "agree" : null},
      solver_answer_match = ${v.solver ? v.solver.matchScore : null},
      solver_verdict      = ${v.solver?.verdict ?? null},
      solver_reason       = ${v.solver?.reason ?? null},
      caps_verdict        = ${v.caps?.verdict ?? null},
      caps_confidence     = ${v.caps?.confidence ?? null},
      caps_reason         = ${v.caps?.reason ?? null},
      verification_flag   = ${v.flag},
      verification_detail = ${JSON.stringify(detail)}::jsonb,
      verification_model  = ${VERIFY_MODEL},
      verified_at         = now()
    WHERE id = ${v.item.id}
  `);
}
