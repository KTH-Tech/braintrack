/**
 * CAPS Syllabus + Literature — full-curriculum flashcard coverage.
 *
 * WHY THIS EXISTS
 * ---------------
 * server/content-generators.ts → generateFlashcardsForSubject() is BANK-DERIVED:
 * it mines dbe_verbatim_questions (past DBE papers) and can therefore only cover
 * topics that were EXAMINED. Two gaps follow:
 *
 *   1. CAPS topics the past papers never (or rarely) sampled get no cards at all,
 *      so the deck is not "the whole curriculum" — it is "the examined slice".
 *   2. Prescribed LITERATURE set works (novels, dramas, poetry, short stories)
 *      are excluded outright: the bank flashcard path skips language P2 because
 *      set-work questions are context-bound to a text the learner does not have.
 *
 * The owner wants the deck to cover ALL CAPS Grade 12 content per subject AND the
 * prescribed literature. This module supplies the *syllabus* side of that:
 *
 *   • enumerateCapsTopics()  — the official CAPS Grade 12 topic list per subject,
 *     sourced from the same CAPS_TOPICS map the app already uses (client lib) so
 *     there is a single source of truth and no drift.
 *   • getLiteratureWorks()   — the prescribed set works per language subject, from
 *     the app's CAPS_LITERATURE map.
 *   • buildSyllabusCardsPrompt() / buildLiteratureCardsPrompt() — prompts that
 *     synthesise matric-standard, CAPS-aligned, bilingual study cards for a topic
 *     or a set work, WITHOUT any bank source (source_question_id stays null).
 *   • toCapsFlashcardRows() — the two per-language rows for the flashcards table,
 *     mirroring server/flashcard-generator.ts → toFlashcardRows() but with a
 *     nullable source (the column is nullable) and a distinct `source` tag so the
 *     CAPS path is idempotent and never collides with the bank-derived rows.
 *   • exceedsQuoteAllowance() — copyright guard: flashcards are study aids ABOUT a
 *     work (themes/characters/context), never a reproduction of it. A card that
 *     smuggles a passage/poem/extended quote is rejected.
 *
 * Nothing in here reads a DB or calls OpenAI — it is pure data + string building
 * so the enumeration and the literature-card builder are unit-testable in
 * isolation (tests/unit/caps-syllabus.test.ts). The orchestration that actually
 * calls the model and writes rows lives in server/content-generators.ts.
 */
import { GRADE_12_SUBJECTS, CAPS_TOPICS } from "../client/src/lib/constants";
import {
  CAPS_LITERATURE,
  type LiteratureWork,
  type LiteratureCategory,
} from "../client/src/lib/literature-caps";

// ─────────────────────────────────────────────────────────────────────────────
// Subject name ↔ code
//
// The bank / content generators speak subject *names* ("Life Sciences",
// "English Home Language"). CAPS_TOPICS / CAPS_LITERATURE are keyed by *code*
// ("LIFE", "ENGH"). GRADE_12_SUBJECTS is the bridge. Matching is case- and
// whitespace-insensitive and also accepts the Afrikaans name, because a handful
// of released subjects arrive with minor casing differences ("Dance studies").
// ─────────────────────────────────────────────────────────────────────────────

export interface CapsTopic {
  name: string;
  nameAfrikaans: string;
  capsCode: string;
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

const NAME_TO_CODE = new Map<string, string>();
const CODE_TO_NAME = new Map<string, string>();
for (const s of GRADE_12_SUBJECTS) {
  CODE_TO_NAME.set(s.code, s.name);
  NAME_TO_CODE.set(norm(s.name), s.code);
  NAME_TO_CODE.set(norm(s.nameAfrikaans), s.code);
}

/** Resolve a subject name (EN or AF, any casing) to its CAPS subject code. */
export function subjectNameToCode(subject: string): string | null {
  return NAME_TO_CODE.get(norm(subject)) ?? null;
}

/** Canonical English subject name for a CAPS code, or the code if unknown. */
export function subjectCodeToName(code: string): string {
  return CODE_TO_NAME.get(code) ?? code;
}

// ─────────────────────────────────────────────────────────────────────────────
// Topic enumeration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The full official CAPS Grade 12 topic list for a subject, in curriculum order.
 * Empty when the subject is not in the CAPS map (e.g. "South African Sign
 * Language", the *Second Additional Language* variants) — callers treat an empty
 * list as "CAPS topic data is thin for this subject" and report it honestly.
 */
export function enumerateCapsTopics(subject: string): CapsTopic[] {
  const code = subjectNameToCode(subject);
  if (!code) return [];
  return CAPS_TOPICS[code] ?? [];
}

/** Number of CAPS topics enumerated for a subject. */
export function capsTopicCount(subject: string): number {
  return enumerateCapsTopics(subject).length;
}

const TOPIC_STOPWORDS = new Set([
  "and", "the", "of", "in", "to", "for", "with", "on", "a", "an",
  "en", "die", "van", "vir", "met", "op", "'n",
  "studies", "general", "other", "introduction", "literature",
]);

/**
 * Lexical keys for bucketing bank questions into a CAPS topic. Mirrors the
 * bucketing scheme in server/flashcard-generator.ts so grounding a CAPS topic in
 * bank material uses the same signal the bank pipeline already trusts.
 */
export function topicKeywords(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-zà-ɏ]+/)
    .filter((w) => w.length > 3 && !TOPIC_STOPWORDS.has(w));
}

// ─────────────────────────────────────────────────────────────────────────────
// Language-subject helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * True for the language subjects that carry prescribed literature set works in
 * CAPS_LITERATURE (English & Afrikaans HL/FAL/SAL). The African-language subjects
 * ARE language subjects, but the app ships no prescribed-work list for them, so
 * they are not literature-covered here (reported as such).
 */
export function isLiteratureSubject(subject: string): boolean {
  const code = subjectNameToCode(subject);
  return !!code && !!CAPS_LITERATURE[code];
}

/**
 * Whether an Afrikaans side is meaningful for this subject. The whole app stores
 * one row per (card, language) in {en, af}. For most subjects both are wanted.
 * For a non-Afrikaans *language* subject (English, isiZulu, …) an Afrikaans
 * translation of a literature card about an English set work is noise, so those
 * literature cards are English-only. Content subjects keep EN+AF as before.
 */
export function subjectAllowsAfrikaansLiterature(subject: string): boolean {
  const code = subjectNameToCode(subject);
  if (!code) return false;
  // Afrikaans language subjects: cards are Afrikaans-first (+ EN gloss kept).
  return code.startsWith("AFR");
}

/** English-medium language subject (its set works and analysis are in English). */
export function isEnglishLanguageSubject(subject: string): boolean {
  const code = subjectNameToCode(subject);
  return code === "ENGH" || code === "ENGF" || code === "ENGS";
}

// ─────────────────────────────────────────────────────────────────────────────
// Literature set works
// ─────────────────────────────────────────────────────────────────────────────

export interface FlatLiteratureWork extends LiteratureWork {
  categoryLabel: string;
  categoryLabelAf: string;
}

/** Every prescribed set work for a subject, flattened across categories. */
export function getLiteratureWorks(subject: string): FlatLiteratureWork[] {
  const code = subjectNameToCode(subject);
  if (!code) return [];
  const cats: LiteratureCategory[] = CAPS_LITERATURE[code] ?? [];
  const out: FlatLiteratureWork[] = [];
  for (const cat of cats) {
    for (const w of cat.works) {
      out.push({ ...w, categoryLabel: cat.label, categoryLabelAf: cat.labelAf });
    }
  }
  return out;
}

/** The CAPS "Literature: <type>" topic label a set work belongs under, so a
 *  literature card is tagged with a real syllabus topic name. */
export function literatureTopicName(type: LiteratureWork["type"]): string {
  switch (type) {
    case "novel": return "Literature: Novel";
    case "drama": return "Literature: Drama";
    case "poetry": return "Literature: Poetry";
    case "short_stories": return "Literature: Short Stories";
    default: return "Literature";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Copyright guard — flashcards are ABOUT a work, never a reproduction of it
// ─────────────────────────────────────────────────────────────────────────────

/**
 * True when a piece of card text reproduces too much of the source work.
 * Study aids may name a work, discuss its themes/characters, and cite a SHORT
 * phrase for analysis, but must not paste passages, poems or extended quotes.
 *
 * Two triggers:
 *   • any single quoted span longer than MAX_QUOTE_CHARS (a passage, not a phrase)
 *   • more than MAX_QUOTE_WORDS words inside quotes in total across the text
 * Titles in quotes are short and never trip either bound.
 */
export const MAX_QUOTE_CHARS = 90;
export const MAX_QUOTE_WORDS = 20;

export function exceedsQuoteAllowance(text: string | null | undefined): boolean {
  const s = String(text ?? "");
  // Normalise smart quotes to straight so one regex catches both.
  const flat = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  const spans = flat.match(/"([^"]{1,400})"/g) ?? [];
  let quotedWords = 0;
  for (const raw of spans) {
    const inner = raw.slice(1, -1).trim();
    if (inner.length > MAX_QUOTE_CHARS) return true;
    quotedWords += inner.split(/\s+/).filter(Boolean).length;
  }
  if (quotedWords > MAX_QUOTE_WORDS) return true;
  // Poetry reproduction often survives without quotes: several short lines
  // stacked with line breaks. Reject 4+ line-break-separated fragments.
  const lineFragments = flat.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lineFragments.length >= 4) return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompts — syllabus (topic) cards
// ─────────────────────────────────────────────────────────────────────────────

export const SYLLABUS_CARD_SYSTEM = `You write flashcards for South African NSC (matric, Grade 12) learners strictly from the CAPS curriculum.

You are given a subject and a numbered list of official CAPS Grade 12 topics for it. For each topic, write small, atomic study cards that teach the core recallable knowledge a Grade 12 learner is expected to know for that topic. There is NO past-paper source — you are generating from the syllabus itself, so factual accuracy and staying ON the CAPS Grade 12 syllabus are paramount.

HARD RULES
1. CAPS-ALIGNED & MATRIC-STANDARD. Only content in the CAPS Grade 12 syllabus for THIS subject and topic. Never teach a method, formula, definition or example that is off-syllabus or that CAPS does not use. (Example: CAPS Grade 12 Accounting inventory valuation uses FIFO and weighted average — NEVER LIFO. Do not introduce content the curriculum excludes.)
2. FACTUALLY CORRECT. Every card must be true and unambiguous. If you are not certain a fact is correct and on-syllabus, do not write the card. A missing card is far better than a wrong one.
3. ATOMIC. One fact, definition, process step, formula, cause→effect link, or worked idea per card.
4. LEARNER VOICE, SECOND PERSON. The back gives the actual answer directly, as if explaining to the learner. Never "the candidate…", never describe what an answer "should contain" — give the content.
5. NO RUBRIC / NO MARK NOTATION. No "FOKUS", "KENMERKE", "the candidate", "accept any", tick marks, or mark allocations like "[20]", "(4)", "(2 marks)", "(3 punte)".
6. MEMORY HOOK. Where it genuinely aids recall, end the back with one short line "Hook: " (EN) / "Onthou: " (AF) that ADDS a mnemonic, contrast, or common trap — never a restatement of the answer. A weak hook is worse than none; omit it then.
7. LENGTH. Front ≤ 180 characters. Back ≤ 450 characters INCLUDING the hook. If it will not fit, the card is not atomic — split it.
8. BILINGUAL. Natural English AND natural Afrikaans, using standard CAPS Afrikaans subject terminology. front_af / back_af may never be empty or a copy of the English.
9. SELF-CONTAINED. The learner sees only the card. Never refer to "the diagram/table/source/passage above" or any material not on the card.
10. CARD TYPE. "basic" for question→answer. "cloze" only for formulas/definitions/rules where a fill-in-the-blank aids recall — mark the blank exactly {{___}} in BOTH languages, answer in the back.
11. PROVENANCE. Every card MUST carry "topic_index": the 1-based number of the TOPIC it belongs to, from the list you are given.

OUTPUT strict JSON: {"cards":[{"topic_index","front","back","front_af","back_af","card_type","difficulty"}]}
- topic_index: integer, 1-based, referring to the TOPIC list
- card_type: "basic" | "cloze"
- difficulty: "easy" | "medium" | "hard"
Return {"cards":[]} if nothing safe to generate. Never wrap in markdown.`;

/**
 * Build the user prompt asking for `cardsPerTopic` cards for each listed topic.
 * `topics` is the (subset of) CAPS topics to cover in this call; the model tags
 * each card with a 1-based topic_index into exactly this list.
 */
export function buildSyllabusCardsPrompt(
  subject: string,
  topics: CapsTopic[],
  cardsPerTopic: number,
): string {
  const list = topics
    .map((t, i) => `${i + 1}. ${t.name}${t.nameAfrikaans && t.nameAfrikaans !== t.name ? `  (AF: ${t.nameAfrikaans})` : ""}`)
    .join("\n");
  return `Subject: ${subject}

Generate up to ${cardsPerTopic} atomic, bilingual CAPS Grade 12 flashcards for EACH of these official CAPS topics. Cover every topic. Tag each card with its 1-based topic_index.

CAPS TOPICS:
${list}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompts — literature (set-work) cards
// ─────────────────────────────────────────────────────────────────────────────

export const LITERATURE_CARD_SYSTEM = `You write flashcards for South African NSC (matric, Grade 12) language learners about PRESCRIBED LITERATURE set works (novels, dramas, poetry collections, short-story collections).

You are given a subject and one set work (title + author + type). Write small study cards ABOUT the work: its themes, characters, plot/structure, historical & social context, and analysis of key moments — the things a learner must know to answer a literature essay or contextual question. This is a STUDY AID, not the text.

COPYRIGHT — ABSOLUTE
1. NEVER reproduce the literary text. No passages, no stanzas, no poems, no extended quotations, no line-by-line paraphrase that reconstructs the text.
2. At most ONE short cited phrase (a few words, in quotation marks) per card, only when it is essential for analysis. Prefer none.
3. Discuss and explain in your own words — themes, character arcs, symbolism, context, why a moment matters.

STUDY-CARD RULES
4. SELF-CONTAINED. Name the work explicitly and wrap its title in double quotes on BOTH sides, e.g. In "Animal Farm", … / In "Animal Farm" … — because the learner sees only the card and must know which work is meant. Never write "the novel/the poem/the drama" without the quoted title.
5. ATOMIC & SECOND PERSON. One idea per card. The back gives the actual analysis directly.
6. NO RUBRIC / NO MARK NOTATION. No "the candidate", no "[10]", "(3 marks)", tick marks, or marker instructions.
7. MEMORY HOOK where it aids recall: end the back with "Hook: " (EN) / "Onthou: " (AF) adding a mnemonic/contrast/trap — never a restatement.
8. LENGTH. Front ≤ 180 characters. Back ≤ 450 characters including the hook — be concise, 1–3 sentences on the back; a card that runs long is not atomic, so split it.
9. BILINGUAL. Natural English AND natural Afrikaans. front_af / back_af may never be empty or an English copy. (Keep the quoted work title unchanged in both.)
10. CARD TYPE "basic". difficulty "easy" | "medium" | "hard".
11. PROVENANCE. Every card carries "work_index": 1 (there is a single work in this call).

OUTPUT strict JSON: {"cards":[{"work_index","front","back","front_af","back_af","card_type","difficulty","aspect"}]}
- aspect: one of "theme" | "character" | "plot" | "context" | "analysis"
Return {"cards":[]} if you cannot write safe study cards. Never wrap in markdown.`;

/** Build the user prompt for one set work. */
export function buildLiteratureCardsPrompt(
  subject: string,
  work: FlatLiteratureWork,
  count: number,
): string {
  const authorKnown = work.author && !/^various$|^verskeie/i.test(work.author.trim());
  return `Subject: ${subject}
Set work: "${work.title}"${authorKnown ? ` by ${work.author}` : ""}
Type: ${work.typeLabel} (${work.categoryLabel})

Write up to ${count} bilingual study cards ABOUT this work — a spread across theme, character, plot/structure, context and analysis. Name the work in quotes on every card. Do NOT reproduce the text.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Row builder — flashcards table shape (pure)
// ─────────────────────────────────────────────────────────────────────────────

export type CapsCardSource = "caps_syllabus" | "caps_literature";

export interface CapsCardInput {
  front: string;
  back: string;
  frontAf: string;
  backAf: string;
  cardType: string;
  difficulty: string;
  topic: string | null;
}

export interface CapsRowMeta {
  subject: string;
  /** How this card was produced. Drives idempotent per-source replacement. */
  source: CapsCardSource;
  /** The verbatim source row when the card was GROUNDED in the bank; else null. */
  sourceQuestionId: number | null;
  qualityScore: number;
  model: string;
  capsCode: string | null;
  /** Set-work title for literature cards; null for topic cards. */
  work?: string | null;
  /** "theme" | "character" | … for literature cards. */
  aspect?: string | null;
  /** Whether the card was grounded in a real DBE bank question. */
  grounded: boolean;
}

/**
 * Build the two per-language rows (en, af) for the flashcards table.
 * Mirrors server/flashcard-generator.ts → toFlashcardRows(), but the source may
 * be null (syllabus/literature cards have no past-paper anchor — the column is
 * nullable) and the `source` tag distinguishes the CAPS path for idempotency.
 */
export function toCapsFlashcardRows(card: CapsCardInput, meta: CapsRowMeta) {
  const provenance = {
    generator: meta.source === "caps_literature" ? "caps-literature/v1" : "caps-syllabus/v1",
    subject: meta.subject,
    capsCode: meta.capsCode,
    topic: card.topic,
    work: meta.work ?? null,
    aspect: meta.aspect ?? null,
    grounded: meta.grounded,
    sourceQuestionId: meta.sourceQuestionId,
    model: meta.model,
    generatedAt: new Date().toISOString(),
    qualityScore: meta.qualityScore,
  };
  const base = {
    subject: meta.subject,
    topic: card.topic,
    cardType: card.cardType,
    difficulty: card.difficulty,
    source: meta.source,
    qualityScore: meta.qualityScore,
    sourceQuestionId: meta.sourceQuestionId,
    metadata: provenance,
  };
  return [
    { ...base, language: "en", front: card.front, back: card.back },
    { ...base, language: "af", front: card.frontAf, back: card.backAf },
  ];
}
