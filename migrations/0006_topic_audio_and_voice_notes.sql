-- 0006_topic_audio_and_voice_notes.sql
-- Adds per-topic TTS audio columns and a private learner voice notes table.

ALTER TABLE "topics"
  ADD COLUMN IF NOT EXISTS "audio_url" text,
  ADD COLUMN IF NOT EXISTS "audio_url_af" text,
  ADD COLUMN IF NOT EXISTS "audio_generated_at" timestamp,
  ADD COLUMN IF NOT EXISTS "audio_source_hash" text;

CREATE TABLE IF NOT EXISTS "voice_notes" (
  "id" serial PRIMARY KEY,
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "topic_id" integer NOT NULL REFERENCES "topics"("id") ON DELETE CASCADE,
  "subject_id" integer REFERENCES "subjects"("id") ON DELETE SET NULL,
  "audio_url" text NOT NULL,
  "duration_seconds" integer NOT NULL DEFAULT 0,
  "size_bytes" integer NOT NULL DEFAULT 0,
  "title" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "voice_notes_user_idx" ON "voice_notes" ("user_id");
CREATE INDEX IF NOT EXISTS "voice_notes_topic_idx" ON "voice_notes" ("topic_id");
CREATE INDEX IF NOT EXISTS "voice_notes_user_topic_idx" ON "voice_notes" ("user_id", "topic_id");
