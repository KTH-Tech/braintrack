/**
 * tests/unit/content-verifier.test.ts
 *
 * These cover the PURE decision logic of server/content-verifier.ts — the parts
 * that decide a verdict once the model calls have returned. The model calls
 * themselves are not mocked here; the point of this suite is that the policy is
 * inspectable and cannot drift silently.
 *
 * The anchor case throughout is the real failure this file exists for:
 * an Accounting item teaching LIFO, which two independent structural scorers
 * passed at 86-87/100 and released.
 */
import { describe, it, expect } from "vitest";
import {
  classifyItem, escapeLike, decideCapsVerdict, reconcileSolver,
  buildSolvePrompt, buildComparePrompt, CORPUS_MIN_ROWS,
  type ConceptEvidence, type LlmSyllabusJudgement, type SolveOutput, type VerifiableItem,
} from "@server/content-verifier";

const item = (over: Partial<VerifiableItem> = {}): VerifiableItem => ({
  source: "generated", id: 1, subject: "Accounting", language: "English",
  topic: "Inventory Valuation", paperNumber: 2, marks: 1, cognitiveLevel: "knowledge",
  prompt: "Which inventory valuation method results in the highest cost of goods sold when prices rise?",
  memo: "LIFO", mcqOptions: null, correctOption: null,
  priorQualityScore: 86, released: true, ...over,
});

const solve = (over: Partial<SolveOutput> = {}): SolveOutput => ({
  answer: "LIFO", finalValue: null, chosenOption: null, keyPoints: ["LIFO"],
  workingSteps: [], confidence: 0.9, unanswerable: false, unanswerableReason: null, ...over,
});

const judge = (over: Partial<LlmSyllabusJudgement> = {}): LlmSyllabusJudgement => ({
  verdict: "off_syllabus", offSyllabusConcepts: ["LIFO"],
  reason: "LIFO is prohibited under IAS 2 and is not in CAPS Grade 12 Accounting.",
  confidence: 0.95, ...over,
});

const ev = (concept: string, hits: number): ConceptEvidence =>
  ({ concept, variants: [concept], hits });

describe("classifyItem", () => {
  it("treats anything with options as MCQ regardless of content", () => {
    expect(classifyItem(item({ mcqOptions: [{ letter: "A", text: "FIFO" }] }))).toBe("mcq");
  });

  it("detects a calculation from an explicit command verb", () => {
    expect(classifyItem(item({ prompt: "Calculate the value of closing stock.", memo: "R12 400" })))
      .toBe("calculation");
    expect(classifyItem(item({ prompt: "Bereken die waarde van die sluitingsvoorraad.", memo: "R12 400" })))
      .toBe("calculation");
  });

  it("does not mistake numeric-flavoured prose for a calculation", () => {
    // Accounting discussion prose mentions rands and percentages constantly.
    // Mis-classifying it forces the adjudicator to demand a numeric match that
    // does not exist, which would manufacture disagreements.
    expect(classifyItem(item({
      prompt: "Explain why the business should be concerned about its liquidity.",
      memo: "The current ratio dropped, which means the business may struggle to pay short-term debts.",
    }))).toBe("prose");
  });

  it("classifies discussion questions as prose", () => {
    expect(classifyItem(item({
      prompt: "Discuss the impact of ethical behaviour on a business's reputation. (4)",
      memo: "Enhances the image and attracts customers who value ethics.",
    }))).toBe("prose");
  });
});

describe("escapeLike", () => {
  it("neutralises ILIKE wildcards so a concept cannot match everything", () => {
    expect(escapeLike("100%")).toBe("100\\%");
    expect(escapeLike("a_b")).toBe("a\\_b");
    expect(escapeLike("back\\slash")).toBe("back\\\\slash");
  });

  it("leaves ordinary concept names untouched", () => {
    expect(escapeLike("weighted average")).toBe("weighted average");
    expect(escapeLike("LIFO")).toBe("LIFO");
  });
});

describe("decideCapsVerdict — the LIFO case", () => {
  it("returns off_syllabus when the judge flags it AND the corpus is silent", () => {
    const r = decideCapsVerdict({
      llm: judge(),
      evidence: [ev("LIFO", 0), ev("FIFO", 12)],
      corpusSize: 757,
      topicKnown: true,
    });
    expect(r.verdict).toBe("off_syllabus");
    expect(r.offSyllabusConcepts).toContain("LIFO");
    expect(r.confidence).toBeGreaterThanOrEqual(0.75);
    expect(r.reason).toMatch(/ZERO/);
  });

  it("still returns off_syllabus even when the stated topic IS a known topic", () => {
    // "Inventory Valuation" is a legitimate Accounting topic — the topic is
    // fine, the METHOD taught inside it is not. A topic-level check can never
    // catch this, which is the whole reason for concept-level corroboration.
    const r = decideCapsVerdict({
      llm: judge(), evidence: [ev("LIFO", 0)], corpusSize: 757, topicKnown: true,
    });
    expect(r.verdict).toBe("off_syllabus");
  });
});

describe("decideCapsVerdict — guards against false rejections", () => {
  it("downgrades to uncertain when the corpus contradicts the judge", () => {
    // Evidence beats opinion: if the flagged concept demonstrably appears in
    // real NSC papers, the judge is probably wrong.
    const r = decideCapsVerdict({
      llm: judge({ offSyllabusConcepts: ["Chemical Equilibrium"] }),
      evidence: [ev("Chemical Equilibrium", 47)],
      corpusSize: 999, topicKnown: false,
    });
    expect(r.verdict).toBe("uncertain");
    expect(r.reason).toMatch(/CONFLICT/);
  });

  it("downgrades to uncertain when the subject's corpus is too thin to trust", () => {
    const r = decideCapsVerdict({
      llm: judge(), evidence: [ev("LIFO", 0)], corpusSize: CORPUS_MIN_ROWS - 1, topicKnown: false,
    });
    expect(r.verdict).toBe("uncertain");
    expect(r.reason).toMatch(/too thin/);
  });

  it("never rejects purely because the topic is missing from the topics table", () => {
    // `topics` is verified-incomplete: Physical Sciences is missing "Chemical
    // Equilibrium", "Acids and Bases" and "Rate and Extent of Reaction", all
    // examined every year. An unknown topic must not sway the verdict.
    const r = decideCapsVerdict({
      llm: judge({ verdict: "on_syllabus", offSyllabusConcepts: [], reason: "Core CAPS content." }),
      evidence: [ev("Acids and Bases", 88)],
      corpusSize: 999, topicKnown: false,
    });
    expect(r.verdict).toBe("on_syllabus");
  });

  it("passes content the corpus strongly corroborates", () => {
    const r = decideCapsVerdict({
      llm: judge({ verdict: "on_syllabus", offSyllabusConcepts: [], reason: "Standard CAPS content." }),
      evidence: [ev("FIFO", 12), ev("weighted average", 7)],
      corpusSize: 757, topicKnown: true,
    });
    expect(r.verdict).toBe("on_syllabus");
  });

  it("flags on_syllabus-but-uncorroborated as uncertain rather than passing it", () => {
    const r = decideCapsVerdict({
      llm: judge({ verdict: "on_syllabus", offSyllabusConcepts: [], reason: "Looks fine." }),
      evidence: [ev("Some Paraphrased Concept", 0)],
      corpusSize: 757, topicKnown: true,
    });
    expect(r.verdict).toBe("uncertain");
  });

  it("carries an uncertain judge through as uncertain", () => {
    const r = decideCapsVerdict({
      llm: judge({ verdict: "uncertain", offSyllabusConcepts: [], reason: "Cannot tell.", confidence: 0.3 }),
      evidence: [ev("Something", 1)], corpusSize: 757, topicKnown: true,
    });
    expect(r.verdict).toBe("uncertain");
  });
});

describe("reconcileSolver", () => {
  const agree = { verdict: "agree" as const, matchScore: 0.95, suspect: "unclear" as const, reason: "Same answer." };
  const disagree = { verdict: "disagree" as const, matchScore: 0.1, suspect: "memo" as const, reason: "Different figure." };

  it("passes a confident agreement straight through and clears `suspect`", () => {
    const r = reconcileSolver(agree, solve(), "prose");
    expect(r.verdict).toBe("agree");
    expect(r.suspect).toBeNull();
  });

  it("keeps a confident disagreement, preserving which side is suspected", () => {
    const r = reconcileSolver(disagree, solve({ confidence: 0.9 }), "calculation");
    expect(r.verdict).toBe("disagree");
    expect(r.suspect).toBe("memo");
  });

  it("downgrades a disagreement to uncertain when the solver doubts itself", () => {
    // A solver that is unsure of its own answer is not evidence against a memo.
    const r = reconcileSolver(disagree, solve({ confidence: 0.2 }), "calculation");
    expect(r.verdict).toBe("uncertain");
    expect(r.reason).toMatch(/low confidence/);
  });

  it("reports an unanswerable item as uncertain, not as agreement", () => {
    const r = reconcileSolver(agree, solve({ unanswerable: true, unanswerableReason: "No correct option offered." }), "mcq");
    expect(r.verdict).toBe("uncertain");
    expect(r.reason).toMatch(/No correct option offered/);
  });

  it("never turns a non-agree outcome into an agreement", () => {
    for (const c of [0, 0.2, 0.49, 0.5, 0.9]) {
      expect(reconcileSolver(disagree, solve({ confidence: c }), "prose").verdict).not.toBe("agree");
    }
  });
});

describe("buildSolvePrompt — memo isolation", () => {
  it("does not leak the stored memo into the solve prompt", () => {
    const i = item({
      prompt: "Which method gives the highest cost of goods sold when prices rise?",
      memo: "SECRET-MEMO-SENTINEL-42",
    });
    const p = buildSolvePrompt(i);
    expect(`${p.system}\n${p.user}`).not.toContain("SECRET-MEMO-SENTINEL-42");
    expect(p.user).toContain(i.prompt);
  });

  it("does not leak the stored correct option for an MCQ", () => {
    const i = item({
      mcqOptions: [{ letter: "A", text: "FIFO" }, { letter: "B", text: "LIFO" }],
      correctOption: "B", memo: "B",
    });
    const p = buildSolvePrompt(i);
    expect(p.user).toContain("A) FIFO");
    expect(p.user).not.toMatch(/correct option/i);
  });

  it("anchors the solver to the South African curriculum", () => {
    const p = buildSolvePrompt(item());
    expect(p.system).toMatch(/South African/);
    expect(p.system).toMatch(/CAPS/);
  });

  it("gives the adjudicator both answers and refuses to privilege the memo", () => {
    const p = buildComparePrompt(item(), solve({ answer: "SOLVER-ANSWER" }), "prose");
    expect(p.user).toContain("SOLVER-ANSWER");
    expect(p.user).toContain("LIFO");
    expect(p.system).toMatch(/NOT automatically correct/);
  });
});
