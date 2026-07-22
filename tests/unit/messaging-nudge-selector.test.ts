/**
 * Unit tests for the nudge-cron selector.
 *
 * `selectNudgesForRun` is the pure decision function that says "on this run,
 * these (user, template) pairs are due". It's the piece that would cause a
 * parent to get the day-3 nudge on day 2 or the day-12 nudge on day 13, so
 * the day-boundary behaviour is worth pinning down.
 *
 * We deliberately avoid the DB layer here — `runNudgeCron` is exercised at
 * integration time. Selector is pure input → output.
 */
import { describe, it, expect } from "vitest";
import {
  selectNudgesForRun,
  sastDaysSince,
  type TrialRow,
} from "../../server/messaging/nudge-cron";

// SAST is UTC+2. Anchor everything at 2026-07-20T10:00:00Z (which is
// 12:00 SAST — safely mid-day so the day boundary is unambiguous).
const NOW = new Date("2026-07-20T10:00:00Z");
const D = (isoDate: string, timeUtc = "10:00:00") => new Date(`${isoDate}T${timeUtc}Z`);

function trial(over: Partial<TrialRow>): TrialRow {
  return {
    userId: "u1",
    trialStartedAt: null,
    trialEndsAt: null,
    status: "trial",
    parentCell: "+27821234567",
    learnerCell: "+27821111111",
    ...over,
  };
}

describe("sastDaysSince", () => {
  it("counts calendar days in SAST, not raw hours", () => {
    // Trial started 2026-07-17 23:00 UTC = 2026-07-18 01:00 SAST → day 1 by 2026-07-19 SAST midnight
    const start = new Date("2026-07-17T23:00:00Z");
    // On 2026-07-20 10:00 UTC = 12:00 SAST, that's 2 SAST-calendar days later.
    expect(sastDaysSince(start, NOW)).toBe(2);
  });

  it("returns 0 when the trial started earlier today (SAST)", () => {
    // Trial started 2026-07-20 06:00 SAST → same SAST day as NOW
    const start = new Date("2026-07-20T04:00:00Z"); // 06:00 SAST
    expect(sastDaysSince(start, NOW)).toBe(0);
  });

  it("crosses the SAST midnight boundary correctly", () => {
    // Trial started 2026-07-19 23:59 SAST (2026-07-19T21:59Z), now = 2026-07-20 00:01 SAST
    // (2026-07-19T22:01Z). Different SAST calendar days → 1 day.
    const start = new Date("2026-07-19T21:59:00Z");
    const now = new Date("2026-07-19T22:01:00Z");
    expect(sastDaysSince(start, now)).toBe(1);
  });
});

describe("selectNudgesForRun — day boundaries", () => {
  it("emits day_3_youre_rolling on day 3 exactly", () => {
    const trials = [trial({ userId: "u-day3", trialStartedAt: D("2026-07-17") })];
    const out = selectNudgesForRun(trials, NOW);
    expect(out.map(o => o.templateKey)).toEqual(["day_3_youre_rolling"]);
    expect(out[0].userId).toBe("u-day3");
  });

  it("emits day_7_checkpoint on day 7 exactly", () => {
    const trials = [trial({ userId: "u-day7", trialStartedAt: D("2026-07-13") })];
    const out = selectNudgesForRun(trials, NOW);
    expect(out.map(o => o.templateKey)).toEqual(["day_7_checkpoint"]);
  });

  it("emits day_12_two_days_left on day 12 exactly", () => {
    const trials = [trial({ userId: "u-day12", trialStartedAt: D("2026-07-08") })];
    const out = selectNudgesForRun(trials, NOW);
    expect(out.map(o => o.templateKey)).toEqual(["day_12_two_days_left"]);
  });

  it("emits nothing on day 2, 4, 6, 8, 11, 13 — no wrong-day nudges", () => {
    const startDates = [
      D("2026-07-18"), // day 2
      D("2026-07-16"), // day 4
      D("2026-07-14"), // day 6
      D("2026-07-12"), // day 8
      D("2026-07-09"), // day 11
      D("2026-07-07"), // day 13
    ];
    for (const start of startDates) {
      const trials = [trial({ userId: "u", trialStartedAt: start })];
      const out = selectNudgesForRun(trials, NOW);
      expect(out).toEqual([]);
    }
  });

  it("emits nothing on day 0 or beyond day 14 (out of nudge window)", () => {
    const day0 = [trial({ userId: "u", trialStartedAt: D("2026-07-20") })];
    const day20 = [trial({ userId: "u", trialStartedAt: D("2026-06-30") })];
    expect(selectNudgesForRun(day0, NOW)).toEqual([]);
    expect(selectNudgesForRun(day20, NOW)).toEqual([]);
  });
});

describe("selectNudgesForRun — status gate", () => {
  it("skips non-trial subscriptions on day-3 exact", () => {
    const trials = [
      trial({ userId: "u-active", trialStartedAt: D("2026-07-17"), status: "active" }),
      trial({ userId: "u-lapsed", trialStartedAt: D("2026-07-17"), status: "lapsed" }),
      trial({ userId: "u-grace",  trialStartedAt: D("2026-07-17"), status: "grace" }),
    ];
    expect(selectNudgesForRun(trials, NOW)).toEqual([]);
  });

  it("accepts both 'trial' and 'trialing' status", () => {
    const trials = [
      trial({ userId: "u-t",   trialStartedAt: D("2026-07-17"), status: "trial" }),
      trial({ userId: "u-ing", trialStartedAt: D("2026-07-17"), status: "trialing" }),
    ];
    const out = selectNudgesForRun(trials, NOW);
    expect(out.map(o => o.userId).sort()).toEqual(["u-ing", "u-t"]);
  });
});

describe("selectNudgesForRun — trial start fallback", () => {
  it("uses trial_started_at when set", () => {
    const trials = [trial({
      userId: "u-explicit",
      trialStartedAt: D("2026-07-17"),
      trialEndsAt: D("2026-07-31"),
    })];
    const out = selectNudgesForRun(trials, NOW);
    expect(out.map(o => o.templateKey)).toEqual(["day_3_youre_rolling"]);
  });

  it("falls back to trialEndsAt - 14 days for legacy rows", () => {
    // trialEndsAt = 2026-07-31 (day 14 hits on 2026-07-31 SAST for start 2026-07-17)
    const trials = [trial({
      userId: "u-legacy",
      trialStartedAt: null,
      trialEndsAt: D("2026-07-31"),
    })];
    const out = selectNudgesForRun(trials, NOW);
    expect(out.map(o => o.templateKey)).toEqual(["day_3_youre_rolling"]);
  });

  it("emits nothing when neither trial_started_at nor trial_ends_at is set", () => {
    const trials = [trial({
      userId: "u-nothing",
      trialStartedAt: null,
      trialEndsAt: null,
    })];
    expect(selectNudgesForRun(trials, NOW)).toEqual([]);
  });
});

describe("selectNudgesForRun — multi-user roster", () => {
  it("returns the right template per user for a mixed-day roster", () => {
    const trials = [
      trial({ userId: "day3-a", trialStartedAt: D("2026-07-17") }),
      trial({ userId: "day7-a", trialStartedAt: D("2026-07-13") }),
      trial({ userId: "day12-a", trialStartedAt: D("2026-07-08") }),
      trial({ userId: "day4-noop", trialStartedAt: D("2026-07-16") }),
      trial({ userId: "day3-b-lapsed", trialStartedAt: D("2026-07-17"), status: "lapsed" }),
    ];
    const out = selectNudgesForRun(trials, NOW);
    const byUser = new Map(out.map(o => [o.userId, o.templateKey]));
    expect(byUser.get("day3-a")).toBe("day_3_youre_rolling");
    expect(byUser.get("day7-a")).toBe("day_7_checkpoint");
    expect(byUser.get("day12-a")).toBe("day_12_two_days_left");
    expect(byUser.has("day4-noop")).toBe(false);
    expect(byUser.has("day3-b-lapsed")).toBe(false);
    expect(out.length).toBe(3);
  });
});
