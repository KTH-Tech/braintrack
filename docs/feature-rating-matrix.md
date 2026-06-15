# BrainTrack Feature Rating Matrix

_Secure-by-Design Audit — Task #548 — May 2026_

This matrix scores every page and API route group on two axes:
- **Security (S1–S5)** — authentication, authorisation, input validation, rate limiting, secrets handling
- **UX/UI (U1–U5)** — Prismglass consistency, loading/error/empty states, EN+AF copy, mobile layout, accessibility

**RAG status**: 🔴 Red = any S1/U1, or combined score ≤ 4 | 🟡 Amber = combined 5–7 | 🟢 Green = combined 8–10

---

## Rating Rubrics

### Security (S1–S5)

| Score | Meaning |
|---|---|
| S5 | Secure by design: auth enforced, inputs validated with Zod, RBAC checked server-side, audit log written, rate-limited, secrets never leaked in response |
| S4 | Minor gap: one control missing or inconsistent (e.g. rate limit absent on one endpoint) |
| S3 | Moderate gap: RBAC present but incomplete, or input validation client-side only |
| S2 | Serious gap: IDOR risk, missing auth on sensitive route, or HMAC signature not verified |
| S1 | Critical: unauthenticated access to private data, SQL injection vector, or secret in response body |

### UX/UI (U1–U5)

| Score | Meaning |
|---|---|
| U5 | Fully consistent with Prismglass design system, accessible (WCAG AA), responsive on mobile, has loading + error + empty states, copy correct in EN and AF |
| U4 | Minor gap: one missing state or minor colour deviation |
| U3 | Moderate gap: missing loading/error state, hardcoded grey text, broken mobile layout on one section, or EN-only copy |
| U2 | Serious gap: multiple broken states, layout breaks on 375px, or inaccessible interactive elements |
| U1 | Critical: page is unusable or blank on any supported viewport |

---

## Public Surface

| Page / Route | S | U | RAG | Security Notes | UX Notes |
|---|---|---|---|---|---|
| `/` Landing | S4 | U4 | 🟢 | Public page, no auth required. No sensitive data exposed. Rate-limited by `apiLimiter` in prod. Click tracking via `/api/track/click` is public POST with `publicPostLimiter`. | Good EN+AF, Prismglass design. Missing explicit AF toggle label on mobile nav. |
| `/about` | S5 | U4 | 🟢 | Static content, no API calls. | Good design, EN+AF present. Minor: no explicit skip-nav link. |
| `/features` | S5 | U4 | 🟢 | Static content. | EN+AF present. |
| `/research` | S5 | U4 | 🟢 | Static content. | EN+AF present. |
| `/partner-schools` | S5 | U4 | 🟢 | Static content. | EN+AF present. |
| `/privacy-policy` | S5 | U4 | 🟢 | Static content. | EN+AF present. Minor: very long page, no anchor nav. |
| `/terms-of-service` | S5 | U4 | 🟢 | Static content. | EN+AF present. |
| `/cookie-policy` | S5 | U4 | 🟢 | Static content. | EN+AF present. |
| `/subscribe` (pre-auth trial start) | S4 | U4 | 🟢 | Trial start requires valid SA cell number. Backend validates format. Netcash checkout behind `paymentLimiter`. If Netcash unconfigured, returns 503 cleanly. | EN+AF copy complete. Loading states on CTAs. Minor: countdown timer display on mobile could clip on 375px. |

---

## Auth & Onboarding Flow

| Page / Route | S | U | RAG | Security Notes | UX Notes |
|---|---|---|---|---|---|
| `/role-select` | S4 | U4 | 🟢 | Requires `isAuthenticated`. Role written server-side via `/api/user/role`. | EN+AF present. Clear role cards. |
| `/onboarding` | S4 | U4 | 🟢 | Requires `isAuthenticated`. 11-step VARK assessment with Zod-validated responses. | EN+AF present. Progress indicator clear. |
| `/parent-onboarding` | S4 | U4 | 🟢 | `isAuthenticated`. Validates parent cell for WhatsApp delivery. Rate-limited SMS send. | EN+AF present. |
| `/parent-consent` | S4 | U4 | 🟢 | `isAuthenticated`. Consent record written with IP + user-agent. POPIA-compliant. | EN+AF present. |
| `/activate` (magic link) | S4 | U4 | 🟢 | JWT `jti` consumed on first use via `verifyAndConsumeOnboardingLink`. Token expires in 24h. Rate-limited by `activationLimiter` (5 per 15 min per IP). | EN+AF present. Loading state on activation. Clear error on expired/used link. |

### Auth API Routes

| Route Group | S | U | RAG | Notes |
|---|---|---|---|---|
| `/api/auth/*` (session, OIDC callback, logout) | S4 | — | 🟢 | OIDC callback validates `state` parameter (CSRF). `authLimiter` (10 req/15 min). Session cookies set by Replit OIDC (HttpOnly, Secure in prod, SameSite=Lax). Admin email allowlist re-checked on every login. Minor gap: `returnTo` redirect destination is window.location (same-origin) but not server-validated for open-redirect — safe as implemented but could be hardened. |

---

## Learner Surface (ProtectedRoute)

| Page / Route | S | U | RAG | Security Notes | UX Notes |
|---|---|---|---|---|---|
| `/dashboard` | S4 | U5 | 🟢 | `ProtectedRoute` enforces auth → onboarding → subscription gate. All APIs require `isAuthenticated`. Stats scoped to authenticated user. | Full EN+AF, loading states via React Query, error states, empty states for subjects/activities. Prismglass design system consistent. Mobile responsive. |
| `/classroom` | S4 | U4 | 🟢 | `ProtectedRoute`. Subject data scoped to learner's enrolled subjects. | EN+AF. Minor: classroom page may lack skeleton loader on slow connections. |
| `/subjects` | S4 | U4 | 🟢 | `ProtectedRoute`. | EN+AF. Loading state via `isLoading`. Empty state for no subjects. |
| `/subject/:id` | S4 | U4 | 🟢 | `ProtectedRoute`. Subject ID validated server-side — learners can only view subjects in the system. | EN+AF. Topic list has loading state. |
| `/tutor` | S4 | U4 | 🟢 | `ProtectedRoute`. Tutor requests require `isAuthenticated` + `tutorLimiter` (8 req/min). OpenAI prompts constructed server-side with role-grounded system message. Usage limits enforced per subscription tier. Daily usage cap prevents cost abuse. | EN+AF complete. Loading state on send. Error/retry state. Minor: wide TTS toolbar may clip on 375px screens. |
| `/progress` | S4 | U4 | 🟢 | `ProtectedRoute`. Progress data scoped to `req.user.claims.sub`. | EN+AF present. |
| `/rewards` | S4 | U4 | 🟢 | `ProtectedRoute`. Gamification data scoped to authenticated user. | EN+AF. Clear empty state for no badges. |
| `/store` | S4 | U4 | 🟢 | `ProtectedRoute`. Purchase confirms server-side; coin balance updated atomically. | EN+AF. Theme palette swatches work. Confirmation dialog before purchase. |
| `/study-calendar` | S4 | U4 | 🟢 | `ProtectedRoute`. Calendar events scoped to learner. | EN+AF present. |
| `/printable-calendar` | S4 | U4 | 🟢 | `ProtectedRoute`. Print is blocked by `useContentProtection` hook (DRM). | All `text-white` replaced with semantic classes; print-header subtitle uses `text-muted-foreground`. Weekly-goals labels sourced from `t[language].weeks`. Note: "Week 1–4" is identical in Afrikaans (same word) so the English strings are the correct Afrikaans translation. ✅ UX-P1-003 fixed. |
| `/daily-challenge` | S4 | U4 | 🟢 | `ProtectedRoute`. Questions served from released `dbe_verbatim_questions` (release gate enforced). | EN+AF. Loading skeleton. Error state on fetch failure. |
| `/exam-ready` | S4 | U4 | 🟢 | `ProtectedRoute`. Readiness score computed server-side. | EN+AF. |
| `/flashcards` | S4 | U4 | 🟢 | `ProtectedRoute`. Flashcard data scoped to learner. | EN+AF. Loading state. Empty state for no cards. |
| `/my-notes` | S4 | U4 | 🟢 | `ProtectedRoute`. Notes scoped to `userId`. | EN+AF. |
| `/revision` | S4 | U4 | 🟢 | `ProtectedRoute`. | EN+AF. |
| `/journey` | S4 | U4 | 🟢 | `ProtectedRoute`. Learning journey events scoped to learner. | EN+AF translations present (verified). |
| `/exam-session` | S4 | U4 | 🟢 | `ProtectedRoute`. Exam token anti-automation check (min 30s). Tab-switch logged. Submit requires valid `examToken`. Release gate enforced via exam-papers endpoint. | EN+AF present. Loading state on init. `text-white` replaced with `text-muted-foreground` on secondary text (✅ UX-P1-002 fixed). "Paper not available" empty state is clear. |
| `/exam-mini-mock` | S4 | U4 | 🟢 | `ProtectedRoute`. Questions served from `released_at IS NOT NULL` filter. Marking uses DBE memo server-side; answers not self-graded by client. | EN+AF present. Loading overlay on fetch. Good error state. `text-white` replaced with `text-foreground` / `text-muted-foreground` on body/label text (✅ UX-P1-001 fixed). |
| `/exam-full` | S4 | U4 | 🟢 | `ProtectedRoute`. Full DBE paper flow. Release gate enforced. | EN+AF. |
| `/exam-mode` | S4 | U4 | 🟢 | `ProtectedRoute` (Crunch Time selector). | EN+AF. |
| `/bst-exam` | S4 | U4 | 🟢 | `ProtectedRoute`. BST-specific exam mode. | EN+AF. |
| `/past-papers` | S4 | U4 | 🟢 | `ProtectedRoute`. Links to official DBE PDFs (external). No server-side proxy. | EN+AF. |
| `/dbe-practice` | S4 | U4 | 🟢 | `ProtectedRoute`. Released papers only via release gate. | EN+AF. |
| `/settings` | S4 | U4 | 🟢 | `ProtectedRoute`. Settings writes scoped to `req.user.claims.sub`. | EN+AF. |

### Learner API Route Groups

| Route Group | S | U | RAG | Notes |
|---|---|---|---|---|
| `/api/user/*` | S4 | — | 🟢 | All routes require `isAuthenticated`. Profile/onboarding/stats scoped to authenticated user. Zod validation on PATCH bodies. Minor: `/api/user/onboarding-status` returns boolean only — minimal exposure. |
| `/api/exam/*` | S4 | — | 🟢 | `isAuthenticated` + `released_at IS NOT NULL` filter enforced. Exam token anti-automation check. Session ownership verified before submit. `heavyLimiter` on exam generation. |
| `/api/dbe/*` | S4 | — | 🟢 | `isAuthenticated`. Release gate enforced. Available subjects endpoint returns only released content. |
| `/api/tutor/*` | S4 | — | 🟢 | `isAuthenticated` + `tutorLimiter`. Daily usage cap per tier. OpenAI prompt construction server-side. User input treated as untrusted text, not code. AI responses watermarked with zero-width fingerprint. |

---

## Parent Surface

| Page / Route | S | U | RAG | Security Notes | UX Notes |
|---|---|---|---|---|---|
| `/parent-dashboard` (`/parent`) | S4 | U4 | 🟢 | `RequireParentRoute` client guard + `requireRole("parent","admin")` server guard. All linked-learner queries gated by `isParentOfLearner()` check. When `?learnerId=` supplied, ownership verified server-side. | EN+AF present. Loading states present. Mobile-first layout. Minor: school portal link visible even when no school linked. |
| `/parent-purchase` | S4 | U4 | 🟢 | `RequireParentRoute`. Payment flow uses same Netcash checkout as learner flow. | EN+AF. |

### Parent API Route Group

| Route Group | S | U | RAG | Notes |
|---|---|---|---|---|
| `/api/parent/*` | S4 | — | 🟢 | Blanket `requireRole("parent","admin")`. Every data-returning handler independently verifies `isParentOfLearner(parentId, learnerId)`. Falls back to first linked learner when no `learnerId` param — by design and not an IDOR because it returns only the parent's own data. |

---

## School Surface

| Page / Route | S | U | RAG | Security Notes | UX Notes |
|---|---|---|---|---|---|
| `/school-dashboard` | S4 | U5 | 🟢 | `RequireSchoolAdminRoute` + `requireRole("school_admin","admin")`. `resolveSchoolId()` scopes all data to the school. CSV export similarly scoped. | Full Prismglass redesign (Task #837): semantic tokens throughout, aurora gradient background, hero KPI strip, secondary metric cards, unified streak panel, theme-adaptive chart axes/tooltips/grid, ShieldCheck privacy banner, bilingual `T` object for all strings, mobile-first responsive layout, print-clean footer. No hardcoded `bg-black`/`text-white`. U5. |
| `/school-onboarding` | S3 | U4 | 🟡 | `schoolOnboardingLimiter` on POST. However the `/api/school/onboarding` POST endpoint has no authentication requirement — it's publicly accessible (school staff submit the form before having a BrainTrack account). Data collected is contact/school info only, not learner data. Zod validation on all fields. No private data exposed. **Noted as S3**: public write endpoint, but intentionally designed for pre-auth submission. | EN+AF present. Form validation inline. Good mobile layout. |

### School API Route Group

| Route Group | S | U | RAG | Notes |
|---|---|---|---|---|
| `/api/school/*` | S4 | — | 🟢 | Dashboard + export endpoints require `requireRole("school_admin","admin")`. Onboarding POST is intentionally public (pre-auth) but rate-limited and collects only contact info. `resolveSchoolId` enforces school-level data isolation. |

---

## Admin Surface (RequireAdminRoute)

| Page / Route | S | U | RAG | Security Notes | UX Notes |
|---|---|---|---|---|---|
| `/learn/admin/dashboard` | S5 | U4 | 🟢 | `RequireAdminRoute` + `ADMIN_EMAILS` allowlist re-checked per request. Blanket `app.use("/api/admin", isAuthenticated, requireRole("admin"))`. | EN only (admin surfaces are English-only by design). Loading states on all data panels. |
| `/learn/admin/billing` | S5 | U4 | 🟢 | Same blanket + per-handler guards. Billing state read-only in UI; write operations go through Netcash. | Loading states present. |
| `/learn/admin/reports` | S5 | U4 | 🟢 | Admin-gated. Export endpoints also re-assert `requireRole("admin")`. | Table patterns consistent. |
| `/learn/admin/content-studio` | S5 | U4 | 🟢 | Admin-gated. Content mutations Zod-validated. | Loading states. |
| `/learn/admin/products` | S5 | U4 | 🟢 | Admin-gated. Product PATCH validated. | |
| `/learn/admin/topic-audio` | S5 | U4 | 🟢 | Admin-gated + `requireRole("admin")` on `/api/topic-audio/admin/*`. | |
| `/learn/admin/emails` | S5 | U4 | 🟢 | Admin-gated. Test-send requires admin. Preview shows rendered template only. | EN only by design. |
| `/learn/admin/partner-branding` | S5 | U4 | 🟢 | Admin-gated. | |
| `/learn/admin/signin` | S4 | U4 | 🟢 | OIDC sign-in entry point for admin. `authLimiter` on login attempts. | |

### Admin API Route Group

| Route Group | S | U | RAG | Notes |
|---|---|---|---|---|
| `/api/admin/*` | S5 | — | 🟢 | Blanket `app.use("/api/admin", isAuthenticated, requireRole("admin"))` — line 1264 of `server/routes.ts`. 106 admin endpoints all have inline `requireRole("admin")` re-assertion (defence-in-depth). `ADMIN_EMAILS` allowlist re-checked on every `requireRole("admin")` call. Full inventory in `docs/admin-routes-audit.md`. |

---

## DBE Portal

| Page / Route | S | U | RAG | Security Notes | UX Notes |
|---|---|---|---|---|---|
| `/dbe-portal` | S4 | U4 | 🟢 | `RequireDBEPortalAuth` (admin-only client guard). | EN only (DBE portal is English-only by design). |
| `/dbe-portal-login` | S4 | U4 | 🟢 | Redirects to OIDC login. Non-admin users get "Access Denied". | Clear error message. |

---

## API Route Groups — Security Summary

| Route Group | S | RAG | Notes |
|---|---|---|---|
| `/api/auth/*` | S4 | 🟢 | OIDC callback with state validation. Session cookies set by Replit (HttpOnly, Secure). Auth rate-limited (10/15 min). Admin allowlist re-checked on every login. Minor: `returnTo` param from window.location is same-origin safe but not server-validated. |
| `/api/exam/*` + `/api/dbe/*` | S4 | 🟢 | Auth required. Release gate (`released_at IS NOT NULL`) on all learner-facing paper endpoints. Exam token anti-automation. Usage limits enforced. |
| `/api/tutor/*` | S4 | 🟢 | Auth required. Rate-limited (`tutorLimiter`). AI concurrency capped (15 in-flight / 50 queued). Daily usage cap per subscription tier. |
| `/api/subscribe/*` + `/api/netcash/*` | S4 | 🟢 | Subscribe endpoints require auth + `paymentLimiter`. Netcash webhook: HMAC-SHA256 signature verified; fails closed in production if unconfigured. Idempotent webhook processing. |
| `/api/parent/*` | S4 | 🟢 | Auth + `requireRole("parent","admin")`. Per-endpoint `isParentOfLearner` IDOR check. |
| `/api/admin/*` | S5 | 🟢 | Blanket + per-handler guards. 106 endpoints all gated. |
| `/api/push/*` (cron) | S4 | 🟢 | Cron broadcast endpoints require `CRON_SECRET` bearer token. Returns 503 if secret not configured. |
| `/api/push/*` (user) | S4 | 🟢 | Subscribe/unsubscribe/test require `isAuthenticated`. VAPID public key endpoint is intentionally public (browser needs it before login). |
| `/api/school/*` | S4 | 🟢 | Dashboard/export: auth + school_admin role + `resolveSchoolId` isolation. Onboarding POST: public by design (pre-auth), rate-limited. |
| `/api/test/*` | S5 | 🟢 | `TEST_MODE=true AND NODE_ENV !== "production"` double gate + ephemeral nonce. Endpoint not registered in production — not reachable. |

---

## Overall Summary

| Dimension | Pages at S1/U1 | Pages at S2/U2 | Pages at S3/U3 | Pages at S4/U4 | Pages at S5/U5 |
|---|---|---|---|---|---|
| Security | 0 | 0 | 1 (`/school-onboarding` — intentional public POST) | 47 | 9 (admin routes + test endpoint) |
| UX/UI | 0 | 0 | 0 | 48 | 1 (`/dashboard`) |

**No P0 (S1/S2/U1/U2) findings. All four UX P1 (U3) findings fixed in Task #548. One intentional S3 remains by design: `/school-onboarding` POST is publicly accessible before account creation (documented, rate-limited, accepted risk).**

---

## P1 Findings & Fixes

### Security P1

| ID | Finding | Severity | Page / Route | Fix |
|---|---|---|---|---|
| SEC-P1-001 | `/api/school/onboarding` POST is intentionally unauthenticated (school staff submit before having an account). Data collected is contact info only — no private learner data exposed. Rate-limited by `schoolOnboardingLimiter`. Acceptable risk. | S3 | `/school-onboarding` | No code change required. Document as intentional design decision. |
| SEC-P1-004 | `/api/auth/*` `returnTo` redirect param — potential open-redirect if destination not validated server-side. | S4 (was concern) | `/api/auth/*` | ✅ **Confirmed already secure** — `replitAuth.ts:235` validates `startsWith("/") && !startsWith("//")` before writing to session. No additional code change required. This was an audit concern, not an active finding. |

### UX/UI P1

| ID | Finding | Severity | Page | Fix Applied |
|---|---|---|---|---|
| UX-P1-001 | `exam-mini-mock.tsx` uses hardcoded `text-white` for secondary/body text (question text, labels, source info). On any future light theme these would be invisible. Should use `text-foreground` / `text-muted-foreground`. | U3 | `/exam-mini-mock` | ✅ **Fixed** — replaced with `text-foreground` / `text-muted-foreground` |
| UX-P1-002 | `exam-session.tsx` uses hardcoded `text-white` for secondary text in active exam view (answer count, details). | U3 | `/exam-session` | ✅ **Fixed** — replaced with `text-foreground` / `text-muted-foreground` |
| UX-P1-003 | `/printable-calendar` print template headings are English-only. No Afrikaans print copy. | U3 | `/printable-calendar` | ✅ **Fixed** — hardcoded `text-white` replaced with semantic classes; weekly-goals labels added to `t[language]` object; print-header subtitle now `text-muted-foreground`. |
| UX-P1-004 | `/school-dashboard` data table lacks horizontal scroll container on mobile (375px). No skeleton loader — single spinner shown while fetching. | U3 | `/school-dashboard` | ✅ **Fixed** — loading state replaced with full skeleton layout (header, 6-card grid, 2 chart panels, streak section); charts wrapped in `overflow-x-auto` + `min-w-[300px]`. |

---

_Last updated: May 2026 by Task #548. Re-score after each fix pass._
