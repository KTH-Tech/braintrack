# BrainTrack — Environment Variable Reference

> Last updated: May 2026 (Task #481)

This document lists every environment variable and secret the application uses, which environment(s) it belongs to, whether it is required or optional, its current status, and what breaks if it is missing.

Variables are stored as Replit **Secrets** (encrypted, global) or **Env Vars** (plaintext, scoped to `shared` / `development` / `production`). Use the Replit Secrets panel or the `environment-secrets` agent skill to add or update them.

---

## Legend

| Status | Meaning |
|--------|---------|
| ✅ Set | Configured and active |
| ⚠️ Missing | Not yet configured — see "Breaks if missing" column |
| 🔒 Secret | Encrypted Replit Secret (not visible once saved) |
| 📋 Env Var | Plain Replit Env Var (scoped to an environment) |

---

## Always Required (dev + prod)

| Variable | Type | Status | Description | Breaks if missing |
|----------|------|--------|-------------|-------------------|
| `DATABASE_URL` | 🔒 Secret | ✅ Set | PostgreSQL connection string. After Supabase migration this must be the **pooled** URL (port 6543). | Server exits at boot |
| `SESSION_SECRET` | 🔒 Secret | ✅ Set | Express session signing key | Server exits at boot |

---

## Supabase Pro / PgBouncer (post-migration)

These variables are relevant after completing the Supabase Pro migration (Task #556). See `docs/supabase-migration-runbook.md` for the full step-by-step guide.

| Variable | Type | Status | Description | Breaks if missing |
|----------|------|--------|-------------|-------------------|
| `DATABASE_URL` | 🔒 Secret | ✅ Set | Must point to Supabase **pooled** connection string (port **6543**, transaction mode) after migration. All app runtime queries go through PgBouncer. | Server exits at boot |
| `DATABASE_URL_DIRECT` | 🔒 Secret | ⚠️ Add after migration | Supabase **direct** connection string (port **5432**). Used by `drizzle-kit push` / `db:push`, `pg_restore`, and `scripts/supabase-migrate.sh`. Not used at app runtime. | `npm run db:push` falls back to `DATABASE_URL` (works but bypasses PgBouncer safety on DDL) |

---

## Required in Production Only

These variables are validated at boot time in production (`NODE_ENV=production`). Missing any of them prevents the server from starting.

| Variable | Type | Status | Description | Breaks if missing |
|----------|------|--------|-------------|-------------------|
| `REPL_ID` | 🔒 Secret | ✅ Set (runtime) | Replit OIDC client ID | Server exits at boot; login fails |
| `REPLIT_DOMAINS` | 🔒 Secret | ✅ Set (runtime) | Allowed OIDC return domains | Server exits at boot; OAuth redirect fails |
| `ADMIN_EMAILS` | 📋 Env Var (prod) | ✅ Set | Comma-separated admin email allowlist | Server exits at boot; no admin access |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | 🔒 Secret | ✅ Set | OpenAI API key via Replit integration | Server exits at boot; Smart Tutor broken |

---

## Push Notifications (VAPID)

Generated once via `web-push` and stored as shared env vars. Both keys must be set for push notifications to work in any environment.

| Variable | Type | Status | Description | Breaks if missing |
|----------|------|--------|-------------|-------------------|
| `VAPID_PUBLIC_KEY` | 📋 Env Var (shared) | ✅ Set | VAPID public key (sent to browser) | Push subscription fails silently; `/api/push/vapid-public-key` returns 503 |
| `VAPID_PRIVATE_KEY` | 📋 Env Var (shared) | ✅ Set | VAPID private key (signs push messages) | Push delivery fails; streak/trial/daily-focus reminders do nothing |
| `VAPID_SUBJECT` | 📋 Env Var (shared) | ⚠️ Missing (optional) | `mailto:` or HTTPS URL for push contact | Defaults to `mailto:learn@kth-tech.com`; not required |

To regenerate VAPID keys (e.g. after key rotation), run:
```bash
node -e "const wp = require('web-push'); console.log(wp.generateVAPIDKeys());"
```
Then update `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`. **Warning:** all existing browser push subscriptions become invalid and must be re-registered by users.

---

## Cron / Nightly Jobs

| Variable | Type | Status | Description | Breaks if missing |
|----------|------|--------|-------------|-------------------|
| `CRON_SECRET` | 🔒 Secret | ✅ Set | Bearer token checked by cron endpoints | All three cron endpoints (`send-streak-reminders`, `send-daily-focus`, `send-trial-reminders`) return 503 when unset; nightly shell scripts skip their HTTP call and log a warning |

All three nightly shell scripts (`scripts/nightly-trial-reminders.sh`, `scripts/nightly-daily-focus.sh`, and the streak script) read `CRON_SECRET` at runtime and skip the HTTP call if it is unset, logging a clear warning. All three server endpoints fail closed with 503 when the secret is absent — there is no insecure fallback.

---

## OpenAI / AI Features

| Variable | Type | Status | Description | Breaks if missing |
|----------|------|--------|-------------|-------------------|
| `AI_INTEGRATIONS_OPENAI_API_KEY` | 🔒 Secret | ✅ Set | Primary OpenAI key (Replit integration). Used by Smart Tutor, memo helpers, OCR. | Smart Tutor, Boost, Crunch Time, topic explanations all fail |
| `OPENAI_API_KEY` | 📋 Env Var / 🔒 Secret | ⚠️ Missing (optional) | Explicit OpenAI key for standalone scripts. If absent, scripts fall back to `AI_INTEGRATIONS_OPENAI_API_KEY`. | `scripts/generate-topic-audio.ts` would abort — but the fallback means this is now optional (Task #481 fix) |

> **Note:** All standalone scripts (`scripts/generate-topic-audio.ts`, `scripts/backfill-voice-note-transcripts.ts`) now resolve `OPENAI_API_KEY || AI_INTEGRATIONS_OPENAI_API_KEY`, so a separate `OPENAI_API_KEY` is only needed if you want to use a different key for scripts vs the Smart Tutor. The server itself always uses `AI_INTEGRATIONS_OPENAI_API_KEY`.

---

## Netcash (Payment Gateway)

All Netcash variables are **optional** — when absent the checkout init endpoints return `503 netcash_not_configured` and the 14-day free trial flow remains fully usable. Set these when you receive credentials from Netcash.

| Variable | Type | Status | Description | Breaks if missing |
|----------|------|--------|-------------|-------------------|
| `NETCASH_SERVICE_KEY` | 🔒 Secret | ⚠️ Missing | Netcash service/merchant key | Checkout init returns 503; no card or DebiCheck payments |
| `NETCASH_SOFTWARE_VENDOR_KEY` | 🔒 Secret | ⚠️ Missing | Software vendor key from Netcash | Checkout init returns 503 |
| `NETCASH_WEBHOOK_SECRET` | 🔒 Secret | ⚠️ Missing | HMAC-SHA256 webhook signing secret | Incoming webhook events rejected (signature mismatch) |
| `NETCASH_PCI_VAULT_USERNAME` | 🔒 Secret | ⚠️ Missing | PCI vault username (recurring card) | Recurring card tokenisation fails |
| `NETCASH_PCI_VAULT_PASSWORD` | 🔒 Secret | ⚠️ Missing | PCI vault password (recurring card) | Recurring card tokenisation fails |
| `NETCASH_DEBICHECK_MERCHANT_ID` | 🔒 Secret | ⚠️ Missing | DebiCheck merchant ID | DebiCheck mandate flow fails |

**To configure:** Obtain credentials from your Netcash account portal and paste each value into the Replit Secrets panel under the exact key name above.

---

## Twilio / WhatsApp (Onboarding Links)

All Twilio variables are **optional** — when absent the onboarding-link helper returns `twilio_not_configured` and the parent confirmation card shows a manual-share fallback. Set these when you have a Twilio account with a WhatsApp sender approved.

| Variable | Type | Status | Description | Breaks if missing |
|----------|------|--------|-------------|-------------------|
| `TWILIO_ACCOUNT_SID` | 🔒 Secret | ⚠️ Missing | Twilio Account SID | WhatsApp delivery fails; manual-share fallback shown |
| `TWILIO_AUTH_TOKEN` | 🔒 Secret | ⚠️ Missing | Twilio Auth Token | WhatsApp delivery fails |
| `TWILIO_WHATSAPP_FROM` | 🔒 Secret | ⚠️ Missing | WhatsApp-enabled sender number (E.164, e.g. `+27XXXXXXXXX`; `whatsapp:` prefix added automatically) | WhatsApp delivery fails |
| `TWILIO_WHATSAPP_CONTENT_SID` | 🔒 Secret | ⚠️ Missing (optional) | Approved template SID for out-of-session messages | Messages outside 24 h window fail; not required if all onboarding is within-session |
| `TWILIO_WHATSAPP_CONTENT_VARIABLES_JSON` | 🔒 Secret | ⚠️ Missing (optional) | JSON variables for the template above | Only needed if `TWILIO_WHATSAPP_CONTENT_SID` is set |

**To configure:** Log in to console.twilio.com, navigate to Messaging → Senders, copy the credentials, and paste each into the Replit Secrets panel.

---

## Web Push / Notifications (other)

| Variable | Type | Status | Description | Breaks if missing |
|----------|------|--------|-------------|-------------------|
| `PUBLIC_BASE_URL` | 📋 Env Var (shared) | ⚠️ Missing (optional) | Forces canonical `https://braintrack.app` host on onboarding links. If absent, the request host is used. | Links in WhatsApp messages may show the Replit dev domain instead of the production domain |

---

## Email (SendGrid — optional)

| Variable | Type | Status | Description | Breaks if missing |
|----------|------|--------|-------------|-------------------|
| `SENDGRID_API_KEY` | 🔒 Secret | ⚠️ Missing (optional) | SendGrid API key for trial-expiry email fallback (Task #460) | Email fallback for learners without push subscriptions silently skipped; push-only path still works |

---

## Web Push (VAPID) — deprecated legacy variable

| Variable | Type | Status | Description | Breaks if missing |
|----------|------|--------|-------------|-------------------|
| `YOCO_SECRET_KEY` | 🔒 Secret | ⚠️ Missing (legacy) | Legacy Yoco secret key. Yoco has been fully removed (all endpoints return 410 Gone). This var is no longer used. | Nothing — Yoco is removed |
| `YOCO_WEBHOOK_SECRET` | 🔒 Secret | ⚠️ Missing (legacy) | Legacy Yoco webhook secret. Not used. | Nothing — Yoco is removed |

---

## Audio Generation (optional tuning)

These env vars tune the nightly audio pre-generation script. All have safe defaults.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `AUDIO_GEN_CONCURRENCY` | 📋 Env Var | `2` | Parallel TTS requests per run |
| `AUDIO_GEN_LANGS` | 📋 Env Var | `en,af` | Comma-separated language codes to generate |
| `AUDIO_GEN_SUBJECT_ID` | 📋 Env Var | *(all)* | Restrict run to a single subject ID |
| `AUDIO_GEN_RUN_HOUR_UTC` | 📋 Env Var | `2` | Hour (UTC) for the nightly audio run |
| `AUDIO_GEN_RUN_MINUTE_UTC` | 📋 Env Var | `0` | Minute (UTC) for the nightly audio run |
| `AUDIO_GEN_RUN_ON_START` | 📋 Env Var | `1` | Set to `0` to skip the immediate run on workflow start |

---

## Nightly Trial Reminders (optional tuning)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `TRIAL_REMINDER_RUN_HOUR_UTC` | 📋 Env Var | `5` | Hour (UTC) for trial reminder push (≈07:00 SAST) |
| `TRIAL_REMINDER_RUN_MINUTE_UTC` | 📋 Env Var | `0` | Minute (UTC) for trial reminder push |
| `TRIAL_REMINDER_RUN_ON_START` | 📋 Env Var | `0` | Set to `1` to fire immediately on workflow start |
| `TRIAL_REMINDER_TARGET_URL` | 📋 Env Var | `http://127.0.0.1:5000/api/push/send-trial-reminders` | Internal URL for the trial-reminder cron endpoint |

---

## Runtime-Managed (do not set manually)

These are injected automatically by the Replit platform. Do not override them.

| Variable | Description |
|----------|-------------|
| `REPL_ID` | Replit OIDC client ID |
| `REPLIT_DOMAINS` | Allowed OIDC domains |
| `REPLIT_DEV_DOMAIN` | Dev preview domain |
| `PGDATABASE`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` | PostgreSQL connection parts (DATABASE_URL is constructed from these) |

---

## Quick-Reference: What Breaks Today Without Action

| Feature | Broken? | Fix |
|---------|---------|-----|
| Smart Tutor / AI features | ✅ Working | `AI_INTEGRATIONS_OPENAI_API_KEY` is set |
| Push notifications (VAPID) | ✅ Working | `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` set (Task #481) |
| Nightly cron jobs | ✅ Working | `CRON_SECRET` set (Task #481) |
| Audio pre-generation script | ✅ Working | Falls back to `AI_INTEGRATIONS_OPENAI_API_KEY` (Task #481) |
| Netcash payments | ⚠️ Disabled | Paste credentials from Netcash account portal |
| WhatsApp onboarding links | ⚠️ Disabled (manual fallback shown) | Paste credentials from Twilio console |
| Trial-expiry emails (SendGrid) | ⚠️ Disabled (push path still works) | Paste `SENDGRID_API_KEY` from SendGrid dashboard |
