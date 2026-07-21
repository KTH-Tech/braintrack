/**
 * Repair mojibake in source display strings.
 *
 * Some strings were written as UTF-8 and then read back through cp1252, so
 * punctuation and emoji arrived corrupted. The admin reports page renders these
 * raw on screen — the owner described it as "code all over the page".
 *
 * Two things make this less trivial than a straight round-trip:
 *
 *  1. The mis-decode used cp1252, NOT Latin-1. In cp1252 byte 0x80 is "€" and
 *     0x94 is a curly quote, so a UTF-8 em dash (E2 80 94) surfaces as "â€”".
 *     Reversing it needs a cp1252 reverse table; Buffer's "latin1" encoding
 *     truncates those codepoints and produces different, wrong bytes.
 *
 *  2. Some corrupted emoji already contain U+FFFD, meaning a byte was destroyed
 *     before it reached the file. Those are unrecoverable and are dropped
 *     rather than guessed at.
 */
import { readFileSync, writeFileSync } from "fs";

const FILES = process.argv.slice(2);
if (FILES.length === 0) {
  console.error("usage: node fix-mojibake.mjs <file>...");
  process.exit(1);
}

const FFFD = "�";

// cp1252 maps 0x80-0x9F to printable characters instead of control codes.
// Everything else in 0x00-0xFF matches Latin-1.
const CP1252_HIGH = {
  0x80: "€", 0x82: "‚", 0x83: "ƒ", 0x84: "„",
  0x85: "…", 0x86: "†", 0x87: "‡", 0x88: "ˆ",
  0x89: "‰", 0x8a: "Š", 0x8b: "‹", 0x8c: "Œ",
  0x8e: "Ž", 0x91: "‘", 0x92: "’", 0x93: "“",
  0x94: "”", 0x95: "•", 0x96: "–", 0x97: "—",
  0x98: "˜", 0x99: "™", 0x9a: "š", 0x9b: "›",
  0x9c: "œ", 0x9e: "ž", 0x9f: "Ÿ",
};

const CHAR_TO_BYTE = new Map();
for (let b = 0x00; b <= 0xff; b++) {
  const ch = CP1252_HIGH[b] ?? String.fromCharCode(b);
  if (!CHAR_TO_BYTE.has(ch)) CHAR_TO_BYTE.set(ch, b);
}

/** Map a mojibake fragment back to the bytes it was mis-decoded from. */
function toCp1252Bytes(str) {
  const bytes = [];
  for (const ch of str) {
    const b = CHAR_TO_BYTE.get(ch);
    if (b === undefined) return null; // not a cp1252 character — not our case
    bytes.push(b);
  }
  return Buffer.from(bytes);
}

function repair(src) {
  let out = src;

  // Corrupted emoji: "ðŸ" plus trailing bytes, at least one destroyed. The
  // original codepoint is gone, so drop the sequence entirely.
  out = out.replace(
    new RegExp("ðŸ[^\\s\"'<>{}]{0,2}" + FFFD + "[^\\s\"'<>{}]{0,1}", "g"),
    "",
  );

  // Everything still mangled but INTACT is recovered by reversing the
  // mis-decode on just that fragment. Scoping it to the fragment (rather than
  // the whole file) leaves genuinely-similar text alone. Fragments still
  // holding U+FFFD are skipped — a byte is truly gone there.
  // Leading byte varies by codepoint width: C3/C2 (2-byte) surface as Ã/Â,
  // E2 (3-byte) as â, and F0 (4-byte emoji) as ð — so allow up to 3 trailing
  // characters and include ð, or every emoji is missed.
  out = out.replace(/[ÃâÂð][^\s"'<>{}]{1,3}/g, (m) => {
    if (m.includes(FFFD)) return m;
    const bytes = toCp1252Bytes(m);
    if (!bytes) return m;
    const round = bytes.toString("utf8");
    return round.includes(FFFD) ? m : round;
  });

  // Deliberately no whitespace "tidying". An earlier version collapsed `"`
  // followed by \s, which matches newlines — it silently merged 85 lines of
  // admin-reports.tsx. Character mapping only; formatting is left alone.

  return out;
}

const LEFTOVER = new RegExp(
  "[ÃâÂ].|ðŸ|" + FFFD,
);

for (const file of FILES) {
  const original = readFileSync(file, "utf8");
  const before = original.split("\n").filter((l) => LEFTOVER.test(l)).length;
  if (before === 0) {
    console.log(`${file}: clean, skipped`);
    continue;
  }

  const fixed = repair(original);
  const after = fixed.split("\n").filter((l) => LEFTOVER.test(l)).length;

  if (fixed.split("\n").length !== original.split("\n").length) {
    console.error(`${file}: ABORTED — line count changed`);
    continue;
  }

  writeFileSync(file, fixed, "utf8");
  console.log(`${file}: ${before} -> ${after} affected lines`);
}
