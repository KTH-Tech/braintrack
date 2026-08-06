// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Cloud API webhook — GENERIC, REUSABLE route factory.
//
// Wires the two endpoints Meta requires onto an Express app, with all the
// security plumbing (verification handshake, HMAC signature check, raw-body
// capture, per-sender rate limiting, fast 200 ack) done here ONCE. The only
// app-specific thing a caller supplies is an inbound `handler` — see
// server/whatsapp/handler.ts for BrainTrack's Rizz wiring.
//
// ── REUSE ───────────────────────────────────────────────────────────────────
//   Another product calls `registerWhatsAppWebhook(app, { handler, config })`
//   with its OWN handler + its OWN WhatsAppConfig (own number/token/secret) and
//   optionally its own `path`. Nothing below is BrainTrack-specific.
//
// ── BOOT SAFETY ─────────────────────────────────────────────────────────────
//   No credentials are read at import time. Routes always register; if creds
//   are absent the POST route simply acks Meta with 200 and does nothing. The
//   server starts fine without any WhatsApp env vars.
// ─────────────────────────────────────────────────────────────────────────────

import express, { type Express, type Request, type Response } from "express";
import {
  type WhatsAppConfig,
  type InboundTextMessage,
  getConfigFromEnv,
  isWhatsAppConfigured,
  verifyWebhookSignature,
  parseInboundMessages,
} from "./client";

export type InboundHandler = (msg: InboundTextMessage, config: WhatsAppConfig) => Promise<void>;

export interface RegisterWhatsAppWebhookOptions {
  /** App-specific inbound message handler (the only non-generic piece). */
  handler: InboundHandler;
  /** Credentials/routing. Defaults to the standard env vars. */
  config?: WhatsAppConfig;
  /** Route path. Default: /api/whatsapp/webhook */
  path?: string;
  /**
   * Extra gate on TOP of creds being present — inbound messages are only
   * routed to `handler` when this returns true. Lets a product ship the
   * endpoint dark and flip it on later. Default: always enabled (when
   * configured).
   */
  isEnabled?: () => boolean;
  /** Max inbound messages processed per sender per minute. Default: 15. */
  maxPerMinutePerSender?: number;
}

// In-memory sliding-window rate limiter, keyed by sender phone. Per-instance
// (fine for abuse/runaway-cost protection; not a distributed guarantee).
const RATE_WINDOW_MS = 60_000;

function makeRateLimiter(maxPerWindow: number) {
  const hits = new Map<string, number[]>();
  return function allow(key: string): boolean {
    const now = Date.now();
    const arr = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
    if (arr.length >= maxPerWindow) {
      hits.set(key, arr);
      return false;
    }
    arr.push(now);
    hits.set(key, arr);
    // Opportunistic cleanup so the map can't grow unbounded.
    if (hits.size > 5000) {
      for (const [k, v] of hits) {
        if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
      }
    }
    return true;
  };
}

/**
 * Register `GET`/`POST {path}` on `app`.
 *
 *  GET  — Meta verification handshake: echoes `hub.challenge` (200) when
 *         `hub.mode === "subscribe"` and `hub.verify_token` matches; else 403.
 *
 *  POST — HMAC-verifies `X-Hub-Signature-256` against the RAW body with the app
 *         secret (constant-time; 403 on mismatch), then acks Meta with 200
 *         quickly and processes messages OUT of band so the ack never blocks on
 *         AI work. When unconfigured or disabled it still acks 200 but does
 *         nothing.
 */
export function registerWhatsAppWebhook(app: Express, opts: RegisterWhatsAppWebhookOptions): void {
  const path = opts.path ?? "/api/whatsapp/webhook";
  const config = opts.config ?? getConfigFromEnv();
  const isEnabled = opts.isEnabled ?? (() => true);
  const allow = makeRateLimiter(opts.maxPerMinutePerSender ?? 15);

  // ── GET: verification handshake ───────────────────────────────────────────
  app.get(path, (req: Request, res: Response) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && config.verifyToken && token === config.verifyToken) {
      // Meta expects the raw challenge string echoed back with 200.
      return res.status(200).type("text/plain").send(String(challenge ?? ""));
    }
    return res.sendStatus(403);
  });

  // ── POST: inbound events ──────────────────────────────────────────────────
  // Local raw-body parser scoped to THIS route only, so global JSON parsing is
  // untouched. body-parser sets `req._body` after it runs, so if the host app
  // already parsed the body globally (BrainTrack does, and also captures the
  // exact bytes on `req.rawBody`) this express.raw is a no-op and we fall back
  // to `req.rawBody`. Either way we end up with the exact signed bytes.
  app.post(path, express.raw({ type: () => true, limit: "1mb" }), (req: Request, res: Response) => {
    const rawBody: Buffer = Buffer.isBuffer((req as any).rawBody)
      ? (req as any).rawBody
      : Buffer.isBuffer(req.body)
        ? (req.body as Buffer)
        : Buffer.alloc(0);

    // Not configured → nothing to verify against; ack and drop.
    if (!isWhatsAppConfigured(config)) {
      return res.sendStatus(200);
    }

    // Mandatory signature verification. We must not act on unverified input.
    const signature =
      (req.headers["x-hub-signature-256"] as string | undefined) ??
      (req.headers["X-Hub-Signature-256"] as unknown as string | undefined);

    if (!verifyWebhookSignature(rawBody, signature, config.appSecret)) {
      // Either the app secret isn't set (can't verify) or the signature is
      // wrong (possible forgery). Reject.
      return res.sendStatus(403);
    }

    // Signature good. Ack Meta immediately, then do the work out of band so the
    // AI round-trip never delays the 200 (Meta retries slow/failed webhooks).
    res.sendStatus(200);

    // Feature gate — endpoint can be live but inert until explicitly enabled.
    if (!isEnabled()) return;

    let payload: any;
    try {
      payload = rawBody.length ? JSON.parse(rawBody.toString("utf8")) : {};
    } catch {
      return; // malformed JSON — already acked, nothing to do
    }

    const messages = parseInboundMessages(payload);
    for (const msg of messages) {
      if (!allow(msg.from)) {
        console.warn("[whatsapp] rate limit hit for a sender — dropping message");
        continue;
      }
      // Fire-and-forget; a handler failure must never crash the process.
      void opts.handler(msg, config).catch((err: any) => {
        console.error(`[whatsapp] inbound handler error: ${err?.message ?? String(err)}`);
      });
    }
  });
}
