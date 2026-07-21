import { describe, it, expect } from "vitest";
import { cleanMemoText, sanitizeKeywords, isMemoContentless } from "../../server/memo-clean";
import { parseMemoToScheme, markAgainstScheme, extractAlternatives } from "../../server/memo-marker";

// The reference defect. A learner answered Hospitality Studies 2025 P1 Q1.4.2
// (row 85619) and was told the expected key terms were `enige`, `volgorde`,
// `m194`, `f37` — the examiner's formatting notes, not the answer.
const REF_MEMO_AF = "A C Enige volgorde M194 F37 (2)";
const REF_MEMO_EN = "A C (Any order) M22 F76 (2)";
// Row 85817, the reference row named in the task.
const ROW_85817_MEMO = "Voedselallergie/Allergiese reaksie/Anafilakse/Allergie✓ M50 F4";

describe("cleanMemoText — layout/source codes", () => {
  it("strips M##/F## cross-reference codes in every observed spelling", () => {
    expect(cleanMemoText("Lewer✓ M22 F76 (1)")).toBe("Lewer✓ (1)");
    expect(cleanMemoText("Sorbet M52/F9")).toBe("Sorbet");
    expect(cleanMemoText("Linne M177 F10 (10)")).toBe("Linne (10)");
    expect(cleanMemoText("A C E H Enige volgorde M 85/86 F199/200")).toBe("A C E H");
  });

  it("removes the codes from row 85817's memo but keeps the answer", () => {
    expect(cleanMemoText(ROW_85817_MEMO)).toBe(
      "Voedselallergie/Allergiese reaksie/Anafilakse/Allergie✓",
    );
  });

  it("does NOT strip a lone M/F token when there is no code pair", () => {
    // "F1" here is content, not a marking-guideline cross-reference.
    expect(cleanMemoText("The F1 hybrid generation is uniform.")).toContain("F1");
  });

  it("preserves tick glyphs — memo-marker counts them to allocate marks", () => {
    expect(cleanMemoText("Aansteeklik✓✓ M12 F30")).toBe("Aansteeklik✓✓");
  });
});

describe("cleanMemoText — marker instructions", () => {
  it("removes any-order directives in both languages", () => {
    expect(cleanMemoText(REF_MEMO_AF)).toBe("A C (2)");
    expect(cleanMemoText(REF_MEMO_EN)).toBe("A C (2)");
  });

  it("removes quantity directives without touching real content", () => {
    expect(cleanMemoText("Any TWO relevant responses Cash flow improves")).toBe(
      "Cash flow improves",
    );
    expect(cleanMemoText("Enige TWEE relevante response Kontantvloei verbeter")).toBe(
      "Kontantvloei verbeter",
    );
  });

  it("removes Max/NOTE/mark-allocation furniture", () => {
    expect(cleanMemoText("Increased sales Max. (4)")).toBe("Increased sales");
    expect(cleanMemoText("Profit rises\nNOTE: mark the first two only")).toBe("Profit rises");
    expect(cleanMemoText("Correct answer (2 x 2)")).toBe("Correct answer");
  });

  it("leaves an ordinary memo untouched", () => {
    const memo = "The liver is the organ affected by hepatitis A.";
    expect(cleanMemoText(memo)).toBe(memo);
  });

  it("does not drop the word 'two' from a legitimate answer", () => {
    // Clause removal, not word removal — "two chambers" must survive.
    expect(cleanMemoText("The two chambers of the heart")).toBe("The two chambers of the heart");
  });
});

describe("isMemoContentless", () => {
  it("is true when a memo is nothing but examiner furniture", () => {
    expect(isMemoContentless("M194 F37 (2)")).toBe(true);
    expect(isMemoContentless("Enige volgorde M60 F20")).toBe(true);
  });

  it("is false when real answer content survives", () => {
    expect(isMemoContentless(ROW_85817_MEMO)).toBe(false);
    expect(isMemoContentless(REF_MEMO_AF)).toBe(false); // "A C" is the answer
  });
});

describe("sanitizeKeywords — defensive filter for already-stored schemes", () => {
  it("drops the exact junk terms shown to the learner on row 85619", () => {
    expect(sanitizeKeywords(["enige", "volgorde", "m194", "f37"])).toEqual([]);
  });

  it("drops layout codes and marker vocabulary but keeps content", () => {
    expect(sanitizeKeywords(["lewer", "m22", "f76"])).toEqual(["lewer"]);
    expect(sanitizeKeywords(["any", "max", "cashflow"])).toEqual(["cashflow"]);
  });

  it("keeps ambiguous words that can carry an answer", () => {
    // Handled by clause removal at parse time — never word-filtered.
    expect(sanitizeKeywords(["two", "chamber", "heart"])).toEqual(["two", "chamber", "heart"]);
  });

  it("handles null/empty input", () => {
    expect(sanitizeKeywords(null)).toEqual([]);
    expect(sanitizeKeywords([])).toEqual([]);
  });
});

describe("extractAlternatives — '/' means OR in DBE memos", () => {
  it("splits an alternatives list", () => {
    expect(extractAlternatives("Jam/Jelly/ Marmalade")).toEqual(["Jam", "Jelly", "Marmalade"]);
  });

  it("ignores numeric fractions", () => {
    expect(extractAlternatives("1/2")).toEqual([]);
  });

  it("ignores text with no slash", () => {
    expect(extractAlternatives("The liver")).toEqual([]);
  });
});

describe("end-to-end marking — the reference defects", () => {
  it("row 85817: a learner answering the FIRST listed alternative scores full marks", () => {
    const scheme = parseMemoToScheme(ROW_85817_MEMO, 1);
    expect(scheme).not.toBeNull();
    // The artifact codes must not appear as expected terms.
    const allKeywords = scheme!.criteria.flatMap((c) => c.keywords);
    expect(allKeywords).not.toContain("m50");
    expect(allKeywords).not.toContain("f4");

    const result = markAgainstScheme("Voedselallergie", scheme!, true);
    expect(result.marksAwarded).toBe(1);
    expect(result.isCorrect).toBe(true);
  });

  it("row 85817: each listed alternative is independently acceptable", () => {
    const scheme = parseMemoToScheme(ROW_85817_MEMO, 1)!;
    for (const answer of ["Voedselallergie", "Allergiese reaksie", "Anafilakse", "Allergie"]) {
      expect(markAgainstScheme(answer, scheme, true).marksAwarded).toBe(1);
    }
  });

  it("a memo of pure furniture is refused, not scored against junk", () => {
    // This is what row 85619's memo reduces to once "A C" is consumed as an
    // MCQ answer rather than free text.
    expect(parseMemoToScheme("Enige volgorde M194 F37", 2)).toBeNull();
  });

  it("a STORED dirty scheme is sanitised at mark time and reported unmarkable", () => {
    // ~31.6k released rows carry schemes parsed before cleaning existed.
    const stored = {
      totalMarks: 2,
      criteria: [
        {
          id: "c1",
          keywords: ["enige", "volgorde", "m194", "f37"],
          acceptable: [],
          marks: 2,
          memoExcerpt: "A C Enige volgorde M194 F37",
        },
      ],
      partialRules: [],
      denyPhrases: [],
      parsedAt: "2026-01-01T00:00:00Z",
    };
    const result = markAgainstScheme("A\nD", stored, false);
    expect(result.unmarkable).toBe(true);
    expect(result.marksAwarded).toBe(0);
    expect(result.perCriterion).toEqual([]);
  });

  it("a clean stored scheme still marks normally and stays fully attainable", () => {
    const stored = {
      totalMarks: 2,
      criteria: [
        { id: "c1", keywords: ["liver"], acceptable: [], marks: 1, memoExcerpt: "Liver" },
        { id: "c2", keywords: ["hepatiti"], acceptable: [], marks: 1, memoExcerpt: "Hepatitis" },
      ],
      partialRules: [],
      denyPhrases: [],
      parsedAt: "2026-01-01T00:00:00Z",
    };
    const result = markAgainstScheme("liver hepatitis", stored, false);
    expect(result.unmarkable).toBeUndefined();
    expect(result.marksAwarded).toBe(2);
    expect(result.isCorrect).toBe(true);
  });

  it("dropping a furniture criterion still leaves full marks attainable", () => {
    const stored = {
      totalMarks: 2,
      criteria: [
        { id: "c1", keywords: ["m194", "f37"], acceptable: [], marks: 1, memoExcerpt: "M194 F37" },
        { id: "c2", keywords: ["liver"], acceptable: [], marks: 1, memoExcerpt: "Liver" },
      ],
      partialRules: [],
      denyPhrases: [],
      parsedAt: "2026-01-01T00:00:00Z",
    };
    const result = markAgainstScheme("liver", stored, false);
    expect(result.marksAwarded).toBe(2);
    expect(result.marksAvailable).toBe(2);
    expect(result.isCorrect).toBe(true);
  });

  it("never surfaces a layout code as an expected term in feedback", () => {
    const scheme = parseMemoToScheme("Sorbet M52/F9", 1)!;
    const feedback = markAgainstScheme("wrong answer", scheme, false).perCriterion[0].feedback;
    expect(feedback).not.toMatch(/m52|f9/i);
    // Keywords are stemmed and lower-cased, so match case-insensitively.
    expect(feedback).toMatch(/sorbet/i);
  });
});
