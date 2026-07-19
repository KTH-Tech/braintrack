# BrainTrack Security Audit — 2026-07

Scope: end-to-end review of admin access control, sensitive-data handling,
payments, authentication, and minors/POPIA controls. BrainTrack is a live
production product serving minors and processing payments + POPIA-sensitive
personal data, so findings are graded conservatively.

Method: static review of `server/`, `shared/`, and `client/src/App.tsx`, plus an
automated sweep of every `/api/admin/*`, `/api/cron/*`, and `/api/push/*` route
for its auth middleware chain.

Summary: **1 critical** issue (account takeover → admin escalation) — **fixed**.
Admin-route guard fragility — **fixed** as hardening. Remaining items are
medium/low and **open** with recommendations. No sensitive-data leak, webhook
forgery, idempotency, or auth-bypass hole was found.

Legend — Status: `fixed` (changed this pass) · `open` (reported, not changed) ·
`verified` (checked, no issue, no change needed).

---

## CRITICAL

### C-1 · Account takeover & admin privilege escalation via `/api/auth/register` — FIXED
- **Severity:** Critical
- **File:** `server/local-auth.ts:143-168` (pre-fix)
- **Status:** fixed
- **Evidence / exploit:** The register handler looked up any existing account by
  email and returned `409 email_in_use` **only when that account already had a
  `passwordHash`**. For an existing account *without* a password hash it silently
  attached the caller-supplied password to that account and logged the caller in
  as it — with no proof of email ownership and no email verification. The
  majority of BrainTrack accounts are passwordless: SMS-onboarded learners
  (`server/routes.ts:8714` inserts a learner with no `passwordHash`),
  parent-created learners, seeds, and any external-IdP account.
  - **Data-exposure path:** anyone who knows a learner's/parent's email could
    take over that account and read the minor's POPIA data (ID number is
    server-side only, but profile, grade, school, progress, parent email are
    exposed to the session).
  - **Admin-escalation path:** the admin allowlist emails are not secret
    (`replitAuth.ts:142` defaults to `karlit@kthtech.co.za,kreativethinkinghub@gmail.com`).
    Registering with an allowlisted email against a passwordless admin row set an
    attacker password, and `enforceAdminAllowlist()` (`local-auth.ts:88`) then
    promoted the session to `admin` — full administrative takeover.
- **Fix:** registration now returns the same `409 email_in_use` for **any**
  pre-existing account regardless of `passwordHash`. Attaching a local password
  to a pre-existing (e.g. OIDC/SMS) account must go through an authenticated,
  email-verified "set password" flow — see Recommendation R-1. The uniform
  response also removes an OIDC-vs-local account-existence oracle.

---

## MEDIUM

### M-1 · Admin endpoints relying solely on the blanket guard — FIXED (hardening)
- **Severity:** Medium (fragility; not currently exploitable)
- **Files:** `server/routes.ts` — `/api/admin/partner-branding` GET+PUT,
  `/api/admin/school/inquiries` GET+PATCH (had **no** per-route auth middleware);
  `/api/admin/timetable*` ×8 (had `isAuthenticated` but **no** `requireRole`).
- **Status:** fixed
- **Evidence:** A blanket `app.use("/api/admin", isAuthenticated, requireRole("admin"))`
  at `server/routes.ts:1567` fronts every `/api/admin/*` route, so these
  endpoints were **not** exploitable — every one is admin-gated in practice.
  The risk was single-point-of-failure fragility: routes that declare no auth of
  their own silently lose all protection if that one `app.use` is ever reordered,
  refactored onto a sub-router, or the prefix changed. Several handlers even read
  `const role = (req as any).user?.role;` and never used it, reinforcing the
  false impression of a local check.
- **Fix:** added explicit `isAuthenticated, requireRole("admin")` to all 12
  endpoints so each self-enforces, matching house style (defence in depth with
  the blanket guard).

### M-2 · Day-14 trial autocharge — narrow double-charge window — OPEN
- **Severity:** Medium
- **File:** `server/routes.ts` `/api/cron/charge-trials` (~16780) →
  `paystackFetch("/transaction/charge_authorization")`
- **Status:** open
- **Evidence:** Idempotency is claimed *before* the charge via
  `recordEventOnce("trial_conversion:${sub.id}:${today}")`, and the
  `charge.success` webhook is a deliberate no-op for `trial_conversion` — so same
  day, same subscription cannot double-apply, and a successful charge flips the
  row to `active` (removing it from the next run's `["trial","trialing"]` set).
  **Gap:** the idempotency key is date-scoped. If Paystack actually charges the
  card but the HTTP call throws (timeout/reset before the response), the row
  stays `trial`, and the *next day's* run mints a fresh key
  (`trial_conversion:${sub.id}:${tomorrow}`) and charges again. Paystack's
  `charge_authorization` has no built-in idempotency for this.
- **Recommendation:** pass a stable per-subscription idempotency `reference` to
  Paystack (e.g. `trial_conversion:${sub.id}`) and/or, on a thrown charge,
  reconcile via `/transaction/verify` before re-charging on a later run.

### M-3 · CRON_SECRET compared with `!==` (non-constant-time) — OPEN
- **Severity:** Medium (low exploitability over the network)
- **Files:** `server/routes.ts` cron handlers (~16670, 16743, 16780, 16921, 16997,
  and the new `/api/cron/aggregate-cohort`)
- **Status:** open (new endpoint follows existing house pattern for consistency)
- **Evidence:** all compare `req.headers.authorization !== \`Bearer ${cronSecret}\``.
  `timingSafeEqual` is already imported (`routes.ts:4`) and used for webhooks;
  the cron paths are inconsistent with it. All fail closed (503) when the secret
  is unset — good.
- **Recommendation:** extract a `requireCronSecret` middleware using
  `crypto.timingSafeEqual` and apply to every `/api/cron/*` and cron-triggered
  `/api/push/*` endpoint; optionally add a rate limit.

### M-4 · `/api/paystack/initialize` not behind `paymentLimiter` — OPEN
- **Severity:** Low-Medium
- **File:** `server/paystack.ts:221`
- **Status:** open
- **Evidence:** other payment initiators use `paymentLimiter`
  (`routes.ts:2870, 3547, 3550, 3708, 4395`), but the Paystack checkout
  initializer relies only on `isAuthenticated`. It is authenticated and creates
  no charge, but allows unbounded Paystack `/transaction/initialize` calls per
  session.
- **Recommendation:** add `paymentLimiter` to the initialize + verify routes.

---

## LOW / OBSERVATIONS

### L-1 · `toPublicUser()` applied at only one boundary — OPEN (no leak found)
- **File:** `server/replit_integrations/auth/routes.ts:21` is the sole caller.
- **Evidence:** No endpoint was found returning a raw full `users` row
  (`res.json(user)` sweep is clean; the admin CSV export at `routes.ts:13026`
  selects explicit non-sensitive columns). Still, the strip helper should be the
  standard boundary for any future user-returning endpoint.
- **Recommendation:** route any new user-row response through `toPublicUser()`.

### L-2 · Registration reveals email existence — accepted
- **File:** `server/local-auth.ts` register (`409 email_in_use`).
- **Evidence:** inherent to any registration UX; **login** is enumeration-safe
  (uniform 401 + dummy `bcrypt.compare`, `local-auth.ts:202-206`). Acceptable.

---

## VERIFIED — no action needed

**Admin access / privilege escalation**
- No `...req.body` / `...body` spread into a `users` update anywhere. The only
  `.set({ ...updates })` is `storage.ts:2144` on `topic_mastery` with a typed
  `Partial<TopicMastery>` — not user roles. (verified)
- `set-role` (`routes.ts:1719`), `reset-role` (`routes.ts:1740`),
  `parent/onboarding` (`routes.ts:4516`), and the onboarding user patch
  (`routes.ts:2610-2642`) all write explicit field lists; role input is a
  `z.enum(["learner","parent"])` and admin is unreachable from client input.
  `set-role` additionally refuses when `role === "admin"` or already confirmed. (verified)
- `requireRole()` (`routes.ts:1295`) enforces role membership **and** re-checks
  `isAdminEmail(user.email)` for admin — DB tampering that sets `role="admin"`
  on a non-allowlisted email still fails closed. (verified)
- Client `RequireAdminRoute` (`client/src/App.tsx:319`) gates every `/learn/admin*`
  route; the two unguarded ones (`:763, :766`) are redirect-only aliases. (verified)

**Sensitive data**
- `SENSITIVE_USER_FIELDS = [passwordHash, idNumber, dobHash]` stripped by
  `toPublicUser()` (`shared/models/auth.ts:89-106`). (verified)
- `toPublicSubscription()` (`routes.ts:2534`) strips
  `paystackAuthorizationCode/paystackCustomerCode/netcashCardToken/netcashMandateId`
  and is applied on every subscription response (`:2545, 2886, 2906`). (verified)
- Grep for `console.*` of any sensitive field (passwordHash, idNumber, dobHash,
  paystack*Code, authorization_code, netcashCardToken) returns nothing. (verified)
- ID number stored server-side only; DOB never stored raw — only salted
  `sha256(SESSION_SECRET:yyyy-mm-dd)` + derived `isMinor`
  (`routes.ts:2617-2630`, `shared/models/auth.ts:60-67`). (verified)

**Payments**
- Webhook signature: HMAC-SHA512 over the **raw** body with `timingSafeEqual`
  and a length pre-check (`server/paystack.ts:64-73`); raw bytes captured
  globally via `express.json({ verify })` (`server/index.ts:254`). (verified)
- Idempotency: `payment_events` unique index on `(provider, provider_event_id)`
  (`shared/models/simulated.ts:104`) + `recordEventOnce()` with a `23505`
  race-catch (`paystack.ts:76-94`). `card_capture` / `trial_conversion` webhook
  branches are no-ops so the cron's synchronous charge is authoritative. (verified)
- CRON_SECRET is required (fail-closed 503 if unset, 401 on mismatch) on every
  cron **job** endpoint: `send-streak-reminders`, `send-daily-focus`,
  `charge-trials`, `send-sms-retries`, `send-trial-reminders`, and the new
  `aggregate-cohort`. The user-facing `/api/push/{subscribe,unsubscribe,status,test}`
  correctly use `isAuthenticated` (they are not cron jobs);
  `/api/push/vapid-public-key` is intentionally public (public key only). (verified)

**Auth**
- bcrypt cost 12 (`local-auth.ts:30`); session regenerated before login
  (`local-auth.ts:69` `req.session.regenerate`) — session-fixation safe. (verified)
- Account lockout: 8 fails / 15 min in `local-auth.ts:31-32`; storage has an
  escalating schedule (`storage.ts:2793`). Auth rate limit 20/15min per IP
  (`local-auth.ts:122`); payment limiter 5/15min keyed per user
  (`middleware/payment-limiter.ts`). (verified)
- No user enumeration on login: identical 401 for unknown email vs bad password,
  with a dummy `bcrypt.compare` to equalise timing (`local-auth.ts:202-206`). (verified)
- Session cookie `httpOnly:true, secure:isProd, sameSite:"lax"`
  (`replitAuth.ts:119-123`). (verified)

**Minors / POPIA**
- Minors cannot self-activate a trial: `isMinor` check returns 403
  `parent_consent_required` (`routes.ts:2892`); the trial only ever starts from
  `applyCardCaptureSuccess()` after a parent grants consent and captures a card
  (`server/paystack.ts:143-211`). (verified)
- Consent audit trail: `consent_records` + `consent_log` tables
  (`shared/schema.ts:1848, 1882`); ToS + privacy-policy consent logged at
  onboarding with IP + UA (`routes.ts:2604-2605`); billing consent logged at
  trial start. (verified)

---

## Recommendations (follow-ups, not done this pass)

- **R-1:** Add an authenticated, email-verified "set/link password" flow so
  legitimate passwordless (OIDC/SMS) users can add a local password — this is the
  capability intentionally removed by the C-1 fix.
- **R-2:** `requireCronSecret` middleware using `timingSafeEqual` (see M-3).
- **R-3:** Provider-side idempotency key on trial conversion charges (see M-2).
- **R-4:** Apply `paymentLimiter` to Paystack initialize/verify (see M-4).
