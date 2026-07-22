/**
 * Unit tests for the Progress-page readiness composite.
 *
 * The composite is what the learner sees at the top of Progress, so it must
 * degrade honestly:
 *   • With no attempts, every part is zero — no flattering baseline.
 *   • With attempts but zero coverage of enrolled subjects, the coverage part
 *     is zero rather than 100 from a divide-by-zero shortcut.
 *   • With a runaway single input (100% accuracy on 1 question), the composite
 *     stays capped by the OTHER inputs — no learner should score 100% ready
 *     off a single lucky answer.
 *
 * The legacy `calcReadiness` (dashboard + parent + calendar + study plan) is
 * exercised separately because its formula is frozen by that e2e spec.
 */
import { describe, it, expect } from "vitest";
import {
  calcReadiness,
  calcReadinessBreakdown,
  readinessBand,
  readinessBandLabel,
} from "../../client/src/lib/readiness";

describe("calcReadiness — legacy 3-part score used by dashboard/etc.", () => {
  it("is zero for a brand-new learner", () => {
    expect(calcReadiness({ accuracy: 0, studyStreak: 0, questionsAnswered: 0 })).toBe(0);
    expect(calcReadiness(null)).toBe(0);
    expect(calcReadiness(undefined)).toBe(0);
  });

  it("caps at 100 no matter how large the inputs get", () => {
    expect(calcReadiness({ accuracy: 100, studyStreak: 30, questionsAnswered: 9999 })).toBe(100);
  });

  it("gives partial credit for a 1-2 day streak (weight = 15)", () => {
    // acc part 0.3*80 = 24, questions part 105/3 = 35, streak 15 → 74
    expect(calcReadiness({ accuracy: 80, studyStreak: 1, questionsAnswered: 105 })).toBe(74);
  });
});

describe("calcReadinessBreakdown — the honest Progress-page composite", () => {
  it("is all zeros for a brand-new learner", () => {
    const b = calcReadinessBreakdown({
      accuracy: 0, questionsAnswered: 0,
      subjectsEnrolled: 0, subjectsStarted: 0, studyStreak: 0,
    });
    expect(b.total).toBe(0);
    for (const p of b.parts) {
      expect(p.value).toBe(0);
      expect(p.empty).toBe(true);
    }
  });

  it("gives no accuracy credit before any questions are attempted, even at 100%", () => {
    // Freshly registered learner whose accuracy defaults to 100 (no attempts
    // yet → 0/0 → server treats as 0, but be paranoid) should not score
    // 30 points on accuracy from a garbage input.
    const b = calcReadinessBreakdown({
      accuracy: 100, questionsAnswered: 0,
      subjectsEnrolled: 6, subjectsStarted: 0, studyStreak: 0,
    });
    expect(b.accuracy.value).toBe(0);
    expect(b.accuracy.empty).toBe(true);
  });

  it("caps volume at 300 questions (30 pts)", () => {
    const under = calcReadinessBreakdown({
      accuracy: 60, questionsAnswered: 150,
      subjectsEnrolled: 6, subjectsStarted: 6, studyStreak: 7,
    });
    const over = calcReadinessBreakdown({
      accuracy: 60, questionsAnswered: 900,
      subjectsEnrolled: 6, subjectsStarted: 6, studyStreak: 7,
    });
    // 150/300 * 30 = 15 pts
    expect(under.volume.value).toBe(15);
    // Beyond 300 is still 30 pts, not more.
    expect(over.volume.value).toBe(30);
  });

  it("scales coverage against subjects the learner is actually writing", () => {
    // 3 of 6 subjects started → 3/6 * 25 = 12.5
    const half = calcReadinessBreakdown({
      accuracy: 0, questionsAnswered: 0,
      subjectsEnrolled: 6, subjectsStarted: 3, studyStreak: 0,
    });
    expect(half.coverage.value).toBe(12.5);
    expect(half.coverage.raw).toBe(50);
  });

  it("returns coverage 0 when no subjects are enrolled (no divide-by-zero flattery)", () => {
    const b = calcReadinessBreakdown({
      accuracy: 90, questionsAnswered: 50,
      subjectsEnrolled: 0, subjectsStarted: 0, studyStreak: 3,
    });
    expect(b.coverage.value).toBe(0);
    expect(b.coverage.empty).toBe(true);
  });

  it("clamps subjectsStarted to subjectsEnrolled — no >100% coverage from bad data", () => {
    const b = calcReadinessBreakdown({
      accuracy: 60, questionsAnswered: 60,
      subjectsEnrolled: 4, subjectsStarted: 9, studyStreak: 0,
    });
    expect(b.coverage.value).toBe(25);
    expect(b.coverage.raw).toBe(100);
  });

  it("caps consistency at a 7-day streak (15 pts)", () => {
    const week = calcReadinessBreakdown({
      accuracy: 0, questionsAnswered: 0,
      subjectsEnrolled: 6, subjectsStarted: 0, studyStreak: 7,
    });
    const twoWeeks = calcReadinessBreakdown({
      accuracy: 0, questionsAnswered: 0,
      subjectsEnrolled: 6, subjectsStarted: 0, studyStreak: 14,
    });
    expect(week.consistency.value).toBe(15);
    expect(twoWeeks.consistency.value).toBe(15);
  });

  it("caps the composite at 100 for a maxed-out learner", () => {
    const max = calcReadinessBreakdown({
      accuracy: 100, questionsAnswered: 9999,
      subjectsEnrolled: 6, subjectsStarted: 6, studyStreak: 30,
    });
    expect(max.total).toBe(100);
  });

  it("weights the four parts to exactly 100 (30+30+25+15)", () => {
    expect(calcReadinessBreakdown({
      accuracy: 100, questionsAnswered: 999,
      subjectsEnrolled: 6, subjectsStarted: 6, studyStreak: 7,
    }).total).toBe(100);
    // The individual caps sum to 100
    const parts = calcReadinessBreakdown({
      accuracy: 100, questionsAnswered: 999,
      subjectsEnrolled: 6, subjectsStarted: 6, studyStreak: 7,
    }).parts;
    expect(parts.reduce((s, p) => s + p.cap, 0)).toBe(100);
  });

  it("produces a realistic score for the demo learner (~63% acc, 145 qs, 5/5 subjects, streak 9)", () => {
    // Baseline sanity check against the real demo profile.
    //   accuracy    63 * 0.3        = 18.9
    //   volume      (145/300) * 30  = 14.5
    //   coverage    (5/5)  * 25     = 25
    //   consistency capped          = 15
    //   total ≈ 73.4 → 73
    const b = calcReadinessBreakdown({
      accuracy: 63, questionsAnswered: 145,
      subjectsEnrolled: 5, subjectsStarted: 5, studyStreak: 9,
    });
    expect(b.total).toBeGreaterThanOrEqual(70);
    expect(b.total).toBeLessThanOrEqual(76);
    expect(b.accuracy.empty).toBe(false);
    expect(b.coverage.raw).toBe(100);
  });

  it("handles null/undefined without exploding", () => {
    for (const b of [calcReadinessBreakdown(null), calcReadinessBreakdown(undefined), calcReadinessBreakdown({})]) {
      expect(b.total).toBe(0);
      expect(b.parts).toHaveLength(4);
      expect(b.parts.map(p => p.key)).toEqual(["accuracy", "volume", "coverage", "consistency"]);
    }
  });

  it("keeps a single lucky-answer learner far from 'Good'", () => {
    // 100% acc on 1 question, one streak day, 1 of 6 subjects started.
    //   accuracy   100*0.3      = 30
    //   volume     (1/300)*30   = 0.1
    //   coverage   (1/6)*25     ≈ 4.2
    //   consistency (1/7)*15    ≈ 2.1
    //   total ≈ 36 → not green.
    const b = calcReadinessBreakdown({
      accuracy: 100, questionsAnswered: 1,
      subjectsEnrolled: 6, subjectsStarted: 1, studyStreak: 1,
    });
    expect(b.total).toBeLessThan(55);
    expect(readinessBand(b.total)).not.toBe("green");
  });
});

describe("readinessBand / readinessBandLabel", () => {
  it("thresholds at 75 / 55", () => {
    expect(readinessBand(75)).toBe("green");
    expect(readinessBand(74)).toBe("amber");
    expect(readinessBand(55)).toBe("amber");
    expect(readinessBand(54)).toBe("red");
    expect(readinessBand(0)).toBe("red");
  });
  it("localises labels", () => {
    expect(readinessBandLabel(80, false)).toBe("Good");
    expect(readinessBandLabel(80, true)).toBe("Goed");
    expect(readinessBandLabel(60, false)).toBe("Fair");
    expect(readinessBandLabel(60, true)).toBe("Matig");
    expect(readinessBandLabel(20, false)).toBe("Weak");
    expect(readinessBandLabel(20, true)).toBe("Swak");
  });
});
