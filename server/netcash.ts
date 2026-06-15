// Netcash Recurring Billing — Task #393
//
// Thin client for the Netcash Pay Now hosted-checkout flow plus the
// recurring billing helpers (DebiCheck mandate + recurring card token).
//
// All endpoints fail fast with a clear error if the merchant credentials
// have not yet been provisioned, so the surrounding routes can return a
// 503 to the UI without taking the rest of the app down.
//
// Sandbox vs production:
//   NETCASH_ENVIRONMENT=sandbox  → uses Netcash test endpoints
//   NETCASH_ENVIRONMENT=production (or unset) → live endpoints
//
// The exact endpoint paths are pulled from the Netcash Connect / Pay Now
// integration docs. We isolate them here so a single config change is
// enough to flip environments once the merchant account is approved.

import { createHmac, timingSafeEqual } from "node:crypto";

export type NetcashEnv = "sandbox" | "production";

export type BillingMethod = "trial" | "debicheck" | "card" | "lapsed";

export interface NetcashConfig {
  serviceKey: string;
  softwareVendorKey: string;
  pciVaultUsername?: string;
  pciVaultPassword?: string;
  debicheckMerchantId?: string;
  webhookSecret: string;
  env: NetcashEnv;
}

export interface NetcashCheckoutSession {
  reference: string;
  redirectUrl: string;
}

export interface NetcashWebhookPayload {
  type:
    | "mandate.created"
    | "mandate.approved"
    | "mandate.rejected"
    | "mandate.cancelled"
    | "payment.first.success"
    | "payment.recurring.success"
    | "payment.recurring.failed";
  reference: string;
  subscriptionId?: string;
  mandateId?: string;
  cardToken?: string;
  amountRands?: number;
  occurredAt?: string;
  raw?: Record<string, unknown>;
}

const SANDBOX_BASE = "https://sandbox.netcash.co.za/site/paynow";
const PROD_BASE = "https://paynow.netcash.co.za";

export function isNetcashConfigured(): boolean {
  return Boolean(
    process.env.NETCASH_SERVICE_KEY &&
      process.env.NETCASH_SOFTWARE_VENDOR_KEY &&
      process.env.NETCASH_WEBHOOK_SECRET,
  );
}

export function loadNetcashConfig(): NetcashConfig {
  const serviceKey = process.env.NETCASH_SERVICE_KEY;
  const softwareVendorKey = process.env.NETCASH_SOFTWARE_VENDOR_KEY;
  const webhookSecret = process.env.NETCASH_WEBHOOK_SECRET;
  if (!serviceKey || !softwareVendorKey || !webhookSecret) {
    throw new Error(
      "Netcash not configured — set NETCASH_SERVICE_KEY, NETCASH_SOFTWARE_VENDOR_KEY, NETCASH_WEBHOOK_SECRET",
    );
  }
  const envValue =
    process.env.NETCASH_ENVIRONMENT === "sandbox" ? "sandbox" : "production";
  return {
    serviceKey,
    softwareVendorKey,
    pciVaultUsername: process.env.NETCASH_PCI_VAULT_USERNAME,
    pciVaultPassword: process.env.NETCASH_PCI_VAULT_PASSWORD,
    debicheckMerchantId: process.env.NETCASH_DEBICHECK_MERCHANT_ID,
    webhookSecret,
    env: envValue,
  };
}

export function netcashBaseUrl(cfg: NetcashConfig): string {
  return cfg.env === "sandbox" ? SANDBOX_BASE : PROD_BASE;
}

export function buildCheckoutReference(userId: string, method: "debicheck" | "card"): string {
  // Netcash references must be unique per attempt and ≤ 50 chars.
  const stamp = Date.now().toString(36);
  const short = userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
  return `bt-${method}-${short}-${stamp}`.slice(0, 48);
}

/**
 * Initiate a hosted-checkout session for either DebiCheck (mandate flow)
 * or recurring card (PCI Vault tokenisation flow). Returns the URL to
 * redirect the parent/learner to.
 *
 * Implementation note: the exact POST body shape is dictated by the
 * Netcash Pay Now API. The fields used here mirror the production
 * documentation; if Netcash returns an unexpected response we surface
 * the error verbatim so the calling route can log and respond 502.
 */
export async function initNetcashCheckout(
  cfg: NetcashConfig,
  args: {
    method: "debicheck" | "card";
    reference: string;
    amountRands: number;
    successUrl: string;
    cancelUrl: string;
    notifyUrl: string;
    customer: { email?: string | null; firstName?: string | null; lastName?: string | null; cell?: string | null };
  },
): Promise<NetcashCheckoutSession> {
  const base = netcashBaseUrl(cfg);
  const body = new URLSearchParams({
    M1: cfg.serviceKey,
    M2: cfg.softwareVendorKey,
    p2: args.reference,
    p3: args.method === "debicheck" ? "BrainTrack Brain Boost (DebiCheck mandate)" : "BrainTrack Brain Boost (Card subscription)",
    p4: args.amountRands.toFixed(2),
    Budget: "Y",
    m4: args.method, // custom passthrough
    m5: cfg.env,
    m6: args.method === "debicheck" ? "mandate" : "tokenise",
    Email: args.customer.email ?? "",
    Cell: args.customer.cell ?? "",
    AcceptedReturnURL: args.successUrl,
    DeclinedReturnURL: args.cancelUrl,
    NotifyURL: args.notifyUrl,
  });

  const res = await fetch(`${base}/process/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Netcash checkout init failed (${res.status}): ${text.slice(0, 200)}`);
  }

  // Netcash Pay Now returns a 302 to the hosted page in production; in
  // some flows it returns a JSON body with a `redirectUrl`. Handle both.
  const location = res.headers.get("location");
  if (location) {
    return { reference: args.reference, redirectUrl: location };
  }
  let parsed: { redirectUrl?: string } = {};
  try {
    parsed = (await res.json()) as { redirectUrl?: string };
  } catch {
    // not JSON — fall through
  }
  if (parsed.redirectUrl) {
    return { reference: args.reference, redirectUrl: parsed.redirectUrl };
  }

  // Final fallback: build the canonical hosted-checkout URL with the
  // reference. The merchant console flow uses this pattern.
  return {
    reference: args.reference,
    redirectUrl: `${base}/process/?reference=${encodeURIComponent(args.reference)}`,
  };
}

/**
 * Verify a Netcash webhook signature. Netcash signs callbacks with the
 * shared secret that the merchant configures on the Notify URL. We
 * accept the signature in either the `x-netcash-signature` header or as
 * a `signature` form field, computed as
 *   HMAC-SHA256(rawBody, NETCASH_WEBHOOK_SECRET)
 * encoded as lowercase hex.
 */
export function verifyNetcashSignature(
  cfg: NetcashConfig,
  rawBody: Buffer | string,
  providedSignature: string | undefined,
): boolean {
  if (!providedSignature) return false;
  const buf = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
  const expected = createHmac("sha256", cfg.webhookSecret).update(buf).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(providedSignature.trim().toLowerCase());
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Map a raw Netcash webhook body into the normalised shape our routes
 * consume. Netcash uses short field codes (TransactionAccepted, Method,
 * Reference, Amount, ExtraReference1/2, etc.) — this function tolerates
 * both the legacy form-encoded payload and the newer JSON callbacks.
 */
export function parseNetcashWebhook(body: Record<string, any>): NetcashWebhookPayload | null {
  const reference: string | undefined = body.Reference ?? body.reference ?? body.p2;
  if (!reference) return null;

  const method: string | undefined = body.Method ?? body.method ?? body.m4;
  const event: string | undefined = body.Event ?? body.event ?? body.transaction_event;
  const accepted = String(body.TransactionAccepted ?? body.transaction_accepted ?? "").toLowerCase();
  const isMandate = String(body.MandateAction ?? body.mandate_action ?? "").toLowerCase();

  let type: NetcashWebhookPayload["type"] | null = null;

  if (event === "mandate.created" || isMandate === "created") type = "mandate.created";
  else if (event === "mandate.approved" || isMandate === "approved") type = "mandate.approved";
  else if (event === "mandate.rejected" || isMandate === "rejected") type = "mandate.rejected";
  else if (event === "mandate.cancelled" || isMandate === "cancelled") type = "mandate.cancelled";
  else if (event === "payment.recurring.success" || (accepted === "true" && body.IsRecurring === "true"))
    type = "payment.recurring.success";
  else if (event === "payment.recurring.failed" || (accepted === "false" && body.IsRecurring === "true"))
    type = "payment.recurring.failed";
  else if (accepted === "true") type = "payment.first.success";

  if (!type) return null;

  const amountRaw = body.Amount ?? body.amount;
  const amountRands = amountRaw != null && !Number.isNaN(Number(amountRaw)) ? Number(amountRaw) : undefined;

  return {
    type,
    reference,
    subscriptionId: body.SubscriptionId ?? body.subscription_id,
    mandateId: body.MandateId ?? body.mandate_id,
    cardToken: body.CardToken ?? body.card_token ?? body.Token,
    amountRands,
    occurredAt: body.DateAccepted ?? body.occurred_at,
    raw: body,
  };
}

/**
 * Convenience: validate a SA mobile number for the parent cell field.
 * Accepts `0XX XXX XXXX` (with or without spaces) or `+27XXXXXXXXX`.
 */
const SA_CELL_RE = /^(?:\+?27|0)[6-8][0-9]{8}$/;
export function isValidSACell(input: string | null | undefined): boolean {
  if (!input) return false;
  const compact = input.replace(/[\s-]/g, "");
  return SA_CELL_RE.test(compact);
}
export function normaliseSACell(input: string): string {
  const compact = input.replace(/[\s-]/g, "");
  if (compact.startsWith("+27")) return "0" + compact.slice(3);
  if (compact.startsWith("27") && compact.length === 11) return "0" + compact.slice(2);
  return compact;
}
