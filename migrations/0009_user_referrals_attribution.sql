-- Migration: 0009_user_referrals_attribution
-- Adds attribution metadata (IP / user-agent) to learner referrals so the
-- referral abuse checks can detect self-referrals, code-stuffing and burst
-- patterns. Idempotent — safe alongside drizzle-kit push.

ALTER TABLE "user_referrals"
  ADD COLUMN IF NOT EXISTS "attributed_ip" varchar;

ALTER TABLE "user_referrals"
  ADD COLUMN IF NOT EXISTS "attributed_user_agent" text;

ALTER TABLE "user_referrals"
  ADD COLUMN IF NOT EXISTS "attributed_fingerprint" varchar;

CREATE INDEX IF NOT EXISTS "user_referrals_referrer_ip_idx"
  ON "user_referrals" ("referrer_id", "attributed_ip");

CREATE INDEX IF NOT EXISTS "user_referrals_referrer_created_idx"
  ON "user_referrals" ("referrer_id", "created_at");

CREATE INDEX IF NOT EXISTS "user_referrals_referrer_fp_idx"
  ON "user_referrals" ("referrer_id", "attributed_fingerprint");
