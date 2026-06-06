# Topic Notes & Flashcards Seed Verification

**Task**: #517 — Seed notes and flashcards for more topics so learners see content straight away  
**Script**: `scripts/seed-topic-content.ts`  
**Run command**: `npx tsx scripts/seed-topic-content.ts`  
**Idempotent**: Yes — safe to re-run at any time

## How to re-seed (new deployment or after wiping content)

```bash
npx tsx scripts/seed-topic-content.ts
```

No environment overrides needed — uses the default `DATABASE_URL`.

## Verified output (May 2026)

| Subject | Topics with notes | Flashcards (EN + AF) |
|---------|:-----------------:|:--------------------:|
| MATH    | 11                | 258                  |
| PHYS    | 10                | 230                  |
| LIFE    | 10                | 220                  |
| ENGH    | 8                 | 160                  |
| AFRH    | 8                 | 160                  |
| MATL    | 5                 | 110                  |
| ACC     | 8                 | 175                  |
| BUS     | 8                 | 172                  |
| ECO     | 8                 | 174                  |
| GEO     | 6                 | 132                  |
| HIS     | 6                 | 153                  |
| ENGF    | 8                 | 202                  |
| AFRF    | 8                 | 192                  |
| IT      | 6                 | 154                  |
| CAT     | 7                 | 177                  |
| EGD     | 6                 | 144                  |
| AGR     | 7                 | 168                  |
| CON     | 5                 | 120                  |
| TOUR    | 7                 | 175                  |
| ART     | 5                 | 120                  |
| TMATH   | 8                 | 192                  |
| TSCI    | 6                 | 144                  |
| RELI    | 5                 | 120                  |
| DRAMA   | 5                 | 120                  |
| DANCE   | 5                 | 120                  |
| MUSIC   | 5                 | 120                  |
| DESIGN  | 5                 | 120                  |
| CIVT    | 5                 | 120                  |
| ELEC    | 5                 | 120                  |
| MECH    | 5                 | 120                  |
| DIGT    | 5                 | 120                  |
| AGRM    | 5                 | 120                  |
| AGRT    | 5                 | 120                  |
| HOSP    | 5                 | 120                  |
| LO      | 5                 | 128                  |

**Literature works**: 53 upserted, 106 language-variant note rows  
**Totals**: 226 `topic_notes` rows · 5,300 `topic_flashcards` rows · 53 `literature_works` rows · 106 `literature_notes` rows

## Idempotency notes

- `topic_notes`: upserted via `onConflictDoUpdate` on `(topic_id, language)` unique index
- `topic_flashcards`: existing `source = "caps_seed_v1"` rows for each subject are deleted before reinsert, so the deck is always rebuilt clean
- `literature_works` / `literature_notes`: upserted via `onConflictDoUpdate` on their respective unique indices

## Wiring into future deployments

If this is a brand-new deployment with an empty database, run the seeders in order:

```bash
npx tsx scripts/seed-missing-language-subjects.ts   # subjects + topics
npx tsx scripts/seed-exam-papers-from-catalog.ts    # exam_papers
npx tsx scripts/seed-topic-content.ts               # notes + flashcards + literature
```
