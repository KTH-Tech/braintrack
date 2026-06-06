import { describe, it, expect, beforeEach } from "vitest";

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(k: string) { return this.store.has(k) ? this.store.get(k)! : null; }
  setItem(k: string, v: string) { this.store.set(k, String(v)); }
  removeItem(k: string) { this.store.delete(k); }
  clear() { this.store.clear(); }
}

(globalThis as any).localStorage = new MemoryStorage();
(globalThis as any).window = { localStorage: (globalThis as any).localStorage };
(globalThis as any).fetch = async () => ({ ok: true });

let tracker: typeof import("../../client/src/lib/quiz-session-tracker");

beforeEach(async () => {
  (globalThis as any).localStorage = new MemoryStorage();
  (globalThis as any).window.localStorage = (globalThis as any).localStorage;
  tracker = await import("../../client/src/lib/quiz-session-tracker");
  tracker.__ratingPromptTestHarness.reset();
});

describe("Rating prompt 60-day cooldown", () => {
  it("does not show prompt before threshold sessions", () => {
    for (let i = 0; i < 4; i++) tracker.incrementQuizSessionCount();
    expect(tracker.shouldShowRatingPrompt()).toBe(false);
  });

  it("shows prompt at threshold sessions", () => {
    for (let i = 0; i < 5; i++) tracker.incrementQuizSessionCount();
    expect(tracker.shouldShowRatingPrompt()).toBe(true);
  });

  it("suppresses prompt for 60 days after dismissal even if session threshold met again", () => {
    for (let i = 0; i < 5; i++) tracker.incrementQuizSessionCount();
    expect(tracker.shouldShowRatingPrompt()).toBe(true);

    tracker.dismissRatingPrompt(false);
    expect(tracker.shouldShowRatingPrompt()).toBe(false);

    for (let i = 0; i < 10; i++) tracker.incrementQuizSessionCount();
    expect(tracker.shouldShowRatingPrompt()).toBe(false);

    tracker.__ratingPromptTestHarness.advanceDays(30);
    expect(tracker.shouldShowRatingPrompt()).toBe(false);

    tracker.__ratingPromptTestHarness.advanceDays(29);
    expect(tracker.shouldShowRatingPrompt()).toBe(false);
  });

  it("re-enables prompt after 60-day cooldown elapses (and session threshold met)", () => {
    for (let i = 0; i < 5; i++) tracker.incrementQuizSessionCount();
    tracker.dismissRatingPrompt(false);
    for (let i = 0; i < 5; i++) tracker.incrementQuizSessionCount();

    tracker.__ratingPromptTestHarness.advanceDays(61);
    expect(tracker.shouldShowRatingPrompt()).toBe(true);
  });

  it("never re-shows prompt after permanent dismissal, even after 60+ days", () => {
    for (let i = 0; i < 5; i++) tracker.incrementQuizSessionCount();
    tracker.dismissRatingPrompt(true);

    tracker.__ratingPromptTestHarness.advanceDays(120);
    for (let i = 0; i < 50; i++) tracker.incrementQuizSessionCount();
    expect(tracker.shouldShowRatingPrompt()).toBe(false);
  });

  it("records dismissal timestamp via clock override", () => {
    const fakeNow = Date.UTC(2026, 0, 1);
    tracker.__ratingPromptTestHarness.setClockOverride(fakeNow);
    for (let i = 0; i < 5; i++) tracker.incrementQuizSessionCount();
    tracker.dismissRatingPrompt(false);
    expect(tracker.__ratingPromptTestHarness.getDismissedAt()).toBe(fakeNow);
  });

  it("exposes 60-day cooldown constant", () => {
    expect(tracker.__ratingPromptTestHarness.getCooldownDays()).toBe(60);
  });
});

describe("Rating prompt milestone triggers", () => {
  it("does NOT trigger on first_quiz alone (one quiz is too little engagement)", () => {
    tracker.incrementQuizSessionCount();
    expect(tracker.shouldShowRatingPrompt()).toBe(false);
  });

  it("triggers on seven_day_streak even before 5-session threshold", () => {
    for (let i = 0; i < 3; i++) tracker.incrementQuizSessionCount();
    expect(tracker.shouldShowRatingPrompt()).toBe(false);

    tracker.recordMilestone("seven_day_streak");
    expect(tracker.shouldShowRatingPrompt()).toBe(true);
  });

  it("triggers on first_exam_session even with zero quiz sessions", () => {
    expect(tracker.shouldShowRatingPrompt()).toBe(false);

    tracker.recordMilestone("first_exam_session");
    expect(tracker.shouldShowRatingPrompt()).toBe(true);
  });

  it("milestone trigger still respects 60-day cooldown after dismissal", () => {
    tracker.recordMilestone("seven_day_streak");
    expect(tracker.shouldShowRatingPrompt()).toBe(true);

    tracker.dismissRatingPrompt(false);
    expect(tracker.shouldShowRatingPrompt()).toBe(false);

    tracker.recordMilestone("first_exam_session");
    expect(tracker.shouldShowRatingPrompt()).toBe(false);

    tracker.__ratingPromptTestHarness.advanceDays(30);
    expect(tracker.shouldShowRatingPrompt()).toBe(false);
  });

  it("new milestone re-triggers prompt after cooldown elapses", () => {
    tracker.recordMilestone("seven_day_streak");
    tracker.dismissRatingPrompt(false);

    tracker.__ratingPromptTestHarness.advanceDays(61);
    tracker.recordMilestone("first_exam_session");
    expect(tracker.shouldShowRatingPrompt()).toBe(true);
  });

  it("same milestone does not re-trigger prompt after it was already shown and dismissed", () => {
    tracker.recordMilestone("seven_day_streak");
    expect(tracker.shouldShowRatingPrompt()).toBe(true);
    tracker.dismissRatingPrompt(false);

    tracker.__ratingPromptTestHarness.advanceDays(61);
    expect(tracker.shouldShowRatingPrompt()).toBe(false);
  });

  it("permanent dismissal beats milestone triggers", () => {
    tracker.recordMilestone("seven_day_streak");
    tracker.dismissRatingPrompt(true);

    tracker.__ratingPromptTestHarness.advanceDays(120);
    tracker.recordMilestone("first_exam_session");
    expect(tracker.shouldShowRatingPrompt()).toBe(false);
  });
});
