-- 0010_topic_audio_admin_review.sql
-- Admin-pinning + per-language metadata for the Topic Audio Review page.

ALTER TABLE "topics"
  ADD COLUMN IF NOT EXISTS "audio_source_hash_en" text,
  ADD COLUMN IF NOT EXISTS "audio_source_hash_af" text,
  ADD COLUMN IF NOT EXISTS "audio_pinned_en" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "audio_pinned_af" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "audio_origin_en" text,
  ADD COLUMN IF NOT EXISTS "audio_origin_af" text,
  ADD COLUMN IF NOT EXISTS "audio_generated_at_en" timestamp,
  ADD COLUMN IF NOT EXISTS "audio_generated_at_af" timestamp;
