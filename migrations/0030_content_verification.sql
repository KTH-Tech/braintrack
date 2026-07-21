-- Factual-correctness verification columns for generated learner content.
--
-- Context: server/question-generator.ts and server/flashcard-generator.ts each
-- shipped Accounting content teaching LIFO as an inventory valuation method.
-- LIFO is prohibited under IAS 2 and is not in CAPS Grade 12 Accounting (which
-- teaches FIFO and weighted average). Both generators' scorers passed it —
-- generated_questions #32 scored 86/100 and was released — because both score
-- STRUCTURE, VOICE and COMPLETENESS, not whether the content is true or on
-- syllabus. server/content-verifier.ts closes that gap; these columns hold its
-- verdicts.
--
-- Additive only. `generated_questions.solver_verified` and `solver_answer_match`
-- already exist (designed for this check, never implemented) and are REUSED
-- rather than duplicated.
--
-- Semantics:
--   solver_verified  — the item was independently re-answered WITHOUT sight of
--                      the stored memo and the two answers agreed. false means
--                      disagreed OR uncertain OR the check errored; read
--                      solver_verdict for which.
--   caps_verdict     — on_syllabus | off_syllabus | uncertain. `off_syllabus`
--                      requires an LLM judgement anchored to SA CAPS AND zero
--                      corroboration in a dense verbatim corpus; everything
--                      else that is not a clean pass degrades to `uncertain`.
--   verification_flag— ok | needs_review. Advisory. Nothing in this pipeline
--                      deletes or unpublishes content; the owner decides.

ALTER TABLE "generated_questions" ADD COLUMN IF NOT EXISTS "solver_verdict" text;
ALTER TABLE "generated_questions" ADD COLUMN IF NOT EXISTS "solver_reason" text;
ALTER TABLE "generated_questions" ADD COLUMN IF NOT EXISTS "caps_verdict" text;
ALTER TABLE "generated_questions" ADD COLUMN IF NOT EXISTS "caps_confidence" numeric;
ALTER TABLE "generated_questions" ADD COLUMN IF NOT EXISTS "caps_reason" text;
ALTER TABLE "generated_questions" ADD COLUMN IF NOT EXISTS "verification_flag" text;
ALTER TABLE "generated_questions" ADD COLUMN IF NOT EXISTS "verification_detail" jsonb;
ALTER TABLE "generated_questions" ADD COLUMN IF NOT EXISTS "verification_model" text;
ALTER TABLE "generated_questions" ADD COLUMN IF NOT EXISTS "verified_at" timestamptz;

CREATE INDEX IF NOT EXISTS "generated_questions_verification_idx"
  ON "generated_questions" ("verification_flag", "caps_verdict");

-- flashcards has no solver columns yet, so both are added here.
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "solver_verified" boolean;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "solver_answer_match" numeric;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "solver_verdict" text;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "solver_reason" text;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "caps_verdict" text;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "caps_confidence" numeric;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "caps_reason" text;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "verification_flag" text;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "verification_detail" jsonb;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "verification_model" text;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "verified_at" timestamptz;

CREATE INDEX IF NOT EXISTS "flashcards_verification_idx"
  ON "flashcards" ("verification_flag", "caps_verdict");
