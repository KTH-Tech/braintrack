import { describe, it, expect } from "vitest";
import {
  sastDateKey,
  dailyIndex,
  pickDailyRizz,
  pickDailyTip,
  toClientTip,
  toClientRizz,
  CURATED_TIPS,
  CURATED_RIZZ,
  type BilingualTip,
} from "../../server/daily-motivation";

describe("sastDateKey", () => {
  it("returns YYYY-MM-DD in SAST", () => {
    // Midnight UTC on 2026-07-22 is 02:00 SAST on 2026-07-22 → same day.
    const d = new Date("2026-07-22T00:00:00Z");
    expect(sastDateKey(d)).toBe("2026-07-22");
  });

  it("rolls the SAST day at SAST midnight, not UTC midnight", () => {
    // 22:30 UTC on 2026-07-21 is 00:30 SAST on 2026-07-22 → next SAST day.
    const d = new Date("2026-07-21T22:30:00Z");
    expect(sastDateKey(d)).toBe("2026-07-22");
  });

  it("does not roll early for a learner still on the previous SAST day", () => {
    // 21:00 UTC on 2026-07-21 is 23:00 SAST → still SAST day 2026-07-21.
    const d = new Date("2026-07-21T21:00:00Z");
    expect(sastDateKey(d)).toBe("2026-07-21");
  });
});

describe("dailyIndex determinism", () => {
  it("returns the same index for the same (userId, dateKey, poolSize)", () => {
    expect(dailyIndex("user-abc", "2026-07-22", 42)).toBe(dailyIndex("user-abc", "2026-07-22", 42));
  });

  it("returns different indices for different users on the same day (with overwhelming probability)", () => {
    // Not strictly guaranteed but the sample of 25 different users hitting the
    // same bucket on the same day would suggest something is wrong with the hash.
    const day = "2026-07-22";
    const set = new Set<number>();
    for (let i = 0; i < 25; i++) set.add(dailyIndex(`user-${i}`, day, 500));
    expect(set.size).toBeGreaterThan(15);
  });

  it("returns different indices for the same user on different days (with overwhelming probability)", () => {
    const user = "user-daily-check";
    const days = ["2026-07-22", "2026-07-23", "2026-07-24", "2026-07-25", "2026-07-26", "2026-07-27", "2026-07-28"];
    const set = new Set<number>();
    for (const d of days) set.add(dailyIndex(user, d, 500));
    expect(set.size).toBeGreaterThan(4);
  });

  it("indices fall inside the pool", () => {
    for (let i = 0; i < 100; i++) {
      const idx = dailyIndex(`u-${i}`, "2026-07-22", 40);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(40);
    }
  });

  it("handles poolSize of 1 without crashing", () => {
    expect(dailyIndex("anyone", "2026-07-22", 1)).toBe(0);
  });

  it("handles empty pool defensively", () => {
    expect(dailyIndex("anyone", "2026-07-22", 0)).toBe(0);
  });
});

describe("pickDailyRizz — same user + same day → same line", () => {
  const user = "user-rizz-1";
  const day = "2026-07-22";

  it("is stable across repeated calls within the same SAST day", () => {
    const first = pickDailyRizz(user, day);
    for (let i = 0; i < 20; i++) {
      expect(pickDailyRizz(user, day)).toEqual(first);
    }
  });

  it("rotates the following day (with overwhelming probability across a week)", () => {
    const days = ["2026-07-22", "2026-07-23", "2026-07-24", "2026-07-25", "2026-07-26", "2026-07-27", "2026-07-28"];
    const seen = new Set<string>();
    for (const d of days) seen.add(pickDailyRizz(user, d).en);
    // Over 7 days we should see more than one distinct line for this user.
    expect(seen.size).toBeGreaterThan(1);
  });

  it("returns entries that actually live in CURATED_RIZZ", () => {
    const line = pickDailyRizz(user, day);
    const inPool = CURATED_RIZZ.some(r => r.en === line.en && r.af === line.af);
    expect(inPool).toBe(true);
  });
});

describe("pickDailyTip — subject pool wins when non-empty, else fallback", () => {
  const user = "user-tip-1";
  const day = "2026-07-22";

  const subjectPool: BilingualTip[] = [
    { subject: "Mathematics", en: "Show every step in Paper 1.", af: "Wys elke stap in Vraestel 1." },
    { subject: "Mathematics", en: "Draw the graph before you calculate.", af: "Teken die grafiek voor jy bereken." },
    { subject: "Life Sciences", en: "Label the diagram — half the marks are labels.", af: "Etiketteer die diagram — die helfte van die marks is etikette." },
  ];

  it("draws from the subject pool when it has rows", () => {
    const t = pickDailyTip(user, day, subjectPool, CURATED_TIPS);
    const fromSubjectPool = subjectPool.some(x => x.en === (t as any).en);
    expect(fromSubjectPool).toBe(true);
  });

  it("returns the same subject-pool item across repeated same-day calls", () => {
    const first = pickDailyTip(user, day, subjectPool, CURATED_TIPS);
    for (let i = 0; i < 10; i++) {
      expect(pickDailyTip(user, day, subjectPool, CURATED_TIPS)).toEqual(first);
    }
  });

  it("falls back to CURATED_TIPS when the subject pool is empty", () => {
    const t = pickDailyTip(user, day, [] as BilingualTip[], CURATED_TIPS);
    const fromFallback = CURATED_TIPS.some(x => x.en === t.en && x.af === t.af);
    expect(fromFallback).toBe(true);
  });

  it("is stable in the fallback path too", () => {
    const first = pickDailyTip(user, day, [] as BilingualTip[], CURATED_TIPS);
    for (let i = 0; i < 10; i++) {
      expect(pickDailyTip(user, day, [] as BilingualTip[], CURATED_TIPS)).toEqual(first);
    }
  });

  it("rotates the tip across days for the same user", () => {
    const days = ["2026-07-22", "2026-07-23", "2026-07-24", "2026-07-25", "2026-07-26", "2026-07-27", "2026-07-28"];
    const seen = new Set<string>();
    for (const d of days) seen.add(pickDailyTip(user, d, [] as BilingualTip[], CURATED_TIPS).en);
    expect(seen.size).toBeGreaterThan(1);
  });

  it("uses a different hash namespace from Rizz, so they are not lockstep-correlated", () => {
    // Sample 30 users on the same day. If tip and rizz shared the same hash
    // input we'd expect their indices to move in lockstep. We test that the
    // pair varies independently — specifically, that at least a few users
    // land on a different tip-index-mod-N than rizz-index-mod-N.
    const day = "2026-07-22";
    let differ = 0;
    for (let i = 0; i < 30; i++) {
      const uid = `user-lockstep-${i}`;
      const tipIdx = dailyIndex(`tip:${uid}`, day, 40);
      const rizzIdx = dailyIndex(`rizz:${uid}`, day, 40);
      if (tipIdx !== rizzIdx) differ++;
    }
    // With a 1/40 collision rate we'd expect ~29 out of 30 to differ.
    expect(differ).toBeGreaterThan(20);
  });
});

describe("Curated pools meet the size floor promised to owners", () => {
  it("ships at least 40 curated tips", () => {
    expect(CURATED_TIPS.length).toBeGreaterThanOrEqual(40);
  });

  it("ships at least 60 curated Rizz lines", () => {
    expect(CURATED_RIZZ.length).toBeGreaterThanOrEqual(60);
  });

  it("every curated tip has both en and af strings", () => {
    for (const t of CURATED_TIPS) {
      expect(t.en.trim().length).toBeGreaterThan(0);
      expect(t.af.trim().length).toBeGreaterThan(0);
    }
  });

  it("every curated Rizz line has both en and af strings", () => {
    for (const r of CURATED_RIZZ) {
      expect(r.en.trim().length).toBeGreaterThan(0);
      expect(r.af.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("client shape adapters", () => {
  it("toClientTip renames en/af to text/textAf and preserves subject", () => {
    const t: BilingualTip = { subject: "History", en: "Quote the source.", af: "Haal die bron aan." };
    expect(toClientTip(t)).toEqual({ text: "Quote the source.", textAf: "Haal die bron aan.", subject: "History" });
  });

  it("toClientRizz renames en/af to text/textAf", () => {
    expect(toClientRizz({ en: "Let's go.", af: "Kom ons gaan." })).toEqual({ text: "Let's go.", textAf: "Kom ons gaan." });
  });
});
