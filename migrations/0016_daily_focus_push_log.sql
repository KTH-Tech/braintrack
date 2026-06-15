-- Task #381: Track which learners actually received the daily focus push
-- One row per (user_id, sent_date, channel) dispatch attempt.

CREATE TABLE IF NOT EXISTS "daily_focus_push_log" (
  "id"          serial        PRIMARY KEY,
  "user_id"     varchar       NOT NULL,
  "sent_date"   date          NOT NULL,
  "channel"     text          NOT NULL DEFAULT 'learner',
  "payload_tag" text,
  "success"     boolean       NOT NULL DEFAULT false,
  "error"       text,
  "created_at"  timestamp     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "dfpl_user_date_idx"
  ON "daily_focus_push_log" ("user_id", "sent_date");

CREATE INDEX IF NOT EXISTS "dfpl_sent_date_idx"
  ON "daily_focus_push_log" ("sent_date");

CREATE UNIQUE INDEX IF NOT EXISTS "dfpl_user_date_channel_uniq"
  ON "daily_focus_push_log" ("user_id", "sent_date", "channel");
