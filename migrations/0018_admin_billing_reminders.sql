-- Migration: 0018_admin_billing_reminders
-- Task #502: Track push notification delivery per billing reminder sent

CREATE TABLE IF NOT EXISTS "admin_billing_reminders" (
  "id"       serial PRIMARY KEY,
  "user_id"  varchar NOT NULL,
  "sent_at"  timestamp NOT NULL DEFAULT now(),
  "type"     text NOT NULL DEFAULT 'reminder',
  "result"   jsonb NOT NULL DEFAULT '{}',
  "sent_by"  varchar NOT NULL
);

CREATE INDEX IF NOT EXISTS "abr_user_id_idx"  ON "admin_billing_reminders" ("user_id");
CREATE INDEX IF NOT EXISTS "abr_sent_at_idx"  ON "admin_billing_reminders" ("sent_at");
CREATE INDEX IF NOT EXISTS "abr_sent_by_idx"  ON "admin_billing_reminders" ("sent_by");
