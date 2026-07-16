# Cloudflare Configuration Guide for BrainTrack

This guide provides a detailed, actionable checklist for configuring Cloudflare to protect the BrainTrack platform. Follow these steps to ensure robust security, DDoS protection, and scraping prevention.

## 0. Production DNS & Go-Live (do this FIRST)

Goal: route `braintrack.co.za` (marketing/apex) and `app.braintrack.co.za` (the app)
through Cloudflare to the Render web service `braintrack-api` (Frankfurt).

### Step 1 — Add the site to Cloudflare
1. Cloudflare dashboard → **Add a site** → enter `braintrack.co.za` → choose a plan (Free is fine to start; Pro unlocks Super Bot Fight Mode in §4).
2. Cloudflare shows two **nameservers** (e.g. `xxx.ns.cloudflare.com`). At your **domain registrar**, replace the existing nameservers with these two. Propagation: minutes–24h.

### Step 2 — Attach the custom domains in Render
1. Render dashboard → service **braintrack-api** → **Settings → Custom Domains**.
2. Add both `app.braintrack.co.za` and `braintrack.co.za`.
3. Render shows a target host to point at — usually `braintrack-api.onrender.com`
   (Render may also show an A record IP for the apex; prefer the CNAME target).
   Copy that exact value; use it in Step 3.

### Step 3 — Create the DNS records in Cloudflare (DNS → Records)

| Type  | Name  | Target                        | Proxy         |
|-------|-------|-------------------------------|---------------|
| CNAME | `app` | `braintrack-api.onrender.com` | **Proxied** 🟠 |
| CNAME | `@`   | `braintrack-api.onrender.com` | **Proxied** 🟠 (apex; Cloudflare auto-flattens to an A record) |
| CNAME | `www` | `braintrack.co.za`            | **Proxied** 🟠 |

- Keep the proxy **ON** (orange cloud) for all three — this is what activates the WAF, DDoS, and rate-limiting rules below.
- Use the exact target Render gave you in Step 2 if it differs from `braintrack-api.onrender.com`.

### Step 4 — SSL/TLS
- Set **SSL/TLS → Overview → Full (Strict)** (matches §8). Render already serves a valid cert on `*.onrender.com`, so Strict works immediately.
- Wait until Render's custom-domain status shows **Verified / Certificate Issued** for both domains before sending real traffic.

### Step 5 — Redirect apex → app (optional but recommended)
If the marketing site and app are the same service, send the apex to the app so there's one canonical host:
- **Rules → Redirect Rules → Create**: if hostname `braintrack.co.za` → **301** to `https://app.braintrack.co.za/$1` (or to `braintrack.co.za` staying, if you keep a separate marketing page — your call).

### Step 6 — Set Render env vars (Render dashboard → Environment)
`APP_URL=https://app.braintrack.co.za` (no trailing slash), plus everything listed at the top of `render.yaml` (DATABASE_URL, SESSION_SECRET, CRON_SECRET, OPENAI_API_KEY, RESEND/SENDGRID key, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VAPID keys, ADMIN_EMAILS, NODE_ENV=production).

### Step 7 — Verify
- `https://app.braintrack.co.za/api/health` returns 200.
- Response headers include `cf-ray` (proof traffic is going through Cloudflare) and `strict-transport-security`.
- Sign-in, a payment webhook test, and an admin route all work.

**Origin-lock reminder (§6):** until you complete Authenticated Origin Pulls / IP-allowlisting to Cloudflare's ranges, an attacker who discovers `braintrack-api.onrender.com` can bypass Cloudflare and hit the origin directly. The app's rate limiters use `clientIp()` (prefers `CF-Connecting-IP`) and `trust proxy = 1` is set, so behind Cloudflare the real client IP is correct — but do §6 before you rely on the WAF for anything security-critical.

---

## 1. WAF Managed Rules (OWASP)
- **Action**: Enable OWASP Managed Rules.
- **Mode**: Set to **Block**.
- **Sensitivity**: Medium or High (start with Medium and monitor for false positives).
- **Anomaly Threshold**: 25 (default).

## 2. DDoS Protection
- **Action**: Ensure "HTTP DDoS Attack Protection" and "L3/L4 DDoS Protection" are enabled (default for all plans).
- **Configuration**: Keep "DDoS Protection" at the default "High" setting.

## 3. Custom WAF Rate Limiting Rules
Configure the following rate limits under **Security > WAF > Rate limiting rules**.

| Rule Name | Path Pattern | Method | Rate Limit | Action |
|-----------|--------------|--------|------------|--------|
| Auth Protection | `/api/login`, `/api/signup` | ANY | 5 req / 1 min | Block |
| General API | `/api/*` | ANY | 60 req / 1 min | Rate Limit |
| Exam Protection | `/api/exam/*` | ANY | 10 req / 5 min | Block |
| Netcash Webhook | `/api/netcash/webhook` | POST | 5 req / 1 min | Block |
| PayFast ITN | `/api/payfast/itn` | POST | 5 req / 1 min | Block |
| AI Content Protection | `/api/tutor/*`, `/api/notes/*` | ANY | 20 req / 1 min | Block |

**Note for payment webhooks (Netcash, PayFast)**:
- Restrict to **POST** method only.
- Set "Maximum Payload Size" to **100 KB** (matching server limit).
- Yoco was removed — `/api/yoco/webhook` now returns HTTP 410 and needs no rule.

## 4. Bot Management
- **Security Level**: Set to "Medium" or "High".
- **Bot Fighting Mode**: Enable "Bot Fight Mode" (Free plan) or "Super Bot Fight Mode" (Pro/Biz).
- **WAF Custom Rules for Bots**:
  - **Rule**: If `cf.bot_management.score < 30` AND path is in `/api/login`, `/api/signup` → **Managed Challenge**.
  - **Rule**: If `cf.client.bot` is true (verified bots) AND path is in `/api/tutor/*`, `/api/notes/*` → **JS Challenge**.

## 5. Scraping Prevention
- **User-Agent Blocking**: Add a WAF rule to block common scrapers:
  - `http.user_agent contains "Scrapy"` OR `http.user_agent contains "curl"` OR `http.user_agent contains "wget"` OR `http.user_agent contains "Puppeteer"` OR `http.user_agent contains "Playwright"`
- **Browser Integrity Check**: Enable under **Security > Settings**.
- **Hotlink Protection**: Enable under **Scrape Shield**.

## 6. Origin Protection
- **Authenticated Origin Pulls**: Enable to ensure only Cloudflare can connect to your origin.
- **IP Allowlist**: Configure your server firewall to ONLY allow traffic from [Cloudflare IP ranges](https://www.cloudflare.com/ips/).

## 7. Admin Protection (Cloudflare Access)
- **Application**: Protect your admin routes (e.g., `admin.braintrack.co.za` or specific `/api/admin/*` paths).
- **Policy**:
  - Allow only specific email domains/addresses.
  - Require MFA (Multi-Factor Authentication).

## 8. SSL/TLS & HSTS
- **SSL/TLS Mode**: Full (Strict).
- **HSTS**: Enable under **SSL/TLS > Edge Certificates**.
  - Max Age: 12 months (31536000 seconds).
  - Include Subdomains: Yes.
  - Preload: Yes.
- **Minimum TLS Version**: 1.2.

## 9. Content Protection (Frontend Hints)
Cloudflare recognizes certain headers and tags to help with protection:
- Ensure the server continues to send `Cache-Control: no-store` for all `/api` routes.
- Cloudflare’s "Polish" and "Mirage" can be enabled for image optimization, but ensure they don't interfere with dynamically generated content.

---
*Last Updated: February 2025*
