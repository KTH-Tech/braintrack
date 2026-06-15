-- Task #393 — Netcash recurring billing migration
--
-- Adds the columns required for the Netcash DebiCheck + recurring-card flow,
-- the 14-day free trial lifecycle, the 3-day grace period for failed
-- renewals, and the Day 13 / Day 14 trial-reminder flags.
--
-- Safe to run on existing databases: every ALTER uses IF NOT EXISTS and
-- every index uses IF NOT EXISTS so re-running is a no-op.
-- The legacy yoco_* / ozow_* columns are intentionally LEFT IN PLACE for
-- historical rows; new code never writes to them.

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS netcash_subscription_id    text,
  ADD COLUMN IF NOT EXISTS netcash_mandate_id         text,
  ADD COLUMN IF NOT EXISTS netcash_card_token         text,
  ADD COLUMN IF NOT EXISTS netcash_checkout_ref       text,
  ADD COLUMN IF NOT EXISTS billing_method             text DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS pending_method             text,
  ADD COLUMN IF NOT EXISTS trial_ends_at              timestamp,
  ADD COLUMN IF NOT EXISTS next_renewal_at            timestamp,
  ADD COLUMN IF NOT EXISTS grace_period_ends_at       timestamp,
  ADD COLUMN IF NOT EXISTS last_payment_status        text,
  ADD COLUMN IF NOT EXISTS last_payment_at            timestamp,
  ADD COLUMN IF NOT EXISTS trial_reminder_d13_sent    boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_reminder_d14_sent    boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_cell                text;

-- Default new rows to the Netcash provider; pre-existing rows keep their
-- prior provider so historical billing reports stay accurate.
ALTER TABLE subscriptions
  ALTER COLUMN payment_provider SET DEFAULT 'netcash';

-- Lookup index used by the webhook handler to find the subscription a
-- given Netcash callback belongs to.
CREATE INDEX IF NOT EXISTS subscriptions_netcash_checkout_ref_idx
  ON subscriptions (netcash_checkout_ref);

-- Indexes powering the Admin Billing dashboard filters
-- ("Trials ending soon" and "Lapsed in last N days").
CREATE INDEX IF NOT EXISTS subscriptions_trial_ends_at_idx
  ON subscriptions (trial_ends_at);
CREATE INDEX IF NOT EXISTS subscriptions_grace_period_ends_at_idx
  ON subscriptions (grace_period_ends_at);
