/**
 * server/brand-assets.ts — single source of truth for the BrainTrack brand logo.
 *
 * Reads the branded logo (rainbow brain over the BrainTrack wordmark on a black
 * background) once at module load and exposes it in the two shapes the server
 * needs:
 *   - BRAND_LOGO_DATA_URI: an inlined `data:image/jpeg;base64,...` string for
 *     HTML email headers (works in every mail client without a public URL).
 *   - BRAND_LOGO_BUFFER: the raw Buffer for pdfkit's `doc.image()`.
 *
 * Both `server/email.ts` and `server/report-generator.ts` import from here so
 * there is exactly one place that knows where the asset lives.
 */

import { readFileSync } from "fs";
import { join } from "path";

const LOGO_FILENAME = "Logo_01_1779989960628.jpeg";
const LOGO_PATH = join(process.cwd(), "attached_assets", LOGO_FILENAME);

/** Raw JPEG bytes of the BrainTrack logo (for pdfkit `doc.image`). */
export const BRAND_LOGO_BUFFER: Buffer = readFileSync(LOGO_PATH);

/** Inlined base64 data URI of the BrainTrack logo (for HTML email `<img>`). */
export const BRAND_LOGO_DATA_URI: string = `data:image/jpeg;base64,${BRAND_LOGO_BUFFER.toString("base64")}`;
