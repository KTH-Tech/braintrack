// PayFast Recurring Subscription — Task #440
//
// Handles the PayFast hosted-checkout flow for monthly Brain Boost
// subscriptions (R169/month, subscription_type=1, frequency=3, cycles=0).
//
// PayFast ITN (Instant Transaction Notification) verification follows the
// official PayFast spec: sort params alphabetically, concatenate as a
// query string, append the passphrase (if set), then MD5-hash the result.
//
// Sandbox vs live:
//   PAYFAST_SANDBOX=true  → uses sandbox.payfast.co.za
//   (unset or false)      → uses www.payfast.co.za
//
// The module is deliberately self-contained so the surrounding routes can
// do a simple `isPayfastConfigured()` guard and fail fast with a 503 when
// the credentials have not yet been provisioned.

import { createHash } from "node:crypto";

const PAYFAST_LIVE_URL = "https://www.payfast.co.za/eng/process";
const PAYFAST_SANDBOX_URL = "https://sandbox.payfast.co.za/eng/process";

// Validation URL used to verify ITN authenticity
const PAYFAST_LIVE_VALIDATE = "https://www.payfast.co.za/eng/query/validate";
const PAYFAST_SANDBOX_VALIDATE = "https://sandbox.payfast.co.za/eng/query/validate";

export interface PayfastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string | undefined;
  sandbox: boolean;
}

export function isPayfastConfigured(): boolean {
  return Boolean(
    process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY,
  );
}

export function loadPayfastConfig(): PayfastConfig {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  if (!merchantId || !merchantKey) {
    throw new Error(
      "PayFast not configured — set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY",
    );
  }
  return {
    merchantId,
    merchantKey,
    passphrase: process.env.PAYFAST_PASSPHRASE || undefined,
    sandbox: process.env.PAYFAST_SANDBOX === "true",
  };
}

export function payfastCheckoutUrl(cfg: PayfastConfig): string {
  return cfg.sandbox ? PAYFAST_SANDBOX_URL : PAYFAST_LIVE_URL;
}

export function payfastValidateUrl(cfg: PayfastConfig): string {
  return cfg.sandbox ? PAYFAST_SANDBOX_VALIDATE : PAYFAST_LIVE_VALIDATE;
}

/**
 * Build an MD5 signature for a PayFast param set.
 * Steps (per PayFast docs):
 *   1. Sort params alphabetically by key.
 *   2. URL-encode each value.
 *   3. Join as key=value&key=value query string.
 *   4. Append &passphrase=<encoded> if set.
 *   5. MD5-hash the resulting string.
 */
export function buildPayfastSignature(
  params: Record<string, string>,
  passphrase: string | undefined,
): string {
  const sorted = Object.keys(params)
    .filter((k) => k !== "signature")
    .sort();

  const parts = sorted.map(
    (k) => `${k}=${encodeURIComponent(params[k] ?? "").replace(/%20/g, "+")}`,
  );
  let str = parts.join("&");

  if (passphrase) {
    str += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`;
  }

  return createHash("md5").update(str).digest("hex");
}

export interface PayfastSubscriptionParams {
  checkoutUrl: string;
  params: Record<string, string>;
}

/**
 * Build the signed parameter set for a monthly Brain Boost subscription.
 *
 * subscription_type=1  → recurring subscription
 * frequency=3          → monthly
 * cycles=0             → indefinite (until cancelled)
 * recurring_amount     → amount charged each cycle after the first
 */
export function buildPayfastSubscriptionParams(
  cfg: PayfastConfig,
  args: {
    mPaymentId: string;       // our unique reference (userId-based)
    amountRands: number;       // 169
    itemName: string;
    returnUrl: string;
    cancelUrl: string;
    notifyUrl: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  },
): PayfastSubscriptionParams {
  const amount = args.amountRands.toFixed(2);

  const params: Record<string, string> = {
    merchant_id: cfg.merchantId,
    merchant_key: cfg.merchantKey,
    return_url: args.returnUrl,
    cancel_url: args.cancelUrl,
    notify_url: args.notifyUrl,
    m_payment_id: args.mPaymentId,
    amount,
    item_name: args.itemName,
    // Subscription fields
    subscription_type: "1",
    frequency: "3",    // monthly
    cycles: "0",       // indefinite
    recurring_amount: amount,
  };

  if (args.email) params.email_address = args.email;
  if (args.firstName) params.name_first = args.firstName;
  if (args.lastName) params.name_last = args.lastName;

  const signature = buildPayfastSignature(params, cfg.passphrase);
  params.signature = signature;

  return {
    checkoutUrl: payfastCheckoutUrl(cfg),
    params,
  };
}

/**
 * Verify a PayFast ITN notification.
 *
 * The full verification flow (per PayFast docs):
 *   Step 1 — Reconstruct signature from ITN fields (excluding `signature`).
 *   Step 2 — Compare with the `signature` field in the payload.
 *   Step 3 — (Optional but recommended) POST raw body to the PayFast validate
 *             endpoint to confirm authenticity with PayFast's servers.
 *
 * We perform Steps 1 & 2 here. Step 3 (server-side validate call) is done
 * separately in the route handler so the route can respond 200 quickly and
 * log any validation failures without blocking.
 */
export function verifyPayfastItnSignature(
  body: Record<string, string>,
  cfg: PayfastConfig,
): boolean {
  const provided = body.signature;
  if (!provided) return false;

  const paramsWithoutSig = Object.fromEntries(
    Object.entries(body).filter(([k]) => k !== "signature"),
  ) as Record<string, string>;

  const expected = buildPayfastSignature(paramsWithoutSig, cfg.passphrase);
  return expected === provided;
}

/**
 * Ask PayFast's validation endpoint whether this ITN is genuine.
 * Returns true if PayFast responds with "VALID".
 * Silently returns false on network errors so the caller can decide
 * how to handle validation failures.
 */
export async function validateItnWithPayfast(
  cfg: PayfastConfig,
  rawBody: string,
): Promise<boolean> {
  try {
    const url = payfastValidateUrl(cfg);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: rawBody,
    });
    const text = await res.text();
    return text.trim().toUpperCase() === "VALID";
  } catch (err) {
    console.error("[payfast] ITN validate call failed:", err);
    return false;
  }
}

export interface PayfastItnEvent {
  paymentStatus: string;       // COMPLETE | FAILED | CANCELLED | etc.
  mPaymentId: string;          // our reference
  pfPaymentId: string;         // PayFast's own payment ID
  token: string | undefined;   // subscription token (SUBSCR_PAYMENT / COMPLETE with sub)
  amountGross: number | undefined;
  raw: Record<string, string>;
}

/**
 * Parse a raw PayFast ITN body into our normalised shape.
 * Returns null if the body doesn't have the minimum required fields.
 */
export function parsePayfastItn(body: Record<string, string>): PayfastItnEvent | null {
  const paymentStatus = body.payment_status;
  const mPaymentId = body.m_payment_id;
  const pfPaymentId = body.pf_payment_id;

  if (!paymentStatus || !mPaymentId) return null;

  const amountRaw = body.amount_gross;
  const amountGross =
    amountRaw != null && !Number.isNaN(Number(amountRaw))
      ? Number(amountRaw)
      : undefined;

  return {
    paymentStatus,
    mPaymentId,
    pfPaymentId: pfPaymentId ?? "",
    token: body.token || undefined,
    amountGross,
    raw: body,
  };
}
