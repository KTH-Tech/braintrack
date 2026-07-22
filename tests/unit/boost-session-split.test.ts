import { describe, it, expect } from "vitest";
import {
  splitBoostSession,
  BOOST_SESSION_TOTAL_SECONDS,
  MIN_BLOCK_SECONDS,
} from "@shared/boost-session";

describe("splitBoostSession", () => {
  it("returns [] for no subjects", () => {
    expect(splitBoostSession([])).toEqual([]);
  });

  it("returns [] for invalid totals", () => {
    expect(splitBoostSession([1, 2], 0)).toEqual([]);
    expect(splitBoostSession([1, 2], -5)).toEqual([]);
    expect(splitBoostSession([1, 2], NaN)).toEqual([]);
  });

  it("gives a single subject the whole 30 minutes", () => {
    expect(splitBoostSession([7])).toEqual([{ subjectId: 7, seconds: 1800 }]);
  });

  it("splits 6 subjects into 5-minute blocks", () => {
    const blocks = splitBoostSession([1, 2, 3, 4, 5, 6]);
    expect(blocks).toHaveLength(6);
    for (const b of blocks) expect(b.seconds).toBe(300);
    expect(blocks.map((b) => b.subjectId)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("hands the remainder to the earliest blocks so the sum is exact (7 subjects)", () => {
    // 1800 / 7 = 257 remainder 1 → first block gets 258, rest 257
    const blocks = splitBoostSession([1, 2, 3, 4, 5, 6, 7]);
    expect(blocks).toHaveLength(7);
    expect(blocks[0].seconds).toBe(258);
    for (const b of blocks.slice(1)) expect(b.seconds).toBe(257);
    expect(blocks.reduce((s, b) => s + b.seconds, 0)).toBe(1800);
  });

  it("always sums exactly to the total for 1..10 subjects", () => {
    for (let n = 1; n <= 10; n++) {
      const ids = Array.from({ length: n }, (_, i) => i + 1);
      const blocks = splitBoostSession(ids);
      expect(blocks).toHaveLength(n);
      expect(blocks.reduce((s, b) => s + b.seconds, 0)).toBe(
        BOOST_SESSION_TOTAL_SECONDS,
      );
      // No block dips below the minimum
      for (const b of blocks) {
        expect(b.seconds).toBeGreaterThanOrEqual(MIN_BLOCK_SECONDS);
      }
      // Even split: max spread between any two blocks is 1 second
      const secs = blocks.map((b) => b.seconds);
      expect(Math.max(...secs) - Math.min(...secs)).toBeLessThanOrEqual(1);
    }
  });

  it("dedupes subject ids and drops invalid ones, preserving first-seen order", () => {
    const blocks = splitBoostSession([3, 3, -1, 0, 2.5, 9, 3, 9, 12]);
    expect(blocks.map((b) => b.subjectId)).toEqual([3, 9, 12]);
    expect(blocks.reduce((s, b) => s + b.seconds, 0)).toBe(
      BOOST_SESSION_TOTAL_SECONDS,
    );
  });

  it("caps the number of blocks so none dips below MIN_BLOCK_SECONDS", () => {
    // 30 min / 3 min = at most 10 blocks, even with 14 subjects selected
    const ids = Array.from({ length: 14 }, (_, i) => i + 1);
    const blocks = splitBoostSession(ids);
    expect(blocks).toHaveLength(10);
    expect(blocks.map((b) => b.subjectId)).toEqual(ids.slice(0, 10));
    for (const b of blocks) expect(b.seconds).toBe(180);
    expect(blocks.reduce((s, b) => s + b.seconds, 0)).toBe(1800);
  });

  it("supports a custom total (e.g. a 10-minute mini boost)", () => {
    const blocks = splitBoostSession([1, 2], 600);
    expect(blocks).toEqual([
      { subjectId: 1, seconds: 300 },
      { subjectId: 2, seconds: 300 },
    ]);
  });

  it("degenerate tiny totals still produce a single usable block", () => {
    // Below MIN_BLOCK_SECONDS: one block gets everything rather than nothing
    const blocks = splitBoostSession([4, 5, 6], 120);
    expect(blocks).toEqual([{ subjectId: 4, seconds: 120 }]);
  });

  it("floors fractional totals to whole seconds", () => {
    const blocks = splitBoostSession([1], 1799.9);
    expect(blocks).toEqual([{ subjectId: 1, seconds: 1799 }]);
  });
});
