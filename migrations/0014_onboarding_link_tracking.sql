-- Task #415: track Twilio delivery status callbacks + claim audit trail for
-- onboarding magic-link SMS sends.
ALTER TABLE onboarding_link_tokens
  ADD COLUMN IF NOT EXISTS delivery_updated_at timestamp,
  ADD COLUMN IF NOT EXISTS claimed_from_ip varchar,
  ADD COLUMN IF NOT EXISTS claimed_user_agent text;

CREATE INDEX IF NOT EXISTS onboarding_link_tokens_message_sid_idx
  ON onboarding_link_tokens (message_sid);

CREATE INDEX IF NOT EXISTS onboarding_link_tokens_delivery_status_idx
  ON onboarding_link_tokens (delivery_status);
