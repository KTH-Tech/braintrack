/**
 * Tests for server/exam-source-hygiene.ts.
 *
 * Every case in the first two blocks is a REAL string taken from
 * `dbe_verbatim_questions` in production, or the exact card that
 * `/api/flashcards/deck` served to a learner. These are regression tests for
 * shipped defects, not invented examples.
 */
import { describe, it, expect } from "vitest";
import {
  stripMarkNotation,
  hasMarkNotation,
  isStimulusDependent,
  gateSource,
} from "../../server/exam-source-hygiene";

describe("stripMarkNotation", () => {
  it("strips the exact notation that reached a learner's flashcard", () => {
    // The card the owner saw. Front and back both carried mark notation.
    const front =
      "The cost of developing infrastructure in blocks C4 and C5 will be (more/less) expensive. (1 x 1) (1)";
    const back = "More (1) (1 x 1) (1)";

    expect(stripMarkNotation(front)).toBe(
      "The cost of developing infrastructure in blocks C4 and C5 will be (more/less) expensive.",
    );
    expect(stripMarkNotation(back)).toBe("More");
  });

  it("preserves parenthesised CONTENT while removing parenthesised MARKS", () => {
    // "(more/less)" and "(aq)" are content. "(2)" is bookkeeping.
    expect(stripMarkNotation("State whether it is (more/less) dense. (2)")).toBe(
      "State whether it is (more/less) dense.",
    );
    expect(stripMarkNotation("Write the formula for NaCl (aq). (3)")).toBe(
      "Write the formula for NaCl (aq).",
    );
    expect(stripMarkNotation("Name the process (photosynthesis). (1)")).toBe(
      "Name the process (photosynthesis).",
    );
  });

  it("strips multipliers, mark words, brackets and totals", () => {
    expect(stripMarkNotation("Explain two reasons. (2 x 2) (4)")).toBe("Explain two reasons.");
    expect(stripMarkNotation("Discuss the impact. (4 marks)")).toBe("Discuss the impact.");
    expect(stripMarkNotation("Bespreek die impak. (4 punte)")).toBe("Bespreek die impak.");
    expect(stripMarkNotation("Answer all questions. [40]")).toBe("Answer all questions.");
    expect(stripMarkNotation("Define osmosis. TOTAL: 150")).toBe("Define osmosis.");
    expect(stripMarkNotation("Verduidelik dit. TOTAAL: 60")).toBe("Verduidelik dit.");
  });

  it("strips memo tick marks, which are marker notation", () => {
    // Real memo rows: "B√√", "stukwerk √√", "Nasionale Vaardigheids √√"
    expect(stripMarkNotation("B√√")).toBe("B");
    expect(stripMarkNotation("stukwerk √√")).toBe("stukwerk");
    expect(stripMarkNotation("Doen deurlopende navorsing √ oor tegnologie. √")).toBe(
      "Doen deurlopende navorsing oor tegnologie.",
    );
    expect(stripMarkNotation("Correct answer ✓✓")).toBe("Correct answer");
  });

  it("optionally strips a leading DBE question number", () => {
    const s = "2.3.2 Explain ways to address the challenge.";
    expect(stripMarkNotation(s)).toBe(s); // off by default
    expect(stripMarkNotation(s, { stripLeadingQuestionNumber: true })).toBe(
      "Explain ways to address the challenge.",
    );
    expect(
      stripMarkNotation("QUESTION 4 Discuss inflation.", { stripLeadingQuestionNumber: true }),
    ).toBe("Discuss inflation.");
    expect(
      stripMarkNotation("VRAAG 4 Bespreek inflasie.", { stripLeadingQuestionNumber: true }),
    ).toBe("Bespreek inflasie.");
  });

  it("does not mangle decimals, years, currency or ranges", () => {
    // These numbers are content. Only PARENTHESISED numbers are marks.
    expect(stripMarkNotation("Calculate 3.5 x 2 for the 2024 period.")).toBe(
      "Calculate 3.5 x 2 for the 2024 period.",
    );
    expect(stripMarkNotation("The bond is R1 200 000 over 20 years.")).toBe(
      "The bond is R1 200 000 over 20 years.",
    );
  });

  it("handles null, undefined and empty input without throwing", () => {
    expect(stripMarkNotation(null)).toBe("");
    expect(stripMarkNotation(undefined)).toBe("");
    expect(stripMarkNotation("")).toBe("");
    expect(stripMarkNotation("   ")).toBe("");
  });

  it("is idempotent — stripping twice equals stripping once", () => {
    const s = "Explain two reasons. (2 x 2) (4) √√ [10]";
    expect(stripMarkNotation(stripMarkNotation(s))).toBe(stripMarkNotation(s));
  });

  it("hasMarkNotation agrees with the stripper", () => {
    expect(hasMarkNotation("More (1) (1 x 1) (1)")).toBe(true);
    expect(hasMarkNotation("B√√")).toBe(true);
    expect(hasMarkNotation("Photosynthesis converts light to chemical energy.")).toBe(false);
    expect(hasMarkNotation(stripMarkNotation("Explain two reasons. (2 x 2) (4)"))).toBe(false);
  });
});

describe("isStimulusDependent", () => {
  it("rejects the Geography map card that started this task", () => {
    const v = isStimulusDependent({
      questionText:
        "The cost of developing infrastructure in blocks C4 and C5 will be (more/less) expensive.",
      // NOTE: needs_stimulus is FALSE on this row in production. Text detection
      // is the only thing that catches it.
      needsStimulus: false,
    });
    expect(v.dependent).toBe(true);
    expect(v.reasons).toContain("map_grid_reference");
  });

  it("rejects labelled stimulus references", () => {
    for (const q of [
      "Refer to FIGURE 2 and describe the landform.",
      "Study SOURCE 1B and answer the question.",
      "Read TEXT A and identify the tone.",
      "Verwys na BRON 3 en beantwoord die vraag.",
      "Bestudeer FIGUUR 1 en verduidelik.",
    ]) {
      expect(isStimulusDependent({ questionText: q }).dependent).toBe(true);
    }
  });

  it("rejects positional deixis — the learner has no page to look at", () => {
    expect(isStimulusDependent({ questionText: "Using the table above, calculate the mean." }).dependent).toBe(true);
    expect(isStimulusDependent({ questionText: "Explain the trend shown below." }).dependent).toBe(true);
    expect(isStimulusDependent({ questionText: "Verduidelik die tendens hierbo." }).dependent).toBe(true);
  });

  it("rejects cross-question references", () => {
    // Real row 43548: "…the PESTLE factor identified in QUESTION 2.3.1"
    const v = isStimulusDependent({
      questionText:
        "Explain ways in which RH can address the challenges posed by the PESTLE factor identified in QUESTION 2.3.1.",
    });
    expect(v.dependent).toBe(true);
    expect(v.reasons).toContain("cross_question_reference");
  });

  it("rejects bare artefact references but accepts a named work", () => {
    expect(isStimulusDependent({ questionText: "Describe the mood of the poem." }).dependent).toBe(true);
    expect(isStimulusDependent({ questionText: "Summarise the passage in your own words." }).dependent).toBe(true);
    // A quoted title names the work, so the learner knows what is being asked.
    expect(
      isStimulusDependent({ questionText: 'Describe the mood of the poem "Die Hand Vol Vere".' })
        .dependent,
    ).toBe(false);
  });

  it("respects the advisory columns when they are set", () => {
    expect(
      isStimulusDependent({ questionText: "Define inflation.", needsStimulus: true }).reasons,
    ).toContain("column_needs_stimulus");
    expect(
      isStimulusDependent({ questionText: "Define inflation.", stimulusText: "An extract..." })
        .reasons,
    ).toContain("column_stimulus_text_present");
  });

  it("ACCEPTS self-contained recall questions — the cards we actually want", () => {
    for (const q of [
      "Define the term inflation.",
      "Name the salary determination method used when a worker is paid per item produced.",
      "State two functions of the National Skills Development Strategy.",
      "Verduidelik die verskil tussen 'n debiet en 'n krediet.",
      "Calculate the gross profit if sales are R120 000 and cost of sales is R80 000.",
      "Which integration strategy involves taking over your suppliers?",
    ]) {
      const v = isStimulusDependent({ questionText: q });
      expect(v.dependent, `${q} -> ${v.reasons.join(",")}`).toBe(false);
    }
  });

  it("treats an empty question as dependent rather than usable", () => {
    expect(isStimulusDependent({ questionText: "" }).dependent).toBe(true);
    expect(isStimulusDependent({ questionText: null }).reasons).toContain("empty_question");
  });
});

describe("gateSource", () => {
  it("strips first, then judges — mark notation must not cause false rejects", () => {
    // "(1)" contains a digit; without stripping first, a naive grid-reference
    // rule could misfire. Cleaned text is what gets judged.
    const g = gateSource({
      questionText: "Name the salary method used when a worker is paid per item produced. (2)",
      memoText: "Piecework √√ — the worker is paid per unit of output rather than per hour.",
    });
    expect(g.usable).toBe(true);
    expect(g.cleanQuestion).toBe(
      "Name the salary method used when a worker is paid per item produced.",
    );
    expect(g.cleanMemo).toBe(
      "Piecework — the worker is paid per unit of output rather than per hour.",
    );
  });

  it("rejects the shipped Geography card end to end", () => {
    const g = gateSource({
      questionText:
        "The cost of developing infrastructure in blocks C4 and C5 will be (more/less) expensive. (1 x 1) (1)",
      memoText: "More (1) (1 x 1) (1)",
    });
    expect(g.usable).toBe(false);
    expect(g.reasons).toContain("map_grid_reference");
    // The memo strips down to "More", which teaches nothing on its own.
    expect(g.reasons).toContain("memo_too_thin");
  });

  it("rejects a memo that is only a marked MCQ letter", () => {
    const g = gateSource({
      questionText:
        "A business that takes over its suppliers to reduce dependency risk applies the ... integration strategy.",
      memoText: "B√√",
    });
    expect(g.usable).toBe(false);
    expect(g.reasons).toContain("memo_too_thin");
  });

  it("rejects questions that are too short or too long to be a card", () => {
    expect(gateSource({ questionText: "Define X.", memoText: "A long enough memo here." }).reasons)
      .toContain("question_too_short");
    expect(
      gateSource({ questionText: "A ".repeat(400), memoText: "A long enough memo here." }).reasons,
    ).toContain("question_too_long");
  });
});
