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
import { paymentLimiter } from "./middleware/payment-limiter";
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

export async function paystackFetch(path: string, init?: RequestInit): Promise<any> {
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
export async function recordEventOnce(eventId: string, eventType: string, payload: unknown): Promise<boolean> {
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

/**
 * Parent card-capture success (R1.00 verification charge with
 * metadata.purpose === "card_capture"). Stores the reusable Paystack
 * authorization + customer codes on the learner's subscription row, marks
 * parental consent granted, and starts the 14-day trial. The trial only ever
 * starts here — a minor can never self-activate it.
 *
 * Idempotent: safe to run from both the return-URL verify endpoint and the
 * webhook. An already-active subscription is never downgraded back to trial;
 * an existing running trial keeps its original trialEndsAt.
 */
export async function applyCardCaptureSuccess(opts: {
  userId: string;
  parentEmail?: string | null;
  authorizationCode?: string | null;
  customerCode?: string | null;
}): Promise<{ trialStarted: boolean; trialEndsAt: Date | null }> {
  const { userId, parentEmail, authorizationCode, customerCode } = opts;

  const [existing] = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  // Never demote an active/paid subscription; just make sure the codes stick.
  const keepExistingTrial = existing &&
    (existing.status === "trial" || existing.status === "trialing") &&
    existing.trialEndsAt && existing.trialEndsAt.getTime() > now.getTime() &&
    Boolean((existing as any).paystackAuthorizationCode);
  const alreadyActive = existing && existing.status === "active";

  const values: any = {
    updatedAt: now,
  };
  if (authorizationCode) values.paystackAuthorizationCode = authorizationCode;
  if (customerCode) values.paystackCustomerCode = customerCode;
  if (parentEmail) values.parentEmail = parentEmail;
  values.parentConsent = true;
  values.parentConsentDate = existing?.parentConsentDate ?? now;

  let trialStarted = false;
  if (!alreadyActive && !keepExistingTrial) {
    // Consent + card are both in hand → the 14-day trial starts NOW.
    values.status = "trial"; // "trial" is the app-wide trialing status (see storage.hasActiveSubscription)
    values.plan = existing?.plan ?? "brain_boost";
    values.priceRands = 169;
    values.billingMethod = "paystack";
    values.paymentProvider = "paystack";
    values.startDate = existing?.startDate ?? now;
    values.trialEndsAt = trialEndsAt;
    values.endDate = trialEndsAt;
    trialStarted = true;
  }

  if (existing) {
    await db.update(subscriptions).set(values).where(eq(subscriptions.id, existing.id));
  } else {
    await db.insert(subscriptions).values({
      userId,
      userRole: "learner",
      ...values,
    });
  }

  // Consent flags on the learner row — the source of truth for consent gates.
  const userPatch: any = {
    parentConsentGranted: true,
    parentConsentGrantedAt: now,
    updatedAt: now,
  };
  if (parentEmail) userPatch.parentEmail = parentEmail.toLowerCase();
  await db.update(users).set(userPatch).where(eq(users.id, userId));

  return {
    trialStarted,
    trialEndsAt: trialStarted ? trialEndsAt : (existing?.trialEndsAt ?? null),
  };
}

async function markSubscriptionStatus(subscriptionCode: string, status: string): Promise<void> {
  await db.update(subscriptions)
    .set({ status, updatedAt: new Date() } as any)
    .where(eq((subscriptions as any).paystackSubscriptionCode, subscriptionCode));
}

export function registerPaystackRoutes(app: Express, isAuthenticated: any) {
  // ── Start checkout ───────────────────────────────────────────────────────
  app.post("/api/paystack/initialize", isAuthenticated, paymentLimiter, async (req: any, res: Response) => {
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
          const purpose = d?.metadata?.purpose;
          if (purpose === "card_capture") {
            // R1.00 parent card verification — store the authorization and
            // start the 14-day trial. NEVER treat this as a paid activation.
            if (userId) {
              await applyCardCaptureSuccess({
                userId,
                parentEmail: d?.metadata?.parentEmail ?? d?.customer?.email ?? null,
                authorizationCode: d?.authorization?.authorization_code ?? null,
                customerCode: d?.customer?.customer_code ?? null,
              });
            }
            break;
          }
          if (purpose === "trial_conversion") {
            // Day-14 autocharge — applied synchronously by /api/cron/charge-trials
            // (guarded by recordEventOnce there). The webhook is a no-op so the
            // same charge is never double-applied.
            break;
          }
          if (purpose === "admin_test") {
            // Admin dashboard "test payment" smoke-check. Intentionally does
            // NOTHING to any subscription — it just proves Paystack →
            // webhook → this handler is wired end-to-end. The R1 stays with
            // Paystack until the admin refunds it in the Paystack dashboard.
            console.log(`[paystack] admin_test smoke charge succeeded, reference=${d?.reference}`);
            break;
          }
          // KTH Tech runs several products/plans through this one Paystack
          // account. This webhook URL only ever receives BrainTrack events
          // because it's registered against BrainTrack's own plan-scoped
          // Paystack integration — but we still render purely off the plan
          // code rather than trusting an arbitrary userId in metadata, so a
          // charge for any other KTH Tech plan can never activate a
          // BrainTrack subscription.
          const eventPlanCode = d?.plan?.plan_code ?? null;
          if (userId && eventPlanCode === planCode()) {
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
          const eventPlanCode = d?.plan?.plan_code ?? null;
          if (userId && eventPlanCode === planCode()) {
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
