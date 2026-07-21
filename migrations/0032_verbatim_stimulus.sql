-- Question stimulus (source material) capture for dbe_verbatim_questions.
--
-- Context: learners report mini-mock questions that are literally unanswerable
-- because they reference material that is not on screen — "Bestudeer die
-- scenario hieronder", "Study the extract below", "Refer to the table above".
--
-- Cause: DBE papers attach one stimulus block to a parent question and then ask
-- several sub-questions about it. Hospitality Studies 2024 P1 Q2.1 is typical:
--
--     2.1  Bestudeer die scenario hieronder en beantwoord die vrae wat volg.
--          [MTT Hotel scenario — 8 lines of source text]
--     2.1.1  Noem die orgaan in die liggaam wat geaffekteer word …   (1)
--     2.1.2  Stel EEN voorkomende maatreël voor …                    (1)
--
-- `extractSubQuestions()` returns 2.1.1 … 2.1.4 as independent rows and the
-- scenario — which lives in the parent block, before the first sub-question —
-- was simply dropped. Each child was then served to a learner on its own, with
-- its stimulus missing. The text IS present in the source PDF; nothing had to
-- be inferred, it just was not carried onto the child rows.
--
-- Semantics:
--   stimulus_text   — verbatim source material the question depends on
--                     (scenario, extract, paragraph, case study, data table
--                     rendered as text). NULL when the question is
--                     self-contained. Shared by every sub-question of a group.
--   needs_stimulus  — TRUE when the question text references material
--                     ("below", "above", "the extract", "Diagram 1") that we
--                     could NOT recover. These questions must be withheld from
--                     learners or shown flagged as incomplete — never served as
--                     answerable. The common irrecoverable case is stimulus
--                     that is an IMAGE in the source PDF (diagrams, photographs,
--                     cocktail pictures); pdf-parse extracts text only, so no
--                     amount of parsing recovers those.
--
-- Additive only — no existing column or row is modified.

ALTER TABLE dbe_verbatim_questions
  ADD COLUMN IF NOT EXISTS stimulus_text TEXT;

ALTER TABLE dbe_verbatim_questions
  ADD COLUMN IF NOT EXISTS needs_stimulus BOOLEAN NOT NULL DEFAULT FALSE;

-- The learner-serving paths filter on this flag, so it needs an index.
CREATE INDEX IF NOT EXISTS dbe_verbatim_needs_stimulus_idx
  ON dbe_verbatim_questions (needs_stimulus)
  WHERE needs_stimulus = TRUE;
