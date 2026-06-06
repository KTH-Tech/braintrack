# isiXhosa Home Language P3 — Creative Writing Guidance Implementation

## Background

isiXhosa Home Language Paper 3 is a **creative writing task**. DBE does not
publish a separate memo PDF for this paper — the marking rubric is applied by
examiners using criteria from the official isiXhosa Home Language **Subject
Assessment Guidelines (SAG)**. This is similar in nature to Design P2 (the PAT
portfolio paper) documented in `docs/design-p2-pat-guidance.md`.

Learners who opened an isiXhosa HL P3 question in the DBE Practice page were
shown a blank "memo not available" panel, which was unhelpful. Task #650 (May
2026) closed this gap by adding stand-in creative writing guidance.

## Solution (Task #650 — May 2026)

A stand-in **Creative Writing Guidance** text (sourced from the official DBE
isiXhosa Home Language SAG rubric criteria) is stored in
`dbe_verbatim_questions.memo_text` for all isiXhosa HL P3 rows.

### Sentinel Marker

`memo_text` for creative writing guidance rows begins with
`[CREATIVE_WRITING_GUIDANCE_v1]`.

The frontend detects this marker and renders a distinct
`<CreativeWritingGuidanceBanner>` panel (sky/blue styling) rather than the
standard green memo excerpt or the violet PAT guidance panel. The banner
explains:
- Why there is no separate memo
- The four SAG rubric criteria (Content & Ideas / Structure / Language / Creative Merit)
- Mark band descriptors (Outstanding / Competent / Adequate / Limited)
- Examiner guidelines and learner self-check tips

### Files Changed / Added

| File | Purpose |
|---|---|
| `server/data/isixhosa-p3-guidance.ts` | English + Afrikaans creative writing guidance constants and helpers |
| `scripts/seed-isixhosa-p3-guidance.ts` | Idempotent seed: writes guidance to dbe_verbatim_questions, stamps exam_papers.memo_url = 'guidance://isixhosa-p3-creative-writing', supports --force |
| `client/src/components/exam/pat-guidance-banner.tsx` | Added `CreativeWritingGuidanceBanner` component + `isCreativeWritingGuidanceMemo()` + `isGuidanceMemo()` helpers |
| `client/src/pages/dbe-practice.tsx` | Updated memo rendering to detect creative writing guidance and render `CreativeWritingGuidanceBanner` |
| `scripts/triage-missing-memos.ts` | Added `{ subject: "isiXhosa Home Language", paperNumber: 3 }` to `KNOWN_NO_MEMO_PAPERS` |
| `docs/isixhosa-p3-creative-writing-guidance.md` | This document |

### Running the Seed + Release Gate

```bash
# Seed guidance text into dbe_verbatim_questions (safe to re-run):
npx tsx scripts/seed-isixhosa-p3-guidance.ts

# Force-overwrite even rows that already have guidance:
npx tsx scripts/seed-isixhosa-p3-guidance.ts --force

# Run release gate to make seeded rows visible to learners:
npx tsx -e "import { releaseEligiblePapers } from './server/release-gate'; releaseEligiblePapers('isiXhosa Home Language').then(r => { console.log(JSON.stringify(r.filter(x => x.paperNumber === 3), null, 2)); process.exit(0); })"
```

## Known No-Memo Paper Status

isiXhosa HL P3 is listed in `KNOWN_NO_MEMO_PAPERS` in
`scripts/triage-missing-memos.ts`. The triage script will emit
`MEMO_NOT_PUBLISHED_BY_DBE` for these rows instead of `MEMO_MISSING_FROM_CATALOG`,
keeping the actionable missing-memo count at 0.

## Extending the Pattern

To add a similar guidance treatment for another creative/practical paper
with no DBE memo:

1. Add a new sentinel constant (e.g. `[DRAMA_PRACTICAL_GUIDANCE_v1]`) and
   guidance text in a new file under `server/data/`.
2. Add a `isXxxGuidanceMemo()` helper and a new banner component in
   `client/src/components/exam/pat-guidance-banner.tsx`.
3. Wire the new banner into the `dbe-practice.tsx` memo rendering chain.
4. Add a seed script modelled on `scripts/seed-isixhosa-p3-guidance.ts`.
5. Add the `{ subject, paperNumber }` exemption to `KNOWN_NO_MEMO_PAPERS`
   in `scripts/triage-missing-memos.ts`.
6. Document the paper in this file (or a new sibling doc).
