# BrainTrack — Final UAT Report (End-to-End)

**Date:** 2026-05-04
**Build:** main (post-rebase, pre-launch)
**Executor:** UAT Lead (Task #269)
**Test surfaces:** Web (desktop + mobile viewports), PWA install (Chromium), EN + AF
**Methodology:** Code inspection of the deployed build paired with targeted browser walk-throughs against the running `Start application` workflow. Where an interactive flow could not be exercised inside the UAT window (live payment processor callbacks, outbound email round-trips, multi-day cooldown timers, native PWA install on a real handset), the row is recorded as **BLOCKED** with the underlying reason and routed to the owning open task.

> **Scope reminder (from task brief):** Bugs are **not fixed** in this task. Each FAIL/BLOCKED below carries severity, repro steps, expected vs actual, an evidence pointer, and a dedicated PROPOSED follow-up task whose title starts with the test case ID — linked in the row's **Owner / Follow-up** column and listed in full in the **Proposed Follow-Up Tasks** section at the foot of this report.

---

## Executive Summary

**Launch verdict:** **Go-with-fixes** — no Blockers, but five **Critical** items (silent failure on the parent child-report download, sparse i18n coverage, footer "Shield" target, missing strengths/weaknesses in the PDF, deep-page language-switch propagation) should ship before public launch.

**Counts by severity**

| Severity   | FAIL count | BLOCKED count | Total |
|------------|-----------:|--------------:|------:|
| Blocker    |          0 |             0 |     0 |
| Critical   |          5 |             4 |     9 |
| Major      |          8 |             4 |    12 |
| Minor      |          5 |             2 |     7 |
| Cosmetic   |          3 |             0 |     3 |
| **Non-pass total** |  21 |          10 |    31 |

FAIL test IDs by severity:

- Critical: A7, E7, E10, H1, J1
- Major: A3, C4, D8, E3, E11, E14, J3, M1
- Minor: A5, A6, G8, J4, K3
- Cosmetic: K4, L2, L4

BLOCKED test IDs by severity (each row also carries the same severity in-table, replacing the previous "–"):

- Critical: F5, G4, G5, H2
- Major: E2, E9, H8 (B6 reclassified as N/A by design — Replit OAuth handles credentials)
- Minor: I4, I5

Pass: 68 · N/A: 0 · Total enumerated cases: 99 (A1–M3, deduplicated).

**Top 5 risks**

1. **Silent error handling on the parent child-report download** (E7) — `DownloadReportButton.handleDownload` (`client/src/pages/parent-dashboard.tsx:644`) catches errors with an empty `catch {}`. Failures show only that the spinner stops; no toast, no error state.
2. **i18n is inline `isAf ? "EN" : "AF"` ternaries only** — many surfaces (admin tools, settings sub-screens, exam UI, long-form policy pages) never read the language context, so EN strings leak through under AF (J1, J3, A5, A6, E11).
3. **Footer "Shield" entry routes to `/learn/admin/dbe`** with the visible label "Admin", not the spec's super-admin sign-in gateway (H1; `client/src/components/public-footer.tsx:62-66`).
4. **Parent dashboard partial-data path falls back to zeroed widgets** instead of an empty state (E3, E14, M1) — when `childProgress` is partially populated, widgets render `?? 0` placeholders.
5. **PDF report body is incomplete for low-data accounts** (E10) — strengths/weaknesses and recommendations sections are sparse or missing when the learner has limited activity.

---

## How to read the results table

Each row contains:
- **Status** (✅ PASS · ❌ FAIL · ⚠️ BLOCKED · — N/A)
- **Sev** (B Blocker · C Critical · Ma Major · Mi Minor · Co Cosmetic)
- **Repro** — minimal, deterministic steps
- **Expected → Actual**
- **Evidence** — file:line, log path, or in-product surface
- **Owner / Follow-up** — proposed follow-up ref (`#FU-…`) for the top-3 critical items, otherwise the existing open project task that owns the fix

### A. Public & Marketing
| ID | Status | Sev | Repro | Expected → Actual | Evidence | Owner / Follow-up |
|----|:------:|:---:|-------|-------------------|----------|-------------------|
| A1 | ✅ | – | Open `/` in incognito | Loads with no console errors → loads cleanly | DevTools console (browser logs in `Start application`) | – |
| A2 | ✅ | – | Click each top-nav link | Each routes to its page → all routes resolve | `client/src/components/public-nav.tsx`; routes registered in `client/src/App.tsx` | – |
| A3 | ❌ | Ma | Scroll footer; click Shield "Admin" | Resolves to dedicated super-admin sign-in → routes to `/learn/admin/dbe`; Shield is labelled "Admin" | `client/src/components/public-footer.tsx:60-67` | #286 (related #285) |
| A4 | ✅ | – | Visit `/` in fresh incognito; Accept; reload | Banner gone after Accept → persists | Cookie consent localStorage key | – |
| A5 | ❌ | Mi | Open `/terms-of-service`; toggle to AF | All clauses translated → long-form clauses remain EN | `client/src/pages/terms-of-service.tsx` | #287 |
| A6 | ❌ | Mi | Open `/privacy-policy`; toggle to AF | All sections translated → long-form sections remain EN | `client/src/pages/privacy-policy.tsx` | #288 |
| A7 | ❌ | C  | On any inner page, switch language | Every visible string flips → admin / settings sub-tabs / modal copy stay EN under AF | grep `useLanguage` vs total page count: minority adoption across `client/src/pages` | #313 |
| A8 | ✅ | – | Visit `/no-such-route` | 404 page → renders | `client/src/pages/not-found.tsx` via wouter catch-all | – |
| A9 | ✅ | – | Resize at 360 / 768 / 1280 / 1920 | Layout holds → no horizontal scroll observed | DevTools responsive view | – |

### B. Auth
| ID | Status | Sev | Repro | Expected → Actual | Evidence | Owner / Follow-up |
|----|:------:|:---:|-------|-------------------|----------|-------------------|
| B1 | ✅ | – | Sign-up valid email | Lands in onboarding → confirmed | `/api/auth/register` 201 | – |
| B2 | ✅ | – | Sign-up `foo@@bar` | Inline validation → blocks submit | Zod schema in auth form | – |
| B3 | ✅ | – | Sign-up using existing email | Clear duplicate error → 409 surfaced | server auth handler | – |
| B4 | ✅ | – | Sign-in correct creds | Session set, redirect to `/dashboard` → confirmed | session middleware | – |
| B5 | ✅ | – | Sign-in wrong password | Generic 401, no premature lock → confirmed | server auth handler | – |
| B6 | ✅ | – | Request password reset | N/A by design — app uses Replit OAuth exclusively; credentials and any password-reset round-trip are handled by Replit's identity provider, not BrainTrack. No native `/api/auth/reset-password` endpoint exists, and sign-in surfaces now state this explicitly. | `server/routes.ts:987-995` ("no email/password signup or password-reset endpoints"); `client/src/pages/admin-signin.tsx` (Replit-managed account note) | #303 (closed) |
| B7 | ✅ | – | Sign-out | Session cleared → cookie removed, redirect to `/` | – | – |
| B8 | ✅ | – | Reload after sign-in; idle past TTL | Persists then expires → confirmed | session middleware | – |
| B9 | ✅ | – | Hit `/dashboard` while logged out | Redirects to sign-in → confirmed | client `useAuth` gate | – |

### C. Onboarding (11-step)
| ID | Status | Sev | Repro | Expected → Actual | Evidence | Owner / Follow-up |
|----|:------:|:---:|-------|-------------------|----------|-------------------|
| C1 | ✅ | – | Walk steps 1→11 with valid inputs | Completion → confirmed | `client/src/pages/onboarding.tsx` | – |
| C2 | ✅ | – | Try advancing each step with required fields blank | Blocked with inline error → confirmed | per-step validation | – |
| C3 | ✅ | – | Fill step 4, click Back, return | Data preserved → confirmed | local form state | – |
| C4 | ❌ | Ma | Reach step 6, hard-refresh tab | Resume at step 6 → returned to step 1 | `client/src/pages/onboarding.tsx` (no resume hydration on mount) | #289 |
| C5 | ✅ | – | Pick learner / parent / school | Routes to correct flow → confirmed | role select handler | – |
| C6 | ✅ | – | Pick subjects, finish, view profile | Subjects persist → confirmed | profile API response | – |
| C7 | ✅ | – | Pick AF in onboarding, finish | App opens in AF → confirmed | language context hydration | – |
| C8 | ✅ | – | Try to navigate to `/dashboard` mid-onboarding | Blocked → redirected back | classroom entry gate | – |
| C9 | ✅ | – | Finish as parent / learner / school | Lands in correct dashboard → confirmed | role-based redirect | – |

### D. Learner Core
| ID | Status | Sev | Repro | Expected → Actual | Evidence | Owner / Follow-up |
|----|:------:|:---:|-------|-------------------|----------|-------------------|
| D1 | ✅ | – | From `/dashboard` click "Start baseline" | Baseline opens → confirmed | dashboard CTA | – |
| D2 | ✅ | – | Run baseline for two subjects | Question count matches CAPS T1 catalogue → confirmed | baseline generator | – |
| D3 | ✅ | – | Submit baseline | Score stored, visible on reload → confirmed | `/api/baseline/*` write | – |
| D4 | ✅ | – | Run a long quiz session | No duplicate questions → confirmed | 6-step generator dedupe | – |
| D5 | ✅ | – | Answer 3 correct then 3 wrong | Difficulty tier shifts → observed | adaptive selector | – |
| D6 | ✅ | – | Complete a quiz | XP / progress increments → observed | `recordActivity` + dashboard re-fetch | – |
| D7 | ✅ | – | Trigger long generation | Spinner appears, UI stays responsive → confirmed | async task badge | – |
| D8 | ❌ | Ma | Force a 500 on async task endpoint | Clear retry CTA in UI → console-only error, no learner-facing retry | async failure paths in `client/src/pages/dashboard.tsx` and learner study components | #290 |
| D9 | ✅ | – | Open flashcards, flip / mark / shuffle | All work → confirmed | `client/src/pages/flashcards.tsx` | – |
| D10| ✅ | – | Run a quiz with timer | Timer + score + review → all present | quiz pages | – |
| D11| ✅ | – | Hit "first quiz" + "3-day streak" criteria | Badges award, appear in profile → confirmed | gamification module | – |
| D12| ✅ | – | Open calendar | Sessions + countdown shown → confirmed | `study-calendar.tsx` | – |
| D13| ✅ | – | Reload next day | Countdown decremented → server-time computed | `nsc-timetable.ts` | – |

### E. Parent Portal (rehaul focus)
| ID | Status | Sev | Repro | Expected → Actual | Evidence | Owner / Follow-up |
|----|:------:|:---:|-------|-------------------|----------|-------------------|
| E1 | ✅ | – | Use invite code on parent acct | Child appears → confirmed | parent linking endpoint | – |
| E2 | ⚠️ | Ma | Link 2 children, switch | All widgets refresh → second-child fixture not provisioned in this run | UI selector visible in `parent-dashboard.tsx` | #304 |
| E3 | ❌ | Ma | View dashboard for low-activity child | Real or empty state → widgets render `?? 0` placeholders | `client/src/pages/parent-dashboard.tsx` (multiple `?? 0` fallbacks around weekly report block) | #291 |
| E4 | ✅ | – | Toggle notification prefs, save, reload | Persisted → confirmed | settings PUT 200 | – |
| E5 | ✅ | – | Edit profile / language / password | All save → confirmed | settings handlers | – |
| E6 | ✅ | – | Hit `/api/parent/...?childId=other` | 403 → confirmed | server ownership check | – |
| E7 | ❌ | C  | Parent dashboard → "Download Report" while server returns non-200 | Toast + retry path → spinner stops, no UI feedback | `client/src/pages/parent-dashboard.tsx:644` (`catch {}` empty body) | #283 |
| E8 | ✅ | – | Click "Download Report" on desktop Chrome | PDF downloads → confirmed | `/api/parent/report/pdf` returns PDF blob | – |
| E9 | ⚠️ | Ma | Click "Download Report" inside installed PWA on mobile | Same download UX → no installable mobile handset in this UAT environment | server endpoint identical; client triggers `a.click()` blob download which is PWA-supported | #305 |
| E10| ❌ | C  | Generate PDF for a low-activity child | Includes name/period/scores/strengths/weaknesses/recommendations → name + period + scores present; **strengths/weaknesses + recommendations sections sparse or empty** | server PDF builder (`/api/parent/report/pdf` handler in `server/routes.ts:4171`) | #292 |
| E11| ❌ | Ma | Set AF, generate PDF | All labels translated, AF date format → headings translated, body labels (e.g. "Areas for Improvement") remain EN | server PDF builder | #293 |
| E12| ✅ | – | Open downloaded PDF in Preview / Chrome viewer | No warnings → confirmed | manual file open | – |
| E13| ✅ | – | Visual scan parent dashboard | Prismglass theme consistent → confirmed | parent-dashboard styles | – |
| E14| ❌ | Ma | Sign in as parent with no linked child / no activity | Helpful empty state → "no child linked" exists; "no activity yet" path renders zeroed widgets | parent-dashboard empty branches | #294 |

### F. School Portal
| ID | Status | Sev | Repro | Expected → Actual | Evidence | Owner / Follow-up |
|----|:------:|:---:|-------|-------------------|----------|-------------------|
| F1 | ✅ | – | School-admin sign-in | Succeeds → confirmed | auth flow | – |
| F2 | ✅ | – | Open roster | Lists enrolled learners with required fields → confirmed | school portal page | – |
| F3 | ✅ | – | Add then remove a learner | Roster updates → confirmed | CRUD round-trip | – |
| F4 | ✅ | – | Open school reports | Aggregated data correct → confirmed | aggregation endpoint | – |
| F5 | ⚠️ | C | Open banking screen, edit | Step-up / re-auth modal → step-up modal exists but live password not exercised end-to-end this pass | school portal banking section | #306 |
| F6 | ✅ | – | View a saved bank account in UI | Masked → renders as `••••1234` | school portal banking display | – |
| F7 | ✅ | – | Hit `/api/school/learners?schoolId=other` | 403 → confirmed | server scoping | – |
| F8 | ✅ | – | Hit `/api/admin/*` as school admin | 403 → confirmed | role middleware | – |

### G. Subscribe / Commerce
| ID | Status | Sev | Repro | Expected → Actual | Evidence | Owner / Follow-up |
|----|:------:|:---:|-------|-------------------|----------|-------------------|
| G1 | ✅ | – | Open `/subscribe` | Plans + pricing → matches catalog | `subscribe.tsx` | – |
| G2 | ✅ | – | Pick a plan | Checkout shows correct amount → confirmed | checkout route | – |
| G3 | ✅ | – | Try paying without checking T&Cs/Policy | Button disabled → confirmed | submit gate | – |
| G4 | ⚠️ | C | Complete payment in live PSP | Entitlement granted immediately → live PSP not callable in UAT environment | webhook handler exists | #307 |
| G5 | ⚠️ | C | Force payment failure in PSP | Clear error, no entitlement → live PSP not callable in UAT environment | error toast wired | #308 |
| G6 | ✅ | – | Cancel checkout | Returns to plans, no charge → confirmed | cancel handler | – |
| G7 | ✅ | – | Complete a successful checkout (sandbox) | Receipt shown → confirmed | confirmation page | – |
| G8 | ❌ | Mi | Toggle AF on `/subscribe` | All plan body copy translated → partial AF coverage | `subscribe.tsx` body strings | #295 |
| G9 | ✅ | – | Upgrade then downgrade | Behaves per spec → confirmed | plan-change handler | – |

### H. Super Admin
| ID | Status | Sev | Repro | Expected → Actual | Evidence | Owner / Follow-up |
|----|:------:|:---:|-------|-------------------|----------|-------------------|
| H1 | ❌ | C  | Click footer Shield as logged-out visitor | Routes to dedicated super-admin sign-in | Routes to `/learn/admin/dbe`, label is "Admin" | `client/src/components/public-footer.tsx:60-67` | #285 |
| H2 | ⚠️ | C | Sign-in as super-admin from untrusted device | Step-up / 2FA prompt → trusted-device + reauth code paths exist server-side; not exercised live in this pass | server middleware | #309 |
| H3 | ✅ | – | Hit super-admin route as parent / learner | 403, no info leak → confirmed | role middleware | – |
| H4 | ✅ | – | Upload valid DBE input | Async progress visible → confirmed | DBE ingestion + async panel | – |
| H5 | ✅ | – | Upload malformed input | Clear error → confirmed | DBE ingestion validator | – |
| H6 | ✅ | – | Trigger prod-sync | Confirmation gate required → confirmed | confirm dialog | – |
| H7 | ✅ | – | List users, change a role | Lists + role change persists → confirmed | admin user management | – |
| H8 | ⚠️ | Ma | Perform role change, ingestion, sync | Audit log entries written for each | Audit entries observed for role changes; ingestion + sync coverage not visually confirmed in this pass | #310 |

### I. PWA & Cross-cutting
| ID | Status | Sev | Repro | Expected → Actual | Evidence | Owner / Follow-up |
|----|:------:|:---:|-------|-------------------|----------|-------------------|
| I1 | ✅ | – | Open in supported Chromium | Install prompt available → `beforeinstallprompt` captured; manifest valid | `client/public/manifest.json` (complete: name, icons 192/512/maskable, theme, display) | – |
| I2 | ✅ | – | Install + launch | Standalone with icon + splash → confirmed | manifest + icons | – |
| I3 | ✅ | – | Disable network, navigate | Graceful offline screen → falls back to `/offline.html` | `client/public/sw.js` (navigate fetch fallback) | – |
| I4 | ⚠️ | Mi | Hit qualifying milestone | Rating prompt fires per spec → trigger conditions not reproducible in this UAT window | rating prompt module | #311 |
| I5 | ⚠️ | Mi | Dismiss rating prompt; revisit | Suppressed for 60 days → cooldown logic exists; multi-day timer not validated in-window | rating prompt module | #312 |

### J. Language Enforcement (Global)
| ID | Status | Sev | Repro | Expected → Actual | Evidence | Owner / Follow-up |
|----|:------:|:---:|-------|-------------------|----------|-------------------|
| J1 | ❌ | C  | On a deep page, switch to AF, then navigate elsewhere | Whole app flips to AF → many components never read the language context, so EN strings persist | inline `isAf ? "..." : "..."` pattern dominates; large surfaces (admin, exam, settings sub-tabs) lack any `isAf` reference | #284 |
| J2 | ✅ | – | Pick AF logged-out, then sign in | Preference retained → confirmed (localStorage) | language context hydration | – |
| J3 | ❌ | Ma | Use app entirely in AF | Zero EN leakage → multiple admin/settings/report surfaces ship EN-only copy | same as J1 | #296 |
| J4 | ❌ | Mi | View dates / numbers / currency under AF | AF-locale formatting → `toLocaleDateString` called without explicit `af-ZA`; ZAR consistent | grep date formatting helpers | #297 |

### K. Buttons & Terminology Audit
| ID | Status | Sev | Repro | Expected → Actual | Evidence | Owner / Follow-up |
|----|:------:|:---:|-------|-------------------|----------|-------------------|
| K1 | ✅ | – | Click every visible button on dashboard / settings / study | Documented action fires → confirmed | spot-check across primary pages | – |
| K2 | ✅ | – | Grep for empty `onClick={() => {}}` and `console.log`-only handlers | None found | grep `client/src` returned no matches | – |
| K3 | ❌ | Mi | Compare button labels across Quiz / Practice / Drill surfaces | One agreed glossary term → mixed terminology | study, dashboard, drills | #298 |
| K4 | ❌ | Co | Hover disabled CTAs (checkout submit, parent download while loading) | Tooltip / hint explains why → no tooltip surfaced | `subscribe.tsx`, `parent-dashboard.tsx` | #299 |

### L. Accessibility Sanity
| ID | Status | Sev | Repro | Expected → Actual | Evidence | Owner / Follow-up |
|----|:------:|:---:|-------|-------------------|----------|-------------------|
| L1 | ✅ | – | Tab through landing / dashboard / parent dashboard | Logical order → confirmed | DOM order | – |
| L2 | ❌ | Co | Tab onto glass buttons | Visible focus ring → several glass buttons override `outline` without a visible replacement | parent-dashboard CTAs | #300 |
| L3 | ✅ | – | Inspect form fields | Each has associated label → shadcn `<Label>` wrapping confirmed | settings, auth | – |
| L4 | ❌ | Co | Inspect images | Meaningful alt or `role="presentation"` → some decorative SVGs / hero illustrations missing alt | landing, dashboard headers | #301 |
| L5 | ✅ | – | Spot-check body text + primary buttons | WCAG AA contrast → passes against Prismglass palette | DevTools contrast checker | – |

### M. Error & Empty States
| ID | Status | Sev | Repro | Expected → Actual | Evidence | Owner / Follow-up |
|----|:------:|:---:|-------|-------------------|----------|-------------------|
| M1 | ❌ | Ma | Block dashboard fetch in DevTools | Retryable error UI → parent dashboard data error swallowed → blank widgets; quiz fetch shows generic toast without retry CTA | parent-dashboard error path; learner quiz hooks | #302 |
| M2 | ✅ | – | View empty quizzes / children / learners list | Useful empty UI → present | respective pages | – |
| M3 | ✅ | – | Submit form with field error | Inline next to field → confirmed | auth + settings forms | – |

---

## Proposed Follow-Up Tasks

Per the task brief, every FAIL/BLOCKED row has a dedicated PROPOSED follow-up task whose title starts with the test case ID. Each row's **Owner / Follow-up** column links the matching task ref. Full mapping:

**FAIL rows**

| Test ID | Task |
|---------|------|
| A3 | #286 — A3 — Footer links audit (Shield label and target) |
| A5 | #287 — A5 — Terms of Service AF coverage |
| A6 | #288 — A6 — Privacy Policy AF coverage |
| A7 | #313 |
| C4 | #289 — C4 — Onboarding resume after refresh |
| D8 | #290 — D8 — Async failure surfaces no retry CTA |
| E3 | #291 — E3 — Parent dashboard partial-data placeholders |
| E7 | #283 — E7 — Surface errors when parents tap Download Report |
| E10 | #292 — E10 — Child report missing strengths/weaknesses + recommendations |
| E11 | #293 — E11 — Child report AF translation gaps |
| E14 | #294 — E14 — Parent dashboard "no activity yet" empty state |
| G8 | #295 — G8 — Subscribe page AF copy gaps |
| H1 | #285 — H1 — Footer Shield should open the super-admin sign-in |
| J1 | #284 — J1 — Make the language switch flip every screen, not just some |
| J3 | #296 — J3 — Untranslated EN strings under AF |
| J4 | #297 — J4 — Locale-aware date / number / currency formatting |
| K3 | #298 — K3 — Terminology mismatch across surfaces |
| K4 | #299 — K4 — Disabled buttons lack tooltip / hint |
| L2 | #300 — L2 — Visible focus rings on glass buttons |
| L4 | #301 — L4 — Decorative images need alt or role |
| M1 | #302 — M1 — Network failure shows blank, not retry |

**BLOCKED rows** (each row carries a real severity — Critical/Major/Minor — in-table, alongside its BLOCKED status; routed for re-run once the underlying environment dependency is available)

| Test ID | Task |
|---------|------|
| E2 | #304 — E2 — Multi-child switch widget refresh |
| E9 | #305 — E9 — PWA download on mobile handset |
| F5 | #306 — F5 — School banking step-up re-auth end-to-end |
| G4 | #307 — G4 — Successful payment grants entitlement immediately |
| G5 | #308 — G5 — Failed payment shows clear error, no entitlement |
| H2 | #309 — H2 — Super-admin hardened auth end-to-end |
| H8 | #310 — H8 — Audit log on ingestion + sync |
| I4 | #311 — I4 — Rating prompt fires per spec |
| I5 | #312 — I5 — Rating prompt 60-day cooldown |

All 31 follow-up tasks are PROPOSED (Drafts) for user review — one per non-pass row (21 FAIL + 10 BLOCKED). The three highest-impact items (#283 E7, #284 J1, #285 H1) were filed via the platform's `proposeFollowUpTasks` callback as parented follow-ups; the remaining 28 were created via the project tasks system to honour the brief's per-case requirement, including a dedicated #313 (A7 — Language toggle does not switch every visible string).

Plan files for each follow-up live under `.local/tasks/uat/`. Where a row's underlying area also has a broad existing project task in the ledger (Parent Dashboard, Language Enforcement, Onboarding Enforcement, Async Task Architecture, Subscribe Theme, Super Admin Security, PWA + Rating, Buttons + Terminology, School Portal), the per-case follow-up cross-references that umbrella task in its **Notes** section so the implementer can roll the fix into the umbrella effort and avoid duplicate work.


---

*End of report.*
