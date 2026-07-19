// Examiner-logic capture: distill each subject×paper's construction and
// marking patterns from the verbatim DBE bank into examiner_profiles.
// Deterministic (no AI) — these profiles later ground the question generator.
import pg from "pg";
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();

await c.query(`
  CREATE TABLE IF NOT EXISTS examiner_profiles (
    id SERIAL PRIMARY KEY,
    subject TEXT NOT NULL,
    paper_number INTEGER NOT NULL,
    profile JSONB NOT NULL,
    question_sample_size INTEGER NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (subject, paper_number)
  )
`);

const { rows: pairs } = await c.query(`
  SELECT subject, paper_number, COUNT(*)::int n
  FROM dbe_verbatim_questions
  WHERE paper_number IS NOT NULL
  GROUP BY subject, paper_number
  HAVING COUNT(*) >= 5
  ORDER BY subject, paper_number
`);

let built = 0;
for (const { subject, paper_number } of pairs) {
  const { rows: qs } = await c.query(
    `SELECT question_number, question_text, memo_text, marks, topic, cognitive_level,
            mcq_options IS NOT NULL AS is_mcq, year, session, language
     FROM dbe_verbatim_questions
     WHERE subject = $1 AND paper_number = $2`,
    [subject, paper_number],
  );

  // Top-level question structure: "3.1.2" -> top-level 3, depth 3
  const topLevels = new Map();
  let maxDepth = 1;
  for (const q of qs) {
    const numStr = String(q.question_number ?? "");
    const parts = numStr.split(".").filter(Boolean);
    if (parts.length) {
      const top = parts[0];
      topLevels.set(top, (topLevels.get(top) ?? 0) + 1);
      maxDepth = Math.max(maxDepth, parts.length);
    }
  }

  // Mark allocation histogram
  const markCounts = {};
  for (const q of qs) if (q.marks != null) markCounts[q.marks] = (markCounts[q.marks] ?? 0) + 1;

  // Cognitive spread
  const cog = {};
  for (const q of qs) if (q.cognitive_level) cog[q.cognitive_level] = (cog[q.cognitive_level] ?? 0) + 1;

  // Topic rotation: topic -> years seen
  const topicYears = {};
  for (const q of qs) if (q.topic) {
    topicYears[q.topic] ??= new Set();
    topicYears[q.topic].add(q.year);
  }
  const years = [...new Set(qs.map((q) => q.year))].sort();
  const topics = Object.entries(topicYears)
    .map(([t, ys]) => ({ topic: t, years: [...ys].sort(), recurrence: ys.size / Math.max(years.length, 1) }))
    .sort((a, b) => b.recurrence - a.recurrence)
    .slice(0, 25);

  // Marking conventions harvested from memo text
  const memoQs = qs.filter((q) => q.memo_text && q.memo_text.length > 10);
  const convention = (re) => memoQs.filter((q) => re.test(q.memo_text)).length / Math.max(memoQs.length, 1);
  const markingConventions = {
    perMarkTicks: convention(/\(\d+\)/),                        // "(1)" per-point allocation
    acceptsAlternatives: convention(/accept|aanvaar|any\s+(one|two|three)|enige\s+(een|twee|drie)/i),
    penaltyRules: convention(/penali[sz]e|penaliseer|do not accept|moenie aanvaar/i),
    carriesForward: convention(/CA\b|consistent accuracy|deurlopende akkuraatheid/i),
    requiresWorking: convention(/working|method|bewerking|metode/i),
  };

  const langs = {};
  for (const q of qs) if (q.language) langs[q.language] = (langs[q.language] ?? 0) + 1;

  const profile = {
    subject,
    paperNumber: paper_number,
    yearsCovered: years,
    sessions: [...new Set(qs.map((q) => q.session).filter(Boolean))],
    languages: langs,
    structure: {
      topLevelQuestions: topLevels.size,
      avgSubQuestionsPerTopLevel: topLevels.size ? +(qs.length / years.length / topLevels.size).toFixed(1) : null,
      maxNumberingDepth: maxDepth,
      mcqShare: +(qs.filter((q) => q.is_mcq).length / qs.length).toFixed(3),
    },
    markAllocation: {
      histogram: markCounts,
      modalMarks: Object.entries(markCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    },
    cognitiveSpread: cog,
    topicRotation: topics,
    markingConventions,
    avgQuestionLength: Math.round(qs.reduce((s, q) => s + (q.question_text?.length ?? 0), 0) / qs.length),
    avgMemoLength: memoQs.length ? Math.round(memoQs.reduce((s, q) => s + q.memo_text.length, 0) / memoQs.length) : null,
  };

  await c.query(
    `INSERT INTO examiner_profiles (subject, paper_number, profile, question_sample_size)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (subject, paper_number) DO UPDATE
       SET profile = EXCLUDED.profile,
           question_sample_size = EXCLUDED.question_sample_size,
           generated_at = NOW()`,
    [subject, paper_number, JSON.stringify(profile), qs.length],
  );
  built++;
}

const { rows: summary } = await c.query(
  "SELECT COUNT(*)::int profiles, COUNT(DISTINCT subject)::int subjects FROM examiner_profiles",
);
console.log(`[examiner] built/updated ${built} profiles; table now: ${JSON.stringify(summary[0])}`);
await c.end();
