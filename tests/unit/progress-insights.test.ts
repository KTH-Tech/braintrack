/**
 * Unit tests for the learner Progress page's reasoning
 * (client/src/lib/progress-insights.ts).
 *
 * The theme throughout: the page must not claim more than the data supports.
 * A missing onboarding mark is not a baseline of zero; an untouched subject is
 * not a failing subject; and a learner with no attempts gets a runway, not a
 * wall of zeros.
 */
import { describe, it, expect } from "vitest";
import {
  type ProgressStats,
  type SubjectProgress,
  hasAnyActivity,
  summariseActivity,
  dayAccuracy,
  splitSubjects,
  improvementOf,
  pickFocusSubjects,
  pickNextMove,
  accuracyHex,
  BAND_STRONG,
  BAND_OK,
  BAND_WEAK,
  BAND_IDLE,
} from "../../client/src/lib/progress-insights";

function subject(over: Partial<SubjectProgress> = {}): SubjectProgress {
  return {
    subjectId: 1,
    subjectName: "Mathematics",
    accuracy: 0,
    questionsAttempted: 0,
    papersCompleted: 0,
    ...over,
  };
}

function stats(over: Partial<ProgressStats> = {}): ProgressStats {
  return {
    overallAccuracy: 0,
    studyStreak: 0,
    totalQuestionsAttempted: 0,
    totalPapersCompleted: 0,
    subjectProgress: [],
    weakTopics: [],
    recentActivity: [],
    ...over,
  };
}

describe("hasAnyActivity", () => {
  it("is false for a brand-new learner — the launch-day default", () => {
    expect(hasAnyActivity(stats())).toBe(false);
    expect(hasAnyActivity(null)).toBe(false);
    expect(hasAnyActivity(undefined)).toBe(false);
  });

  it("is false when subjects exist but none has been touched", () => {
    expect(hasAnyActivity(stats({
      subjectProgress: [subject({ subjectId: 1 }), subject({ subjectId: 2 })],
    }))).toBe(false);
  });

  it("is true on the headline counters", () => {
    expect(hasAnyActivity(stats({ totalQuestionsAttempted: 4 }))).toBe(true);
    expect(hasAnyActivity(stats({ totalPapersCompleted: 1 }))).toBe(true);
  });

  it("is true on subject counters even when the headline total lags behind", () => {
    // user_progress and the headline totals are separate counters server-side
    // and can drift; a learner with subject activity must not see a blank slate.
    expect(hasAnyActivity(stats({
      totalQuestionsAttempted: 0,
      subjectProgress: [subject({ questionsAttempted: 7 })],
    }))).toBe(true);
  });
});

describe("summariseActivity", () => {
  const series = [
    { date: "2026-07-01", questionsAnswered: 0, correctAnswers: 0 },
    { date: "2026-07-02", questionsAnswered: 10, correctAnswers: 7 },
    { date: "2026-07-03", questionsAnswered: 5, correctAnswers: 3 },
    { date: "2026-07-04", questionsAnswered: 0, correctAnswers: 0 },
  ];

  it("totals questions, correct answers and accuracy over the window", () => {
    const s = summariseActivity(series);
    expect(s.totalQuestions).toBe(15);
    expect(s.totalCorrect).toBe(10);
    expect(s.accuracy).toBe(67); // 10/15 → 66.67 → 67
  });

  it("counts only days with answers as active, and reports the window length", () => {
    const s = summariseActivity(series);
    expect(s.activeDays).toBe(2);
    expect(s.windowDays).toBe(4);
  });

  it("reports the learner's best single day (used to scale the bar chart)", () => {
    expect(summariseActivity(series).bestDay).toBe(10);
  });

  it("returns zeros — not NaN — for an empty or missing series", () => {
    for (const s of [summariseActivity([]), summariseActivity(null), summariseActivity(undefined)]) {
      expect(s.totalQuestions).toBe(0);
      expect(s.accuracy).toBe(0);
      expect(s.activeDays).toBe(0);
      expect(s.bestDay).toBe(0);
    }
  });

  it("ignores negative counts rather than subtracting from the totals", () => {
    const s = summariseActivity([{ date: "2026-07-01", questionsAnswered: -3, correctAnswers: -1 }]);
    expect(s.totalQuestions).toBe(0);
    expect(s.activeDays).toBe(0);
  });
});

describe("dayAccuracy", () => {
  it("returns null for a day with no answers so the UI can show a gap", () => {
    expect(dayAccuracy({ date: "d", questionsAnswered: 0, correctAnswers: 0 })).toBeNull();
  });

  it("rounds a real day", () => {
    expect(dayAccuracy({ date: "d", questionsAnswered: 3, correctAnswers: 2 })).toBe(67);
    expect(dayAccuracy({ date: "d", questionsAnswered: 4, correctAnswers: 4 })).toBe(100);
  });
});

describe("splitSubjects", () => {
  it("separates worked-on subjects from untouched ones", () => {
    const { started, notStarted } = splitSubjects([
      subject({ subjectId: 1, questionsAttempted: 12 }),
      subject({ subjectId: 2, questionsAttempted: 0 }),
      subject({ subjectId: 3, questionsAttempted: 1 }),
    ]);
    expect(started.map(s => s.subjectId)).toEqual([1, 3]);
    expect(notStarted.map(s => s.subjectId)).toEqual([2]);
  });

  it("handles a missing list", () => {
    expect(splitSubjects(null)).toEqual({ started: [], notStarted: [] });
  });
});

describe("improvementOf", () => {
  it("returns the delta against a real self-reported onboarding mark", () => {
    expect(improvementOf(subject({ accuracy: 72, initialMark: 55 }))).toBe(17);
    expect(improvementOf(subject({ accuracy: 41, initialMark: 60 }))).toBe(-19);
  });

  it("returns null when no mark was captured — a missing baseline is not zero", () => {
    // Treating an absent mark as 0 would show every learner a flattering
    // "+64%" they never earned.
    expect(improvementOf(subject({ accuracy: 64 }))).toBeNull();
    expect(improvementOf(subject({ accuracy: 64, initialMark: 0 }))).toBeNull();
  });
});

describe("pickFocusSubjects", () => {
  it("returns under-target subjects weakest first", () => {
    const picked = pickFocusSubjects([
      subject({ subjectId: 1, accuracy: 65, questionsAttempted: 10 }),
      subject({ subjectId: 2, accuracy: 30, questionsAttempted: 10 }),
      subject({ subjectId: 3, accuracy: 88, questionsAttempted: 10 }),
    ]);
    expect(picked.map(s => s.subjectId)).toEqual([2, 1]);
  });

  it("won't brand a subject weak off a single unlucky answer", () => {
    expect(pickFocusSubjects([subject({ accuracy: 0, questionsAttempted: 1 })])).toEqual([]);
  });

  it("excludes untouched subjects entirely", () => {
    expect(pickFocusSubjects([subject({ accuracy: 0, questionsAttempted: 0 })])).toEqual([]);
  });

  it("respects the limit", () => {
    const many = [1, 2, 3, 4, 5, 6].map(i =>
      subject({ subjectId: i, accuracy: 10 + i, questionsAttempted: 10 }));
    expect(pickFocusSubjects(many)).toHaveLength(4);
    expect(pickFocusSubjects(many, { limit: 2 })).toHaveLength(2);
  });
});

describe("pickNextMove", () => {
  it("tells a brand-new learner to start", () => {
    expect(pickNextMove(stats()).kind).toBe("start");
    expect(pickNextMove(null).kind).toBe("start");
  });

  it("asks for a baseline before reading anything into a handful of answers", () => {
    const move = pickNextMove(stats({
      totalQuestionsAttempted: 4,
      subjectProgress: [subject({ accuracy: 25, questionsAttempted: 4 })],
    }));
    expect(move.kind).toBe("build_baseline");
  });

  it("names the weakest started subject once there's enough evidence", () => {
    const move = pickNextMove(stats({
      totalQuestionsAttempted: 40,
      subjectProgress: [
        subject({ subjectId: 1, subjectName: "Mathematics", accuracy: 80, questionsAttempted: 20 }),
        subject({ subjectId: 2, subjectName: "Physical Sciences", accuracy: 44, questionsAttempted: 20 }),
      ],
    }));
    expect(move).toMatchObject({ kind: "practise_weakest", subjectId: 2, subjectName: "Physical Sciences", accuracy: 44 });
  });

  it("suggests widening when everything started is healthy but subjects remain", () => {
    const move = pickNextMove(stats({
      totalQuestionsAttempted: 40,
      subjectProgress: [
        subject({ subjectId: 1, accuracy: 85, questionsAttempted: 40 }),
        subject({ subjectId: 2, subjectName: "Accounting", accuracy: 0, questionsAttempted: 0 }),
      ],
    }));
    expect(move).toMatchObject({ kind: "widen", subjectId: 2, subjectName: "Accounting" });
  });

  it("falls back to holding the streak when everything is started and healthy", () => {
    const move = pickNextMove(stats({
      totalQuestionsAttempted: 60,
      subjectProgress: [
        subject({ subjectId: 1, accuracy: 85, questionsAttempted: 30 }),
        subject({ subjectId: 2, accuracy: 78, questionsAttempted: 30 }),
      ],
    }));
    expect(move.kind).toBe("keep_going");
  });

  it("never recommends a subject the learner has barely touched", () => {
    const move = pickNextMove(stats({
      totalQuestionsAttempted: 30,
      subjectProgress: [
        subject({ subjectId: 1, accuracy: 90, questionsAttempted: 29 }),
        subject({ subjectId: 2, subjectName: "Barely", accuracy: 0, questionsAttempted: 1 }),
      ],
    }));
    expect(move.kind).not.toBe("practise_weakest");
  });
});

describe("accuracyHex", () => {
  it("bands accuracy onto full-opacity palette colours (no grey)", () => {
    expect(accuracyHex(90)).toBe(BAND_STRONG);
    expect(accuracyHex(70)).toBe(BAND_STRONG);
    expect(accuracyHex(69)).toBe(BAND_OK);
    expect(accuracyHex(50)).toBe(BAND_OK);
    expect(accuracyHex(49)).toBe(BAND_WEAK);
    expect(accuracyHex(0)).toBe(BAND_WEAK);
  });

  it("uses the neutral blue for an unmeasured day rather than a failing red", () => {
    expect(accuracyHex(null)).toBe(BAND_IDLE);
    expect(accuracyHex(undefined)).toBe(BAND_IDLE);
  });
});
