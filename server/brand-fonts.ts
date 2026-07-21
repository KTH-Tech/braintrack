/**
 * server/brand-fonts.ts — BrainTrack brand typefaces for PDF generation.
 *
 * PDFKit ships with the 14 standard PDF base fonts (Helvetica, Times, Courier).
 * Those are *not* our brand. BrainTrack's type system is:
 *   - Poppins        — geometric sans, used for every heading, label and body run.
 *   - Permanent Marker — display/marker face, used sparingly as an accent only.
 *
 * The .ttf files live in `server/assets/fonts/` and are embedded (subset) into
 * every generated PDF by pdfkit, so the reports render identically on any
 * machine with no font installation required.
 *
 * LICENSING
 * ---------
 * Poppins is licensed under the SIL Open Font License 1.1 and Permanent Marker
 * under the Apache License 2.0. Both permit embedding in documents.
 *
 * FALLBACK CONTRACT
 * -----------------
 * If a font file cannot be found or read we do NOT throw — a parent must still
 * receive their report. We fall back to the closest Helvetica weight and log a
 * loud warning exactly once, so a missing asset is visible in the logs rather
 * than silently degrading the brand.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

/** Logical roles the report layout asks for. */
export type BrandFontRole =
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "italic"
  | "display";

/** Resolved pdfkit font names, keyed by role. */
export type BrandFontSet = Record<BrandFontRole, string>;

/** Registered (embedded) font names — namespaced so they cannot collide. */
const REGISTERED_NAME: BrandFontSet = {
  regular: "BT-Poppins",
  medium: "BT-Poppins-Medium",
  semibold: "BT-Poppins-SemiBold",
  bold: "BT-Poppins-Bold",
  italic: "BT-Poppins-Italic",
  display: "BT-Marker",
};

/** Closest standard-PDF equivalent, used only when a .ttf is unavailable. */
const FALLBACK_NAME: BrandFontSet = {
  regular: "Helvetica",
  medium: "Helvetica",
  semibold: "Helvetica-Bold",
  bold: "Helvetica-Bold",
  italic: "Helvetica-Oblique",
  display: "Helvetica-Bold",
};

const FILE_NAME: BrandFontSet = {
  regular: "Poppins-Regular.ttf",
  medium: "Poppins-Medium.ttf",
  semibold: "Poppins-SemiBold.ttf",
  bold: "Poppins-Bold.ttf",
  italic: "Poppins-Italic.ttf",
  display: "PermanentMarker-Regular.ttf",
};

const ROLES: BrandFontRole[] = [
  "regular",
  "medium",
  "semibold",
  "bold",
  "italic",
  "display",
];

/**
 * Candidate directories, in priority order. `process.cwd()` is the repo root
 * both under `tsx server/index.ts` (dev) and `node dist/index.cjs` (prod),
 * which is the same assumption `server/brand-assets.ts` already makes for the
 * logo. The extra candidates make a relocated deploy layout survivable.
 */
function candidateDirs(): string[] {
  const cwd = process.cwd();
  return [
    join(cwd, "server", "assets", "fonts"),
    join(cwd, "assets", "fonts"),
    join(cwd, "dist", "assets", "fonts"),
  ];
}

let cachedBuffers: Partial<Record<BrandFontRole, Buffer>> | null = null;
let loggedLoadResult = false;

/** Read every brand font off disk once per process. */
function loadFontBuffers(): Partial<Record<BrandFontRole, Buffer>> {
  if (cachedBuffers) return cachedBuffers;

  const buffers: Partial<Record<BrandFontRole, Buffer>> = {};
  const dirs = candidateDirs();
  const missing: string[] = [];

  for (const role of ROLES) {
    const file = FILE_NAME[role];
    let found = false;
    for (const dir of dirs) {
      const p = join(dir, file);
      try {
        if (!existsSync(p)) continue;
        const buf = readFileSync(p);
        // Sanity-check the sfnt signature so a truncated/HTML-error download
        // is caught here rather than blowing up inside pdfkit's font parser.
        if (!isTrueTypeLike(buf)) {
          console.warn(
            `[BrandFonts] ${file} at ${p} is not a valid TrueType/OpenType file (bad signature) — ignoring.`,
          );
          continue;
        }
        buffers[role] = buf;
        found = true;
        break;
      } catch (err) {
        console.warn(
          `[BrandFonts] Failed reading ${p}:`,
          err instanceof Error ? err.message : String(err),
        );
      }
    }
    if (!found) missing.push(file);
  }

  if (!loggedLoadResult) {
    loggedLoadResult = true;
    if (missing.length === 0) {
      console.log(
        `[BrandFonts] Embedded brand typefaces loaded (Poppins x5, Permanent Marker) from ${dirs[0]}`,
      );
    } else {
      console.warn(
        `[BrandFonts] MISSING brand font file(s): ${missing.join(", ")}. ` +
          `Searched: ${dirs.join(" | ")}. PDFs will fall back to Helvetica for those roles ` +
          `and will NOT look on-brand.`,
      );
    }
  }

  cachedBuffers = buffers;
  return buffers;
}

/** TrueType (0x00010000 / "true") or OpenType-CFF ("OTTO") signature check. */
function isTrueTypeLike(buf: Buffer): boolean {
  if (buf.length < 4) return false;
  const tag = buf.readUInt32BE(0);
  return (
    tag === 0x00010000 || // TrueType outlines
    tag === 0x74727565 || // 'true'
    tag === 0x4f54544f || // 'OTTO' — OpenType with CFF outlines
    tag === 0x74746366 // 'ttcf' — TrueType collection
  );
}

/** True when every brand typeface is present on disk. */
export function brandFontsAvailable(): boolean {
  const b = loadFontBuffers();
  return ROLES.every((r) => !!b[r]);
}

/**
 * Register the brand typefaces on a pdfkit document and return the font names
 * the layout should use. Any role whose file is missing resolves to its
 * Helvetica fallback, so callers can use the returned set unconditionally.
 */
export function registerBrandFonts(doc: {
  registerFont: (name: string, src: Buffer) => unknown;
}): BrandFontSet {
  const buffers = loadFontBuffers();
  const resolved = { ...FALLBACK_NAME };

  for (const role of ROLES) {
    const buf = buffers[role];
    if (!buf) continue;
    try {
      doc.registerFont(REGISTERED_NAME[role], buf);
      resolved[role] = REGISTERED_NAME[role];
    } catch (err) {
      console.warn(
        `[BrandFonts] pdfkit rejected ${FILE_NAME[role]} — falling back to ${FALLBACK_NAME[role]}:`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  return resolved;
}
