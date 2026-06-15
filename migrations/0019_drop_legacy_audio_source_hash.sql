-- Remove the legacy single-column audio_source_hash from topics.
-- The per-language columns (audio_source_hash_en, audio_source_hash_af)
-- have fully replaced it since Task #363 / Task #373.
ALTER TABLE "topics" DROP COLUMN IF EXISTS "audio_source_hash";
