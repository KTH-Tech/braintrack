/**
 * server/report-generator.ts
 *
 * Shared PDF report generation helper.  Extracted from the parent PDF route
 * so the same logic can be used both for on-demand downloads and for the
 * scheduled email-delivery flow in server/scheduled-reports.ts.
 *
 * Returns a raw Buffer — callers decide whether to pipe it to a response or
 * base64-encode it for a SendGrid attachment.
 *
 * DESIGN NOTES
 * ------------
 * This is a PARENT / EXECUTIVE document, printed on white paper. It follows
 * the "Luxury Street Graffiti" brand system in its *restrained* mode:
 *   - White / near-white page, near-black body text for print legibility.
 *   - Brand pastels used strictly as accents (rules, chips, bars, headings).
 *   - Near-black masthead band carrying the BrainTrack logo.
 * The dark app UI treatment is deliberately NOT used here.
 *
 * TYPOGRAPHY
 * ----------
 * All type is Poppins (embedded, see server/brand-fonts.ts) — never Helvetica.
 * Permanent Marker is the brand display face and is used *sparingly*: the
 * masthead report title and the closing sign-off, nothing else. It is a marker
 * face and turns to mush below ~15pt, so it is never used for body copy, data,
 * labels or anything that must be read at a glance.
 *
 * LAYOUT SYSTEM
 * -------------
 * A single vertical rhythm (SPACE.*) drives every gap so sections do not drift.
 * `ensure()` is the page-break guard; `section()` keeps a heading glued to at
 * least the first row of its content so nothing is orphaned at a page foot.
 * Every page gets a running footer with "Page n of N" stamped after layout via
 * pdfkit's buffered-page mode.
 *
 * EMPTINESS CONTRACT
 * ------------------
 * This generator must NEVER emit a PDF with no body content. When a parent has
 * no linked learner, or the learner has no recorded activity, we render a full
 * "Getting Started" report instead of a near-empty page. Individual sections
 * with no rows render an explicit, dignified empty state.
 */

import { db } from "./db";
import { storage } from "./storage";
import { users } from "@shared/models/auth";
import { eq, sql } from "drizzle-orm";
import { attempts } from "@shared/schema";
import { BRAND_LOGO_BUFFER } from "./brand-assets";
import { registerBrandFonts, type BrandFontSet } from "./brand-fonts";

export interface PartnerBranding {
  partnerName?: string | null;
  partnerLogoBase64?: string | null;
}

export interface ReportGeneratorOpts {
  learnerTargetId: string;
  learnerName: string;
  lang: "en" | "af";
  partnerBranding?: PartnerBranding;
  /**
   * False when the report is being produced for a parent account that has no
   * activated learner link. Drives the "Getting Started" variant. Defaults to
   * true so existing callers keep their behaviour.
   */
  hasLinkedLearner?: boolean;
}

/* ── Brand palette — Luxury Street Graffiti (executive / print mode) ──────── */

/** Masthead band — brand near-black. */
const NEAR_BLACK = "#050508";
/** Body text — near-black, high contrast on white. */
const INK = "#14141A";
/** Secondary text — still near-black, one step down. */
const INK_SOFT = "#3B3B47";
/** Page background / card fill. */
const PAPER = "#FFFFFF";

/* Pastel accents */
const AQUA = "#9FF5E8";
const SKY = "#9FD8FF";
const PINK = "#FFB7E5";
const PURPLE = "#C5B3FF";
const YELLOW = "#FFE29A";
const MINT = "#94F7C5";
const RISK = "#FF8DA1";

/* Pastel tints — used for bar tracks, cards and empty-state panels.
   These replace the old muddy greys (#e5e7eb etc.). */
const TINT_AQUA = "#EFFDFA";
const TINT_SKY = "#EFF7FF";
const TINT_PINK = "#FFF4FB";
const TINT_PURPLE = "#F6F2FF";
const TINT_YELLOW = "#FFF9EC";
const TINT_MINT = "#EFFDF5";
const TINT_RISK = "#FFF1F4";

/** Default bar track. */
const TRACK = TINT_PURPLE;
/** Hairline rules — a pastel tint, never grey. */
const HAIRLINE = "#E7E1F7";
/** Zebra banding for data tables — the faintest brand tint. */
const ZEBRA = "#FBF9FF";

/** The masthead accent strip, in brand order. */
const STRIPE = [AQUA, SKY, PURPLE, PINK, YELLOW, MINT];

/* ── Vertical rhythm ─────────────────────────────────────────────────────── */

const SPACE = {
  /** Between a label and the thing it labels. */
  tight: 4,
  /** Between sibling rows in a list. */
  row: 8,
  /** Between a block and the next block inside a section. */
  block: 14,
  /** Between the end of one section and the next heading. */
  section: 26,
} as const;

/**
 * Sniff an image buffer's format from its magic bytes. pdfkit's `doc.image()`
 * understands JPEG and PNG only — everything else (WebP, GIF, SVG, AVIF, HEIC)
 * throws deep inside the image decoder with an opaque message. Detecting the
 * format up front lets us tell the operator exactly what is wrong.
 */
export function detectImageFormat(buf: Buffer): string {
  if (buf.length < 12) return "unknown (too short)";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "png";
  }
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") {
    return "webp";
  }
  const head = buf.subarray(0, 6).toString("ascii");
  if (head === "GIF87a" || head === "GIF89a") return "gif";
  if (buf.subarray(4, 12).toString("ascii") === "ftypavif") return "avif";
  if (buf.subarray(4, 8).toString("ascii") === "ftyp" && buf.subarray(8, 12).toString("ascii").startsWith("heic")) {
    return "heic";
  }
  if (buf.subarray(0, 2).toString("ascii") === "BM") return "bmp";
  const text = buf.subarray(0, 300).toString("utf8").trimStart().toLowerCase();
  if (text.startsWith("<svg") || text.startsWith("<?xml")) return "svg";
  return "unknown";
}

/** Formats pdfkit can actually embed. */
const PDF_EMBEDDABLE_FORMATS = new Set(["jpeg", "png"]);

/**
 * Generate a BrainTrack progress report PDF and return it as a Buffer.
 * All parameters must already be resolved (auth checks are the caller's
 * responsibility).
 */
export async function generateReportPdfBuffer(
  opts: ReportGeneratorOpts,
): Promise<Buffer> {
  const {
    learnerTargetId,
    learnerName,
    lang,
    partnerBranding = {},
    hasLinkedLearner = true,
  } = opts;
  const isAf = lang === "af";
  const t = (en: string, af: string) => (isAf ? af : en);
  const dateLocale = isAf ? "af-ZA" : "en-ZA";

  const PDFDocument = (await import("pdfkit")).default;

  const allSubjects = await storage.getAllSubjects();
  const allLearnerProgress = await storage.getUserProgress(learnerTargetId);
  const stats = await storage.getUserStats(learnerTargetId);

  let learnerSelectedSubjectIds: number[] = [];
  try {
    const [learnerRow] = await db
      .select({ selectedSubjects: users.selectedSubjects })
      .from(users)
      .where(eq(users.id, learnerTargetId));
    learnerSelectedSubjectIds = Array.isArray(learnerRow?.selectedSubjects)
      ? (learnerRow!.selectedSubjects as number[])
      : [];
  } catch { /* ignore */ }

  const learnerProgress =
    learnerSelectedSubjectIds.length > 0
      ? allLearnerProgress.filter((p) =>
          learnerSelectedSubjectIds.includes(p.subjectId),
        )
      : allLearnerProgress;

  const learnerOnboarding = await storage.getOnboardingResult(learnerTargetId);
  const initialMarksMap = new Map<string, number>();
  if (learnerOnboarding?.rawAnswersJson) {
    const raw = learnerOnboarding.rawAnswersJson as any;
    if (Array.isArray(raw.subjectMarks)) {
      for (const sm of raw.subjectMarks) {
        if (sm.subjectName && typeof sm.mark === "number") {
          initialMarksMap.set(sm.subjectName, sm.mark);
        }
      }
    }
  }

  const progressBySubjectId = new Map(
    learnerProgress.map((p) => [p.subjectId, p]),
  );
  const consideredSubjects =
    learnerSelectedSubjectIds.length > 0
      ? allSubjects.filter((s) => learnerSelectedSubjectIds.includes(s.id))
      : allSubjects.filter(
          (s) =>
            progressBySubjectId.has(s.id) || initialMarksMap.has(s.name),
        );

  const subjectData = consideredSubjects.map((subj) => {
    const enName = subj.name;
    const name = isAf ? ((subj as any)?.nameAfrikaans ?? enName) : enName;
    const p = progressBySubjectId.get(subj.id);
    const questionsAttempted = p?.questionsAttempted ?? 0;
    const accuracy =
      questionsAttempted > 0
        ? Math.round(((p!.correctAnswers) / questionsAttempted) * 100)
        : 0;
    const baseline = initialMarksMap.get(enName) ?? 0;
    const effective =
      questionsAttempted >= 5
        ? accuracy
        : baseline > 0
          ? baseline
          : accuracy;
    return {
      name,
      accuracy,
      baseline,
      delta: accuracy - baseline,
      questionsAttempted,
      effective,
      basedOn:
        questionsAttempted >= 5
          ? ("live" as const)
          : baseline > 0
            ? ("baseline" as const)
            : ("none" as const),
    };
  });

  let strengths = subjectData
    .filter((s) => s.effective >= 70 && s.basedOn !== "none")
    .map((s) => s.name);
  let weakAreas = subjectData
    .filter((s) => s.effective < 60 && s.basedOn !== "none")
    .map((s) => s.name);

  if (strengths.length === 0 && subjectData.length > 0) {
    const sorted = [...subjectData].sort((a, b) => b.effective - a.effective);
    strengths = sorted
      .slice(0, Math.min(2, sorted.length))
      .filter((s) => s.effective > 0)
      .map((s) => s.name);
  }
  if (weakAreas.length === 0 && subjectData.length > 0) {
    const sorted = [...subjectData].sort((a, b) => a.effective - b.effective);
    weakAreas = sorted.slice(0, Math.min(2, sorted.length)).map((s) => s.name);
  }

  const recommendations: string[] = [];
  for (const w of weakAreas.slice(0, 3)) {
    const sd = subjectData.find((s) => s.name === w);
    if (sd && sd.basedOn === "baseline") {
      recommendations.push(
        `Start a short daily practice in ${w} — baseline is ${sd.baseline}%, so even 10 questions a day will lift confidence quickly.`,
      );
    } else if (sd) {
      recommendations.push(
        `Focus extra practice on ${w} (currently ${sd.accuracy}%). Aim for two 20-minute sessions this week on the weakest topics.`,
      );
    }
  }
  if (stats.studyStreak < 3) {
    recommendations.push(
      `Build a study streak: complete at least 5 questions every day for the next 7 days to establish a routine.`,
    );
  }
  if (stats.questionsAnswered < 50) {
    recommendations.push(
      `Increase practice volume — aim for 100 questions across all subjects in the next two weeks to unlock reliable progress signals.`,
    );
  }
  for (const s of strengths.slice(0, 1)) {
    recommendations.push(
      `Keep momentum in ${s}: attempt one full past paper to consolidate this strength.`,
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      `Set a weekly study target (e.g. 30 questions per subject) and review each session's mistakes the following day.`,
      `Use BrainTrack's adaptive practice daily to surface topics that need the most attention.`,
      `Discuss progress with your child weekly to celebrate wins and agree the next focus area.`,
    );
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const studyDaysResult = await db.execute(sql`
    SELECT DATE(created_at) AS study_date, COUNT(*) AS q_count
    FROM attempts
    WHERE user_id = ${learnerTargetId}
      AND created_at >= ${thirtyDaysAgo}
    GROUP BY DATE(created_at)
    ORDER BY study_date ASC
  `);
  const studyDayRows = studyDaysResult.rows as Array<{
    study_date: string;
    q_count: string;
  }>;

  const weeklyTrendResult = await db.execute(sql`
    SELECT
      DATE_TRUNC('week', created_at) AS week_start,
      COUNT(*) AS total,
      SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct
    FROM attempts
    WHERE user_id = ${learnerTargetId}
      AND created_at >= NOW() - INTERVAL '28 days'
    GROUP BY DATE_TRUNC('week', created_at)
    ORDER BY week_start ASC
  `);
  const weeklyRows = weeklyTrendResult.rows as Array<{
    week_start: string;
    total: string;
    correct: string;
  }>;

  /* ── Emptiness detection ────────────────────────────────────────────────
     A report is a "Getting Started" report when there is nothing real to
     say: either no learner is linked to this parent, or the linked learner
     has produced no measurable signal at all (no attempts, no progress rows,
     no onboarding baseline marks).                                        */
  const hasLiveActivity =
    stats.questionsAnswered > 0 ||
    stats.papersCompleted > 0 ||
    studyDayRows.length > 0 ||
    weeklyRows.length > 0 ||
    subjectData.some((s) => s.questionsAttempted > 0);
  const hasBaselineSignal = subjectData.some((s) => s.baseline > 0);
  const isGettingStarted =
    !hasLinkedLearner || (!hasLiveActivity && !hasBaselineSignal);

  const partnerDisplayName = (partnerBranding.partnerName ?? "").trim();
  const generatedAt = new Date();
  const generatedAtLabel = generatedAt.toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const reportTitle = isGettingStarted
    ? t("Getting Started Report", "Aanvangsverslag")
    : t("Progress Report", "Vorderingsverslag");

  /* ── Partner logo: validate BEFORE we hand it to pdfkit ──────────────────
     Historically this lived in a bare `try { … } catch {}` inside the layout
     code, so a WebP upload (or a truncated base64 string) produced a report
     with no partner logo, no error and no log line — indistinguishable from
     "no logo configured". Now the buffer is decoded and format-checked here,
     and every rejection reason is logged.                                  */
  let partnerLogoBuffer: Buffer | null = null;
  if (partnerBranding.partnerLogoBase64) {
    const who = partnerDisplayName || "(unnamed partner)";
    try {
      const dataUri = partnerBranding.partnerLogoBase64;
      const commaIdx = dataUri.indexOf(",");
      const base64Data =
        dataUri.startsWith("data:") && commaIdx !== -1
          ? dataUri.slice(commaIdx + 1)
          : dataUri;
      const buf = Buffer.from(base64Data, "base64");

      if (buf.length === 0) {
        console.warn(
          `[ReportGenerator] Partner logo for ${who} decoded to 0 bytes — the stored ` +
            `"partner_branding.partnerLogoBase64" value is empty or not valid base64. Skipping logo.`,
        );
      } else {
        const format = detectImageFormat(buf);
        if (!PDF_EMBEDDABLE_FORMATS.has(format)) {
          console.warn(
            `[ReportGenerator] Partner logo for ${who} is "${format}" (${buf.length} bytes). ` +
              `PDF embedding supports JPEG and PNG only — re-upload the logo as a PNG ` +
              `(transparent background preferred, it sits on the near-black masthead). Skipping logo.`,
          );
        } else {
          partnerLogoBuffer = buf;
        }
      }
    } catch (err) {
      console.warn(
        `[ReportGenerator] Partner logo for ${who} could not be decoded from base64:`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  const hasPartnerLogo = partnerLogoBuffer !== null;
  const hasPartnerRow = !!partnerDisplayName || hasPartnerLogo;
  const HEADER_H = hasPartnerRow ? 178 : 152;

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      // Buffered pages let us stamp "Page n of N" once the total is known.
      bufferPages: true,
      info: {
        Title: `BrainTrack ${reportTitle} — ${learnerName}`,
        Author: "BrainTrack",
        Subject: t(
          "CAPS-aligned NSC exam preparation progress report",
          "KABV-belynde NSS-eksamenvoorbereiding vorderingsverslag",
        ),
        Creator: "BrainTrack Report Generator",
        Keywords: "BrainTrack, NSC, CAPS, progress report",
      },
    });

    /* Embed the brand typefaces. `F` is the resolved name map — every
       doc.font() call below goes through it, so a missing font file degrades
       to Helvetica loudly (see brand-fonts.ts) instead of silently. */
    const F: BrandFontSet = registerBrandFonts(doc);

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const LEFT = 50;
    const RIGHT = doc.page.width - 50;
    const CONTENT_W = RIGHT - LEFT;
    /** Top of the running footer furniture. */
    const FOOTER_TOP = doc.page.height - 62;
    /** Last y a content block may occupy. */
    const PAGE_BOTTOM = FOOTER_TOP - 20;

    /* ── Layout helpers ─────────────────────────────────────────────────── */

    /** Paint the white page ground so print drivers never guess. */
    const paintPage = () => {
      doc.rect(0, 0, doc.page.width, doc.page.height).fillColor(PAPER).fill();
    };
    paintPage();

    /** Slim brand stripe across the top of every continuation page. */
    const paintContinuationHeader = () => {
      const segW = doc.page.width / STRIPE.length;
      STRIPE.forEach((c, i) => {
        doc.rect(i * segW, 0, segW + 1, 3).fillColor(c).fill();
      });
      doc
        .fillColor(INK_SOFT)
        .font(F.medium)
        .fontSize(7.5)
        .text(
          `BrainTrack ${reportTitle} · ${learnerName}`.toUpperCase(),
          LEFT,
          20,
          { width: CONTENT_W, characterSpacing: 0.6, lineBreak: false },
        );
    };

    let y = 0;

    /**
     * Page-break guard. Returns true when a new page was started, so callers
     * that own repeating furniture (table headers) can redraw it.
     */
    const ensure = (needed: number): boolean => {
      if (y + needed > PAGE_BOTTOM) {
        doc.addPage();
        paintPage();
        paintContinuationHeader();
        y = 52;
        return true;
      }
      return false;
    };

    const rule = (gapAfter = SPACE.block) => {
      ensure(24);
      y += SPACE.tight;
      doc
        .moveTo(LEFT, y)
        .lineTo(RIGHT, y)
        .strokeColor(HAIRLINE)
        .lineWidth(1)
        .stroke();
      y += gapAfter;
    };

    /**
     * Section heading: pastel accent bar, tracked-out label, optional
     * right-aligned note, and a hairline that closes the header off. `needs`
     * is the height of the first content row so a heading is never left
     * stranded at the bottom of a page.
     */
    const heading = (
      label: string,
      accent: string,
      note?: string,
      needs = 46,
    ) => {
      ensure(34 + needs);
      doc.roundedRect(LEFT, y + 1, 4, 14, 2).fillColor(accent).fill();
      doc
        .fillColor(INK)
        .font(F.semibold)
        .fontSize(11)
        .text(label.toUpperCase(), LEFT + 14, y, {
          width: CONTENT_W - 14 - (note ? 150 : 0),
          characterSpacing: 0.9,
          lineBreak: false,
        });
      if (note) {
        doc
          .fillColor(INK_SOFT)
          .font(F.regular)
          .fontSize(8)
          .text(note, RIGHT - 150, y + 3, {
            width: 150,
            align: "right",
            lineBreak: false,
          });
      }
      y += 19;
      doc
        .moveTo(LEFT, y)
        .lineTo(RIGHT, y)
        .strokeColor(HAIRLINE)
        .lineWidth(1)
        .stroke();
      y += SPACE.block;
    };

    const para = (
      text: string,
      size = 9.5,
      color = INK_SOFT,
      indent = 0,
      font = F.regular,
    ) => {
      const w = CONTENT_W - indent;
      const h = doc.font(font).fontSize(size).heightOfString(text, {
        width: w,
        lineGap: 2,
      });
      ensure(h + SPACE.row);
      doc
        .fillColor(color)
        .font(font)
        .fontSize(size)
        .text(text, LEFT + indent, y, { width: w, lineGap: 2 });
      y += h + SPACE.row;
    };

    /** Bulleted line with a pastel marker. */
    const bullet = (text: string, accent = PURPLE, size = 9.5) => {
      const w = CONTENT_W - 24;
      const h = doc.font(F.regular).fontSize(size).heightOfString(text, {
        width: w,
        lineGap: 2,
      });
      ensure(h + 12);
      doc.circle(LEFT + 5, y + 6, 2.8).fillColor(accent).fill();
      doc
        .fillColor(INK)
        .font(F.regular)
        .fontSize(size)
        .text(text, LEFT + 24, y, { width: w, lineGap: 2 });
      y += h + SPACE.row;
    };

    /** Numbered step, used by the getting-started instructions. */
    const step = (n: number, text: string, accent = SKY) => {
      const w = CONTENT_W - 34;
      const h = doc.font(F.regular).fontSize(9.5).heightOfString(text, {
        width: w,
        lineGap: 2,
      });
      ensure(Math.max(h, 20) + 12);
      doc.roundedRect(LEFT, y, 20, 20, 6).fillColor(accent).fill();
      doc
        .fillColor(INK)
        .font(F.bold)
        .fontSize(9);
      doc.text(String(n), LEFT, y + (20 - doc.currentLineHeight()) / 2, {
        width: 20,
        align: "center",
        lineBreak: false,
      });
      doc
        .fillColor(INK)
        .font(F.regular)
        .fontSize(9.5)
        .text(text, LEFT + 34, y + 2, { width: w, lineGap: 2 });
      y += Math.max(h + 4, 20) + SPACE.row;
    };

    /**
     * Dignified empty state. Every data section calls this instead of
     * silently rendering nothing.
     */
    const emptyState = (msg: string, accent = SKY, tint = TINT_SKY) => {
      const w = CONTENT_W - 34;
      const th = doc.font(F.italic).fontSize(9).heightOfString(msg, {
        width: w,
        lineGap: 1.5,
      });
      const h = Math.max(38, th + 24);
      ensure(h + SPACE.block);
      doc.roundedRect(LEFT, y, CONTENT_W, h, 7).fillColor(tint).fill();
      doc.roundedRect(LEFT, y, 3.5, h, 1.75).fillColor(accent).fill();
      doc
        .fillColor(INK_SOFT)
        .font(F.italic)
        .fontSize(9)
        .text(msg, LEFT + 18, y + 12, { width: w, lineGap: 1.5 });
      y += h + SPACE.block;
    };

    const bandColor = (pct: number) =>
      pct >= 75 ? MINT : pct >= 50 ? YELLOW : RISK;

    /** Pastel-tint track + pastel accent fill. */
    const drawBar = (
      x: number,
      barY: number,
      w: number,
      h: number,
      pct: number,
      fill: string,
      track: string = TRACK,
    ) => {
      const r = h / 2;
      doc.roundedRect(x, barY, w, h, r).fillColor(track).fill();
      const ratio = Math.max(0, Math.min(1, pct / 100));
      const len = Math.round(ratio * w);
      if (len > 0) {
        doc.roundedRect(x, barY, Math.max(len, h), h, r).fillColor(fill).fill();
      }
    };

    /**
     * Shrink `text` to fit `width` on one line: step the size down to `min`,
     * then truncate with an ellipsis as a last resort. Long CAPS subject names
     * ("Afrikaans First Additional Language") otherwise wrap and get clipped by
     * their table row.
     */
    const fitOneLine = (
      text: string,
      font: string,
      maxSize: number,
      minSize: number,
      width: number,
      tracking = 0,
    ): { text: string; size: number } => {
      doc.font(font);
      const measure = (s: string, sz: number) =>
        doc.fontSize(sz).widthOfString(s, { characterSpacing: tracking } as any);
      let size = maxSize;
      while (size > minSize && measure(text, size) > width) size -= 0.25;
      if (measure(text, size) <= width) return { text, size };
      let out = text;
      while (out.length > 1 && measure(out + "…", size) > width) {
        out = out.slice(0, -1);
      }
      return { text: out.trimEnd() + "…", size };
    };

    /** Vertically-centred single-line text inside a box. */
    const cell = (
      text: string,
      x: number,
      boxY: number,
      w: number,
      h: number,
      o: {
        font: string;
        size: number;
        color: string;
        align?: "left" | "right" | "center";
        tracking?: number;
        minSize?: number;
      },
    ) => {
      const tracking = o.tracking ?? 0;
      /* pdfkit's `lineBreak: false` does NOT stop a run from wrapping once
         `characterSpacing` pushes its measured width past `width` — verified
         against pdfkit directly. A wrapped run then overflows its row and gets
         clipped (this is what chopped "VERANDERING" in the Afrikaans table).
         So every cell fits its own text: shrink a little, then ellipsise. */
      const fitted = fitOneLine(
        text,
        o.font,
        o.size,
        o.minSize ?? o.size * 0.82,
        w,
        tracking,
      );
      doc.font(o.font).fontSize(fitted.size).fillColor(o.color);
      const lh = doc.currentLineHeight();
      doc.text(fitted.text, x, boxY + (h - lh) / 2, {
        width: w,
        align: o.align ?? "left",
        lineBreak: false,
        characterSpacing: tracking,
      });
    };

    /** Small pill used for deltas and status. */
    const chip = (
      text: string,
      x: number,
      boxY: number,
      w: number,
      rowH: number,
      fill: string,
    ) => {
      const h = 14;
      const cy = boxY + (rowH - h) / 2;
      doc.roundedRect(x, cy, w, h, 7).fillColor(fill).fill();
      cell(text, x, cy, w, h, {
        font: F.semibold,
        size: 7.5,
        color: INK,
        align: "center",
      });
    };

    /** Vector checkmark — Poppins has no U+2713 glyph, so we draw it. */
    const drawCheck = (x: number, cy: number, size = 7) => {
      doc
        .moveTo(x, cy)
        .lineTo(x + size * 0.35, cy + size * 0.38)
        .lineTo(x + size, cy - size * 0.45)
        .strokeColor(INK)
        .lineWidth(1.6)
        .lineCap("round")
        .lineJoin("round")
        .stroke();
    };

    /* ── Masthead ───────────────────────────────────────────────────────── */

    doc.rect(0, 0, doc.page.width, HEADER_H).fillColor(NEAR_BLACK).fill();

    // Pastel accent strip along the bottom of the band — the brand signature,
    // restrained to a 3pt rule so it reads executive, not loud.
    const segW = doc.page.width / STRIPE.length;
    STRIPE.forEach((c, i) => {
      doc.rect(i * segW, HEADER_H - 3, segW + 1, 3).fillColor(c).fill();
    });

    try {
      doc.image(BRAND_LOGO_BUFFER, LEFT, 24, { fit: [146, 38] });
    } catch (err) {
      console.warn(
        "[ReportGenerator] BrainTrack logo could not be embedded — falling back to the wordmark:",
        err instanceof Error ? err.message : String(err),
      );
      doc
        .fillColor(PAPER)
        .font(F.bold)
        .fontSize(24)
        .text("BrainTrack", LEFT, 30, { lineBreak: false });
    }

    /* Report title — the ONE place Permanent Marker is allowed to shout.
       Auto-fits down to a 15pt floor; below that a marker face is illegible,
       so we swap to Poppins Bold rather than print mush. */
    const TITLE_MIN = 15;
    let titleSize = 26;
    doc.font(F.display);
    while (
      titleSize > TITLE_MIN &&
      doc.fontSize(titleSize).widthOfString(reportTitle) > CONTENT_W - 8
    ) {
      titleSize -= 0.5;
    }
    const titleFitsAsMarker =
      doc.font(F.display).fontSize(TITLE_MIN).widthOfString(reportTitle) <=
      CONTENT_W - 8;
    doc
      .font(titleFitsAsMarker ? F.display : F.bold)
      .fontSize(titleFitsAsMarker ? titleSize : 22)
      .fillColor(AQUA)
      .text(reportTitle, LEFT, 74, { width: CONTENT_W, lineBreak: false });

    /* Meta row — label above value, left and right stacks. */
    const metaLabelY = 116;
    const metaValueY = 127;
    const metaLabel = (txt: string, x: number, w: number, align: "left" | "right") => {
      doc
        .fillColor(SKY)
        .font(F.medium)
        .fontSize(6.8)
        .text(txt.toUpperCase(), x, metaLabelY, {
          width: w,
          align,
          characterSpacing: 1.1,
          lineBreak: false,
        });
    };
    const metaValue = (txt: string, x: number, w: number, align: "left" | "right") => {
      // Learner names are unbounded user data — fit rather than let it wrap
      // out of the masthead band.
      const fitted = fitOneLine(txt, F.medium, 10, 7.5, w);
      doc
        .fillColor(PAPER)
        .font(F.medium)
        .fontSize(fitted.size)
        .text(fitted.text, x, metaValueY, { width: w, align, lineBreak: false });
    };
    metaLabel(t("Learner", "Leerder"), LEFT, CONTENT_W / 2 - 10, "left");
    metaValue(learnerName, LEFT, CONTENT_W / 2 - 10, "left");
    metaLabel(t("Report Date", "Verslagdatum"), LEFT + CONTENT_W / 2, CONTENT_W / 2, "right");
    metaValue(generatedAtLabel, LEFT + CONTENT_W / 2, CONTENT_W / 2, "right");

    if (hasPartnerRow) {
      const partnerY = 150;
      if (partnerLogoBuffer) {
        try {
          doc.image(partnerLogoBuffer, RIGHT - 66, partnerY - 6, {
            fit: [66, 22],
            align: "right",
          });
        } catch (err) {
          // Format was validated above, so reaching here means pdfkit rejected
          // an otherwise well-formed PNG/JPEG (e.g. 16-bit or interlaced PNG,
          // CMYK JPEG). Say so explicitly — never swallow it.
          console.warn(
            `[ReportGenerator] pdfkit rejected the partner logo for ` +
              `${partnerDisplayName || "(unnamed partner)"} despite a valid ` +
              `${detectImageFormat(partnerLogoBuffer)} signature ` +
              `(${partnerLogoBuffer.length} bytes). pdfkit cannot embed 16-bit or ` +
              `interlaced PNGs, or CMYK/progressive JPEGs — re-save as an 8-bit ` +
              `non-interlaced PNG. Reason:`,
            err instanceof Error ? err.message : String(err),
          );
        }
      }
      if (partnerDisplayName) {
        const partnerW = CONTENT_W - (hasPartnerLogo ? 90 : 10);
        const fitted = fitOneLine(
          `${t("In partnership with", "In vennootskap met")}: ${partnerDisplayName}`,
          F.regular,
          8,
          6.5,
          partnerW,
        );
        doc
          .fillColor(SKY)
          .font(F.regular)
          .fontSize(fitted.size)
          .text(fitted.text, LEFT, partnerY, {
            width: partnerW,
            lineBreak: false,
          });
      }
    }

    y = HEADER_H + 24;

    /* ── Standfirst ─────────────────────────────────────────────────────── */

    doc
      .fillColor(INK_SOFT)
      .font(F.italic)
      .fontSize(9)
      .text(
        t(
          `Prepared for the parent or guardian of ${learnerName}. Reporting period: the 30 days to ${generatedAtLabel}.`,
          `Opgestel vir die ouer of voog van ${learnerName}. Verslagtydperk: die 30 dae tot ${generatedAtLabel}.`,
        ),
        LEFT,
        y,
        { width: CONTENT_W, lineGap: 1.5 },
      );
    y += 26;

    /* ── Summary stat cards (always rendered) ───────────────────────────── */

    heading(
      t("Summary", "Opsomming"),
      AQUA,
      t("At a glance", "Op 'n oogopslag"),
      78,
    );

    const summaryItems: Array<[string, string, string, string]> = [
      [
        t("Overall Accuracy", "Algehele Akkuraatheid"),
        `${stats.accuracy}%`,
        AQUA,
        TINT_AQUA,
      ],
      [
        t("Questions Answered", "Vrae Beantwoord"),
        `${stats.questionsAnswered}`,
        SKY,
        TINT_SKY,
      ],
      [
        t("Study Streak", "Studiereeks"),
        `${stats.studyStreak} ${t("days", "dae")}`,
        PURPLE,
        TINT_PURPLE,
      ],
      [
        t("Papers Completed", "Vraestelle Voltooi"),
        `${stats.papersCompleted}`,
        PINK,
        TINT_PINK,
      ],
    ];

    const cardGap = 11;
    const cardW = (CONTENT_W - cardGap * 3) / 4;
    const cardH = 70;
    ensure(cardH + SPACE.block);
    summaryItems.forEach(([label, value, accent, tint], i) => {
      const cx = LEFT + i * (cardW + cardGap);
      doc.roundedRect(cx, y, cardW, cardH, 8).fillColor(tint).fill();
      doc.roundedRect(cx, y, cardW, 3, 1.5).fillColor(accent).fill();

      /* Auto-fit the figure so "1,234 days" never clips the card. */
      let vSize = 18;
      doc.font(F.bold);
      while (vSize > 10 && doc.fontSize(vSize).widthOfString(value) > cardW - 22) {
        vSize -= 0.5;
      }
      doc
        .fillColor(INK)
        .font(F.bold)
        .fontSize(vSize)
        .text(value, cx + 11, y + 18, { width: cardW - 22, lineBreak: false });
      doc
        .fillColor(INK_SOFT)
        .font(F.medium)
        .fontSize(6.8)
        .text(label.toUpperCase(), cx + 11, y + 48, {
          width: cardW - 18,
          characterSpacing: 0.7,
        });
    });
    y += cardH + SPACE.section;

    if (isGettingStarted) {
      /* ── GETTING STARTED VARIANT ──────────────────────────────────────
         Rendered when there is no linked learner or no recorded activity.
         A parent paying for this product must never receive a blank page. */

      heading(
        hasLinkedLearner
          ? t("No Activity Recorded Yet", "Nog Geen Aktiwiteit Aangeteken Nie")
          : t("No Learner Linked Yet", "Nog Geen Leerder Gekoppel Nie"),
        YELLOW,
        undefined,
        60,
      );

      para(
        hasLinkedLearner
          ? t(
              `We have not recorded any study activity for ${learnerName} during this reporting period, so there are no marks, trends or subject results to report yet. That is completely normal for a new account — this report explains exactly what happens next and what you will receive once practice begins.`,
              `Ons het nog geen studie-aktiwiteit vir ${learnerName} gedurende hierdie verslagtydperk aangeteken nie, en daar is dus nog geen punte, neigings of vakuitslae om te rapporteer nie. Dit is heeltemal normaal vir 'n nuwe rekening — hierdie verslag verduidelik presies wat volgende gebeur en wat u sal ontvang sodra oefening begin.`,
            )
          : t(
              `There is currently no learner linked to your BrainTrack parent account, so we cannot yet report on any results. Linking takes about two minutes — the steps are below. Once a learner is linked, your reports begin automatically on the next scheduled send.`,
              `Daar is tans geen leerder aan u BrainTrack-ouerrekening gekoppel nie, en ons kan dus nog nie oor uitslae verslag doen nie. Koppeling neem ongeveer twee minute — die stappe is hieronder. Sodra 'n leerder gekoppel is, begin u verslae outomaties met die volgende geskeduleerde stuur.`,
            ),
        10,
        INK,
      );

      y += SPACE.block;

      if (!hasLinkedLearner) {
        heading(
          t("How to Link Your Learner", "Hoe om U Leerder te Koppel"),
          SKY,
          t("About two minutes", "Ongeveer twee minute"),
          64,
        );
        step(1, t(
          "Sign in at app.braintrack.co.za with this same email address and open the Parent Dashboard.",
          "Meld aan by app.braintrack.co.za met hierdie selfde e-posadres en maak die Ouer-paneelbord oop.",
        ), AQUA);
        step(2, t(
          "Choose \"Link a learner\" and enter the activation code from your BrainTrack welcome email.",
          "Kies \"Koppel 'n leerder\" en voer die aktiveringskode uit u BrainTrack-verwelkomings-e-pos in.",
        ), SKY);
        step(3, t(
          "Your child signs in with their own BrainTrack account and confirms the link request.",
          "U kind meld aan met sy/haar eie BrainTrack-rekening en bevestig die koppelingsversoek.",
        ), PURPLE);
        step(4, t(
          "That's it — the link activates immediately and reporting starts from the next scheduled send.",
          "Dis al — die koppeling aktiveer onmiddellik en verslagdoening begin met die volgende geskeduleerde stuur.",
        ), MINT);
        y += SPACE.block;
      }

      heading(
        t("What to Expect Once Practice Begins", "Wat om te Verwag Sodra Oefening Begin"),
        MINT,
        undefined,
        60,
      );
      para(
        t(
          "BrainTrack starts producing meaningful signal after roughly 20–30 answered questions. Before that, results can swing widely on a handful of answers, so we hold back rather than report noise as fact.",
          "BrainTrack begin betekenisvolle seine lewer na ongeveer 20–30 beantwoorde vrae. Voor dit kan uitslae wyd wissel op 'n handjievol antwoorde, en ons hou eerder terug as om ruis as feit te rapporteer.",
        ),
      );
      bullet(
        t(
          "Week 1 — a baseline forms from the onboarding subject marks and the first practice sessions.",
          "Week 1 — 'n basislyn vorm uit die aanvangsvakpunte en die eerste oefensessies.",
        ),
        AQUA,
      );
      bullet(
        t(
          "Week 2 — per-subject accuracy becomes reliable and strengths and focus areas appear.",
          "Week 2 — akkuraatheid per vak word betroubaar en sterkpunte en fokusareas verskyn.",
        ),
        SKY,
      );
      bullet(
        t(
          "Week 3 onward — score trends, study-activity charts and tailored recommendations fill out.",
          "Week 3 en verder — puntetendense, studie-aktiwiteitgrafieke en pasgemaakte aanbevelings vul aan.",
        ),
        PURPLE,
      );

      y += SPACE.block;

      heading(
        t("What Your Report Will Contain", "Wat U Verslag Sal Bevat"),
        PINK,
        undefined,
        58,
      );

      const contents: Array<[string, string, string, string]> = [
        [
          t("Summary", "Opsomming"),
          t(
            "Overall accuracy, questions answered, study streak and papers completed at a glance.",
            "Algehele akkuraatheid, vrae beantwoord, studiereeks en vraestelle voltooi op 'n oogopslag.",
          ),
          AQUA,
          TINT_AQUA,
        ],
        [
          t("Subject Performance", "Vakprestasie"),
          t(
            "Every selected subject with live accuracy, onboarding baseline and the change between them.",
            "Elke gekose vak met lewendige akkuraatheid, aanvangsbasislyn en die verandering daartussen.",
          ),
          SKY,
          TINT_SKY,
        ],
        [
          t("Strengths & Focus Areas", "Sterkpunte & Fokusareas"),
          t(
            "Where your child is performing well, and which subjects need attention first.",
            "Waar u kind goed presteer, en watter vakke eerste aandag verg.",
          ),
          MINT,
          TINT_MINT,
        ],
        [
          t("Recommendations", "Aanbevelings"),
          t(
            "Specific, practical actions for the week ahead — not generic study advice.",
            "Spesifieke, praktiese aksies vir die week wat kom — nie algemene studieraad nie.",
          ),
          PURPLE,
          TINT_PURPLE,
        ],
        [
          t("Study Activity — 30 Days", "Studie-aktiwiteit — 30 Dae"),
          t(
            "Daily question volume, so you can see consistency rather than one-off cramming.",
            "Daaglikse vraevolume, sodat u konsekwentheid eerder as eenmalige propwerk kan sien.",
          ),
          YELLOW,
          TINT_YELLOW,
        ],
        [
          t("Score Trend — 4 Weeks", "Punteneiging — 4 Weke"),
          t(
            "Week-by-week accuracy, showing whether the direction of travel is upward.",
            "Week-vir-week akkuraatheid, wat wys of die rigting opwaarts is.",
          ),
          PINK,
          TINT_PINK,
        ],
      ];

      for (const [label, desc, accent, tint] of contents) {
        const w = CONTENT_W - 36;
        const dh = doc.font(F.regular).fontSize(8.5).heightOfString(desc, {
          width: w,
          lineGap: 1.5,
        });
        const boxH = dh + 32;
        ensure(boxH + SPACE.row);
        doc.roundedRect(LEFT, y, CONTENT_W, boxH, 7).fillColor(tint).fill();
        doc.roundedRect(LEFT, y, 3.5, boxH, 1.75).fillColor(accent).fill();
        doc
          .fillColor(INK)
          .font(F.semibold)
          .fontSize(9.5)
          .text(label, LEFT + 18, y + 9, { width: w, lineBreak: false });
        doc
          .fillColor(INK_SOFT)
          .font(F.regular)
          .fontSize(8.5)
          .text(desc, LEFT + 18, y + 24, { width: w, lineGap: 1.5 });
        y += boxH + SPACE.row;
      }

      y += SPACE.block;

      heading(
        t("Your First Week — A Simple Plan", "U Eerste Week — 'n Eenvoudige Plan"),
        PURPLE,
        undefined,
        56,
      );
      bullet(
        t(
          "Aim for 10 questions a day. Short and daily beats long and occasional, every time.",
          "Mik vir 10 vrae per dag. Kort en daagliks klop lank en af en toe, elke keer.",
        ),
        MINT,
      );
      bullet(
        t(
          "Make sure onboarding is complete — the subject marks entered there become the baseline we measure against.",
          "Maak seker aanvang is voltooi — die vakpunte wat daar ingevoer word, word die basislyn waarteen ons meet.",
        ),
        SKY,
      );
      bullet(
        t(
          "Check in once a week rather than daily. Progress is a trend, not a single session.",
          "Gaan een keer per week na eerder as daagliks. Vordering is 'n tendens, nie 'n enkele sessie nie.",
        ),
        YELLOW,
      );
      bullet(
        t(
          "Celebrate the streak, not just the score — consistency is the strongest predictor of exam outcomes.",
          "Vier die reeks, nie net die punt nie — konsekwentheid is die sterkste voorspeller van eksamenuitslae.",
        ),
        PINK,
      );

      y += SPACE.tight;
      emptyState(
        t(
          "Need a hand? Reply to this email or contact support@braintrack.co.za and we will help you get set up.",
          "Hulp nodig? Antwoord op hierdie e-pos of kontak support@braintrack.co.za en ons sal u help om reg te kom.",
        ),
        AQUA,
        TINT_AQUA,
      );
    } else {
      /* ── FULL DATA VARIANT ────────────────────────────────────────────── */

      /* — Subject performance: a real table, not a stack of loose rows —
         Columns are fixed so every figure sits on a shared right edge and the
         eye can run down a column. The header repeats after a page break. */

      const COL = {
        subject: { x: LEFT, w: 176 },
        bar: { x: LEFT + 184, w: 102 },
        qs: { x: LEFT + 294, w: 40 },
        base: { x: LEFT + 340, w: 46 },
        now: { x: LEFT + 392, w: 44 },
        chg: { x: LEFT + 442, w: 53 },
      };
      const ROW_H = 26;
      const HEAD_H = 20;

      const subjectTableHeader = () => {
        doc.rect(LEFT, y, CONTENT_W, HEAD_H).fillColor(TINT_PURPLE).fill();
        const opt = {
          font: F.semibold,
          size: 6.8,
          color: INK_SOFT,
          tracking: 0.8,
        } as const;
        cell(t("Subject", "Vak").toUpperCase(), COL.subject.x + 8, y, COL.subject.w, HEAD_H, opt);
        cell(t("Progress", "Vordering").toUpperCase(), COL.bar.x, y, COL.bar.w, HEAD_H, opt);
        cell(t("Qs", "Vrae").toUpperCase(), COL.qs.x, y, COL.qs.w, HEAD_H, { ...opt, align: "right" });
        cell(t("Base", "Basis").toUpperCase(), COL.base.x, y, COL.base.w, HEAD_H, { ...opt, align: "right" });
        cell(t("Now", "Nou").toUpperCase(), COL.now.x, y, COL.now.w, HEAD_H, { ...opt, align: "right" });
        cell(t("Change", "Verskil").toUpperCase(), COL.chg.x, y, COL.chg.w, HEAD_H, { ...opt, align: "center" });
        y += HEAD_H;
      };

      heading(
        t("Subject Performance", "Vakprestasie"),
        SKY,
        subjectData.length > 0
          ? `${subjectData.length} ${t("subjects", "vakke")}`
          : undefined,
        HEAD_H + ROW_H + 10,
      );

      if (subjectData.length === 0) {
        emptyState(
          t(
            "No subjects have been selected for this learner yet. Once subjects are chosen during onboarding, each one will appear here with its accuracy, baseline and change.",
            "Nog geen vakke is vir hierdie leerder gekies nie. Sodra vakke tydens aanvang gekies is, sal elkeen hier verskyn met akkuraatheid, basislyn en verandering.",
          ),
          SKY,
          TINT_SKY,
        );
      } else {
        subjectTableHeader();
        subjectData.forEach((subj, idx) => {
          if (ensure(ROW_H)) subjectTableHeader();
          if (idx % 2 === 1) {
            doc.rect(LEFT, y, CONTENT_W, ROW_H).fillColor(ZEBRA).fill();
          }
          const band = bandColor(subj.accuracy);

          cell(subj.name, COL.subject.x + 8, y, COL.subject.w - 14, ROW_H, {
            font: F.medium,
            size: 9,
            minSize: 6.75,
            color: INK,
          });
          drawBar(COL.bar.x, y + (ROW_H - 7) / 2, COL.bar.w, 7, subj.accuracy, band);
          cell(`${subj.questionsAttempted}`, COL.qs.x, y, COL.qs.w, ROW_H, {
            font: F.regular,
            size: 8.5,
            color: INK_SOFT,
            align: "right",
          });
          cell(
            subj.baseline > 0 ? `${subj.baseline}%` : "—",
            COL.base.x, y, COL.base.w, ROW_H,
            { font: F.regular, size: 8.5, color: INK_SOFT, align: "right" },
          );
          cell(`${subj.accuracy}%`, COL.now.x, y, COL.now.w, ROW_H, {
            font: F.bold,
            size: 9.5,
            color: INK,
            align: "right",
          });
          if (subj.baseline > 0) {
            chip(
              `${subj.delta >= 0 ? "+" : ""}${subj.delta}%`,
              COL.chg.x + 5, y, COL.chg.w - 5, ROW_H,
              subj.delta > 0 ? MINT : subj.delta < 0 ? RISK : TINT_PURPLE,
            );
          } else {
            cell("—", COL.chg.x, y, COL.chg.w, ROW_H, {
              font: F.regular,
              size: 8.5,
              color: INK_SOFT,
              align: "center",
            });
          }
          y += ROW_H;
          doc
            .moveTo(LEFT, y)
            .lineTo(RIGHT, y)
            .strokeColor(HAIRLINE)
            .lineWidth(0.5)
            .stroke();
        });
        y += SPACE.tight;
        const footnote = t(
          "Base = the mark entered at onboarding. Now = live accuracy across all answered questions. Subjects with fewer than 5 answered questions are still ranked on their baseline under Strengths & Focus Areas — a handful of answers is not yet a reliable signal.",
          "Basis = die punt wat tydens aanvang ingevoer is. Nou = lewendige akkuraatheid oor alle beantwoorde vrae. Vakke met minder as 5 beantwoorde vrae word steeds op hul basislyn gerangskik onder Sterkpunte & Fokusareas — 'n handjievol antwoorde is nog nie 'n betroubare sein nie.",
        );
        const footnoteH = doc
          .font(F.italic)
          .fontSize(7.5)
          .heightOfString(footnote, { width: CONTENT_W, lineGap: 1 });
        ensure(footnoteH + SPACE.row);
        doc
          .fillColor(INK_SOFT)
          .font(F.italic)
          .fontSize(7.5)
          .text(footnote, LEFT, y, { width: CONTENT_W, lineGap: 1 });
        y += footnoteH;
      }

      y += SPACE.block;

      /* — Strengths & focus areas, side by side — */

      const halfW = (CONTENT_W - 16) / 2;
      const colX = [LEFT, LEFT + halfW + 16];
      const listRowH = 21;

      const panels: Array<[string, string[], string, string, string]> = [
        [
          t("Performing well", "Presteer goed"),
          strengths,
          MINT,
          TINT_MINT,
          t(
            "No clear strengths have emerged yet this period. They will appear as soon as a subject reaches a reliable score.",
            "Nog geen duidelike sterkpunte het hierdie tydperk na vore gekom nie. Hulle sal verskyn sodra 'n vak 'n betroubare punt bereik.",
          ),
        ],
        [
          t("Needs attention", "Verg aandag"),
          weakAreas,
          RISK,
          TINT_RISK,
          t(
            "No subject is currently flagged for concern. Keep the routine going and we will alert you if that changes.",
            "Geen vak word tans as kommerwekkend gemerk nie. Hou die roetine aan die gang en ons sal u waarsku as dit verander.",
          ),
        ],
      ];

      /* Measure both columns BEFORE the heading is drawn, so the heading and
         its panels are guaranteed to land on the same page. Previously the
         heading was emitted first with a guessed height and could be left
         stranded alone at the foot of a page. */
      const panelH =
        26 +
        8 +
        Math.max(
          ...panels.map(([, items, , , emptyMsg]) =>
            items.length > 0
              ? items.length * listRowH
              : doc.font(F.italic).fontSize(8).heightOfString(emptyMsg, {
                  width: halfW - 28,
                  lineGap: 1.2,
                }),
          ),
        );

      heading(
        t("Strengths & Focus Areas", "Sterkpunte & Fokusareas"),
        MINT,
        undefined,
        panelH + 6,
      );

      const panelTop = y;

      panels.forEach(([label, items, accent, tint, emptyMsg], i) => {
        const px = colX[i];
        doc.roundedRect(px, panelTop, halfW, panelH, 8).fillColor(tint).fill();
        doc.roundedRect(px, panelTop, halfW, 3, 1.5).fillColor(accent).fill();
        cell(label.toUpperCase(), px + 14, panelTop + 6, halfW - 28, 18, {
          font: F.semibold,
          size: 7,
          color: INK_SOFT,
          tracking: 0.9,
        });
        let ry = panelTop + 26;
        if (items.length === 0) {
          doc
            .fillColor(INK_SOFT)
            .font(F.italic)
            .fontSize(8)
            .text(emptyMsg, px + 14, ry, { width: halfW - 28, lineGap: 1.2 });
        } else {
          for (const item of items) {
            if (i === 0) {
              drawCheck(px + 14, ry + listRowH / 2, 7);
            } else {
              doc
                .circle(px + 17, ry + listRowH / 2, 3.2)
                .fillColor(RISK)
                .fill();
            }
            cell(item, px + 28, ry, halfW - 42, listRowH, {
              font: F.regular,
              size: 9,
              color: INK,
            });
            ry += listRowH;
          }
        }
      });
      y = panelTop + panelH + SPACE.section;

      /* — Recommendations — */

      heading(
        t("Recommendations", "Aanbevelings"),
        PURPLE,
        t("For the week ahead", "Vir die week wat kom"),
        44,
      );
      if (recommendations.length === 0) {
        emptyState(
          t(
            "No specific recommendations this period — the current study routine is working. Keep it steady.",
            "Geen spesifieke aanbevelings hierdie tydperk nie — die huidige studieroetine werk. Hou dit konstant.",
          ),
          PURPLE,
          TINT_PURPLE,
        );
      } else {
        recommendations.forEach((r, i) => {
          const w = CONTENT_W - 60;
          const h = doc.font(F.regular).fontSize(9.5).heightOfString(r, {
            width: w,
            lineGap: 2,
          });
          const boxH = Math.max(h + 20, 38);
          ensure(boxH + SPACE.row);
          doc.roundedRect(LEFT, y, CONTENT_W, boxH, 7).fillColor(TINT_PURPLE).fill();
          doc.roundedRect(LEFT, y, 3.5, boxH, 1.75).fillColor(PURPLE).fill();
          doc.circle(LEFT + 28, y + 19, 10).fillColor(PURPLE).fill();
          cell(String(i + 1), LEFT + 18, y + 9, 20, 20, {
            font: F.bold,
            size: 9,
            color: INK,
            align: "center",
          });
          doc
            .fillColor(INK)
            .font(F.regular)
            .fontSize(9.5)
            .text(r, LEFT + 48, y + 10, { width: w, lineGap: 2 });
          y += boxH + SPACE.row;
        });
      }

      y += SPACE.block;

      /* — Study activity — */

      const shownDays = studyDayRows.slice(-14);
      const dayRowH = 17;
      /* Minimum rows that must travel together. Splitting a bar chart 12/2
         across a page reads as a printing accident; forcing all 14 onto one
         page wastes half a sheet. Widow control is the middle path — the
         heading is guaranteed the KPI row plus MIN_CHUNK bars, and the loop
         below never leaves fewer than MIN_CHUNK bars stranded. */
      const MIN_CHUNK = 4;
      const activityBlockH =
        shownDays.length > 0
          ? 34 + SPACE.block + Math.min(shownDays.length, MIN_CHUNK) * dayRowH + SPACE.row
          : 56;
      heading(
        t("Study Activity — Last 30 Days", "Studie-aktiwiteit — Laaste 30 Dae"),
        YELLOW,
        shownDays.length > 0 && studyDayRows.length > shownDays.length
          ? t(
              `Most recent ${shownDays.length} active days`,
              `Mees onlangse ${shownDays.length} aktiewe dae`,
            )
          : undefined,
        activityBlockH,
      );
      if (studyDayRows.length === 0) {
        emptyState(
          t(
            "No study sessions were recorded in the last 30 days. A daily bar will appear here for every day your child practises.",
            "Geen studiesessies is in die laaste 30 dae aangeteken nie. 'n Daaglikse balkie sal hier verskyn vir elke dag wat u kind oefen.",
          ),
          YELLOW,
          TINT_YELLOW,
        );
      } else {
        const totalStudyDays = studyDayRows.length;
        const totalQuestionsMonth = studyDayRows.reduce(
          (sum, r) => sum + parseInt(r.q_count || "0", 10),
          0,
        );

        /* Two summary figures, given room to breathe. */
        const kpiW = (CONTENT_W - 12) / 2;
        [
          [t("Active study days", "Aktiewe studiedae"), `${totalStudyDays}`, AQUA],
          [t("Questions answered", "Vrae beantwoord"), `${totalQuestionsMonth}`, YELLOW],
        ].forEach(([label, value, accent], i) => {
          const kx = LEFT + i * (kpiW + 12);
          doc.roundedRect(kx, y, kpiW, 34, 7).fillColor(TINT_YELLOW).fill();
          doc.roundedRect(kx, y, 3.5, 34, 1.75).fillColor(accent).fill();
          cell(label.toUpperCase(), kx + 14, y, kpiW - 80, 34, {
            font: F.medium,
            size: 7,
            color: INK_SOFT,
            tracking: 0.8,
          });
          cell(value, kx + kpiW - 74, y, 60, 34, {
            font: F.bold,
            size: 13,
            color: INK,
            align: "right",
          });
        });
        y += 34 + SPACE.block;

        const dayLabelW = 52;
        const dayBarX = LEFT + dayLabelW + 8;
        const dayBarW = CONTENT_W - dayLabelW - 8 - 44;
        const maxQ = Math.max(
          ...studyDayRows.map((r) => parseInt(r.q_count || "0", 10)),
          1,
        );
        for (let i = 0; i < shownDays.length; i++) {
          const remaining = shownDays.length - i;
          const fitsHere = Math.floor((PAGE_BOTTOM - y) / dayRowH);
          // Break early when carrying on would strand a 1–3 row widow overleaf.
          if (
            fitsHere < remaining &&
            remaining - fitsHere < MIN_CHUNK &&
            remaining > MIN_CHUNK
          ) {
            ensure(PAGE_BOTTOM); // force a page break
          } else {
            ensure(dayRowH);
          }
          const row = shownDays[i];
          const qCount = parseInt(row.q_count || "0", 10);
          const dateLabel = new Date(row.study_date).toLocaleDateString(
            dateLocale,
            { day: "numeric", month: "short" },
          );
          cell(dateLabel, LEFT, y, dayLabelW, dayRowH, {
            font: F.regular,
            size: 8,
            color: INK_SOFT,
          });
          drawBar(dayBarX, y + (dayRowH - 8) / 2, dayBarW, 8, (qCount / maxQ) * 100, AQUA, TINT_AQUA);
          cell(`${qCount}`, RIGHT - 40, y, 40, dayRowH, {
            font: F.semibold,
            size: 8.5,
            color: INK,
            align: "right",
          });
          y += dayRowH;
        }
        y += SPACE.row;
      }

      y += SPACE.block;

      /* — Score trend — */

      const wkRowH = 22;
      heading(
        t("Score Trend — Last 4 Weeks", "Punteneiging — Laaste 4 Weke"),
        PINK,
        undefined,
        weeklyRows.length > 0 ? weeklyRows.length * wkRowH + SPACE.row : 50,
      );
      if (weeklyRows.length === 0) {
        emptyState(
          t(
            "No exams or practice sets have been written yet this period, so there is no score trend to plot. One line will appear here for each week of activity.",
            "Nog geen eksamens of oefenstelle is hierdie tydperk geskryf nie, dus is daar geen punteneiging om te wys nie. Een lyn sal hier per week van aktiwiteit verskyn.",
          ),
          PINK,
          TINT_PINK,
        );
      } else {
        const wkLabelW = 108;
        const wkBarX = LEFT + wkLabelW + 8;
        const wkBarW = CONTENT_W - wkLabelW - 8 - 108;
        for (const row of weeklyRows) {
          ensure(wkRowH);
          const total = parseInt(row.total || "0", 10);
          const correct = parseInt(row.correct || "0", 10);
          const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
          const weekDate = new Date(row.week_start).toLocaleDateString(
            dateLocale,
            { day: "numeric", month: "short" },
          );
          cell(
            `${t("Week of", "Week van")} ${weekDate}`,
            LEFT, y, wkLabelW, wkRowH,
            { font: F.regular, size: 8.5, color: INK_SOFT },
          );
          drawBar(wkBarX, y + (wkRowH - 8) / 2, wkBarW, 8, pct, bandColor(pct));
          cell(`${pct}%`, RIGHT - 104, y, 44, wkRowH, {
            font: F.bold,
            size: 9.5,
            color: INK,
            align: "right",
          });
          cell(`(${correct}/${total})`, RIGHT - 56, y, 56, wkRowH, {
            font: F.regular,
            size: 8,
            color: INK_SOFT,
            align: "right",
          });
          y += wkRowH;
        }
        y += SPACE.row;
      }
    }

    /* ── Closing block ──────────────────────────────────────────────────── */

    y += SPACE.block;
    ensure(92);
    doc
      .moveTo(LEFT, y)
      .lineTo(RIGHT, y)
      .strokeColor(HAIRLINE)
      .lineWidth(1)
      .stroke();
    y += 18;

    /* The second — and last — Permanent Marker moment: a human sign-off that
       bookends the masthead. 17pt, well clear of the legibility floor. */
    doc
      .fillColor(INK)
      .font(F.display)
      .fontSize(17)
      .text(t("Keep going.", "Hou aan."), LEFT, y, {
        width: CONTENT_W,
        align: "center",
        lineBreak: false,
      });
    y += 26;

    doc
      .fillColor(INK)
      .font(F.medium)
      .fontSize(8)
      .text(
        t(
          "Generated by BrainTrack — CAPS-aligned NSC exam preparation platform.",
          "Gegenereer deur BrainTrack — KABV-belynde NSS-eksamenvoorbereidingsplatform.",
        ),
        LEFT,
        y,
        { align: "center", width: CONTENT_W },
      );
    y += 13;
    doc
      .fillColor(INK_SOFT)
      .font(F.regular)
      .fontSize(8)
      .text(
        t(
          "This report is for parent/guardian use only and is not an official academic transcript.",
          "Hierdie verslag is slegs vir ouer/voog se gebruik en is nie 'n amptelike akademiese transkripsie nie.",
        ),
        LEFT,
        y,
        { align: "center", width: CONTENT_W },
      );

    /* ── Running footer, stamped once the page total is known ───────────── */

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      // Writing this low would otherwise trip pdfkit's bottom-margin auto-paging.
      const savedBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;

      doc
        .moveTo(LEFT, FOOTER_TOP)
        .lineTo(RIGHT, FOOTER_TOP)
        .strokeColor(HAIRLINE)
        .lineWidth(0.75)
        .stroke();

      doc
        .fillColor(INK_SOFT)
        .font(F.regular)
        .fontSize(7.5)
        .text(
          `BrainTrack · ${reportTitle} · ${generatedAtLabel}`,
          LEFT,
          FOOTER_TOP + 8,
          { width: CONTENT_W - 120, lineBreak: false },
        );

      doc
        .fillColor(INK_SOFT)
        .font(F.medium)
        .fontSize(7.5)
        .text(
          `${t("Page", "Bladsy")} ${i - range.start + 1} ${t("of", "van")} ${range.count}`,
          RIGHT - 120,
          FOOTER_TOP + 8,
          { width: 120, align: "right", lineBreak: false },
        );

      doc.page.margins.bottom = savedBottom;
    }

    doc.end();
  });
}
