/**
 * server/report-generator.ts
 *
 * Shared PDF report generation helper.  Extracted from the parent PDF route
 * so the same logic can be used both for on-demand downloads and for the
 * scheduled email-delivery flow in server/scheduled-reports.ts.
 *
 * Returns a raw Buffer — callers decide whether to pipe it to a response or
 * base64-encode it for a SendGrid attachment.
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
}

/**
 * Generate a BrainTrack progress report PDF and return it as a Buffer.
 * All parameters must already be resolved (auth checks are the caller's
 * responsibility).
 */
export async function generateReportPdfBuffer(
  opts: ReportGeneratorOpts,
): Promise<Buffer> {
  const { learnerTargetId, learnerName, lang, partnerBranding = {} } = opts;
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

  const VIOLET = "#7c3aed";
  const DARK = "#1e1b4b";
  const GREY = "#6b7280";
  const RED = "#dc2626";
  const GREEN = "#16a34a";

  const partnerDisplayName = (partnerBranding.partnerName ?? "").trim();
  const hasPartnerLogo = !!partnerBranding.partnerLogoBase64;
  const headerHeight = partnerDisplayName ? 130 : 110;

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(0, 0, doc.page.width, headerHeight).fill(DARK);
    try {
      doc.image(BRAND_LOGO_BUFFER, 50, 22, { fit: [140, 40] });
    } catch {
      // Fall back to the wordmark if the logo asset can't be embedded.
      doc
        .fillColor("#ffffff")
        .fontSize(26)
        .font("Helvetica-Bold")
        .text("BrainTrack™", 50, 30);
    }
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#c4b5fd")
      .text(t("Progress Report", "Vorderingsverslag"), 50, 62);
    doc
      .fillColor("#ffffff")
      .fontSize(10)
      .text(`${t("Learner", "Leerder")}: ${learnerName}`, 50, 82);
    doc.text(
      `${t("Report Date", "Verslagdatum")}: ${new Date().toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}`,
      300,
      82,
      { align: "right" },
    );

    if (partnerDisplayName || hasPartnerLogo) {
      const partnerY = 104;
      if (hasPartnerLogo) {
        try {
          const dataUri = partnerBranding.partnerLogoBase64!;
          const base64Data = dataUri.split(",")[1] ?? dataUri;
          const logoBuffer = Buffer.from(base64Data, "base64");
          doc.image(logoBuffer, doc.page.width - 120, partnerY - 6, {
            fit: [60, 24],
            align: "right",
          });
        } catch { /* logo embed failed */ }
      }
      if (partnerDisplayName) {
        const partnerLabel = t("In partnership with", "In vennootskap met");
        doc
          .fillColor("#c4b5fd")
          .fontSize(8)
          .font("Helvetica")
          .text(
            `${partnerLabel}: ${partnerDisplayName}`,
            50,
            partnerY,
            { width: doc.page.width - 180 },
          );
      }
    }

    let y = headerHeight + 20;

    doc
      .fillColor(DARK)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(t("Summary", "Opsomming"), 50, y);
    y += 24;
    const summaryItems = [
      [t("Overall Accuracy", "Algehele Akkuraatheid"), `${stats.accuracy}%`],
      [
        t("Questions Answered", "Vrae Beantwoord"),
        `${stats.questionsAnswered}`,
      ],
      [
        t("Study Streak", "Studiereeks"),
        `${stats.studyStreak} ${t("days", "dae")}`,
      ],
      [
        t("Papers Completed", "Vraestelle Voltooi"),
        `${stats.papersCompleted}`,
      ],
    ];
    for (const [label, value] of summaryItems) {
      doc.fillColor(GREY).font("Helvetica").fontSize(10).text(label + ":", 50, y);
      doc.fillColor(DARK).font("Helvetica-Bold").text(value, 220, y);
      y += 18;
    }

    y += 10;
    doc
      .moveTo(50, y)
      .lineTo(doc.page.width - 50, y)
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .stroke();
    y += 16;

    doc
      .fillColor(DARK)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(t("Subject Performance", "Vakprestasie"), 50, y);
    y += 24;

    for (const subj of subjectData) {
      if (y > 720) { doc.addPage(); y = 50; }
      const band =
        subj.accuracy >= 75 ? GREEN : subj.accuracy >= 50 ? "#d97706" : RED;
      doc
        .fillColor(DARK)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(subj.name, 50, y);
      doc
        .fillColor(band)
        .font("Helvetica")
        .fontSize(10)
        .text(`${subj.accuracy}%`, 300, y, { align: "right" });
      y += 16;
      doc
        .fillColor(GREY)
        .fontSize(9)
        .text(
          `${t("Questions", "Vrae")}: ${subj.questionsAttempted} | ${t("Baseline", "Basislyn")}: ${subj.baseline}% | ${t("Change", "Verandering")}: ${subj.delta >= 0 ? "+" : ""}${subj.delta}%`,
          50,
          y,
        );
      doc.rect(50, y + 14, 300, 6).fillColor("#e5e7eb").fill();
      const barW = Math.round((subj.accuracy / 100) * 300);
      doc.rect(50, y + 14, barW, 6).fillColor(band).fill();
      y += 34;
    }

    y += 6;
    doc
      .moveTo(50, y)
      .lineTo(doc.page.width - 50, y)
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .stroke();
    y += 16;

    if (strengths.length > 0) {
      doc
        .fillColor(DARK)
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(t("Strengths", "Sterkpunte"), 50, y);
      y += 20;
      for (const s of strengths) {
        doc
          .fillColor(GREEN)
          .fontSize(10)
          .font("Helvetica")
          .text(`✓ ${s}`, 60, y);
        y += 16;
      }
      y += 8;
    }

    if (weakAreas.length > 0) {
      if (y > 700) { doc.addPage(); y = 50; }
      doc
        .fillColor(DARK)
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(t("Areas for Improvement", "Verbeteringsareas"), 50, y);
      y += 20;
      for (const s of weakAreas) {
        doc
          .fillColor(RED)
          .fontSize(10)
          .font("Helvetica")
          .text(`• ${s}`, 60, y);
        y += 16;
      }
      y += 8;
    }

    if (recommendations.length > 0) {
      if (y > 660) { doc.addPage(); y = 50; }
      doc
        .moveTo(50, y)
        .lineTo(doc.page.width - 50, y)
        .strokeColor("#e5e7eb")
        .lineWidth(1)
        .stroke();
      y += 16;
      doc
        .fillColor(DARK)
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Recommendations", 50, y);
      y += 22;
      for (const r of recommendations) {
        if (y > 740) { doc.addPage(); y = 50; }
        doc.fillColor(VIOLET).font("Helvetica-Bold").fontSize(10).text("›", 55, y);
        doc
          .fillColor(DARK)
          .font("Helvetica")
          .fontSize(10)
          .text(r, 70, y, { width: doc.page.width - 120 });
        const h = doc.heightOfString(r, { width: doc.page.width - 120 });
        y += Math.max(16, h + 6);
      }
      y += 6;
    }

    if (studyDayRows.length > 0) {
      if (y > 660) { doc.addPage(); y = 50; }
      y += 6;
      doc
        .moveTo(50, y)
        .lineTo(doc.page.width - 50, y)
        .strokeColor("#e5e7eb")
        .lineWidth(1)
        .stroke();
      y += 16;
      doc
        .fillColor(DARK)
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(
          t(
            "Study Activity — Last 30 Days",
            "Studie-aktiwiteit — Laaste 30 Dae",
          ),
          50,
          y,
        );
      y += 20;
      const totalStudyDays = studyDayRows.length;
      const totalQuestionsMonth = studyDayRows.reduce(
        (sum, r) => sum + parseInt(r.q_count || "0", 10),
        0,
      );
      doc
        .fillColor(GREY)
        .font("Helvetica")
        .fontSize(10)
        .text(
          `${t("Active study days", "Aktiewe studiedae")}: ${totalStudyDays}  |  ${t("Total questions answered", "Totale vrae beantwoord")}: ${totalQuestionsMonth}`,
          50,
          y,
        );
      y += 18;
      const BAR_W = 430;
      const maxQ = Math.max(
        ...studyDayRows.map((r) => parseInt(r.q_count || "0", 10)),
        1,
      );
      for (const row of studyDayRows.slice(-14)) {
        if (y > 730) { doc.addPage(); y = 50; }
        const qCount = parseInt(row.q_count || "0", 10);
        const barLen = Math.round((qCount / maxQ) * BAR_W);
        const dateLabel = new Date(row.study_date).toLocaleDateString(
          dateLocale,
          { day: "numeric", month: "short" },
        );
        doc.fillColor(GREY).fontSize(8).text(dateLabel, 50, y, { width: 48 });
        doc.rect(102, y + 1, BAR_W, 8).fillColor("#e5e7eb").fill();
        doc.rect(102, y + 1, barLen, 8).fillColor(VIOLET).fill();
        doc.fillColor(GREY).fontSize(8).text(`${qCount}`, 102 + BAR_W + 6, y);
        y += 14;
      }
      y += 8;
    }

    if (weeklyRows.length > 0) {
      if (y > 660) { doc.addPage(); y = 50; }
      y += 6;
      doc
        .moveTo(50, y)
        .lineTo(doc.page.width - 50, y)
        .strokeColor("#e5e7eb")
        .lineWidth(1)
        .stroke();
      y += 16;
      doc
        .fillColor(DARK)
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(
          t("Score Trend — Last 4 Weeks", "Punteneiging — Laaste 4 Weke"),
          50,
          y,
        );
      y += 20;
      for (const row of weeklyRows) {
        if (y > 730) { doc.addPage(); y = 50; }
        const total = parseInt(row.total || "0", 10);
        const correct = parseInt(row.correct || "0", 10);
        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
        const weekDate = new Date(row.week_start).toLocaleDateString(
          dateLocale,
          { day: "numeric", month: "short" },
        );
        const barLen = Math.round((pct / 100) * 300);
        const trendColor =
          pct >= 70 ? GREEN : pct >= 50 ? "#d97706" : RED;
        doc
          .fillColor(GREY)
          .fontSize(9)
          .text(`${t("Week of", "Week van")} ${weekDate}`, 50, y, {
            width: 120,
          });
        doc.rect(174, y + 1, 300, 8).fillColor("#e5e7eb").fill();
        doc.rect(174, y + 1, barLen, 8).fillColor(trendColor).fill();
        doc
          .fillColor(DARK)
          .font("Helvetica-Bold")
          .fontSize(9)
          .text(`${pct}%`, 480, y);
        doc
          .fillColor(GREY)
          .font("Helvetica")
          .fontSize(8)
          .text(`(${correct}/${total})`, 506, y);
        y += 18;
      }
      y += 8;
    }

    y += 10;
    if (y > 680) { doc.addPage(); y = 50; }
    doc
      .moveTo(50, y)
      .lineTo(doc.page.width - 50, y)
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .stroke();
    y += 16;
    doc
      .fillColor(GREY)
      .fontSize(8)
      .font("Helvetica")
      .text(
        t(
          "Generated by BrainTrack™ — CAPS-aligned NSC exam preparation platform.",
          "Gegenereer deur BrainTrack™ — KABV-belynde NSS-eksamenvoorbereidingsplatform.",
        ),
        50,
        y,
        { align: "center", width: doc.page.width - 100 },
      );
    y += 12;
    doc.fillColor(GREY).fontSize(8).text(
      t(
        "This report is for parent/guardian use only and is not an official academic transcript.",
        "Hierdie verslag is slegs vir ouer/voog se gebruik en is nie 'n amptelike akademiese transkripsie nie.",
      ),
      50,
      y,
      { align: "center", width: doc.page.width - 100 },
    );

    doc.end();
  });
}
