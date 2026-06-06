-- Additive migration: adds system_config key-value table for platform-wide settings
-- No existing tables are modified. Safe to run against any existing schema.

CREATE TABLE IF NOT EXISTS "system_config" (
  "key" text PRIMARY KEY NOT NULL,
  "value" jsonb NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "updated_by" text
);

-- Seed the default install-nudge threshold
INSERT INTO "system_config" ("key", "value", "updated_at")
VALUES ('install_nudge_session_threshold', '2'::jsonb, now())
ON CONFLICT ("key") DO NOTHING;
