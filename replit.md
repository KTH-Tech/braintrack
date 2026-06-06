# BrainTrack

## Overview

BrainTrack is a Grade 12 NSC exam preparation platform for South African students, offering access to official past papers, a Smart Tutor for personalised help, progress tracking, and study recommendations. It supports English and Afrikaans, features a dark holographic Prismglass UI, and aims to make learning accessible for final exams. The project envisions a future where students have comprehensive, personalized support for their final exams, leveraging AI and robust educational content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, Wouter for routing, and TanStack React Query for state management.
- **UI/UX**: Dark Prismglass design featuring holographic rainbow glass panels on a near-black background with an animated dark aurora gradient. Uses `shadcn/ui` with custom Tailwind CSS. Typography is exclusively Inter font family.
- **Theming**: Supports 17 themes grouped as Free (4), Unlockable (10), and Premium (3), persisting via localStorage. All pages are theme-adaptive using CSS variables. The full theme catalogue is surfaced through the unified Learner Store.
- **Store & Rewards**: The Learner Store at `/store` is the single catalogue surface (category tabs for All / Power-Ups / Themes / Cosmetics / Titles, palette swatches and Apply for themes, confirmation dialog before purchase). The Rewards page at `/rewards` is progress-only (coins, streak, badges, transactions) and links out to the Store via a clear CTA.
- **Language**: English/Afrikaans toggle, persisting via localStorage.
- **Core Pages**: Includes Landing, Onboarding, Subscription, Dashboard, Subjects, Smart Tutor, Progress, Rewards, Study Calendar, Daily Challenge, Exam Ready, Settings, Admin DBE, Admin Reports, Flashcards & Quiz, Learner Store, and Learning Journey.
- **Global Elements**: Language Toggle, Theme Toggle, and a context-aware Rizz Bot.
- **Branding**: Accent colors for alerts, warnings, success, etc. Theme-adaptive logo.

### Backend
- **Framework**: Express.js with TypeScript.
- **API Pattern**: RESTful JSON APIs.
- **Real-Time**: Socket.io for real-time updates (e.g., score, readiness, reports) with JWT authentication.
- **Authentication**: Replit Auth via OpenID Connect, session-based.
- **Smart Tutor**: Integrates with OpenAI API, using only database-sourced question text and memos.
- **Route Protection**: Enforces sequential flow: authentication → onboarding → subscription.

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM and Zod schema validation.
- **Key Models**: `subjects`, `topics`, `examPapers`, `questions`, `attempts`, `onboardingResults`, `subscriptions`, `usage`, `tutorSessions`, `learningEvents`, `dbe_verbatim_questions`, `dbe_ingestion_log`.
- **VARK Learning System**: Personalizes content delivery based on Visual, Auditory, Read, Kinesthetic styles, persisted in user profiles and dynamically updated based on learning events.

### DBE PDF Ingestion Pipeline
- **Catalog**: `server/data/dbe-papers-catalog.json` — sourced directly from `education.gov.za` (rebuilt May 2026 by `scripts/scrape-dbe-catalog.ts` after mirror sources saexampapers/stanmore were found to serve un-extractable PDFs).
- **Catalog scraper**: visits 16 DBE landing pages (2015–2025, NSC and May/June sessions). Parses two HTML layouts: legacy inline link text (`Mathematics P1 memo`) and modern DNN module layout where `mid` query-param joins each LinkClick URL to its parent subject heading. The grouped-layout parser extracts the paper number BEFORE stripping memo/marking words so multi-stream module link texts like `"Welding and Metalwork Memo 1 (English)"` (Mechanical Tech 2023 P1, etc.) are no longer silently dropped — Task #385 May 2026 fix recovered ~200 missing memo entries (5,175 → 5,378 catalog rows) and lifted exam_papers memo coverage on Mechanical/Electrical/Civil Tech and CAT papers to ~100%. Backup of the pre-fix catalog: `dbe-papers-catalog-pre-task385-backup.json`.
- **Seeder**: `scripts/seed-exam-papers-from-catalog.ts` populates `exam_papers` (QPs paired with their same-host memos). `onConflictDoNothing` semantics — wipe table before re-seed for a clean swap.
- **Ingestion runner**: `scripts/run-ingest-2015-2025.ts` (background workflow "DBE Ingestion"). Drives `server/dbe-ingestion.ts` which downloads each PDF, extracts text via `pdf-parse`, applies regex parsers for QUESTION blocks, and writes to `dbe_verbatim_questions` keyed by subject NAME. Self-heals: papers with `status=completed AND question_count<=0` are retried.
- **Learner APIs** in `server/routes.ts` query `dbe_verbatim_questions` (NOT the legacy `questions` table) for past-paper content. Backups of prior catalog versions kept as `dbe-papers-catalog-mirror-backup.json`, `-saexampapers.json`, `-stanmore.json`, `-dbe-archive.json`.

### Core Features
- **Subscription**: "Brain Boost" plan (R169/month, 14-day free trial).
- **Payment Gateway**: Netcash only (true recurring billing via DebiCheck mandate or recurring card token). Yoco, Paystack and Ozow have all been removed.
- **Smart Tutor Modes**: Provides hints, memo explanations, and full solutions.
- **Usage Limits**: Tiered daily limits for tutor interactions based on subscription.
- **Gamification**: XP and level system (Starter to SuperStar).
- **Portals**: Learner Classroom, Parent Dashboard, School Portal, Admin Console.
- **Push Notifications**: Web Push via VAPID for streak reminders, daily challenges, and milestone celebrations.
- **SEO Strategy**: High-value SA search keywords, JSON-LD structured data, and canonical domain `braintrack.app`.

## External Dependencies

### AI Services
- **OpenAI API**: Used by the Smart Tutor for generating personalized help, specifically using `gpt-5-mini`.

### Database
- **PostgreSQL**: The primary relational database for all application and user data.

### Authentication
- **Replit Auth**: Serves as the OpenID Connect provider for user authentication.

### Payment Gateways
- **Netcash**: Sole payment provider. Two recurring methods exposed in the UI — **DebiCheck** (bank-side debit-order mandate) and **recurring card** (card token saved with Netcash). Hosted-checkout redirect flow with HMAC-SHA256-signed webhook (`/api/netcash/webhook`) for mandate-created, first-payment-success, recurring-success and recurring-failure events. Failed recurring payments enter a 3-day grace period before being marked `lapsed`. Lifecycle enforcement (expired trials with no payment method → `lapsed`; grace-expired failed renewals → `lapsed`) runs as the first step of the daily `Trial Reminders` job (`storage.enforceLapsedSubscriptions()`), so admins see the truth on the Billing dashboard within 24h of expiry. 14-day free trial flow at `/api/subscribe/start-trial` requires a valid SA parent cell number (used for D13/D14 conversion push notifications) and does not capture card-on-file. While `NETCASH_SERVICE_KEY` / `NETCASH_PCI_VAULT_*` / `NETCASH_DEBICHECK_MERCHANT_ID` / `NETCASH_WEBHOOK_SECRET` / `NETCASH_SOFTWARE_VENDOR_KEY` are unset, the checkout init endpoints fail cleanly with 503 `netcash_not_configured` so the trial flow remains usable. Admin Billing view at `/learn/admin/billing` (linked from the Admin Console) surfaces trials-ending, grace-period failures, and lapsed subscribers. Background workflow `Trial Reminders` (script `scripts/nightly-trial-reminders.sh`) hits `/api/push/send-trial-reminders` daily at 05:00 UTC to send Day-13 + Day-14 conversion notifications.

  Legacy Yoco endpoints (`/api/subscribe/yoco/*`, `/api/yoco/webhook`) now return `410 Gone` for any stale client traffic. Yoco columns on the `subscriptions` table are kept (`yoco_checkout_id`, `yoco_payment_id`) for historical rows but are not written to.

### Communication (Live)
- **Twilio WhatsApp**: Sole onboarding-link channel. `server/sms/twilio.ts` exposes `sendWhatsApp()` (Messages API with `whatsapp:` prefix on To/From). `server/sms/onboarding-link.ts` mints a one-time signed JWT, stores the jti in `onboarding_link_tokens` with `channel="whatsapp"`, and delivers via WhatsApp. **Production sender**: a verified WhatsApp Business number registered in Twilio and linked to the BrainTrack Meta Business Manager account — no sandbox join-code required. Required env vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (E.164 production sender, e.g. `+27XXXXXXXXX` — `whatsapp:` prefix added automatically). Template env vars (mandatory for first-touch outbound outside a 24h session): `TWILIO_WHATSAPP_CONTENT_SID` (Meta-approved English template SID for the "BrainTrack onboarding link" template with one `{{1}}` URL variable) and optionally `TWILIO_WHATSAPP_CONTENT_SID_AF` (Afrikaans variant SID — falls back to the EN SID if unset). When a content SID is set, `onboarding-link.ts` passes just the magic-link URL as the `{{1}}` substitution; without a SID it falls back to a free-form body (only valid inside a 24h customer-initiated session). Optional: `TWILIO_WHATSAPP_CONTENT_VARIABLES_JSON` to override the entire ContentVariables payload, and `PUBLIC_BASE_URL` to force the canonical `https://braintrack.app` host on the link. While creds are unset the helper returns `twilio_not_configured` and the parent confirmation card surfaces a manual-share fallback. Legacy `sendSms()` + `isTwilioConfigured()` are still exported for any future SMS use case but no production code path calls them.
### Exam Papers Catalog Seed (May 2026)
- `exam_papers` table: **2,462 rows across 59 of 60 subjects** (only Digital Technology empty — no DBE entries published yet).
- Source of truth: `server/data/dbe-papers-catalog.json` (4,149 verified DBE/Stanmore/SAExamPapers entries).
- Seed scripts (idempotent, safe to re-run):
  - `scripts/seed-missing-language-subjects.ts` — adds the 25 official-language + Marine Sciences subject rows.
  - `scripts/seed-exam-papers-from-catalog.ts` — pairs catalog QP+memo entries and inserts into `exam_papers` with real URLs.
- The legacy `seedExamPapers()` in `server/storage.ts` is now superseded by these scripts (it generated synthetic placeholder URLs and only knew ~20 subjects).

### Topic Notes & Flashcards — Nightly Seeder
- **Script**: `scripts/seed-topic-content.ts` (idempotent; populates `topic_notes`, `topic_flashcards`, `literature_works`, and `literature_notes` for all Grade 12 subjects in EN + AF).
- **Wrapper**: `scripts/nightly-topic-content.sh` — runs the seeder on start, then anchors every subsequent run to `CONTENT_SEED_RUN_HOUR_UTC:CONTENT_SEED_RUN_MINUTE_UTC` (default `03:00 UTC` ≈ `05:00 SAST`). Failures are logged with a clear `run FAILED (exit N)` line and do not stop the loop.
- **Workflow**: `Topic Content Seeder` (console output) executes the wrapper. It is configured with `autoStart: true` — it starts automatically with the project so curated topic notes (including newly added subjects like DANCE, MUSIC, DESIGN, DRAMA, RELI) refresh nightly without manual intervention after each deployment. Logs are visible in the workflow console; any newly added subject or topic will pick up notes and flashcards on the next 03:00 UTC pass.
- **Manual trigger**: restart the workflow to force an immediate run; it will then re-anchor to the next 03:00 UTC slot.
- **Why a loop wrapper, not a Scheduled Deployment?** Same reason as audio: Replit workflows have no built-in cron, and the project's single `[deployment]` slot is already used by the autoscale main web app.

### Audio Lessons — Nightly Pre-Generation
- **Script**: `scripts/generate-topic-audio.ts` (idempotent, content-hashed filenames; existing MP3s skipped without an OpenAI call).
- **Wrapper**: `scripts/nightly-topic-audio.sh` — runs the generator on start, then anchors every subsequent run to `AUDIO_GEN_RUN_HOUR_UTC:AUDIO_GEN_RUN_MINUTE_UTC` (default `02:00 UTC` ≈ `04:00 SAST`). Failures are logged with a clear `run FAILED (exit N)` line and do not stop the loop.
- **Workflow**: `Topic Audio Pre-Generation` (console output) executes the wrapper. It is listed in the `Project` workflow group but configured with `autoStart: false` — it will not run automatically when the Project is started. Start it explicitly when you want the nightly schedule active (it will keep itself running after that). Logs are visible in the workflow console; any topic whose `summaryEn` / `summaryAf` text changes (or any newly added topic) automatically gets fresh English + Afrikaans MP3s on the next 02:00 UTC pass.
- **Manual trigger**: restart the workflow to force an immediate run; it will then re-anchor to the next 02:00 UTC slot.
- **Why a loop wrapper, not a Scheduled Deployment?** Replit workflows have no built-in cron, and the project's single `[deployment]` slot is already used by the autoscale main web app — switching it to `scheduled` would take production offline. Until per-job scheduled deployments are available alongside an autoscale primary, the loop wrapper is the supported pattern for daily background work in this repl.

### Production Hardening (Task #394 — May 2026)
- **Admin RBAC**: every admin client page is wrapped in `RequireAdminRoute` (client/src/App.tsx) which blocks non-admins from seeing admin chrome (no flash). Backend `/api/admin/*` is blanket-guarded by `isAuthenticated + requireRole("admin")` plus an `ADMIN_EMAILS` allowlist re-checked on every request and on every login. Full audit in `docs/admin-routes-audit.md`.
- **Boot env validation**: `server/index.ts` now distinguishes always-required vars (`DATABASE_URL`, `SESSION_SECRET`), prod-required vars (`REPL_ID`, `REPLIT_DOMAINS`, `ADMIN_EMAILS`, `OPENAI_API_KEY`) which crash the boot in production, and recommended vars (`YOCO_*`, `VAPID_*`) which warn loudly but don't block the boot.
- **Ingestion Release Gate**: `dbe_verbatim_questions` gained `released_at`, `memo_coverage`, `mark_coverage` (migration `migrations/0011_dbe_release_gate.sql`). `server/release-gate.ts` stamps `released_at` only on `(subject, year, paperNumber, session, language)` tuples with ≥98 % memo coverage AND ≥98 % mark-scheme coverage. Every learner-facing endpoint (`/api/exam/mini-mock/*`, `/api/exam/full/*`, `/api/dbe/available`, `/api/dbe/questions`) filters on `released_at IS NOT NULL` so un-validated papers are invisible — the "Questions being prepared" placeholder in `client/src/pages/exam-session.tsx` was replaced with a simple "Paper not available" empty state. The admin dashboard surfaces `papersIngested / papersValidated / papersReleased` per subject from `/api/admin/dbe-ingestion/subjects`.
- **Dev → Prod sync**: schema changes ship via SQL files under `migrations/` plus a matching `shared/schema.ts` edit. Promote by running `npm run db:push` against dev, then re-applying the same SQL against the production DB through the Database skill (`environment: "production"`). Canonical seeders (`scripts/seed-exam-papers-from-catalog.ts`, `scripts/run-ingest-2015-2025.ts`) are idempotent and safe to re-run against prod with `DATABASE_URL` overridden in a one-off shell. Never manually flip `released_at` or `users.role`.

### Known No-Memo Papers (Task #477 — May 2026)
- **Design Paper 2** is a creative portfolio submission assessed by an **embedded marking rubric** inside the question paper. DBE has never published a separate memo PDF for this paper across any year or language (2015–2025). Confirmed exhaustively in Task #389. The triage script (`scripts/triage-missing-memos.ts`) has a `KNOWN_NO_MEMO_PAPERS` exemption for Design P2 — it emits `MEMO_NOT_PUBLISHED_BY_DBE` instead of `MEMO_MISSING_FROM_CATALOG`, keeping the actionable missing-memo count at 0. See `docs/design-p2-no-memo.md` for full details. To add future portfolio/practical papers with no DBE memo, add a `{ subject, paperNumber }` entry to `KNOWN_NO_MEMO_PAPERS` in the triage script.

### Secure-by-Design Quality Gate (Task #548 — May 2026)
- **Feature Rating Matrix**: `docs/feature-rating-matrix.md` scores every page and API route group on Security (S1–S5) and UX/UI (U1–U5). No S1/S2/U1/U2 findings. All P1 findings implemented and closed.
- **Self-rating checklist**: `docs/secure-by-design-checklist.md` — **every new page or API route must self-rate against this checklist before merge**. Green = combined S+U score 8–10. Amber = 5–7, create P1 follow-up. Red = any S1/U1 or ≤4, blocks merge.
- **P1 UX fixes applied**:
  - Hardcoded `text-white` in `exam-mini-mock.tsx` and `exam-session.tsx` replaced with semantic `text-foreground` / `text-muted-foreground` for design-system correctness.
  - Hardcoded `text-white` in `printable-calendar.tsx` replaced with semantic classes; weekly-goals section labels localised via the existing `t[language]` pattern; print template header subtitle now uses `text-muted-foreground`.
  - `school-dashboard.tsx` loading state replaced with a full skeleton layout matching the header, 6-metric-card grid, two chart panels, and streak section; chart panels wrapped in `overflow-x-auto` + `min-w-[300px]` for safe narrow-viewport rendering.
- **Security P1 audit findings**: No S1/S2 findings across all 52 pages + 10 API route groups. `returnTo` open-redirect vector confirmed already closed in `server/replit_integrations/auth/replitAuth.ts` (checks `startsWith("/") && !startsWith("//")`). The intentionally-public `/api/school/onboarding` POST is documented as S3-by-design (pre-auth school signup form, rate-limited, collects contact info only).

### DBE Ingestion Architecture (Investigation May 2026)
- **Pure regex extraction — no OpenAI calls.** `server/dbe-ingestion.ts` parses PDF text using `splitByQuestionHeaders` (`QUESTION N` / `VRAAG N` regex) and stores results in `dbe_verbatim_questions` (NOT the `questions` table).
- **Learner APIs read `dbe_verbatim_questions`** (12 references in `server/routes.ts` for practice quizzes, Boost, Crunch Time, etc.). The `questions` table is for admin-published content only.
- **"Completed but empty" logs are not a bug** — they're papers whose PDF text didn't match the regex headers (scanned/image PDFs, non-Latin-script African languages, multi-column layouts). The runner's retry logic at `dbe-ingestion.ts:1492` already treats `completed + question_count <= 0` as not-done and retries them on the next pass.
- **Background ingestion**: `Workflows → "DBE Ingestion"` runs `scripts/run-ingest-2015-2025.ts` which processes 2 subjects in parallel and survives across tool calls.
- **Mark-scheme cache is always fresh.** `extractAndStoreVerbatimQuestions` deletes existing rows for a `(subject, year, paperNumber, language)` tuple before re-inserting, so every re-ingestion pass rebuilds `mark_scheme` from the latest `memo_text` via `parseMemoToScheme` (no stale cache path). Other callers that mutate `memo_text` on existing rows — currently the admin `fill-missing` endpoints in `server/routes.ts` (`/api/admin/dbe-ingestion/run` Phase-3 fill, and `/api/admin/dbe-ingestion/fill-missing`) — recompute `markScheme` in the same UPDATE using the new memo and the row's mark allocation. The standalone `scripts/backfill-mark-schemes.ts --force` is therefore only needed for legacy rows whose memo predates this caching change.
