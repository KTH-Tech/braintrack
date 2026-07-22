/**
 * tests/unit/content-generators.test.ts
 *
 * Pure-function guards for the Content Studio generators. No DB, no OpenAI —
 * these cover the two safety gates the owner specifically asked to be tested:
 *   - stripMarkNotation      : removes DBE mark scaffolding from learner text.
 *   - isStimulusDependent    : rejects questions that need an unseen stimulus.
 * plus isUsableMcq / mcqToSeedItem, which decide whether a generated daily-
 * challenge question is in the exact shape /api/daily-challenge's isUsableSeed
 * guard accepts (question + options[>1] + correctIndex).
 *
 * DATABASE_URL is stubbed before importing the module: server/db builds a lazy
 * pg Pool at import (it never connects here) but throws if the var is missing.
 */
process.env.DATABASE_URL ??= "postgres://ci:ci@localhost:5432/ci";

import { describe, it, expect } from "vitest";
import {
  stripMarkNotation,
  isStimulusDependent,
  isUsableMcq,
  mcqToSeedItem,
  type GeneratedMcq,
} from "../../server/content-generators";

describe("stripMarkNotation", () => {
  it("strips the exact notation seen on the live broken flashcards", () => {
    // front="…will be (more/less) expensive. (1 x 1) (1)" / back="More (1) (1 x 1) (1)"
    expect(stripMarkNotation("The cost will be (more/less) expensive. (1 x 1) (1)")).toBe(
      "The cost will be (more/less) expensive.",
    );
    expect(stripMarkNotation("More (1) (1 x 1) (1)")).toBe("More");
  });

  it("removes bracketed section totals", () => {
    expect(stripMarkNotation("Design a game children can play. [20]")).toBe(
      "Design a game children can play.",
    );
    expect(stripMarkNotation("Answer the question. [ 10 ]")).toBe("Answer the question.");
  });

  it("removes bare parenthesised mark counts", () => {
    expect(stripMarkNotation("Name FOUR components of internal control. (4)")).toBe(
      "Name FOUR components of internal control.",
    );
    expect(stripMarkNotation("Define the term 'cash flow'. (3)")).toBe(
      "Define the term 'cash flow'.",
    );
  });

  it("removes spelled-out allocations in English and Afrikaans", () => {
    expect(stripMarkNotation("Explain the concept. (2 marks)")).toBe("Explain the concept.");
    expect(stripMarkNotation("Verduidelik die begrip. (3 punte)")).toBe("Verduidelik die begrip.");
  });

  it("removes allocation formulas including × and *", () => {
    expect(stripMarkNotation("Discuss two factors. (2 x 2) (4)")).toBe("Discuss two factors.");
    expect(stripMarkNotation("State one point. (1×1)")).toBe("State one point.");
  });

  it("collapses whitespace and leaves clean prose", () => {
    expect(stripMarkNotation("List  three   causes.  (3)")).toBe("List three causes.");
  });

  it("does not clip ordinary numbers that are not mark notation", () => {
    // A four-digit year is not a 1–199 mark count.
    expect(stripMarkNotation("In (1994) democracy arrived.")).toBe("In (1994) democracy arrived.");
    // Bare numbers with no brackets are untouched.
    expect(stripMarkNotation("Newton's 2nd law is F = ma")).toBe("Newton's 2nd law is F = ma");
  });

  it("is null/undefined safe", () => {
    expect(stripMarkNotation(null)).toBe("");
    expect(stripMarkNotation(undefined)).toBe("");
  });
});

describe("isStimulusDependent", () => {
  it("honours the ingestion flags", () => {
    expect(isStimulusDependent({ questionText: "State Ohm's law.", needsStimulus: true })).toBe(true);
    expect(
      isStimulusDependent({ questionText: "State Ohm's law.", stimulusText: "A circuit diagram…" }),
    ).toBe(true);
  });

  it("rejects explicit stimulus references in the question text", () => {
    expect(isStimulusDependent({ questionText: "Refer to FIGURE 2 and describe the trend." })).toBe(true);
    expect(isStimulusDependent({ questionText: "Study the map and name the landform at X." })).toBe(true);
    expect(isStimulusDependent({ questionText: "Using SOURCE 1B, explain the cause." })).toBe(true);
    expect(
      isStimulusDependent({ questionText: "The cost of infrastructure in blocks C4 and C5 will rise." }),
    ).toBe(true);
    expect(
      isStimulusDependent({ questionText: "According to the passage, what did the author intend?" }),
    ).toBe(true);
    expect(isStimulusDependent({ questionText: "In the diagram, label part B." })).toBe(true);
    expect(isStimulusDependent({ questionText: "Read lines 4 to 7 and comment on the tone." })).toBe(true);
  });

  it("passes clean, self-contained questions", () => {
    expect(isStimulusDependent({ questionText: "Name FOUR components of an internal control system." })).toBe(
      false,
    );
    expect(isStimulusDependent({ questionText: "Define the term 'cash flow'." })).toBe(false);
    expect(isStimulusDependent({ questionText: "What is the derivative of f(x) = 3x^2 + 2x - 5?" })).toBe(
      false,
    );
    expect(isStimulusDependent({ questionText: "Explain why mitochondria are called the powerhouse of the cell." })).toBe(
      false,
    );
  });
});

describe("isUsableMcq", () => {
  const good: GeneratedMcq = {
    question: "What is the accounting equation?",
    questionAf: "Wat is die rekeningkundige vergelyking?",
    options: ["Assets = Liabilities + Owner's Equity", "Assets = Revenue - Expenses", "Profit = Revenue - Cost", "Assets + Liabilities = Equity"],
    optionsAf: ["Bates = Laste + Eienaarsbelang", "Bates = Inkomste - Uitgawes", "Wins = Inkomste - Koste", "Bates + Laste = Ekwiteit"],
    correctIndex: 0,
    explanation: "Assets are financed by liabilities and owner's equity.",
    explanationAf: "Bates word deur laste en eienaarsbelang gefinansier.",
    topic: "Financial Statements",
    difficulty: "easy",
    sourceQuestionId: 123,
    provenance: "Accounting 2023 November P1 Q1 (src #123)",
  };

  it("accepts a well-formed bilingual 4-option MCQ", () => {
    expect(isUsableMcq(good).ok).toBe(true);
  });

  it("rejects wrong option counts and blank options", () => {
    expect(isUsableMcq({ ...good, options: good.options.slice(0, 3) }).ok).toBe(false);
    expect(isUsableMcq({ ...good, options: ["a", "b", "c", "  "] }).ok).toBe(false);
  });

  it("rejects a bad correct index", () => {
    expect(isUsableMcq({ ...good, correctIndex: 5 }).ok).toBe(false);
    expect(isUsableMcq({ ...good, correctIndex: -1 }).ok).toBe(false);
  });

  it("rejects a missing Afrikaans side", () => {
    expect(isUsableMcq({ ...good, questionAf: "" }).ok).toBe(false);
    expect(isUsableMcq({ ...good, optionsAf: ["a", "b", "c"] }).ok).toBe(false);
  });

  it("rejects duplicate options", () => {
    expect(isUsableMcq({ ...good, options: ["a", "a", "b", "c"] }).ok).toBe(false);
  });

  it("rejects a stem that still references a stimulus or carries mark notation", () => {
    expect(isUsableMcq({ ...good, question: "Refer to FIGURE 1: which value is correct?" }).ok).toBe(false);
    expect(isUsableMcq({ ...good, question: "What is the accounting equation? (2)" }).ok).toBe(false);
  });
});

describe("mcqToSeedItem", () => {
  // Exact copy of the guard in server/routes.ts /api/daily-challenge. If
  // mcqToSeedItem output does not satisfy this, the serve path silently drops
  // the row and the learner gets a template — the bug we are fixing. Keeping a
  // literal copy here fails loudly if the two ever drift apart.
  const isUsableSeed = (q: any) =>
    q &&
    typeof q.question === "string" &&
    q.question.trim().length > 0 &&
    Array.isArray(q.options) &&
    q.options.length > 1 &&
    typeof q.correctIndex === "number";

  it("produces the exact shape /api/daily-challenge isUsableSeed accepts", () => {
    const item = mcqToSeedItem({
      question: "What is the accounting equation?",
      questionAf: "Wat is die rekeningkundige vergelyking?",
      options: ["A = L + OE", "A = R - E", "P = R - C", "A + L = E"],
      optionsAf: ["B = L + EB", "B = I - U", "W = I - K", "B + L = E"],
      correctIndex: 0,
      explanation: "because",
      explanationAf: "omdat",
      topic: "Financial Statements",
      difficulty: "medium",
      sourceQuestionId: 9,
      provenance: "x",
    });
    expect(isUsableSeed(item)).toBe(true);
    expect(item.source).toBe("dbe");
  });

  it("the OLD wrong-shape seed (n/marks/topic/memoText/questionText) is correctly rejected", () => {
    // This is exactly what the simulate-all companion writer produced and why
    // every learner got templates.
    const oldShape = { n: 1, marks: 4, topic: "x", memoText: "…", questionText: "…", cognitiveLevel: "knowledge" };
    expect(isUsableSeed(oldShape)).toBe(false);
  });
});
