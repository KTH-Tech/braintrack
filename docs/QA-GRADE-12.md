# BrainTrack — Grade 12 Final QA Report

_Generated: 2026-04-19T11:08:03.624Z_

Run with:

```bash
npx tsx server/scripts/qa-grade12.ts
```

## Overall

**🟡 AMBER** — 4 green, 2 amber, 0 red across 6 sections.

| # | Section | Status | Summary |
|---:|---|---|---|
| 1 | 1. Grade 12 Catalog Coverage | 🟢 GREEN | 70 subjects, 11 years (2015–2025), 4877 catalog entries. |
| 2 | 2. Verbatim DBE Question Store | 🟡 AMBER | Verbatim store empty — simulated fallback in place. |
| 3 | 3. Learner Content Coverage (verbatim ∪ simulated) | 🟡 AMBER | Verbatim coverage thin — most subjects on simulated fallback. |
| 4 | 4. MCQ Option Extractor | 🟢 GREEN | 5 / 5 fixtures passed. |
| 5 | 5. Per-Subject Marker Strategies | 🟢 GREEN | 45 / 45 subject codes mapped to expected family. Bubble-up math verified. |
| 6 | 6. Server Smoke Checks | 🟢 GREEN | 3 / 3 routes healthy at https://11a290ac-b55d-4b3b-b44c-cdf02bad6c2c-00-x0fgkyr9dvxb-hjuqa5wx.kirk.replit.dev. |

## 1. Grade 12 Catalog Coverage

**Status:** 🟢 GREEN — 70 subjects, 11 years (2015–2025), 4877 catalog entries.

- Catalog entries: **4877**
- Distinct Grade 12 subjects: **70**
- Year range: **2015–2025** (11 years)

| Subject | Years covered | Papers (P+Memo) |
|---|---:|---:|
| Accounting | 7 (2015–2024) | 48 |
| Afrikaans FAL | 11 (2015–2025) | 126 |
| Afrikaans HL | 11 (2015–2025) | 124 |
| Afrikaans SAL | 11 (2015–2025) | 412 |
| Agricultural Management Practices | 7 (2015–2024) | 28 |
| Agricultural Sciences | 7 (2015–2024) | 55 |
| Agricultural Technology | 7 (2015–2024) | 27 |
| Automotive | 7 (2019–2025) | 59 |
| Business Studies | 7 (2015–2024) | 48 |
| Civil Services | 7 (2019–2025) | 59 |
| Civil Technology | 2 (2015–2016) | 8 |
| Computer Applications Technology | 7 (2015–2024) | 59 |
| Construction | 7 (2019–2025) | 60 |
| Consumer Studies | 7 (2015–2024) | 28 |
| Dance Studies | 7 (2015–2024) | 28 |
| Design | 7 (2015–2024) | 36 |
| Digital Electronics | 4 (2022–2025) | 28 |
| Digitals | 3 (2019–2021) | 28 |
| Dramatic Arts | 7 (2015–2024) | 28 |
| Economics | 7 (2015–2024) | 56 |
| Electrical Technology | 2 (2015–2016) | 8 |
| Electronics | 7 (2019–2025) | 60 |
| Engineering Graphic and Design | 7 (2015–2024) | 57 |
| English FAL | 11 (2015–2025) | 126 |
| English HL | 11 (2015–2025) | 126 |
| Fitting and Machining | 7 (2019–2025) | 59 |
| Geography | 7 (2015–2024) | 56 |
| History | 7 (2015–2024) | 56 |
| Hospitality Studies | 7 (2015–2024) | 28 |
| Information Technology | 7 (2015–2024) | 57 |
| IsiNdebele FAL | 8 (2015–2025) | 93 |
| IsiNdebele HL | 10 (2015–2025) | 114 |
| IsiNdebele SAL | 3 (2021–2024) | 30 |
| IsiXhosa FAL | 10 (2015–2025) | 114 |
| IsiXhosa HL | 10 (2015–2025) | 108 |
| IsiXhosa SAL | 4 (2021–2024) | 36 |
| IsiZulu FAL | 10 (2015–2025) | 114 |
| IsiZulu HL | 10 (2015–2025) | 113 |
| IsiZulu SAL | 1 (2021–2021) | 11 |
| Life Orientation | 3 (2015–2024) | 16 |
| Life Sciences | 7 (2015–2024) | 56 |
| Marine Sciences | 2 (2021–2024) | 10 |
| Mathematical Literacy | 7 (2015–2024) | 46 |
| Mathematics | 7 (2015–2024) | 42 |
| Mechanical Technology | 2 (2015–2016) | 8 |
| Music | 7 (2015–2024) | 56 |
| Physical Sciences | 7 (2015–2024) | 42 |
| Power Systems | 7 (2019–2025) | 60 |
| Religion Studies | 7 (2015–2024) | 64 |
| SASL HL | 5 (2020–2025) | 56 |
| Sepedi FAL | 10 (2015–2025) | 114 |
| Sepedi HL | 11 (2015–2025) | 125 |
| Sepedi SAL | 4 (2020–2024) | 26 |
| Sesotho FAL | 9 (2015–2025) | 107 |
| Sesotho HL | 10 (2015–2025) | 113 |
| Sesotho SAL | 5 (2016–2025) | 54 |
| Setswana FAL | 9 (2015–2025) | 106 |
| Setswana HL | 11 (2015–2025) | 126 |
| Siswati FAL | 10 (2015–2025) | 117 |
| Siswati HL | 11 (2015–2025) | 125 |
| Technical Mathematics | 5 (2019–2024) | 27 |
| Technical Sciences | 5 (2019–2024) | 30 |
| Tourism | 7 (2015–2024) | 28 |
| Tshivenda FAL | 9 (2015–2025) | 107 |
| Tshivenda HL | 11 (2015–2025) | 121 |
| Visual Arts | 7 (2015–2024) | 36 |
| Welding and Metalwork | 7 (2019–2025) | 58 |
| Woodworking | 7 (2019–2025) | 59 |
| Xitsonga FAL | 9 (2015–2025) | 108 |
| Xitsonga HL | 11 (2015–2025) | 123 |

## 2. Verbatim DBE Question Store

**Status:** 🟡 AMBER — Verbatim store empty — simulated fallback in place.

- Total verbatim Grade 12 questions in DB: **0**
- Subjects with stored questions: **0**

| Subject | Questions extracted | Years | Avg quality | Avg predictive | Clean | MCQ |
|---|---:|---:|---:|---:|---:|---:|

> ℹ️  Verbatim store is empty. Simulated fallback is in place for every launch-blocking subject.
> Run `npx tsx server/run-ingestion.ts` (or `--with-ingest` on this script) to populate from DBE once the upstream is reachable.

## 3. Learner Content Coverage (verbatim ∪ simulated)

**Status:** 🟡 AMBER — Verbatim coverage thin — most subjects on simulated fallback.

- Subjects with **any** learner content (verbatim or simulated): **22 / 35**
- Subjects with simulated fallback: **22** (31 papers)
- Subjects with verbatim content: **0**
- Launch-blocking subjects missing content: **0**
- Niche subjects missing content (post-launch sprint): **13** (AMBER, not blocking)

| Subject | Code | Verbatim | Simulated fallback | Launch-blocking |
|---|---|:-:|:-:|:-:|
| Mathematics | MATH | — | ✅ | 🔒 |
| Mathematical Literacy | MATL | — | ✅ | 🔒 |
| Technical Mathematics | TMATH | — | ❌ | — |
| Physical Sciences | PHYS | — | ✅ | 🔒 |
| Life Sciences | LIFE | — | ✅ | 🔒 |
| Agricultural Sciences | AGR | — | ✅ | 🔒 |
| Technical Sciences | TSCI | — | ❌ | — |
| Accounting | ACC | — | ✅ | 🔒 |
| Business Studies | BUS | — | ✅ | 🔒 |
| Economics | ECO | — | ✅ | 🔒 |
| History | HIS | — | ✅ | 🔒 |
| Geography | GEO | — | ✅ | 🔒 |
| Religion Studies | RELI | — | ❌ | — |
| Tourism | TOUR | — | ✅ | 🔒 |
| English Home Language | ENGH | — | ✅ | 🔒 |
| English First Additional Language | ENGF | — | ✅ | 🔒 |
| Afrikaans Home Language | AFRH | — | ✅ | 🔒 |
| Afrikaans First Additional Language | AFRF | — | ✅ | 🔒 |
| Visual Arts | ART | — | ✅ | — |
| Dramatic Arts | DRAMA | — | ✅ | — |
| Dance Studies | DANCE | — | ❌ | — |
| Music | MUSIC | — | ✅ | — |
| Design | DESIGN | — | ❌ | — |
| Information Technology | IT | — | ✅ | 🔒 |
| Computer Applications Technology | CAT | — | ✅ | 🔒 |
| Engineering Graphics and Design | EGD | — | ❌ | — |
| Civil Technology | CIVT | — | ❌ | — |
| Electrical Technology | ELEC | — | ❌ | — |
| Mechanical Technology | MECH | — | ❌ | — |
| Digital Technology | DIGT | — | ❌ | — |
| Agricultural Management Practices | AGRM | — | ❌ | — |
| Agricultural Technology | AGRT | — | ❌ | — |
| Consumer Studies | CON | — | ✅ | — |
| Hospitality Studies | HOSP | — | ❌ | — |
| Life Orientation | LO | — | ✅ | 🔒 |

## 4. MCQ Option Extractor

**Status:** 🟢 GREEN — 5 / 5 fixtures passed.

- ✅ **DBE History style (letters with double-space)** — expected `ABCD`, got `ABCD`
- ✅ **Maths-style with parentheses** — expected `ABCD`, got `ABCD`
- ✅ **Three-option (rare)** — expected `ABC`, got `ABC`
- ✅ **Not an MCQ** — expected `(none)`, got `(none)`
- ✅ **Memo answer extractor** — expected `C`, got `C`

## 5. Per-Subject Marker Strategies

**Status:** 🟢 GREEN — 45 / 45 subject codes mapped to expected family. Bubble-up math verified.

| Subject code | Expected family | Got |
|---|---|---|
| MATH | numeric_units | ✅ numeric_units |
| MATL | numeric_units | ✅ numeric_units |
| TMATH | numeric_units | ✅ numeric_units |
| PHYS | numeric_units | ✅ numeric_units |
| TSCI | numeric_units | ✅ numeric_units |
| ACC | numeric_units | ✅ numeric_units |
| ECO | numeric_units | ✅ numeric_units |
| LIFE | multi_step | ✅ multi_step |
| AGR | multi_step | ✅ multi_step |
| AGRM | multi_step | ✅ multi_step |
| AGRT | multi_step | ✅ multi_step |
| GEO | multi_step | ✅ multi_step |
| EGD | multi_step | ✅ multi_step |
| CIVT | multi_step | ✅ multi_step |
| ELEC | multi_step | ✅ multi_step |
| MECH | multi_step | ✅ multi_step |
| ENGH | essay | ✅ essay |
| ENGF | essay | ✅ essay |
| AFRH | essay | ✅ essay |
| AFRF | essay | ✅ essay |
| HIS | essay | ✅ essay |
| RELI | essay | ✅ essay |
| LO | essay | ✅ essay |
| ART | essay | ✅ essay |
| DRAMA | essay | ✅ essay |
| DANCE | essay | ✅ essay |
| MUSIC | essay | ✅ essay |
| DESIGN | essay | ✅ essay |
| BUS | source_based | ✅ source_based |
| TOUR | source_based | ✅ source_based |
| CON | source_based | ✅ source_based |
| HOSP | source_based | ✅ source_based |
| IT | code_artifact | ✅ code_artifact |
| CAT | code_artifact | ✅ code_artifact |
| DIGT | code_artifact | ✅ code_artifact |
| MAT | numeric_units | ✅ numeric_units |
| MLIT | numeric_units | ✅ numeric_units |
| PHSC | numeric_units | ✅ numeric_units |
| ENGHL | essay | ✅ essay |
| ENGFAL | essay | ✅ essay |
| AFRHL | essay | ✅ essay |
| AFRFAL | essay | ✅ essay |
| BST | source_based | ✅ source_based |
| TRSM | source_based | ✅ source_based |
| RST | essay | ✅ essay |

- ✅ MCQ marker — awarded 2/2
- ✅ Numeric/units marker — awarded 4/4
- ✅ Essay marker — provisional 10/25 (always self-mark)
- ✅ Bubble-up — paper total 16/31 (52% / band: red)

## 6. Server Smoke Checks

**Status:** 🟢 GREEN — 3 / 3 routes healthy at https://11a290ac-b55d-4b3b-b44c-cdf02bad6c2c-00-x0fgkyr9dvxb-hjuqa5wx.kirk.replit.dev.

- ✅ `/api/health` → 200
- ✅ `/api/exam-countdown` → 200
- ✅ `/api/subjects` → 401 (auth required — 401 expected)

---

## Re-running this report

```bash
# Full Grade 12 ingestion (every subject, every year in catalog)
npx tsx server/run-ingestion.ts

# Single subject only
npx tsx server/run-ingestion.ts --subject="History"

# Force re-ingest (clear + redo)
npx tsx server/run-ingestion.ts --subject="History" --force

# Then regenerate this report
npx tsx server/scripts/qa-grade12.ts
```
