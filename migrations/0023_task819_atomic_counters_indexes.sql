-- Task #819 — Atomic counters + missing indexes
-- Idempotent: safe to re-run.

BEGIN;

-- ============================================================
-- 1. usage: convert (user_id, usage_date) to a UNIQUE index so
--    ON CONFLICT (user_id, usage_date) DO UPDATE works in
--    DatabaseStorage.incrementUsage. Atomicity here closes a
--    real lost-update window where two concurrent tutor calls
--    could both read the same baseline and one increment would
--    be silently dropped, allowing learners to over-consume
--    their daily quota.
-- ============================================================

-- 1a. De-duplicate any (user_id, usage_date) rows that were
--     inserted under the previous non-unique index. Keep the
--     row with the highest id and roll the per-type counts
--     forward so quotas are preserved.
WITH dupes AS (
  SELECT
    user_id,
    usage_date,
    MAX(id) AS keep_id,
    SUM(tutor_count) AS tutor_count,
    SUM(marking_count) AS marking_count,
    SUM(full_solution_count) AS full_solution_count
  FROM usage
  GROUP BY user_id, usage_date
  HAVING COUNT(*) > 1
)
UPDATE usage u
SET
  tutor_count = d.tutor_count,
  marking_count = d.marking_count,
  full_solution_count = d.full_solution_count
FROM dupes d
WHERE u.id = d.keep_id;

DELETE FROM usage u
USING (
  SELECT id, user_id, usage_date,
         row_number() OVER (
           PARTITION BY user_id, usage_date
           ORDER BY id DESC
         ) AS rn
  FROM usage
) ranked
WHERE u.id = ranked.id
  AND ranked.rn > 1;

-- 1b. Drop the old non-unique index (if present) and re-create
--     under the same name as a UNIQUE index. Drizzle's schema
--     name is preserved so `db:push` will not try to re-add it.
DROP INDEX IF EXISTS usage_user_date_idx;
CREATE UNIQUE INDEX IF NOT EXISTS usage_user_date_idx
  ON usage (user_id, usage_date);

-- ============================================================
-- 2. subscriptions: indexes on lifecycle date columns that the
--    daily Trial Reminders job + admin Billing dashboard scan.
--    Without these, enforceLapsedSubscriptions does a seq scan
--    on the whole subscriptions table every night, and the
--    admin "trials ending soon" / "grace expiring soon" lists
--    do the same on every page load.
-- ============================================================

CREATE INDEX IF NOT EXISTS subscriptions_trial_ends_idx
  ON subscriptions (trial_ends_at)
  WHERE trial_ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_grace_ends_idx
  ON subscriptions (grace_period_ends_at)
  WHERE grace_period_ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_next_renewal_idx
  ON subscriptions (next_renewal_at)
  WHERE next_renewal_at IS NOT NULL;

-- ============================================================
-- 3. audit_log: filter index on action so the Billing admin
--    activity feed (which filters `action LIKE 'billing.%'`)
--    does not scan the full audit_log table.
-- ============================================================

CREATE INDEX IF NOT EXISTS audit_log_action_idx
  ON audit_log (action);

-- ============================================================
-- 4. nsc_timetable: case-insensitive subject lookups. The
--    timetable joins do ILIKE/LOWER comparisons on subject_name
--    when matching learner subject selections to exam dates.
-- ============================================================

CREATE INDEX IF NOT EXISTS nsc_timetable_subject_lower_idx
  ON nsc_timetable (LOWER(subject_name));

COMMIT;
