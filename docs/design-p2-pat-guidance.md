# Design P2 PAT Marking Guidance — Implementation Notes

## Background

Design Paper 2 is the Practical Assessment Task (PAT) — a portfolio-based
submission assessed by a marking rubric **embedded in the question paper
itself**. DBE has never published a separate memo PDF for Design P2 in any
year or language (2015–2025). This was confirmed exhaustively in Task #389
and documented in `docs/design-p2-no-memo.md`.

## Solution (Task #396 — May 2026)

Instead of leaving learners with a blank "memo not available" panel, a
stand-in **PAT Marking Guidance** text (sourced from the official DBE Design
Subject Assessment Guidelines) is stored in `dbe_verbatim_questions.memo_text`
for all Design P2 rows.

### Sentinel Marker

`memo_text` for PAT guidance rows begins with `[DESIGN_PAT_GUIDANCE_v1]`.

The frontend detects this marker and renders a distinct
`<PatGuidanceBanner>` panel (violet/purple styling) rather than the standard
green memo excerpt. The banner explains:
- Why there is no separate memo
- The three SAG rubric sections (Research/Design Process/Presentation)
- Per-criterion mark allocations and examiner guidelines

### Files Changed / Added

| File | Purpose |
|---|---|
| `server/data/design-pat-guidance.ts` | English + Afrikaans PAT guidance text constants and helpers |
| `scripts/seed-design-pat-guidance.ts` | Idempotent seed: writes guidance to dbe_verbatim_questions, stamps exam_papers.memo_url = 'guidance://design-pat', and supports --force |
| `client/src/components/exam/pat-guidance-banner.tsx` | UI component: renders PAT guidance with violet styling + SAG rubric text |
| `client/src/pages/dbe-practice.tsx` | Updated to detect PAT guidance memos and render PatGuidanceBanner |

### Data State After Task #396

- **dbe_verbatim_questions**: 170 Design P2 rows now have `memo_text` set to PAT guidance (100% coverage).
- **exam_papers**: all 12 Design P2 rows have `memo_url = 'guidance://design-pat'`.
- **Release gate**: all 12 Design P2 (subject, year, paperNumber, session, language) tuples now have `released_at IS NOT NULL` with `memo_coverage = 100`.

### Re-running

Safe to re-run anytime:
```bash
npx tsx scripts/seed-design-pat-guidance.ts          # only fills empty rows
npx tsx scripts/seed-design-pat-guidance.ts --force  # overwrites all Design P2 rows
```

After re-seeding, run the release gate:
```bash
npx tsx -e "import { releaseEligiblePapers } from './server/release-gate'; releaseEligiblePapers('Design').then(r => console.log(r.filter(x => x.paperNumber === 2)))"
```

---

## Extending the Pattern: isiXhosa Home Language P3

isiXhosa HL Paper 3 is a **creative writing task** with no keyword-matchable
memo. DBE's marking rubric covers genre-appropriate writing, structure,
language control, and creative merit. The same approach applies:

### Steps to add isiXhosa HL P3 guidance

1. **Add guidance text** to `server/data/design-pat-guidance.ts` (or a new
   `server/data/isixhosa-p3-guidance.ts` file) using a new sentinel marker
   such as `[CREATIVE_WRITING_GUIDANCE_v1]`.

2. **Add the isKnownNoMemo exemption** in `scripts/triage-missing-memos.ts`:
   ```ts
   { subject: "isiXhosa Home Language", paperNumber: 3 }
   ```

3. **Create a seed script** (model it on `scripts/seed-design-pat-guidance.ts`)
   targeting `subject = 'isiXhosa Home Language' AND paper_number = 3`.

4. **Update PatGuidanceBanner** or create a sibling component
   `CreativeWritingGuidanceBanner` that renders the creative writing rubric.

5. **Run seed + release gate**:
   ```bash
   npx tsx scripts/seed-isixhosa-p3-guidance.ts
   npx tsx -e "import { releaseEligiblePapers } from './server/release-gate'; releaseEligiblePapers('isiXhosa Home Language').then(console.log)"
   ```

The marking criteria for creative writing typically include:
- **Content & Ideas** (30–40 marks): originality, relevance, depth
- **Structure & Organisation** (20–30 marks): genre conventions, paragraphing
- **Language Control** (20–30 marks): grammar, vocabulary, spelling
- **Creative Merit** (10–20 marks): style, voice, engagement

Rubric text should be sourced from the official DBE isiXhosa SAG document
available at https://www.education.gov.za.
