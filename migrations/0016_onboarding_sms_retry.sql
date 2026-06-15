-- Task #425: add retry_count to onboarding_link_tokens so the auto-resend
-- job can track how many retry generations have been issued for each failed
-- delivery and cap them at 2 retries per original send.
ALTER TABLE onboarding_link_tokens
  ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0;
