/**
 * scripts/regenerate-brand-icons.ts
 *
 * One-off script: regenerate the PWA / push-notification icons from the
 * branded BrainTrack logo (`attached_assets/Logo_01_1779989960628.jpeg`).
 *
 * The source is a wide landscape image (rainbow brain over the BrainTrack
 * wordmark on a black background). Each icon is the logo letter-boxed onto a
 * black square so the brand mark stays fully legible and the black blends with
 * the source background.
 *
 * Outputs (overwrites in place):
 *   - client/public/icon-192.png            (192×192, "any")
 *   - client/public/icon-512.png            (512×512, "any")
 *   - client/public/icon-512-maskable.png   (512×512, maskable — logo in inner safe zone)
 *   - client/public/apple-touch-icon.png    (180×180)
 *
 * Run once: `npx tsx scripts/regenerate-brand-icons.ts`
 * Not wired into any workflow.
 */

import sharp from "sharp";
import { join } from "path";

const BLACK = { r: 11, g: 11, b: 18, alpha: 1 };
const SRC = join(process.cwd(), "attached_assets", "Logo_01_1779989960628.jpeg");
const OUT_DIR = join(process.cwd(), "client", "public");

/**
 * Render the logo centred on a black square of `size`px, with the logo scaled
 * to occupy `contentFraction` of the square (the rest is black padding). For
 * maskable icons use a smaller fraction so the mark sits inside the inner 80%
 * safe zone.
 */
async function buildIcon(size: number, outName: string, contentFraction: number) {
  const inner = Math.round(size * contentFraction);
  const resized = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: BLACK })
    .png()
    .toBuffer();

  const outPath = join(OUT_DIR, outName);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BLACK,
    },
  })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toFile(outPath);

  console.log(`✓ wrote ${outName} (${size}×${size}, content ~${Math.round(contentFraction * 100)}%)`);
}

async function main() {
  await buildIcon(192, "icon-192.png", 0.92);
  await buildIcon(512, "icon-512.png", 0.92);
  await buildIcon(512, "icon-512-maskable.png", 0.66);
  await buildIcon(180, "apple-touch-icon.png", 0.92);
  console.log("Done — brand icons regenerated.");
}

main().catch((err) => {
  console.error("Failed to regenerate brand icons:", err);
  process.exit(1);
});
