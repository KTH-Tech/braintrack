// BrainTrack messaging abstraction — WhatsApp-first, SMS fallback.
//
// The wider trial-lifecycle system (welcome, first-quiz-completed, day-3/7/12
// nudges, payment success/failure, prelim countdown, streak-broken) is fired
// from crons and event handlers scattered across the server. This module is
// the single funnel every one of those calls into. It:
//
//   • picks WhatsApp if the recipient has opted in (users.whatsapp_opt_in
//     TRUE), and falls back to SMS on any non-2xx or thrown error;
//   • renders bilingual (EN / AF) templates from a per-key `en`/`af` pair based
//     on `preferredLanguage` — everything defaults to English when unset;
//   • never throws — every failure resolves to `{ delivered: false, error }`
//     so a bad template can't nuke a cron or event handler;
//   • no-ops (with a warn log) when `TWILIO_ACCOUNT_SID` /
//     `TWILIO_AUTH_TOKEN` are not set, so scaffolding can ship ahead of the
//     credentials landing in Render.
//
// The Twilio SDK is loaded via a variable-ID dynamic import so
// `npx tsc --noEmit` stays clean before `npm install twilio` runs — TypeScript
// treats an `import()` of an untyped variable as `Promise<any>`. Set
// `MOCK_TWILIO=true` (unit tests, staging dry-runs) to short-circuit the SDK
// path entirely and record a "would-send" delivery.

import { toE164 } from "../sms/twilio";

export type Language = "en" | "af";
export type Channel = "whatsapp" | "sms";

export interface MessageTemplate {
  key: string;
  category: "UTILITY" | "MARKETING";
  en: string;
  af: string;
}

/**
 * The nine BrainTrack lifecycle templates. Bodies are the exact copy the
 * owner approved on 2026-07-22 — they need to be re-registered verbatim in
 * the Twilio WhatsApp Sender Console (Meta template approval) before the
 * WhatsApp path can send outside a 24-hour session window, but the SMS
 * fallback works from the moment env vars land.
 */
export const MESSAGE_TEMPLATES = {
  welcome: {
    key: "welcome",
    category: "UTILITY",
    en: "You're in, {{parent_first}} 👋 {{learner_first}} can start now: {{app_link}}. Trial: 14 days free, then R169/month. Cancel anytime in Settings → Subscription.",
    af: "Jy's in, {{parent_first}} 👋 {{learner_first}} kan nou begin: {{app_link}}. Proef: 14 dae gratis, dan R169/maand. Kanselleer enige tyd in Instellings → Intekening.",
  },
  first_quiz_completed: {
    key: "first_quiz_completed",
    category: "UTILITY",
    en: "{{learner_first}} just finished their first quiz on BrainTrack — {{correct}}/{{total}} correct, {{topic}}. Rizz suggested {{next_topic}} next. Track progress → {{app_link}}",
    af: "{{learner_first}} het pas hulle eerste vasvra op BrainTrack voltooi — {{correct}}/{{total}} reg, {{topic}}. Rizz stel {{next_topic}} volgende voor. Volg vordering → {{app_link}}",
  },
  day_3_youre_rolling: {
    key: "day_3_youre_rolling",
    category: "UTILITY",
    en: "Hi {{parent_first}} 👋 — {{learner_first}} has already answered {{questions_answered}} questions on BrainTrack in 3 days. Streak: {{streak}} 🔥. If they hit day 14 with a streak of 5+, matric parents in our pilot saw prep scores jump 12%. Trial ends {{days_left}} days: {{app_link}}",
    af: "Hi {{parent_first}} 👋 — {{learner_first}} het al {{questions_answered}} vrae in 3 dae op BrainTrack beantwoord. Reeks: {{streak}} 🔥. Ouers in ons proefloop wat teen dag 14 'n reeks van 5+ gehad het, het punte met 12% sien styg. Proeftydperk eindig oor {{days_left}} dae: {{app_link}}",
  },
  day_7_checkpoint: {
    key: "day_7_checkpoint",
    category: "UTILITY",
    en: "Halfway through your BrainTrack trial. {{learner_first}} is at {{prep_score}}% prep score on {{weakest_subject}}, up {{delta}} points this week. {{days_to_prelims}} days until prelims. Keep going → {{app_link}}",
    af: "Halfpad deur jou BrainTrack-proeftydperk. {{learner_first}} is op {{prep_score}}% prep-telling vir {{weakest_subject}}, {{delta}} punte op hierdie week. {{days_to_prelims}} dae tot voorlopige eksamens. Bly aan → {{app_link}}",
  },
  day_12_two_days_left: {
    key: "day_12_two_days_left",
    category: "UTILITY",
    en: "Two days until your BrainTrack trial ends and R169/month starts. {{learner_first}}'s stats so far: {{questions_answered}} questions · {{papers_completed}} papers · {{streak}}-day streak. Cancel anytime in Settings → Subscription: {{app_link}}. Nothing changes tomorrow — just wanted to be straight with you before day 15.",
    af: "Twee dae tot jou BrainTrack-proeftydperk eindig en R169/maand begin. {{learner_first}} se stats tot dusver: {{questions_answered}} vrae · {{papers_completed}} vraestelle · {{streak}}-dag reeks. Kanselleer enige tyd in Instellings → Intekening: {{app_link}}. Niks verander môre nie — net eerlik oor dag 15.",
  },
  payment_success: {
    key: "payment_success",
    category: "UTILITY",
    en: "Thanks, {{parent_first}}. R169 processed on card ending {{card_last4}}. {{learner_first}} has full BrainTrack Premium until {{next_charge_date}}. Manage subscription → {{app_link}}",
    af: "Dankie, {{parent_first}}. R169 op kaart eindig {{card_last4}} verwerk. {{learner_first}} het volle BrainTrack Premium tot {{next_charge_date}}. Bestuur intekening → {{app_link}}",
  },
  payment_failed: {
    key: "payment_failed",
    category: "UTILITY",
    en: "The R169 charge for BrainTrack didn't go through on card ending {{card_last4}}. Reason: {{reason}}. We'll retry in 24 hours. Update card → {{app_link}}/settings/subscription",
    af: "Die R169-heffing vir BrainTrack het nie deurgegaan op kaart eindig {{card_last4}} nie. Rede: {{reason}}. Ons probeer oor 24 uur weer. Werk kaart op → {{app_link}}/settings/subscription",
  },
  prelim_countdown_7d: {
    key: "prelim_countdown_7d",
    category: "MARKETING",
    en: "Prelims start in 7 days, {{parent_first}}. {{learner_first}} is at {{overall_prep}}% overall prep. Strongest: {{strongest_subject}}. Focus this week: {{weakest_subject}}. Rizz has a 7-day sprint plan ready → {{app_link}}/study-plan",
    af: "Voorlopige eksamens begin oor 7 dae, {{parent_first}}. {{learner_first}} is op {{overall_prep}}% algehele prep. Sterkste: {{strongest_subject}}. Fokus hierdie week: {{weakest_subject}}. Rizz het 'n 7-dag sprint-plan gereed → {{app_link}}/study-plan",
  },
  streak_broken: {
    key: "streak_broken",
    category: "MARKETING",
    en: "{{learner_first}}'s {{last_streak}}-day study streak broke yesterday. Prelims in {{days_to_prelims}} days. One 20-min session today gets it moving again → {{app_link}}/boost-session",
    af: "{{learner_first}} se {{last_streak}}-dag studiereeks het gister gebreek. Voorlopige eksamens oor {{days_to_prelims}} dae. Een 20-min sessie vandag kry dit weer aan die gang → {{app_link}}/boost-session",
  },
} as const satisfies Record<string, MessageTemplate>;

export type TemplateKey = keyof typeof MESSAGE_TEMPLATES;

export type TemplateVariables = Record<string, string | number | null | undefined>;

/**
 * Render `{{variable}}` placeholders against a plain object. Unknown or
 * missing variables collapse to an empty string — safer than leaving the raw
 * `{{...}}` visible to the recipient. The renderer is pure, exported so the
 * unit tests can exercise language fallback + substitution without touching
 * Twilio.
 */
export function renderTemplate(
  templateKey: TemplateKey,
  language: Language,
  variables: TemplateVariables = {},
): string {
  const template = MESSAGE_TEMPLATES[templateKey];
  const body = template[language] ?? template.en; // AF may be absent → EN
  return body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, name: string) => {
    const value = variables[name];
    if (value === null || value === undefined) return "";
    return String(value);
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────────────────────────────────

export function isMessagingConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
}

export function isWhatsAppConfigured(): boolean {
  return isMessagingConfigured() && Boolean(process.env.TWILIO_WHATSAPP_FROM);
}

export function isSmsConfigured(): boolean {
  return isMessagingConfigured() && Boolean(
    process.env.TWILIO_SA_NUMBER || process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID,
  );
}

function isMockMode(): boolean {
  return process.env.MOCK_TWILIO === "true" || process.env.MOCK_TWILIO === "1";
}

// ────────────────────────────────────────────────────────────────────────────
// SDK loader
// ────────────────────────────────────────────────────────────────────────────

let cachedTwilioClient: any | null = null;
let sdkLoadFailed = false;

/**
 * Load the twilio npm package lazily. Uses a variable-name so tsc does not
 * resolve the module at compile time — the package can be added to
 * package.json but not yet installed on a dev machine and boot still works.
 * The client is memoised across calls.
 */
async function getTwilioClient(): Promise<any | null> {
  if (isMockMode()) return null;
  if (cachedTwilioClient) return cachedTwilioClient;
  if (sdkLoadFailed) return null;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  try {
    const modName = "twilio";
    const mod: any = await import(modName);
    const factory = mod?.default ?? mod;
    cachedTwilioClient = typeof factory === "function" ? factory(sid, token) : null;
    if (!cachedTwilioClient) {
      sdkLoadFailed = true;
      console.warn("[messaging] twilio SDK loaded but factory shape was unexpected — messaging disabled");
    }
    return cachedTwilioClient;
  } catch (err: any) {
    sdkLoadFailed = true;
    console.warn(
      `[messaging] twilio SDK not installed (${err?.message ?? String(err)}) — run 'npm install twilio' to enable live sends`,
    );
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

export interface SendMessageArgs {
  to: string;
  templateKey: TemplateKey;
  language?: Language;
  variables?: TemplateVariables;
  /**
   * Bias which channel is tried first. Defaults to "whatsapp". When the
   * caller passes "sms" (parent opted out) we skip WhatsApp entirely.
   */
  preferChannel?: Channel;
}

export type SendMessageResult =
  | { delivered: true; channel: Channel; messageSid: string; body: string }
  | { delivered: false; channel: "none"; error: string; body?: string };

/**
 * Never throws. Returns a result object callers can log without a try/catch
 * around each invocation. Every failure — misconfigured Twilio, WhatsApp
 * bounce, SMS bounce, template rendering error — resolves the same way so a
 * broken template can't take down a cron.
 */
export async function sendMessage(args: SendMessageArgs): Promise<SendMessageResult> {
  const { to, templateKey, language = "en", variables = {}, preferChannel = "whatsapp" } = args;

  // Render before we touch Twilio so a template bug shows up here even in
  // dry-run mode.
  let body: string;
  try {
    body = renderTemplate(templateKey, language, variables);
  } catch (err: any) {
    console.error(`[messaging] render failed for ${templateKey}:`, err?.message ?? err);
    return { delivered: false, channel: "none", error: "render_failed" };
  }

  if (!isMessagingConfigured()) {
    console.warn(
      `[messaging] TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN not set — skipping ${templateKey} to ${to}`,
    );
    return { delivered: false, channel: "none", error: "twilio_not_configured", body };
  }

  const toE164Normalised = toE164(to);
  if (!toE164Normalised || toE164Normalised === "+") {
    return { delivered: false, channel: "none", error: "invalid_recipient", body };
  }

  // MOCK path: unit tests and staging dry-runs. Never touches the network.
  if (isMockMode()) {
    const mockChannel: Channel = preferChannel === "sms" || !isWhatsAppConfigured() ? "sms" : "whatsapp";
    console.log(
      `[messaging:mock] ${mockChannel} ${templateKey} → ${toE164Normalised} :: ${body.slice(0, 80)}${body.length > 80 ? "…" : ""}`,
    );
    return { delivered: true, channel: mockChannel, messageSid: `MOCK-${templateKey}-${Date.now()}`, body };
  }

  const client = await getTwilioClient();
  if (!client) {
    return { delivered: false, channel: "none", error: "twilio_sdk_unavailable", body };
  }

  // ── WhatsApp attempt ────────────────────────────────────────────────────
  if (preferChannel === "whatsapp" && isWhatsAppConfigured()) {
    const waFrom = normaliseWhatsAppSender(process.env.TWILIO_WHATSAPP_FROM!);
    try {
      const msg = await client.messages.create({
        to: `whatsapp:${toE164Normalised}`,
        from: waFrom,
        body,
      });
      const status = String(msg?.status ?? "queued");
      // `failed`/`undelivered` from the Messages resource means the accepted
      // message could not be handed to the WhatsApp channel — treat it the
      // same as a thrown error and fall through to SMS.
      if (status === "failed" || status === "undelivered") {
        console.warn(
          `[messaging] whatsapp ${templateKey} to ${toE164Normalised} returned status=${status}, falling back to SMS`,
        );
      } else {
        return { delivered: true, channel: "whatsapp", messageSid: String(msg?.sid ?? ""), body };
      }
    } catch (err: any) {
      console.warn(
        `[messaging] whatsapp ${templateKey} to ${toE164Normalised} threw (${err?.code ?? "?"}: ${err?.message ?? err}), falling back to SMS`,
      );
      // Fall through to SMS.
    }
  }

  // ── SMS attempt ─────────────────────────────────────────────────────────
  if (isSmsConfigured()) {
    const smsFrom = process.env.TWILIO_SA_NUMBER || process.env.TWILIO_FROM_NUMBER;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    try {
      const createArgs: Record<string, string> = { to: toE164Normalised, body };
      if (messagingServiceSid) {
        createArgs.messagingServiceSid = messagingServiceSid;
      } else if (smsFrom) {
        createArgs.from = smsFrom;
      } else {
        return { delivered: false, channel: "none", error: "sms_sender_not_configured", body };
      }
      const msg = await client.messages.create(createArgs);
      return { delivered: true, channel: "sms", messageSid: String(msg?.sid ?? ""), body };
    } catch (err: any) {
      console.error(
        `[messaging] sms ${templateKey} to ${toE164Normalised} threw (${err?.code ?? "?"}: ${err?.message ?? err})`,
      );
      return { delivered: false, channel: "none", error: `sms_send_failed:${err?.code ?? "unknown"}`, body };
    }
  }

  return { delivered: false, channel: "none", error: "no_channel_configured", body };
}

// The WhatsApp `From` may be stored as `+14155238886` or `whatsapp:+14155238886`.
// Normalise once so a mis-configured env var can't cause a `whatsapp:whatsapp:`
// double-prefix (Twilio silently rejects it as an invalid sender).
function normaliseWhatsAppSender(raw: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return trimmed;
  if (trimmed.toLowerCase().startsWith("whatsapp:")) return trimmed;
  return `whatsapp:${trimmed.startsWith("+") ? trimmed : toE164(trimmed)}`;
}

/**
 * Test seams — resets the memoised SDK client so a unit test can exercise a
 * fresh env-var configuration between cases. NEVER called from production.
 */
export function __resetMessagingForTests(): void {
  cachedTwilioClient = null;
  sdkLoadFailed = false;
}
