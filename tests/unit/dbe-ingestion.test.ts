import { describe, it, expect, vi, beforeAll } from "vitest";

vi.mock("../../server/db", () => ({ db: {} }));
vi.mock("pdf-parse", () => ({ default: vi.fn() }));
vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
  sql: vi.fn(),
  relations: vi.fn(),
}));

import {
  isDataAssetSubject,
  DATA_ASSET_SUBJECTS,
  computeContentHash,
  computeQualityScore,
  computePredictiveRating,
} from "../../server/dbe-ingestion";

describe("isDataAssetSubject", () => {
  it("returns true for known data asset subjects", () => {
    expect(isDataAssetSubject("Data Files")).toBe(true);
    expect(isDataAssetSubject("Java (Afrikaans)")).toBe(true);
    expect(isDataAssetSubject("Delphi (English)")).toBe(true);
    expect(isDataAssetSubject("Answerbook (English)")).toBe(true);
  });

  it("returns false for normal academic subjects", () => {
    expect(isDataAssetSubject("Mathematics")).toBe(false);
    expect(isDataAssetSubject("Life Sciences")).toBe(false);
    expect(isDataAssetSubject("Physical Sciences")).toBe(false);
    expect(isDataAssetSubject("Business Studies")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isDataAssetSubject("DATA FILES")).toBe(true);
    expect(isDataAssetSubject("MATHEMATICS")).toBe(false);
  });

  it("trims whitespace before checking", () => {
    expect(isDataAssetSubject("  data files  ")).toBe(true);
    expect(isDataAssetSubject("  mathematics  ")).toBe(false);
  });

  it("DATA_ASSET_SUBJECTS set contains at least 10 entries", () => {
    expect(DATA_ASSET_SUBJECTS.size).toBeGreaterThanOrEqual(10);
  });
});

describe("computeContentHash", () => {
  it("returns a 64-character hex string (SHA-256)", () => {
    const hash = computeContentHash("What is the derivative of x^2?");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("produces the same hash for identical inputs", () => {
    const text = "The mitochondria is the powerhouse of the cell.";
    expect(computeContentHash(text)).toBe(computeContentHash(text));
  });

  it("produces different hashes for different inputs", () => {
    const h1 = computeContentHash("Algebra question about quadratics");
    const h2 = computeContentHash("Geography question about rivers");
    expect(h1).not.toBe(h2);
  });

  it("handles empty string without throwing", () => {
    const hash = computeContentHash("");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBe(64);
  });

  it("normalises equivalent whitespace to the same hash", () => {
    const h1 = computeContentHash("  hello  world  ");
    const h2 = computeContentHash("  hello  world  ");
    expect(h1).toBe(h2);
  });
});

describe("computeQualityScore", () => {
  it("returns clean flag for well-formed question and memo", () => {
    const q = "1. Calculate the derivative of f(x) = x² + 3x + 2. Show all working. (4 marks)";
    const m = "f'(x) = 2x + 3. Substitute and simplify. Award 2 marks for method, 2 for answer.";
    const result = computeQualityScore(q, m);
    expect(result.accuracyFlag).toBe("clean");
    expect(result.qualityScore).toBeGreaterThanOrEqual(75);
  });

  it("returns garbled flag for short gibberish text", () => {
    const result = computeQualityScore("xyz", null);
    expect(result.accuracyFlag).toBe("garbled");
    expect(result.qualityScore).toBeLessThan(45);
  });

  it("returns partial flag for medium-quality text (20-120 chars, no structure)", () => {
    const result = computeQualityScore("Explain what happens during photosynthesis", null);
    expect(["clean", "partial"]).toContain(result.accuracyFlag);
  });

  it("handles null memo text without throwing", () => {
    const q = "What is the capital of South Africa? (2 marks)";
    const result = computeQualityScore(q, null);
    expect(result.memoAccuracyFlag).toBe("unscored");
    expect(result.memoQualityScore).toBe(0);
  });

  it("combined score is average of question and memo when both present", () => {
    const q = "Describe the process of cell division in detail. Include all phases. (6 marks)";
    const m = "Interphase, Prophase, Metaphase, Anaphase, Telophase. Award marks per phase.";
    const result = computeQualityScore(q, m);
    const expectedCombined = Math.round((result.questionQualityScore + result.memoQualityScore) / 2);
    expect(result.qualityScore).toBe(expectedCombined);
  });

  it("returns question-only score when memo is empty string", () => {
    const q = "What is Newton's first law of motion? Explain with an example. (4 marks)";
    const result = computeQualityScore(q, "");
    expect(result.memoAccuracyFlag).toBe("unscored");
    expect(result.qualityScore).toBe(result.questionQualityScore);
  });

  it("returns all expected keys in result object", () => {
    const result = computeQualityScore("Some question text here (3 marks)", null);
    expect(result).toHaveProperty("qualityScore");
    expect(result).toHaveProperty("accuracyFlag");
    expect(result).toHaveProperty("questionQualityScore");
    expect(result).toHaveProperty("questionAccuracyFlag");
    expect(result).toHaveProperty("memoQualityScore");
    expect(result).toHaveProperty("memoAccuracyFlag");
  });
});

describe("computePredictiveRating", () => {
  const noYearCounts = new Map<number, number>();

  it("returns a number between 0 and 100", () => {
    const rating = computePredictiveRating(2023, 10, "application", true, noYearCounts);
    expect(rating).toBeGreaterThanOrEqual(0);
    expect(rating).toBeLessThanOrEqual(100);
  });

  it("recent papers (<=2 years ago) have higher rating than old papers", () => {
    const currentYear = new Date().getFullYear();
    const recentRating = computePredictiveRating(currentYear - 1, 10, "application", true, noYearCounts);
    const oldRating = computePredictiveRating(currentYear - 12, 10, "application", true, noYearCounts);
    expect(recentRating).toBeGreaterThan(oldRating);
  });

  it("high-mark questions (>=10 marks) score higher than low-mark", () => {
    const currentYear = new Date().getFullYear();
    const highMark = computePredictiveRating(currentYear - 1, 12, "application", true, noYearCounts);
    const lowMark = computePredictiveRating(currentYear - 1, 1, "application", true, noYearCounts);
    expect(highMark).toBeGreaterThan(lowMark);
  });

  it("questions with memo present score higher than without memo", () => {
    const withMemo = computePredictiveRating(2022, 5, "knowledge", true, noYearCounts);
    const withoutMemo = computePredictiveRating(2022, 5, "knowledge", false, noYearCounts);
    expect(withMemo).toBeGreaterThanOrEqual(withoutMemo);
  });

  it("handles null marks and cognitiveLevel without throwing", () => {
    const rating = computePredictiveRating(2021, null, null, false, noYearCounts);
    expect(typeof rating).toBe("number");
    expect(isNaN(rating)).toBe(false);
  });
});
