-- Demo-account flag on `users`.
--
-- Context: production briefly held 8 accounts, 7 of which were ad-hoc dev/QA
-- debris. Every admin metric (total users, learners, parents, subscriptions,
-- trials) counted that noise as business data, and there was no way to tell
-- real signal from test rows. `scripts/purge-test-accounts.ts` cleared them.
--
-- We still need demo accounts the owner can sign into to review the learner and
-- parent experiences. This column is what makes those accounts structurally
-- distinguishable rather than distinguishable by convention: every business
-- metric filters `is_demo = false`, so a demo account cannot silently leak into
-- a number the owner is trying to trust. See scripts/seed-demo-accounts.ts.
--
-- NOT NULL DEFAULT false — every existing row (and every account created by the
-- normal signup path, which never sets this column) is a real user. Only the
-- seeder sets it true.
--
-- Additive and idempotent. Safe to run against a live database: Postgres 11+
-- adds a NOT NULL column with a non-volatile default as a catalogue-only
-- rewrite, so this does not lock the table for a table scan.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_demo" boolean DEFAULT false NOT NULL;

-- Partial index: the population is tiny (1–2 rows) and every metric query
-- filters on `is_demo = false`. A partial index on the true side keeps the
-- demo-account lookups in the seeder cheap without adding write cost to the
-- overwhelmingly-false real-user path.
CREATE INDEX IF NOT EXISTS "users_is_demo_idx" ON "users" ("is_demo") WHERE "is_demo" = true;
