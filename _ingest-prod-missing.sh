#!/usr/bin/env bash
# Re-ingest subjects that have NO released content in production.
# Root cause: their memo PDFs are scanned, and the old OCR model returned
# refusals, so memo_text was empty and the release gate (>=60% memo coverage)
# blocked every question. gpt-4.1 transcribes them properly.
# Writes STRAIGHT INTO PRODUCTION so there is no second migration step.
cd /c/dev/braintrack
source /c/dev/bt-openai.env
source /c/dev/bt-prod-db.env
export DATABASE_URL="$PGURL_EXTERNAL"
export PGSSLMODE=require
export TEST_MODE=true NODE_ENV=development SESSION_SECRET='local-seed'
export NODE_OPTIONS='--max-old-space-size=4096'
export ENABLE_OCR_FALLBACK=1

LOG=/c/dev/bt-prod-ocr.log
DONE=_done-prod-ocr.txt
touch "$DONE"

LOCK=/c/dev/bt-ingest.lock
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "LOCK HELD — another ingestion is running. Exiting." | tee -a "$LOG"; exit 3
fi
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

while IFS= read -r subj; do
  [ -z "$subj" ] && continue
  grep -Fxq "$subj" "$DONE" && continue
  echo "=== $subj — $(date +%H:%M:%S) ===" | tee -a "$LOG"
  timeout 2700 npx tsx server/run-ingestion.ts --subject="$subj" >> "$LOG" 2>&1
  echo "RESULT subject=\"$subj\" exit=$?" | tee -a "$LOG"
  echo "$subj" >> "$DONE"
done < _subjects-missing.txt
echo "=== PROD OCR PASS COMPLETE ===" | tee -a "$LOG"
