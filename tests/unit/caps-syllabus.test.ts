/**
 * tests/unit/caps-syllabus.test.ts
 *
 * Pure-function guards for the CAPS full-syllabus + literature coverage path
 * (server/caps-syllabus.ts). No DB, no OpenAI — this module is deliberately
 * data + string building so the two things the owner asked to be tested are
 * testable in isolation:
 *   - CAPS topic enumeration per subject (the "every topic, not just examined"
 *     guarantee starts here).
 *   - the literature-card builder: prompt shape, the copyright / over-quote
 *     guard, and the flashcards-table row shape.
 */
import { describe, it, expect } from "vitest";
import {
  subjectNameToCode,
  subjectCodeToName,
  enumerateCapsTopics,
  capsTopicCount,
  isLiteratureSubject,
  getLiteratureWorks,
  literatureTopicName,
  topicKeywords,
  buildSyllabusCardsPrompt,
  buildLiteratureCardsPrompt,
  exceedsQuoteAllowance,
  toCapsFlashcardRows,
  type FlatLiteratureWork,
} from "../../server/caps-syllabus";

describe("subjectNameToCode", () => {
  it("maps full English subject names to CAPS codes", () => {
    expect(subjectNameToCode("Life Sciences")).toBe("LIFE");
    expect(subjectNameToCode("English Home Language")).toBe("ENGH");
    expect(subjectNameToCode("Accounting")).toBe("ACC");
    expect(subjectNameToCode("Geography")).toBe("GEO");
  });

  it("is case- and whitespace-insensitive and accepts the Afrikaans name", () => {
    // Prod ships both "Dance Studies" and "Dance studies" — both must resolve.
    expect(subjectNameToCode("Dance studies")).toBe("DANCE");
    expect(subjectNameToCode("  economics  ")).toBe("ECO");
    expect(subjectNameToCode("Wiskunde")).toBe("MATH"); // Afrikaans name
  });

  it("returns null for subjects with no CAPS mapping", () => {
    expect(subjectNameToCode("South African Sign Language")).toBeNull();
    expect(subjectNameToCode("English Second Additional Language")).toBeNull();
  });

  it("round-trips code → canonical name", () => {
    expect(subjectCodeToName("LIFE")).toBe("Life Sciences");
    expect(subjectCodeToName("UNKNOWN")).toBe("UNKNOWN");
  });
});

describe("enumerateCapsTopics", () => {
  it("returns the full CAPS Grade 12 topic list for Life Sciences (4 strands' topics)", () => {
    const topics = enumerateCapsTopics("Life Sciences");
    const names = topics.map((t) => t.name);
    expect(names).toContain("DNA and RNA");
    expect(names).toContain("Meiosis");
    expect(names).toContain("Genetics and Inheritance");
    expect(names).toContain("Evolution");
    expect(topics.length).toBeGreaterThanOrEqual(8);
    // every topic carries a bilingual label + a caps code
    for (const t of topics) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.nameAfrikaans.length).toBeGreaterThan(0);
      expect(t.capsCode).toMatch(/^LIFE-\d+$/);
    }
  });

  it("covers the subject-specific structures the owner named", () => {
    // Accounting: companies, cost accounting/manufacturing, budgeting, inventory
    const acc = enumerateCapsTopics("Accounting").map((t) => t.name);
    expect(acc).toContain("Companies: Financial Statements");
    expect(acc).toContain("Manufacturing");
    expect(acc).toContain("Budgeting");
    expect(acc).toContain("Inventory Valuation");
    // Geography: climatology, geomorphology, settlement, economic geography
    const geo = enumerateCapsTopics("Geography").map((t) => t.name);
    expect(geo).toContain("Climate and Weather");
    expect(geo).toContain("Geomorphology");
    expect(geo).toContain("Settlement Geography");
    expect(geo).toContain("Economic Geography");
  });

  it("returns an empty list for subjects with thin CAPS data", () => {
    expect(enumerateCapsTopics("South African Sign Language")).toEqual([]);
    expect(capsTopicCount("South African Sign Language")).toBe(0);
    expect(capsTopicCount("Life Sciences")).toBeGreaterThan(0);
  });
});

describe("topicKeywords", () => {
  it("drops stopwords and short tokens, keeps content words", () => {
    expect(topicKeywords("Companies: Financial Statements")).toEqual(["companies", "financial", "statements"]);
    // "and" / "the" dropped; "DNA"/"RNA" are 3 letters → dropped by the >3 rule
    expect(topicKeywords("Genetics and Inheritance")).toEqual(["genetics", "inheritance"]);
  });
});

describe("isLiteratureSubject / getLiteratureWorks", () => {
  it("flags the English & Afrikaans subjects that carry prescribed works", () => {
    expect(isLiteratureSubject("English Home Language")).toBe(true);
    expect(isLiteratureSubject("Afrikaans First Additional Language")).toBe(true);
    expect(isLiteratureSubject("Mathematics")).toBe(false);
    // African-language subjects are language subjects but ship no work list here
    expect(isLiteratureSubject("isiZulu Home Language")).toBe(false);
  });

  it("flattens set works across novel/drama/poetry/short-story categories", () => {
    const works = getLiteratureWorks("English Home Language");
    const titles = works.map((w) => w.title);
    expect(titles).toContain("Animal Farm");
    expect(titles).toContain("Othello");
    const types = new Set(works.map((w) => w.type));
    expect(types.has("novel")).toBe(true);
    expect(types.has("drama")).toBe(true);
    expect(types.has("poetry")).toBe(true);
    expect(types.has("short_stories")).toBe(true);
    // each flattened work exposes its category labels
    for (const w of works) {
      expect(typeof w.categoryLabel).toBe("string");
      expect(w.categoryLabel.length).toBeGreaterThan(0);
    }
  });

  it("maps set-work type to a real CAPS 'Literature: …' topic name", () => {
    expect(literatureTopicName("novel")).toBe("Literature: Novel");
    expect(literatureTopicName("poetry")).toBe("Literature: Poetry");
    expect(literatureTopicName("short_stories")).toBe("Literature: Short Stories");
  });
});

describe("exceedsQuoteAllowance (copyright guard)", () => {
  it("allows a short quoted work title and ordinary prose", () => {
    expect(exceedsQuoteAllowance('In "Animal Farm", the windmill symbolises the workers\' exploited labour.')).toBe(false);
    expect(exceedsQuoteAllowance('Napoleon represents Stalin; the pigs seize power gradually.')).toBe(false);
    expect(exceedsQuoteAllowance('The slogan "all animals are equal" is later corrupted.')).toBe(false);
  });

  it("rejects a reproduced passage (a single long quoted span)", () => {
    const passage = '"' + "It was a bright cold day in April and the clocks were striking thirteen as Winston hurried home".slice(0, 120) + '"';
    expect(exceedsQuoteAllowance(passage)).toBe(true);
  });

  it("rejects too many quoted words across a card", () => {
    expect(exceedsQuoteAllowance('"one two three four five six" and "seven eight nine ten eleven twelve" and "thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone"')).toBe(true);
  });

  it("rejects stacked poetry lines even without quotes", () => {
    expect(exceedsQuoteAllowance("line one\nline two\nline three\nline four")).toBe(true);
  });

  it("is null/undefined safe", () => {
    expect(exceedsQuoteAllowance(null)).toBe(false);
    expect(exceedsQuoteAllowance(undefined)).toBe(false);
  });
});

describe("buildSyllabusCardsPrompt", () => {
  it("lists every topic and asks for a traceable topic_index", () => {
    const topics = enumerateCapsTopics("Geography").slice(0, 3);
    const prompt = buildSyllabusCardsPrompt("Geography", topics, 2);
    expect(prompt).toContain("Subject: Geography");
    for (const t of topics) expect(prompt).toContain(t.name);
    expect(prompt).toContain("topic_index");
  });
});

describe("buildLiteratureCardsPrompt", () => {
  const work: FlatLiteratureWork = {
    id: "engh-nov-1", title: "Animal Farm", author: "George Orwell",
    type: "novel", typeLabel: "Novel", typeLabelAf: "Roman",
    categoryLabel: "Novel", categoryLabelAf: "Roman",
  };

  it("names the work + author and forbids reproducing the text", () => {
    const prompt = buildLiteratureCardsPrompt("English Home Language", work, 4);
    expect(prompt).toContain('"Animal Farm"');
    expect(prompt).toContain("George Orwell");
    expect(prompt).toMatch(/do NOT reproduce/i);
  });

  it("omits a 'Various' author gracefully", () => {
    const anthology: FlatLiteratureWork = { ...work, title: "DBE Poetry Anthology", author: "Various", type: "poetry", typeLabel: "Poetry", categoryLabel: "Poetry Anthology" };
    const prompt = buildLiteratureCardsPrompt("English Home Language", anthology, 3);
    expect(prompt).toContain('"DBE Poetry Anthology"');
    expect(prompt).not.toMatch(/by Various/i);
  });
});

describe("toCapsFlashcardRows (flashcards table row builder)", () => {
  const card = {
    front: "What does the windmill symbolise in \"Animal Farm\"?",
    back: "The exploited labour of the working class, repeatedly promised reward but never rewarded.",
    frontAf: "Wat simboliseer die windmeul in \"Animal Farm\"?",
    backAf: "Die uitgebuite arbeid van die werkersklas — herhaaldelik beloof, nooit beloon nie.",
    cardType: "basic",
    difficulty: "medium",
    topic: "Literature: Novel",
  };

  it("emits exactly two rows (en, af) with a nullable source for syllabus/literature cards", () => {
    const rows = toCapsFlashcardRows(card, {
      subject: "English Home Language",
      source: "caps_literature",
      sourceQuestionId: null,
      qualityScore: 88,
      model: "gpt-4o-mini",
      capsCode: "ENGH",
      grounded: false,
      work: "Animal Farm",
      aspect: "theme",
    });
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.language)).toEqual(["en", "af"]);
    expect(rows[0].front).toBe(card.front);
    expect(rows[1].front).toBe(card.frontAf);
    for (const r of rows) {
      expect(r.subject).toBe("English Home Language");
      expect(r.topic).toBe("Literature: Novel");
      expect(r.source).toBe("caps_literature");
      expect(r.sourceQuestionId).toBeNull();
      expect(r.qualityScore).toBe(88);
      expect((r.metadata as any).work).toBe("Animal Farm");
      expect((r.metadata as any).aspect).toBe("theme");
      expect((r.metadata as any).grounded).toBe(false);
      expect((r.metadata as any).generator).toBe("caps-literature/v1");
    }
  });

  it("keeps the bank source id when a topic card was grounded", () => {
    const rows = toCapsFlashcardRows({ ...card, topic: "DNA and RNA" }, {
      subject: "Life Sciences",
      source: "caps_syllabus",
      sourceQuestionId: 4242,
      qualityScore: 91,
      model: "gpt-4o-mini",
      capsCode: "LIFE",
      grounded: true,
    });
    expect(rows[0].sourceQuestionId).toBe(4242);
    expect(rows[0].source).toBe("caps_syllabus");
    expect((rows[0].metadata as any).generator).toBe("caps-syllabus/v1");
    expect((rows[0].metadata as any).grounded).toBe(true);
  });
});
