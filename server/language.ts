/**
 * Single source of truth for learner content language.
 *
 * THE RULE: the learner's language — chosen at onboarding, changeable in
 * settings — determines the language of ALL content they receive. Where
 * content genuinely does not exist in that language we fall back, but the
 * fallback is ALWAYS reported to the caller so the UI can tell the learner
 * ("shown in English — not available in Afrikaans"). We never switch
 * language silently.
 *
 * TWO REPRESENTATIONS EXIST — do not mix them:
 *   - Short form  "en" | "af"           → users.preferred_language,
 *                                         onboarding_results.preferred_language
 *                                         (DB CHECK constraints enforce this,
 *                                         see migrations/0017), API `?lang=`,
 *                                         and the client LanguageContext.
 *   - Long form   "English" | "Afrikaans" → dbe_verbatim_questions.language
 *
 * Comparing a short-form value against a long-form literal (e.g.
 * `preferredLanguage === "afrikaans"`) silently matches nothing and falls
 * through to the English default. That class of bug is why this module exists.
 */

export type LangCode = "en" | "af";
export type DbLanguage = "English" | "Afrikaans";

/**
 * Coerce any language-ish value to a short code. Accepts short form
 * ("en"/"af"), long form ("English"/"Afrikaans"), and any casing. Anything
 * unrecognised — including null/undefined and the African-language values
 * present in dbe_verbatim_questions — resolves to "en".
 */
export function normalizeLang(value: unknown): LangCode {
  if (typeof value !== "string") return "en";
  return value.trim().toLowerCase().startsWith("af") ? "af" : "en";
}

/** Map a short code to the long form stored in dbe_verbatim_questions.language. */
export function toDbLanguage(lang: LangCode): DbLanguage {
  return lang === "af" ? "Afrikaans" : "English";
}

/**
 * Resolve the language for a learner-facing request.
 *
 * Precedence: explicit `?lang=` on the request (the client always sends the
 * active LanguageContext value) → the learner's stored preference → "en".
 * The query param wins so that a learner who toggles language mid-session
 * gets the new language immediately, without waiting for the profile PATCH
 * to round-trip.
 */
export function resolveRequestLang(
  queryLang: unknown,
  storedPreference?: unknown,
): LangCode {
  if (typeof queryLang === "string" && queryLang.trim() !== "") {
    return normalizeLang(queryLang);
  }
  return normalizeLang(storedPreference);
}

/**
 * Describes what language content was actually served in, versus what the
 * learner asked for. Attach to any learner content response that can fall back.
 */
export interface LanguageMeta {
  /** What the learner asked for. */
  requested: LangCode;
  /** What we actually served. */
  served: LangCode;
  /** True when served !== requested, i.e. the learner should see a notice. */
  fellBack: boolean;
  /** Ready-to-render notice in the learner's own language, or null. */
  notice: string | null;
}

const FALLBACK_NOTICE: Record<LangCode, string> = {
  // Learner asked for Afrikaans, we served English.
  af: "Hierdie inhoud is nie in Afrikaans beskikbaar nie — dit word in Engels gewys.",
  // Learner asked for English, we served Afrikaans.
  en: "This content is not available in English — it is shown in Afrikaans.",
};

/** Build the language metadata block for a content response. */
export function languageMeta(requested: LangCode, served: LangCode): LanguageMeta {
  const fellBack = requested !== served;
  return {
    requested,
    served,
    fellBack,
    notice: fellBack ? FALLBACK_NOTICE[requested] : null,
  };
}
