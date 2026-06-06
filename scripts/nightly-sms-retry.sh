#!/usr/bin/env bash
# Auto-Retry Failed Onboarding SMS — Task #425
#
# Fires POST /api/push/send-sms-retries every 30 minutes so that tokens
# which failed delivery get a fresh magic-link SMS quickly (carrier issues
# are usually transient). The endpoint enforces its own guards:
#   - max 2 retries per original token
#   - 30-min minimum backoff (only picks up tokens created ≥30 min ago)
#   - 24-hour hard window (never retries tokens older than 24h)
#
# Same loop-wrapper pattern as scripts/nightly-trial-reminders.sh — see that
# file for the rationale on why a loop wrapper is used instead of a Replit
# Scheduled Deployment.

set -u

RUN_INTERVAL_SECONDS="${SMS_RETRY_INTERVAL_SECONDS:-1800}"   # 30 minutes
RUN_ON_START="${SMS_RETRY_RUN_ON_START:-1}"                  # fire immediately on start
TARGET_URL="${SMS_RETRY_TARGET_URL:-http://127.0.0.1:5000/api/push/send-sms-retries}"

run_once() {
  local secret="${CRON_SECRET:-}"
  if [ -z "${secret}" ]; then
    echo "[sms-retry] $(date -u +'%Y-%m-%dT%H:%M:%SZ') skipping run — CRON_SECRET is not set" >&2
    return 0
  fi
  echo "[sms-retry] $(date -u +'%Y-%m-%dT%H:%M:%SZ') firing ${TARGET_URL}"
  http_code="$(curl -sS -o /tmp/sms-retry-response.json -w '%{http_code}' \
    -X POST "${TARGET_URL}" \
    -H "Authorization: Bearer ${secret}" \
    -H "Content-Type: application/json" \
    --max-time 120 || echo '000')"
  body="$(cat /tmp/sms-retry-response.json 2>/dev/null || echo '')"
  if [ "${http_code}" = "200" ]; then
    echo "[sms-retry] $(date -u +'%Y-%m-%dT%H:%M:%SZ') run completed OK — ${body}"
  else
    echo "[sms-retry] $(date -u +'%Y-%m-%dT%H:%M:%SZ') run FAILED (http=${http_code}) — ${body}" >&2
  fi
}

if [ "${RUN_ON_START}" = "1" ]; then
  run_once
fi

while true; do
  echo "[sms-retry] $(date -u +'%Y-%m-%dT%H:%M:%SZ') sleeping ${RUN_INTERVAL_SECONDS}s until next run"
  sleep "${RUN_INTERVAL_SECONDS}"
  run_once
done
