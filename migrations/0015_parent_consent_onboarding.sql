-- Task #43: Onboarding — Learner/Parent Dual Entry + Parent Consent
-- Adds parent-email + parent-consent fields and free-form school name to users.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS parent_email varchar,
  ADD COLUMN IF NOT EXISTS parent_consent_granted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_consent_requested_at timestamp,
  ADD COLUMN IF NOT EXISTS parent_consent_granted_at timestamp,
  ADD COLUMN IF NOT EXISTS school_name text,
  ADD COLUMN IF NOT EXISTS grade integer;
