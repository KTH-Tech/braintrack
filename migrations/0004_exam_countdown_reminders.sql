-- Additive migration: T148 — Exam Countdown Reminder Engine
-- Adds dedup log table + admin campaign settings table.
-- No existing tables are modified. Safe to run against any existing schema.

CREATE TABLE IF NOT EXISTS "exam_countdown_reminders" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar NOT NULL,
  "subject_name" text NOT NULL,
  "exam_date" date NOT NULL,
  "paper_number" integer NOT NULL DEFAULT 1,
  "milestone_day" integer NOT NULL,
  "channel" text NOT NULL DEFAULT 'push',
  "sent_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "exam_countdown_reminders_user_idx"
  ON "exam_countdown_reminders" ("user_id");

CREATE UNIQUE INDEX IF NOT EXISTS "exam_countdown_reminders_dedup_idx"
  ON "exam_countdown_reminders" ("user_id", "subject_name", "exam_date", "paper_number", "milestone_day", "channel");

CREATE TABLE IF NOT EXISTS "reminder_campaign_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "cohort_key" text NOT NULL UNIQUE,
  "enabled" boolean NOT NULL DEFAULT true,
  "milestones" jsonb NOT NULL DEFAULT '[30, 14, 7]'::jsonb,
  "updated_at" timestamp DEFAULT now(),
  "updated_by" varchar
);

-- Seed the default global campaign
INSERT INTO "reminder_campaign_settings" ("cohort_key", "enabled", "milestones")
VALUES ('global', true, '[30, 14, 7]'::jsonb)
ON CONFLICT ("cohort_key") DO NOTHING;
