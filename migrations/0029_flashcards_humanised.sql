-- Humanised flashcards: bilingual rows + card type + validation provenance.
--
-- Context: the `flashcards` table previously held rows copied verbatim out of
-- `dbe_verbatim_questions` (front = question_text, back = memo_text), which put
-- examiner marking-rubric prose in front of learners. server/flashcard-generator.ts
-- now synthesises atomic, second-person, EN+AF cards and hard-validates them
-- before insert. These columns support that.

ALTER TABLE "flashcards"
  ADD COLUMN IF NOT EXISTS "language" varchar(8) NOT NULL DEFAULT 'en';

ALTER TABLE "flashcards"
  ADD COLUMN IF NOT EXISTS "card_type" varchar(32) NOT NULL DEFAULT 'basic';

ALTER TABLE "flashcards"
  ADD COLUMN IF NOT EXISTS "quality_score" integer DEFAULT 0;

ALTER TABLE "flashcards"
  ADD COLUMN IF NOT EXISTS "source_question_id" integer;

CREATE INDEX IF NOT EXISTS "flashcards_subject_lang_idx"
  ON "flashcards" ("subject", "language");

CREATE INDEX IF NOT EXISTS "flashcards_source_question_idx"
  ON "flashcards" ("source_question_id");
