const QUIZ_SESSIONS_KEY = "braintrack-quiz-sessions";
const RATING_DISMISSED_KEY = "braintrack-rating-dismissed";
const RATING_DISMISSED_AT_KEY = "braintrack-rating-dismissed-at";
const RATING_CLOCK_OVERRIDE_KEY = "braintrack-rating-clock-override";
const RATING_MILESTONES_KEY = "braintrack-rating-milestones";
const RATING_SHOWN_FOR_KEY = "braintrack-rating-shown-for";
const RATING_THRESHOLD = 5;
const COOLDOWN_DAYS = 60;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export type RatingMilestone =
  | "first_quiz"
  | "five_quizzes"
  | "seven_day_streak"
  | "first_exam_session";

const ALL_MILESTONES: RatingMilestone[] = [
  "first_quiz",
  "five_quizzes",
  "seven_day_streak",
  "first_exam_session",
];

const PROMPT_TRIGGERING_MILESTONES: RatingMilestone[] = [
  "five_quizzes",
  "seven_day_streak",
  "first_exam_session",
];

function readSet(key: string): Set<RatingMilestone> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((m): m is RatingMilestone => ALL_MILESTONES.includes(m)));
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<RatingMilestone>): void {
  localStorage.setItem(key, JSON.stringify(Array.from(set)));
}

export function getQuizSessionCount(): number {
  const val = localStorage.getItem(QUIZ_SESSIONS_KEY);
  return val ? parseInt(val, 10) : 0;
}

export function incrementQuizSessionCount(): number {
  const current = getQuizSessionCount();
  const next = current + 1;
  localStorage.setItem(QUIZ_SESSIONS_KEY, String(next));
  if (next === 1) recordMilestone("first_quiz");
  if (next >= RATING_THRESHOLD) recordMilestone("five_quizzes");
  return next;
}

export function recordMilestone(milestone: RatingMilestone): boolean {
  const reached = readSet(RATING_MILESTONES_KEY);
  if (reached.has(milestone)) return false;
  reached.add(milestone);
  writeSet(RATING_MILESTONES_KEY, reached);
  return true;
}

function getPendingMilestone(): RatingMilestone | null {
  const reached = readSet(RATING_MILESTONES_KEY);
  const shown = readSet(RATING_SHOWN_FOR_KEY);
  for (const m of PROMPT_TRIGGERING_MILESTONES) {
    if (reached.has(m) && !shown.has(m)) return m;
  }
  return null;
}

function getNow(): number {
  const override = localStorage.getItem(RATING_CLOCK_OVERRIDE_KEY);
  if (override) {
    const parsed = parseInt(override, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return Date.now();
}

export function shouldShowRatingPrompt(): boolean {
  const dismissed = localStorage.getItem(RATING_DISMISSED_KEY);
  if (dismissed === "permanent") return false;

  const dismissedAtRaw = localStorage.getItem(RATING_DISMISSED_AT_KEY);
  if (dismissedAtRaw) {
    const dismissedAt = parseInt(dismissedAtRaw, 10);
    if (!isNaN(dismissedAt)) {
      const elapsed = getNow() - dismissedAt;
      if (elapsed < COOLDOWN_MS) return false;
    }
  }

  const pending = getPendingMilestone();
  const count = getQuizSessionCount();

  if (pending !== null) return true;

  if (!dismissed) {
    return count >= RATING_THRESHOLD;
  }

  const nextThreshold = parseInt(dismissed, 10);
  if (Number.isFinite(nextThreshold) && count >= nextThreshold) return true;

  return false;
}

export function dismissRatingPrompt(permanent: boolean): void {
  const reached = readSet(RATING_MILESTONES_KEY);
  writeSet(RATING_SHOWN_FOR_KEY, reached);

  if (permanent) {
    localStorage.setItem(RATING_DISMISSED_KEY, "permanent");
    localStorage.setItem(RATING_DISMISSED_AT_KEY, String(getNow()));
    persistRatingDismissedToServer(true);
  } else {
    const nextThreshold = getQuizSessionCount() + RATING_THRESHOLD;
    localStorage.setItem(RATING_DISMISSED_KEY, String(nextThreshold));
    localStorage.setItem(RATING_DISMISSED_AT_KEY, String(getNow()));
  }
}

export function persistRatingDismissedToServer(permanent: boolean): void {
  fetch("/api/user/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ratingPromptDismissed: permanent }),
  }).catch(() => {});
}

export function restoreRatingStateFromServer(
  prefs: { ratingPromptDismissed?: boolean } | null
): void {
  if (prefs?.ratingPromptDismissed) {
    localStorage.setItem(RATING_DISMISSED_KEY, "permanent");
  }
}

export const __ratingPromptTestHarness = {
  setClockOverride(timestampMs: number | null): void {
    if (timestampMs === null) {
      localStorage.removeItem(RATING_CLOCK_OVERRIDE_KEY);
    } else {
      localStorage.setItem(RATING_CLOCK_OVERRIDE_KEY, String(timestampMs));
    }
  },
  advanceDays(days: number): void {
    const base = getNow();
    localStorage.setItem(
      RATING_CLOCK_OVERRIDE_KEY,
      String(base + days * 24 * 60 * 60 * 1000)
    );
  },
  getDismissedAt(): number | null {
    const raw = localStorage.getItem(RATING_DISMISSED_AT_KEY);
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? null : parsed;
  },
  getCooldownDays(): number {
    return COOLDOWN_DAYS;
  },
  reset(): void {
    localStorage.removeItem(RATING_DISMISSED_KEY);
    localStorage.removeItem(RATING_DISMISSED_AT_KEY);
    localStorage.removeItem(RATING_CLOCK_OVERRIDE_KEY);
    localStorage.removeItem(QUIZ_SESSIONS_KEY);
    localStorage.removeItem(RATING_MILESTONES_KEY);
    localStorage.removeItem(RATING_SHOWN_FOR_KEY);
  },
};

if (typeof window !== "undefined") {
  (window as unknown as { __ratingPromptTestHarness?: typeof __ratingPromptTestHarness }).__ratingPromptTestHarness =
    __ratingPromptTestHarness;
}
