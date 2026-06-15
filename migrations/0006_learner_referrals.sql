-- Migration: 0006_learner_referrals
-- Adds learner-to-learner referral programme columns and indexes.
-- Idempotent (IF NOT EXISTS) — safe alongside drizzle-kit push.

ALTER TABLE "subscriptions"
  ADD COLUMN IF NOT EXISTS "referral_code" text;

CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_referral_code_uniq"
  ON "subscriptions" ("referral_code");

ALTER TABLE "user_referrals"
  ADD COLUMN IF NOT EXISTS "referee_user_id" varchar;

ALTER TABLE "user_referrals"
  ADD COLUMN IF NOT EXISTS "referral_code" text;

ALTER TABLE "user_referrals"
  ADD COLUMN IF NOT EXISTS "converted_at" timestamp;

ALTER TABLE "user_referrals"
  ADD COLUMN IF NOT EXISTS "rewarded_at" timestamp;

ALTER TABLE "user_referrals"
  ALTER COLUMN "referee_email" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "user_referrals_referee_user_uniq"
  ON "user_referrals" ("referee_user_id");
