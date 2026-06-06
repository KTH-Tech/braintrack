-- Task #741: Sync flashcard drawer position per user + topic so that
-- learners switching between phone and laptop resume on the same card.

CREATE TABLE IF NOT EXISTS "topic_flashcard_position" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar NOT NULL,
  "topic_id" integer NOT NULL,
  "card_idx" integer NOT NULL DEFAULT 0,
  "flipped" boolean NOT NULL DEFAULT false,
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "topic_flashcard_position_user_topic_idx"
  ON "topic_flashcard_position" ("user_id", "topic_id");

CREATE INDEX IF NOT EXISTS "topic_flashcard_position_user_idx"
  ON "topic_flashcard_position" ("user_id");
