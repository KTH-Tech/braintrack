# BrainTrack Security Documentation

## Incident Response — Severity Levels

| Level | Name | SLA | Actions |
|-------|------|-----|---------|
| **P1** | Active Breach | Contain within **15 minutes** | Block at Cloudflare + rotate signing keys + disable affected endpoints via `/api/admin/emergency` |
| **P2** | Suspected Fraud / Abuse | Investigate within **2 hours** | Flag accounts + admin review of audit log + referral fraud check |
| **P3** | Policy Violation / Anomaly | Review within **24 hours** | Log + monitor + alert if pattern continues |

---

## Emergency Controls — `POST /api/admin/emergency`

Requires: `admin` role. Every action is immutably audit-logged with the admin's user ID, timestamp, and IP address.

### `disable_endpoint`

Adds an API path to an in-memory blocklist. All subsequent requests to that path receive `503 Service Unavailable` until the server restarts.

**Request:**
```json
{ "action": "disable_endpoint", "path": "/api/exam/generate" }
```

**Use case:** P1 — immediately shut down a compromised or abused endpoint during an active incident without a deployment.

**Reverting:** Restart the server process. The blocklist is in-memory only and does not persist across restarts.

**Check current blocklist:**
```
GET /api/admin/emergency/status
```

---

### `force_logout_user`

Revokes all active refresh tokens for a given user ID. Their current access token will continue working until it expires (max 15 min), after which they are fully logged out and cannot silently refresh.

**Request:**
```json
{ "action": "force_logout_user", "userId": "user-uuid-here" }
```

**Use case:** P1/P2 — immediately neutralise a compromised or fraudulent account's session without requiring a password reset.

---

### `rotate_signing_key`

Rotates the in-memory JWT signing key by appending a random suffix to the base `JWT_SECRET`. All previously issued access tokens become immediately invalid (they fail signature verification). Users must re-authenticate or use a valid refresh token to obtain a new access token.

**Request:**
```json
{ "action": "rotate_signing_key" }
```

**Use case:** P1 — suspected signing key compromise or mass-session breach. Invalidates all JWTs instantly without a server restart.

**Impact:** All currently authenticated users (via JWT) will receive 401 on their next API call and must re-authenticate. Sessions backed by OIDC (Replit Auth) are not affected — only Bearer JWT access tokens.

**Note:** The rotated key is only held in memory. A server restart reverts to the base `JWT_SECRET`. For a permanent key change, update the `JWT_SECRET` environment variable and redeploy.

---

## P1 Response Runbook (Active Breach — contain within 15 minutes)

1. **Cloudflare:** Enable "Under Attack" mode or add an IP block rule for the attacker's IP range.
2. **Rotate signing key:** `POST /api/admin/emergency { "action": "rotate_signing_key" }` — invalidates all existing JWTs.
3. **Disable affected endpoint:** `POST /api/admin/emergency { "action": "disable_endpoint", "path": "/api/..." }` — returns 503 immediately.
4. **Force logout compromised account:** `POST /api/admin/emergency { "action": "force_logout_user", "userId": "..." }`.
5. **Review audit log:** Check the `audit_log` table for `SECURITY_ALERT`, `SUSPECTED_BOT`, and `SUSPECTED_SCRAPING` entries around the incident window.
6. **Deploy fix:** Once containment is confirmed, deploy the permanent fix and restart the server (which clears the in-memory blocklist).
7. **Post-incident:** Document the incident in the audit log with action `INCIDENT_POSTMORTEM`.

## P2 Response Runbook (Suspected Fraud/Abuse — investigate within 2 hours)

1. Review `GET /api/admin/referral-flags` for flagged referral patterns.
2. Check audit log for `REFERRAL_FLAG_*`, `ADMIN_UPDATE_FIRST_TOUCH_SOURCE`, and `SUSPECTED_BOT` events.
3. Use `POST /api/admin/users/:id/force-unlock` or `force_logout_user` as appropriate.
4. Mark flags as reviewed via `PATCH /api/admin/referral-flags/:id/review`.

## P3 Response Runbook (Policy Violation / Anomaly — review within 24 hours)

1. Review `SECURITY_ALERT` entries in audit log.
2. Assess whether the anomaly pattern warrants escalation to P2.
3. Adjust rate limits or add bot detection patterns if needed.
4. Document findings in the audit log.

---

## Watermark System — AI-Generated Content Traceability

Every AI-generated response (tutor answers, topic explanations, free-form Q&A, and study notes) returned by BrainTrack's API contains an invisible watermark that allows leaked content to be traced back to the account that retrieved it.

### JSON Response Watermark (`_wm` field)

All AI-generated API responses include a `_wm` field in the JSON body:

```json
{
  "answer": "...",
  "_wm": {
    "uid": "a3f9c2d1b5e60712",
    "ts": "2025-03-01T10:23:45.000Z",
    "ct": "ask"
  }
}
```

| Field | Description |
|-------|-------------|
| `uid` | SHA-256 HMAC of `userId + WATERMARK_SECRET`, truncated to 16 hex chars. This is a one-way hash — it identifies the user without exposing their raw ID. |
| `ts` | ISO-8601 timestamp of when the content was retrieved. |
| `ct` | Content type: `tutor`, `topic_tutor`, `ask`, `notes`, or `exam`. |

#### Decoding a `_wm` Field

To identify which user retrieved a piece of leaked content:

1. Extract the `uid` value from the `_wm` field.
2. For each user in the database, compute `SHA-256(userId + WATERMARK_SECRET)` and take the first 16 hex characters.
3. The user whose computed hash matches the `uid` is the source of the leak.

```bash
# Example using openssl (replace USER_ID and WATERMARK_SECRET):
echo -n "USER_IDWATERMARK_SECRET" | openssl dgst -sha256 | awk '{print substr($2,1,16)}'
```

The `WATERMARK_SECRET` is stored as an environment variable and must never be committed to source control.

---

### Zero-Width Character Fingerprint (Study Notes)

For study notes specifically, an additional invisible fingerprint is embedded directly into the plain text using Unicode zero-width characters:

- **Zero-Width Space** (`U+200B`) encodes a binary `0`
- **Zero-Width Non-Joiner** (`U+200C`) encodes a binary `1`

The fingerprint encodes the first 32 bits of the user's watermark hash (4 hex nibbles × 8 bits) as a sequence of 32 zero-width characters, distributed through the text at regular intervals. These characters are invisible to readers but detectable in raw text or hex dump.

#### Detecting the Fingerprint

To extract the fingerprint from leaked plain text:

1. Filter out all non-`U+200B`/`U+200C` characters from the text.
2. Map each remaining character: `U+200B` → `0`, `U+200C` → `1`.
3. Group the binary string into 4-bit nibbles and convert to hex.
4. Compare against `SHA-256(userId + WATERMARK_SECRET).slice(0, 8)` for all users.

```python
# Python example
import re

def extract_fingerprint(text):
    bits = ""
    for char in text:
        if char == "\u200b":
            bits += "0"
        elif char == "\u200c":
            bits += "1"
    # Convert binary string to hex
    nibbles = [bits[i:i+4] for i in range(0, len(bits), 4)]
    return "".join(hex(int(n, 2))[2:] for n in nibbles if len(n) == 4)
```

---

## Environment Variables Required

The following environment variables must be set in production. The server will refuse to start if any required variable is absent:

| Variable | Purpose |
|----------|---------|
| `WATERMARK_SECRET` | Secret salt for watermark hash generation. Must be at least 32 random characters. |
| `JWT_SECRET` | Secret for signing JWT access tokens. |
| `SESSION_SECRET` | Secret for express-session cookie signing. |
| `YOCO_SECRET_KEY` | Yoco payment API secret key. |
| `YOCO_WEBHOOK_SECRET` | Secret for validating Yoco webhook HMAC signatures. |
| `DATABASE_URL` | PostgreSQL connection string. |
| `OPENAI_API_KEY` | OpenAI API key for AI tutor and note generation. |
