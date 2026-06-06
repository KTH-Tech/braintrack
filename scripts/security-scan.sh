#!/usr/bin/env bash
# BrainTrack — SAST security scan for production-facing code
# Phase 1: Runs Semgrep against server/, client/src/, shared/ — fails on HIGH+ findings.
# Phase 2: Runs Semgrep against scripts/ — fails on HIGH/CRITICAL only (MEDIUM/LOW accepted risk).
# Paths excluded from Phase 1: scripts/, artifacts/, mockup-sandbox, test fixtures.
#
# Usage: bash scripts/security-scan.sh
# Exit codes:
#   0 — no HIGH/CRITICAL findings in either phase (PASSED)
#   1 — one or more HIGH/CRITICAL findings (BLOCKED)
#   2 — scanner error or JSON parse failure (BLOCKED — fail closed)

set -euo pipefail

SCAN_TARGETS="server client/src shared"
SCRIPTS_TARGET="scripts"

# Locate semgrep — prefer the fixed Nix store path, fall back to PATH
SEMGREP_BIN="semgrep"
if [ -x "/nix/store/y7m7h744qpw8hidkkxnhx7wzgv59w287-replit-runtime-path/bin/semgrep" ]; then
  SEMGREP_BIN="/nix/store/y7m7h744qpw8hidkkxnhx7wzgv59w287-replit-runtime-path/bin/semgrep"
fi

if ! command -v "${SEMGREP_BIN}" &>/dev/null && [ ! -x "${SEMGREP_BIN}" ]; then
  echo "ERROR: semgrep not found. Install it or ensure it is on PATH."
  exit 2
fi

echo "========================================"
echo "  BrainTrack SAST Security Scan"
echo "  Semgrep: $(${SEMGREP_BIN} --version 2>&1 | grep -v 'new version' | head -1)"
echo "========================================"
echo ""

# ─────────────────────────────────────────────────────────────
# Helper: parse_semgrep_json <json_file> <label>
#   Prints a severity summary and echoes TOTAL:<n>/BLOCKING:<n>.
#   Blocking = HIGH, ERROR, or CRITICAL severity in both phases.
# ─────────────────────────────────────────────────────────────
parse_semgrep_json() {
  local json_file="$1"
  local label="$2"

  python3 - "${json_file}" "${label}" <<'PYEOF'
import json, sys

path   = sys.argv[1]
label  = sys.argv[2]

try:
    with open(path) as f:
        data = json.load(f)
except Exception as e:
    print(f"PARSE_ERROR: {e}", flush=True)
    sys.exit(2)

results = data.get("results", [])
blocking_sevs = {"HIGH", "ERROR", "CRITICAL"}

by_severity = {}
for r in results:
    sev = r.get("extra", {}).get("severity", "UNKNOWN").upper()
    by_severity.setdefault(sev, []).append(r)

high_crit = [r for r in results if r.get("extra", {}).get("severity", "").upper() in blocking_sevs]

print(f"TOTAL:{len(results)}")
print(f"BLOCKING:{len(high_crit)}")
print()
print(f"[{label}] Findings by severity:")
for sev in ["CRITICAL", "ERROR", "HIGH", "WARNING", "MEDIUM", "INFO", "LOW"]:
    if by_severity.get(sev):
        print(f"  {sev}: {len(by_severity[sev])}")
if not results:
    print("  (none)")

if high_crit:
    print()
    print(f"[{label}] HIGH / CRITICAL findings (BLOCKING):")
    for r in high_crit:
        loc   = r.get("path", "?")
        line  = r.get("start", {}).get("line", "?")
        check = r.get("check_id", "?")
        msg   = r.get("extra", {}).get("message", "")[:160]
        sev   = r.get("extra", {}).get("severity", "?").upper()
        print(f"  [{sev}] {loc}:{line}")
        print(f"    Rule : {check}")
        print(f"    Msg  : {msg}")
        print()
PYEOF
}

# ─────────────────────────────────────────────────────────────
# PHASE 1 — Production code: server/, client/src/, shared/
# ─────────────────────────────────────────────────────────────
echo "========================================"
echo "  PHASE 1 — Production code"
echo "  Target: ${SCAN_TARGETS}"
echo "  Excludes: scripts/, artifacts/, node_modules/, test files"
echo "========================================"
echo ""

SEMGREP_JSON=$(mktemp /tmp/braintrack-semgrep-XXXXXX.json)
SEMGREP_LOG=$(mktemp /tmp/braintrack-semgrep-XXXXXX.log)
SEMGREP_EXIT=0

"${SEMGREP_BIN}" scan \
  --config "p/security-audit" \
  --config "p/owasp-top-ten" \
  --config "p/secrets" \
  --json \
  --exclude="scripts" \
  --exclude="artifacts" \
  --exclude="node_modules" \
  --exclude=".local" \
  --exclude="*.test.ts" \
  --exclude="*.spec.ts" \
  --exclude="*.test.tsx" \
  --exclude="*.spec.tsx" \
  --metrics=off \
  ${SCAN_TARGETS} \
  > "${SEMGREP_JSON}" 2>"${SEMGREP_LOG}" || SEMGREP_EXIT=$?

if [ -s "${SEMGREP_LOG}" ]; then
  cat "${SEMGREP_LOG}"
  echo ""
fi

if [ "${SEMGREP_EXIT}" -ge 2 ]; then
  echo "ERROR: Semgrep scanner exited with error code ${SEMGREP_EXIT} (Phase 1)"
  rm -f "${SEMGREP_JSON}" "${SEMGREP_LOG}"
  exit 2
fi

if [ ! -s "${SEMGREP_JSON}" ]; then
  echo "ERROR: Semgrep produced no JSON output (Phase 1). Failing closed."
  rm -f "${SEMGREP_JSON}" "${SEMGREP_LOG}"
  exit 2
fi

PHASE1_RESULT=$(parse_semgrep_json "${SEMGREP_JSON}" "Phase 1") || {
  echo "${PHASE1_RESULT}"
  echo "ERROR: Failed to parse Semgrep JSON output (Phase 1). Failing closed."
  rm -f "${SEMGREP_JSON}" "${SEMGREP_LOG}"
  exit 2
}

rm -f "${SEMGREP_JSON}" "${SEMGREP_LOG}"

echo "${PHASE1_RESULT}"

PHASE1_HIGH=$(echo "${PHASE1_RESULT}" | grep "^BLOCKING:" | cut -d: -f2 || echo "0")
PHASE1_TOTAL=$(echo "${PHASE1_RESULT}" | grep "^TOTAL:" | cut -d: -f2 || echo "0")

echo ""
echo "----------------------------------------"
if [ "${PHASE1_HIGH}" -gt 0 ]; then
  echo "PHASE 1 RESULT: BLOCKED — ${PHASE1_HIGH} HIGH/CRITICAL finding(s) in production code."
else
  echo "PHASE 1 RESULT: PASSED — ${PHASE1_TOTAL} total finding(s), none HIGH or CRITICAL."
fi
echo ""

# ─────────────────────────────────────────────────────────────
# PHASE 2 — Operator scripts: scripts/
# Only HIGH/CRITICAL findings block (MEDIUM/LOW are accepted risk
# for non-production-reachable operator tooling per FIND-010–018).
# ─────────────────────────────────────────────────────────────
echo "========================================"
echo "  PHASE 2 — Operator scripts"
echo "  Target: ${SCRIPTS_TARGET}/"
echo "  Blocking threshold: HIGH / CRITICAL only"
echo "  Note: MEDIUM/LOW are accepted risk (scripts are not"
echo "        production-reachable; see docs/security-findings.md)"
echo "========================================"
echo ""

SEMGREP_JSON2=$(mktemp /tmp/braintrack-semgrep-XXXXXX.json)
SEMGREP_LOG2=$(mktemp /tmp/braintrack-semgrep-XXXXXX.log)
SEMGREP_EXIT2=0

"${SEMGREP_BIN}" scan \
  --config "p/security-audit" \
  --config "p/owasp-top-ten" \
  --config "p/secrets" \
  --json \
  --exclude="node_modules" \
  --exclude=".local" \
  --metrics=off \
  ${SCRIPTS_TARGET} \
  > "${SEMGREP_JSON2}" 2>"${SEMGREP_LOG2}" || SEMGREP_EXIT2=$?

if [ -s "${SEMGREP_LOG2}" ]; then
  cat "${SEMGREP_LOG2}"
  echo ""
fi

if [ "${SEMGREP_EXIT2}" -ge 2 ]; then
  echo "ERROR: Semgrep scanner exited with error code ${SEMGREP_EXIT2} (Phase 2)"
  rm -f "${SEMGREP_JSON2}" "${SEMGREP_LOG2}"
  exit 2
fi

if [ ! -s "${SEMGREP_JSON2}" ]; then
  echo "ERROR: Semgrep produced no JSON output (Phase 2). Failing closed."
  rm -f "${SEMGREP_JSON2}" "${SEMGREP_LOG2}"
  exit 2
fi

PHASE2_RESULT=$(parse_semgrep_json "${SEMGREP_JSON2}" "Phase 2") || {
  echo "${PHASE2_RESULT}"
  echo "ERROR: Failed to parse Semgrep JSON output (Phase 2). Failing closed."
  rm -f "${SEMGREP_JSON2}" "${SEMGREP_LOG2}"
  exit 2
}

rm -f "${SEMGREP_JSON2}" "${SEMGREP_LOG2}"

echo "${PHASE2_RESULT}"

PHASE2_HIGH=$(echo "${PHASE2_RESULT}" | grep "^BLOCKING:" | cut -d: -f2 || echo "0")
PHASE2_TOTAL=$(echo "${PHASE2_RESULT}" | grep "^TOTAL:" | cut -d: -f2 || echo "0")

echo ""
echo "----------------------------------------"
if [ "${PHASE2_HIGH}" -gt 0 ]; then
  echo "PHASE 2 RESULT: BLOCKED — ${PHASE2_HIGH} HIGH/CRITICAL finding(s) in scripts/."
else
  echo "PHASE 2 RESULT: PASSED — ${PHASE2_TOTAL} total finding(s), none HIGH or CRITICAL."
fi
echo ""

# ─────────────────────────────────────────────────────────────
# Final verdict
# ─────────────────────────────────────────────────────────────
TOTAL_HIGH=$(( PHASE1_HIGH + PHASE2_HIGH ))

echo "========================================"
if [ "${TOTAL_HIGH}" -gt 0 ]; then
  echo "FINAL RESULT: BLOCKED — ${TOTAL_HIGH} HIGH/CRITICAL finding(s) detected."
  echo ""
  echo "To suppress a false positive, add a '# nosemgrep: <rule-id>' comment"
  echo "on the flagged line AND document it in docs/security-findings.md."
  echo "See the register for the required FIND-XXX format."
  exit 1
else
  COMBINED_TOTAL=$(( PHASE1_TOTAL + PHASE2_TOTAL ))
  echo "FINAL RESULT: PASSED — ${COMBINED_TOTAL} total finding(s) across both phases, none HIGH or CRITICAL."
  exit 0
fi
