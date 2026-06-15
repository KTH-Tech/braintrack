-- Task #394: Production Hardening — Ingestion Release Gate
-- Adds release-state columns to dbe_verbatim_questions so learner-facing
-- endpoints can filter to only papers that have passed the ≥98% memo +
-- mark-scheme coverage check. The validator (server/release-gate.ts) sets
-- released_at + memo_coverage + mark_coverage at the end of each ingestion
-- pass; learner queries filter on released_at IS NOT NULL.

ALTER TABLE "dbe_verbatim_questions"
  ADD COLUMN IF NOT EXISTS "released_at" timestamp,
  ADD COLUMN IF NOT EXISTS "memo_coverage" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "mark_coverage" integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS "dbe_verbatim_released_idx"
  ON "dbe_verbatim_questions" ("subject", "year", "paper_number", "session")
  WHERE "released_at" IS NOT NULL;
