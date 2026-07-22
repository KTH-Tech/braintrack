/**
 * Position-aware PDF text extraction.
 *
 * WHY THIS EXISTS
 * ---------------
 * `pdf-parse` v2 (and pdf.js's raw `getTextContent()`) return text items in the
 * order they appear in the PDF content stream, which is the order the *typesetter*
 * emitted them — not the order a human reads them. For flowing prose the two
 * usually coincide, so most subjects extract acceptably. For DBE Mathematics
 * marking guidelines they do not: those are laid out as multi-column tables with
 * equations positioned glyph-by-glyph, so document order produces scrambled text:
 *
 *   document order : `0 10 2   = + −   y x`
 *   reading order  : `2x − y + 10 = 0`
 *
 * This module reconstructs visual reading order by bucketing text items into
 * horizontal bands using their y coordinate, then sorting each band by x.
 *
 * TUNING
 * ------
 * The y tolerance is derived per page from the *median glyph height* rather than
 * hardcoded, because DBE papers mix 8pt table text with 14pt headings. Too tight
 * and a single visual line splits in two (superscripts drift a point or two off
 * the baseline); too loose and two adjacent lines merge. Half the median glyph
 * height is comfortably inside both failure modes.
 *
 * COLUMN GAPS
 * -----------
 * Bucketing by y alone would silently glue side-by-side columns into one line
 * (a real hazard: some DBE papers set English and Afrikaans in parallel columns).
 * When two consecutive items on the same band are separated by an unusually large
 * horizontal gap we emit a column separator instead of a plain space, so the
 * boundary survives into the downstream splitters rather than being erased.
 */

export interface TextItemLike {
  /** The text run. */
  str: string;
  /** pdf.js transform matrix; [4] is x, [5] is y in PDF user space. */
  transform: number[];
  /** Glyph height in user-space units. */
  height?: number;
  /** Advance width of the run. */
  width?: number;
}

/** Emitted between items separated by a large horizontal gap (column boundary). */
export const COLUMN_SEPARATOR = "  ";

export interface LayoutOptions {
  /**
   * Multiple of the median glyph height used as the y-bucket tolerance.
   * Lower = more aggressive line splitting.
   */
  lineToleranceRatio?: number;
  /**
   * A horizontal gap wider than this multiple of the median glyph height is
   * treated as a column boundary rather than a word space.
   */
  columnGapRatio?: number;
}

const DEFAULTS: Required<LayoutOptions> = {
  lineToleranceRatio: 0.5,
  columnGapRatio: 2.5,
};

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Reorders one page's text items into visual reading order.
 * Pure and synchronous so it can be unit-tested with synthetic fixtures.
 */
export function layoutPageText(items: TextItemLike[], options: LayoutOptions = {}): string {
  const opts = { ...DEFAULTS, ...options };

  const cleaned = items
    .filter((it) => typeof it?.str === "string" && it.str.trim().length > 0 && Array.isArray(it.transform))
    .map((it) => ({
      s: it.str,
      x: it.transform[4],
      y: it.transform[5],
      h: typeof it.height === "number" && it.height > 0 ? it.height : 0,
      w: typeof it.width === "number" && it.width > 0 ? it.width : 0,
    }));

  if (!cleaned.length) return "";

  // Derive the band tolerance from the page's own typography.
  const heights = cleaned.map((i) => i.h).filter((h) => h > 0);
  const medianHeight = median(heights) || 10;
  const tolerance = Math.max(1, medianHeight * opts.lineToleranceRatio);
  const columnGap = medianHeight * opts.columnGapRatio;

  // Bucket into horizontal bands by y.
  const bands = new Map<number, typeof cleaned>();
  for (const item of cleaned) {
    const key = Math.round(item.y / tolerance);
    const bucket = bands.get(key);
    if (bucket) bucket.push(item);
    else bands.set(key, [item]);
  }

  // Top of the page has the LARGEST y in PDF user space, so sort descending.
  const orderedKeys = Array.from(bands.keys()).sort((a, b) => b - a);

  const lines: string[] = [];
  for (const key of orderedKeys) {
    const band = bands.get(key)!.sort((a, b) => a.x - b.x);
    let line = "";
    let prevEnd: number | null = null;
    for (const item of band) {
      if (prevEnd !== null) {
        const gap = item.x - prevEnd;
        line += gap > columnGap ? COLUMN_SEPARATOR : " ";
      }
      line += item.s;
      prevEnd = item.x + (item.w || item.s.length * medianHeight * 0.5);
    }
    // Collapse runs of whitespace but preserve the column separator.
    const normalised = line
      .replace(/[ \t]{3,}/g, COLUMN_SEPARATOR)
      .replace(/\s*\n\s*/g, " ")
      .trim();
    if (normalised) lines.push(normalised);
  }

  return lines.join("\n");
}

/**
 * Extracts full document text in visual reading order from a PDF buffer.
 * Uses pdf.js directly (the same engine pdf-parse wraps) so we control ordering.
 */
export async function extractPositionAwareText(
  buffer: Buffer,
  options: LayoutOptions = {},
): Promise<string> {
  // pdf.js ships as ESM; the legacy build is the Node-friendly entry point.
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // pdf.js can detach the caller's buffer; hand it a private copy.
  const data = new Uint8Array(buffer.byteLength);
  data.set(buffer);

  const doc = await pdfjs.getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,
    // Keep noisy font/CMap warnings out of the ingestion logs.
    verbosity: 0,
  }).promise;

  try {
    const pages: string[] = [];
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      try {
        const textContent = await page.getTextContent();
        const pageText = layoutPageText(textContent.items as TextItemLike[], options);
        if (pageText) pages.push(pageText);
      } finally {
        page.cleanup();
      }
    }
    return pages.join("\n");
  } finally {
    await doc.destroy();
  }
}
