-- Task #784: Make subject selections always arrive as a list, never empty.
-- The onboarding_results.selected_subjects column was nullable, forcing every
-- consumer to add null guards. Backfill any NULL rows to an empty array, then
-- set the column NOT NULL with a default of '{}' so the inferred type narrows
-- to number[] and the value is always a list.

UPDATE "onboarding_results"
  SET "selected_subjects" = '{}'
  WHERE "selected_subjects" IS NULL;

ALTER TABLE "onboarding_results"
  ALTER COLUMN "selected_subjects" SET DEFAULT '{}',
  ALTER COLUMN "selected_subjects" SET NOT NULL;
