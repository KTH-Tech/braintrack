/**
 * server/email.ts — Central BrainTrack branded email helper
 *
 * All transactional emails in the learner signup flow flow through here.
 * Uses SendGrid (@sendgrid/mail) via the SENDGRID_API_KEY secret.
 * Falls back gracefully to { delivery: "not_configured" } if the key is absent —
 * callers never need try/catch.
 */

import { getSendGridClient, getEmailSenderConfig } from "./sendgrid-client.js";
import { getUncachableResendClient } from "./resend-client.js";
import { BRAND_LOGO_DATA_URI } from "./brand-assets.js";

// ─── Resend transport (Task #666) ────────────────────────────────────────────
// Resend is the preferred transport when configured (RESEND_API_KEY or the
// Replit Resend connector). Falls through to SendGrid otherwise.
async function sendViaResend(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: BrandedEmailAttachment[];
}): Promise<BrandedEmailResult | null> {
  let client;
  try {
    ({ client } = await getUncachableResendClient());
  } catch {
    return null; // Resend not configured — let caller fall back.
  }

  const cfg = await getEmailSenderConfig();
  const fromEmail = cfg?.fromEmail ?? "learn@kth-tech.com";
  const fromName = cfg?.fromName ?? "BrainTrack";
  const from = `${fromName} <${fromEmail}>`;

  try {
    const payload: Parameters<typeof client.emails.send>[0] = {
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    };
    if (cfg?.replyTo) (payload as any).replyTo = cfg.replyTo;
    if (opts.attachments && opts.attachments.length > 0) {
      (payload as any).attachments = opts.attachments.map(a => ({
        filename: a.filename,
        content: a.content,
        contentType: a.type,
      }));
    }
    const { error } = await client.emails.send(payload);
    if (error) {
      const message = typeof error === "string" ? error : (error as any)?.message ?? JSON.stringify(error);
      console.error("[BrainTrackEmail] Resend error:", message);
      return { delivery: "failed", error: message };
    }
    console.log(`[BrainTrackEmail] resend sent to ${opts.to} — "${opts.subject}"`);
    return { delivery: "sent" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[BrainTrackEmail] Resend exception:", message);
    return { delivery: "failed", error: message };
  }
}

/** Escape the handful of HTML special characters that matter in email content. */
function he(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ─── HTML template ─────────────────────────────────────────────────────────

function buildHtmlWrapper(opts: {
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  language: "en" | "af";
}): string {
  const { heading, bodyHtml, ctaLabel, ctaUrl, language } = opts;

  const footerLine1 = language === "af"
    ? "Jy ontvang hierdie e-pos omdat jy by BrainTrack aangemeld het."
    : "You're receiving this email because you signed up with BrainTrack.";
  const footerLine2 = language === "af"
    ? "As jy dit nie herken nie, ignoreer hierdie boodskap gerus."
    : "If you didn't recognise this action, you can safely ignore this email.";

  const pillar1 = language === "af" ? "&#127759; Akademiese integriteit is ons fondament" : "&#127759; Academic integrity is our foundation";
  const pillar2 = language === "af" ? "&#128274; Jou data. Jou privaatheid." : "&#128274; Your data. Your privacy.";
  const pillar3 = language === "af" ? "&#10084;&#65039; Meer as punte. Ons bou toekoms." : "&#10084;&#65039; More than grades. We build futures.";

  const RAINBOW = "linear-gradient(90deg,#006BFF 0%,#00E5FF 17%,#22FF66 34%,#FFE600 50%,#FF8A00 67%,#FF2BD6 83%,#8A2BFF 100%)";

  const ctaBlock = ctaLabel && ctaUrl
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:32px 0;">
        <tr>
          <td align="center">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
              href="${ctaUrl}" style="height:44px;v-text-anchor:middle;width:210px;" arcsize="27%"
              stroke="t" strokecolor="#00E5FF" fillcolor="#006BFF">
              <w:anchorlock/>
              <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
                ${ctaLabel}
              </center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-->
            <a href="${ctaUrl}"
               target="_blank"
               style="display:inline-block;background:#006BFF;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:12px;border:2px solid #00E5FF;letter-spacing:0.3px;mso-hide:all;">
              ${ctaLabel}
            </a>
            <!--<![endif]-->
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="${language === "af" ? "af" : "en"}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:Arial,Helvetica,sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background-color:#000000;padding:28px 0 48px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;
                      background-color:#0a0b12;box-shadow:0 0 40px rgba(0,229,255,0.25);">

          <!-- Rainbow top bar -->
          <tr>
            <td style="height:7px;background:${RAINBOW};font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header / logo area -->
          <tr>
            <td align="center" style="padding:28px 40px 20px;background:#000000;">
              <!-- Branded BrainTrack logo (inlined base64 so it renders in every mail client) -->
              <img src="${BRAND_LOGO_DATA_URI}" width="260" alt="BrainTrack" style="display:block;border:0;outline:none;text-decoration:none;width:260px;max-width:80%;height:auto;margin:0 auto;" />
              <!-- Tagline -->
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;
                          color:#ffffff;margin-top:12px;letter-spacing:0.3px;">
                Powered by <strong style="color:#00E5FF;">KTH Tech</strong>
              </div>
            </td>
          </tr>

          <!-- Rainbow divider -->
          <tr>
            <td style="padding:0 40px 4px;">
              <div style="height:3px;background:${RAINBOW};border-radius:3px;"></div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 40px 12px;background:#0a0b12;">

              <!-- Heading -->
              <h1 style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:22px;
                         font-weight:800;color:#ffffff;line-height:1.35;">
                ${heading}
              </h1>

              <!-- Body copy -->
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;
                          color:#ffffff;">
                ${bodyHtml}
              </div>

              ${ctaBlock}

            </td>
          </tr>

          <!-- Three-pillar strip -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,0.4),transparent);"></div>
            </td>
          </tr>
          <tr>
            <td style="background:#0a0b12;padding:16px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center" style="padding:4px 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#ffffff;width:33%;">${pillar1}</td>
                  <td align="center" style="padding:4px 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#ffffff;width:33%;border-left:1px solid rgba(0,229,255,0.3);border-right:1px solid rgba(0,229,255,0.3);">${pillar2}</td>
                  <td align="center" style="padding:4px 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#ffffff;width:33%;">${pillar3}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 28px;background:#0a0b12;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,0.4),transparent);margin-bottom:18px;"></div>
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;
                        color:#ffffff;text-align:center;">
                ${footerLine1}
              </p>
              <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;
                        color:#ffffff;text-align:center;">
                ${footerLine2}
              </p>
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;
                        font-weight:600;color:#ffffff;text-align:center;letter-spacing:0.4px;">
                <a href="https://braintrack.co.za" style="color:#00E5FF;text-decoration:none;">braintrack.co.za</a>
                &nbsp;·&nbsp;
                <a href="mailto:learn@kth-tech.com" style="color:#00E5FF;text-decoration:none;">learn@kth-tech.com</a>
              </p>
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;
                        color:#ffffff;text-align:center;letter-spacing:0.2px;">
                <a href="https://braintrack.co.za" style="color:#00E5FF;text-decoration:none;">Website</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="https://app.braintrack.co.za/dashboard" style="color:#00E5FF;text-decoration:none;">Dashboard</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="https://app.braintrack.co.za/subscribe" style="color:#00E5FF;text-decoration:none;">Subscribe</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="mailto:learn@kth-tech.com" style="color:#00E5FF;text-decoration:none;">Contact Us</a>
              </p>
              <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;
                        color:#ffffff;text-align:center;letter-spacing:0.3px;">
                <a href="https://www.facebook.com/braintrackapp" style="color:#2980b9;text-decoration:none;">Facebook</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="https://www.instagram.com/braintrackapp" style="color:#e91e63;text-decoration:none;">Instagram</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="https://twitter.com/braintrackapp" style="color:#1da1f2;text-decoration:none;">X / Twitter</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="https://www.youtube.com/@braintrackapp" style="color:#e53935;text-decoration:none;">YouTube</a>
              </p>
              <!-- KTH Tech sign-off -->
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;
                        color:#ffffff;text-align:center;letter-spacing:0.5px;">
                &copy; ${new Date().getFullYear()} BrainTrack &middot; Powered by <strong style="color:#00E5FF;">KTH Tech</strong>
              </p>
            </td>
          </tr>

          <!-- Rainbow bottom bar -->
          <tr>
            <td style="height:7px;background:${RAINBOW};font-size:0;line-height:0;">&nbsp;</td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->

</body>
</html>`;
}

// ─── Internal payload type ────────────────────────────────────────────────────

/** All fields needed to render the branded HTML — no recipient address. */
type TemplatePayload = {
  subject: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  language: "en" | "af";
};

// ─── Shared template builders (single source of truth) ───────────────────────

function buildWelcomePayload(opts: {
  firstName: string;
  trialEndsAt: Date;
  language: "en" | "af";
  dashboardUrl: string;
}): TemplatePayload {
  const { firstName, trialEndsAt, language, dashboardUrl } = opts;
  const name = he(firstName || (language === "af" ? "Leerder" : "Learner"));
  const trialDateStr = trialEndsAt.toLocaleDateString(language === "af" ? "af-ZA" : "en-ZA", {
    day: "numeric", month: "long", year: "numeric",
  });
  if (language === "af") {
    return {
      language,
      subject: `Welkom by BrainTrack, ${name}! Jou 14-dae proeftydperk het begin.`,
      heading: `Welkom aan boord, ${name}! 🎉`,
      bodyHtml: `
        <p>Jou BrainTrack <strong style="color:#006BFF;">Brain Boost</strong>-proeftydperk is nou aktief.</p>
        <p>Jy het <strong style="color:#00E5FF;">14 dae gratis toegang</strong> tot al jou vakke, slimme tuteur, vorige vraestelle en meer — heeltemal sonder koste totdat jou proeftydperk op <strong>${trialDateStr}</strong> verloop.</p>
        <p>Begin studeer en kry 'n voorsprong op jou NSC-eksamen:</p>
      `,
      ctaLabel: "Gaan na my dashboard",
      ctaUrl: dashboardUrl,
    };
  }
  return {
    language,
    subject: `Welcome to BrainTrack, ${name}! Your 14-day trial has started.`,
    heading: `Welcome aboard, ${name}! 🎉`,
    bodyHtml: `
      <p>Your BrainTrack <strong style="color:#006BFF;">Brain Boost</strong> trial is now active.</p>
      <p>You have <strong style="color:#00E5FF;">14 days of free access</strong> to all your subjects, Smart Tutor, past papers and more — completely free until your trial ends on <strong>${trialDateStr}</strong>.</p>
      <p>Start studying and get ahead on your NSC exams:</p>
    `,
    ctaLabel: "Go to my Dashboard",
    ctaUrl: dashboardUrl,
  };
}

function buildConsentRequestPayload(opts: {
  learnerName: string;
  consentUrl: string;
  language: "en" | "af";
}): TemplatePayload {
  const { language, consentUrl } = opts;
  const learnerName = he(opts.learnerName);
  if (language === "af") {
    return {
      language,
      subject: `BrainTrack: ${learnerName} het jou toestemming nodig`,
      heading: `${learnerName} het jou toestemming nodig`,
      ctaLabel: "Bevestig toestemming",
      ctaUrl: consentUrl,
      bodyHtml: `
        <p>Hallo,</p>
        <p><strong style="color:#006BFF;">${learnerName}</strong> het by BrainTrack aangemeld — 'n leerstudieplatform vir Graad 12 NSC-eksamen — en het jou toestemming as ouer/voog nodig om volle toegang te aktiveer.</p>
        <p>Klik die knoppie hieronder om toestemming te bevestig:</p>
        <p style="font-size:13px;color:#ffffff;word-break:break-all;">
          Of plak hierdie skakel in jou blaaier:<br/>
          <a href="${consentUrl}" style="color:#00E5FF;">${consentUrl}</a>
        </p>
        <p style="font-size:13px;color:#ffffff;">Hierdie skakel verval oor <strong>7 dae</strong>.</p>
      `,
    };
  }
  return {
    language,
    subject: `BrainTrack: ${learnerName} needs your consent`,
    heading: `${learnerName} needs your consent`,
    bodyHtml: `
      <p>Hi there,</p>
      <p><strong style="color:#006BFF;">${learnerName}</strong> has signed up for BrainTrack — a Grade 12 NSC exam preparation platform — and needs your consent as their parent/guardian to activate full access.</p>
      <p>Click the button below to confirm your consent:</p>
      <p style="font-size:13px;color:#ffffff;word-break:break-all;">
        Or paste this link into your browser:<br/>
        <a href="${consentUrl}" style="color:#00E5FF;">${consentUrl}</a>
      </p>
      <p style="font-size:13px;color:#ffffff;">This link expires in <strong>7 days</strong>.</p>
    `,
    ctaLabel: "Confirm Consent",
    ctaUrl: consentUrl,
  };
}

function buildConsentConfirmedPayload(opts: {
  learnerName: string;
  language: "en" | "af";
  dashboardUrl: string;
}): TemplatePayload {
  const { language, dashboardUrl } = opts;
  const name = he(opts.learnerName || (language === "af" ? "Leerder" : "Learner"));
  if (language === "af") {
    return {
      language,
      subject: "Goeie nuus! Jou ouer het toestemming gegee 🎉",
      heading: `Jou ouer het bevestig, ${name}!`,
      bodyHtml: `
        <p>Baie goed — jou ouer/voog het jou BrainTrack-toestemming bevestig.</p>
        <p>Jou rekening is nou <strong style="color:#22FF66;">volledig geaktiveer</strong>. Jy het volle toegang tot al jou vakke, slimme tuteur, vorige vraestelle en meer.</p>
        <p>Gaan aan en begin studeer:</p>
      `,
      ctaLabel: "Gaan na my dashboard",
      ctaUrl: dashboardUrl,
    };
  }
  return {
    language,
    subject: "Great news! Your parent has given consent 🎉",
    heading: `Your parent has confirmed, ${name}!`,
    bodyHtml: `
      <p>Great news — your parent/guardian has confirmed your BrainTrack consent.</p>
      <p>Your account is now <strong style="color:#22FF66;">fully activated</strong>. You have full access to all your subjects, Smart Tutor, past papers and more.</p>
      <p>Head over and keep studying:</p>
    `,
    ctaLabel: "Go to my Dashboard",
    ctaUrl: dashboardUrl,
  };
}

function buildTrialExpiryPayload(opts: {
  firstName: string;
  trialEndsAt: Date;
  day: 13 | 14;
  language: "en" | "af";
  subscribeUrl: string;
}): TemplatePayload {
  const { trialEndsAt, day, language, subscribeUrl } = opts;
  const name = he(opts.firstName || (language === "af" ? "Leerder" : "Learner"));
  const trialDateStr = trialEndsAt.toLocaleDateString(language === "af" ? "af-ZA" : "en-ZA", {
    day: "numeric", month: "long", year: "numeric",
  });
  if (day === 13) {
    if (language === "af") {
      return {
        language,
        subject: `${name}, jou proeftydperk eindig môre — bly op koers!`,
        heading: "Jou proeftydperk eindig binnekort",
        bodyHtml: `
          <p>Hallo ${name},</p>
          <p>Jou BrainTrack Brain Boost-proeftydperk eindig op <strong>${trialDateStr}</strong>.</p>
          <p>Jy het 'n wonderlike begin gemaak! Om voort te gaan met jou slimme tuteur, vorige vraestelle en vorderingsopsporing, skakel oor na 'n betaalde plan voor jou proeftydperk verloop.</p>
          <p>Bly gemotiveerd — jy is op die regte pad vir jou NSC-eksamen 💪</p>
        `,
        ctaLabel: "Skakel oor na Brain Boost",
        ctaUrl: subscribeUrl,
      };
    }
    return {
      language,
      subject: `${name}, your trial ends tomorrow — keep the momentum going!`,
      heading: "Your trial is ending soon",
      bodyHtml: `
        <p>Hi ${name},</p>
        <p>Your BrainTrack Brain Boost trial ends on <strong>${trialDateStr}</strong>.</p>
        <p>You've made a great start! To keep access to your Smart Tutor, past papers and progress tracking, switch to a paid plan before your trial runs out.</p>
        <p>Stay motivated — you're on the right track for your NSC exams 💪</p>
      `,
      ctaLabel: "Switch to Brain Boost",
      ctaUrl: subscribeUrl,
    };
  }
  // Day 14 — urgent
  if (language === "af") {
    return {
      language,
      subject: `⚠️ Laaste dag! Jou BrainTrack-proeftydperk verloop vandag`,
      heading: "Jou proeftydperk verloop vandag",
      bodyHtml: `
        <p>Hallo ${name},</p>
        <p>Dit is jou laaste dag. Jou Brain Boost-proeftydperk verloop <strong>vandag</strong> op <strong>${trialDateStr}</strong>.</p>
        <p>Nadat dit verloop, sal jy toegang tot jou slimme tuteur, vorige vraestelle en vorderingsopsporing verloor.</p>
        <p><strong style="color:#FF8A00;">Inskryf nou om ononderbroke toegang te behou en jou NSC-voorbereiding te voltooi.</strong></p>
      `,
      ctaLabel: "Inskryf nou — R169/maand",
      ctaUrl: subscribeUrl,
    };
  }
  return {
    language,
    subject: `⚠️ Last day! Your BrainTrack trial expires today`,
    heading: "Your trial expires today",
    bodyHtml: `
      <p>Hi ${name},</p>
      <p>This is your last day. Your Brain Boost trial expires <strong>today</strong> on <strong>${trialDateStr}</strong>.</p>
      <p>After it expires, you'll lose access to your Smart Tutor, past papers and progress tracking.</p>
      <p><strong style="color:#FF8A00;">Subscribe now to keep uninterrupted access and complete your NSC preparation.</strong></p>
    `,
    ctaLabel: "Subscribe Now — R169/month",
    ctaUrl: subscribeUrl,
  };
}

// ─── Preview helper ───────────────────────────────────────────────────────────

export type EmailPreviewType =
  | "welcome"
  | "consent-request"
  | "consent-confirmed"
  | "day-13"
  | "day-14"
  | "subscription-confirmed"
  | "payment-failed"
  | "subscription-cancelled"
  | "streak-milestone"
  | "weekly-progress"
  | "exam-countdown"
  | "inactivity-nudge";

const SAMPLE_BASE_URL = "https://braintrack.co.za";

export function getEmailPreview(
  type: EmailPreviewType,
  language: "en" | "af",
): { subject: string; html: string } {
  const sampleTrialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const sampleName = language === "af" ? "Leerder" : "Learner";
  let payload: TemplatePayload;

  switch (type) {
    case "welcome":
      payload = buildWelcomePayload({
        firstName: sampleName,
        trialEndsAt: sampleTrialEnd,
        language,
        dashboardUrl: `${SAMPLE_BASE_URL}/dashboard`,
      });
      break;
    case "consent-request":
      payload = buildConsentRequestPayload({
        learnerName: sampleName,
        consentUrl: `${SAMPLE_BASE_URL}/consent?token=SAMPLE_TOKEN`,
        language,
      });
      break;
    case "consent-confirmed":
      payload = buildConsentConfirmedPayload({
        learnerName: sampleName,
        language,
        dashboardUrl: `${SAMPLE_BASE_URL}/dashboard`,
      });
      break;
    case "day-13":
      payload = buildTrialExpiryPayload({
        firstName: sampleName,
        trialEndsAt: sampleTrialEnd,
        day: 13,
        language,
        subscribeUrl: `${SAMPLE_BASE_URL}/subscribe`,
      });
      break;
    case "day-14":
      payload = buildTrialExpiryPayload({
        firstName: sampleName,
        trialEndsAt: sampleTrialEnd,
        day: 14,
        language,
        subscribeUrl: `${SAMPLE_BASE_URL}/subscribe`,
      });
      break;
    case "subscription-confirmed":
      payload = buildSubscriptionConfirmedPayload({
        firstName: sampleName,
        language,
        dashboardUrl: `${SAMPLE_BASE_URL}/dashboard`,
        isRenewal: false,
      });
      break;
    case "payment-failed":
      payload = buildPaymentFailedPayload({
        firstName: sampleName,
        language,
        retryUrl: `${SAMPLE_BASE_URL}/learn/billing`,
        graceEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      });
      break;
    case "subscription-cancelled":
      payload = buildSubscriptionCancelledPayload({
        firstName: sampleName,
        language,
        accessUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        reactivateUrl: `${SAMPLE_BASE_URL}/subscribe`,
      });
      break;
    case "streak-milestone":
      payload = buildStreakMilestonePayload({
        firstName: sampleName,
        language,
        streakDays: 30,
        dashboardUrl: `${SAMPLE_BASE_URL}/dashboard`,
      });
      break;
    case "weekly-progress":
      payload = buildWeeklyProgressPayload({
        firstName: sampleName,
        language,
        questionsAnswered: 87,
        topicsCovered: 6,
        studyMinutes: 245,
        topSubject: language === "af" ? "Wiskunde" : "Mathematics",
        dashboardUrl: `${SAMPLE_BASE_URL}/progress`,
      });
      break;
    case "exam-countdown":
      payload = buildExamCountdownPayload({
        firstName: sampleName,
        language,
        daysToExam: 21,
        nextSubject: language === "af" ? "Fisiese Wetenskappe" : "Physical Sciences",
        examReadyUrl: `${SAMPLE_BASE_URL}/exam-ready`,
      });
      break;
    case "inactivity-nudge":
      payload = buildInactivityNudgePayload({
        firstName: sampleName,
        language,
        daysAway: 7,
        dashboardUrl: `${SAMPLE_BASE_URL}/dashboard`,
      });
      break;
  }

  return { subject: payload.subject, html: buildHtmlWrapper(payload) };
}

// ─── New template builders (Task #818) ───────────────────────────────────────

function buildPaymentFailedPayload(opts: {
  firstName: string;
  language: "en" | "af";
  retryUrl: string;
  graceEndsAt: Date;
}): TemplatePayload {
  const { language, retryUrl, graceEndsAt } = opts;
  const name = he(opts.firstName || (language === "af" ? "Leerder" : "Learner"));
  const dateStr = graceEndsAt.toLocaleDateString(language === "af" ? "af-ZA" : "en-ZA", { day: "numeric", month: "long", year: "numeric" });
  if (language === "af") {
    return {
      language,
      subject: `Aksie benodig: BrainTrack-betaling het misluk`,
      heading: "Ons kon nie jou betaling verwerk nie",
      bodyHtml: `
        <p>Hallo ${name},</p>
        <p>Ons het probeer om jou maandelikse <strong style="color:#006BFF;">Brain Boost</strong>-intekening te hernieu, maar die betaling het misluk.</p>
        <p>Jou toegang bly aktief tot <strong>${dateStr}</strong>. Werk asseblief jou betaalmetode by voor daardie datum om onderbreking te vermy.</p>
      `,
      ctaLabel: "Werk betaalmetode by",
      ctaUrl: retryUrl,
    };
  }
  return {
    language,
    subject: `Action needed: BrainTrack payment failed`,
    heading: "We couldn't process your payment",
    bodyHtml: `
      <p>Hi ${name},</p>
      <p>We tried to renew your monthly <strong style="color:#006BFF;">Brain Boost</strong> subscription but the payment failed.</p>
      <p>Your access stays active until <strong>${dateStr}</strong>. Please update your payment method before then to avoid interruption.</p>
    `,
    ctaLabel: "Update payment method",
    ctaUrl: retryUrl,
  };
}

function buildSubscriptionCancelledPayload(opts: {
  firstName: string;
  language: "en" | "af";
  accessUntil: Date;
  reactivateUrl: string;
}): TemplatePayload {
  const { language, accessUntil, reactivateUrl } = opts;
  const name = he(opts.firstName || (language === "af" ? "Leerder" : "Learner"));
  const dateStr = accessUntil.toLocaleDateString(language === "af" ? "af-ZA" : "en-ZA", { day: "numeric", month: "long", year: "numeric" });
  if (language === "af") {
    return {
      language,
      subject: `Jou BrainTrack-intekening is gekanselleer`,
      heading: "Jou intekening is gekanselleer",
      bodyHtml: `
        <p>Hallo ${name},</p>
        <p>Ons het jou kansellasie-versoek ontvang. Jou <strong style="color:#006BFF;">Brain Boost</strong>-toegang bly aktief tot <strong>${dateStr}</strong>.</p>
        <p>Geen verdere bedrae sal van jou rekening getrek word nie. Ons hoop om jou weer te sien — jy kan enige tyd weer aansluit.</p>
      `,
      ctaLabel: "Heraktiveer intekening",
      ctaUrl: reactivateUrl,
    };
  }
  return {
    language,
    subject: `Your BrainTrack subscription has been cancelled`,
    heading: "Your subscription is cancelled",
    bodyHtml: `
      <p>Hi ${name},</p>
      <p>We've received your cancellation request. Your <strong style="color:#006BFF;">Brain Boost</strong> access remains active until <strong>${dateStr}</strong>.</p>
      <p>No further amounts will be charged. We hope to see you again — you can reactivate any time.</p>
    `,
    ctaLabel: "Reactivate subscription",
    ctaUrl: reactivateUrl,
  };
}

function buildStreakMilestonePayload(opts: {
  firstName: string;
  language: "en" | "af";
  streakDays: number;
  dashboardUrl: string;
}): TemplatePayload {
  const { language, streakDays, dashboardUrl } = opts;
  const name = he(opts.firstName || (language === "af" ? "Leerder" : "Learner"));
  if (language === "af") {
    return {
      language,
      subject: `🔥 ${streakDays}-dae streep — wel gedaan, ${name}!`,
      heading: `${streakDays}-dae studie-streep ontsluit!`,
      bodyHtml: `
        <p>Hallo ${name},</p>
        <p>Jy het pas <strong style="color:#FF8A00;">${streakDays} dae</strong> aaneenlopende studie behaal. Dis presies hoe top-presteerders dit doen.</p>
        <p>Jou volgehoue inspanning vertaal direk na beter eksamenuitslae. Hou aan — die NSC wag op jou.</p>
      `,
      ctaLabel: "Hou die streep aan die gang",
      ctaUrl: dashboardUrl,
    };
  }
  return {
    language,
    subject: `🔥 ${streakDays}-day streak — way to go, ${name}!`,
    heading: `${streakDays}-day study streak unlocked!`,
    bodyHtml: `
      <p>Hi ${name},</p>
      <p>You've just hit <strong style="color:#FF8A00;">${streakDays} days</strong> of consecutive study. That's exactly how top performers do it.</p>
      <p>Your consistent effort translates directly to better exam results. Keep it up — the NSC is waiting for you.</p>
    `,
    ctaLabel: "Keep the streak going",
    ctaUrl: dashboardUrl,
  };
}

function buildWeeklyProgressPayload(opts: {
  firstName: string;
  language: "en" | "af";
  questionsAnswered: number;
  topicsCovered: number;
  studyMinutes: number;
  topSubject: string;
  dashboardUrl: string;
}): TemplatePayload {
  const { language, questionsAnswered, topicsCovered, studyMinutes, topSubject, dashboardUrl } = opts;
  const name = he(opts.firstName || (language === "af" ? "Leerder" : "Learner"));
  const subjectEsc = he(topSubject);
  const hours = Math.floor(studyMinutes / 60);
  const mins = studyMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const isAf = language === "af";
  const t = isAf
    ? {
        subject: `Jou BrainTrack-weeklikse opsomming`,
        heading: `Jou week in 'n oogopslag, ${name}`,
        intro: `Hallo ${name}, hier's jou afgelope 7 dae op BrainTrack — in syfers:`,
        heroLabel: "vrae di&eacute; week beantwoord",
        topicsLabel: "onderwerpe behandel",
        timeLabel: "studietyd",
        subjectLabel: "top vak",
        focusHeading: "Volgende fokus",
        focus1: `Hou die momentum in <strong style="color:#FF8A00;">${subjectEsc}</strong> aan die gang met 'n vinnige vasvra.`,
        focus2: `Bekyk jou volgende fokusareas en die volle uiteensetting op jou vorderingsblad.`,
        cta: "Sien volle vordering",
      }
    : {
        subject: `Your BrainTrack weekly recap`,
        heading: `Your week at a glance, ${name}`,
        intro: `Hi ${name}, here's your last 7 days on BrainTrack — by the numbers:`,
        heroLabel: "questions answered this week",
        topicsLabel: "topics covered",
        timeLabel: "study time",
        subjectLabel: "top subject",
        focusHeading: "Next up",
        focus1: `Keep the momentum going in <strong style="color:#FF8A00;">${subjectEsc}</strong> with a quick quiz.`,
        focus2: `Check your next focus areas and the full breakdown on your progress page.`,
        cta: "See full progress",
      };

  const bodyHtml = `
      <p style="margin:0 0 20px;">${t.intro}</p>

      <!-- Headline stat -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 18px;">
        <tr>
          <td align="center" style="background:#050608;border:1.5px solid rgba(0,229,255,0.4);border-radius:14px;padding:24px 16px 20px;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:48px;line-height:1;font-weight:800;color:#00E5FF;">${questionsAnswered}</div>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#ffffff;margin-top:8px;letter-spacing:1.5px;text-transform:uppercase;">${t.heroLabel}</div>
          </td>
        </tr>
      </table>

      <!-- This-week metrics: 3-column neon number row -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
        <tr>
          <td align="center" width="33%" valign="top" style="padding:10px 4px;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:800;color:#22FF66;line-height:1.15;">${topicsCovered}</div>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#ffffff;margin-top:5px;">${t.topicsLabel}</div>
          </td>
          <td align="center" width="34%" valign="top" style="padding:10px 4px;border-left:1px solid rgba(0,229,255,0.3);border-right:1px solid rgba(0,229,255,0.3);">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:800;color:#FFE600;line-height:1.15;">${timeStr}</div>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#ffffff;margin-top:5px;">${t.timeLabel}</div>
          </td>
          <td align="center" width="33%" valign="top" style="padding:10px 4px;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:800;color:#FF2BD6;line-height:1.3;">${subjectEsc}</div>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#ffffff;margin-top:6px;">${t.subjectLabel}</div>
          </td>
        </tr>
      </table>

      <!-- Focus list: neon left-border lines -->
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;color:#ffffff;letter-spacing:1.2px;text-transform:uppercase;margin:0 0 12px;">${t.focusHeading}</div>
      <div style="border-left:3px solid #FF8A00;padding-left:14px;margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#ffffff;">${t.focus1}</div>
      <div style="border-left:3px solid #8A2BFF;padding-left:14px;margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#ffffff;">${t.focus2}</div>

      <!-- Compact CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 8px;">
        <tr>
          <td align="center">
            <a href="${dashboardUrl}" target="_blank"
               style="display:inline-block;background:#006BFF;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:12px;border:2px solid #00E5FF;">
              ${t.cta}
            </a>
          </td>
        </tr>
      </table>
  `;

  return {
    language,
    subject: t.subject,
    heading: t.heading,
    bodyHtml,
  };
}

function buildExamCountdownPayload(opts: {
  firstName: string;
  language: "en" | "af";
  daysToExam: number;
  nextSubject: string;
  examReadyUrl: string;
}): TemplatePayload {
  const { language, daysToExam, nextSubject, examReadyUrl } = opts;
  const name = he(opts.firstName || (language === "af" ? "Leerder" : "Learner"));
  const subjectEsc = he(nextSubject);
  if (language === "af") {
    return {
      language,
      subject: `${daysToExam} dae tot jou NSC-eksamen — fokustyd!`,
      heading: `Nog ${daysToExam} dae, ${name}`,
      bodyHtml: `
        <p>Hallo ${name},</p>
        <p>Jou NSC-eksamen is <strong style="color:#FF2BD6;">${daysToExam} dae</strong> weg. Elke studiesessie van nou af tel.</p>
        <p>Jou volgende vak op die rooster is <strong style="color:#00E5FF;">${subjectEsc}</strong>. Doen 'n vinnige mini-mok om gereedheid te toets.</p>
      `,
      ctaLabel: "Begin Eksamen-Gereed",
      ctaUrl: examReadyUrl,
    };
  }
  return {
    language,
    subject: `${daysToExam} days to your NSC exam — focus time!`,
    heading: `${daysToExam} days to go, ${name}`,
    bodyHtml: `
      <p>Hi ${name},</p>
      <p>Your NSC exam is just <strong style="color:#FF2BD6;">${daysToExam} days</strong> away. Every study session from here on counts.</p>
      <p>Your next subject on the schedule is <strong style="color:#00E5FF;">${subjectEsc}</strong>. Run a quick mini-mock to test your readiness.</p>
    `,
    ctaLabel: "Open Exam Ready",
    ctaUrl: examReadyUrl,
  };
}

function buildInactivityNudgePayload(opts: {
  firstName: string;
  language: "en" | "af";
  daysAway: number;
  dashboardUrl: string;
}): TemplatePayload {
  const { language, daysAway, dashboardUrl } = opts;
  const name = he(opts.firstName || (language === "af" ? "Leerder" : "Learner"));
  if (language === "af") {
    return {
      language,
      subject: `Ons mis jou, ${name} 👋`,
      heading: `Welkom terug wanneer jy gereed is`,
      bodyHtml: `
        <p>Hallo ${name},</p>
        <p>Ons het jou laas <strong>${daysAway} dae</strong> gelede gesien. Geen druk nie — die lewe gebeur.</p>
        <p>Wanneer jy gereed is, wag jou daaglikse uitdaging en die slim tuteur vir jou. Net <strong style="color:#006BFF;">10 minute</strong> per dag is genoeg om weer in die patroon te kom.</p>
      `,
      ctaLabel: "Spring weer in",
      ctaUrl: dashboardUrl,
    };
  }
  return {
    language,
    subject: `We miss you, ${name} 👋`,
    heading: `Welcome back whenever you're ready`,
    bodyHtml: `
      <p>Hi ${name},</p>
      <p>We last saw you <strong>${daysAway} days</strong> ago. No pressure — life happens.</p>
      <p>Whenever you're ready, your daily challenge and the Smart Tutor are waiting. Just <strong style="color:#006BFF;">10 minutes</strong> a day is enough to get back into rhythm.</p>
    `,
    ctaLabel: "Jump back in",
    ctaUrl: dashboardUrl,
  };
}

// ─── Public types ───────────────────────────────────────────────────────────

export interface BrandedEmailAttachment {
  /** Raw file contents. Will be base64-encoded for SendGrid. */
  content: Buffer;
  /** Filename shown to the recipient. */
  filename: string;
  /** MIME type, e.g. "application/pdf". */
  type: string;
  /** "attachment" (default) or "inline". */
  disposition?: "attachment" | "inline";
}

export interface BrandedEmailOpts {
  to: string;
  subject: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  language?: "en" | "af";
  /** Optional plain-text fallback. Auto-generated from heading + bodyHtml if omitted. */
  textBody?: string;
  /** Optional file attachments (e.g. PDF reports). */
  attachments?: BrandedEmailAttachment[];
}

export interface BrandedEmailResult {
  delivery: "sent" | "not_configured" | "failed";
  error?: string;
}

// ─── Raw HTML send (used by admin test-send) ────────────────────────────────

export async function sendRawHtmlEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<BrandedEmailResult> {
  const { to, subject, html } = opts;
  const plainText = html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
  const [sg, cfg] = await Promise.all([getSendGridClient(), getEmailSenderConfig()]);
  if (!sg || !cfg) {
    console.warn(`[BrainTrackEmail] SendGrid not configured — raw email NOT sent to ${to}`);
    return { delivery: "not_configured" };
  }
  try {
    const from = `${cfg.fromName} <${cfg.fromEmail}>`;
    const msg: any = { from, to, subject, html, text: plainText };
    if (cfg.replyTo) msg.replyTo = cfg.replyTo;
    await sg.send(msg);
    console.log(`[BrainTrackEmail] raw sent to ${to} — "${subject}"`);
    return { delivery: "sent" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[BrainTrackEmail] SendGrid raw error:", message);
    return { delivery: "failed", error: message };
  }
}

// ─── Core send function ──────────────────────────────────────────────────────

export async function sendBrandedEmail(opts: BrandedEmailOpts): Promise<BrandedEmailResult> {
  const {
    to,
    subject,
    heading,
    bodyHtml,
    ctaLabel,
    ctaUrl,
    language = "en",
    textBody,
    attachments,
  } = opts;

  const html = buildHtmlWrapper({ heading, bodyHtml, ctaLabel, ctaUrl, language });

  const plainText = textBody
    ?? `${heading}\n\n${bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim()}${ctaLabel && ctaUrl ? `\n\n${ctaLabel}: ${ctaUrl}` : ""}\n\n— BrainTrack\nhttps://braintrack.co.za`;

  // Task #666 — prefer Resend when configured, fall back to SendGrid otherwise.
  const resendResult = await sendViaResend({ to, subject, html, text: plainText, attachments });
  if (resendResult && resendResult.delivery === "sent") {
    return resendResult;
  }

  const [sg, cfg] = await Promise.all([getSendGridClient(), getEmailSenderConfig()]);
  if (!sg || !cfg) {
    if (resendResult && resendResult.delivery === "failed") {
      return resendResult;
    }
    console.warn(`[BrainTrackEmail] no email transport configured — email NOT sent to ${to}. Subject: "${subject}"`);
    return { delivery: "not_configured" };
  }
  try {
    const from = `${cfg.fromName} <${cfg.fromEmail}>`;
    const msg: any = { from, to, subject, html, text: plainText };
    if (cfg.replyTo) msg.replyTo = cfg.replyTo;
    if (attachments && attachments.length > 0) {
      msg.attachments = attachments.map((a) => ({
        content: a.content.toString("base64"),
        filename: a.filename,
        type: a.type,
        disposition: a.disposition ?? "attachment",
      }));
    }
    await sg.send(msg);
    console.log(`[BrainTrackEmail] sent to ${to} — "${subject}"`);
    return { delivery: "sent" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[BrainTrackEmail] SendGrid error:", message);
    return { delivery: "failed", error: message };
  }
}

// ─── Convenience builders ────────────────────────────────────────────────────

/** Welcome email sent to the learner the moment their 14-day trial starts. */
export async function sendWelcomeEmail(opts: {
  to: string;
  firstName: string;
  trialEndsAt: Date;
  language: "en" | "af";
  dashboardUrl: string;
}): Promise<BrandedEmailResult> {
  const { to, ...rest } = opts;
  return sendBrandedEmail({ to, ...buildWelcomePayload(rest) });
}

/** Parent consent request email (replaces the old plain-text version). */
export async function sendParentConsentRequestEmail(opts: {
  parentEmail: string;
  learnerName: string;
  consentUrl: string;
  language: "en" | "af";
}): Promise<BrandedEmailResult> {
  const { parentEmail, learnerName, consentUrl, language } = opts;
  return sendBrandedEmail({
    to: parentEmail,
    ...buildConsentRequestPayload({ learnerName, consentUrl, language }),
  });
}

/** Confirmation email sent to the learner after the parent clicks confirm. */
export async function sendConsentConfirmedEmail(opts: {
  to: string;
  learnerName: string;
  language: "en" | "af";
  dashboardUrl: string;
}): Promise<BrandedEmailResult> {
  const { to, ...rest } = opts;
  return sendBrandedEmail({ to, ...buildConsentConfirmedPayload(rest) });
}

function buildSubscriptionConfirmedPayload(opts: {
  firstName: string;
  language: "en" | "af";
  dashboardUrl: string;
  isRenewal?: boolean;
  planName?: string;
  amountRands?: number;
  nextRenewalAt?: Date;
}): TemplatePayload {
  const { language, dashboardUrl, isRenewal, planName, amountRands, nextRenewalAt } = opts;
  const name = he(opts.firstName || (language === "af" ? "Leerder" : "Learner"));
  const planLabel = he(planName || "Brain Boost");
  const locale = language === "af" ? "af-ZA" : "en-ZA";
  const amountStr = typeof amountRands === "number"
    ? new Intl.NumberFormat(locale, { style: "currency", currency: "ZAR", minimumFractionDigits: 2 }).format(amountRands)
    : null;
  const renewalStr = nextRenewalAt
    ? nextRenewalAt.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })
    : null;

  // Receipt details block (only rendered when at least one field is provided)
  const hasReceiptFields = !!(planName || amountStr || renewalStr);
  const receiptBlock = hasReceiptFields
    ? language === "af"
      ? `
        <table cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin:18px 0;border:1.5px solid rgba(0,229,255,0.4);border-radius:12px;background:#050608;">
          <tr><td style="padding:14px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#ffffff;">
            <div style="font-weight:700;color:#ffffff;margin-bottom:8px;">Betalingsbesonderhede</div>
            <div style="margin:2px 0;"><span style="color:#00E5FF;">Plan:</span> <strong>${planLabel}</strong></div>
            ${amountStr ? `<div style="margin:2px 0;"><span style="color:#00E5FF;">Bedrag gehef:</span> <strong>${amountStr}</strong></div>` : ""}
            ${renewalStr ? `<div style="margin:2px 0;"><span style="color:#00E5FF;">Volgende hernuwing:</span> <strong>${renewalStr}</strong></div>` : ""}
          </td></tr>
        </table>
      `
      : `
        <table cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin:18px 0;border:1.5px solid rgba(0,229,255,0.4);border-radius:12px;background:#050608;">
          <tr><td style="padding:14px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#ffffff;">
            <div style="font-weight:700;color:#ffffff;margin-bottom:8px;">Payment details</div>
            <div style="margin:2px 0;"><span style="color:#00E5FF;">Plan:</span> <strong>${planLabel}</strong></div>
            ${amountStr ? `<div style="margin:2px 0;"><span style="color:#00E5FF;">Amount charged:</span> <strong>${amountStr}</strong></div>` : ""}
            ${renewalStr ? `<div style="margin:2px 0;"><span style="color:#00E5FF;">Next renewal:</span> <strong>${renewalStr}</strong></div>` : ""}
          </td></tr>
        </table>
      `
    : "";

  if (language === "af") {
    const subject = isRenewal
      ? `Jou BrainTrack ${planLabel}-intekening is hernieu ✅`
      : `Welkom by ${planLabel}, ${name}! Jou intekening is aktief ✅`;
    const heading = isRenewal
      ? "Jou intekening is suksesvol hernieu"
      : `Jou ${planLabel}-intekening is aktief, ${name}!`;
    const bodyHtml = isRenewal
      ? `
        <p>Hallo ${name},</p>
        <p>Goeie nuus — jou <strong style="color:#006BFF;">${planLabel}</strong>-intekening is suksesvol hernieu vir nog 'n maand.</p>
        ${receiptBlock}
        <p>Jou volle toegang tot die Slim Tuteur, vorige vraestelle en vorderingsopsporing gaan sonder onderbreking voort.</p>
        <p>Baie sterkte met jou NSC-voorbereiding! 💪</p>
      `
      : `
        <p>Hallo ${name},</p>
        <p>Jou betaling was suksesvol en jou <strong style="color:#006BFF;">${planLabel}</strong>-intekening is nou <strong style="color:#22FF66;">aktief</strong>.</p>
        ${receiptBlock}
        <p>Jy het volle toegang tot die Slim Tuteur, vorige vraestelle, vorderingsopsporing en meer.</p>
        <p>Gaan aan — jou NSC-eksamen wag nie! 🎯</p>
      `;
    return { language, subject, heading, bodyHtml, ctaLabel: "Gaan na my dashboard", ctaUrl: dashboardUrl };
  }
  const subject = isRenewal
    ? `Your BrainTrack ${planLabel} subscription has renewed ✅`
    : `Welcome to ${planLabel}, ${name}! Your subscription is active ✅`;
  const heading = isRenewal
    ? "Your subscription has been successfully renewed"
    : `Your ${planLabel} subscription is active, ${name}!`;
  const bodyHtml = isRenewal
    ? `
      <p>Hi ${name},</p>
      <p>Great news — your <strong style="color:#006BFF;">${planLabel}</strong> subscription has been successfully renewed for another month.</p>
      ${receiptBlock}
      <p>Your full access to Smart Tutor, past papers and progress tracking continues without interruption.</p>
      <p>Keep up the great work on your NSC preparation! 💪</p>
    `
    : `
      <p>Hi ${name},</p>
      <p>Your payment was successful and your <strong style="color:#006BFF;">${planLabel}</strong> subscription is now <strong style="color:#22FF66;">active</strong>.</p>
      ${receiptBlock}
      <p>You have full access to Smart Tutor, past papers, progress tracking and more.</p>
      <p>Get going — your NSC exams won't wait! 🎯</p>
    `;
  return { language, subject, heading, bodyHtml, ctaLabel: "Go to my Dashboard", ctaUrl: dashboardUrl };
}

/** "You're now subscribed" email sent on first payment and each recurring renewal. */
export async function sendSubscriptionConfirmedEmail(opts: {
  to: string;
  firstName: string;
  language: "en" | "af";
  dashboardUrl: string;
  isRenewal?: boolean;
  planName?: string;
  amountRands?: number;
  nextRenewalAt?: Date;
}): Promise<BrandedEmailResult> {
  const { to, ...rest } = opts;
  return sendBrandedEmail({ to, ...buildSubscriptionConfirmedPayload(rest) });
}

/** Day-13 or Day-14 trial expiry warning email (push notification fallback). */
export async function sendTrialExpiryEmail(opts: {
  to: string;
  firstName: string;
  trialEndsAt: Date;
  day: 13 | 14;
  language: "en" | "af";
  subscribeUrl: string;
}): Promise<BrandedEmailResult> {
  const { to, ...rest } = opts;
  return sendBrandedEmail({ to, ...buildTrialExpiryPayload(rest) });
}

// ─── School enquiry confirmation ─────────────────────────────────────────────

function buildSchoolEnquiryConfirmationPayload(opts: {
  contactPerson: string;
  schoolName: string;
  enquiryId: number;
}): TemplatePayload {
  const contactPerson = he(opts.contactPerson);
  const schoolName = he(opts.schoolName);
  const refCode = `SCH-${String(opts.enquiryId).padStart(5, "0")}`;

  return {
    language: "en",
    subject: `BrainTrack has received your school application — ${schoolName}`,
    heading: `Thanks for reaching out, ${contactPerson}!`,
    bodyHtml: `
      <p>Hi ${contactPerson},</p>
      <p>We've received the BrainTrack school registration enquiry for <strong style="color:#006BFF;">${schoolName}</strong>. Your reference number is <strong>${refCode}</strong> — please keep it handy in case you need to follow up with us.</p>
      <p><strong>What happens next?</strong></p>
      <ul style="padding-left:20px;margin:0 0 16px;">
        <li style="margin-bottom:8px;">A member of our schools team will review your application and get in touch within <strong>2–3 business days</strong>.</li>
        <li style="margin-bottom:8px;">We'll send details on pricing, learner access, and how to onboard your Grade 12 cohort.</li>
        <li>If you have any urgent questions in the meantime, email us at <a href="mailto:learn@kth-tech.com" style="color:#00E5FF;text-decoration:none;">learn@kth-tech.com</a> and quote your reference number.</li>
      </ul>
      <p>We're excited about the possibility of supporting your learners as they prepare for their NSC exams. 🎓</p>
    `,
    ctaLabel: "Learn more about BrainTrack for Schools",
    ctaUrl: "https://braintrack.co.za",
  };
}

/**
 * Confirmation email sent to the school contact person immediately after
 * they submit the school onboarding / enquiry form.
 * Gracefully degrades — callers do NOT need try/catch.
 */
export async function sendSchoolEnquiryConfirmationEmail(opts: {
  to: string;
  contactPerson: string;
  schoolName: string;
  enquiryId: number;
}): Promise<BrandedEmailResult> {
  const { to, ...rest } = opts;
  return sendBrandedEmail({ to, ...buildSchoolEnquiryConfirmationPayload(rest) });
}
