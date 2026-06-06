# BrainTrack QA Test Suite

This directory contains the full BrainTrack test suite — automated specs **and** the master test matrix that tracks every planned test case across all 11 quality layers.

---

## Directory structure

```
tests/
├── e2e/                        # Playwright end-to-end specs
├── unit/                       # Vitest unit tests
├── generate-matrix.js          # Script that produces the master matrix files
├── master-test-matrix.csv      # Machine-readable test matrix (242 rows)
├── master-test-matrix.xlsx     # Excel master matrix with summary + priority guide
└── test-matrix.csv             # Legacy matrix (subset; kept for reference)
```

---

## Master test matrix

### Column schema

| Column | Description |
|---|---|
| **ID** | Unique test case identifier following the `TC-{MODULE}-{NNN}` convention |
| **Layer** | One of the 11 quality layers (see below) |
| **Module** | Feature area or subsystem under test |
| **Scenario** | Short human-readable description of what is being tested |
| **Precondition** | State that must exist before the test can run |
| **Steps** | Actions the tester or automation must perform |
| **Expected Result** | Observable outcome that proves the test passes |
| **Priority** | P0 / P1 / P2 / P3 (see priority definitions below) |
| **Type** | Test type matching the layer (Functional, Regression, Integration, API, Security, Performance, Accessibility, Cross-Browser, Migration, Compliance, UAT) |
| **Status** | Current execution status — `Pending`, `Pass`, `Fail`, `Blocked`, `Skipped` |

### 11 quality layers

| # | Layer | Description |
|---|---|---|
| 1 | Functional | Core feature behaviour and UI flows |
| 2 | Regression | Previously working flows that must not break |
| 3 | Integration | Cross-service and inter-module interaction |
| 4 | API | REST endpoint contract, schema, and status code validation |
| 5 | Permission/Security | Role enforcement, IDOR, brute-force, hardening |
| 6 | Performance/Load | Latency, concurrency, memory, and observability |
| 7 | Accessibility | WCAG AA, keyboard navigation, screen readers |
| 8 | Cross-Browser/Mobile | Chrome, Safari, Edge desktop; Android Chrome; iPhone Safari |
| 9 | Data Migration | Schema changes, seed scripts, rollback |
| 10 | Compliance/Consent | Voice consent, POPIA/GDPR, parent consent audit trails |
| 11 | UAT | Business rules and end-to-end user journeys |

---

## Priority definitions and release impact

| Priority | Definition | Release impact |
|---|---|---|
| **P0** | App unusable / data loss / security breach if this fails | **Release blocker** — must be fixed before any release |
| **P1** | Core feature broken / significant user impact | **Release blocker** — must be fixed before GA |
| **P2** | Feature degraded / workaround exists | Should fix before release; can ship with a known-issue note |
| **P3** | Edge case / cosmetic / nice-to-have | Fix in next sprint; does not block release |

---

## Re-generating the matrix

After adding or editing test cases in `generate-matrix.js`, run:

```bash
node tests/generate-matrix.js
```

This overwrites both `master-test-matrix.csv` and `master-test-matrix.xlsx`.

Requirements: `exceljs` must be installed (`npm install exceljs`).

### Adding new test cases

1. Open `tests/generate-matrix.js`.
2. Append a new `makeRow(...)` call to the `EXISTING` array (for cases already automated) or the `NEW_CASES` array (for planned cases).
3. Use the next available number for the module: e.g. if the last `TC-AUTH-*` is `TC-AUTH-009`, add `TC-AUTH-010`.
4. Re-run the generator script.

### ID naming convention

```
TC-{MODULE}-{NNN}
   │          └─ zero-padded 3-digit number, contiguous within the module
   └─ uppercase short module code (e.g. AUTH, LINK, QUIZ, API, SECH, BIZ)
```

---

## Running automated tests

### Required environment variables

| Variable | Required for | Description |
|---|---|---|
| `BASE_URL` | E2E tests | Base URL of the running dev server (default: `http://localhost:5000`) |
| `TEST_MODE` | E2E auth tests | Must be `true` to enable the `/api/test/setup` seed endpoint |

The dev server must be running before executing E2E specs (`npm run dev` in a separate terminal, or use `reuseExistingServer: true` in playwright.config.ts which is already configured).

```bash
# Unit tests (Vitest — no server required)
npm run test:unit

# E2E tests — fast subset (page-and-public project, ~30s)
TEST_MODE=true BASE_URL=http://localhost:5000 npx playwright test --project=page-and-public --reporter=line

# E2E tests — authenticated flows (auth-protected + module-flows, ~60s)
TEST_MODE=true BASE_URL=http://localhost:5000 npx playwright test --project=auth-protected --project=module-flows --reporter=line

# E2E tests — full suite (all three projects)
TEST_MODE=true BASE_URL=http://localhost:5000 npm run test:e2e

# E2E with interactive UI
TEST_MODE=true BASE_URL=http://localhost:5000 npm run test:e2e:ui

# All tests (unit + E2E)
TEST_MODE=true BASE_URL=http://localhost:5000 npm test
```

### Playwright projects

| Project | Spec files | Notes |
|---|---|---|
| `page-and-public` | accessibility, performance, quiz, regression, exam, print, layout, study-plan, study-readiness, mindmap, school-portal, payments | Mix of page and API tests; no auth token needed |
| `module-flows` | onboarding, admin, dashboard | Page + API; no auth token needed |
| `auth-protected` | audio, parent, linking, gamification, ai-notes, auth, security | Require `TEST_MODE=true` — tests call `/api/test/setup` for seeded JWTs |

### Registered validation step

The `e2e-tests` validation step runs the `page-and-public` project (the fastest, no-auth subset) and can be triggered from the agent tools panel.

---

## Matrix statistics (as of last generation)

| Layer | Total | P0 | P1 | P2 | P3 |
|---|---|---|---|---|---|
| Functional | 145 | 64 | 57 | 24 | 0 |
| Regression | 5 | 5 | 0 | 0 | 0 |
| Integration | 16 | 1 | 9 | 6 | 0 |
| API | 15 | 7 | 6 | 2 | 0 |
| Permission/Security | 14 | 4 | 1 | 9 | 0 |
| Performance/Load | 16 | 1 | 4 | 10 | 1 |
| Accessibility | 7 | 0 | 0 | 7 | 0 |
| Cross-Browser/Mobile | 9 | 0 | 4 | 4 | 1 |
| Data Migration | 6 | 3 | 3 | 0 | 0 |
| Compliance/Consent | 4 | 3 | 1 | 0 | 0 |
| UAT | 5 | 1 | 2 | 2 | 0 |
| **TOTAL** | **242** | **89** | **87** | **64** | **2** |
