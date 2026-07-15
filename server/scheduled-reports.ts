/**
 * server/scheduled-reports.ts
 *
 * Scheduled parent progress-report email delivery.
 *
 * Schedule config is stored in system_config under key
 * "partner_report_schedule" and has the shape:
 *   {
 *     enabled: boolean,
 *     frequency: "weekly" | "monthly",
 *     dayOfWeek: 0-6,      // 0=Sun … 6=Sat  (weekly only)
 *     dayOfMonth: 1-28,    // (monthly only)
 *     sendHourSast: 0-23,  // hour (SAST) to send
 *   }
 *
 * Callers:
 *   - scripts/nightly-report-emails.sh (scheduled cron-like loop)
 *   - POST /api/admin/report-schedule/send-now (admin manual trigger)
 */

import { db } from "./db";
import { systemConfig, parentLinks, reportEmailSendLog } from "@shared/schema";
import { users } from "@shared/models/auth";
import { and, eq } from "drizzle-orm";
import { generateReportPdfBuffer } from "./report-generator";
import { sendBrandedEmail } from "./email";
import { buildUnsubscribeUrl } from "./report-unsubscribe";

const SAST_OFFSET_HOURS = 2;

export interface ReportScheduleConfig {
  enabled: boolean;
  frequency: "weekly" | "monthly";
  dayOfWeek: number;
  dayOfMonth: number;
  sendHourSast: number;
}

const DEFAULT_SCHEDULE: ReportScheduleConfig = {
  enabled: false,
  frequency: "weekly",
  dayOfWeek: 1,
  dayOfMonth: 1,
  sendHourSast: 7,
};

export async function getReportScheduleConfig(): Promise<ReportScheduleConfig> {
  try {
    const [row] = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, "partner_report_schedule"));
    if (!row) return { ...DEFAULT_SCHEDULE };
    return { ...DEFAULT_SCHEDULE, ...(row.value as Partial<ReportScheduleConfig>) };
  } catch {
    return { ...DEFAULT_SCHEDULE };
  }
}

export async function saveReportScheduleConfig(
  config: Partial<ReportScheduleConfig>,
  updatedBy = "admin",
): Promise<void> {
  const current = await getReportScheduleConfig();
  const merged = { ...current, ...config };
  await db
    .insert(systemConfig)
    .values({
      key: "partner_report_schedule",
      value: merged,
      updatedAt: new Date(),
      updatedBy,
    })
    .onConflictDoUpdate({
      target: systemConfig.key,
      set: { value: merged, updatedAt: new Date(), updatedBy },
    });
}

/** Returns true when the current SAST time matches the configured send window. */
export function shouldSendNow(
  config: ReportScheduleConfig,
  now: Date = new Date(),
): boolean {
  if (!config.enabled) return false;

  const sast = new Date(now.getTime() + SAST_OFFSET_HOURS * 60 * 60 * 1000);
  const hourSast = sast.getUTCHours();
  const dowSast = sast.getUTCDay();
  const domSast = sast.getUTCDate();

  if (hourSast !== config.sendHourSast) return false;

  if (config.frequency === "weekly") {
    return dowSast === config.dayOfWeek;
  }
  if (config.frequency === "monthly") {
    return domSast === config.dayOfMonth;
  }
  return false;
}

export interface ScheduledReportRunResult {
  totalParents: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
}

async function sendReportEmail(opts: {
  to: string;
  learnerName: string;
  partnerName: string | null;
  pdfBuffer: Buffer;
  lang: "en" | "af";
  unsubscribeUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { to, learnerName, partnerName, pdfBuffer, lang, unsubscribeUrl } = opts;
  const isAf = lang === "af";

  const subject = isAf
    ? `BrainTrack Vorderingsverslag${partnerName ? ` — ${partnerName}` : ""} — ${learnerName}`
    : `BrainTrack Progress Report${partnerName ? ` — ${partnerName}` : ""} — ${learnerName}`;

  const heading = isAf
    ? `Vorderingsverslag — ${learnerName}`
    : `Progress Report — ${learnerName}`;

  const partnerBlock = partnerName
    ? isAf
      ? `<p style="color:#666666;font-size:13px;">In vennootskap met <strong>${partnerName}</strong>.</p>`
      : `<p style="color:#666666;font-size:13px;">In partnership with <strong>${partnerName}</strong>.</p>`
    : "";

  const unsubBlock = isAf
    ? `<p style="color:#888888;font-size:12px;margin-top:24px;border-top:1px solid #eeeeee;padding-top:12px;">Wil jy nie meer hierdie geskeduleerde verslae ontvang nie? <a href="${unsubscribeUrl}" style="color:#7c3aed;">Skryf uit met een klik</a>.</p>`
    : `<p style="color:#888888;font-size:12px;margin-top:24px;border-top:1px solid #eeeeee;padding-top:12px;">No longer want to receive these scheduled reports? <a href="${unsubscribeUrl}" style="color:#7c3aed;">Unsubscribe with one click</a>.</p>`;

  const bodyHtml = isAf
    ? `
      <p>Hallo,</p>
      <p>Hierdie week se <strong style="color:#7c3aed;">BrainTrack vorderingsverslag</strong> vir <strong>${learnerName}</strong> is aangeheg as PDF.</p>
      <p>Oop die aangehegte PDF om jou kind se prestasie oor vakke, studietyd en areas wat aandag nodig het te sien.</p>
      ${partnerBlock}
      <p style="color:#666666;font-size:13px;">Aanmeld by BrainTrack om meer gedetailleerde insigte te sien en jou kind se studieplanne direk te monitor.</p>
      ${unsubBlock}
    `
    : `
      <p>Hi there,</p>
      <p>Your scheduled <strong style="color:#7c3aed;">BrainTrack progress report</strong> for <strong>${learnerName}</strong> is attached as a PDF.</p>
      <p>Open the attached PDF to see your child's performance across subjects, study activity, and areas that need attention.</p>
      ${partnerBlock}
      <p style="color:#666666;font-size:13px;">Log in to BrainTrack to see more detailed insights and monitor your child's study plans directly.</p>
      ${unsubBlock}
    `;

  const filename = `BrainTrack-Report-${learnerName.replace(/\s+/g, "-")}.pdf`;

  const result = await sendBrandedEmail({
    to,
    subject,
    heading,
    bodyHtml,
    ctaLabel: isAf ? "Bekyk Volledige Dashboard" : "View Full Dashboard",
    ctaUrl: "https://app.braintrack.co.za/dashboard",
    language: isAf ? "af" : "en",
    attachments: [
      {
        content: pdfBuffer,
        filename,
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  });

  if (result.delivery === "sent") {
    console.log(`[ScheduledReports] Report sent to ${to} for learner ${learnerName}`);
    return { ok: true };
  }
  if (result.delivery === "not_configured") {
    console.warn("[ScheduledReports] SendGrid not configured — report email not sent to", to);
    return { ok: false, error: "sendgrid_not_configured" };
  }
  const errMsg = result.error ?? "sendgrid_failed";
  console.error("[ScheduledReports] SendGrid error for", to, ":", errMsg);
  return { ok: false, error: errMsg };
}

/**
 * Send progress-report emails to all active parents.
 * This is the core function — it does NOT check the schedule; the caller
 * decides whether the time is right (or the admin triggers it manually).
 */
export async function sendScheduledReports(
  trigger: "scheduled" | "manual" = "scheduled",
): Promise<ScheduledReportRunResult> {
  const result: ScheduledReportRunResult = {
    totalParents: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  // Fetch partner branding for the email and PDF header
  let partnerBranding: { partnerName?: string | null; partnerLogoBase64?: string | null } = {};
  try {
    const [pbRow] = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, "partner_branding"));
    partnerBranding = (pbRow?.value as any) ?? {};
  } catch { /* non-fatal */ }

  const partnerName = (partnerBranding.partnerName ?? "").trim() || null;

  // Get all activated parent links with learner info and parent email
  let activatedLinks: Array<{
    parentUserId: string;
    learnerUserId: string | null;
    learnerName: string;
    parentEmail: string | null;
    optedOut: boolean;
  }> = [];

  try {
    const rows = await db
      .select({
        parentUserId: parentLinks.parentUserId,
        learnerUserId: parentLinks.learnerUserId,
        learnerName: parentLinks.learnerName,
        parentEmail: users.email,
        optedOut: parentLinks.reportEmailOptOut,
      })
      .from(parentLinks)
      .innerJoin(users, eq(parentLinks.parentUserId, users.id))
      .where(eq(parentLinks.status, "activated"));

    activatedLinks = rows as typeof activatedLinks;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`Failed to fetch parent links: ${msg}`);
    return result;
  }

  // De-duplicate: one email per (parentUserId, learnerUserId) pair
  const seen = new Set<string>();
  const uniqueLinks = activatedLinks.filter((link) => {
    if (!link.learnerUserId || !link.parentEmail) return false;
    const key = `${link.parentUserId}::${link.learnerUserId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  result.totalParents = uniqueLinks.length;
  console.log(`[ScheduledReports] Processing ${uniqueLinks.length} parent-learner pair(s) — trigger: ${trigger}`);

  for (const link of uniqueLinks) {
    const { parentUserId, learnerUserId, learnerName, parentEmail, optedOut } = link;
    if (!learnerUserId || !parentEmail) {
      result.skipped++;
      continue;
    }

    // Honour opt-out: log a skipped row with reason "opted_out" so admins
    // can see in the send log why a parent didn't receive a report.
    if (optedOut) {
      result.skipped++;
      try {
        await db.insert(reportEmailSendLog).values({
          parentUserId,
          learnerUserId,
          learnerName,
          sentToEmail: parentEmail,
          status: "skipped",
          errorMessage: "opted_out",
          trigger,
          sentAt: new Date(),
        });
      } catch (logErr: unknown) {
        console.error("[ScheduledReports] Failed to write opt-out skip log:", logErr);
      }
      continue;
    }

    let status: "sent" | "failed" | "skipped" = "skipped";
    let errorMessage: string | undefined;

    try {
      // Determine language from parent user preference
      let lang: "en" | "af" = "en";
      try {
        const [parentUser] = await db
          .select({ preferredLanguage: users.preferredLanguage })
          .from(users)
          .where(eq(users.id, parentUserId));
        if (parentUser?.preferredLanguage === "af") lang = "af";
      } catch { /* default to en */ }

      // Generate the PDF buffer
      const pdfBuffer = await generateReportPdfBuffer({
        learnerTargetId: learnerUserId,
        learnerName,
        lang,
        partnerBranding,
      });

      // Send the email
      const emailResult = await sendReportEmail({
        to: parentEmail,
        learnerName,
        partnerName,
        pdfBuffer,
        lang,
        unsubscribeUrl: buildUnsubscribeUrl(parentUserId, learnerUserId),
      });

      if (emailResult.ok) {
        status = "sent";
        result.sent++;
      } else {
        status = "failed";
        errorMessage = emailResult.error;
        result.failed++;
        result.errors.push(`${parentEmail}: ${emailResult.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      status = "failed";
      errorMessage = msg;
      result.failed++;
      result.errors.push(`${parentEmail}: ${msg}`);
      console.error("[ScheduledReports] Error for", parentEmail, ":", msg);
    }

    // Write to send log
    try {
      await db.insert(reportEmailSendLog).values({
        parentUserId,
        learnerUserId,
        learnerName,
        sentToEmail: parentEmail,
        status,
        errorMessage: errorMessage ?? null,
        trigger,
        sentAt: new Date(),
      });
    } catch (logErr: unknown) {
      console.error("[ScheduledReports] Failed to write send log:", logErr);
    }
  }

  console.log(
    `[ScheduledReports] Run complete — sent: ${result.sent}, failed: ${result.failed}, skipped: ${result.skipped}`,
  );
  return result;
}

/**
 * Checks if reports should be sent now and, if so, sends them.
 * Called by the nightly shell script.
 */
export async function runIfScheduled(): Promise<void> {
  const config = await getReportScheduleConfig();
  if (!shouldSendNow(config)) {
    console.log("[ScheduledReports] Not a send window — skipping.");
    return;
  }
  console.log("[ScheduledReports] Send window matched — running scheduled send.");
  const result = await sendScheduledReports("scheduled");
  console.log("[ScheduledReports] Result:", JSON.stringify(result));
}
