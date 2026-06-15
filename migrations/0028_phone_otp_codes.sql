-- Phone OTP codes table for learner phone-number change verification.
-- Codes are hashed (SHA-256 + random salt), expire in 10 minutes,
-- and are consumed on first successful verification.

CREATE TABLE IF NOT EXISTS phone_otp_codes (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  phone_e164 TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  code_salt TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  consumed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS phone_otp_codes_user_phone_idx ON phone_otp_codes (user_id, phone_e164);
CREATE INDEX IF NOT EXISTS phone_otp_codes_user_created_idx ON phone_otp_codes (user_id, created_at);
