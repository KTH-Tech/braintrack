-- Add VARK questionnaire result columns to onboarding_results.
--
-- The learner onboarding VARK phase used to be self-selection (pick one of
-- four cards). It is now a real 12-question questionnaire whose scored result
-- is a primary VARK style plus, when the runner-up is within 20% of the
-- primary, an optional secondary style. Store both alongside the raw answers
-- so we have a stable, queryable record on the onboarding_results row without
-- having to grep rawAnswersJson.
--
-- Both columns are NULLable — existing rows created before this migration
-- stay valid, and every statement is IF NOT EXISTS / ADD COLUMN, so the
-- migration is idempotent and safe to re-run against production.
--
-- The server write path (server/routes.ts /api/onboarding) also tolerates
-- these columns being absent (the drizzle insert simply drops fields the
-- table doesn't have), so an unmigrated DB won't 500 — it just won't record
-- the two columns.

ALTER TABLE "onboarding_results" ADD COLUMN IF NOT EXISTS "selected_vark"           text;
ALTER TABLE "onboarding_results" ADD COLUMN IF NOT EXISTS "selected_vark_secondary" text;
