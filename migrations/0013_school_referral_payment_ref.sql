-- Add payment_reference column to school_referrals for verified-payment gating.
-- The column is unique to prevent replay attacks where the same Netcash checkout
-- reference is used to create multiple referral records.
ALTER TABLE school_referrals
  ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255) UNIQUE;
