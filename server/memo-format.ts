/**
 * Memo Formatting Utilities
 * -------------------------
 * Shared helpers for cleaning raw DBE memo/criterion text before it is
 * surfaced to learners. Strips marker shorthand that is meaningful only
 * to examiners (tick glyphs, bracketed mark counts, "Accept …" / "Allow …"
 * directives) so learners see clean answer guidance.
 *
 * Consumed by:
 *   - server/routes.ts → boost quiz, /api/exam/mini-mock, /api/exam/full
 */

/**
 * Strip examiner-facing shorthand from a memo excerpt so it reads cleanly
 * for learners.
 *
 * Removes:
 *   - Leading mark allocations like "(1)" or "1 mark"
 *   - Marker check glyphs: ✓ ✗ √
 *   - Mid-line bracketed mark counts like "(2)"
 *   - "OR accept …" / "Accept …" / "Allow …" lines (marker instructions)
 */
export function cleanCriterionText(raw: string): string {
  return raw
    .replace(/^\s*\(\d+\)\s*/g, "")           // leading (1) allocations
    .replace(/^\s*\d+\s+mark[s]?\s*/gi, "")   // leading "1 mark"
    .replace(/[✓✗√]/g, "")                    // marker check glyphs
    .replace(/\(\d+\)/g, "")                   // mid-line (2) counts
    .replace(/\bOR\s+accept\b[^\n]*/gi, "")    // OR accept … lines
    .replace(/\bAccept\b[^\n]*/gi, "")         // Accept … lines
    .replace(/\bAllow\b[^\n]*/gi, "")          // Allow … lines
    .replace(/\s{2,}/g, " ")
    .trim();
}
