#!/usr/bin/env bash
# Trial Reminder Push — Task #393
#
# Fires the Day 13 / Day 14 trial-end conversion notifications by
# hitting POST /api/push/send-trial-reminders on the local server.
# Anchored to a fixed UTC time-of-day so the cadence is predictable
# regardless of when the workflow restarted.
#
# Same pattern as scripts/nightly-daily-focus.sh — see that file for
# the full rationale on why a loop wrapper is used instead of a
# Replit Scheduled Deployment.

set -u

RUN_HOUR="${TRIAL_REMINDER_RUN_HOUR_UTC:-5}"     # 05:00 UTC ≈ 07:00 SAST
RUN_MINUTE="${TRIAL_REMINDER_RUN_MINUTE_UTC:-0}"
RUN_ON_START="${TRIAL_REMINDER_RUN_ON_START:-0}"
TARGET_URL="${TRIAL_REMINDER_TARGET_URL:-http://127.0.0.1:5000/api/push/send-trial-reminders}"
run_once() {
  # Re-read on every run so the loop survives across env changes and we
  # never silently fall back to a guessable shared secret. Fail-closed.
  local secret="${CRON_SECRET:-}"
  if [ -z "${secret}" ]; then
    echo "[nightly-trial-reminders] $(date -u +'%Y-%m-%dT%H:%M:%SZ') skipping run — CRON_SECRET is not set" >&2
    return 0
  fi
  echo "[nightly-trial-reminders] $(date -u +'%Y-%m-%dT%H:%M:%SZ') firing ${TARGET_URL}"
  http_code="$(curl -sS -o /tmp/trial-reminders-response.json -w '%{http_code}' \
    -X POST "${TARGET_URL}" \
    -H "Authorization: Bearer ${secret}" \
    -H "Content-Type: application/json" \
    --max-time 300 || echo '000')"
  body="$(cat /tmp/trial-reminders-response.json 2>/dev/null || echo '')"
  if [ "${http_code}" = "200" ]; then
    echo "[nightly-trial-reminders] $(date -u +'%Y-%m-%dT%H:%M:%SZ') run completed OK — ${body}"
  else
    echo "[nightly-trial-reminders] $(date -u +'%Y-%m-%dT%H:%M:%SZ') run FAILED (http=${http_code}) — ${body}" >&2
  fi
}

seconds_until_next_fire() {
  local now next
  now="$(date -u +%s)"
  next="$(date -u -d "today ${RUN_HOUR}:${RUN_MINUTE}:00" +%s 2>/dev/null || echo 0)"
  if [ "${next}" -le "${now}" ]; then
    next="$(date -u -d "tomorrow ${RUN_HOUR}:${RUN_MINUTE}:00" +%s)"
  fi
  echo $(( next - now ))
}

if [ "${RUN_ON_START}" = "1" ]; then
  run_once
fi

while true; do
  sleep_for="$(seconds_until_next_fire)"
  next_iso="$(date -u -d "@$(( $(date -u +%s) + sleep_for ))" +'%Y-%m-%dT%H:%M:%SZ')"
  echo "[nightly-trial-reminders] sleeping ${sleep_for}s until next run at ${next_iso}"
  sleep "${sleep_for}"
  run_once
done
