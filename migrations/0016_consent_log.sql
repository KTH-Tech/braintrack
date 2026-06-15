-- Task #816: Consent Audit Log table for POPIA compliance
CREATE TABLE IF NOT EXISTS "consent_log" (
  "id" serial PRIMARY KEY,
  "user_id" varchar REFERENCES users(id) ON DELETE SET NULL,
  "consent_type" text NOT NULL,
  "action" text NOT NULL,
  "version" text NOT NULL DEFAULT '',
  "ip_address" text,
  "user_agent" text,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "consent_log_consent_type_check"
    CHECK ("consent_type" IN ('terms_of_service','privacy_policy','cookie','parental','billing')),
  CONSTRAINT "consent_log_action_check"
    CHECK ("action" IN ('granted','revoked','updated'))
);

CREATE INDEX IF NOT EXISTS "consent_log_user_idx" ON "consent_log" ("user_id");
CREATE INDEX IF NOT EXISTS "consent_log_type_idx" ON "consent_log" ("consent_type");
CREATE INDEX IF NOT EXISTS "consent_log_created_idx" ON "consent_log" ("created_at");
