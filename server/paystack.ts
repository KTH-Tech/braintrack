/**
 * server/paystack.ts — Paystack checkout + recurring subscriptions (ZAR).
 *
 * Replaces the Netcash integration as the sole payment provider.
 *
 * Flow:
 *   1. POST /api/paystack/initialize  → creates a transaction against the
 *      configured plan and returns Paystack's hosted checkout URL.
 *   2. Learner/parent pays on Paystack.
 *   3. Paystack POSTs to /api/paystack/webhook. We verify the signature,
 *      then activate/renew/cancel the subscription.
 *   4. Learner returns to /subscribe?ref=... ; GET /api/paystack/verify/:ref
 *      confirms status immediately rather than waiting on the webhook.
 *
 * Security:
 *  - The secret key never leaves the server.
 *  - Webhooks are verified with HMAC-SHA512 over the RAW body (Paystack's
 *    scheme). An unverified body is never parsed as trusted input.
 *  - Every webhook event is recorded by Paystack event id, so replays and
 *    duplicate deliveries cannot double-apply.
 *  - Amounts are always handled in minor units (kobo/cents) as integers.
 */
import type { Express, Request, Response } from "express";
import crypto from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { users, subscriptions, paymentEvents } from "@shared/schema";

const PAYSTACK_API = "https://api.paystack.co";

function secretKey(): string | null {
  return process.env.PAYSTACK_SECRET_KEY || null;
}
function planCode(): string | null {
  return process.env.PAYSTACK_PLAN_CODE || null;
}
export function isPaystackConfigured(): boolean {
  return Boolean(secretKey() && planCode());
}

async function paystackFetch(path: string, init?: RequestInit): Promise<any> {
  const key = secretKey();
  if (!key) throw new Error("PAYSTACK_SECRET_KEY not configured");
  const res = await fetch(`${PAYSTACK_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body?.status === false) {
    throw new Error(body?.message || `Paystack ${path} failed (${res.status})`);
  }
  return body.data;
}

/**
 * Verify a webhook against the raw request body. Paystack signs the exact
 * bytes it sent, so this MUST run on the raw buffer — re-serialising a parsed
 * object changes key order/whitespace and the signature will never match.
 */
export function verifyWebhookSignature(rawBody: Buffer | string, signature: string | undefined): boolean {
  const key = secretKey();
  if (!key || !signature) return false;
  const expected = crypto.createHmac("sha512", key).update(rawBody).digest("hex");
  // Constant-time compare; lengths must match or timingSafeEqual throws.
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Record an event once. Returns false if this event id was already applied. */
async function recordEventOnce(eventId: string, eventType: string, payload: unknown): Promise<boolean> {
  try {
    const existing = await db.select({ id: paymentEvents.id })
      .from(paymentEvents)
      .where(eq(paymentEvents.providerEventId, eventId));
    if (existing.length > 0) return false;
    await db.insert(paymentEvents).values({
      provider: "paystack",
      providerEventId: eventId,
      eventType,
      payload: payload as any,
    } as any);
    return true;
  } catch (err: any) {
    // A unique-constraint race means another delivery won — treat as duplicate.
    if (String(err?.code) === "23505") return false;
    throw err;
  }
}

async function activateSubscription(opts: {
  userId: string;
  customerCode?: string | null;
  subscriptionCode?: string | null;
  amountMinor?: number | null;
  nextPaymentDate?: string | null;
}): Promise<void> {
  const { userId, customerCode, subscriptionCode, amountMinor, nextPaymentDate } = opts;
  const [existing] = await db.select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  const values: any = {
    userId,
    userRole: "learner",
    status: "active",
    plan: "premium",
    priceRands: amountMinor ? Math.round(amountMinor / 100) : 169,
    paymentProvider: "paystack",
    billingMethod: "paystack",
    startDate: new Date(),
    nextRenewalAt: nextPaymentDate ? new Date(nextPaymentDate) : null,
    lastPaymentStatus: "paid",
    lastPaymentAt: new Date(),
    updatedAt: new Date(),
  };
  if (customerCode) values.paystackCustomerCode = customerCode;
  if (subscriptionCode) values.paystackSubscriptionCode = subscriptionCode;

  if (existing) {
    await db.update(subscriptions).set(values).where(eq(subscriptions.id, existing.id));
  } else {
    await db.insert(subscriptions).values(values);
  }
}

async function markSubscriptionStatus(subscriptionCode: string, status: string): Promise<void> {
  await db.update(subscriptions)
    .set({ status, updatedAt: new Date() } as any)
    .where(eq((subscriptions as any).paystackSubscriptionCode, subscriptionCode));
}

export function registerPaystackRoutes(app: Express, isAuthenticated: any) {
  // ── Start checkout ───────────────────────────────────────────────────────
  app.post("/api/paystack/initialize", isAuthenticated, async (req: any, res: Response) => {
    if (!isPaystackConfigured()) {
      return res.status(503).json({ error: "payments_unavailable", message: "Payments are not configured." });
    }
    try {
      const userId = req.user.claims.sub;
      const [user] = await db.select({ id: users.id, email: users.email })
        .from(users).where(eq(users.id, userId));
      if (!user?.email) {
        return res.status(400).json({ error: "email_required", message: "An email address is required to subscribe." });
      }

      const appUrl = (process.env.APP_URL || "").replace(/\/+$/, "");
      const data = await paystackFetch("/transaction/initialize", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          plan: planCode(),
          // Paystack requires a non-zero amount on initialize even when a plan
          // is supplied ("Invalid Amount Sent" otherwise). The plan's own
          // amount takes precedence for the actual charge; this is in minor
          // units (R169.00 = 16900 cents).
          amount: 16900,
          currency: "ZAR",
          callback_url: `${appUrl}/subscribe?paystack=return`,
          metadata: { userId, product: "BrainTrack Premium" },
        }),
      });

      return res.json({ authorizationUrl: data.authorization_url, reference: data.reference });
    } catch (err: any) {
      console.error("[paystack] initialize failed:", err?.message ?? err);
      return res.status(502).json({ error: "initialize_failed", message: "Could not start checkout. Please try again." });
    }
  });

  // ── Verify on return (immediate, doesn't wait for the webhook) ───────────
  app.get("/api/paystack/verify/:reference", isAuthenticated, async (req: any, res: Response) => {
    if (!isPaystackConfigured()) {
      return res.status(503).json({ error: "payments_unavailable" });
    }
    try {
      const reference = String(req.params.reference).slice(0, 100);
      const data = await paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`);
      const paid = data?.status === "success";

      if (paid) {
        // Trust the userId we set at initialize time, not anything client-sent.
        const userId = data?.metadata?.userId || req.user.claims.sub;
        await activateSubscription({
          userId,
          customerCode: data?.customer?.customer_code ?? null,
          subscriptionCode: null,
          amountMinor: data?.amount ?? null,
          nextPaymentDate: null,
        });
      }
      return res.json({ paid, status: data?.status ?? "unknown" });
    } catch (err: any) {
      console.error("[paystack] verify failed:", err?.message ?? err);
      return res.status(502).json({ error: "verify_failed" });
    }
  });

  // ── Webhook ──────────────────────────────────────────────────────────────
  // Mounted with a raw body parser in routes.ts so the signature can be checked
  // against the exact bytes Paystack signed.
  app.post("/api/paystack/webhook", async (req: Request, res: Response) => {
    const signature = req.headers["x-paystack-signature"] as string | undefined;
    const raw: Buffer | string = (req as any).rawBody ?? (req.body instanceof Buffer ? req.body : "");

    if (!verifyWebhookSignature(raw, signature)) {
      console.warn("[paystack] webhook rejected — bad signature");
      return res.status(401).json({ error: "invalid_signature" });
    }

    let event: any;
    try {
      event = JSON.parse(raw.toString("utf8" as BufferEncoding));
    } catch {
      return res.status(400).json({ error: "invalid_payload" });
    }

    // Acknowledge fast; Paystack retries on non-2xx.
    res.status(200).json({ received: true });

    try {
      const eventId = String(event?.id ?? event?.data?.id ?? `${event?.event}:${event?.data?.reference}`);
      const fresh = await recordEventOnce(eventId, String(event?.event ?? "unknown"), event);
      if (!fresh) return; // already applied

      const d = event?.data ?? {};
      switch (event?.event) {
        case "charge.success": {
          const userId = d?.metadata?.userId;
          if (userId) {
            await activateSubscription({
              userId,
              customerCode: d?.customer?.customer_code ?? null,
              subscriptionCode: d?.plan?.subscription_code ?? null,
              amountMinor: d?.amount ?? null,
              nextPaymentDate: null,
            });
          }
          break;
        }
        case "subscription.create": {
          const userId = d?.metadata?.userId;
          if (userId) {
            await activateSubscription({
              userId,
              customerCode: d?.customer?.customer_code ?? null,
              subscriptionCode: d?.subscription_code ?? null,
              amountMinor: d?.amount ?? null,
              nextPaymentDate: d?.next_payment_date ?? null,
            });
          }
          break;
        }
        case "invoice.payment_failed":
          if (d?.subscription?.subscription_code) {
            await markSubscriptionStatus(d.subscription.subscription_code, "past_due");
          }
          break;
        case "subscription.disable":
        case "subscription.not_renew":
          if (d?.subscription_code) {
            await markSubscriptionStatus(d.subscription_code, "cancelled");
          }
          break;
        default:
          break; // recorded, no action
      }
    } catch (err: any) {
      console.error("[paystack] webhook processing failed:", err?.message ?? err);
    }
  });
}
