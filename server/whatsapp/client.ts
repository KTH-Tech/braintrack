// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Cloud API client — GENERIC, REUSABLE, BOOT-SAFE.
//
// This is BrainTrack's OWN WhatsApp engine, talking directly to Meta's Graph
// (WhatsApp Cloud) API. NO Twilio, NO third-party BSP. Nothing here is
// BrainTrack-specific — the send client, signature verification and payload
// parsing are pure Graph-API plumbing that any product can reuse.
//
// ── HOW ANOTHER PRODUCT REUSES THIS ─────────────────────────────────────────
//   1. Spin up its OWN Meta app + WhatsApp number (own PHONE_NUMBER_ID + TOKEN
//      + VERIFY_TOKEN + APP_SECRET).
//   2. Either set the same env vars in that product's environment, OR pass an
//      explicit `WhatsAppConfig` to `sendWhatsAppText()` / the webhook factory
//      (see webhook.ts) so several numbers can coexist in one process.
//   3. Provide its OWN inbound handler (the app-specific bit) — see
//      `registerWhatsAppWebhook` in webhook.ts. Everything in THIS file stays
//      untouched.
//
// ── BOOT SAFETY ─────────────────────────────────────────────────────────────
//   Nothing is constructed at import time. No client, no credential read that
//   throws. If the env vars are absent the module simply reports "not
//   configured" and every send is a logged no-op that returns false. The server
//   must always be able to start without WhatsApp creds — this repo has already
//   had a boot-crash outage from top-level construction on missing creds, so
//   that pattern is deliberately avoided here.
//
// ── SECURITY ────────────────────────────────────────────────────────────────
//   Tokens are never logged. Message bodies are never logged in full (they can
//   contain learner PII) — only a short, length-capped preview at debug level.
// ─────────────────────────────────────────────────────────────────────────────

import { createHmac, timingSafeEqual } from "crypto";

const GRAPH_API_VERSION = "v20.0";
const GRAPH_API_BASE = "https://graph.facebook.com";

/**
 * Credentials + routing for a single WhatsApp number. All fields optional so
 * an unconfigured environment resolves cleanly to "not configured" instead of
 * throwing. Reuse across products by passing a distinct config per number.
 */
export interface WhatsAppConfig {
  /** Graph API access token (Bearer). Env: WHATSAPP_TOKEN */
  token?: string;
  /** The business phone-number id that owns the send. Env: WHATSAPP_PHONE_NUMBER_ID */
  phoneNumberId?: string;
  /** Shared secret echoed back during Meta's GET verification handshake. Env: WHATSAPP_VERIFY_TOKEN */
  verifyToken?: string;
  /** Meta App Secret — used to HMAC-verify inbound webhook payloads. Env: WHATSAPP_APP_SECRET */
  appSecret?: string;
}

/** Read a config straight from the standard env vars. Never throws. */
export function getConfigFromEnv(): WhatsAppConfig {
  return {
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    appSecret: process.env.WHATSAPP_APP_SECRET,
  };
}

/**
 * True when the minimum needed to SEND is present (token + phone-number id).
 * Verification (verifyToken) and inbound signature checks (appSecret) are
 * additional and checked where they're used.
 */
export function isWhatsAppConfigured(config: WhatsAppConfig = getConfigFromEnv()): boolean {
  return Boolean(config.token && config.phoneNumberId);
}

/**
 * Send a plain-text WhatsApp message via the Graph API.
 *
 *   POST https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages
 *   Authorization: Bearer {WHATSAPP_TOKEN}
 *   { messaging_product: "whatsapp", to, type: "text", text: { body } }
 *
 * Lazy + never throws. Returns `true` only on a 2xx from Meta; on missing
 * config, a non-2xx, or a network error it logs and returns `false` so callers
 * (crons, webhook handlers) can't be taken down by a send failure.
 *
 * NOTE: outside the 24-hour customer-service window Meta only permits approved
 * *template* messages — a free-form text send will be rejected. Inbound-reply
 * flows (a learner messaged us first) are inside the window, so text is fine.
 */
export async function sendWhatsAppText(
  toE164: string,
  body: string,
  config: WhatsAppConfig = getConfigFromEnv(),
): Promise<boolean> {
  if (!isWhatsAppConfigured(config)) {
    console.warn("[whatsapp] not configured (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID missing) — skipping send");
    return false;
  }

  const to = normaliseRecipient(toE164);
  if (!to) {
    console.warn("[whatsapp] send skipped — empty/invalid recipient");
    return false;
  }

  const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${config.phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body },
      }),
    });

    if (!res.ok) {
      // Meta returns a JSON error envelope; surface the code/subcode but NEVER
      // the token or the message body.
      let detail = "";
      try {
        const errJson: any = await res.json();
        const e = errJson?.error;
        detail = e ? ` code=${e.code ?? "?"} subcode=${e.error_subcode ?? "?"} msg=${e.message ?? "?"}` : "";
      } catch {
        /* body wasn't JSON — ignore */
      }
      console.error(`[whatsapp] send failed — HTTP ${res.status}${detail}`);
      return false;
    }

    return true;
  } catch (err: any) {
    console.error(`[whatsapp] send threw: ${err?.message ?? String(err)}`);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Inbound webhook helpers — generic Graph-API plumbing.
// ─────────────────────────────────────────────────────────────────────────────

/** One inbound text message, flattened out of Meta's nested webhook envelope. */
export interface InboundTextMessage {
  /** Sender's phone in E.164 with a leading '+'. */
  from: string;
  /** The text the user typed. */
  text: string;
  /** Meta's message id (wamid…) — useful for idempotency/logging. */
  messageId: string;
  /** Unix seconds (as sent by Meta), best-effort. */
  timestamp: string;
  /** The business phone-number id that RECEIVED the message. */
  phoneNumberId: string;
}

/**
 * Verify Meta's `X-Hub-Signature-256` header: it is `sha256=<hex>` where the
 * hex is HMAC-SHA256(appSecret, rawBody). Constant-time compare. Returns false
 * on any shape mismatch. `rawBody` MUST be the exact bytes Meta signed — a
 * re-serialised JSON object will NOT match.
 */
export function verifyWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  appSecret: string | undefined,
): boolean {
  if (!appSecret) return false;
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) return false;

  const expectedHex = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const providedHex = signatureHeader.slice("sha256=".length).trim();

  const expected = Buffer.from(expectedHex, "hex");
  const provided = Buffer.from(providedHex, "hex");
  // timingSafeEqual throws if lengths differ — guard first.
  if (expected.length !== provided.length || expected.length === 0) return false;
  try {
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

/**
 * Flatten a Meta webhook payload into inbound text messages. Non-text messages
 * (image/audio/status callbacks/etc.) are ignored — only `type === "text"`
 * with a body survives. Defensive against every level being absent. Never
 * throws.
 */
export function parseInboundMessages(payload: any): InboundTextMessage[] {
  const out: InboundTextMessage[] = [];
  const entries = Array.isArray(payload?.entry) ? payload.entry : [];
  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const value = change?.value;
      const phoneNumberId = value?.metadata?.phone_number_id ?? "";
      const messages = Array.isArray(value?.messages) ? value.messages : [];
      for (const msg of messages) {
        if (msg?.type !== "text") continue;
        const text = typeof msg?.text?.body === "string" ? msg.text.body : "";
        if (!text) continue;
        const from = normaliseRecipient(msg?.from ?? "");
        if (!from) continue;
        out.push({
          from,
          text,
          messageId: String(msg?.id ?? ""),
          timestamp: String(msg?.timestamp ?? ""),
          phoneNumberId: String(phoneNumberId),
        });
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Meta accepts recipients as digits (no '+'). Inbound `from` also arrives as
 * bare digits. Normalise to a leading-'+' E.164-ish string for our own use;
 * the Graph API tolerates both, and we strip nothing else so we don't corrupt
 * an already-valid number.
 */
function normaliseRecipient(raw: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    return digits ? `+${digits}` : "";
  }
  const digits = trimmed.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}
