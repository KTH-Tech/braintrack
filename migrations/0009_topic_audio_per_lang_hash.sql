-- Per-language audio source hash on topics
-- The single audio_source_hash column was being overwritten on every render,
-- so it always reflected only the last-rendered language. Track each language
-- separately so idempotency checks can tell whether each MP3 is up to date
-- with its own source text.

ALTER TABLE "topics"
  ADD COLUMN IF NOT EXISTS "audio_source_hash_en" text;

ALTER TABLE "topics"
  ADD COLUMN IF NOT EXISTS "audio_source_hash_af" text;
