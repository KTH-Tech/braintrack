# Supabase Pro Migration Runbook
**Task #556 — 50-School Readiness**
_Last updated: May 2026_

---

## Why

BrainTrack is onboarding 50 schools (~5,000 learners). At peak exam season that means 500–1,000 concurrent users, which will exhaust Replit's built-in PostgreSQL connection limit. Supabase Pro gives us:

- **PgBouncer** connection pooling in transaction mode (handles thousands of connections with a small pool slice per app instance)
- A larger compute tier with better memory for heavy ingestion workloads
- First-class visibility into query performance and connection counts

---

## Connection strings — what goes where

| Variable | Value | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | Supabase **pooled** string, port **6543** | App runtime — all queries go through PgBouncer |
| `DATABASE_URL_DIRECT` | Supabase **direct** string, port **5432** | Drizzle Kit migrations, `pg_dump`/`pg_restore`, admin scripts |

> **Why two URLs?** PgBouncer transaction mode does not support DDL statements (schema changes) reliably across multiple transactions. Drizzle Kit and `pg_restore` need a direct connection.

---

## Pre-flight checklist

- [ ] Supabase Pro project created (see Step 1)
- [ ] Both connection strings noted from the Supabase dashboard
- [ ] `pg_dump` available in the shell (`pg_dump --version`)
- [ ] Application is in a low-traffic window (or maintenance mode)

---

## Step 1 — Create Supabase Pro project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Choose **Europe West** (Frankfurt) — closest region to South Africa with stable latency.
3. Select **Pro** plan.
4. Note the **database password** you set.
5. In the Supabase dashboard → **Project Settings → Database**:
   - Copy the **Connection string** (URI format, port `5432`) → this is your `DATABASE_URL_DIRECT`.
   - Copy the **Connection pooling** URI (port `6543`, mode = **Transaction**) → this is your `DATABASE_URL`.

---

## Step 2 — Dump from Replit Postgres

Open a Replit shell and run:

```bash
# The current DATABASE_URL points to Replit Postgres
pg_dump \
  --format=custom \
  --no-owner \
  --no-acl \
  "$DATABASE_URL" \
  --file=/tmp/braintrack_dump.dump

ls -lh /tmp/braintrack_dump.dump   # confirm size
```

Or use the convenience script (handles the dump, restore, and row-count check in one go):

```bash
SUPABASE_DIRECT_URL="postgres://postgres:<password>@<host>:5432/postgres" \
  bash scripts/supabase-migrate.sh
```

---

## Step 3 — Restore to Supabase

```bash
pg_restore \
  --format=custom \
  --no-owner \
  --no-acl \
  --dbname="$SUPABASE_DIRECT_URL" \
  /tmp/braintrack_dump.dump
```

Expect some benign warnings about Replit-internal extensions (pg_repack, repmgr). These are not BrainTrack tables and can be ignored. Confirm no errors on the tables listed in the row-count check below.

**Row-count sanity check:**

```sql
-- Run via: psql $SUPABASE_DIRECT_URL
SELECT tbl, cnt FROM (
  VALUES
    ('users',                  (SELECT COUNT(*) FROM users)),
    ('subscriptions',          (SELECT COUNT(*) FROM subscriptions)),
    ('exam_papers',            (SELECT COUNT(*) FROM exam_papers)),
    ('dbe_verbatim_questions', (SELECT COUNT(*) FROM dbe_verbatim_questions)),
    ('sessions',               (SELECT COUNT(*) FROM sessions))
) t(tbl, cnt);
```

Row counts must match the source database.

---

## Step 4 — Run pending migrations

Apply any migrations not captured in the dump (safe to re-run; all use `IF NOT EXISTS` or Drizzle idempotency):

```bash
# Uses DATABASE_URL_DIRECT if set, falls back to DATABASE_URL
DATABASE_URL_DIRECT="$SUPABASE_DIRECT_URL" npm run db:push
```

Or apply individual SQL files:

```bash
for f in migrations/*.sql; do
  psql "$SUPABASE_DIRECT_URL" -f "$f" || echo "  [warn] $f had errors (may be a duplicate — check manually)"
done
```

---

## Step 5 — Swap secrets in Replit

In the Replit Secrets panel (or via the agent using the environment-secrets skill):

1. **Update** `DATABASE_URL` → Supabase **pooled** string (port **6543**)
2. **Add** `DATABASE_URL_DIRECT` → Supabase **direct** string (port **5432**)

> Do **not** use the direct URL for `DATABASE_URL` in production — all app traffic must go through PgBouncer.

---

## Step 6 — Restart and smoke-test

```bash
# Restart the main application workflow
```

Then verify:

- [ ] `GET /healthz` → `200 ok`
- [ ] `GET /api/health` → `{ status: "ok", uptime: N }`
- [ ] Log in as a learner → dashboard loads, subjects visible
- [ ] Log in as admin → admin console accessible
- [ ] Start a Mini Mock exam → questions load (reads `dbe_verbatim_questions`)
- [ ] Send a Smart Tutor message → AI responds (reads same table + calls OpenAI)
- [ ] Check Supabase dashboard → **Database → Connections** shows active pooled connections

---

## Step 7 — Monitor for 24 hours

Watch the Supabase dashboard for:

| Metric | Healthy range |
|--------|--------------|
| Active connections | < 80 (PgBouncer absorbs spikes) |
| Query latency (p99) | < 200 ms for simple queries |
| Cache hit ratio | > 95 % |
| CPU usage | < 60 % at peak |

Background jobs to confirm:
- **Trial Reminders** workflow (runs 05:00 UTC) — check logs next morning
- **DBE Ingestion** workflow — restart and watch it write to `dbe_verbatim_questions`

---

## Rollback plan

If anything goes wrong after the cutover:

1. Revert `DATABASE_URL` secret back to the original Replit Postgres connection string.
2. Restart the application workflow.
3. The Replit Postgres database is untouched (dump is read-only).

---

## PgBouncer compatibility notes

The app pool is already tuned for PgBouncer transaction mode in `server/db.ts`:

- `max: 10` per instance — PgBouncer multiplies across all autoscale instances
- `idleTimeoutMillis: 30000` — releases idle slots back to PgBouncer promptly
- `maxUses: 7500` — prevents stale TCP connections from accumulating
- No `SET` commands or prepared statements that span transactions

Drizzle Kit uses `DATABASE_URL_DIRECT` (port 5432) so DDL migrations bypass PgBouncer entirely.

---

## Known limitations

- Supabase does not support `pg_repack` extension — some Replit-internal extension restore errors are expected and harmless.
- File storage (voice notes, audio MP3s) is on the local Replit filesystem, not in Postgres — no data to migrate for those.
- The `PGDATABASE`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` runtime-managed Replit secrets will still reference the Replit Postgres after the cutover; they are unused by the app once `DATABASE_URL` is set to Supabase.
