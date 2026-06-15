-- Task #409: capture learner cell number alongside parent cell at trial signup
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS learner_cell varchar;
