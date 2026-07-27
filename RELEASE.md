# BrainTrack — Launch Release (2026-07-24)

Deploy target: `main`. Migrations 0033 / 0035 / 0036 / 0037 self-apply via
`preDeployCommand` (`script/predeploy-migrate.ts`) before traffic cutover —
watch the deploy log for `[predeploy-migrate] ✓` lines.

## Content engine
- Learners are served **simulated, examiner-grounded** questions only — never
  raw verbatim, never passage-dependent items whose source text is missing.
- Generator writes **original supporting paragraphs** (`stimulus_text`) for
  passage-based questions; QA scores memo-gradability against the passage;
  the learner sees the text in a "Read the text" panel.
- Serving is **best-quality-first** with no hard cutoff (never an empty app);
  quality rises toward the 99% target as generation improves.
- **Simulator screen** (`/admin/simulator`): per-subject Generate ×10 and a
  versioned, cumulative **Release** button (bar: 92%+). v2 builds on v1;
  nothing is ever un-released.
- Content Studio publish **accumulates** (questions + 30-day exam-tips
  rotation, deduped) instead of replacing.
- DBE portal: plain-English legend for every ingestion/generation button.

## Revenue
- **Exam Boost — R550 once-off**: landing offer card → trial-free checkout →
  Paystack once-off charge (server-owned amount, webhook + verify enforce
  amount ≥ R550), access to 30 Nov 2026, no recurring billing, day-14 trial
  cron can never double-charge a Boost buyer.
- Brain Boost R169/month with 14-day trial unchanged; first charge day 14.
- Post-payment poster thank-you page with shareable referral link
  (2 paid referrals = 1 free month, surfaced on dashboard + settings).

## Fixes
- Past-papers learner crash (unguarded `/api/subjects` shape) — fixed.
- Notification dropdown clipped by `overflow: hidden` — portalled to body.
- Tutor/Study-notes empty subject pickers (double-filter) — fixed.
- Day-15 copy → day 14 everywhere; legal entity normalised
  (KTH Projects (Pty) Ltd t/a KTH-Tech, statement descriptor KTH-TECH).
- "In partnership with" removed from reports/emails/preview.

## Design
- Neon glow removed app-wide (tokens transparent; blur-halos deleted);
  sticker-slap cards (hard offset, no blur) everywhere incl. onboarding,
  journey, flashcards, countdown clocks.
- Onboarding on the canonical palette (pure-black ground).
- Reviews as a narrow band above the minimal gravity-wall footer.
- Pinch-zoom re-enabled (`maximum-scale` dropped).

## Security
- `npm audit fix` applied: high-severity brace-expansion (DoS) and postcss
  (path traversal) cleared. `sharp` upgrade deferred (breaking; only parses
  admin-uploaded images) — scheduled.

## Known open (post-launch)
Afrikaans simulated generation (schema ready via `language` column) ·
flip serving to released-only after first releases · sharp 0.35 upgrade ·
exam-tips page reskin · landing comparison section · referral attribution
E2E test · SendGrid domain auth · Mathematics PDF reading-order.
