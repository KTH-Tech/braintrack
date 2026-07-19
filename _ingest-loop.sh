#!/usr/bin/env bash
# Per-subject isolated DBE ingestion (OOM-safe: one process per subject).
# Resumable: subjects listed in _done.txt are skipped; each completed
# subject is appended there, so the loop survives session restarts.
cd /c/dev/braintrack
export DATABASE_URL='postgresql://postgres:postgres@localhost:5433/braintrack'
export TEST_MODE=true NODE_ENV=development SESSION_SECRET='local-seed'
export ADMIN_EMAILS='kreativethinkinghub@gmail.com'
export NODE_OPTIONS='--max-old-space-size=4096'
# ENABLE_OCR_FALLBACK stays OFF (no real OpenAI key). Text PDFs still yield.

LOG=/c/dev/bt-ingest.log
DONE=_done.txt
touch "$DONE"

# Single-instance guard: mkdir is atomic; a second instance exits immediately.
# Stale-lock recovery: if no run-ingestion process exists, the lock is stale.
LOCK=/c/dev/bt-ingest.lock
if ! mkdir "$LOCK" 2>/dev/null; then
  if ! ps -W 2>/dev/null | grep -q "run-ingestion"; then
    rmdir "$LOCK" 2>/dev/null
    mkdir "$LOCK" 2>/dev/null || { echo "LOCK HELD — another loop is running. Exiting." | tee -a "$LOG"; exit 3; }
  else
    echo "LOCK HELD — another loop is running. Exiting." | tee -a "$LOG"
    exit 3
  fi
fi
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

count_q() {
  # Robust count: retry once; echo -1 on failure so callers can skip math
  local c
  c=$(node _q.mjs "SELECT COUNT(*)::int c FROM dbe_verbatim_questions" 2>/dev/null | grep -oE '[0-9]+' | head -1)
  if [ -z "$c" ]; then sleep 3; c=$(node _q.mjs "SELECT COUNT(*)::int c FROM dbe_verbatim_questions" 2>/dev/null | grep -oE '[0-9]+' | head -1); fi
  echo "${c:--1}"
}
n=0
while IFS= read -r subj; do
  [ -z "$subj" ] && continue
  if grep -Fxq "$subj" "$DONE"; then continue; fi
  n=$((n+1))
  echo "=== $subj — $(date +%H:%M:%S) ===" | tee -a "$LOG"
  before=$(count_q)
  timeout 900 npx tsx server/run-ingestion.ts --subject="$subj" >> "$LOG" 2>&1
  code=$?
  after=$(count_q)
  if [ "$before" -ge 0 ] && [ "$after" -ge 0 ]; then gained=$(( after - before )); else gained="unknown"; fi
  echo "RESULT subject=\"$subj\" exit=$code gained=$gained total=$after" | tee -a "$LOG"
  echo "$subj" >> "$DONE"
done < _subjects.txt
final=$(node _q.mjs "SELECT COUNT(*)::int c FROM dbe_verbatim_questions" 2>/dev/null | grep -oE '[0-9]+' | head -1)
echo "=== INGEST COMPLETE: $final verbatim questions ===" | tee -a "$LOG"
