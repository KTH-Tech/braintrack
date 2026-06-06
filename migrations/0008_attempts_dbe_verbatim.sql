-- Save Mini Mock and Full Exam attempts to learner progress (Task #353)
-- Allow `attempts` rows to reference either the legacy `questions` table
-- (admin-published items) OR the new `dbe_verbatim_questions` table that
-- powers Mini Mock and Full Exam practice.
--
-- We drop the strict FK on `attempts.question_id`, make it nullable, and
-- add a parallel nullable `dbe_verbatim_question_id` column so each row
-- can record exactly which source question was attempted.

-- Drop the strict NOT NULL + old FK so we can re-add the FK as a nullable
-- referential check. We keep referential integrity for legacy attempts that
-- still point at the questions table.
ALTER TABLE "attempts"
  DROP CONSTRAINT IF EXISTS "attempts_question_id_questions_id_fk";

ALTER TABLE "attempts"
  ALTER COLUMN "question_id" DROP NOT NULL;

ALTER TABLE "attempts"
  ADD CONSTRAINT "attempts_question_id_questions_id_fk"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id");

ALTER TABLE "attempts"
  ADD COLUMN IF NOT EXISTS "dbe_verbatim_question_id" integer
    REFERENCES "dbe_verbatim_questions"("id");

CREATE INDEX IF NOT EXISTS "attempts_dbe_verbatim_idx"
  ON "attempts" ("dbe_verbatim_question_id");
