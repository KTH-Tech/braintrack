-- Migration 0035_messaging_infra
--
-- Additive scaffolding for the Twilio trial-lifecycle nudges. Nothing here is
-- destructive: every ALTER uses IF NOT EXISTS, and the new table is guarded
-- with CREATE TABLE IF NOT EXISTS. Safe to run more than once.
--
-- Deploy order after Twilio env vars land in Render:
--   1. Apply this migration (`psql < migrations/0035_messaging_infra.sql`).
--   2. Set TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_SA_NUMBER /
--      TWILIO_WHATSAPP_FROM / CRON_SECRET in the Render dashboard.
--   3. Verify /api/cron/nudges with `{ "dryRun": true }` first, then wire the
--      live cron.

-- Parent opt-in for WhatsApp nudges. Defaults FALSE so no one gets
-- surprise-messaged; a toggle in Settings flips this to TRUE.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN NOT NULL DEFAULT false;

-- Trial start marker. `startDate` already carries this value on new trials
-- (see server/storage.ts::startTrial) but subscriptions that pre-date this
-- migration store the trial start indirectly via trial_ends_at - 14 days.
-- Adding the dedicated column lets the messaging cron read one field and
-- lets a future report break the "start" concept away from any generic
-- "start" the subscription lifecycle uses for paid rows.
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP;

-- Backfill trial_started_at for rows already in flight so the cron doesn't
-- skip them. Prefer start_date; fall back to trial_ends_at - 14 days.
UPDATE subscriptions
   SET trial_started_at = COALESCE(start_date, trial_ends_at - INTERVAL '14 days')
 WHERE trial_started_at IS NULL
   AND status IN ('trial', 'trialing')
   AND trial_ends_at IS NOT NULL;

-- Twilio delivery audit + idempotency log. One row per (user, template) is
-- enforced by the unique index — the same nudge cannot be sent twice to the
-- same recipient, even if a cron fires more than once on the day it comes
-- due.
CREATE TABLE IF NOT EXISTS messaging_sends (
  id            SERIAL PRIMARY KEY,
  user_id       VARCHAR NOT NULL,
  template_key  TEXT    NOT NULL,
  channel       TEXT    NOT NULL,           -- 'whatsapp' | 'sms' | 'none'
  delivered     BOOLEAN NOT NULL DEFAULT false,
  message_sid   TEXT,
  to_phone      TEXT,
  error_code    TEXT,
  sent_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS messaging_sends_user_template_uniq
  ON messaging_sends (user_id, template_key);

CREATE INDEX IF NOT EXISTS messaging_sends_sent_at_idx
  ON messaging_sends (sent_at);
