/**
 * server/question-generator.ts — simulated question generation engine.
 *
 * Requirement (verbatim, from the owner):
 *   "the simulated questions and answers must mimic the verbatim ones —
 *    examiner logic and tips"
 *
 * So this engine is grounded twice over:
 *   1. STATISTICALLY, from `examiner_profiles` — how many marks a question
 *      carries, how deep the numbering goes, how long a memo runs, which
 *      cognitive levels the paper actually samples.
 *   2. BY EXAMPLE, from `dbe_verbatim_questions` — 3-5 real questions with
 *      their real memos go into the prompt verbatim. Statistics alone produce
 *      questions that are structurally right and stylistically wrong; the
 *      exemplars are what carry the examiner's voice.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THREE FACTS ABOUT THE DATA that shape this file. All verified by direct query
 * against production; none of them are what you would assume from the schema.
 *
 *  (a) `examiner_profiles` is THIN, not rich. Of 118 rows: 92 carry a mark
 *      histogram, 80 an `avgMemoLength`, only 31 any marking convention, and
 *      ZERO a non-zero `mcqShare`. `topicRotation` is empty everywhere.
 *      → We therefore REPAIR each profile from live aggregates over the
 *        verbatim bank (`deriveLiveStats`) and treat the stored profile as a
 *        prior, not as gospel. A missing `modalMarks` must not silently become
 *        "generate whatever length you like".
 *
 *  (b) `dbe_verbatim_questions.topic` is NULL on ALL ~54k rows. You cannot
 *      join exemplars to a topic. → Exemplar retrieval is keyword-relevance
 *      scored against the topic NAME (from `topics` via `dbe_topic_frequency`),
 *      with a top-quality fallback so a topic with no lexical hits still gets
 *      real exemplars rather than none.
 *
 *  (c) `dbe_verbatim_questions.mcq_options` is NULL on ALL rows. There is no
 *      MCQ exemplar material anywhere in the corpus, which is why every
 *      profile reports mcqShare = 0. → MCQs cannot be "mimicked" from source.
 *      We generate them as a DERIVED artefact (see `MCQ_POLICY` below) purely
 *      so the daily-challenge / quiz surface has something to render, and we
 *      never claim they reflect observed DBE MCQ structure.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * MEMO VOICE — the single most important quality rule in this file.
 * The previous attempt (`dbe_simulated_questions`, 222 rows, all scores zero)
 * stored marking-rubric prose written in the third person ABOUT the candidate,
 * for a marker:
 *     "SPELETJIE FOKUS  Die kandidaat ontwerp 'n speletjie vir kinders …"
 * That is useless to a learner. Real DBE memos are the opposite — they state
 * the ANSWER, tick it per mark, then add marker notes:
 *     "(a) Micro√ Full control√√  (b) Market√ Little control…√√
 *      NOTE: 1. The answer does not have to be in tabular format …"
 * We mimic THAT. `RUBRIC_VOICE` below detects the failure mode lexically and
 * `scoreGeneratedQuestion` penalises it hard enough to force a reject.
 */
import OpenAI from "openai";
import { sql } from "drizzle-orm";
import { db } from "./db";

// ─────────────────────────── configuration ───────────────────────────────────

/**
 * Same config convention as server/routes.ts, but constructed lazily.
 *
 * The OpenAI constructor throws on a missing key at construction time, so
 * building it at module scope would make `--dry` (which exists precisely to
 * validate prompts and planning WITHOUT spending anything) require a live
 * credential. Deferring construction to first real use keeps dry runs, unit
 * tests and prompt inspection credential-free.
 */
let _openai: OpenAI | null = null;
function client(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return _openai;
}

export const GENERATION_MODEL = process.env.QUESTION_GEN_MODEL ?? "gpt-4o";

/**
 * Fraction of generated questions that also get an MCQ form. Deliberately a
 * constant and NOT `profile.structure.mcqShare`: every profile reports 0
 * because the corpus has no extracted MCQs (fact (c) above), so honouring the
 * profile would mean never producing the one shape the daily-challenge screen
 * can actually render. See the daily-challenge mapping note in
 * `scripts/generate-questions.ts`.
 */
const MCQ_POLICY = { share: 0.4, minMarks: 1, maxMarks: 4 } as const;

/** Quality gate. Below REJECT the row is still stored (for audit) but flagged
 *  `reject` and can never be released. */
export const QUALITY_GATE = { pass: 70, review: 55 } as const;

// ──────────────────────────── types ──────────────────────────────────────────

export interface ExaminerProfile {
  subject?: string;
  paperNumber?: number;
  structure?: {
    mcqShare?: number;
    maxNumberingDepth?: number;
    topLevelQuestions?: number;
    avgSubQuestionsPerTopLevel?: number;
  };
  markAllocation?: { histogram?: Record<string, number>; modalMarks?: string | number | null };
  cognitiveSpread?: Record<string, number>;
  markingConventions?: Record<string, number>;
  avgQuestionLength?: number | null;
  avgMemoLength?: number | null;
  topicRotation?: unknown[];
  yearsCovered?: number[];
  languages?: Record<string, number>;
  sessions?: string[];
}

export interface ProfileRow {
  id: number;
  subject: string;
  paperNumber: number;
  profile: ExaminerProfile;
  questionSampleSize: number;
}

/** Profile fields after repair from live data. These are what the prompt and
 *  the scorer actually use — never the raw profile. */
export interface LiveStats {
  markHistogram: Record<number, number>;
  modalMarks: number;
  markMin: number;
  markMax: number;
  avgQuestionLength: number;
  avgMemoLength: number;
  memoLengthP10: number;
  memoLengthP90: number;
  maxNumberingDepth: number;
  cognitiveSpread: Record<string, number>;
  commandVerbs: Array<{ verb: string; count: number }>;
  usesTickMarks: boolean;
  exemplarCount: number;
  /** Which fields came from the stored profile vs. were repaired from live data. */
  repaired: string[];
}

export interface Exemplar {
  id: number;
  questionNumber: string;
  questionText: string;
  memoText: string;
  marks: number | null;
  cognitiveLevel: string | null;
  qualityScore: number | null;
  year: number;
  relevance: number;
}

export interface TopicTarget {
  topicId: number;
  topic: string;
  appearancesCount: number;
  totalYearsSampled: number;
  avgMarksPerAppearance: number;
  frequencyRank: number;
  weight: number;
}

export interface GeneratedQuestion {
  questionNumber: string;
  questionText: string;
  answerText: string;
  markingRubric: { steps: Array<{ step: string; marks: number }>; notes: string[] };
  marks: number;
  topic: string;
  cognitiveLevel: string;
  examinerTip: string;
  mcqOptions: Array<{ letter: string; text: string }> | null;
  correctOption: string | null;
}

export interface ScoreResult {
  capsAlignment: number;
  structureScore: number;
  answerCompleteness: number;
  qualityScore: number;
  qualityFlag: "pass" | "review" | "reject";
  detail: {
    checks: Array<{ name: string; score: number; weight: number; reason: string }>;
    reasons: string[];
    hardFail: string | null;
  };
}

// ───────────────────────── profile + live stats ──────────────────────────────

export async function loadExaminerProfiles(subject?: string): Promise<ProfileRow[]> {
  const rows = await db.execute<{
    id: number; subject: string; paper_number: number;
    profile: ExaminerProfile; question_sample_size: number;
  }>(sql`
    SELECT id, subject, paper_number, profile, question_sample_size
      FROM examiner_profiles
     ${subject ? sql`WHERE subject = ${subject}` : sql``}
     ORDER BY subject, paper_number
  `);
  return (rows.rows ?? []).map((r) => ({
    id: r.id,
    subject: r.subject,
    paperNumber: r.paper_number,
    profile: r.profile ?? {},
    questionSampleSize: r.question_sample_size,
  }));
}

/** Which languages this (subject, paper) is actually examined in. Driven by
 *  what exists in the corpus, not by the profile's `languages` histogram —
 *  a profile can list Afrikaans for a paper whose Afrikaans rows never passed
 *  the release gate, and generating into a language we have no exemplars for
 *  is exactly how you get unidiomatic output. */
export async function languagesFor(subject: string, paperNumber: number): Promise<string[]> {
  const r = await db.execute<{ language: string; n: number }>(sql`
    SELECT language, COUNT(*)::int AS n
      FROM dbe_verbatim_questions
     WHERE subject = ${subject} AND paper_number = ${paperNumber}
       AND released_at IS NOT NULL AND accuracy_flag = 'clean'
       AND memo_text IS NOT NULL AND length(memo_text) > 40
     GROUP BY language HAVING COUNT(*) >= 5
     ORDER BY n DESC
  `);
  return (r.rows ?? []).map((x) => x.language);
}

const COMMAND_VERBS = [
  "name", "state", "list", "identify", "define", "describe", "explain",
  "discuss", "evaluate", "analyse", "compare", "calculate", "determine",
  "motivate", "justify", "recommend", "suggest", "outline", "distinguish",
  "classify", "illustrate", "draw", "label", "tabulate", "quote", "give",
  // Afrikaans
  "noem", "gee", "lys", "identifiseer", "definieer", "beskryf", "verduidelik",
  "bespreek", "evalueer", "ontleed", "vergelyk", "bereken", "bepaal",
  "motiveer", "regverdig", "beveel", "stel", "skets", "onderskei",
];

/**
 * Repair a thin stored profile using live aggregates over the verbatim bank.
 *
 * Everything here is computed from the SAME slice the exemplars come from
 * (subject + paper + language + released + clean), so the numbers the prompt
 * quotes and the numbers the scorer enforces describe one consistent corpus.
 */
export async function deriveLiveStats(
  subject: string, paperNumber: number, language: string, profile: ExaminerProfile,
): Promise<LiveStats> {
  const agg = await db.execute<{
    marks: number | null; question_len: number; memo_len: number;
    cognitive_level: string | null; question_number: string; memo_text: string;
  }>(sql`
    SELECT marks,
           length(question_text)::int AS question_len,
           length(memo_text)::int     AS memo_len,
           cognitive_level, question_number, memo_text
      FROM dbe_verbatim_questions
     WHERE subject = ${subject} AND paper_number = ${paperNumber}
       AND language = ${language}
       AND released_at IS NOT NULL AND accuracy_flag = 'clean'
       AND memo_text IS NOT NULL AND length(memo_text) > 40
  `);
  const rows = agg.rows ?? [];
  const repaired: string[] = [];

  // ── marks ────────────────────────────────────────────────────────────────
  const liveMarks = rows.map((r) => r.marks).filter((m): m is number => typeof m === "number" && m > 0);
  const storedHist = profile.markAllocation?.histogram ?? {};
  let markHistogram: Record<number, number> = {};
  for (const [k, v] of Object.entries(storedHist)) {
    const n = Number(k);
    if (Number.isFinite(n) && n > 0) markHistogram[n] = Number(v) || 0;
  }
  // A stored histogram built from a single sample (Life Sciences P1 is
  // literally {"18": 1}) is worse than no histogram — it would pin every
  // generated question to 18 marks. Require real mass before trusting it.
  const storedMass = Object.values(markHistogram).reduce((a, b) => a + b, 0);
  if (storedMass < 5 && liveMarks.length >= 5) {
    markHistogram = {};
    for (const m of liveMarks) markHistogram[m] = (markHistogram[m] ?? 0) + 1;
    repaired.push("markHistogram");
  }
  const histEntries = Object.entries(markHistogram)
    .map(([k, v]) => [Number(k), v] as const)
    .sort((a, b) => b[1] - a[1]);

  let modalMarks = Number(profile.markAllocation?.modalMarks);
  if (!Number.isFinite(modalMarks) || modalMarks <= 0 || repaired.includes("markHistogram")) {
    modalMarks = histEntries[0]?.[0] ?? 2;
    repaired.push("modalMarks");
  }
  const markKeys = histEntries.map(([k]) => k).sort((a, b) => a - b);
  const markMin = markKeys[0] ?? 1;
  const markMax = markKeys[markKeys.length - 1] ?? 10;

  // ── lengths ──────────────────────────────────────────────────────────────
  const memoLens = rows.map((r) => r.memo_len).filter((n) => n > 0).sort((a, b) => a - b);
  const qLens = rows.map((r) => r.question_len).filter((n) => n > 0);
  const pct = (arr: number[], p: number) =>
    arr.length ? arr[Math.min(arr.length - 1, Math.floor((arr.length - 1) * p))] : 0;
  const liveAvgMemo = memoLens.length
    ? Math.round(memoLens.reduce((a, b) => a + b, 0) / memoLens.length) : 0;

  // A stored length is only trusted if it is within 3× of what the corpus
  // actually shows. Five of the 66 profiles carrying an `avgMemoLength` are
  // wildly wrong — Accounting P2 stores 24 characters against a real mean of
  // ~870 — and since memo length is a scored dimension, an unchecked value
  // there would reject every correct memo the model produces.
  const plausible = (stored: number, live: number) =>
    Number.isFinite(stored) && stored > 0 && (live <= 0 || (stored >= live / 3 && stored <= live * 3));

  let avgMemoLength = Number(profile.avgMemoLength);
  if (!plausible(avgMemoLength, liveAvgMemo)) {
    avgMemoLength = liveAvgMemo || 200;
    repaired.push("avgMemoLength");
  }

  const liveAvgQ = qLens.length
    ? Math.round(qLens.reduce((a, b) => a + b, 0) / qLens.length) : 0;
  let avgQuestionLength = Number(profile.avgQuestionLength);
  if (!plausible(avgQuestionLength, liveAvgQ)) {
    avgQuestionLength = liveAvgQ || 180;
    repaired.push("avgQuestionLength");
  }

  // ── numbering depth ──────────────────────────────────────────────────────
  let maxNumberingDepth = Number(profile.structure?.maxNumberingDepth);
  if (!Number.isFinite(maxNumberingDepth) || maxNumberingDepth <= 0) {
    maxNumberingDepth = Math.max(
      1, ...rows.map((r) => (r.question_number ?? "").split(".").filter(Boolean).length),
    );
    repaired.push("maxNumberingDepth");
  }

  // ── cognitive spread ─────────────────────────────────────────────────────
  let cognitiveSpread = profile.cognitiveSpread ?? {};
  if (!Object.keys(cognitiveSpread).length) {
    cognitiveSpread = {};
    for (const r of rows) {
      const c = r.cognitive_level ?? "knowledge";
      cognitiveSpread[c] = (cognitiveSpread[c] ?? 0) + 1;
    }
    repaired.push("cognitiveSpread");
  }

  // ── command verbs + tick convention, observed from real question text ────
  const verbCounts = new Map<string, number>();
  for (const r of rows) {
    const head = (r.question_number ?? "") + " ";
    void head;
  }
  const qTexts = await db.execute<{ question_text: string }>(sql`
    SELECT question_text FROM dbe_verbatim_questions
     WHERE subject = ${subject} AND paper_number = ${paperNumber} AND language = ${language}
       AND released_at IS NOT NULL AND accuracy_flag = 'clean'
     LIMIT 400
  `);
  for (const r of qTexts.rows ?? []) {
    const first = (r.question_text ?? "").trim().toLowerCase().split(/[^a-zà-ÿ]+/).filter(Boolean);
    for (const w of first.slice(0, 6)) {
      if (COMMAND_VERBS.includes(w)) { verbCounts.set(w, (verbCounts.get(w) ?? 0) + 1); break; }
    }
  }
  const commandVerbs = [...verbCounts.entries()]
    .map(([verb, count]) => ({ verb, count }))
    .sort((a, b) => b.count - a.count).slice(0, 10);

  // DBE memos mark each earned mark with a tick glyph. Whether this subject's
  // memos actually do that is an observable fact, not an assumption.
  const tickRows = rows.filter((r) => /[√✓]/.test(r.memo_text ?? "")).length;
  const usesTickMarks = rows.length > 0 && tickRows / rows.length >= 0.3;

  return {
    markHistogram, modalMarks, markMin, markMax,
    avgQuestionLength, avgMemoLength,
    memoLengthP10: pct(memoLens, 0.1) || Math.round(avgMemoLength * 0.4),
    memoLengthP90: pct(memoLens, 0.9) || Math.round(avgMemoLength * 2.2),
    maxNumberingDepth, cognitiveSpread, commandVerbs, usesTickMarks,
    exemplarCount: rows.length, repaired,
  };
}

// ─────────────────────────── topic selection ─────────────────────────────────

/**
 * High-yield topics, weighted by `appearancesCount`.
 *
 * NOTE on units: `appearancesCount` counts question-level occurrences and
 * `totalYearsSampled` counts distinct years. They are NOT numerator and
 * denominator of the same fraction — a topic can appear nine times in one
 * paper. We weight on appearances and carry years through only as context.
 */
export interface PickTopicsResult { topics: TopicTarget[]; crossWired: string[]; }

export async function pickTopicsDetailed(subject: string, limit: number): Promise<PickTopicsResult> {
  // ── Cross-wiring guard ───────────────────────────────────────────────────
  // 32 of the 181 `dbe_topic_frequency` rows (11 subjects) carry a `topic_id`
  // pointing at a `topics` row that belongs to a DIFFERENT subject:
  // Hospitality Studies → Information Technology topics, Dramatic Arts →
  // Visual Arts, Life Orientation → Life Sciences. Generating against those
  // would silently produce, say, IT questions filed under Hospitality Studies.
  // We therefore require the topic's owning subject to match, comparing
  // case- and space-insensitively so benign label drift ("Dance studies" vs
  // "Dance Studies") is not thrown away alongside the real mismatches.
  const r = await db.execute<{
    topic_id: number; topic: string; appearances_count: number;
    total_years_sampled: number; avg_marks_per_appearance: number;
    frequency_rank: number; owner: string | null;
  }>(sql`
    SELECT f.topic_id, t.name AS topic, f.appearances_count, f.total_years_sampled,
           f.avg_marks_per_appearance, f.frequency_rank, s.name AS owner
      FROM dbe_topic_frequency f
      JOIN topics t ON t.id = f.topic_id
      LEFT JOIN subjects s ON s.id = t.subject_id
     WHERE f.subject = ${subject} AND f.appearances_count > 0
     ORDER BY f.appearances_count DESC, f.frequency_rank ASC
  `);
  const norm = (s: string | null) => (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
  const crossWired: string[] = [];
  const rows = (r.rows ?? []).filter((x) => {
    // A topic with no owner recorded is allowed through — absent provenance is
    // not evidence of a mismatch, and dropping it would needlessly starve the
    // subject of targets.
    if (x.owner === null || norm(x.owner) === norm(subject)) return true;
    crossWired.push(`${x.topic} (owned by ${x.owner})`);
    return false;
  });
  if (!rows.length) return { topics: [], crossWired };

  // Square-root damping: raw appearances are brutally top-heavy (Business
  // Studies: 446 vs 18), and weighting linearly would starve every mid-yield
  // topic. sqrt keeps the ordering but leaves the tail some share.
  const damped = rows.map((x) => ({ ...x, w: Math.sqrt(x.appearances_count) }));
  const dampedTotal = damped.reduce((a, b) => a + b.w, 0) || 1;

  const topics: TopicTarget[] = damped.slice(0, limit).map((x) => ({
    topicId: x.topic_id,
    topic: x.topic,
    appearancesCount: x.appearances_count,
    totalYearsSampled: x.total_years_sampled,
    avgMarksPerAppearance: x.avg_marks_per_appearance,
    frequencyRank: x.frequency_rank,
    weight: Number((x.w / dampedTotal).toFixed(4)),
  }));
  return { topics, crossWired };
}

export async function pickTopics(subject: string, limit: number): Promise<TopicTarget[]> {
  return (await pickTopicsDetailed(subject, limit)).topics;
}

/** Allocate `n` questions across topics proportional to weight, largest
 *  remainder, every returned topic guaranteed at least one. */
export function allocateByWeight(topics: TopicTarget[], n: number): Array<{ topic: TopicTarget; count: number }> {
  if (!topics.length || n <= 0) return [];
  const use = topics.slice(0, Math.min(topics.length, n));
  const wTotal = use.reduce((a, b) => a + b.weight, 0) || 1;
  const raw = use.map((t) => ({ topic: t, exact: (t.weight / wTotal) * n }));
  const out = raw.map((r) => ({ topic: r.topic, count: Math.max(1, Math.floor(r.exact)) }));
  let assigned = out.reduce((a, b) => a + b.count, 0);
  const order = raw.map((r, i) => ({ i, frac: r.exact - Math.floor(r.exact) }))
    .sort((a, b) => b.frac - a.frac);
  let k = 0;
  while (assigned < n && order.length) { out[order[k % order.length].i].count++; assigned++; k++; }
  while (assigned > n) {
    const idx = out.map((o, i) => ({ i, c: o.count })).sort((a, b) => b.c - a.c)[0].i;
    if (out[idx].count <= 1) break;
    out[idx].count--; assigned--;
  }
  return out;
}

// ────────────────────────── exemplar retrieval ───────────────────────────────

const STOPWORDS = new Set(["and", "the", "of", "in", "to", "a", "an", "for", "en", "die", "van"]);

/**
 * Fetch 3-5 REAL verbatim questions to put in the prompt.
 *
 * `dbe_verbatim_questions.topic` is NULL corpus-wide, so there is nothing to
 * join on: relevance is scored lexically against the topic NAME in SQL, with a
 * fallback to the paper's highest-quality memos when a topic has no lexical
 * hits. Falling back to real off-topic exemplars beats sending none — the
 * exemplars' job is to carry the paper's VOICE, and the topic is pinned
 * separately in the instruction.
 *
 * CROSS-LANGUAGE MATCHING: topic names in `topics` are English, so scoring an
 * Afrikaans paper's text against "Business Environments" returns relevance 0
 * for every row, and the Afrikaans prompt silently degrades to arbitrary
 * exemplars. DBE publishes translated papers under identical numbering, which
 * is verifiable — 1114 of 1169 released English Business Studies rows have an
 * Afrikaans sibling at the same (subject, year, paper, question_number). So for
 * a non-English target we score relevance on the ENGLISH sibling and return the
 * target-language row, giving Afrikaans genuinely on-topic exemplars that are
 * still written in authentic Afrikaans.
 */
export async function fetchExemplars(
  subject: string, paperNumber: number, language: string, topic: string, want = 4,
): Promise<Exemplar[]> {
  const terms = topic.toLowerCase().split(/[^a-zà-ÿ]+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w)).slice(0, 5);

  const relOn = (alias: string) => terms.length
    ? sql.join(
        terms.map((t) => sql`(CASE WHEN ${sql.raw(alias)}.question_text ILIKE ${"%" + t + "%"} THEN 2 ELSE 0 END
                            + CASE WHEN ${sql.raw(alias)}.memo_text     ILIKE ${"%" + t + "%"} THEN 1 ELSE 0 END)`),
        sql` + `,
      )
    : sql`0`;

  const usable = sql`
    t.released_at IS NOT NULL AND t.accuracy_flag = 'clean'
    AND t.memo_text IS NOT NULL AND length(t.memo_text) BETWEEN 60 AND 2000
    AND length(t.question_text) BETWEEN 40 AND 1200`;

  const isEnglish = language.toLowerCase().startsWith("english");
  const query = isEnglish || terms.length === 0
    ? sql`
      SELECT t.id, t.question_number, t.question_text, t.memo_text, t.marks,
             t.cognitive_level, t.quality_score, t.year, (${relOn("t")})::int AS relevance
        FROM dbe_verbatim_questions t
       WHERE t.subject = ${subject} AND t.paper_number = ${paperNumber}
         AND t.language = ${language} AND ${usable}
       ORDER BY relevance DESC, t.quality_score DESC NULLS LAST, length(t.memo_text) DESC
       LIMIT ${want}`
    : sql`
      SELECT t.id, t.question_number, t.question_text, t.memo_text, t.marks,
             t.cognitive_level, t.quality_score, t.year,
             COALESCE(MAX((${relOn("e")})::int), 0) AS relevance
        FROM dbe_verbatim_questions t
        LEFT JOIN dbe_verbatim_questions e
               ON e.subject = t.subject AND e.year = t.year
              AND e.paper_number = t.paper_number
              AND e.question_number = t.question_number
              AND e.language = 'English'
       WHERE t.subject = ${subject} AND t.paper_number = ${paperNumber}
         AND t.language = ${language} AND ${usable}
       GROUP BY t.id, t.question_number, t.question_text, t.memo_text, t.marks,
                t.cognitive_level, t.quality_score, t.year
       ORDER BY relevance DESC, t.quality_score DESC NULLS LAST, length(t.memo_text) DESC
       LIMIT ${want}`;

  const r = await db.execute<{
    id: number; question_number: string; question_text: string; memo_text: string;
    marks: number | null; cognitive_level: string | null; quality_score: number | null;
    year: number; relevance: number;
  }>(query);
  return (r.rows ?? []).map((x) => ({
    id: x.id, questionNumber: x.question_number, questionText: x.question_text,
    memoText: x.memo_text, marks: x.marks, cognitiveLevel: x.cognitive_level,
    qualityScore: x.quality_score, year: x.year, relevance: x.relevance,
  }));
}

// ──────────────────────────── prompt design ──────────────────────────────────

const AF = (l: string) => /afrikaans/i.test(l);

function dominantCognitive(spread: Record<string, number>): Array<{ level: string; pct: number }> {
  const total = Object.values(spread).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(spread)
    .map(([level, n]) => ({ level, pct: Math.round((n / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}

export function buildSystemPrompt(language: string): string {
  const af = AF(language);
  return [
    `You are a senior South African NSC (Grade 12, CAPS) examiner writing NEW exam questions for the Department of Basic Education house style.`,
    ``,
    `You will be given (1) measured statistics for one specific subject and paper, and (2) REAL past questions from that exact paper with their REAL marking memoranda. Your output must be indistinguishable in voice, structure and mark logic from those real examples.`,
    ``,
    `ABSOLUTE RULES FOR THE MEMO ("answerText"):`,
    `  • Write the ACTUAL ANSWER a learner should give. Answer first, always.`,
    `  • NEVER write about the candidate in the third person. Phrases like "The candidate must…", "Learners should…", "Award the mark if…" are FORBIDDEN — that is marker rubric prose, not a memo. Write the answer itself.`,
    `  • Show where each mark is earned, matching the tick convention in the examples.`,
    `  • End with a short "NOTE:" line ONLY if the real examples do, carrying genuine marking rules (alternatives accepted, max caps, linkage requirements).`,
    ``,
    `EXAMINER TIP ("examinerTip") — 2 sentences, addressed to the learner:`,
    `  • Sentence 1: what this question is REALLY testing (the underlying skill, not a restatement of the question).`,
    `  • Sentence 2: the specific, concrete mistake that most often loses marks here.`,
    `  • Never generic. "Read the question carefully" is a failure.`,
    ``,
    af
      ? `LANGUAGE: Write EVERY field (question, memo, examiner tip, MCQ options) in AFRIKAANS, in the register of a real Afrikaans NSC paper. Do not translate literally from English — write as the Afrikaans paper is written.`
      : `LANGUAGE: Write every field in South African English as used in NSC papers.`,
    ``,
    `Return ONLY valid JSON matching the requested schema. No markdown fences, no commentary.`,
  ].join("\n");
}

export function buildUserPrompt(args: {
  subject: string; paperNumber: number; language: string;
  topic: TopicTarget; stats: LiveStats; profile: ExaminerProfile;
  exemplars: Exemplar[]; count: number; mcqCount: number;
}): string {
  const { subject, paperNumber, language, topic, stats, profile, exemplars, count, mcqCount } = args;
  const cog = dominantCognitive(stats.cognitiveSpread);
  const conv = profile.markingConventions ?? {};
  const convNotes: string[] = [];
  if (Number(conv.requiresWorking) > 0) convNotes.push(`This paper requires WORKING to be shown — the memo must show the working that earns the marks, not just the final answer.`);
  if (Number(conv.carriesForward) > 0) convNotes.push(`This paper applies CARRY-FORWARD (a wrong earlier value still earns later method marks) — reflect that in the mark breakdown and say so in the examiner tip.`);
  if (Number(conv.acceptsAlternatives) > 0) convNotes.push(`This paper explicitly accepts ALTERNATIVE correct answers — list the accepted alternatives in the memo.`);
  if (Number(conv.penaltyRules) > 0) convNotes.push(`This paper has PENALTY rules — state the penalty condition in the memo NOTE.`);

  const topMarks = Object.entries(stats.markHistogram)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([m, n]) => `${m} marks (seen ${n}×)`).join(", ");

  return [
    `SUBJECT: ${subject} — Paper ${paperNumber} — ${language}`,
    `TARGET TOPIC: ${topic.topic}`,
    `  This topic is high-yield: ${topic.appearancesCount} question-level appearances across ${topic.totalYearsSampled} sampled years (rank ${topic.frequencyRank} for this subject). Note these are different units — appearances are per-question, not per-year.`,
    ``,
    `═══ MEASURED EXAMINER PROFILE FOR THIS EXACT PAPER ═══`,
    `Mark allocation observed: ${topMarks || `${stats.modalMarks} marks`}`,
    `  → Modal (most common) allocation: ${stats.modalMarks} marks. Stay within ${stats.markMin}–${stats.markMax} marks.`,
    `Cognitive spread observed: ${cog.map((c) => `${c.level} ${c.pct}%`).join(", ")}`,
    `  → Match this distribution across the ${count} questions you write.`,
    `Question numbering depth: up to ${stats.maxNumberingDepth} levels (e.g. ${
      stats.maxNumberingDepth >= 3 ? "2.1.3" : stats.maxNumberingDepth === 2 ? "2.1" : "2"}).`,
    `Typical question length: ~${stats.avgQuestionLength} characters.`,
    `Typical memo length: ~${stats.avgMemoLength} characters (normal range ${stats.memoLengthP10}–${stats.memoLengthP90}).`,
    stats.commandVerbs.length
      ? `Command verbs this paper actually uses, most frequent first: ${stats.commandVerbs.map((v) => v.verb).join(", ")}. Open your questions with these.`
      : ``,
    stats.usesTickMarks
      ? `Memo tick convention: this paper's memos mark each earned mark with "√". Use "√" the same way — one per mark earned, e.g. "Micro√ Full control√√".`
      : `Memo convention: this paper's memos do NOT use tick glyphs. Show the mark split in brackets instead, e.g. "(2)".`,
    convNotes.length ? `Marking conventions:\n  - ${convNotes.join("\n  - ")}` : ``,
    ``,
    `═══ REAL QUESTIONS FROM THIS PAPER — MIMIC THIS VOICE ═══`,
    ...exemplars.map((e, i) => [
      `--- EXAMPLE ${i + 1} (${e.year}, Q${e.questionNumber}, ${e.marks ?? "?"} marks) ---`,
      `QUESTION: ${e.questionText}`,
      `MEMO: ${e.memoText}`,
    ].join("\n")),
    ``,
    `═══ YOUR TASK ═══`,
    `Write ${count} NEW question(s) on "${topic.topic}" for this paper. They must be genuinely new — not paraphrases of the examples above — but must read as though they came from the same paper.`,
    mcqCount > 0
      ? `Of these, exactly ${mcqCount} must be multiple-choice with 4 options (A-D): set "mcqOptions" to the four options and "correctOption" to the correct letter. Distractors must be plausible and reflect real misconceptions, not filler. MCQs carry ${MCQ_POLICY.minMarks}-${MCQ_POLICY.maxMarks} marks.
  For an MCQ, "answerText" is shown to the learner AFTER they answer, so it must EXPLAIN, not just name the answer. Bare answers like "C" or "LIFO" are useless and will be rejected. Write at least two sentences: state the correct option and WHY it is correct, then name the most tempting distractor and why it is wrong.
  For the rest, set "mcqOptions" and "correctOption" to null.`
      : `Set "mcqOptions" and "correctOption" to null for every question.`,
    ``,
    `Return JSON: {"questions":[{"questionNumber":string,"questionText":string,"answerText":string,"markingRubric":{"steps":[{"step":string,"marks":number}],"notes":[string]},"marks":number,"topic":string,"cognitiveLevel":"knowledge"|"comprehension"|"analysis"|"synthesis","examinerTip":string,"mcqOptions":[{"letter":string,"text":string}]|null,"correctOption":string|null}]}`,
    `The "steps" marks MUST sum exactly to "marks".`,
  ].filter(Boolean).join("\n");
}

// ─────────────────────────────── generation ──────────────────────────────────

export async function generateForTopic(args: {
  subject: string; paperNumber: number; language: string;
  topic: TopicTarget; stats: LiveStats; profile: ExaminerProfile;
  exemplars: Exemplar[]; count: number;
}): Promise<GeneratedQuestion[]> {
  const mcqCount = Math.round(args.count * MCQ_POLICY.share);
  const userPrompt = buildUserPrompt({ ...args, mcqCount });

  const res = await client().chat.completions.create({
    model: GENERATION_MODEL,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt(args.language) },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = res.choices[0]?.message?.content ?? "{}";
  let parsed: { questions?: GeneratedQuestion[] };
  try { parsed = JSON.parse(raw); }
  catch { throw new Error(`Model returned non-JSON for ${args.subject} P${args.paperNumber} / ${args.topic.topic}`); }

  return (parsed.questions ?? []).map((q) => ({
    questionNumber: String(q.questionNumber ?? "1"),
    questionText: String(q.questionText ?? "").trim(),
    answerText: String(q.answerText ?? "").trim(),
    markingRubric: {
      steps: Array.isArray(q.markingRubric?.steps) ? q.markingRubric.steps : [],
      notes: Array.isArray(q.markingRubric?.notes) ? q.markingRubric.notes : [],
    },
    marks: Number(q.marks) || 0,
    topic: String(q.topic ?? args.topic.topic),
    cognitiveLevel: String(q.cognitiveLevel ?? "knowledge"),
    examinerTip: String(q.examinerTip ?? "").trim(),
    mcqOptions: Array.isArray(q.mcqOptions) && q.mcqOptions.length ? q.mcqOptions : null,
    correctOption: q.correctOption ? String(q.correctOption).trim().toUpperCase().slice(0, 1) : null,
  }));
}

// ──────────────────────────── quality scoring ────────────────────────────────

/**
 * The failure mode we are scoring against. The broken prior art read
 * "Die kandidaat ontwerp 'n speletjie…" — marker prose about the candidate.
 * A memo that opens like this is not a partially-good memo, it is the wrong
 * artefact, so matching this in the FIRST 200 characters is a hard fail.
 */
const RUBRIC_VOICE =
  /\b(the candidate|die kandidaat|kandidate moet|the learner (?:must|should)|learners? (?:must|should) (?:be able to|demonstrate|show)|award (?:the |one |a )?marks?|do not award|toeken(?:ing)? van punte|geen punte toegeken|marker(?:s)? (?:should|must))\b/i;

const TIP_GENERIC =
  /^(read the question carefully|study (?:the|your) (?:notes|work)|revise (?:this|the) (?:topic|section)|make sure you understand|lees die vraag|hersien hierdie)/i;

export function scoreGeneratedQuestion(
  q: GeneratedQuestion, stats: LiveStats, topic: TopicTarget, language: string,
): ScoreResult {
  const checks: ScoreResult["detail"]["checks"] = [];
  const reasons: string[] = [];
  let hardFail: string | null = null;

  const add = (name: string, score: number, weight: number, reason: string) =>
    checks.push({ name, score: Math.max(0, Math.min(100, Math.round(score))), weight, reason });

  const isMcq = !!q.mcqOptions;

  // ═══ 1. CAPS / topic alignment ═══════════════════════════════════════════
  // Topic names in `topics` are ENGLISH. Literal term matching is therefore a
  // valid signal only for English output — an Afrikaans question on
  // "sakeomgewings" is perfectly on-topic for "Business Environments" and would
  // score 0 here. We do not penalise what this check cannot measure: for
  // non-English we return a neutral score and record that it was not assessed,
  // rather than manufacturing a false negative that drags the composite down.
  const hay = `${q.questionText} ${q.answerText}`.toLowerCase();
  const topicTerms = topic.topic.toLowerCase().split(/[^a-zà-ÿ]+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
  const measurable = !AF(language) && topicTerms.length > 0;
  const hits = topicTerms.filter((t) => hay.includes(t)).length;
  const topicCover = measurable ? (hits / topicTerms.length) * 100 : 60;
  add("topicCoverage", topicCover, 0.5, measurable
    ? `${hits}/${topicTerms.length} topic terms from "${topic.topic}" present`
    : `not assessable — topic name "${topic.topic}" is English, output is ${language}`);
  if (measurable && topicCover < 34) reasons.push(`Question does not visibly examine "${topic.topic}"`);

  const firstWords = q.questionText.trim().toLowerCase().split(/[^a-zà-ÿ]+/).filter(Boolean).slice(0, 6);
  const verbUsed = firstWords.find((w) => COMMAND_VERBS.includes(w));
  const profileVerbs = new Set(stats.commandVerbs.map((v) => v.verb));
  const verbScore = !verbUsed ? 25 : profileVerbs.size === 0 ? 80 : profileVerbs.has(verbUsed) ? 100 : 65;
  add("commandVerb", verbScore, 0.3,
    verbUsed ? `opens with "${verbUsed}"${profileVerbs.has(verbUsed) ? " (in profile)" : " (not in profile's observed verbs)"}`
             : "no recognised command verb in opening");
  if (!verbUsed) reasons.push("Question does not open with a recognised NSC command verb");

  const langOk = AF(language)
    ? /\b(die|van|wat|nie|word|met|jou|hierdie|een|twee)\b/i.test(q.questionText)
    : !/\b(die|nie|jou|hierdie|verduidelik)\b/.test(q.questionText.toLowerCase());
  add("languageFit", langOk ? 100 : 0, 0.2,
    langOk ? `reads as ${language}` : `does NOT read as ${language}`);
  if (!langOk) { hardFail = `Generated in the wrong language (expected ${language})`; reasons.push(hardFail); }

  const capsAlignment = weighted(checks.slice(0, 3));

  // ═══ 2. Structural match to the examiner profile ═════════════════════════
  const sChecks: ScoreResult["detail"]["checks"] = [];
  const sAdd = (n: string, s: number, w: number, r: string) =>
    sChecks.push({ name: n, score: Math.max(0, Math.min(100, Math.round(s))), weight: w, reason: r });

  // MCQs are a derived artefact with their own mark policy — the corpus has no
  // extracted MCQs to observe (see MCQ_POLICY), so the paper's written-answer
  // mark range does not govern them.
  const lowMark = isMcq ? MCQ_POLICY.minMarks : stats.markMin;
  const highMark = isMcq ? MCQ_POLICY.maxMarks : stats.markMax;
  const inRange = q.marks >= lowMark && q.marks <= highMark;
  const isModal = !isMcq && q.marks === stats.modalMarks;
  const observed = !isMcq && (stats.markHistogram[q.marks] ?? 0) > 0;
  const markScore = q.marks <= 0 ? 0 : isModal ? 100 : observed ? 90 : inRange ? (isMcq ? 100 : 70) : 20;
  sAdd("markAllocation", markScore, 0.3,
    `${q.marks} marks — ${isModal ? "modal" : observed ? "observed in histogram"
      : inRange ? `within ${isMcq ? "MCQ policy" : "observed"} ${lowMark}-${highMark}`
      : `OUTSIDE ${isMcq ? "MCQ policy" : "observed"} ${lowMark}-${highMark}`}`);
  if (!inRange && q.marks > 0) reasons.push(`Mark allocation ${q.marks} outside ${isMcq ? "MCQ policy" : "observed"} range ${lowMark}-${highMark}`);

  const depth = q.questionNumber.split(".").filter(Boolean).length;
  const depthOk = depth >= 1 && depth <= stats.maxNumberingDepth;
  const numFormat = /^\d+(\.\d+)*$/.test(q.questionNumber.trim());
  sAdd("numbering", depthOk && numFormat ? 100 : numFormat ? 55 : 25, 0.2,
    `"${q.questionNumber}" depth ${depth} vs max ${stats.maxNumberingDepth}${numFormat ? "" : ", non-numeric format"}`);

  // Memo length is judged against the paper's memo band — but ONLY for
  // written-answer questions. An MCQ memo is legitimately a letter and a line
  // of justification; holding it to a 1000-character essay-memo band would
  // reject correct MCQs for being correct. MCQs get their own short band.
  const mLen = q.answerText.length;
  const lo = isMcq ? 15 : stats.memoLengthP10 * 0.6;
  const hi = isMcq ? 600 : stats.memoLengthP90 * 1.6;
  const memoScore = mLen < (isMcq ? 8 : 30) ? 0
    : mLen >= lo && mLen <= hi ? 100
    : mLen < lo ? Math.max(20, (mLen / lo) * 100)
    : Math.max(25, 100 - ((mLen - hi) / hi) * 60);
  sAdd("memoLength", memoScore, 0.25,
    `memo ${mLen} chars vs ${isMcq ? "MCQ" : "written"} band ${Math.round(lo)}-${Math.round(hi)}` +
    (isMcq ? "" : ` (paper avg ${stats.avgMemoLength})`));
  if (!isMcq && mLen < lo * 0.7) reasons.push(`Memo far shorter than this paper's memos (${mLen} vs ~${stats.avgMemoLength} chars)`);

  const qLen = q.questionText.length;
  sAdd("questionLength", qLen < 25 ? 10 : qLen <= stats.avgQuestionLength * 3 ? 100 : 60, 0.1,
    `question ${qLen} chars vs avg ${stats.avgQuestionLength}`);

  const cogKnown = Object.keys(stats.cognitiveSpread).includes(q.cognitiveLevel);
  sAdd("cognitiveLevel", cogKnown ? 100 : 50, 0.15,
    cogKnown ? `"${q.cognitiveLevel}" observed in this paper` : `"${q.cognitiveLevel}" not among observed levels`);

  const structureScore = weighted(sChecks);
  checks.push(...sChecks);

  // ═══ 3. Answer completeness — memo voice, mark logic, examiner tip ═══════
  const aChecks: ScoreResult["detail"]["checks"] = [];
  const aAdd = (n: string, s: number, w: number, r: string) =>
    aChecks.push({ name: n, score: Math.max(0, Math.min(100, Math.round(s))), weight: w, reason: r });

  // Memo voice — the decisive check.
  const opening = q.answerText.slice(0, 200);
  const voiceInOpening = RUBRIC_VOICE.test(opening);
  const voiceAnywhere = RUBRIC_VOICE.test(q.answerText);
  const voiceScore = voiceInOpening ? 0 : voiceAnywhere ? 55 : 100;
  aAdd("memoVoice", voiceScore, 0.35,
    voiceInOpening ? "REJECT: memo opens in examiner-rubric voice about the candidate"
      : voiceAnywhere ? "rubric-voice phrasing present later in memo" : "learner-facing model answer");
  if (voiceInOpening) {
    hardFail = "Memo is marker rubric prose about the candidate, not a model answer";
    reasons.push(hardFail);
  } else if (voiceAnywhere) reasons.push("Memo drifts into rubric voice");

  // Mark breakdown must exist and add up.
  const steps = q.markingRubric?.steps ?? [];
  const stepSum = steps.reduce((a, s) => a + (Number(s.marks) || 0), 0);
  const sumOk = steps.length > 0 && stepSum === q.marks;
  aAdd("markBreakdown", sumOk ? 100 : steps.length ? 45 : 0, 0.25,
    steps.length ? `${steps.length} steps summing to ${stepSum} vs ${q.marks} marks${sumOk ? "" : " — MISMATCH"}`
                 : "no mark breakdown supplied");
  if (!sumOk) reasons.push(steps.length ? `Mark steps sum to ${stepSum}, question is ${q.marks} marks` : "No mark breakdown");

  // Tick convention, only where the real memos use it — and not for MCQs,
  // whose memo is a letter plus a justification, not a ticked mark schedule.
  if (stats.usesTickMarks && !isMcq) {
    const ticks = (q.answerText.match(/[√✓]/g) ?? []).length;
    const ratio = q.marks > 0 ? ticks / q.marks : 0;
    aAdd("tickConvention", ticks === 0 ? 20 : ratio >= 0.5 && ratio <= 1.6 ? 100 : 60, 0.15,
      `${ticks} tick glyphs for ${q.marks} marks`);
    if (ticks === 0) reasons.push("This paper's memos use √ per mark; generated memo has none");
  } else {
    aAdd("tickConvention", 100, 0.15,
      isMcq ? "MCQ — tick schedule not applicable" : "paper does not use tick glyphs — not required");
  }

  // Examiner tip — explicitly requested by the owner.
  const tip = q.examinerTip ?? "";
  const tipSentences = tip.split(/[.!?]+/).filter((s) => s.trim().length > 8).length;
  const tipScore = !tip ? 0 : TIP_GENERIC.test(tip.trim()) ? 25
    : tip.length < 40 ? 45 : tipSentences >= 2 ? 100 : 70;
  aAdd("examinerTip", tipScore, 0.25,
    !tip ? "missing" : TIP_GENERIC.test(tip.trim()) ? "generic filler advice"
      : `${tipSentences} sentences, ${tip.length} chars`);
  if (!tip) { reasons.push("No examiner tip"); }
  else if (TIP_GENERIC.test(tip.trim())) reasons.push("Examiner tip is generic filler");

  // MCQ integrity, when present.
  if (q.mcqOptions) {
    const letters = q.mcqOptions.map((o) => (o.letter ?? "").toUpperCase());
    const distinct = new Set(q.mcqOptions.map((o) => (o.text ?? "").trim().toLowerCase()));
    const ok = q.mcqOptions.length === 4 && distinct.size === 4
      && !!q.correctOption && letters.includes(q.correctOption.toUpperCase());
    aAdd("mcqIntegrity", ok ? 100 : 0, 0.2,
      ok ? "4 distinct options, correct letter valid"
         : `options=${q.mcqOptions.length} distinct=${distinct.size} correct=${q.correctOption ?? "none"}`);
    if (!ok) {
      hardFail = hardFail ?? "MCQ malformed (needs 4 distinct options and a valid correct letter)";
      reasons.push("MCQ malformed");
    }

    // An MCQ's memo becomes the learner-facing `explanation` on the daily
    // challenge, shown after they answer. A bare "C" or a verbatim echo of the
    // option text teaches nothing, so it is scored as an incomplete answer.
    const ans = q.answerText.trim();
    const echoesOption = q.mcqOptions.some(
      (o) => ans.toLowerCase() === (o.text ?? "").trim().toLowerCase(),
    );
    const bare = ans.length <= 3 || echoesOption;
    const explains = ans.length >= 80 || ans.split(/[.!?]+/).filter((s) => s.trim().length > 8).length >= 2;
    aAdd("mcqExplanation", bare ? 0 : explains ? 100 : 55, 0.25,
      bare ? "REJECT: memo is a bare answer, not an explanation"
        : explains ? "explains why the answer is correct" : "explanation is thin");
    if (bare) {
      hardFail = hardFail ?? "MCQ memo is a bare answer with no explanation for the learner";
      reasons.push("MCQ memo does not explain the answer");
    } else if (!explains) reasons.push("MCQ explanation is thin");
  }

  const answerCompleteness = weighted(aChecks);
  checks.push(...aChecks);

  // ═══ Composite ═══════════════════════════════════════════════════════════
  let qualityScore = Math.round(
    capsAlignment * 0.3 + structureScore * 0.3 + answerCompleteness * 0.4,
  );
  if (hardFail) qualityScore = Math.min(qualityScore, 40);

  const qualityFlag: ScoreResult["qualityFlag"] =
    hardFail || qualityScore < QUALITY_GATE.review ? "reject"
      : qualityScore < QUALITY_GATE.pass ? "review" : "pass";

  return {
    capsAlignment: Math.round(capsAlignment),
    structureScore: Math.round(structureScore),
    answerCompleteness: Math.round(answerCompleteness),
    qualityScore, qualityFlag,
    detail: { checks, reasons, hardFail },
  };
}

function weighted(checks: Array<{ score: number; weight: number }>): number {
  const w = checks.reduce((a, b) => a + b.weight, 0) || 1;
  return checks.reduce((a, b) => a + b.score * b.weight, 0) / w;
}

// ───────────────────────────── persistence ───────────────────────────────────

import { createHash } from "crypto";

export function contentHashOf(subject: string, paper: number, language: string, questionText: string): string {
  return createHash("sha256")
    .update(`${subject}|${paper}|${language}|${questionText.replace(/\s+/g, " ").trim().toLowerCase()}`)
    .digest("hex");
}

export interface PersistArgs {
  q: GeneratedQuestion; score: ScoreResult;
  subject: string; paperNumber: number; language: string;
  profileId: number; topic: TopicTarget; exemplarIds: number[];
  batchId: string;
  /** Auto-release `pass` rows so they surface without a manual step.
   *  `review`/`reject` are never released regardless. */
  release: boolean;
}

// ──────────────────── publishing to the learner surfaces ─────────────────────

/**
 * Project released generated questions into `subject_daily_challenges` and
 * `subject_quizzes` — the two tables the learner quiz surfaces actually read.
 *
 * WHY THIS STEP EXISTS: `generated_questions` has no consumer anywhere in the
 * app. Its `released_at` gate is defined but never queried, so rows written
 * there stay invisible to learners until something projects them out.
 *
 * SHAPE: the daily-challenge response passes through a whitelist
 * (`stripAnswersFromChallenge`, server/routes.ts) that keeps ONLY id, question,
 * questionAf, options, optionsAf, subject, subjectAf, topic, difficulty —
 * anything under another key is silently dropped. We therefore write the
 * `DailyChallengeQuestion` shape from shared/schema.ts exactly. This is also
 * the bug in the existing seeding path, which writes {n, questionText,
 * memoText, marks, ...}: not one of those keys survives the whitelist, so
 * affected learners get blank, unanswerable questions that auto-score wrong.
 *
 * APPEND-ONLY: this inserts and never deletes. `/api/learner/quiz` already
 * reads `ORDER BY generated_at DESC LIMIT 1`, so the newest row wins there
 * automatically. `/api/daily-challenge` does NOT order — it builds a Map keyed
 * on subject, so with several rows per subject the last one the database
 * happens to return wins. Making that deterministic is a one-line ORDER BY in
 * routes.ts (see the report); we deliberately do not delete prior rows here.
 *
 * LANGUAGE: `subject_daily_challenges` has no language column, and its Af
 * fields mean "translation of this question". Our Afrikaans rows are
 * independently generated questions, NOT translations — pairing them would
 * show a learner a completely different question on switching language. So we
 * publish English rows only and leave the Af fields unset (the client falls
 * back to English). Serving Afrikaans properly needs either a `language`
 * column on these tables or a translation pass at generation time.
 */
export async function publishToQuizSurfaces(subject: string, opts?: {
  dailyCount?: number; quizCount?: number; minScore?: number;
}): Promise<{ subject: string; daily: number; quiz: number; skipped: string | null }> {
  const dailyCount = opts?.dailyCount ?? 5;
  const quizCount = opts?.quizCount ?? 10;
  const minScore = opts?.minScore ?? QUALITY_GATE.pass;

  // Only MCQ rows can serve these surfaces: the client renders `options` and
  // scores by comparing against `correctIndex`. A written-answer row has
  // neither and would render as an unanswerable stem.
  const r = await db.execute<{
    id: number; question_text: string; answer_text: string; topic: string | null;
    cognitive_level: string | null; mcq_options: Array<{ letter: string; text: string }>;
    correct_option: string; quality_score: number;
  }>(sql`
    SELECT id, question_text, answer_text, topic, cognitive_level,
           mcq_options, correct_option, quality_score
      FROM generated_questions
     WHERE subject = ${subject} AND language = 'English'
       AND released_at IS NOT NULL AND quality_flag = 'pass'
       AND quality_score >= ${minScore}
       AND mcq_options IS NOT NULL AND correct_option IS NOT NULL
     ORDER BY quality_score DESC, id DESC
     LIMIT ${Math.max(dailyCount, quizCount)}
  `);
  const rows = r.rows ?? [];

  const usable = rows.map((x) => {
    const correctIndex = x.mcq_options.findIndex(
      (o) => (o.letter ?? "").toUpperCase() === (x.correct_option ?? "").toUpperCase(),
    );
    return {
      id: x.id,
      question: x.question_text,
      options: x.mcq_options.map((o) => o.text),
      correctIndex,
      subject,
      topic: x.topic ?? undefined,
      difficulty: x.cognitive_level === "knowledge" ? "easy"
        : x.cognitive_level === "synthesis" ? "hard" : "medium",
      explanation: x.answer_text,
    };
    // A correctIndex of -1 would mark every learner wrong on that question,
    // so an unresolvable correct letter is dropped rather than published.
  }).filter((q) => q.correctIndex >= 0);

  if (usable.length < dailyCount) {
    return { subject, daily: 0, quiz: 0,
      skipped: `only ${usable.length} publishable MCQ row(s), need ${dailyCount}` };
  }

  const daily = usable.slice(0, dailyCount);
  const quiz = usable.slice(0, Math.min(quizCount, usable.length));

  await db.execute(sql`
    INSERT INTO subject_daily_challenges (subject, questions_json, total_questions)
    VALUES (${subject}, ${JSON.stringify(daily)}::jsonb, ${daily.length})`);
  await db.execute(sql`
    INSERT INTO subject_quizzes (subject, questions_json, total_questions)
    VALUES (${subject}, ${JSON.stringify(quiz)}::jsonb, ${quiz.length})`);

  return { subject, daily: daily.length, quiz: quiz.length, skipped: null };
}

/** Insert one scored question. Returns false when the content hash already
 *  exists (idempotent re-runs). */
export async function persistQuestion(a: PersistArgs): Promise<boolean> {
  const hash = contentHashOf(a.subject, a.paperNumber, a.language, a.q.questionText);
  const releasable = a.release && a.score.qualityFlag === "pass";
  const r = await db.execute<{ id: number }>(sql`
    INSERT INTO generated_questions (
      subject, paper_number, language, question_number, question_text, answer_text,
      marking_rubric, marks, topic, cognitive_level, mcq_options, correct_option,
      examiner_profile_id, grounding_question_ids, generation_model, examiner_tip,
      caps_alignment, structure_score, answer_completeness, quality_score,
      quality_flag, score_detail, batch_id, content_hash, released_at
    ) VALUES (
      ${a.subject}, ${a.paperNumber}, ${a.language}, ${a.q.questionNumber},
      ${a.q.questionText}, ${a.q.answerText},
      ${JSON.stringify(a.q.markingRubric)}::jsonb, ${a.q.marks}, ${a.topic.topic},
      ${a.q.cognitiveLevel},
      ${a.q.mcqOptions ? JSON.stringify(a.q.mcqOptions) : null}::jsonb,
      ${a.q.correctOption},
      ${a.profileId}, ${JSON.stringify(a.exemplarIds)}::jsonb, ${GENERATION_MODEL},
      ${a.q.examinerTip},
      ${a.score.capsAlignment}, ${a.score.structureScore}, ${a.score.answerCompleteness},
      ${a.score.qualityScore}, ${a.score.qualityFlag},
      ${JSON.stringify(a.score.detail)}::jsonb, ${a.batchId}, ${hash},
      ${releasable ? sql`now()` : sql`NULL`}
    )
    ON CONFLICT (content_hash) DO NOTHING
    RETURNING id
  `);
  return (r.rows ?? []).length > 0;
}
