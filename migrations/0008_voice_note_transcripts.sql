-- 0008_voice_note_transcripts.sql
-- Adds Whisper transcription columns to learner voice notes so the Smart Tutor
-- can grade understanding and reference recent recordings as context.
--
-- Note: transcript_status is intentionally nullable with NO default. The upload
-- handler explicitly writes 'pending' for new notes so a background Whisper job
-- will pick them up. Legacy rows stay NULL and will not be polled or shown as
-- "Transcribing..." in the UI (no background job exists for them).

ALTER TABLE "voice_notes"
  ADD COLUMN IF NOT EXISTS "transcript" text,
  ADD COLUMN IF NOT EXISTS "transcript_lang" text,
  ADD COLUMN IF NOT EXISTS "transcript_status" text,
  ADD COLUMN IF NOT EXISTS "transcript_error" text,
  ADD COLUMN IF NOT EXISTS "transcribed_at" timestamp;

-- Self-heal: if an earlier draft of this migration set DEFAULT 'pending' (which
-- back-filled all existing rows to 'pending' and would cause the UI to poll
-- forever), drop the default and clear stale 'pending' rows that have no
-- transcript or transcribed_at.
ALTER TABLE "voice_notes" ALTER COLUMN "transcript_status" DROP DEFAULT;
UPDATE "voice_notes"
  SET "transcript_status" = NULL
  WHERE "transcript_status" = 'pending'
    AND "transcript" IS NULL
    AND "transcribed_at" IS NULL;
