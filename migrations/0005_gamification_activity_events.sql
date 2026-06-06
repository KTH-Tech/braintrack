-- Migration: 0005_gamification_activity_events
-- Brings activity_events and personal_bests under version-controlled Drizzle migrations.
-- Uses IF NOT EXISTS so it is safe to run against databases where
-- ensureGamificationTables() has already created these tables.

CREATE TABLE IF NOT EXISTS "activity_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar NOT NULL,
  "event_type" text NOT NULL,
  "metadata" jsonb DEFAULT '{}',
  "occurred_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "activity_events_user_idx"
  ON "activity_events" ("user_id");

CREATE INDEX IF NOT EXISTS "activity_events_type_idx"
  ON "activity_events" ("event_type");

CREATE INDEX IF NOT EXISTS "activity_events_occurred_idx"
  ON "activity_events" ("user_id", "occurred_at");

CREATE TABLE IF NOT EXISTS "personal_bests" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar NOT NULL,
  "subject_id" integer NOT NULL REFERENCES "subjects"("id"),
  "highest_score" integer NOT NULL DEFAULT 0,
  "highest_score_at" timestamp,
  "best_streak" integer NOT NULL DEFAULT 0,
  "total_sessions" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "personal_bests_user_idx"
  ON "personal_bests" ("user_id");

CREATE UNIQUE INDEX IF NOT EXISTS "personal_bests_user_subject_idx"
  ON "personal_bests" ("user_id", "subject_id");
