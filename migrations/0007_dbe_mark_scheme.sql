-- Memo-Driven Marking Engine (Task #347)
-- Adds the structured mark-scheme cache column used by
-- /api/exam/mini-mock and /api/exam/full marking endpoints.
-- The column is populated at ingestion time (server/dbe-ingestion.ts)
-- and lazily backfilled by ensureMarkScheme() in server/routes.ts.

ALTER TABLE "dbe_verbatim_questions"
  ADD COLUMN IF NOT EXISTS "mark_scheme" jsonb;
