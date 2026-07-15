/**
 * server/resend-client.ts — Replit-managed Resend connector
 *
 * Credential resolution order:
 *  1. RESEND_API_KEY secret — explicit key; works in both dev and production deployments.
 *  2. Replit connectors proxy (REPLIT_CONNECTORS_HOSTNAME) — used in dev when the
 *     Replit Resend connector is wired.
 *
 * Always call getUncachableResendClient() fresh — tokens from the connector proxy
 * expire and must not be cached between requests.
 *
 * Sender domain: kth-tech.com must be verified in the Resend dashboard.
 * Steps (one-time, done by account owner):
 *   1. resend.com → Domains → Add Domain → enter "kth-tech.com"
 *   2. Add the three DNS records Resend shows (SPF TXT, DKIM CNAME ×2)
 *      to your DNS provider for kth-tech.com
 *   3. Click "Verify" in the Resend dashboard — status turns "Verified"
 *   4. Emails will then send from learn@kth-tech.com with no "via resend.dev" warning
 */

import { Resend } from "resend";

interface ResendConnectionSettings {
  api_key: string;
}

interface ResendConnection {
  settings: ResendConnectionSettings;
}

interface ConnectorResponse {
  items?: ResendConnection[];
}

async function getCredentialsFromConnector(): Promise<{ apiKey: string }> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!hostname || !xReplitToken) {
    throw new Error("Resend connector not available");
  }

  const response = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Resend connector request failed");
  }
  const data = (await response.json()) as ConnectorResponse;
  const connection = data.items?.[0];

  if (!connection?.settings?.api_key) {
    throw new Error("Resend connector returned no credentials");
  }

  return { apiKey: connection.settings.api_key };
}

async function getCredentials(): Promise<{ apiKey: string }> {
  // 1. Prefer an explicit RESEND_API_KEY secret (required in production deployments).
  const manualKey = process.env.RESEND_API_KEY;
  if (manualKey) {
    return { apiKey: manualKey };
  }

  // 2. Fall back to the Replit connector proxy (dev environment).
  try {
    return await getCredentialsFromConnector();
  } catch (err) {
    throw new Error("Resend not connected");
  }
}

export async function getUncachableResendClient(): Promise<{ client: Resend }> {
  const { apiKey } = await getCredentials();
  return { client: new Resend(apiKey) };
}
