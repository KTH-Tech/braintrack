/**
 * client/src/lib/readiness.ts — the composite "how ready am I?" score shown
 * across the learner surfaces.
 *
 * TWO functions live here, on purpose:
 *
 *   • `calcReadiness` — the legacy 3-part score (accuracy + volume + streak).
 *     Dashboard, parent-dashboard, learner-study-plan and study-calendar all
 *     read this number. Its inputs and weighting must stay stable so the same
 *     learner sees the same number wherever it appears outside the Progress
 *     report. The e2e spec `tests/e2e/study-readiness.spec.ts` mirrors this
 *     formula byte-for-byte.
 *
 *   • `calcReadinessBreakdown` — the honest 4-part composite used by the
 *     Progress report. Adds SUBJECT COVERAGE as a first-class input, because
 *     matric requires being competent across every subject the learner is
 *     writing, not just the one they enjoy most. The Progress page renders the
 *     four components as bars so the learner can see WHY their number is what
 *     it is, not just what it is. Every input traces back to a real DB source
 *     (see the JSDoc on ReadinessBreakdownInputs below) — if the data isn't
 *     there, the part is 0 rather than padded to something flattering.
 */

/* ── Legacy 3-part score — do not change the weighting ─────────────────────── */

export interface ReadinessStats {
  accuracy?: number | null;
  studyStreak?: number | null;
  questionsAnswered?: number | null;
}

export function calcReadiness(stats: ReadinessStats | null | undefined): number {
  const acc = Math.max(0, Math.min(100, Number(stats?.accuracy ?? 0) || 0));
  const streak = Math.max(0, Number(stats?.studyStreak ?? 0) || 0);
  const qAnswered = Math.max(0, Number(stats?.questionsAnswered ?? 0) || 0);

  const streakPart =
    streak >= 7 ? 35 :
    streak >= 3 ? 25 :
    streak >= 1 ? 15 : 0;
  const questionsPart = Math.min(35, qAnswered / 3);
  const accuracyPart = Math.min(30, acc * 0.3);

  return Math.min(100, Math.round(streakPart + questionsPart + accuracyPart));
}

export function readinessBand(score: number): "red" | "amber" | "green" {
  if (score >= 75) return "green";
  if (score >= 55) return "amber";
  return "red";
}

export function readinessBandLabel(score: number, isAf: boolean): string {
  const b = readinessBand(score);
  if (b === "green") return isAf ? "Goed" : "Good";
  if (b === "amber") return isAf ? "Matig" : "Fair";
  return isAf ? "Swak" : "Weak";
}

/* ── 4-part composite — the Progress report's honest breakdown ─────────────── */

/**
 * Inputs come straight from `/api/user/progress`. Every field traces to a real
 * DB source:
 *   • `accuracy`         — `stats.accuracy`             from `user_progress`
 *   • `questionsAnswered`— `stats.questionsAnswered`    from `user_progress`
 *   • `subjectsEnrolled` — `subjectProgress.length`     from `onboarding_results.selected_subjects`
 *   • `subjectsStarted`  — subjects with attempts>0     from `user_progress`
 *   • `studyStreak`      — `stats.studyStreak`          from `user_streaks.current_streak`
 */
export interface ReadinessBreakdownInputs {
  accuracy?: number | null;
  questionsAnswered?: number | null;
  subjectsEnrolled?: number | null;
  subjectsStarted?: number | null;
  studyStreak?: number | null;
}

export interface ReadinessPart {
  /** Stable key for React lists / test assertions. */
  key: "accuracy" | "volume" | "coverage" | "consistency";
  /** Contribution to the composite (0..cap). */
  value: number;
  /** Maximum this part can contribute. Sums across parts equal 100. */
  cap: number;
  /** Raw underlying number for the tile subtitle (%, count, ratio). */
  raw: number;
  /** True when the underlying signal has no evidence at all (0 attempts, etc). */
  empty: boolean;
}

export interface ReadinessBreakdown {
  /** Composite 0..100 shown as the top-line number. */
  total: number;
  /** The four components, in display order. */
  parts: ReadinessPart[];
  /** Convenience getters — same numbers as `parts` but keyed. */
  accuracy: ReadinessPart;
  volume: ReadinessPart;
  coverage: ReadinessPart;
  consistency: ReadinessPart;
}

/**
 * Composite readiness. Weights:
 *   • Accuracy    — 30 pts. What fraction of the questions attempted did the
 *                   learner get right?
 *   • Volume      — 30 pts. How much practice have they actually done? Capped
 *                   at 300 questions (10% per 100), which is roughly the point
 *                   where a real base has been built.
 *   • Coverage    — 25 pts. Of the subjects they are writing, how many have
 *                   they touched at all? Matric requires being competent across
 *                   every subject — a learner with 90% in Maths and 0% in four
 *                   others is not "ready".
 *   • Consistency — 15 pts. Current daily streak, capped at 7 days.
 *
 * Every part degrades honestly:
 *   • No attempts → accuracy 0, volume 0.
 *   • No enrolled subjects → coverage 0 (rather than 100 from a divide-by-zero
 *     shortcut). This can only happen mid-onboarding.
 *   • No streak → consistency 0.
 */
export function calcReadinessBreakdown(
  inputs: ReadinessBreakdownInputs | null | undefined,
): ReadinessBreakdown {
  const accRaw = Math.max(0, Math.min(100, Number(inputs?.accuracy ?? 0) || 0));
  const qRaw = Math.max(0, Number(inputs?.questionsAnswered ?? 0) || 0);
  const enrolledRaw = Math.max(0, Number(inputs?.subjectsEnrolled ?? 0) || 0);
  const startedRaw = Math.min(enrolledRaw, Math.max(0, Number(inputs?.subjectsStarted ?? 0) || 0));
  const streakRaw = Math.max(0, Number(inputs?.studyStreak ?? 0) || 0);

  const accuracy: ReadinessPart = {
    key: "accuracy",
    value: qRaw > 0 ? Math.round(accRaw * 0.3 * 10) / 10 : 0,
    cap: 30,
    raw: accRaw,
    empty: qRaw === 0,
  };
  const volume: ReadinessPart = {
    key: "volume",
    value: Math.round(Math.min(30, (qRaw / 300) * 30) * 10) / 10,
    cap: 30,
    raw: qRaw,
    empty: qRaw === 0,
  };
  const coverage: ReadinessPart = {
    key: "coverage",
    value: enrolledRaw > 0 ? Math.round((startedRaw / enrolledRaw) * 25 * 10) / 10 : 0,
    cap: 25,
    raw: enrolledRaw > 0 ? Math.round((startedRaw / enrolledRaw) * 100) : 0,
    empty: enrolledRaw === 0,
  };
  const consistency: ReadinessPart = {
    key: "consistency",
    value: Math.round(Math.min(15, (streakRaw / 7) * 15) * 10) / 10,
    cap: 15,
    raw: streakRaw,
    empty: streakRaw === 0,
  };

  const total = Math.min(
    100,
    Math.round(accuracy.value + volume.value + coverage.value + consistency.value),
  );

  return {
    total,
    parts: [accuracy, volume, coverage, consistency],
    accuracy,
    volume,
    coverage,
    consistency,
  };
}
