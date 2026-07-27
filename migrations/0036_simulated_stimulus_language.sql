-- Migration 0036 — simulated content: supporting paragraphs + language
--
-- Additive-only, idempotent, transaction-safe. Auto-applied by
-- script/predeploy-migrate.ts before the new code serves traffic.
--
-- stimulus_text: the generated supporting material (comprehension paragraph,
--   poem, case study, data scenario) a question refers to. NULL = the question
--   is fully self-contained. This is what makes passage-based question types
--   (languages, case-study subjects) properly simulatable — the generator now
--   writes ORIGINAL source texts alongside the questions, so a learner always
--   sees the text a question is about.
--
-- language: 'en' | 'af' — which language the simulated row is written in.
--   Everything generated before this migration was English, hence the default.

ALTER TABLE dbe_simulated_questions
  ADD COLUMN IF NOT EXISTS stimulus_text text;

ALTER TABLE dbe_simulated_questions
  ADD COLUMN IF NOT EXISTS language varchar(8) NOT NULL DEFAULT 'en';

CREATE INDEX IF NOT EXISTS dbe_simulated_language_idx
  ON dbe_simulated_questions (subject, language);
