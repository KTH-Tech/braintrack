CREATE TABLE IF NOT EXISTS "topic_lesson_recordings" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar NOT NULL,
  "topic_id" integer NOT NULL REFERENCES "topics"("id"),
  "language" text NOT NULL,
  "audio_path" text NOT NULL,
  "duration_seconds" integer DEFAULT 0 NOT NULL,
  "size_bytes" integer DEFAULT 0 NOT NULL,
  "mime_type" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "topic_lesson_rec_user_idx" ON "topic_lesson_recordings" ("user_id");
CREATE INDEX IF NOT EXISTS "topic_lesson_rec_topic_idx" ON "topic_lesson_recordings" ("topic_id");
CREATE UNIQUE INDEX IF NOT EXISTS "topic_lesson_rec_user_topic_lang_uniq" ON "topic_lesson_recordings" ("user_id", "topic_id", "language");
