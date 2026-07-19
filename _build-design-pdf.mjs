// Assemble the design-review PDF from the production screenshots.
import PDFDocument from "pdfkit";
import fs from "fs";
import sharp from "sharp";

const OUT = "C:/Users/USER/Downloads/BrainTrack-Design-Review.pdf";
const DIR = "C:/dev/design-shots";
const PASTELS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"];

const PAGES = [
  ["01-landing.png", "Landing — public", "Mural hero, marquee ribbon, proof figures, ecosystem, Rizz strip"],
  ["02-signin.png", "Log on / Meld aan", "Native email+password, device-local prefill, admin via allowlist"],
  ["03-learner-dashboard.png", "Learner — Dashboard", "Sidebar shell, live NSC countdown (official DBE dates), stat stickers, mastery"],
  ["04-learner-subjects.png", "Learner — Subjects", "Per-subject pastel cards + mastery bands (duplicate-grid bug fixed)"],
  ["05-learner-studyplan.png", "Learner — Study Plan", "Weekly pastel sessions, today-glow, exam tiles"],
  ["06-learner-tutor.png", "Learner — Rizz Tutor", "Live Rizz expressions, brand wordmark, role-aware AI"],
  ["07-parent-dashboard.png", "Parent — Dashboard", "Executive restraint: sidebar nav, readiness, linked learner"],
  ["08-admin-dashboard.png", "Admin — Engine room", "Professional-first: live counts, tools, allowlist-gated"],
  ["09-admin-dbe-portal.png", "Admin — DBE Portal", "Ingestion status, moderation, release gate, mapping report"],
];

const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: "BrainTrack Design Review", Author: "BrainTrack" } });
doc.pipe(fs.createWriteStream(OUT));
const W = doc.page.width, H = doc.page.height;

// Cover
doc.rect(0, 0, W, H).fill("#050508");
PASTELS.forEach((c, i) => doc.rect((W / 6) * i, 0, W / 6, 8).fill(c));
doc.fillColor("#FFB7E5").font("Helvetica-Bold").fontSize(15).text("permanent marker street pastel", 60, 200);
doc.fillColor("#FFFFFF").fontSize(42).text("BrainTrack", 60, 225);
doc.fontSize(42).fillColor("#9FD8FF").text("Design Review", 60, 272);
doc.fillColor("#FFFFFF").font("Helvetica").fontSize(13)
  .text("Live production surfaces — braintrack.tech", 60, 340)
  .text(new Date().toISOString().slice(0, 10) + "  ·  learner / parent / admin / public", 60, 360);
PASTELS.forEach((c, i) => doc.rect((W / 6) * i, H - 8, W / 6, 8).fill(c));

for (let i = 0; i < PAGES.length; i++) {
  const [file, title, sub] = PAGES[i];
  const src = `${DIR}/${file}`;
  if (!fs.existsSync(src)) continue;
  doc.addPage();
  doc.rect(0, 0, W, H).fill("#050508");
  const accent = PASTELS[i % PASTELS.length];
  doc.rect(0, 0, W, 6).fill(accent);
  doc.fillColor(accent).font("Helvetica-Bold").fontSize(20).text(title, 40, 26);
  doc.fillColor("#FFFFFF").font("Helvetica").fontSize(10.5).text(sub, 40, 52, { width: W - 80 });

  // Fit the (tall) screenshot: cap height, keep aspect, center.
  const meta = await sharp(src).metadata();
  const maxW = W - 80, maxH = H - 120;
  const scale = Math.min(maxW / meta.width, maxH / meta.height);
  const w = meta.width * scale, h = meta.height * scale;
  // pdfkit needs a buffer; also flatten very tall pages onto white-free dark bg
  doc.image(src, (W - w) / 2, 80, { width: w, height: h });
  doc.rect(0, H - 6, W, 6).fill(accent);
}
doc.end();
await new Promise((r) => setTimeout(r, 1500));
console.log("wrote", OUT, fs.existsSync(OUT) ? fs.statSync(OUT).size + " bytes" : "MISSING");
