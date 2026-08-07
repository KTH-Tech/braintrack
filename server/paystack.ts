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

/** Exam Season Pass: once-off R550, season access through 15 Dec 2026 (SAST).
 *  Pay-now model: the learner is charged the full R550 immediately on
 *  checkout — no R1 card-capture, no trial. Access runs to the fixed season
 *  end (EXAM_BOOST_END). No recurring billing. */
export const EXAM_BOOST_PRICE_MINOR = 55000; // R550.00 in cents
export const EXAM_BOOST_END = new Date("2026-12-15T23:59:59+02:00");

/** Exam sprints: once-off R250, rolling 6-week (42-day) full access from
 *  purchase. Prelim Sprint (Aug–Sep) and Finals Blitz (Oct–Nov) are the SAME
 *  machine, different label/window. Pay-now: full R250 charged immediately,
 *  no trial, no recurring. */
export const PRELIM_SPRINT_PRICE_MINOR = 25000; // R250.00 in cents
export const FINALS_BLITZ_PRICE_MINOR = 25000;  // R250.00 in cents
export const SPRINT_DAYS = 42; // rolling 6-week access window
export const PRELIM_SPRINT_DAYS = SPRINT_DAYS; // back-compat alias

export async function activateSubscription(opts: {
  userId: string;
  customerCode?: string | null;
  subscriptionCode?: string | null;
  amountMinor?: number | null;
  nextPaymentDate?: string | null;
  /** "premium" (R169/month recurring, default), "exam_boost" (R550 once-off,
   *  season end), or "prelim_sprint" / "finals_blitz" (R250 once-off, +42 days). */
  product?: "premium" | "exam_boost" | "prelim_sprint" | "finals_blitz";
  /** True only when this call flipped the sub from a non-active state into
   *  active (a fresh paid activation) — lets callers fire post-payment
   *  onboarding once, and never on an idempotent replay or a renewal. */
}): Promise<{ newlyActivated: boolean }> {
  const { userId, customerCode, subscriptionCode, amountMinor, nextPaymentDate, product } = opts;
  const isExamBoost = product === "exam_boost";
  const isPrelimSprint = product === "prelim_sprint";
  const isFinalsBlitz = product === "finals_blitz";
  const isSprint = isPrelimSprint || isFinalsBlitz;
  const isOnceOff = isExamBoost || isSprint;
  const [existing] = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  const newlyActivated = !existing || existing.status !== "active";
  const now = new Date();
  const planName = isExamBoost ? "exam_boost" : isFinalsBlitz ? "finals_blitz" : isPrelimSprint ? "prelim_sprint" : "premium";
  const defaultPrice = isExamBoost ? 550 : isSprint ? 250 : 169;

  const values: any = {
    userId,
    userRole: "learner",
    status: "active",
    plan: planName,
    priceRands: amountMinor ? Math.round(amountMinor / 100) : defaultPrice,
    paymentProvider: "paystack",
    billingMethod: "paystack",
    // Idempotent: preserve the original start on a duplicate verify/webhook.
    startDate: (existing as any)?.startDate ?? now,
    // Once-off products never renew; recurring premium carries its next date.
    nextRenewalAt: isOnceOff ? null : nextPaymentDate ? new Date(nextPaymentDate) : null,
    lastPaymentStatus: "paid",
    lastPaymentAt: now,
    updatedAt: now,
  };
  if (isExamBoost) {
    values.endDate = EXAM_BOOST_END;
    // A once-off purchase must clear any trial bookkeeping so no autocharge
    // cron can ever also bill this learner.
    values.trialEndsAt = null;
  } else if (isSprint) {
    // Rolling 6-week access (Prelim Sprint / Finals Blitz). If this learner is
    // ALREADY on an active sprint, preserve the existing window instead of
    // extending it on a duplicate verify/webhook delivery (never demote /
    // re-roll an active sub).
    const alreadyActiveSprint =
      existing && existing.status === "active" &&
      ((existing as any).plan === "prelim_sprint" || (existing as any).plan === "finals_blitz") &&
      (existing as any).endDate;
    values.endDate = alreadyActiveSprint
      ? (existing as any).endDate
      : new Date(now.getTime() + SPRINT_DAYS * 24 * 60 * 60 * 1000);
    values.trialEndsAt = null;
  }
  if (customerCode) values.paystackCustomerCode = customerCode;
  if (subscriptionCode) values.paystackSubscriptionCode = subscriptionCode;

  if (existing) {
    await db.update(subscriptions).set(values).where(eq(subscriptions.id, existing.id));
  } else {
    await db.insert(subscriptions).values(values);
  }
  return { newlyActivated };
}

/**
 * Best-effort post-payment onboarding. Fired after a NEW paid subscription is
 * activated (verify or webhook). Sends the branded welcome email and, when the
 * checkout carried an (untrusted) learnerCell in metadata, the one-time
 * onboarding magic-link. NEVER throws — activation correctness comes first, so
 * every branch swallows its own errors.
 */
async function firePostPaymentOnboarding(opts: {
  userId: string;
  metadata?: Record<string, any> | null;
  baseUrl: string;
}): Promise<void> {
  try {
    const { userId, metadata, baseUrl } = opts;
    const [learner] = await db
      .select({
        email: users.email,
        firstName: users.firstName,
        preferredLanguage: (users as any).preferredLanguage,
      })
      .from(users)
      .where(eq(users.id, userId));
    const lang: "en" | "af" = (learner as any)?.preferredLanguage === "af" ? "af" : "en";
    const base = (baseUrl || "").replace(/\/+$/, "");

    if (learner?.email) {
      try {
        const { sendWelcomeEmail } = await import("./email");
        await sendWelcomeEmail({
          to: learner.email,
          firstName: learner.firstName ?? "",
          language: lang,
          dashboardUrl: `${base}/dashboard`,
        });
      } catch (err: any) {
        console.error("[paystack] post-payment welcome email failed:", err?.message ?? err);
      }
    }

    const rawCell = typeof metadata?.learnerCell === "string" ? metadata.learnerCell : null;
    if (rawCell) {
      try {
        const { isValidSACell, normaliseSACell } = await import("./netcash");
        if (isValidSACell(rawCell)) {
          const { issueAndSendOnboardingLink } = await import("./sms/onboarding-link");
          await issueAndSendOnboardingLink({
            userId,
            learnerCell: normaliseSACell(rawCell),
            language: lang,
            baseUrl: base,
          });
        }
      } catch (err: any) {
        console.error("[paystack] post-payment onboarding link failed:", err?.message ?? err);
      }
    }
  } catch (err: any) {
    console.error("[paystack] firePostPaymentOnboarding threw:", err?.message ?? err);
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
  /** Which offer this trial converts INTO on day 14. "premium" (default) →
   *  R169/month recurring; "exam_boost" → R550 once-off season pass. The only
   *  effect here is which plan the trial row carries, so the day-14 cron
   *  charges the right amount. The 14-day trial window is identical either way. */
  product?: "premium" | "exam_boost";
}): Promise<{ trialStarted: boolean; trialEndsAt: Date | null }> {
  const { userId, parentEmail, authorizationCode, customerCode, product } = opts;
  const isExamBoost = product === "exam_boost";

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
    // Exam Blast tags the trial row plan="exam_boost" so the day-14 cron
    // charges R550 once-off; premium keeps its existing plan and R169.
    values.plan = isExamBoost ? "exam_boost" : (existing?.plan ?? "brain_boost");
    values.priceRands = isExamBoost ? 550 : 169;
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
      // The product is chosen server-side off a whitelisted body flag — the
      // client can pick WHICH product, never the amount. Pay-now for all three:
      // an immediate full charge, no R1 card-capture, no trial.
      const product =
        req.body?.product === "exam_boost" ? "exam_boost"
        : req.body?.product === "prelim_sprint" ? "prelim_sprint"
        : req.body?.product === "finals_blitz" ? "finals_blitz"
        : "premium";

      // Optional onboarding hints — round-tripped through Paystack metadata so
      // post-payment can fire the learner onboarding link/welcome email. NOT
      // trusted for anything security-sensitive: amount, product and access are
      // all server-owned and amount-verified on activation.
      const learnerCell = typeof req.body?.learnerCell === "string" ? req.body.learnerCell.slice(0, 20) : undefined;
      const parentCell = typeof req.body?.parentCell === "string" ? req.body.parentCell.slice(0, 20) : undefined;
      const onboardingMeta: Record<string, unknown> = {};
      if (learnerCell) onboardingMeta.learnerCell = learnerCell;
      if (parentCell) onboardingMeta.parentCell = parentCell;

      const callbackUrl = `${appUrl}/subscribe?paystack=return`;
      let body: Record<string, unknown>;
      if (product === "exam_boost") {
        body = {
          email: user.email,
          // Immediate FULL charge — R550 once-off season pass.
          amount: EXAM_BOOST_PRICE_MINOR,
          currency: "ZAR",
          callback_url: callbackUrl,
          metadata: { userId, ...onboardingMeta, product: "exam_boost", purpose: "exam_boost" },
        };
      } else if (product === "prelim_sprint") {
        body = {
          email: user.email,
          // Immediate FULL charge — R250 once-off, 6-week access.
          amount: PRELIM_SPRINT_PRICE_MINOR,
          currency: "ZAR",
          callback_url: callbackUrl,
          metadata: { userId, ...onboardingMeta, product: "prelim_sprint", purpose: "prelim_sprint" },
        };
      } else if (product === "finals_blitz") {
        body = {
          email: user.email,
          // Immediate FULL charge — R250 once-off, 6-week access (Oct–Nov finals).
          amount: FINALS_BLITZ_PRICE_MINOR,
          currency: "ZAR",
          callback_url: callbackUrl,
          metadata: { userId, ...onboardingMeta, product: "finals_blitz", purpose: "finals_blitz" },
        };
      } else {
        body = {
          email: user.email,
          plan: planCode(),
          // Paystack requires a non-zero amount on initialize even when a plan
          // is supplied ("Invalid Amount Sent" otherwise). The plan's own
          // amount takes precedence for the actual charge; this is in minor
          // units (R169.00 = 16900 cents). Charges immediately + sets up the
          // recurring plan.
          amount: 16900,
          currency: "ZAR",
          callback_url: callbackUrl,
          metadata: { userId, ...onboardingMeta, product: "BrainTrack Premium" },
        };
      }
      const data = await paystackFetch("/transaction/initialize", {
        method: "POST",
        body: JSON.stringify(body),
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

      // A card_capture reference (R1 verification — premium OR exam_boost) must
      // NEVER be activated here: it is not a paid activation. The 14-day trial
      // is started by applyCardCaptureSuccess off the webhook. Guarding this
      // stops an R1 charge from ever being mistaken for a paid subscription.
      if (data?.metadata?.purpose === "card_capture") {
        return res.json({ paid, status: data?.status ?? "unknown", cardCapture: true });
      }

      if (paid) {
        // Trust the userId we set at initialize time, not anything client-sent.
        const userId = data?.metadata?.userId || req.user.claims.sub;
        const meta = data?.metadata ?? {};
        const amount = data?.amount ?? 0;
        // Amount is verified server-side: a once-off product only unlocks when
        // the verified charge actually covers its price. Otherwise → premium.
        let product: "premium" | "exam_boost" | "prelim_sprint" | "finals_blitz" = "premium";
        if (meta.product === "exam_boost" && amount >= EXAM_BOOST_PRICE_MINOR) {
          product = "exam_boost";
        } else if (meta.product === "prelim_sprint" && amount >= PRELIM_SPRINT_PRICE_MINOR) {
          product = "prelim_sprint";
        } else if (meta.product === "finals_blitz" && amount >= FINALS_BLITZ_PRICE_MINOR) {
          product = "finals_blitz";
        }
        const { newlyActivated } = await activateSubscription({
          userId,
          customerCode: data?.customer?.customer_code ?? null,
          subscriptionCode: null,
          amountMinor: amount || null,
          nextPaymentDate: null,
          product,
        });
        // Best-effort onboarding — only on a fresh activation, never blocks the
        // payment confirmation.
        if (newlyActivated) {
          const appUrl = (process.env.APP_URL || "").replace(/\/+$/, "");
          await firePostPaymentOnboarding({ userId, metadata: meta, baseUrl: appUrl });
        }
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
            // metadata.product (set at initialize) decides what day 14 charges:
            // "exam_boost" → R550 once-off; anything else → R169/month premium.
            const captureProduct = d?.metadata?.product === "exam_boost" ? "exam_boost" : "premium";
            if (userId) {
              await applyCardCaptureSuccess({
                userId,
                parentEmail: d?.metadata?.parentEmail ?? d?.customer?.email ?? null,
                authorizationCode: d?.authorization?.authorization_code ?? null,
                customerCode: d?.customer?.customer_code ?? null,
                product: captureProduct,
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
          if (purpose === "exam_boost_conversion") {
            // Day-14 Exam Blast R550 once-off autocharge — also applied
            // synchronously by /api/cron/charge-trials (guarded by its own
            // recordEventOnce). No-op here so it's never double-applied.
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
          if (purpose === "exam_boost") {
            // Once-off R550 Exam Season Pass — season access to 15 Dec, no
            // recurring subscription. Amount is verified server-side so a
            // relabelled cheaper charge can never unlock it.
            if (userId && (d?.amount ?? 0) >= EXAM_BOOST_PRICE_MINOR) {
              const { newlyActivated } = await activateSubscription({
                userId,
                customerCode: d?.customer?.customer_code ?? null,
                subscriptionCode: null,
                amountMinor: d?.amount ?? null,
                nextPaymentDate: null,
                product: "exam_boost",
              });
              if (newlyActivated) {
                const appUrl = (process.env.APP_URL || "").replace(/\/+$/, "");
                await firePostPaymentOnboarding({ userId, metadata: d?.metadata ?? null, baseUrl: appUrl });
              }
            } else {
              console.warn(`[paystack] exam_boost charge ignored — userId=${!!userId}, amount=${d?.amount}`);
            }
            break;
          }
          if (purpose === "prelim_sprint") {
            // Once-off R250 Prelim Sprint — rolling 6-week (42-day) access, no
            // recurring subscription. Amount is verified server-side so a
            // relabelled cheaper charge can never unlock it.
            if (userId && (d?.amount ?? 0) >= PRELIM_SPRINT_PRICE_MINOR) {
              const { newlyActivated } = await activateSubscription({
                userId,
                customerCode: d?.customer?.customer_code ?? null,
                subscriptionCode: null,
                amountMinor: d?.amount ?? null,
                nextPaymentDate: null,
                product: "prelim_sprint",
              });
              if (newlyActivated) {
                const appUrl = (process.env.APP_URL || "").replace(/\/+$/, "");
                await firePostPaymentOnboarding({ userId, metadata: d?.metadata ?? null, baseUrl: appUrl });
              }
            } else {
              console.warn(`[paystack] prelim_sprint charge ignored — userId=${!!userId}, amount=${d?.amount}`);
            }
            break;
          }
          if (purpose === "finals_blitz") {
            // Once-off R250 Finals Blitz — rolling 6-week (42-day) access
            // (Oct–Nov finals), no recurring subscription. Amount is verified
            // server-side so a relabelled cheaper charge can never unlock it.
            if (userId && (d?.amount ?? 0) >= FINALS_BLITZ_PRICE_MINOR) {
              const { newlyActivated } = await activateSubscription({
                userId,
                customerCode: d?.customer?.customer_code ?? null,
                subscriptionCode: null,
                amountMinor: d?.amount ?? null,
                nextPaymentDate: null,
                product: "finals_blitz",
              });
              if (newlyActivated) {
                const appUrl = (process.env.APP_URL || "").replace(/\/+$/, "");
                await firePostPaymentOnboarding({ userId, metadata: d?.metadata ?? null, baseUrl: appUrl });
              }
            } else {
              console.warn(`[paystack] finals_blitz charge ignored — userId=${!!userId}, amount=${d?.amount}`);
            }
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
