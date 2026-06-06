-- Task #604: Persist SM2 flashcard progress per user + card ID
-- so learners never lose their spaced-repetition streak.

CREATE TABLE IF NOT EXISTS "flashcard_progress" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar NOT NULL,
  "card_id" text NOT NULL,
  "n" integer NOT NULL DEFAULT 0,
  "ef" integer NOT NULL DEFAULT 250,
  "interval" integer NOT NULL DEFAULT 0,
  "due" bigint NOT NULL DEFAULT 0,
  "last_review" bigint,
  "review_count" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "flashcard_progress_user_card_idx"
  ON "flashcard_progress" ("user_id", "card_id");

CREATE INDEX IF NOT EXISTS "flashcard_progress_user_idx"
  ON "flashcard_progress" ("user_id");
