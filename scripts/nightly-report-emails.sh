#!/usr/bin/env bash
# scripts/nightly-report-emails.sh
#
# Scheduled parent progress-report email dispatcher.
# Runs server/scheduled-reports.ts runIfScheduled() every 55 minutes.
# When the configured SAST send window matches, it fires emails to all
# active parents with the latest BrainTrack progress report as a PDF attachment.
#
# Add as a Replit workflow "Report Emails" pointing at this script.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNER="$SCRIPT_DIR/_run-report-emails-once.ts"

echo "[nightly-report-emails] Starting scheduled report email loop — $(date -u '+%Y-%m-%dT%H:%M:%SZ') UTC"

while true; do
  echo "[nightly-report-emails] Checking send window — $(date -u '+%Y-%m-%dT%H:%M:%SZ') UTC"

  # Write a tiny one-shot runner each time
  cat > "$RUNNER" << 'TSEOF'
import { runIfScheduled } from "../server/scheduled-reports";

runIfScheduled()
  .then(() => {
    console.log("[report-emails-once] Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[report-emails-once] Fatal:", err);
    process.exit(1);
  });
TSEOF

  npx ts-node --project tsconfig.json --transpile-only "$RUNNER" || \
    echo "[nightly-report-emails] Runner exited with error — will retry next window"

  # Sleep 55 minutes between checks (safe margin for hourly windows)
  sleep 3300
done
