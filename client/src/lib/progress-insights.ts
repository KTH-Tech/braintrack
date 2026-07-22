/**
 * client/src/lib/progress-insights.ts — the reasoning behind the learner
 * Progress page (`client/src/pages/progress.tsx`), kept out of the component
 * so it can be unit-tested and so the page stays declarative.
 *
 * WHAT THE DATA ACTUALLY SUPPORTS
 * -------------------------------
 * GET /api/user/progress fans out over `user_progress` (a per-subject counter
 * table), `user_streaks`, `onboarding_results` and — since this change —
 * a day-bucketed roll-up of `attempts`. That bounds what the page may claim:
 *
 *   • Per-SUBJECT accuracy, questions and papers: real (`user_progress`).
 *   • Per-TOPIC accuracy: NOT available. The endpoint's `weakTopics` field is
 *     subject rows wearing topic field names (`topicId === subjectId`), and
 *     `dbe_verbatim_questions.topic` is NULL on every released row, so there
 *     is nothing to key a real topic breakdown off. `pickFocusSubjects` below
 *     therefore derives focus areas from subject rows directly and the page
 *     labels them as subjects — no invented topic granularity.
 *   • Per-DAY questions/correct: real, but only for the last 14 days and only
 *     when the learner has ever attempted anything (see `recentActivity`).
 *   • Starting mark vs current accuracy: real, but the starting mark is the
 *     learner's own self-reported onboarding mark, not a measured baseline —
 *     `improvementOf` returns null when no mark was captured rather than
 *     treating a missing mark as zero and inventing a huge "improvement".
 */

export interface SubjectProgress {
  subjectId: number;
  subjectName: string;
  accuracy: number;
  questionsAttempted: number;
  papersCompleted: number;
  /** Self-reported mark from onboarding; 0 when the learner never gave one. */
  initialMark?: number;
  /** Server-computed `accuracy - initialMark`; meaningless without a mark. */
  improvement?: number;
}

export interface ActivityDay {
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
}

/**
 * Per-topic mastery row surfaced on the Progress page.
 *
 * Comes from the `topic_mastery` table which the marking pipeline populates
 * from `attempts` + error-type classification — that is a REAL, per-topic
 * signal, separate from `dbe_verbatim_questions.topic` (which is NULL on
 * released rows and cannot ground a topic view). `masteryScore` is 0-100 and
 * `masteryBand` is `"red" | "amber" | "green"` on the same 60/75 thresholds
 * the CAPS pipeline uses everywhere else (see server/caps-intelligence.ts).
 */
export interface TopicMasteryEntry {
  topicId: number;
  topicName: string;
  subjectId: number;
  subjectName: string;
  masteryScore: number;
  masteryBand: "red" | "amber" | "green";
  questionsAttempted: number;
}

export interface ProgressStats {
  overallAccuracy: number;
  studyStreak: number;
  totalQuestionsAttempted: number;
  totalPapersCompleted: number;
  subjectProgress: SubjectProgress[];
  weakTopics: { topicId: number; topicName: string; subjectName: string; accuracy: number }[];
  recentActivity: ActivityDay[];
  /** Topic-level mastery from `topic_mastery`. Empty when nothing is banded. */
  topicMastery?: TopicMasteryEntry[];
  /** Total minutes logged in `study_sessions` over the last 14 days. */
  studyMinutes14d?: number;
}

/* ── Activity ─────────────────────────────────────────────────────────────── */

/**
 * Has this learner ever answered anything? Drives the difference between an
 * honest "you haven't started" screen and a real report. Checked against the
 * subject counters as well as the headline total so a learner whose totals
 * lag (the two are separate counters server-side) is not shown a blank slate.
 */
export function hasAnyActivity(stats: ProgressStats | null | undefined): boolean {
  if (!stats) return false;
  if ((stats.totalQuestionsAttempted ?? 0) > 0) return true;
  if ((stats.totalPapersCompleted ?? 0) > 0) return true;
  return (stats.subjectProgress ?? []).some((s) => (s.questionsAttempted ?? 0) > 0);
}

export interface ActivitySummary {
  totalQuestions: number;
  totalCorrect: number;
  /** Rounded percentage over the window; 0 when nothing was answered. */
  accuracy: number;
  /** Days in the window with at least one answer. */
  activeDays: number;
  /** Most questions answered in a single day in the window. */
  bestDay: number;
  /** Days covered by the window (i.e. the series length). */
  windowDays: number;
}

export function summariseActivity(days: ActivityDay[] | null | undefined): ActivitySummary {
  const series = days ?? [];
  let totalQuestions = 0;
  let totalCorrect = 0;
  let activeDays = 0;
  let bestDay = 0;
  for (const d of series) {
    const q = Math.max(0, d.questionsAnswered ?? 0);
    const c = Math.max(0, d.correctAnswers ?? 0);
    totalQuestions += q;
    totalCorrect += c;
    if (q > 0) activeDays += 1;
    if (q > bestDay) bestDay = q;
  }
  return {
    totalQuestions,
    totalCorrect,
    accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    activeDays,
    bestDay,
    windowDays: series.length,
  };
}

/** Per-day accuracy, or null on a day with no answers (so the UI shows "—"). */
export function dayAccuracy(day: ActivityDay): number | null {
  const q = Math.max(0, day.questionsAnswered ?? 0);
  if (q === 0) return null;
  return Math.round((Math.max(0, day.correctAnswers ?? 0) / q) * 100);
}

/* ── Subjects ─────────────────────────────────────────────────────────────── */

/**
 * Split the learner's subjects into the ones they've actually worked on and
 * the ones still untouched. Rendering all of them as identical 0% bars — what
 * the page used to do — reads as failure to a learner who simply hasn't
 * started, which at launch is every learner.
 */
export function splitSubjects(subjects: SubjectProgress[] | null | undefined): {
  started: SubjectProgress[];
  notStarted: SubjectProgress[];
} {
  const all = subjects ?? [];
  return {
    started: all.filter((s) => (s.questionsAttempted ?? 0) > 0),
    notStarted: all.filter((s) => (s.questionsAttempted ?? 0) === 0),
  };
}

/**
 * Change against the learner's self-reported onboarding mark. Returns null
 * when no mark was captured (`initialMark` 0/absent) — a missing baseline is
 * not a baseline of zero, and treating it as one would show every learner a
 * flattering "+64%" they did not earn.
 */
export function improvementOf(subject: SubjectProgress): number | null {
  const initial = subject.initialMark ?? 0;
  if (initial <= 0) return null;
  return (subject.accuracy ?? 0) - initial;
}

/**
 * Subjects worth attention: started, still under the target, weakest first.
 * `minQuestions` guards against branding a subject "weak" off one unlucky
 * answer. These are SUBJECTS, not topics — see the file header.
 */
export function pickFocusSubjects(
  subjects: SubjectProgress[] | null | undefined,
  opts: { target?: number; minQuestions?: number; limit?: number } = {},
): SubjectProgress[] {
  const target = opts.target ?? 70;
  const minQuestions = opts.minQuestions ?? 2;
  const limit = opts.limit ?? 4;
  return (subjects ?? [])
    .filter((s) => (s.questionsAttempted ?? 0) >= minQuestions && (s.accuracy ?? 0) < target)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
}

/* ── Topics ───────────────────────────────────────────────────────────────── */

/**
 * Guard: don't brand a topic weak/strong off a single attempt. Same threshold
 * as `pickFocusSubjects` — two answered questions is the minimum evidence.
 */
export const TOPIC_MIN_QUESTIONS = 2;

/**
 * Coverage summary of the learner's topic-mastery pool. Feeds the "Coverage"
 * tile subtitle so a headline number ("11 of 25 topics green") is grounded in
 * countable rows rather than vibes.
 */
export interface TopicCoverageSummary {
  total: number;
  green: number;
  amber: number;
  red: number;
  /** Topics with at least TOPIC_MIN_QUESTIONS answered — the graded pool. */
  graded: number;
}

export function summariseTopicMastery(
  entries: TopicMasteryEntry[] | null | undefined,
): TopicCoverageSummary {
  const rows = entries ?? [];
  let green = 0, amber = 0, red = 0, graded = 0;
  for (const t of rows) {
    if ((t.questionsAttempted ?? 0) >= TOPIC_MIN_QUESTIONS) graded += 1;
    if (t.masteryBand === "green") green += 1;
    else if (t.masteryBand === "amber") amber += 1;
    else if (t.masteryBand === "red") red += 1;
  }
  return { total: rows.length, green, amber, red, graded };
}

/**
 * The two topics currently in the "green" band, strongest first. Used to
 * balance the weak-topic panel — a page that ONLY shows what a learner is bad
 * at reads as a report card, not progress.
 */
export function pickTopicStrengths(
  entries: TopicMasteryEntry[] | null | undefined,
  limit = 3,
): TopicMasteryEntry[] {
  return (entries ?? [])
    .filter((t) => t.masteryBand === "green" && (t.questionsAttempted ?? 0) >= TOPIC_MIN_QUESTIONS)
    .sort((a, b) => b.masteryScore - a.masteryScore)
    .slice(0, limit);
}

/**
 * Weakest topics — the honest "focus here next" list. Filters out topics that
 * haven't been answered enough times to have a real read.
 */
export function pickTopicFocus(
  entries: TopicMasteryEntry[] | null | undefined,
  limit = 5,
): TopicMasteryEntry[] {
  return (entries ?? [])
    .filter((t) =>
      (t.masteryBand === "red" || t.masteryBand === "amber") &&
      (t.questionsAttempted ?? 0) >= TOPIC_MIN_QUESTIONS,
    )
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, limit);
}

/* ── "What do I do next?" ─────────────────────────────────────────────────── */

export type NextMoveKind =
  /** Nothing attempted yet — the launch-day default. */
  | "start"
  /** Worked on something, but too little to read anything into it. */
  | "build_baseline"
  /** A started subject is below target — go practise that one. */
  | "practise_weakest"
  /** All started subjects are healthy, but subjects remain untouched. */
  | "widen"
  /** Everything started and healthy — protect the streak. */
  | "keep_going";

export interface NextMove {
  kind: NextMoveKind;
  subjectId?: number;
  subjectName?: string;
  /** Accuracy of the named subject, when one is named. */
  accuracy?: number;
}

/**
 * The single most useful next action, given only what the data can prove.
 * Ordered most-specific-first so a learner always gets the narrowest advice
 * the evidence supports, and never a recommendation about a subject they
 * have barely touched.
 */
export function pickNextMove(stats: ProgressStats | null | undefined): NextMove {
  if (!hasAnyActivity(stats)) return { kind: "start" };
  const subjects = stats?.subjectProgress ?? [];
  const { started, notStarted } = splitSubjects(subjects);

  const total = subjects.reduce((sum, s) => sum + (s.questionsAttempted ?? 0), 0);
  if (total < 10) return { kind: "build_baseline" };

  const focus = pickFocusSubjects(subjects, { limit: 1 });
  if (focus.length > 0) {
    return {
      kind: "practise_weakest",
      subjectId: focus[0].subjectId,
      subjectName: focus[0].subjectName,
      accuracy: focus[0].accuracy,
    };
  }

  if (notStarted.length > 0 && started.length > 0) {
    return {
      kind: "widen",
      subjectId: notStarted[0].subjectId,
      subjectName: notStarted[0].subjectName,
    };
  }

  return { kind: "keep_going" };
}

/* ── Presentation helpers ─────────────────────────────────────────────────── */

/** Full-opacity palette colours only — the design system forbids grey text. */
export const BAND_STRONG = "#94F7C5";
export const BAND_OK = "#FFE29A";
export const BAND_WEAK = "#FF8DA1";
export const BAND_IDLE = "#9FD8FF";

/** Accuracy → band colour. `null`/untouched maps to the neutral blue. */
export function accuracyHex(accuracy: number | null | undefined): string {
  if (accuracy === null || accuracy === undefined) return BAND_IDLE;
  if (accuracy >= 70) return BAND_STRONG;
  if (accuracy >= 50) return BAND_OK;
  return BAND_WEAK;
}
