# WhatsApp Cloud API engine (`server/whatsapp/`)

BrainTrack's **own** WhatsApp engine, talking directly to Meta's Graph
(WhatsApp Cloud) API. **No Twilio, no third-party BSP.** It is a reusable,
boot-safe module: the server starts fine with none of the env vars below set,
and the webhook is inert until explicitly turned on.

## Files

| File | Role | App-specific? |
|------|------|---------------|
| `client.ts` | Outbound send (`sendWhatsAppText`), config guard (`isWhatsAppConfigured`), signature verify (`verifyWebhookSignature`), payload parse (`parseInboundMessages`). | No — generic Graph-API plumbing. |
| `webhook.ts` | `registerWhatsAppWebhook(app, { handler, ... })` — wires `GET`/`POST /api/whatsapp/webhook`, verification handshake, HMAC check, raw-body capture, per-sender rate limit, fast 200 ack. | No — generic route factory. |
| `handler.ts` | `createBrainTrackWhatsAppHandler(openai)` — phone→learner lookup, opt-out, and Rizz reply. | **Yes** — the only BrainTrack-specific piece. |

## Required environment variables

| Var | Purpose |
|-----|---------|
| `WHATSAPP_TOKEN` | Graph API access token (sent as `Authorization: Bearer …`). |
| `WHATSAPP_PHONE_NUMBER_ID` | The business phone-number ID the sends go out from. |
| `WHATSAPP_VERIFY_TOKEN` | Arbitrary shared secret you choose; echoed back during Meta's `GET` verification handshake. |
| `WHATSAPP_APP_SECRET` | Meta **App Secret** — used to HMAC-verify inbound `POST` payloads (`X-Hub-Signature-256`). |
| `WHATSAPP_TUTOR_ENABLED` | Master on/off. Must be exactly `"true"` for inbound messages to be answered by Rizz. **Default = off** — the endpoint stays live but inert (acks Meta 200, replies to nobody) until this is set. |

All are **optional for boot**. They are intentionally **not** in the required
boot-gate in `server/index.ts`, so a deploy without them still starts.

### Turning it on later

1. Set `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`,
   `WHATSAPP_APP_SECRET`.
2. Set `WHATSAPP_TUTOR_ENABLED=true`.
3. Redeploy. Until step 2 the tutor answers nobody, even with valid creds.

## Meta setup

1. Create a **Meta Business** account and an app at
   <https://developers.facebook.com/> → **Add product → WhatsApp**.
2. In **WhatsApp → API Setup**, grab a **test number** + temporary **access
   token** (`WHATSAPP_TOKEN`) and the **Phone number ID**
   (`WHATSAPP_PHONE_NUMBER_ID`). The permanent App Secret is under
   **App settings → Basic** (`WHATSAPP_APP_SECRET`).
3. **Configure the webhook** (WhatsApp → Configuration):
   - **Callback URL:** `https://braintrack.tech/api/whatsapp/webhook`
   - **Verify token:** the same value you set for `WHATSAPP_VERIFY_TOKEN`.
   - Meta calls `GET` with `hub.mode=subscribe` + `hub.verify_token`; the
     endpoint echoes `hub.challenge` back on a match (else 403).
   - **Subscribe** to the `messages` field.
4. For **production**: add your real business number, complete **Business
   Verification**, and get message templates approved (free-form text only
   works inside the 24-hour customer-service window; outside it you must send an
   approved template).

## Reusing this for another product

1. New Meta app + number → its own `WHATSAPP_*` values (or pass an explicit
   `WhatsAppConfig` object to `sendWhatsAppText` / `registerWhatsAppWebhook` so
   several numbers can coexist in one process).
2. Write your own inbound `handler` (copy `handler.ts` as a template) and pass
   it to `registerWhatsAppWebhook(app, { handler, config, path })`. The generic
   `client.ts` + `webhook.ts` stay untouched.

## Security notes

- Signature verification is **mandatory** — an inbound `POST` with a missing or
  wrong `X-Hub-Signature-256` gets a 403 and is never processed.
- Tokens are never logged; message bodies are never logged in full (PII).
- Inbound text is untrusted. The learner identity comes only from the
  phone→`users` lookup; Rizz then re-reads that user's own data by id and
  enforces its own role guardrails.
