import { describe, it, expect } from "vitest";
import {
  normalizeLang,
  toDbLanguage,
  resolveRequestLang,
  languageMeta,
} from "../../server/language";

describe("normalizeLang", () => {
  it("accepts the short form used by users.preferred_language", () => {
    expect(normalizeLang("en")).toBe("en");
    expect(normalizeLang("af")).toBe("af");
  });

  it("accepts the long form stored in dbe_verbatim_questions.language", () => {
    expect(normalizeLang("English")).toBe("en");
    expect(normalizeLang("Afrikaans")).toBe("af");
  });

  it("is case- and whitespace-insensitive", () => {
    expect(normalizeLang("AFRIKAANS")).toBe("af");
    expect(normalizeLang("  Af  ")).toBe("af");
    expect(normalizeLang("ENGLISH")).toBe("en");
  });

  it("defaults unknown, empty and non-string values to English", () => {
    expect(normalizeLang(null)).toBe("en");
    expect(normalizeLang(undefined)).toBe("en");
    expect(normalizeLang("")).toBe("en");
    expect(normalizeLang(42)).toBe("en");
  });

  it("maps the African-language corpus values to English rather than throwing", () => {
    // dbe_verbatim_questions also holds Setswana/isiZulu/etc. The learner UI is
    // EN/AF only, so these must resolve to the English default.
    for (const l of ["Setswana", "isiZulu", "isiXhosa", "Sepedi", "Tshivenda"]) {
      expect(normalizeLang(l)).toBe("en");
    }
  });
});

describe("toDbLanguage", () => {
  it("maps short codes to the long form the questions table stores", () => {
    expect(toDbLanguage("af")).toBe("Afrikaans");
    expect(toDbLanguage("en")).toBe("English");
  });

  it("round-trips through normalizeLang", () => {
    expect(normalizeLang(toDbLanguage("af"))).toBe("af");
    expect(normalizeLang(toDbLanguage("en"))).toBe("en");
  });
});

describe("resolveRequestLang", () => {
  it("prefers an explicit request language over the stored preference", () => {
    expect(resolveRequestLang("af", "en")).toBe("af");
    expect(resolveRequestLang("en", "af")).toBe("en");
  });

  it("falls back to the stored preference when no request language is given", () => {
    expect(resolveRequestLang(undefined, "af")).toBe("af");
    expect(resolveRequestLang("", "af")).toBe("af");
    expect(resolveRequestLang(null, "af")).toBe("af");
  });

  it("defaults to English when neither is usable", () => {
    expect(resolveRequestLang(undefined, undefined)).toBe("en");
    expect(resolveRequestLang(null, null)).toBe("en");
  });

  it("normalises a long-form stored preference (regression: the 'afrikaans' trap)", () => {
    // The daily-challenge route compared preferredLanguage against 'afrikaans'
    // while the column is CHECK-constrained to 'en'|'af' — the comparison was
    // dead and every learner silently got English. Both forms must work here.
    expect(resolveRequestLang(undefined, "afrikaans")).toBe("af");
    expect(resolveRequestLang(undefined, "af")).toBe("af");
  });
});

describe("languageMeta", () => {
  it("reports no fallback when served matches requested", () => {
    const m = languageMeta("af", "af");
    expect(m.fellBack).toBe(false);
    expect(m.notice).toBeNull();
    expect(m.served).toBe("af");
  });

  it("flags a fallback and returns a notice in the learner's own language", () => {
    const af = languageMeta("af", "en");
    expect(af.fellBack).toBe(true);
    expect(af.notice).toContain("Afrikaans");

    const en = languageMeta("en", "af");
    expect(en.fellBack).toBe(true);
    expect(en.notice).toContain("English");
  });

  it("never returns a silent switch — fellBack always implies a notice", () => {
    for (const [req, served] of [["af", "en"], ["en", "af"]] as const) {
      const m = languageMeta(req, served);
      expect(m.fellBack).toBe(true);
      expect(m.notice).toBeTruthy();
    }
  });
});
