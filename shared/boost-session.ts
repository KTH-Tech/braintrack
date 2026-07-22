/**
 * Boost Session — a guided ~30-minute revision sprint that rotates through
 * ALL of the learner's selected subjects, one timed block per subject.
 *
 * This module holds the PURE time-split logic (no IO, no Date.now) so it can
 * be unit-tested in isolation (tests/unit/boost-session-split.test.ts) and
 * shared by the client session page at client/src/pages/boost-session.tsx.
 */

/** Total session length: 30 minutes. */
export const BOOST_SESSION_TOTAL_SECONDS = 30 * 60;

/**
 * A block shorter than this is too short to read and answer even one real
 * DBE MCQ carefully, so the split never goes below it. With a 30-minute
 * session this caps a session at 10 subject blocks.
 */
export const MIN_BLOCK_SECONDS = 3 * 60;

export interface BoostBlock {
  subjectId: number;
  /** Whole seconds allocated to this subject's block. */
  seconds: number;
}

/**
 * Split a session's total seconds evenly across the learner's selected
 * subjects.
 *
 * Rules:
 * - Duplicate / non-positive / non-integer subject ids are dropped
 *   (first occurrence wins, order preserved).
 * - Every block gets at least MIN_BLOCK_SECONDS. If there are more subjects
 *   than `totalSeconds / MIN_BLOCK_SECONDS`, only the first
 *   `floor(totalSeconds / MIN_BLOCK_SECONDS)` subjects get a block — a
 *   2-minute "block" would be revision theatre, not revision.
 * - Whole-second allocations: the remainder after an even split is handed
 *   out one second at a time to the earliest blocks, so the block seconds
 *   always sum EXACTLY to the time being split.
 * - Degenerate input (`totalSeconds < MIN_BLOCK_SECONDS`) still yields one
 *   block with everything rather than an empty session.
 */
export function splitBoostSession(
  subjectIds: number[],
  totalSeconds: number = BOOST_SESSION_TOTAL_SECONDS,
): BoostBlock[] {
  const seen = new Set<number>();
  const ids: number[] = [];
  for (const raw of subjectIds) {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0 || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }

  if (ids.length === 0 || !Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return [];
  }

  const wholeSeconds = Math.floor(totalSeconds);
  const cap = Math.max(1, Math.floor(wholeSeconds / MIN_BLOCK_SECONDS));
  const chosen = ids.slice(0, Math.min(ids.length, cap));

  const base = Math.floor(wholeSeconds / chosen.length);
  const remainder = wholeSeconds - base * chosen.length;

  return chosen.map((subjectId, idx) => ({
    subjectId,
    seconds: base + (idx < remainder ? 1 : 0),
  }));
}
