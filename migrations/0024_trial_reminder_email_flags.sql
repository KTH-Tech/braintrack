-- Task #666 — Trial reminder email dedup flags
-- Separate from the push flags so the nightly job can send at most one
-- Day-13 and one Day-14 email per trial regardless of push delivery.

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS trial_reminder_email_d13_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trial_reminder_email_d14_sent BOOLEAN DEFAULT FALSE;
