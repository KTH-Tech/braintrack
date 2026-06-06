-- Task #412: one-time-use signed onboarding links sent to learner cell via SMS
CREATE TABLE IF NOT EXISTS onboarding_link_tokens (
  jti varchar PRIMARY KEY,
  user_id varchar NOT NULL,
  sent_to varchar NOT NULL,
  channel varchar NOT NULL DEFAULT 'sms',
  message_sid varchar,
  delivery_status varchar NOT NULL DEFAULT 'pending',
  delivery_error text,
  created_at timestamp NOT NULL DEFAULT now(),
  expires_at timestamp NOT NULL,
  used_at timestamp
);

CREATE INDEX IF NOT EXISTS onboarding_link_tokens_user_idx
  ON onboarding_link_tokens (user_id);

CREATE INDEX IF NOT EXISTS onboarding_link_tokens_created_at_idx
  ON onboarding_link_tokens (created_at);
