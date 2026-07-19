// Regenerate the PWA/favicon icon set from the handoff brand icon.
import sharp from "sharp";
const SRC = "client/src/assets/handoff/icon-transparent.png";
const BG = "#050508";

// Transparent-background versions (favicon + regular icons)
for (const [file, size] of [
  ["client/public/favicon.png", 64],
  ["client/public/icon-192.png", 192],
  ["client/public/icon-512.png", 512],
]) {
  await sharp(SRC).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(file);
  console.log("wrote", file);
}

// Apple touch icon + maskable need a solid ground; maskable also needs the
// safe-zone padding (icon content within ~80% of the canvas).
await sharp(SRC).resize(150, 150, { fit: "contain", background: BG })
  .extend({ top: 15, bottom: 15, left: 15, right: 15, background: BG })
  .png().toFile("client/public/apple-touch-icon.png");
console.log("wrote apple-touch-icon.png (180px)");

await sharp(SRC).resize(400, 400, { fit: "contain", background: BG })
  .extend({ top: 56, bottom: 56, left: 56, right: 56, background: BG })
  .png().toFile("client/public/icon-512-maskable.png");
console.log("wrote icon-512-maskable.png");
process.exit(0);
