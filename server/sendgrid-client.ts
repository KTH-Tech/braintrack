/**
 * server/sendgrid-client.ts — SendGrid email transport
 *
 * Config priority (evaluated on every send — no restart required):
 *  1. system_config table (set via Admin → Email Settings)
 *  2. SENDGRID_API_KEY / EMAIL_FROM / EMAIL_FROM_NAME / EMAIL_REPLY_TO env vars
 *
 * Returns null if no API key is found so callers degrade to { delivery: "not_configured" }.
 */

import sgMail from "@sendgrid/mail";
import { db } from "./db.js";
import { systemConfig } from "@shared/schema";
import { inArray } from "drizzle-orm";

export interface EmailSenderConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
}

const CONFIG_KEYS = [
  "sendgrid_api_key",
  "sendgrid_from_email",
  "sendgrid_from_name",
  "sendgrid_reply_to",
] as const;

/**
 * Returns the live email sender configuration, merging DB config over env vars.
 * Call this on each send so changes take effect without a restart.
 */
export async function getEmailSenderConfig(): Promise<EmailSenderConfig | null> {
  let dbCfg: Record<string, string> = {};
  try {
    const rows = await db
      .select({ key: systemConfig.key, value: systemConfig.value })
      .from(systemConfig)
      .where(inArray(systemConfig.key, [...CONFIG_KEYS]));
    for (const row of rows) {
      if (typeof row.value === "string" && row.value) {
        dbCfg[row.key] = row.value;
      }
    }
  } catch {
    // DB unavailable — fall back to env vars silently
  }

  const apiKey = dbCfg["sendgrid_api_key"] || process.env.SENDGRID_API_KEY || "";
  if (!apiKey) return null;

  return {
    apiKey,
    fromEmail: dbCfg["sendgrid_from_email"] || process.env.EMAIL_FROM || "learn@kth-tech.com",
    fromName: dbCfg["sendgrid_from_name"] || process.env.EMAIL_FROM_NAME || "BrainTrack",
    replyTo: dbCfg["sendgrid_reply_to"] || process.env.EMAIL_REPLY_TO || "",
  };
}

/**
 * Returns an initialised @sendgrid/mail client using the live config,
 * or null if no API key is configured.
 */
export async function getSendGridClient(): Promise<typeof sgMail | null> {
  const cfg = await getEmailSenderConfig();
  if (!cfg) return null;
  sgMail.setApiKey(cfg.apiKey);
  return sgMail;
}
