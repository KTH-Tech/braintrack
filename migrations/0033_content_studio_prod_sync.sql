-- Content Studio prod sync — additive only, safe to run against production.
--
-- Prod's `flashcards` table was created before migrations 0029 + 0030 and was
-- never brought up to date, so it is missing the 13 columns the humanised-card
-- generator writes (persistFlashcards fails on the missing source_question_id).
-- And subject_study_tips (examiner/exam tips) has no table at all yet. This
-- backfills both so the Content Studio generators can persist.
--
-- Every statement is IF NOT EXISTS / ADD COLUMN — it drops nothing and is
-- idempotent, so re-running it is a no-op.

-- flashcards: columns from 0029 (humanised) + 0030 (verification)
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "language"            varchar(8)  NOT NULL DEFAULT 'en';
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "card_type"           varchar(32) NOT NULL DEFAULT 'basic';
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "quality_score"       integer     DEFAULT 0;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "source_question_id"  integer;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "solver_verified"     boolean;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "solver_verdict"      text;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "solver_reason"       text;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "caps_verdict"        text;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "caps_reason"         text;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "verification_flag"   text;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "verification_detail" jsonb;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "verification_model"  text;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "verified_at"         timestamptz;

CREATE INDEX IF NOT EXISTS "flashcards_subject_lang_idx"     ON "flashcards" ("subject", "language");
CREATE INDEX IF NOT EXISTS "flashcards_source_question_idx"  ON "flashcards" ("source_question_id");

-- subject_study_tips: examiner + exam tips
CREATE TABLE IF NOT EXISTS "subject_study_tips" (
  "id"                  serial PRIMARY KEY,
  "subject"             text        NOT NULL,
  "kind"                varchar(16) NOT NULL,
  "topic"               text,
  "paper_number"        integer,
  "category"            varchar(48) NOT NULL DEFAULT 'general',
  "tip"                 text        NOT NULL,
  "tip_af"              text        NOT NULL,
  "evidence"            jsonb       DEFAULT '[]'::jsonb,
  "source_question_ids" integer[],
  "model"               text,
  "generated_at"        timestamp   DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "subject_study_tips_subject_kind_idx" ON "subject_study_tips" ("subject", "kind");
