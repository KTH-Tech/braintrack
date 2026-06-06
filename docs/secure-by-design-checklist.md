# Secure-by-Design Checklist

_Task #548 — May 2026. Every new page or API route must self-rate against this checklist before merge._

---

## How to use this checklist

Before opening a PR for any new feature, page, or API route group:

1. Copy the relevant section(s) below into your PR description.
2. Check each item — add a ✅ for pass, ⚠️ for partial/noted, ❌ for fail (explain why).
3. Assign a provisional **S score** (S1–S5) and **U score** (U1–U5).
4. A combined score of 8–10 is Green (merge-ready). Amber (5–7) requires a follow-up task. Red (≤4 or any S1/U1) blocks merge.

---

## Part A — Security Checklist

### A1. Authentication & Session

- [ ] Every new API endpoint that returns or mutates private data is wrapped in `isAuthenticated`.
- [ ] Protected client pages are wrapped in `ProtectedRoute`, `RequireAdminRoute`, `RequireParentRoute`, or `RequireSchoolAdminRoute` as appropriate.
- [ ] No `isAuthenticated` is applied after route-specific handlers that already ran — middleware order is correct.
- [ ] Session cookies rely on Replit OIDC (HttpOnly, Secure, SameSite=Lax). No custom session token is introduced without a security review.

### A2. Authorisation & RBAC

- [ ] Role check (`requireRole(...)`) is applied server-side on every endpoint that is role-restricted.
- [ ] Admin endpoints under `/api/admin/*` are already covered by the blanket guard — new handlers also re-apply `requireRole("admin")` inline (defence-in-depth).
- [ ] Parent endpoints verify `isParentOfLearner(parentId, learnerId)` before returning any learner data.
- [ ] School admin endpoints call `resolveSchoolId(req)` and scope all queries to that school ID.
- [ ] No role or permission decision is made on the client side only.

### A3. Input Validation

- [ ] Every POST/PATCH/PUT request body is validated with a Zod schema before use.
- [ ] Query parameters used in DB queries are cast/validated (e.g. `z.coerce.number()`, `String(...).trim()`).
- [ ] File uploads (if any) are validated for MIME type and max size using `multer` limits.
- [ ] Free-text user input passed to OpenAI is treated as untrusted text — never interpolated as code or instructions.

### A4. Sensitive Data & Secrets

- [ ] No secrets (API keys, signing secrets, DB URLs) appear in API response bodies or client-accessible files.
- [ ] Error responses in production use `safeMessage` (generic 500 message for server errors, specific message for 4xx).
- [ ] Logs in production omit raw request/response bodies for sensitive endpoints (auth, payment).
- [ ] New environment variables are added to the boot-time validation list in `server/index.ts` (required or recommended).

### A5. Rate Limiting & DoS Prevention

- [ ] Public write endpoints use `publicPostLimiter` or a custom `rateLimit`.
- [ ] AI/LLM endpoints use `tutorLimiter`.
- [ ] Payment/checkout endpoints use `paymentLimiter`.
- [ ] Heavy compute endpoints (exam generation, ingestion, bulk operations) use `heavyLimiter`.
- [ ] Auth endpoints use `authLimiter`.
- [ ] No new endpoint accepts unbounded input (add `limit` to DB queries, `max` to arrays, file size to uploads).

### A6. Webhook & External Integration

- [ ] Inbound webhooks (payment providers, external services) verify the signature/HMAC before processing.
- [ ] Webhook processing is idempotent (duplicate events do not double-apply state changes).
- [ ] Outbound API keys for new integrations are stored in environment variables, not hardcoded.

### A7. Test & Dev Endpoints

- [ ] Any test/dev-only endpoint is registered only when `TEST_MODE=true && NODE_ENV !== "production"`.
- [ ] No new `/api/dev/*` or `/api/test/*` route is reachable in production.

---

## Part B — UX/UI Checklist

### B1. Prismglass Design System

- [ ] Cards use `glass-panel` or equivalent Prismglass border/backdrop styles from the design system.
- [ ] Buttons use `shadcn/ui` `<Button>` with the correct variant (`default`, `outline`, `destructive`, `ghost`).
- [ ] Headings follow the Inter font hierarchy defined in Tailwind config.
- [ ] Accent colours use CSS variables (`text-primary`, `text-accent`) — no hardcoded hex or `text-white` for content text.
- [ ] Icons use the `lucide-react` library consistently.

### B2. Loading, Error & Empty States

- [ ] Every page that fetches data shows a loading state (skeleton, spinner, or `PageLoader`) while `isLoading` is true.
- [ ] Every data-fetching component has an error state (message + retry button or toast) when the query fails.
- [ ] Every list/table component has an empty state (descriptive message + CTA) when the result is an empty array.
- [ ] Mutation buttons (`<Button>`) are `disabled` and show a `<Loader2 className="animate-spin">` when `isPending` is true.

### B3. Bilingual Copy (EN + AF)

- [ ] All user-facing strings are stored in a `T = { en: {...}, af: {...} }` object at the top of the page/component.
- [ ] The correct key is selected with `const t = T[language]` where `language` comes from `useLanguage()`.
- [ ] No English string is hardcoded directly in JSX (use `t.someKey`).
- [ ] Afrikaans strings are complete — no `en` values copied as placeholders.
- [ ] Admin-only pages (under `/learn/admin/*`) are English-only by design — exempt from AF requirement.

### B4. Mobile Layout (Responsive)

- [ ] Page renders correctly at 375px (iPhone SE) and 768px (tablet).
- [ ] Long data tables have a horizontal scroll container (`overflow-x-auto`) on mobile.
- [ ] Touch targets (buttons, links) are at least 44×44px.
- [ ] No fixed-width elements that overflow the viewport on 375px.

### B5. Accessibility (WCAG AA)

- [ ] Form `<input>` and `<select>` elements have associated `<label>` (either wrapping or via `htmlFor`/`id`).
- [ ] Icon-only buttons have `aria-label`.
- [ ] Colour contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text) — verified against the dark Prismglass palette.
- [ ] Focus ring is visible on all interactive elements (not removed with `outline-none` without a replacement).
- [ ] Images have descriptive `alt` text (empty `alt=""` only for decorative images).

---

## Part C — Scoring Guide

| Combined Score (S + U) | RAG | Action |
|---|---|---|
| S1 or U1 present | 🔴 Red | **Blocks merge.** Must fix before review. |
| Combined ≤ 4 | 🔴 Red | **Blocks merge.** |
| Combined 5–7 | 🟡 Amber | Merge allowed with a P1 follow-up task created and linked. |
| Combined 8–10 | 🟢 Green | Merge-ready. |

---

## Quick Reference — Middleware Aliases

| Use case | Middleware / function |
|---|---|
| Require any authenticated user | `isAuthenticated` |
| Require admin role + allowlist | `requireRole("admin")` |
| Require parent or admin | `requireRole("parent", "admin")` |
| Require school admin or admin | `requireRole("school_admin", "admin")` |
| Validate learner owns resource | `isParentOfLearner(parentId, learnerId)` |
| Scope school data | `resolveSchoolId(req)` |
| Rate limit auth flows | `authLimiter` |
| Rate limit AI requests | `tutorLimiter` |
| Rate limit payment flows | `paymentLimiter` |
| Rate limit heavy compute | `heavyLimiter` |
| Rate limit public write endpoints | `publicPostLimiter` |

---

_This checklist lives at `docs/secure-by-design-checklist.md`. Update it when new patterns or role types are introduced._
