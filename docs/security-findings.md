# Security Findings Register

**Audit date:** May 2026
**Scanners:** Dependency audit (npm audit), SAST (Semgrep), HoundDog

---

## Summary

| Scanner    | Critical | High | Medium | Low |
|------------|----------|------|--------|-----|
| Dependency | 0        | 0    | 0      | 0   |
| SAST       | 0        | 2    | 16     | 14  |
| HoundDog   | 0        | 0    | 0      | 1   |

---

## Findings

### HIGH — SAST

#### FIND-001 · sql.raw identifier injection risk
- **File:** `server/storage.ts` (GDPR erasure function)
- **Severity:** High
- **Status:** Fixed (Task #442)
- **Rationale:** Drizzle's parameterised builders cannot express dynamic table/column identifiers. The function queries `information_schema` for column names that match link-column patterns, then issues `DELETE FROM <table> WHERE <col> = <userId>` inside a transaction. An explicit `assertSafeIdentifier()` helper (regex `/^[a-z_][a-z0-9_]*$/i`) now guards every identifier before it enters `sql.raw()`, and is called twice — once during filtering and once immediately before the interpolation — making the guard auditable and belt-and-suspenders.

---

### LOW — HoundDog (GDPR / Privacy)

#### FIND-002 · PII email address in server log
- **File:** `server/replit_integrations/auth/replitAuth.ts:178`
- **Severity:** Low
- **Status:** Fixed (Task #442)
- **Rationale:** The admin-demotion log line previously emitted the user's full email address, violating GDPR Article 5(1)(f) data-minimisation. The log now records only the user's internal ID and a two-character redacted email hint (`ab***`).

---

### MEDIUM — SAST

#### FIND-003 · Open redirect via server-delivered CTA URL (notifications panel)
- **File:** `client/src/components/notifications-panel.tsx:160`
- **Severity:** Medium
- **Status:** Fixed (Task #442)
- **Rationale:** `notif.data?.ctaUrl` from the server was passed directly to `window.location.href` for non-http URLs. A new `isSafeInternalPath()` utility (`client/src/lib/safe-path.ts`) validates that the path starts with `/`, is not protocol-relative (`//`), and does not use a dangerous scheme (`javascript:`, `data:`, `vbscript:`, `file:`). The assignment is now gated behind this check.

#### FIND-004 · Open redirect via server-delivered action href (nova-bot)
- **File:** `client/src/components/nova-bot.tsx:489`
- **Severity:** Medium
- **Status:** Fixed (Task #442)
- **Rationale:** `action.href` from the server was used directly in `window.location.href` for http-prefixed URLs. External URLs are now opened with `window.open(..., "_blank", "noopener,noreferrer")`, and internal paths are validated via `isSafeInternalPath()` before being passed to wouter's `setLocation`.

#### FIND-005 · Path traversal in voice-note backfill script
- **File:** `scripts/backfill-voice-note-transcripts.ts:55-65`
- **Severity:** Medium (admin-only script, not production-reachable)
- **Status:** Fixed (Task #442)
- **Rationale:** `audioUrl` from the database was cleaned of leading slashes and joined onto filesystem paths without containment verification. The resolved path is now checked with `path.startsWith(UPLOADS_ROOT + "/")` before `existsSync` is called.

#### FIND-006 · Path traversal in topic-audio generation script
- **File:** `scripts/generate-topic-audio.ts:109`
- **Severity:** Medium (background script, not production-reachable)
- **Status:** Fixed (Task #442)
- **Rationale:** The filename is constructed from `topic.id` (integer), a fixed language code, and a SHA-256 hex digest — no user input. A path-containment assertion was added as a belt-and-suspenders measure so any future refactor that changes filename construction cannot silently create a traversal.

#### FIND-007 · ReDoS in dynamic RegExp construction (patch-missing-memos)
- **File:** `scripts/patch-missing-memos.ts:115`
- **Severity:** Medium (admin-only script, not production-reachable)
- **Status:** Fixed (Task #442)
- **Rationale:** `qNum` (from the database, e.g. `"1.1"`) was interpolated into `new RegExp()` after only escaping literal dots. A full `escapeRegExp()` helper (replaces all regex metacharacters with `\$&`) now escapes the input. The construction is also wrapped in `try/catch` so a malformed pattern logs and skips rather than crashing the script.

#### FIND-008 · ReDoS in dynamic RegExp construction (patch-supplemental-memos)
- **File:** `scripts/patch-supplemental-memos.ts:66,77`
- **Severity:** Medium (admin-only script, not production-reachable)
- **Status:** Fixed (Task #442)
- **Rationale:** Same class of issue as FIND-007. Applied the same `escapeRegExp()` helper and `try/catch` wrapping to all three `new RegExp()` calls in this script.

#### FIND-009 · ReDoS in dynamic RegExp construction (seed-topic-content)
- **File:** `scripts/seed-topic-content.ts:673`
- **Severity:** Medium (seed script, not production-reachable)
- **Status:** False Positive
- **Rationale:** The `new RegExp()` call at line 673 already uses the canonical escape pattern `target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")` before interpolation. No fix required.

#### FIND-010 through FIND-018 · Remaining MEDIUM / LOW SAST findings
- **Files:** Various admin-only scripts and mockup-sandbox files
- **Severity:** Medium / Low
- **Status:** Accepted Risk / False Positive
- **Rationale:**
  - **Admin scripts** (`scripts/` directory) are never reachable in production (NODE_ENV=production); they run as one-off CLI tools with operator credentials. Findings in these files are accepted risk.
  - **Mockup sandbox** (`artifacts/mockup-sandbox/`) is a dev-only design workspace explicitly excluded from the production app. Dynamic module loads there are accepted by design (see task scope note).
  - **`client/src/lib/download-file.ts:84`** — `window.location.href = url` is used as a fallback for file downloads where `window.open` was blocked by the browser. The URL is always the result of a server-signed download endpoint, not server-delivered arbitrary content, so open-redirect risk is negligible. Accepted risk with this rationale documented.

---

### FALSE POSITIVE

#### FIND-019 · Missing SRI integrity on `<link rel="alternate">` (client/index.html:23-25)
- **File:** `client/index.html:23-25`
- **Severity:** Low (scanner noise)
- **Status:** False Positive — documented with inline HTML comment
- **Rationale:** The SRI `integrity` attribute is only applicable to `<link rel="stylesheet">` and `<script>` elements that fetch cross-origin subresources (W3C SRI spec). `<link rel="alternate" hreflang="...">` is a metadata hint for search engines and does not load any subresource; the attribute has no meaning and cannot be set on it. An inline HTML comment has been added above these tags so future scanner runs can be dismissed quickly.

---

## Automated Security Scan

A SAST validation step named **`security-scan`** is registered and runs on every task merge.

**Command:** `bash scripts/security-scan.sh`
**Rulesets:** `p/security-audit`, `p/owasp-top-ten`, `p/secrets`

The scan runs in two clearly-labelled phases:

### Phase 1 — Production code
**Scope:** `server/`, `client/src/`, `shared/`
**Excluded:** `scripts/`, `artifacts/`, `node_modules/`, test files (`*.test.ts`, `*.spec.ts`, `*.test.tsx`, `*.spec.tsx`)
**Blocking threshold:** Any finding at `HIGH`, `ERROR`, or `CRITICAL` severity fails the scan (exit 1)

### Phase 2 — Operator scripts
**Scope:** `scripts/`
**Blocking threshold:** `HIGH`, `ERROR`, or `CRITICAL` only — MEDIUM and LOW findings are **accepted risk** (scripts are operator-only CLI tools, never reachable in production; see FIND-010 through FIND-018 rationale above)
**Note:** Existing accepted-risk MEDIUM entries in `scripts/` are suppressed by the HIGH-only blocking threshold — no new `nosemgrep` comments are required for them.

Both phases must pass for the scan to exit 0. A HIGH/CRITICAL finding in either phase exits 1 (BLOCKED).

### Suppression Policy

When a finding is a **confirmed false positive** or an **accepted risk**:

1. Add a `# nosemgrep: <rule-id>` inline comment on the flagged line.
2. Add a new `FIND-XXX` entry to this register (below) with:
   - File path and line number
   - Severity and rule ID
   - Status: `False Positive` or `Accepted Risk`
   - Rationale: why the finding is safe to suppress (specific, not generic)
3. Include the register update in the same PR/commit as the suppression comment.

**Never suppress a `HIGH`/`CRITICAL` finding without a written rationale in this register.**

---

## Out of Scope

- `artifacts/mockup-sandbox/` — dev-only sandbox, not production-reachable. Dynamic module-load patterns there are accepted by design.
- `scripts/` — operator-only CLI tools, never reachable in production (`NODE_ENV=production`). **Note:** Phase 2 of the security scan now covers `scripts/` for HIGH/CRITICAL findings. MEDIUM/LOW findings remain accepted risk (see FIND-010 through FIND-018).
- Penetration testing, runtime fuzzing, or any new feature development.
