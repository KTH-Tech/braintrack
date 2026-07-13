# BrainTrack — Deployment Handoff

Turnkey guide for the developer deploying BrainTrack to production.
Architecture: **Squarespace DNS → Render (app) → Supabase (Postgres)**. Cloudflare
(WAF/DDoS) is optional and can be layered later — not required for launch.

> **Deploy the `launch-prep` branch, NOT `main`.** `main` is missing all the launch
> fixes (crash-resilience, DB-aware health check, `reusePort`/Windows, onboarding
> constraint fix, ingestion guard) and has a divergent history. `launch-prep`
> builds green (`npm run build`) and typechecks clean (`npx tsc`).

---

## 0. Accounts you need
| Account | For | Cost |
|---|---|---|
| Render | App hosting | Free/Standard |
| Supabase | Postgres database | Free tier OK to start |
| OpenAI | AI tutor + notes + DBE ingestion OCR | Pay-as-you-go (card) |
| Resend (or SendGrid) | Transactional email | Free tier |
| Twilio + Meta WABA | SMS / WhatsApp | Paid + **Meta approval (days)** |

## 1. Create the Supabase database
1. New Supabase project → wait for it to provision.
2. Grab from **Project Settings**:
   - `DATABASE_URL` — **Database → Connection string → "Transaction" pooler (port 6543)**, URL-encode the password.
   - `SUPABASE_URL` — Project URL (`https://<ref>.supabase.co`).
   - `SUPABASE_SERVICE_ROLE_KEY` — API → service_role key (**server-only, never expose**).

## 2. Push the schema to the new DB
From a checkout of `launch-prep`:
```bash
npm install
DATABASE_URL='<supabase-url>' npx drizzle-kit push --force
```
This creates all tables. The app auto-seeds subjects + the 5,396-paper catalog +
mock exams + NSC 2026 timetable on first boot.

## 3. Create the Render service
- New → **Blueprint**, point at the repo, **select branch `launch-prep`**.
  (`render.yaml` defines the web service `braintrack-api` + 5 cron jobs.)
- Build: `npm install && npm run build` · Start: `node dist/index.cjs` · Health: `/api/health`.

## 4. Set environment variables (Render dashboard)
**Required to boot:**
```
NODE_ENV=production
PORT=5000
DATABASE_URL=<supabase transaction-pooler url>
SESSION_SECRET=<generated — see launch session, do NOT commit>
CRON_SECRET=<generated>
APP_URL=https://app.braintrack.co.za
SUPABASE_URL=<...>
SUPABASE_SERVICE_ROLE_KEY=<...>
ADMIN_EMAILS=<comma-separated admin emails>
```
**AI (tutor/notes/ingestion):**
```
OPENAI_API_KEY=<real OpenAI key>
ENABLE_OCR_FALLBACK=1        # needed for DBE ingestion yield — see docs/INGESTION_STANDARDS.md
```
**Comms — Push (free, keys already generated in the launch session):**
```
VAPID_PUBLIC_KEY=<generated>
VAPID_PRIVATE_KEY=<generated>
VAPID_SUBJECT=mailto:enterprise@kth-tech.com
```
**Comms — Email (launch-critical: signup/verify/receipts):**
```
RESEND_API_KEY=<resend key>       # or SENDGRID_API_KEY
```
**Comms — SMS / WhatsApp (needs Meta WABA approval — NOT day-one):**
```
TWILIO_ACCOUNT_SID=<...>
TWILIO_AUTH_TOKEN=<...>
TWILIO_WHATSAPP_FROM=<whatsapp:+...>
TWILIO_WHATSAPP_CONTENT_SID=<approved template sid>
TWILIO_WHATSAPP_CONTENT_SID_AF=<approved AF template sid>
```
> The app **fails safe** on any missing comms key — that channel is simply disabled
> (verified: push returns a clean 503, not a crash). So you can launch with email+push
> and add WhatsApp when Meta approval lands.

## 5. Point the domain (Squarespace)
1. Render → service → **Settings → Custom Domains** → add `app.braintrack.co.za` → copy the CNAME target.
2. Squarespace → **Settings → Domains → DNS** → add: **Host `app`, Type `CNAME`, Value = Render target**.
3. Render auto-issues SSL. Propagation: minutes–1hr. (Keep the marketing site on the root.)

## 6. Verify
```
curl https://<service>.onrender.com/healthz      # → 200 "ok"  (liveness)
curl https://<service>.onrender.com/api/health   # → 200 {"db":"ok"}  (readiness)
```
`/api/health` returning `503 db:unreachable` means `DATABASE_URL` is wrong.

---

## Not ready day-one (track, don't assume)
- **Question bank** — near-empty. Run `scripts/diagnose-one-subject.ts` with a real
  `OPENAI_API_KEY` + `ENABLE_OCR_FALLBACK=1` to measure yield before mass-ingesting
  (`scripts/run-ingest-2015-2025.ts`). See `docs/INGESTION_STANDARDS.md`.
- **Billing** (R169/mo, card-on-file, minors parent-consent) — not built. Launch **free** until it is.
- **WhatsApp** — code ready, but blocked on Twilio + Meta WABA verification + template approval (days).

## Verified working (this session)
Build ✔ · typecheck ✔ · 210/229 E2E (rest env-only) ✔ · live boot + DB-aware health ✔ ·
onboarding ✔ · rewards-mall coin economy full E2E ✔ (no double/over-spend).
