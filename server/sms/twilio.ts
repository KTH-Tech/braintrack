// Task #412 — Twilio REST helper for sending transactional SMS messages.
// Uses the v1 Messages endpoint via fetch (no SDK dependency). When Twilio
// credentials are not configured the helper resolves with `ok: false` and a
// `twilio_not_configured` error so callers can surface a clean retry path
// rather than crashing.

export type SendSmsResult =
  | { ok: true; messageSid: string; status: string }
  | { ok: false; error: string; message: string; status?: number };

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID),
  );
}

export function isTwilioWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_FROM,
  );
}

// Twilio expects E.164 — convert local SA numbers (0XXXXXXXXX or 27XXXXXXXXX
// or already +27...) to a leading +27 representation.
export function toE164(saCell: string): string {
  const trimmed = (saCell ?? "").trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("27")) return `+${digits}`;
  if (digits.startsWith("0")) return `+27${digits.slice(1)}`;
  return `+${digits}`;
}

export interface SendSmsOptions {
  // Task #415: Twilio will POST delivery status updates (queued → sent →
  // delivered / failed / undelivered) to this absolute https URL so we can
  // track which onboarding SMSes actually reached the learner.
  statusCallback?: string;
  // Task #427: caller-supplied Content SID override — used by
  // onboarding-link.ts to route Afrikaans messages to the AF template SID
  // (TWILIO_WHATSAPP_CONTENT_SID_AF) when it differs from the EN default.
  // Takes precedence over TWILIO_WHATSAPP_CONTENT_SID env var.
  contentSid?: string;
}

export async function sendSms(
  toCell: string,
  body: string,
  opts: SendSmsOptions = {},
): Promise<SendSmsResult> {
  if (!isTwilioConfigured()) {
    return {
      ok: false,
      error: "twilio_not_configured",
      message:
        "SMS delivery is not yet configured on this environment (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER missing).",
    };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const to = toE164(toCell);

  const params = new URLSearchParams();
  params.set("To", to);
  params.set("Body", body);
  if (messagingServiceSid) {
    params.set("MessagingServiceSid", messagingServiceSid);
  } else if (from) {
    params.set("From", from);
  }
  if (opts.statusCallback && /^https:\/\//i.test(opts.statusCallback)) {
    params.set("StatusCallback", opts.statusCallback);
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`;
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, any>;
    if (!res.ok) {
      return {
        ok: false,
        error: data?.code ? `twilio_${data.code}` : "twilio_send_failed",
        message: data?.message || `Twilio responded with HTTP ${res.status}`,
        status: res.status,
      };
    }
    return {
      ok: true,
      messageSid: String(data.sid ?? ""),
      status: String(data.status ?? "queued"),
    };
  } catch (err: any) {
    return {
      ok: false,
      error: "twilio_network_error",
      message: err?.message ?? "Unexpected network error contacting Twilio",
    };
  }
}

// Twilio WhatsApp uses the same Messages endpoint with a `whatsapp:` prefix on
// To/From. TWILIO_WHATSAPP_FROM should be set to the sender in either form
// (`+14155238886` or `whatsapp:+14155238886`); we normalise here.
function withWhatsAppPrefix(num: string): string {
  const trimmed = (num ?? "").trim();
  if (!trimmed) return trimmed;
  if (trimmed.toLowerCase().startsWith("whatsapp:")) return trimmed;
  return `whatsapp:${trimmed.startsWith("+") ? trimmed : toE164(trimmed)}`;
}

export async function sendWhatsApp(
  toCell: string,
  body: string,
  opts: SendSmsOptions = {},
): Promise<SendSmsResult> {
  if (!isTwilioWhatsAppConfigured()) {
    return {
      ok: false,
      error: "twilio_not_configured",
      message:
        "WhatsApp delivery is not yet configured on this environment (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM missing).",
    };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = withWhatsAppPrefix(process.env.TWILIO_WHATSAPP_FROM!);
  const to = withWhatsAppPrefix(toCell);
  const contentSid = opts.contentSid ?? process.env.TWILIO_WHATSAPP_CONTENT_SID;
  const contentVarsRaw = process.env.TWILIO_WHATSAPP_CONTENT_VARIABLES_JSON;

  const params = new URLSearchParams();
  params.set("To", to);
  params.set("From", from);
  if (contentSid) {
    // Approved template path (required for first-touch outside the 24h
    // session window). Caller can pass a JSON object of {{1}}, {{2}}…
    // substitutions via TWILIO_WHATSAPP_CONTENT_VARIABLES_JSON or by
    // overriding `body` (treated as a single {{1}} substitution if the
    // env var isn't set).
    params.set("ContentSid", contentSid);
    if (contentVarsRaw) {
      params.set("ContentVariables", contentVarsRaw);
    } else if (body) {
      params.set("ContentVariables", JSON.stringify({ "1": body }));
    }
  } else {
    params.set("Body", body);
  }
  if (opts.statusCallback && /^https:\/\//i.test(opts.statusCallback)) {
    params.set("StatusCallback", opts.statusCallback);
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`;
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, any>;
    if (!res.ok) {
      return {
        ok: false,
        error: data?.code ? `twilio_${data.code}` : "twilio_send_failed",
        message: data?.message || `Twilio responded with HTTP ${res.status}`,
        status: res.status,
      };
    }
    return {
      ok: true,
      messageSid: String(data.sid ?? ""),
      status: String(data.status ?? "queued"),
    };
  } catch (err: any) {
    return {
      ok: false,
      error: "twilio_network_error",
      message: err?.message ?? "Unexpected network error contacting Twilio",
    };
  }
}
