/**
 * server/games/decks.ts — play-session builders for the learning-games arcade.
 *
 * HALLUCINATION-SAFE CONTRACT
 * ---------------------------
 * Every card and question returned from this module comes from a VERIFIED
 * source at read time. NOTHING here calls a language model. The three sources:
 *
 *   Rapid Fire        → generated_questions, filtered by the SAME strict serve
 *                        gate the daily-quiz endpoint uses (see
 *                        /api/subjects/:id/boost/quiz in server/routes.ts). A
 *                        row is servable only if it was released AND passed
 *                        quality AND had its answer key independently re-solved
 *                        (solver_verdict='agree') AND sits on the CAPS syllabus
 *                        (caps_verdict='on_syllabus'). Learners are NEVER shown
 *                        verbatim DBE questions — only ORIGINAL generated_questions.
 *
 *   Memory Match /     → COMMAND_WORDS static hand-verified seed
 *   Command Words         (server/games/command-words.ts). Subject-agnostic.
 *
 *   Memory Match /     → dbe_topic_frequency joined to topics. The recurrence
 *   High-Yield            label is DERIVED from the real appearances_count /
 *                         total_years_sampled columns — no invented percentages.
 *
 * BOOT-SAFE: pure functions over the shared `db` handle; no top-level throws,
 * no client construction, no env reads at import time.
 */

import { sql } from "drizzle-orm";
import { db } from "../db";
import { COMMAND_WORDS } from "./command-words";

export type GameName = "rapid_fire" | "memory_match";

/** Fisher–Yates in place. */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Rapid Fire ─────────────────────────────────────────────────────────────

export interface RapidFireQuestion {
  id: number;
  question: string;
  options: Array<{ label: string; text: string }>;
  correctAnswer: string;
  topic: string;
  explanation: string;
  marks: number;
}

const VALID_LETTERS = ["A", "B", "C", "D", "E"];

/**
 * Build a Rapid Fire round for a subject. Mirrors the boost/quiz strict serve
 * gate VERBATIM — do not loosen any clause here. Returns up to `limit` valid
 * MCQs (default 10), shuffled. Empty array ⇒ nothing verified yet for this
 * subject/language (caller returns comingSoon).
 */
export async function buildRapidFireDeck(opts: {
  subjectName: string;
  lang: "en" | "af";
  limit?: number;
}): Promise<RapidFireQuestion[]> {
  const { subjectName } = opts;
  const isAf = opts.lang === "af";
  const limit = opts.limit ?? 10;
  const preferredLanguage = isAf ? "Afrikaans" : "English";

  type Row = {
    id: number;
    question_text: string;
    answer_text: string | null;
    topic: string | null;
    mcq_options: Array<{ letter: string; text: string }> | null;
    correct_option: string | null;
    marks: number | null;
  };

  // STRICT anti-hallucination gate — identical to the daily-quiz endpoint:
  //   released_at IS NOT NULL AND quality_flag='pass'
  //   AND solver_verdict='agree' AND caps_verdict='on_syllabus'
  // plus MCQ shape guards. Original generated_questions only — never verbatim DBE.
  const fetchRows = async (language: string): Promise<Row[]> => {
    // Corpus stores both "Afrikaans"/"af" and "English"/"en" conventions —
    // match both spellings so AF content is never silently hidden.
    const alt =
      language === "Afrikaans" ? "af"
      : language === "af" ? "Afrikaans"
      : language === "English" ? "en"
      : language === "en" ? "English"
      : language;
    const r = await db.execute<Row>(sql`
      SELECT id, question_text, answer_text, topic,
             mcq_options, correct_option, marks
        FROM generated_questions
       WHERE subject = ${subjectName}
         AND language IN (${language}, ${alt})
         AND released_at IS NOT NULL
         AND quality_flag = 'pass'
         AND mcq_options IS NOT NULL
         AND correct_option IS NOT NULL
         AND solver_verdict = 'agree'
         AND caps_verdict = 'on_syllabus'
       ORDER BY quality_score DESC, id DESC
       LIMIT 120
    `);
    return (r.rows ?? []) as Row[];
  };

  const buildExplanation = (row: Row): string => {
    if (row.answer_text && row.answer_text.trim().length > 0) {
      const t =
        row.answer_text.length > 600
          ? row.answer_text.slice(0, 600) + "…"
          : row.answer_text;
      return isAf ? `Modelantwoord: ${t}` : `Model answer: ${t}`;
    }
    return isAf
      ? "Antwoord uit gesimuleerde eksameninhoud."
      : "Answer from simulated exam content.";
  };

  // Language fallback: preferred → English (never cross-subject).
  let rows: Row[] = [];
  const languageFallbacks =
    preferredLanguage === "English"
      ? ["English"]
      : [preferredLanguage, "English"];
  for (const language of languageFallbacks) {
    rows = await fetchRows(language);
    if (rows.length > 0) break;
  }
  if (rows.length === 0) return [];

  shuffle(rows);

  const questions = rows
    .map((row): RapidFireQuestion | null => {
      const opts = Array.isArray(row.mcq_options) ? row.mcq_options : [];
      const cleanOpts = opts
        .filter(
          (o) =>
            o &&
            VALID_LETTERS.includes(o.letter) &&
            typeof o.text === "string" &&
            o.text.trim().length > 0,
        )
        .map((o) => ({ label: o.letter, text: o.text.trim() }));
      if (cleanOpts.length < 2) return null;
      if (!row.correct_option || !cleanOpts.some((o) => o.label === row.correct_option)) {
        return null;
      }
      return {
        id: row.id,
        question: row.question_text,
        options: cleanOpts,
        correctAnswer: row.correct_option,
        topic: row.topic ?? subjectName,
        explanation: buildExplanation(row),
        marks: row.marks ?? 1,
      };
    })
    .filter((q): q is RapidFireQuestion => q !== null)
    .slice(0, limit);

  return questions;
}

// ── Memory Match ───────────────────────────────────────────────────────────

export interface MemoryPair {
  /** Stable id used by the client to decide whether two flipped cards match. */
  pairId: string;
  term: string;
  termAf: string;
  match: string;
  matchAf: string;
  /** Optional honest recurrence band (High-Yield deck only). */
  band?: string;
}

export interface MemoryCard {
  pairId: string;
  side: "term" | "match";
  text: string;
  textAf: string;
}

/** Flatten pairs into a shuffled two-card-per-pair deck. */
export function pairsToCards(pairs: MemoryPair[]): MemoryCard[] {
  const cards: MemoryCard[] = [];
  for (const p of pairs) {
    cards.push({ pairId: p.pairId, side: "term", text: p.term, textAf: p.termAf });
    cards.push({ pairId: p.pairId, side: "match", text: p.match, textAf: p.matchAf });
  }
  return shuffle(cards);
}

/**
 * Command Words deck — subject-agnostic static seed. `count` pairs (default 8)
 * are drawn at random from the verified COMMAND_WORDS set.
 */
export function buildCommandWordsDeck(count = 8): MemoryPair[] {
  const picked = shuffle([...COMMAND_WORDS]).slice(0, Math.min(count, COMMAND_WORDS.length));
  return picked.map((c, i) => ({
    pairId: `cmd_${i}_${c.term.replace(/\W+/g, "").toLowerCase()}`,
    term: c.term,
    termAf: c.termAf,
    match: c.expects,
    matchAf: c.expectsAf,
  }));
}

/**
 * Derive an HONEST recurrence band from the real frequency columns. No invented
 * percentages: we only ever state the appearances/years the table literally holds.
 */
function recurrenceBand(appearances: number, years: number): { en: string; af: string } {
  const ratio = years > 0 ? appearances / years : 0;
  if (ratio >= 0.8) return { en: "Appears in almost every paper", af: "Verskyn in byna elke vraestel" };
  if (ratio >= 0.5) return { en: "High-frequency topic", af: "Hoë-frekwensie onderwerp" };
  if (ratio >= 0.25) return { en: "Appears regularly", af: "Verskyn gereeld" };
  return { en: "Appears occasionally", af: "Verskyn af en toe" };
}

/**
 * High-Yield deck — topic ↔ honest recurrence label, from dbe_topic_frequency
 * joined to topics for the given subject. Returns up to `count` pairs (default
 * 8), highest-frequency first. Empty ⇒ no frequency data for this subject.
 */
export async function buildHighYieldDeck(opts: {
  subjectName: string;
  count?: number;
}): Promise<MemoryPair[]> {
  const { subjectName } = opts;
  const count = opts.count ?? 8;

  type Row = {
    topic_id: number;
    name: string;
    name_afrikaans: string | null;
    appearances_count: number;
    total_years_sampled: number;
    frequency_rank: number;
  };

  const r = await db.execute<Row>(sql`
    SELECT f.topic_id,
           t.name,
           t.name_afrikaans,
           f.appearances_count,
           f.total_years_sampled,
           f.frequency_rank
      FROM dbe_topic_frequency f
      JOIN topics t ON t.id = f.topic_id
     WHERE f.subject = ${subjectName}
       AND f.topic_id IS NOT NULL
       AND f.total_years_sampled > 0
       AND f.appearances_count > 0
     ORDER BY f.appearances_count DESC, f.frequency_rank ASC
     LIMIT ${count}
  `);

  const rows = (r.rows ?? []) as Row[];
  return rows.map((row) => {
    const band = recurrenceBand(row.appearances_count, row.total_years_sampled);
    // Honest, distinct match text derived straight from the real columns.
    const match = `${band.en} — seen in ${row.appearances_count} of ${row.total_years_sampled} papers`;
    const matchAf = `${band.af} — gesien in ${row.appearances_count} van ${row.total_years_sampled} vraestelle`;
    return {
      pairId: `hy_${row.topic_id}`,
      term: row.name,
      termAf: row.name_afrikaans || row.name,
      match,
      matchAf,
      band: band.en,
    };
  });
}
