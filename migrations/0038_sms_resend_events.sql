-- SMS resend rate-limiter events.
-- One row per reserved resend slot. Backs server/middleware/sms-resend-limiter.ts
-- so cooldown/hourly/daily caps hold across all Render instances and survive
-- restarts. Previously the limiter used an in-memory Map, so the effective cap
-- was ~Nx the configured value (one bucket per instance) and reset on every
-- deploy — a Twilio-cost exposure.
--
-- Additive-only, IF NOT EXISTS-guarded, transaction-safe (no CONCURRENTLY):
-- safe to re-run and safe for the predeploy auto-applier.

CREATE TABLE IF NOT EXISTS sms_resend_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sms_resend_events_user_created_idx
  ON sms_resend_events (user_id, created_at);
