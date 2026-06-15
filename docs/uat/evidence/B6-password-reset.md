# B6 — Password reset evidence (OAuth-only design)

**UAT row:** B6 — "Request password reset → email arrives, reset round-trips"
**Resolution:** N/A by design. BrainTrack delegates all credential
management — including password reset — to Replit's identity provider.
Closure date: 2026-05-04. Tracking task: #303.

## Why there is no BrainTrack-issued reset email

`server/routes.ts:987-995` documents the design boundary:

> This app uses Replit OAuth exclusively — there are no email/password
> signup or password-reset endpoints. The two OAuth entry points are
> rate-limited here:
>   /api/login    — initiates the Replit OAuth redirect
>   /api/callback — receives the OAuth authorization code

A repository-wide search confirms there is no `/api/auth/reset-password`
handler, no `nodemailer` / `sendgrid` / `postmark` / `mailgun` / `resend`
import, and no SMTP environment variables. Wiring an SMTP transport for
a reset link BrainTrack does not own would create a parallel credential
surface that conflicts with the OAuth-only model.

## Verified round-trip path (OAuth design)

The "round-trip" the UAT row was written for is owned by Replit. Under
the OAuth design the equivalent path is:

1. Visitor opens `/` → `client/src/components/public-nav.tsx` shows the
   Sign In CTA with the EN/AF note "Sign-in powered by Replit. Account
   and password reset are managed there."
2. Click → browser navigates to `/api/login`
   (`server/replit_integrations/auth/replitAuth.ts`).
3. Replit's hosted identity screen handles credentials, MFA, and the
   "Forgot password?" recovery flow (out-of-band email sent by Replit,
   not BrainTrack).
4. On success Replit redirects back to `/api/callback`, the session is
   established, and the user lands on `/dashboard` (or the requested
   `returnTo`).

The same boundary is now stated on the three sign-in entry points
where a UAT tester might expect a "Forgot password?" link:

| Surface                                    | Test ID                                  |
|--------------------------------------------|------------------------------------------|
| `client/src/components/public-nav.tsx` (desktop) | `text-replit-auth-note`             |
| `client/src/components/public-nav.tsx` (mobile)  | `text-mobile-replit-auth-note`      |
| `client/src/pages/admin-signin.tsx`        | `text-admin-signin-replit-note`          |
| `client/src/pages/activate.tsx`            | `text-activate-replit-auth-note`         |

Each note is rendered in both EN and AF via `useLanguage()` /
`isAf`-gated copy already used elsewhere in the file.

## Re-test guidance

- EN: load `/`, confirm the Sign In button shows "Sign-in powered by
  Replit" beneath it; click → land on Replit's identity screen.
- AF: toggle language to AF, repeat; copy reads "Aanmeld via Replit".
- Admin: load `/admin-signin`, confirm the Replit-managed account note
  is visible above the Sign in button (EN and AF).
- Mobile: open the public nav menu on a mobile viewport, confirm the
  longer note appears under the Sign In CTA in EN and AF.

## Reopen criteria

This row should only be reopened if BrainTrack later introduces a
native email/password store. At that point an SMTP transport (SendGrid
/ Postmark / Resend) and a `/api/auth/reset-password` endpoint would
need to be implemented and re-tested end-to-end.
