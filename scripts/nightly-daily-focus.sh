#!/usr/bin/env bash
# Nightly loop wrapper for the "Today's Focus" daily push notification.
#
# Calls POST /api/push/send-daily-focus on the locally-running web server
# at a fixed time-of-day (default 04:30 UTC ≈ 06:30 SAST), so every active
# learner receives one morning push with their daily directive (and any
# opted-in linked parents receive a parallel digest).
#
# Server-side dispatch logic lives in server/daily-focus-push.ts and
# already enforces the SAST 06:00–22:00 quiet-hours window — this wrapper
# only handles when to fire the HTTP call.
#
# Why a loop wrapper instead of a Replit Scheduled Deployment? The repl's
# single [deployment] slot is used by the autoscale primary; see
# scripts/nightly-topic-audio.sh for the full rationale.
#
# Env knobs:
#   DAILY_FOCUS_RUN_HOUR_UTC   (default 4)    — hour-of-day (UTC) to fire
#   DAILY_FOCUS_RUN_MINUTE_UTC (default 30)   — minute-of-hour (UTC)
#   DAILY_FOCUS_RUN_ON_START   (default 0)    — set to 1 to also fire once
#                                               on workflow start
#   DAILY_FOCUS_TARGET_URL     (default
#                               http://127.0.0.1:5000/api/push/send-daily-focus)
#   CRON_SECRET                Bearer token; falls back to the same
#                               default the server uses.

set -u

RUN_HOUR="${DAILY_FOCUS_RUN_HOUR_UTC:-4}"
RUN_MINUTE="${DAILY_FOCUS_RUN_MINUTE_UTC:-30}"
RUN_ON_START="${DAILY_FOCUS_RUN_ON_START:-0}"
TARGET_URL="${DAILY_FOCUS_TARGET_URL:-http://127.0.0.1:5000/api/push/send-daily-focus}"

run_once() {
  # Re-read on every run so the loop survives across env changes and we
  # never silently fall back to a guessable shared secret. Fail-closed.
  local secret="${CRON_SECRET:-}"
  if [ -z "${secret}" ]; then
    echo "[nightly-daily-focus] $(date -u +'%Y-%m-%dT%H:%M:%SZ') skipping run — CRON_SECRET is not set" >&2
    return 0
  fi
  echo "[nightly-daily-focus] $(date -u +'%Y-%m-%dT%H:%M:%SZ') firing ${TARGET_URL}"
  http_code="$(curl -sS -o /tmp/daily-focus-response.json -w '%{http_code}' \
    -X POST "${TARGET_URL}" \
    -H "Authorization: Bearer ${secret}" \
    -H "Content-Type: application/json" \
    --max-time 300 || echo '000')"
  body="$(cat /tmp/daily-focus-response.json 2>/dev/null || echo '')"
  if [ "${http_code}" = "200" ]; then
    echo "[nightly-daily-focus] $(date -u +'%Y-%m-%dT%H:%M:%SZ') run completed OK — ${body}"
  else
    echo "[nightly-daily-focus] $(date -u +'%Y-%m-%dT%H:%M:%SZ') run FAILED (http=${http_code}) — ${body}" >&2
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
  echo "[nightly-daily-focus] sleeping ${sleep_for}s until next run at ${next_iso}"
  sleep "${sleep_for}"
  run_once
done
