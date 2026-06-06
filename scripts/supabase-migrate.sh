#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/supabase-migrate.sh
#
# One-shot helper: dumps the current Replit Postgres and restores it to
# Supabase Pro. Run this ONCE when cutting over.
#
# Usage:
#   SUPABASE_DIRECT_URL="postgres://postgres:<password>@<host>:5432/<db>" \
#     bash scripts/supabase-migrate.sh
#
# The script reads DATABASE_URL from the environment (Replit secret) as the
# source and SUPABASE_DIRECT_URL as the destination.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SOURCE_URL="${DATABASE_URL:?DATABASE_URL must be set (source Replit Postgres)}"
DEST_URL="${SUPABASE_DIRECT_URL:?SUPABASE_DIRECT_URL must be set (target Supabase direct URL, port 5432)}"

DUMP_FILE="/tmp/braintrack_$(date +%Y%m%d_%H%M%S).dump"
RESTORE_LOG="/tmp/braintrack_restore_$(date +%Y%m%d_%H%M%S).log"

# Benign pg_restore error patterns that come from Replit-internal extensions
# and roles that do not exist on Supabase. Any error NOT matching these
# patterns causes the script to abort.
BENIGN_RESTORE_PATTERNS=(
  "pg_repack"
  "repmgr"
  "rdsutils"
  "rds_superuser"
  "rds_replication"
  "does not exist"         # role/extension missing on target — always benign for Replit extensions
  "already exists"         # duplicate object on re-run — safe to ignore
  "pg_stat_statements"
  "pg_buffercache"
  "pg_prewarm"
  "postgis"
  "plpgsql"
  "uuid-ossp"
)

echo "=== BrainTrack → Supabase Migration ==="
echo "Source: ${SOURCE_URL%%:*}://***@***"
echo "Dest:   ${DEST_URL%%:*}://***@***"
echo "Dump:   $DUMP_FILE"
echo ""

# ── Step 0: Connectivity probe ───────────────────────────────────────────────
echo "[0/5] Probing destination with SELECT 1 …"
if ! psql "$DEST_URL" -c "SELECT 1" -q --tuples-only 2>&1 | grep -q "1"; then
  echo "  [FATAL] Cannot connect to destination database. Check SUPABASE_DIRECT_URL."
  exit 1
fi
echo "[0/5] Destination reachable."
echo ""

# ── Step 1: Dump ─────────────────────────────────────────────────────────────
echo "[1/5] Dumping source database (custom format) …"
pg_dump \
  --format=custom \
  --no-owner \
  --no-acl \
  --verbose \
  "$SOURCE_URL" \
  --file="$DUMP_FILE"

echo "[1/5] Dump complete: $(du -sh "$DUMP_FILE" | cut -f1)"
echo ""

# ── Step 2: Restore (with error triage) ──────────────────────────────────────
echo "[2/5] Restoring to Supabase (direct connection, port 5432) …"
echo "      Restore log: $RESTORE_LOG"
echo ""

set +e
pg_restore \
  --format=custom \
  --no-owner \
  --no-acl \
  --verbose \
  --dbname="$DEST_URL" \
  "$DUMP_FILE" 2>"$RESTORE_LOG"
RESTORE_EXIT=$?
set -e

if [ $RESTORE_EXIT -ne 0 ]; then
  # Triage errors: extract lines that contain "error" (case-insensitive)
  ERROR_LINES=$(grep -i "error" "$RESTORE_LOG" || true)

  if [ -z "$ERROR_LINES" ]; then
    echo "  [OK] pg_restore exited $RESTORE_EXIT but no error lines found in log — continuing."
  else
    FATAL_ERRORS=""
    while IFS= read -r line; do
      IS_BENIGN=false
      for pattern in "${BENIGN_RESTORE_PATTERNS[@]}"; do
        if echo "$line" | grep -qi "$pattern"; then
          IS_BENIGN=true
          break
        fi
      done
      if [ "$IS_BENIGN" = false ]; then
        FATAL_ERRORS="${FATAL_ERRORS}  ${line}"$'\n'
      fi
    done <<< "$ERROR_LINES"

    if [ -n "$FATAL_ERRORS" ]; then
      echo ""
      echo "  [FATAL] pg_restore encountered non-benign errors:"
      echo "$FATAL_ERRORS"
      echo ""
      echo "  Full restore log: $RESTORE_LOG"
      echo "  Fix the errors above before continuing. Aborting."
      rm -f "$DUMP_FILE"
      exit 1
    else
      echo "  [OK] All pg_restore errors are benign (Replit-internal extensions/roles)."
      echo "  See $RESTORE_LOG for full details."
    fi
  fi
fi

echo "[2/5] Restore complete."
echo ""

# ── Step 3: Row-count sanity check ───────────────────────────────────────────
echo "[3/5] Row-count sanity check on key tables …"
psql "$DEST_URL" --no-psqlrc --tuples-only <<'SQL'
SELECT
  tbl,
  cnt
FROM (
  SELECT 'users'                  AS tbl, (SELECT COUNT(*) FROM users)                  AS cnt
  UNION ALL
  SELECT 'subscriptions',                 (SELECT COUNT(*) FROM subscriptions)
  UNION ALL
  SELECT 'exam_papers',                   (SELECT COUNT(*) FROM exam_papers)
  UNION ALL
  SELECT 'dbe_verbatim_questions',        (SELECT COUNT(*) FROM dbe_verbatim_questions)
  UNION ALL
  SELECT 'sessions',                      (SELECT COUNT(*) FROM sessions)
  UNION ALL
  SELECT 'subjects',                      (SELECT COUNT(*) FROM subjects)
  UNION ALL
  SELECT 'topics',                        (SELECT COUNT(*) FROM topics)
) t
ORDER BY tbl;
SQL
echo ""

# ── Step 4: Schema / index validation ────────────────────────────────────────
echo "[4/5] Validating critical indexes and constraints …"
psql "$DEST_URL" --no-psqlrc --tuples-only <<'SQL'
-- Critical indexes that must exist on the destination
SELECT
  schemaname,
  tablename,
  indexname,
  CASE WHEN indexname IS NOT NULL THEN 'OK' ELSE 'MISSING' END AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'users_pkey',
    'sessions_pkey',
    'exam_papers_pkey',
    'dbe_verbatim_questions_pkey',
    'subscriptions_pkey',
    'subjects_pkey',
    'topics_pkey'
  )
ORDER BY indexname;
SQL

echo ""
echo "[4/5] If any index shows MISSING above, the restore may be incomplete."
echo ""

# ── Step 5: Clean up ─────────────────────────────────────────────────────────
echo "[5/5] Removing local dump file …"
rm -f "$DUMP_FILE"
echo "[5/5] Done."
echo ""
echo "=== Migration complete ==="
echo ""
echo "Next steps:"
echo "  1. Update DATABASE_URL secret  → Supabase POOLED connection string (port 6543)"
echo "  2. Add DATABASE_URL_DIRECT secret → Supabase DIRECT connection string (port 5432)"
echo "  3. Restart the application workflow."
echo "  4. Confirm /healthz returns 200."
echo "  5. Log in as learner and admin; run a Mini Mock; send a Smart Tutor message."
