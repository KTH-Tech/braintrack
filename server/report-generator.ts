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
 *   - Near-black header band carrying the BrainTrack logo.
 * The dark app UI treatment is deliberately NOT used here.
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

/** Header band — brand near-black. */
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
  const hasPartnerLogo = !!partnerBranding.partnerLogoBase64;
  const headerHeight = partnerDisplayName ? 132 : 112;

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const LEFT = 50;
    const RIGHT = doc.page.width - 50;
    const CONTENT_W = RIGHT - LEFT;
    const PAGE_BOTTOM = 760;

    /* ── Layout helpers ─────────────────────────────────────────────────── */

    /** Paint the white page ground so print drivers never guess. */
    const paintPage = () => {
      doc.rect(0, 0, doc.page.width, doc.page.height).fillColor(PAPER).fill();
    };
    paintPage();

    let y = 0;

    /** Page-break guard — preserves the original `if (y > N) addPage()` idiom. */
    const ensure = (needed: number) => {
      if (y + needed > PAGE_BOTTOM) {
        doc.addPage();
        paintPage();
        y = 50;
      }
    };

    const rule = (gapAfter = 16) => {
      ensure(24);
      y += 4;
      doc
        .moveTo(LEFT, y)
        .lineTo(RIGHT, y)
        .strokeColor(HAIRLINE)
        .lineWidth(1)
        .stroke();
      y += gapAfter;
    };

    /** Section heading: pastel accent bar + tracked-out near-black label. */
    const heading = (label: string, accent: string) => {
      ensure(52);
      doc.rect(LEFT, y + 1, 4, 15).fillColor(accent).fill();
      doc
        .fillColor(INK)
        .font("Helvetica-Bold")
        .fontSize(12.5)
        .text(label.toUpperCase(), LEFT + 13, y + 2, {
          width: CONTENT_W - 13,
          characterSpacing: 0.7,
        });
      y += 28;
    };

    const para = (text: string, size = 10, color = INK_SOFT, indent = 0) => {
      const w = CONTENT_W - indent;
      const h = doc.font("Helvetica").fontSize(size).heightOfString(text, { width: w });
      ensure(h + 10);
      doc
        .fillColor(color)
        .font("Helvetica")
        .fontSize(size)
        .text(text, LEFT + indent, y, { width: w, lineGap: 2 });
      y += h + 8;
    };

    /** Bulleted line with a pastel marker. */
    const bullet = (text: string, accent = PURPLE, size = 10) => {
      const w = CONTENT_W - 22;
      const h = doc.font("Helvetica").fontSize(size).heightOfString(text, { width: w });
      ensure(h + 12);
      doc.circle(LEFT + 5, y + 5, 2.6).fillColor(accent).fill();
      doc
        .fillColor(INK)
        .font("Helvetica")
        .fontSize(size)
        .text(text, LEFT + 22, y, { width: w, lineGap: 2 });
      y += h + 8;
    };

    /** Numbered step, used by the getting-started instructions. */
    const step = (n: number, text: string, accent = SKY) => {
      const w = CONTENT_W - 30;
      const h = doc.font("Helvetica").fontSize(10).heightOfString(text, { width: w });
      ensure(Math.max(h, 18) + 12);
      doc.roundedRect(LEFT, y - 1, 18, 18, 5).fillColor(accent).fill();
      doc
        .fillColor(INK)
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .text(String(n), LEFT, y + 4, { width: 18, align: "center" });
      doc
        .fillColor(INK)
        .font("Helvetica")
        .fontSize(10)
        .text(text, LEFT + 30, y + 1, { width: w, lineGap: 2 });
      y += Math.max(h, 18) + 10;
    };

    /**
     * Dignified empty state. Every data section calls this instead of
     * silently rendering nothing.
     */
    const emptyState = (msg: string, accent = SKY, tint = TINT_SKY) => {
      const w = CONTENT_W - 30;
      const th = doc.font("Helvetica-Oblique").fontSize(9.5).heightOfString(msg, { width: w });
      const h = Math.max(34, th + 20);
      ensure(h + 14);
      doc.roundedRect(LEFT, y, CONTENT_W, h, 6).fillColor(tint).fill();
      doc.roundedRect(LEFT, y, 3.5, h, 1.75).fillColor(accent).fill();
      doc
        .fillColor(INK_SOFT)
        .font("Helvetica-Oblique")
        .fontSize(9.5)
        .text(msg, LEFT + 16, y + 10, { width: w });
      y += h + 12;
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

    /* ── Header band ────────────────────────────────────────────────────── */

    doc.rect(0, 0, doc.page.width, headerHeight).fillColor(NEAR_BLACK).fill();

    // Pastel accent strip along the bottom of the band — the brand signature,
    // restrained to a 3pt rule so it reads executive, not loud.
    const stripe = [AQUA, SKY, PURPLE, PINK, YELLOW, MINT];
    const segW = doc.page.width / stripe.length;
    stripe.forEach((c, i) => {
      doc.rect(i * segW, headerHeight - 3, segW + 1, 3).fillColor(c).fill();
    });

    try {
      doc.image(BRAND_LOGO_BUFFER, LEFT, 22, { fit: [140, 40] });
    } catch {
      // Fall back to the wordmark if the logo asset can't be embedded.
      doc
        .fillColor("#ffffff")
        .fontSize(26)
        .font("Helvetica-Bold")
        .text("BrainTrack™", LEFT, 30);
    }

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(AQUA)
      .text(
        isGettingStarted
          ? t("Getting Started Report", "Aanvangsverslag").toUpperCase()
          : t("Progress Report", "Vorderingsverslag").toUpperCase(),
        LEFT,
        66,
        { characterSpacing: 1.2 },
      );
    doc
      .fillColor("#ffffff")
      .fontSize(10)
      .font("Helvetica")
      .text(`${t("Learner", "Leerder")}: ${learnerName}`, LEFT, 84);
    doc
      .fillColor("#ffffff")
      .fontSize(10)
      .font("Helvetica")
      .text(
        `${t("Report Date", "Verslagdatum")}: ${new Date().toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}`,
        300,
        84,
        { width: RIGHT - 300, align: "right" },
      );

    if (partnerDisplayName || hasPartnerLogo) {
      const partnerY = 106;
      if (hasPartnerLogo) {
        try {
          const dataUri = partnerBranding.partnerLogoBase64!;
          const base64Data = dataUri.split(",")[1] ?? dataUri;
          const logoBuffer = Buffer.from(base64Data, "base64");
          doc.image(logoBuffer, doc.page.width - 120, partnerY - 8, {
            fit: [60, 22],
            align: "right",
          });
        } catch { /* logo embed failed */ }
      }
      if (partnerDisplayName) {
        const partnerLabel = t("In partnership with", "In vennootskap met");
        doc
          .fillColor(SKY)
          .fontSize(8)
          .font("Helvetica")
          .text(
            `${partnerLabel}: ${partnerDisplayName}`,
            LEFT,
            partnerY,
            { width: doc.page.width - 180 },
          );
      }
    }

    y = headerHeight + 26;

    /* ── Summary stat cards (always rendered) ───────────────────────────── */

    heading(t("Summary", "Opsomming"), AQUA);

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

    ensure(80);
    const gap = 10;
    const cardW = (CONTENT_W - gap * 3) / 4;
    const cardH = 62;
    summaryItems.forEach(([label, value, accent, tint], i) => {
      const cx = LEFT + i * (cardW + gap);
      doc.roundedRect(cx, y, cardW, cardH, 7).fillColor(tint).fill();
      doc.roundedRect(cx, y, cardW, 3, 1.5).fillColor(accent).fill();
      doc
        .fillColor(INK)
        .font("Helvetica-Bold")
        .fontSize(17)
        .text(value, cx + 10, y + 15, { width: cardW - 20 });
      doc
        .fillColor(INK_SOFT)
        .font("Helvetica")
        .fontSize(7.5)
        .text(label.toUpperCase(), cx + 10, y + 41, {
          width: cardW - 16,
          characterSpacing: 0.4,
        });
    });
    y += cardH + 20;

    if (isGettingStarted) {
      /* ── GETTING STARTED VARIANT ──────────────────────────────────────
         Rendered when there is no linked learner or no recorded activity.
         A parent paying for this product must never receive a blank page. */

      rule();

      heading(
        hasLinkedLearner
          ? t("No Activity Recorded Yet", "Nog Geen Aktiwiteit Aangeteken Nie")
          : t("No Learner Linked Yet", "Nog Geen Leerder Gekoppel Nie"),
        YELLOW,
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
        10.5,
        INK,
      );

      y += 4;

      if (!hasLinkedLearner) {
        heading(t("How to Link Your Learner", "Hoe om U Leerder te Koppel"), SKY);
        step(1, t(
          "Sign in at app.braintrack.co.za with this same email address and open the Parent Dashboard.",
          "Meld aan by app.braintrack.co.za met hierdie selfde e-posadres en maak die Ouer-paneelbord oop.",
        ));
        step(2, t(
          "Choose \"Link a learner\" and enter the activation code from your BrainTrack welcome email.",
          "Kies \"Koppel 'n leerder\" en voer die aktiveringskode uit u BrainTrack-verwelkomings-e-pos in.",
        ));
        step(3, t(
          "Your child signs in with their own BrainTrack account and confirms the link request.",
          "U kind meld aan met sy/haar eie BrainTrack-rekening en bevestig die koppelingsversoek.",
        ));
        step(4, t(
          "That's it — the link activates immediately and reporting starts from the next scheduled send.",
          "Dis al — die koppeling aktiveer onmiddellik en verslagdoening begin met die volgende geskeduleerde stuur.",
        ));
        y += 6;
        rule();
      }

      heading(
        t("What to Expect Once Practice Begins", "Wat om te Verwag Sodra Oefening Begin"),
        MINT,
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

      y += 6;
      rule();

      heading(t("What Your Report Will Contain", "Wat U Verslag Sal Bevat"), PINK);

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
        const w = CONTENT_W - 34;
        const dh = doc.font("Helvetica").fontSize(9).heightOfString(desc, { width: w });
        const boxH = dh + 30;
        ensure(boxH + 10);
        doc.roundedRect(LEFT, y, CONTENT_W, boxH, 6).fillColor(tint).fill();
        doc.roundedRect(LEFT, y, 3.5, boxH, 1.75).fillColor(accent).fill();
        doc
          .fillColor(INK)
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(label, LEFT + 16, y + 9, { width: w });
        doc
          .fillColor(INK_SOFT)
          .font("Helvetica")
          .fontSize(9)
          .text(desc, LEFT + 16, y + 23, { width: w, lineGap: 1.5 });
        y += boxH + 8;
      }

      y += 6;
      rule();

      heading(t("Your First Week — A Simple Plan", "U Eerste Week — 'n Eenvoudige Plan"), PURPLE);
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

      y += 6;
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

      rule();

      heading(t("Subject Performance", "Vakprestasie"), SKY);

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
        for (const subj of subjectData) {
          ensure(46);
          const band = bandColor(subj.accuracy);
          doc
            .fillColor(INK)
            .font("Helvetica-Bold")
            .fontSize(11)
            .text(subj.name, LEFT, y, { width: CONTENT_W - 70 });
          doc
            .fillColor(INK)
            .font("Helvetica-Bold")
            .fontSize(11)
            .text(`${subj.accuracy}%`, RIGHT - 70, y, {
              width: 70,
              align: "right",
            });
          y += 15;
          doc
            .fillColor(INK_SOFT)
            .font("Helvetica")
            .fontSize(8.5)
            .text(
              `${t("Questions", "Vrae")}: ${subj.questionsAttempted}   ·   ${t("Baseline", "Basislyn")}: ${subj.baseline}%   ·   ${t("Change", "Verandering")}: ${subj.delta >= 0 ? "+" : ""}${subj.delta}%`,
              LEFT,
              y,
              { width: CONTENT_W },
            );
          drawBar(LEFT, y + 14, CONTENT_W, 7, subj.accuracy, band);
          y += 36;
        }
      }

      rule();

      heading(t("Strengths", "Sterkpunte"), MINT);
      if (strengths.length === 0) {
        emptyState(
          t(
            "No clear strengths have emerged yet this period. They will appear as soon as a subject reaches a reliable score.",
            "Nog geen duidelike sterkpunte het hierdie tydperk na vore gekom nie. Hulle sal verskyn sodra 'n vak 'n betroubare punt bereik.",
          ),
          MINT,
          TINT_MINT,
        );
      } else {
        for (const s of strengths) {
          ensure(24);
          doc.roundedRect(LEFT, y - 1, 14, 14, 4).fillColor(MINT).fill();
          doc
            .fillColor(INK)
            .font("Helvetica-Bold")
            .fontSize(8)
            .text("✓", LEFT, y + 2, { width: 14, align: "center" });
          doc
            .fillColor(INK)
            .font("Helvetica")
            .fontSize(10)
            .text(s, LEFT + 22, y + 1, { width: CONTENT_W - 22 });
          y += 20;
        }
      }
      y += 6;

      heading(t("Areas for Improvement", "Verbeteringsareas"), RISK);
      if (weakAreas.length === 0) {
        emptyState(
          t(
            "No subject is currently flagged for concern. Keep the routine going and we will alert you if that changes.",
            "Geen vak word tans as kommerwekkend gemerk nie. Hou die roetine aan die gang en ons sal u waarsku as dit verander.",
          ),
          MINT,
          TINT_MINT,
        );
      } else {
        for (const s of weakAreas) {
          ensure(24);
          doc.roundedRect(LEFT, y - 1, 14, 14, 4).fillColor(RISK).fill();
          doc
            .fillColor(INK)
            .font("Helvetica")
            .fontSize(10)
            .text(s, LEFT + 22, y + 1, { width: CONTENT_W - 22 });
          y += 20;
        }
      }
      y += 6;

      rule();

      heading(t("Recommendations", "Aanbevelings"), PURPLE);
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
        for (const r of recommendations) {
          const w = CONTENT_W - 24;
          const h = doc.font("Helvetica").fontSize(10).heightOfString(r, { width: w });
          ensure(h + 14);
          doc.roundedRect(LEFT, y + 1, 3.5, Math.max(h, 12), 1.75).fillColor(PURPLE).fill();
          doc
            .fillColor(INK)
            .font("Helvetica")
            .fontSize(10)
            .text(r, LEFT + 24, y, { width: w, lineGap: 2 });
          y += Math.max(18, h + 10);
        }
      }
      y += 4;

      rule();

      heading(
        t("Study Activity — Last 30 Days", "Studie-aktiwiteit — Laaste 30 Dae"),
        YELLOW,
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
        ensure(30);
        doc
          .fillColor(INK_SOFT)
          .font("Helvetica")
          .fontSize(9.5)
          .text(
            `${t("Active study days", "Aktiewe studiedae")}: ${totalStudyDays}   ·   ${t("Total questions answered", "Totale vrae beantwoord")}: ${totalQuestionsMonth}`,
            LEFT,
            y,
            { width: CONTENT_W },
          );
        y += 20;
        const BAR_W = 400;
        const maxQ = Math.max(
          ...studyDayRows.map((r) => parseInt(r.q_count || "0", 10)),
          1,
        );
        for (const row of studyDayRows.slice(-14)) {
          ensure(20);
          const qCount = parseInt(row.q_count || "0", 10);
          const dateLabel = new Date(row.study_date).toLocaleDateString(
            dateLocale,
            { day: "numeric", month: "short" },
          );
          doc
            .fillColor(INK_SOFT)
            .font("Helvetica")
            .fontSize(8)
            .text(dateLabel, LEFT, y + 1, { width: 48 });
          drawBar(102, y, BAR_W, 8, (qCount / maxQ) * 100, AQUA, TINT_AQUA);
          doc
            .fillColor(INK)
            .font("Helvetica-Bold")
            .fontSize(8)
            .text(`${qCount}`, 102 + BAR_W + 8, y + 1, { width: 40 });
          y += 14;
        }
        y += 8;
      }

      rule();

      heading(
        t("Score Trend — Last 4 Weeks", "Punteneiging — Laaste 4 Weke"),
        PINK,
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
        for (const row of weeklyRows) {
          ensure(24);
          const total = parseInt(row.total || "0", 10);
          const correct = parseInt(row.correct || "0", 10);
          const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
          const weekDate = new Date(row.week_start).toLocaleDateString(
            dateLocale,
            { day: "numeric", month: "short" },
          );
          doc
            .fillColor(INK_SOFT)
            .font("Helvetica")
            .fontSize(9)
            .text(`${t("Week of", "Week van")} ${weekDate}`, LEFT, y + 1, {
              width: 120,
            });
          drawBar(174, y, 280, 8, pct, bandColor(pct));
          doc
            .fillColor(INK)
            .font("Helvetica-Bold")
            .fontSize(9)
            .text(`${pct}%`, 462, y + 1, { width: 30, align: "right" });
          doc
            .fillColor(INK_SOFT)
            .font("Helvetica")
            .fontSize(8)
            .text(`(${correct}/${total})`, 496, y + 1.5, { width: 50 });
          y += 18;
        }
        y += 8;
      }
    }

    /* ── Footer ─────────────────────────────────────────────────────────── */

    y += 10;
    ensure(70);
    doc
      .moveTo(LEFT, y)
      .lineTo(RIGHT, y)
      .strokeColor(HAIRLINE)
      .lineWidth(1)
      .stroke();
    y += 14;
    doc
      .fillColor(INK)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text(
        t(
          "Generated by BrainTrack™ — CAPS-aligned NSC exam preparation platform.",
          "Gegenereer deur BrainTrack™ — KABV-belynde NSS-eksamenvoorbereidingsplatform.",
        ),
        LEFT,
        y,
        { align: "center", width: CONTENT_W },
      );
    y += 13;
    doc
      .fillColor(INK_SOFT)
      .fontSize(8)
      .font("Helvetica")
      .text(
        t(
          "This report is for parent/guardian use only and is not an official academic transcript.",
          "Hierdie verslag is slegs vir ouer/voog se gebruik en is nie 'n amptelike akademiese transkripsie nie.",
        ),
        LEFT,
        y,
        { align: "center", width: CONTENT_W },
      );

    doc.end();
  });
}
