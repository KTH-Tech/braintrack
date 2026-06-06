-- Task #771: track when the parent's SuccessScreen last polled the link-status
-- endpoint. The Twilio status webhook uses this as a "browser still here" probe:
-- if a failure/undelivered event arrives and the parent is actively polling
-- (last poll within 15s), no push is sent because the open page will already
-- surface the amber banner. Otherwise we push a bilingual reminder.
ALTER TABLE onboarding_link_tokens
  ADD COLUMN IF NOT EXISTS last_polled_at timestamp;
