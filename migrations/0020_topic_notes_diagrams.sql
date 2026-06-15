-- Task #619 — Add diagram/visual descriptions to topic notes
ALTER TABLE topic_notes
  ADD COLUMN IF NOT EXISTS diagrams jsonb;
