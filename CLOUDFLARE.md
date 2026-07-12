# Cloudflare Configuration Guide for BrainTrack

This guide provides a detailed, actionable checklist for configuring Cloudflare to protect the BrainTrack platform. Follow these steps to ensure robust security, DDoS protection, and scraping prevention.

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
