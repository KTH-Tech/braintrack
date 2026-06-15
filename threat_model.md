# Threat Model

## Project Overview

BrainTrack is a React + Express exam-prep platform for Grade 12 learners, with PostgreSQL storage, Replit OIDC authentication, Netcash recurring billing, OpenAI-backed tutoring/audio features, push notifications, and Socket.io realtime updates. Production risk is concentrated in authenticated learner APIs, parent/admin data access, payment activation, private learner content, partner-school CRM data, and admin ingestion/reporting tooling.

Production assumptions for this scan:
- Only production-reachable code matters.
- `NODE_ENV` is `production` in deployed environments.
- Replit provides TLS for browser-to-app traffic.
- Mockup sandbox and explicit dev-only helpers are out of scope unless production reachability is demonstrated.

## Assets

- **User accounts and sessions** — Replit-authenticated sessions, admin/parent/learner roles, socket tokens, refresh tokens, and session cookies. Compromise enables impersonation and privilege abuse.
- **Learner education data** — progress, attempts, mastery, schedules, onboarding answers, goals, tutor sessions, notifications, and parent-linked learner data. This is sensitive student information.
- **Private learner media** — voice notes and transcripts stored on disk and exposed through authenticated streaming routes.
- **Payment and subscription state** — Netcash checkout references, webhook events, subscription activation status, optional legacy PayFast state if configured, referral reward flows, and parent/school commercial records.
- **Admin-only operational data** — learner exports, school contact data, partner-school CRM records, ingestion controls, analytics, escalation queues, and any bulk admin actions.
- **Application secrets** — database URL, session secret, OpenAI key, Netcash secrets, optional PayFast secrets if configured, VAPID keys, admin allowlists.
- **DBE content corpus and derived releases** — unreleased/raw ingestion artifacts, released exam content, memo coverage status, and admin upload stores.

## Trust Boundaries

- **Browser ↔ Express API** — every client request is untrusted and must be authenticated, authorized, validated, and rate-limited server-side.
- **Express API ↔ PostgreSQL** — API code has broad DB access; injection or broken authorization here exposes the full data set.
- **Express API ↔ local filesystem** — private voice notes, topic audio, and admin-uploaded DBE PDFs cross into filesystem trust boundaries and must not permit traversal or unintended disclosure.
- **Express API ↔ external services** — Netcash webhooks/checkouts, optional legacy PayFast webhooks if enabled, Replit OIDC, OpenAI, and web-push all require origin/authenticity guarantees and failure-safe handling.
- **Public ↔ authenticated ↔ parent ↔ admin** — the application has multiple role tiers and linked-account access paths; server-side checks must enforce each boundary.
- **HTTP session auth ↔ JWT/socket auth** — role and identity assertions copied into JWTs/socket tokens must remain consistent with current server-side authorization policy, and browser logout must not leave bearer-token sessions alive unexpectedly.
- **Dev/internal ↔ production** — scripts, sandbox artifacts, dev login helpers, and testing routes are out of scope unless reachable when `NODE_ENV=production`.

## Scan Anchors

- **Production entry points**: `server/index.ts`, `server/routes.ts`, `server/socket.ts`, `server/replit_integrations/auth/*.ts`.
- **Highest-risk areas**: auth/session + role checks; `/api/admin/*`; `/api/parent/*`; Netcash billing flows; `/api/partner-schools*`; private voice-note routes; DBE admin upload/ingestion/export routes; learner-facing `/api/past-papers/*`; notification/reminder broadcast endpoints.
- **Public vs authenticated vs admin**:
  - Public: login/callback, landing/marketing, limited tracking endpoints, webhook ingress.
  - Authenticated learner: study/tutor/progress/exam APIs, voice notes, subscription verification, raw PDF past-paper browsing.
  - Parent/admin: linked learner views, reports, exports, broadcast/reminder tools, ingestion control, partner-school CRM.
- **Usually dev-only / ignore unless proven reachable**: `artifacts/mockup-sandbox/**`, `/api/dev/login-as/*`, one-off scripts under `scripts/` and `server/scripts/`.

## Threat Categories

### Spoofing

BrainTrack relies on Replit OIDC sessions for browser auth and JWTs for socket access. The system must only trust identities derived from a valid server-side session or a server-signed token, and admin access must remain bound to the configured admin email allowlist on every request and login.

Netcash webhooks must only be accepted when the request authenticity check succeeds. Any enabled legacy PayFast flow must also fail closed on missing or weak authenticity checks. Otherwise an attacker could mark subscriptions as paid.

### Tampering

Learners, parents, and admins can all submit structured JSON, uploads, query parameters, and webhook-triggered state changes. The server must validate and constrain all user-controlled fields, enforce ownership on stored files, and compute sensitive state transitions like subscription activation and learner progress server-side.

Admin bulk operations and ingestion controls are especially sensitive because a single request can rewrite many records. They must require server-side admin authorization and reject malformed or unexpected input.

### Information Disclosure

The application stores student data, parent-linked learner data, exports, transcripts, and private media. Every response that exposes learner or school data must be scoped to the authenticated principal, and admin/reporting endpoints must not become reachable to regular users through route gaps, preview modes, or token inconsistencies.

Filesystem-backed media and DBE ingestion artifacts must not be directly browsable or downloadable outside intended release-gated or admin-only flows. Partner-school CRM and referral reporting data must never be exposed to ordinary learner accounts. Logs and error responses must not expose secrets, raw stack traces, or sensitive rows in production.

### Denial of Service

Public and authenticated endpoints include OpenAI-backed tutor features, media upload/transcription, exam generation, ingestion controls, and broadcast/reminder tooling. The system must keep request size limits, rate limits, and failure isolation in place so a single user or unauthenticated actor cannot force expensive downstream work or repeated large DB scans.

Webhook, upload, and admin bulk endpoints also need bounded processing so they cannot be abused to exhaust compute or disk.

### Elevation of Privilege

The biggest project-specific risk is broken access control across learner, parent, and admin surfaces. Parent routes must only expose linked learners. Admin routes must be protected server-side regardless of frontend gating. Export, analytics, school management, broadcast, and ingestion controls must never rely on client-only checks.

SQL injection, unsafe dynamic SQL, path traversal in private file handling, and stale role claims inside socket/JWT tokens are also privilege-escalation risks because they can bypass intended data boundaries or expand access beyond the current user.