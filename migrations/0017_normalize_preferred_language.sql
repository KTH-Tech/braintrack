-- Normalize users.preferred_language: long-form → short-form, case variants → lowercase, unknown/null → 'en'
UPDATE users
SET preferred_language = CASE
  WHEN lower(preferred_language) IN ('en', 'english')   THEN 'en'
  WHEN lower(preferred_language) IN ('af', 'afrikaans') THEN 'af'
  ELSE 'en'
END
WHERE preferred_language IS NULL
   OR lower(preferred_language) NOT IN ('en', 'af');

-- Normalize onboarding_results.preferred_language similarly
UPDATE onboarding_results
SET preferred_language = CASE
  WHEN lower(preferred_language) IN ('en', 'english')   THEN 'en'
  WHEN lower(preferred_language) IN ('af', 'afrikaans') THEN 'af'
  ELSE 'en'
END
WHERE preferred_language IS NULL
   OR lower(preferred_language) NOT IN ('en', 'af');

-- Add check constraint to users to prevent long-form values in future
ALTER TABLE users
  ADD CONSTRAINT users_preferred_language_short_form
  CHECK (preferred_language IN ('en', 'af'));

-- Add check constraint to onboarding_results to prevent long-form values in future
ALTER TABLE onboarding_results
  ADD CONSTRAINT onboarding_results_preferred_language_short_form
  CHECK (preferred_language IN ('en', 'af'));

-- Fix the column default on onboarding_results to match the short-form standard
ALTER TABLE onboarding_results
  ALTER COLUMN preferred_language SET DEFAULT 'en';
