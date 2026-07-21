import { describe, it, expect, vi } from "vitest";

vi.mock("../../server/db", () => ({ db: {} }));
vi.mock("pdf-parse", () => ({ default: vi.fn(), PDFParse: vi.fn() }));
vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
  sql: vi.fn(),
  relations: vi.fn(),
}));

import {
  extractMcqOptions,
  stripOptionsFromText,
  extractMcqAnswer,
  extractMcqAnswerLetters,
  serialiseCorrectOptions,
  parseCorrectOptions,
  recoverMarks,
  extractStimulus,
  questionNeedsStimulus,
  extractSubQuestions,
} from "../../server/dbe-ingestion";

// ────────────────────────────────────────────────────────────────────────────
// MCQ / MARKS / STIMULUS STRUCTURE RECOVERY
//
// Fixtures are verbatim `pdf-parse` output from the real source PDFs
// (Hospitality Studies P1, 2024 and 2025, both languages). The SAME question —
// 1.4.2 — is flattened THREE different ways depending on the PDF's internal
// table layout, which is why a single line-anchored parser recovered nothing
// and `mcq_options` was NULL on all 38,299 released rows.
// ────────────────────────────────────────────────────────────────────────────

// SHAPE 1 — Afrikaans 2025 P1 Q1.4.2, one option per line.
const SHAPE1 = [
  "Identifiseer TWEE simptome in die lys hieronder wat deur iemand",
  "wat hepatitis A opgedoen het, vertoon kan word. Skryf slegs die",
  "letters \t(A–D) \tlangs \tdie \tvraagnommer \t(1.4.2) \tin \tdie",
  "ANTWOORDEBOEK neer.",
  "A \tGeel vel",
  "B \tBlou dood",
  "C \tVerlies aan eetlus",
  "D \tLae bloeddruk \t(2)",
].join("\n");

// SHAPE 2 — English 2025 P1 Q1.4.2, letter column then text column.
const SHAPE2 = [
  "Identify TWO symptoms that could be displayed by someone who",
  "has contracted hepatitis A in the list below. Write only the letters",
  "(A–D) next to the question number (1.4.2) in the ANSWER BOOK.",
  "A", "B", "C", "D",
  "Yellow skin", "Blue death", "Loss of appetite", "Low blood pressure \t(2)",
].join("\n");

// SHAPE 3 — what dbe_verbatim_questions stores TODAY for row 85619: the same
// question with every newline collapsed to a single space.
const SHAPE3 =
  "Identifiseer TWEE simptome in die lys hieronder wat deur iemand wat hepatitis A " +
  "opgedoen het, vertoon kan word. Skryf slegs die letters (A–D) langs die vraagnommer " +
  "(1.4.2) in die ANTWOORDEBOEK neer. A Geel vel B Blou dood C Verlies aan eetlus " +
  "D Lae bloeddruk (2)";

describe("extractMcqOptions", () => {
  it("recovers per-line options (SHAPE 1)", () => {
    expect(extractMcqOptions(SHAPE1)).toEqual([
      { letter: "A", text: "Geel vel" },
      { letter: "B", text: "Blou dood" },
      { letter: "C", text: "Verlies aan eetlus" },
      { letter: "D", text: "Lae bloeddruk" },
    ]);
  });

  it("recovers column-flattened options (SHAPE 2)", () => {
    expect(extractMcqOptions(SHAPE2)).toEqual([
      { letter: "A", text: "Yellow skin" },
      { letter: "B", text: "Blue death" },
      { letter: "C", text: "Loss of appetite" },
      { letter: "D", text: "Low blood pressure" },
    ]);
  });

  it("recovers inline run-on options from already-stored text (SHAPE 3)", () => {
    expect(extractMcqOptions(SHAPE3)).toEqual([
      { letter: "A", text: "Geel vel" },
      { letter: "B", text: "Blou dood" },
      { letter: "C", text: "Verlies aan eetlus" },
      { letter: "D", text: "Lae bloeddruk" },
    ]);
  });

  it("does not anchor on a stray capital A inside the stem", () => {
    // "hepatitis A opgedoen" precedes the real option A. Anchoring there would
    // make option A swallow the remainder of the question stem.
    const opts = extractMcqOptions(SHAPE3);
    expect(opts[0].text).toBe("Geel vel");
    expect(opts[0].text).not.toContain("hepatitis");
  });

  it("does not treat a stem beginning with a capital letter as an option", () => {
    // The paper's own worked example: the stem starts "A good source of…".
    const example = [
      "A good source of vitamin C is …",
      "A \tmilk.",
      "B \toranges.",
      "C \tmeat.",
      "D \tbread.",
    ].join("\n");
    expect(extractMcqOptions(example)).toEqual([
      { letter: "A", text: "milk." },
      { letter: "B", text: "oranges." },
      { letter: "C", text: "meat." },
      { letter: "D", text: "bread." },
    ]);
  });

  it("keeps the final option when a non-option line follows it", () => {
    const withTrailer = [
      "Choose the correct answer (A–D).",
      "A \tmilk.",
      "B \toranges.",
      "C \tmeat.",
      "D \tbread.",
      "ANSWER:",
      "1.1.11 \tB",
    ].join("\n");
    expect(extractMcqOptions(withTrailer).map((o) => o.letter)).toEqual(["A", "B", "C", "D"]);
  });

  it("returns nothing for ordinary prose", () => {
    expect(extractMcqOptions("Explain how a business can improve cash flow. (4)")).toEqual([]);
    expect(extractMcqOptions("A business must plan. B grade students often struggle.")).toEqual([]);
    expect(extractMcqOptions("Vitamin A deficiency causes night blindness. (2)")).toEqual([]);
    expect(extractMcqOptions("")).toEqual([]);
  });

  it("refuses to invent boundaries when the column form has collapsed", () => {
    // "A B C D Yellow skin Blue death …" — the option boundaries are genuinely
    // unknowable from this string. Returning nothing is correct; guessing a
    // split would fabricate the learner's choices.
    const collapsed =
      "Identify TWO symptoms … Write only the letters (A–D) next to the question " +
      "number (1.4.2) in the ANSWER BOOK. A B C D Yellow skin Blue death Loss of appetite " +
      "Low blood pressure (2)";
    expect(extractMcqOptions(collapsed)).toEqual([]);
  });
});

describe("stripOptionsFromText", () => {
  it("leaves a clean stem the UI can render options beneath", () => {
    const opts = extractMcqOptions(SHAPE3);
    const stem = stripOptionsFromText(SHAPE3, opts);
    expect(stem).not.toContain("Geel vel");
    expect(stem).not.toContain("Lae bloeddruk");
    expect(stem).toContain("Identifiseer TWEE simptome");
    expect(stem).toMatch(/\(2\)$/); // the mark allocation belongs to the stem
  });

  it("returns the text unchanged when there are no options", () => {
    const t = "Explain ONE cause of injuries when handling materials. (1)";
    expect(stripOptionsFromText(t, [])).toBe(t);
  });
});

describe("extractSubQuestions", () => {
  it("preserves the raw line breaks that carry option structure", () => {
    // `text` is collapsed for storage, but `rawBlock` must keep the newlines —
    // collapsing before option extraction is what made mcq_options 100% NULL.
    const section = ["QUESTION 1", "1.1 \tPick one.", "A \tmilk.", "B \toranges.", "C \tmeat."].join("\n");
    const subs = extractSubQuestions(section, "1");
    expect(subs).toHaveLength(1);
    expect(subs[0].rawBlock).toContain("\n");
    expect(subs[0].text).not.toContain("\n");
  });
});

describe("extractMcqAnswerLetters", () => {
  it("reads a single-letter answer", () => {
    expect(extractMcqAnswerLetters("1.1.1 \tC \tM22 F76")).toEqual(["C"]);
    expect(extractMcqAnswerLetters("Answer: B")).toEqual(["B"]);
  });

  it("reads multi-letter selection answers through the artifact noise", () => {
    // Row 85619's memo — order-insensitive, 2 marks.
    expect(extractMcqAnswerLetters("A C Enige volgorde M194 F37 (2)")).toEqual(["A", "C"]);
    expect(extractMcqAnswerLetters("A C (Any order) M22 F76 (2)")).toEqual(["A", "C"]);
    // Q1.4.1 — four letters, 4 marks.
    expect(extractMcqAnswerLetters("1.4.1 \tA C E H \tEnige volgorde \tM60 F20\n(4)")).toEqual([
      "A", "C", "E", "H",
    ]);
  });

  it("never mines prose for an answer letter", () => {
    expect(extractMcqAnswerLetters("The learner must explain the process clearly. (3)")).toEqual([]);
    expect(extractMcqAnswerLetters(null)).toEqual([]);
  });

  it("round-trips through the correct_option column format", () => {
    expect(serialiseCorrectOptions(["A", "C"])).toBe("A,C");
    expect(serialiseCorrectOptions([])).toBeNull();
    expect(parseCorrectOptions("A,C")).toEqual(["A", "C"]);
    expect(parseCorrectOptions(null)).toEqual([]);
  });

  it("does not truncate a multi-letter answer to its first letter", () => {
    // The single-letter accessor must decline rather than silently return "A",
    // which would mark a learner who correctly wrote "A C" as wrong.
    expect(extractMcqAnswer("A C Enige volgorde M194 F37 (2)")).toBeNull();
    expect(extractMcqAnswer("1.1.1 \tC")).toBe("C");
  });
});

describe("recoverMarks", () => {
  it("reads a trailing allocation from the question", () => {
    expect(recoverMarks("Name the organ affected. (1)", null)).toBe(1);
    expect(recoverMarks("Justify your answer. [4]", null)).toBe(4);
  });

  it("falls back to the memo mark cell", () => {
    expect(recoverMarks("Name the organ affected.", "Liver✓ M22 F76 (1)")).toBe(1);
  });

  it("falls back to counting ticks — one per mark by DBE convention", () => {
    expect(recoverMarks("Give TWO reasons.", "Contagious✓ Fatigue✓")).toBe(2);
  });

  it("returns null rather than guess", () => {
    expect(recoverMarks("Discuss the implications.", null)).toBeNull();
    expect(recoverMarks("", "")).toBeNull();
  });

  it("rejects implausible mark totals", () => {
    expect(recoverMarks("Question text (999)", null)).toBeNull();
  });
});

describe("extractStimulus / questionNeedsStimulus", () => {
  // Hospitality Studies 2024 P1 Q2.1 — the scenario all four of its
  // sub-questions depend on, and which ingestion previously dropped entirely.
  const SECTION = [
    "VRAAG 2",
    "2.1 Bestudeer die scenario hieronder en beantwoord die vrae wat volg.",
    "MTT Hotel is ’n populere toeriste-onderneming in Suid-Afrika.",
    "Die hotel het tydens ’n besige seisoen ’n groep afgetrede onderwysers verwag.",
    "Daar was skielik waarskuwings oor ’n hepatitis A-uitbreking in die gebied.",
    "2.1.1 Noem die orgaan in die liggaam wat geaffekteer word. (1)",
    "2.1.2 Stel EEN voorkomende maatreel voor. (1)",
  ].join("\n");

  it("captures the scenario a question group depends on", () => {
    const stim = extractStimulus(SECTION, "2.1");
    expect(stim).toContain("MTT Hotel");
    expect(stim).toContain("hepatitis A-uitbreking");
    // The sub-questions themselves are not stimulus.
    expect(stim).not.toContain("Noem die orgaan");
  });

  it("returns null when the preamble is only an instruction line", () => {
    const bare = [
      "3.1 Study the extract below and answer the questions that follow.",
      "3.1.1 What is X? (2)",
    ].join("\n");
    expect(extractStimulus(bare, "3.1")).toBeNull();
  });

  it("flags a question that references material we could not recover", () => {
    expect(questionNeedsStimulus("Refer to the extract above and explain X. (3)", null, false)).toBe(true);
    expect(questionNeedsStimulus("Study the diagram below. (2)", null, false)).toBe(true);
  });

  it("does not flag a question whose stimulus we captured", () => {
    expect(questionNeedsStimulus("Refer to the extract above. (3)", "Real extract text", false)).toBe(false);
  });

  it("does not flag an MCQ — its options ARE the referenced list", () => {
    expect(questionNeedsStimulus("Identify TWO symptoms in the list below. (2)", null, true)).toBe(false);
  });

  it("does not flag a self-contained question", () => {
    expect(questionNeedsStimulus("Name the organ affected by hepatitis A. (1)", null, false)).toBe(false);
  });
});
