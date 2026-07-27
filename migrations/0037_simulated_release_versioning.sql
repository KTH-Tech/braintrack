-- Migration 0037 — versioned releases for simulated content
--
-- Additive-only, idempotent. Auto-applied by script/predeploy-migrate.ts.
--
-- Release model (owner spec): the Simulator screen has a Release button per
-- subject. Releasing stamps every eligible unreleased row with released_at and
-- the subject's NEXT version number. Releases are CUMULATIVE — version 2 adds
-- to version 1's pool, nothing is ever un-released — so the released simulated
-- database only ever grows.

ALTER TABLE dbe_simulated_questions
  ADD COLUMN IF NOT EXISTS released_at timestamptz;

ALTER TABLE dbe_simulated_questions
  ADD COLUMN IF NOT EXISTS release_version integer;

CREATE INDEX IF NOT EXISTS dbe_simulated_released_idx
  ON dbe_simulated_questions (subject, released_at);
