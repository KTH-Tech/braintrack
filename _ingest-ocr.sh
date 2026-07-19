#!/usr/bin/env bash
# OCR re-ingestion pass for subjects whose DBE PDFs are scanned / low-text.
# Requires a funded OpenAI key (sourced from outside the repo, never committed).
cd /c/dev/braintrack
source /c/dev/bt-openai.env
export DATABASE_URL='postgresql://postgres:postgres@localhost:5433/braintrack'
export TEST_MODE=true NODE_ENV=development SESSION_SECRET='local-seed'
export ADMIN_EMAILS='kreativethinkinghub@gmail.com'
export NODE_OPTIONS='--max-old-space-size=4096'
export ENABLE_OCR_FALLBACK=1

LOG=/c/dev/bt-ingest-ocr.log
DONE=_done-ocr.txt
LIST="${1:-_subjects-ocr.txt}"
touch "$DONE"

LOCK=/c/dev/bt-ingest.lock
if ! mkdir "$LOCK" 2>/dev/null; then
  if ! ps -W 2>/dev/null | grep -q "run-ingestion"; then
    rmdir "$LOCK" 2>/dev/null
    mkdir "$LOCK" 2>/dev/null || { echo "LOCK HELD. Exiting." | tee -a "$LOG"; exit 3; }
  else
    echo "LOCK HELD — another ingestion loop is running. Exiting." | tee -a "$LOG"
    exit 3
  fi
fi
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

count_q() {
  local c
  c=$(node _q.mjs "SELECT COUNT(*)::int c FROM dbe_verbatim_questions" 2>/dev/null | grep -oE '[0-9]+' | head -1)
  if [ -z "$c" ]; then sleep 3; c=$(node _q.mjs "SELECT COUNT(*)::int c FROM dbe_verbatim_questions" 2>/dev/null | grep -oE '[0-9]+' | head -1); fi
  echo "${c:--1}"
}

while IFS= read -r subj; do
  [ -z "$subj" ] && continue
  if grep -Fxq "$subj" "$DONE"; then continue; fi
  echo "=== OCR $subj — $(date +%H:%M:%S) ===" | tee -a "$LOG"
  before=$(count_q)
  timeout 2700 npx tsx server/run-ingestion.ts --subject="$subj" >> "$LOG" 2>&1
  code=$?
  after=$(count_q)
  if [ "$before" -ge 0 ] && [ "$after" -ge 0 ]; then gained=$(( after - before )); else gained="unknown"; fi
  echo "RESULT subject=\"$subj\" exit=$code gained=$gained total=$after" | tee -a "$LOG"
  echo "$subj" >> "$DONE"
done < "$LIST"
final=$(count_q)
echo "=== OCR PASS COMPLETE: $final total verbatim questions ===" | tee -a "$LOG"
