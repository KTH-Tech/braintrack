// ─────────────────────────────────────────────────────────────────────────────
// BrainTrack-specific WhatsApp inbound handler — the ONLY app-specific piece.
//
// Everything under server/whatsapp/{client,webhook}.ts is generic Graph-API
// plumbing. THIS file is where BrainTrack decides what an inbound message means:
//   • opt-out keyword  → flip users.whatsapp_opt_in=false, confirm, stop.
//   • known learner    → answer with Rizz (role-scoped to THAT learner's data)
//                        and send the reply back over WhatsApp.
//   • unknown number   → a single neutral "link your account" nudge that does
//                        NOT reveal whether an account exists.
//
// Another product would write its OWN handler like this and pass it to
// registerWhatsAppWebhook — it would not touch this file.
//
// SECURITY: inbound text is untrusted. The learner identity is derived ONLY
// from the phone-number → users row lookup here; Rizz then re-reads that user's
// own data by id. Nothing the sender types can change who they are (Rizz's own
// guardrails also enforce this). We never log tokens or full message bodies.
// ─────────────────────────────────────────────────────────────────────────────

import type OpenAI from "openai";
import { db } from "../db";
import { sql, inArray } from "drizzle-orm";
import { users } from "@shared/models/auth";
import { isAdminEmail } from "../replit_integrations/auth/replitAuth";
import { answerRizzMessage, type RizzIdentity, type RizzRole } from "../rizz";
import { sendWhatsAppText, type InboundTextMessage, type WhatsAppConfig } from "./client";
import type { InboundHandler } from "./webhook";

// Common opt-out keywords (case-insensitive, whole message). Meta/WhatsApp
// convention + a couple of SA-friendly variants.
const OPT_OUT_KEYWORDS = new Set([
  "stop",
  "stop all",
  "unsubscribe",
  "cancel",
  "end",
  "quit",
  "optout",
  "opt out",
  "opt-out",
]);

function isOptOutKeyword(text: string): boolean {
  return OPT_OUT_KEYWORDS.has(text.trim().toLowerCase());
}

/**
 * Candidate DB representations of a +E.164 number. `users.phone` is stored
 * inconsistently across signup paths (local `0…`, `27…`, or `+27…`), so we
 * match against all plausible forms rather than assuming one.
 */
function phoneCandidates(e164: string): string[] {
  const set = new Set<string>();
  const digits = (e164.startsWith("+") ? e164.slice(1) : e164).replace(/\D/g, "");
  if (!digits) return [];
  set.add(`+${digits}`); // +27831234567
  set.add(digits); // 27831234567
  if (digits.startsWith("27")) set.add(`0${digits.slice(2)}`); // 0831234567
  return [...set];
}

interface LearnerRow {
  id: string;
  email: string | null;
  firstName: string | null;
  grade: number | null;
  role: string | null;
  preferredLanguage: string | null;
}

async function lookupUserByPhone(fromE164: string): Promise<LearnerRow | null> {
  const candidates = phoneCandidates(fromE164);
  if (candidates.length === 0) return null;
  try {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        grade: users.grade,
        role: users.role,
        preferredLanguage: users.preferredLanguage,
      })
      .from(users)
      .where(inArray(users.phone, candidates))
      .limit(1);
    return rows[0] ?? null;
  } catch (err: any) {
    console.error(`[whatsapp] phone lookup failed: ${err?.message ?? String(err)}`);
    return null;
  }
}

/** Mirror Rizz's role derivation (see resolveRizzIdentity). */
function resolveRole(email: string | null, role: string | null): RizzRole {
  if (isAdminEmail(email) || role === "admin") return "admin";
  if (role === "parent") return "parent";
  return "learner";
}

/**
 * Flip whatsapp_opt_in=false for every row matching this number. Raw SQL
 * because the column is added by migration and NOT declared in the Drizzle
 * users schema (mirrors nudge-cron.ts / routes.ts). Column-missing (42703) is
 * swallowed — nothing to opt out of yet.
 */
async function optOutByPhone(fromE164: string): Promise<void> {
  const candidates = phoneCandidates(fromE164);
  if (candidates.length === 0) return;
  try {
    await db.execute(sql`
      UPDATE users
         SET whatsapp_opt_in = false, updated_at = NOW()
       WHERE phone = ANY(${candidates}::text[])
    `);
  } catch (err: any) {
    if (err?.code !== "42703") {
      console.error(`[whatsapp] opt-out update failed: ${err?.message ?? String(err)}`);
    }
  }
}

/**
 * Build BrainTrack's inbound handler, bound to an OpenAI client. Pass the
 * result to registerWhatsAppWebhook.
 */
export function createBrainTrackWhatsAppHandler(openai: OpenAI): InboundHandler {
  return async (msg: InboundTextMessage, config: WhatsAppConfig): Promise<void> => {
    const from = msg.from; // +E.164
    const text = msg.text.trim();
    if (!text) return;

    // 1) Opt-out — highest priority; must work even for a known learner.
    if (isOptOutKeyword(text)) {
      await optOutByPhone(from);
      await sendWhatsAppText(
        from,
        "You're unsubscribed from BrainTrack WhatsApp messages. Reply anytime to chat again. / Jy is afgemeld van BrainTrack WhatsApp-boodskappe.",
        config,
      );
      return;
    }

    // 2) Identify the learner strictly by their stored phone number.
    const user = await lookupUserByPhone(from);

    if (!user) {
      // Unknown number. Neutral nudge — does NOT confirm or deny an account.
      await sendWhatsAppText(
        from,
        "Hi! To chat with Rizz, your BrainTrack study tutor, on WhatsApp, log in at braintrack.tech and add this number in your account settings.",
        config,
      );
      return;
    }

    // 3) Known learner → Rizz answers, scoped to THIS user's own data only.
    const identity: RizzIdentity = {
      userId: user.id,
      role: resolveRole(user.email, user.role),
      firstName: user.firstName,
      grade: user.grade,
    };
    const isAfrikaans = user.preferredLanguage === "af";

    let answer: string;
    try {
      answer = await answerRizzMessage({
        openai,
        identity,
        question: text.slice(0, 2000),
        isAfrikaans,
      });
    } catch (err: any) {
      console.error(`[whatsapp] Rizz answer failed: ${err?.message ?? String(err)}`);
      answer = isAfrikaans
        ? "Eish, my brein is nou 'n bietjie oorlaai — probeer asseblief oor 'n oomblik weer."
        : "Eish, my brain's a bit overloaded right now — please try again in a moment.";
    }

    await sendWhatsAppText(from, answer, config);
  };
}
