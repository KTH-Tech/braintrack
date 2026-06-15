#!/usr/bin/env bash
# Nightly loop wrapper for scripts/seed-topic-content.ts.
#
# Anchors each run to a fixed time-of-day (default 03:00 UTC) so the
# cadence is predictable regardless of when the workflow process started
# or restarted. Failures are logged with a clear "run FAILED (exit N)"
# line; the loop continues so a single bad night does not stop the
# schedule.
#
# Why a loop wrapper instead of a Replit Scheduled Deployment?
# Replit workflows have no built-in cron. Scheduled Deployments do, but
# this project's single `[deployment]` slot in .replit is already used
# by the autoscale main web app and cannot also be `scheduled` without
# breaking production. Until per-job scheduled deployments are
# available, this wrapper is the supported pattern for daily background
# work in this repl.
#
# Env knobs:
#   CONTENT_SEED_RUN_HOUR_UTC   (default 3)    — hour-of-day (UTC) to fire
#   CONTENT_SEED_RUN_MINUTE_UTC (default 0)    — minute-of-hour (UTC)
#   CONTENT_SEED_RUN_ON_START   (default 1)    — set to 0 to skip the
#                                               immediate first run

set -u

RUN_HOUR="${CONTENT_SEED_RUN_HOUR_UTC:-3}"
RUN_MINUTE="${CONTENT_SEED_RUN_MINUTE_UTC:-0}"
RUN_ON_START="${CONTENT_SEED_RUN_ON_START:-1}"

run_once() {
  echo "[nightly-topic-content] $(date -u +'%Y-%m-%dT%H:%M:%SZ') starting run"
  if npx tsx scripts/seed-topic-content.ts; then
    echo "[nightly-topic-content] $(date -u +'%Y-%m-%dT%H:%M:%SZ') run completed OK"
  else
    code=$?
    echo "[nightly-topic-content] $(date -u +'%Y-%m-%dT%H:%M:%SZ') run FAILED (exit ${code})" >&2
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
  echo "[nightly-topic-content] sleeping ${sleep_for}s until next run at ${next_iso}"
  sleep "${sleep_for}"
  run_once
done
