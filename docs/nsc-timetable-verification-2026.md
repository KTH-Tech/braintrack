# NSC Oct/Nov 2026 Timetable Verification — 2026-07-19

## Source of truth

- **Document:** OCTOBER/NOVEMBER 2026 NATIONAL SENIOR CERTIFICATE (NSC) EXAMINATIONS TIMETABLE (DBE, Chief Directorate: National Assessment and Public Examinations)
- **Revision:** **FINAL — February 2026** (revision stamp printed on both pages of the PDF)
- **URL:** https://www.westerncape.gov.za/education/files/wcg-blob-files?file=2026-03%2Foct-nov-2026-nsc-timetable-final-february-2026.pdf&type=file
- The newer **29 May 2026 FINAL** revision hosted at sacai.org.za could not be fetched — the site sits behind a Cloudflare browser-challenge that blocks automated download. If that revision moved any paper, this verification must be re-run against it. **Action: obtain the 29 May 2026 PDF manually and diff against this document.**
- Session columns in the PDF: **09:00** (morning) and **14:00** (afternoon). Column membership was recovered from PDF text x-coordinates (x < 340 pt = 09:00, x ≥ 340 pt = 14:00), not from reading order.

## Scope

- Seed file audited: `server/data/nsc-2026-timetable.ts` (imported by `server/nsc-timetable.ts`).
- 113 seeded rows total: **72 November-session rows** (68 papers + 4 non-examination days) and **41 Preliminary rows**.
- **Preliminary rows were skipped** — they are school/SACAI-set, seeded with `session: "Preliminary"`, `source: "SCHOOL_PRELIMINARY"` and the note "Preliminary exam — schools may shift by ±2 weeks", and learner/school prelim overrides take precedence at read time (`getEffectivePrelimExams`).
- All **68 November paper rows + 4 non-exam days were checked** against the official PDF.

## Verdict: the seeded November timetable was fabricated

The old file header admitted it: *"Based on the standard DBE examination schedule pattern."* Of the 68 seeded November paper rows, **only 2 had the correct date and session** (Business Studies P1 and P2 — and even those had wrong durations). The 4 non-examination days (03/11, 04/11, 05/11, 09/11) were correct. **62 rows were wrong on date and/or session; 4 seeded papers do not exist in the official timetable at all.**

## Discrepancy table (seeded vs official)

Session: AM = 09:00, PM = 14:00.

| Subject | Paper | Seeded date/session | Official date/session | Verdict |
|---|---|---|---|---|
| English Home Language | P1 | 26 Oct AM | **28 Oct AM** | WRONG DATE |
| English Home Language | P2 | 28 Oct AM | **19 Nov AM** | WRONG DATE |
| English Home Language | P3 | 30 Oct AM | **15 Oct AM** | WRONG DATE |
| English FAL | P1 | 26 Oct AM | **28 Oct AM** | WRONG DATE |
| English FAL | P2 | 28 Oct AM | **19 Nov AM** | WRONG DATE |
| English FAL | P3 | 30 Oct AM | **15 Oct AM** | WRONG DATE |
| Afrikaans Home Language | P1 | 2 Nov PM | **11 Nov AM** | WRONG DATE+SESSION |
| Afrikaans Home Language | P2 | 6 Nov PM | **20 Nov AM** | WRONG DATE+SESSION |
| Afrikaans Home Language | P3 | 10 Nov PM | **20 Oct AM** | WRONG DATE+SESSION |
| Afrikaans FAL | P1 | 2 Nov PM | **11 Nov AM** | WRONG DATE+SESSION |
| Afrikaans FAL | P2 | 6 Nov PM | **20 Nov AM** | WRONG DATE+SESSION |
| Afrikaans FAL | P3 | 10 Nov PM | **20 Oct AM** | WRONG DATE+SESSION |
| Mathematics | P1 | 2 Nov AM | **23 Oct AM** | WRONG DATE |
| Mathematics | P2 | 6 Nov AM | **26 Oct AM** | WRONG DATE |
| Mathematical Literacy | P1 | 2 Nov AM | **23 Oct AM** | WRONG DATE |
| Mathematical Literacy | P2 | 6 Nov AM | **26 Oct AM** | WRONG DATE |
| Physical Sciences | P1 | 10 Nov AM | **30 Oct AM** | WRONG DATE |
| Physical Sciences | P2 | 12 Nov AM | **2 Nov AM** | WRONG DATE |
| Life Sciences | P1 | 27 Oct AM | **13 Nov AM** | WRONG DATE |
| Life Sciences | P2 | 29 Oct AM | **16 Nov AM** | WRONG DATE |
| Accounting | P1 | 10 Nov PM | **22 Oct AM** | WRONG DATE+SESSION |
| Accounting | P2 | 17 Nov AM | **28 Oct PM** | WRONG DATE+SESSION |
| Business Studies | P1 | 11 Nov PM | 11 Nov PM | date/session OK (duration 150 → **120**) |
| Business Studies | P2 | 18 Nov AM | 18 Nov AM | date/session OK (duration 150 → **120**) |
| Economics | P1 | 12 Nov PM | **16 Oct AM** | WRONG DATE+SESSION |
| Economics | P2 | 16 Nov AM | **20 Nov PM** | WRONG DATE+SESSION |
| History | P1 | 11 Nov AM | **20 Oct PM** | WRONG DATE+SESSION |
| History | P2 | 13 Nov PM | **19 Nov PM** | WRONG DATE |
| Geography | P1 | 13 Nov AM | **29 Oct AM** | WRONG DATE |
| Geography | P2 | 16 Nov PM | **12 Nov AM** | WRONG DATE+SESSION |
| Computer Applications Technology | P1 | 16 Nov PM | **13 Oct AM** (Practical) | WRONG DATE+SESSION |
| Computer Applications Technology | P2 | 18 Nov PM | **29 Oct PM** (Theory) | WRONG DATE |
| Information Technology | P1 | 16 Nov PM | **14 Oct AM** (Practical) | WRONG DATE+SESSION |
| Information Technology | P2 | 18 Nov PM | **21 Oct PM** (Theory) | WRONG DATE |
| Agricultural Sciences | P1 | 19 Nov AM | **19 Oct PM** | WRONG DATE+SESSION |
| Agricultural Sciences | P2 | 20 Nov AM | **17 Nov PM** | WRONG DATE+SESSION |
| Religion Studies | P1 | 19 Nov PM | **2 Nov PM** | WRONG DATE |
| Religion Studies | P2 | — not seeded | **12 Nov PM** | MISSING — added |
| Hospitality Studies | P1 | 19 Nov PM | **6 Nov PM** | WRONG DATE |
| Consumer Studies | P1 | 17 Nov PM | **6 Nov PM** | WRONG DATE |
| Tourism | P1 | 17 Nov PM | **30 Oct PM** | WRONG DATE |
| Engineering Graphics and Design | P1 | 20 Nov PM | **22 Oct PM** | WRONG DATE |
| Engineering Graphics and Design | P2 | 23 Nov AM | **27 Oct PM** | WRONG DATE+SESSION |
| Civil Technology | P1 | 20 Nov PM | **16 Nov PM** | WRONG DATE |
| Civil Technology | P2 | 24 Nov PM | **does not exist** (single paper) | PHANTOM — removed |
| Electrical Technology | P1 | 23 Nov PM | **10 Nov PM** | WRONG DATE |
| Electrical Technology | P2 | 24 Nov AM | **does not exist** (single paper) | PHANTOM — removed |
| Mechanical Technology | P1 | 23 Nov PM | **16 Oct AM** | WRONG DATE+SESSION |
| Mechanical Technology | P2 | 24 Nov PM | **does not exist** (single paper) | PHANTOM — removed |
| Drama (Dramatic Arts) | P1 | 25 Nov AM | **16 Nov PM** | WRONG DATE+SESSION |
| Music | P1 | 25 Nov PM | **23 Nov PM** (Theory) | WRONG DATE |
| Music | P2 | — not seeded | **25 Nov AM** (Comprehension) | MISSING — added |
| Visual Arts | P1 | 25 Nov PM | **18 Nov PM** | WRONG DATE |
| IsiZulu Home Language | P1 | 26 Oct PM | **6 Nov AM** | WRONG DATE+SESSION |
| IsiZulu Home Language | P2 | 27 Oct PM | **10 Nov AM** | WRONG DATE+SESSION |
| IsiZulu Home Language | P3 | — not seeded | **19 Oct AM** | MISSING — added |
| IsiXhosa Home Language | P1 | 26 Oct PM | **6 Nov AM** | WRONG DATE+SESSION |
| IsiXhosa Home Language | P2 | 27 Oct PM | **10 Nov AM** | WRONG DATE+SESSION |
| IsiXhosa Home Language | P3 | — not seeded | **19 Oct AM** | MISSING — added |
| Siswati Home Language | P1 | 29 Oct PM | **6 Nov AM** | WRONG DATE+SESSION |
| Siswati Home Language | P2 | 30 Oct PM | **10 Nov AM** | WRONG DATE+SESSION |
| Siswati Home Language | P3 | — not seeded | **19 Oct AM** | MISSING — added |
| IsiNdebele Home Language | P1 | 30 Oct PM | **6 Nov AM** | WRONG DATE+SESSION |
| IsiNdebele Home Language | P2 | — not seeded | **10 Nov AM** | MISSING — added |
| IsiNdebele Home Language | P3 | — not seeded | **19 Oct AM** | MISSING — added |
| Sepedi Home Language | P1 | 26 Oct PM | **27 Oct AM** | WRONG DATE+SESSION |
| Sepedi Home Language | P2 | 28 Oct PM | **17 Nov AM** | WRONG DATE+SESSION |
| Sepedi Home Language | P3 | — not seeded | **21 Oct AM** | MISSING — added |
| Sesotho Home Language | P1 | 26 Oct PM | **27 Oct AM** | WRONG DATE+SESSION |
| Sesotho Home Language | P2 | 27 Oct PM | **17 Nov AM** | WRONG DATE+SESSION |
| Sesotho Home Language | P3 | — not seeded | **21 Oct AM** | MISSING — added |
| Setswana Home Language | P1 | 26 Oct PM | **27 Oct AM** | WRONG DATE+SESSION |
| Setswana Home Language | P2 | 28 Oct PM | **17 Nov AM** | WRONG DATE+SESSION |
| Setswana Home Language | P3 | — not seeded | **21 Oct AM** | MISSING — added |
| Xitsonga Home Language | P1 | 28 Oct PM | **27 Oct AM** | WRONG DATE+SESSION |
| Xitsonga Home Language | P2 | 29 Oct PM | **17 Nov AM** | WRONG DATE+SESSION |
| Xitsonga Home Language | P3 | — not seeded | **21 Oct AM** | MISSING — added |
| Tshivenda Home Language | P1 | 28 Oct PM | **27 Oct AM** | WRONG DATE+SESSION |
| Tshivenda Home Language | P2 | 29 Oct PM | **17 Nov AM** | WRONG DATE+SESSION |
| Tshivenda Home Language | P3 | — not seeded | **21 Oct AM** | MISSING — added |
| IsiZulu FAL | P1/P2/P3 | — not seeded | **6 Nov AM / 10 Nov AM / 19 Oct AM** | MISSING — added |
| Technical Mathematics | P1/P2 | — not seeded | **23 Oct AM / 26 Oct AM** | MISSING — added |
| Technical Sciences | P1/P2 | — not seeded | **30 Oct AM / 2 Nov AM** | MISSING — added |
| Design | P1 | — not seeded | **16 Oct PM** | MISSING — added |
| Dance Studies | P1 | — not seeded | **24 Nov PM** | MISSING — added |
| Non-Examination Days | — | 3/4/5/9 Nov | 3/4/5/9 Nov | CORRECT |

Durations were also corrected throughout (e.g. English HL P1 is 2 hrs not 3; Accounting P1 is 2 hrs not 3; African-language HL P2 papers are 2½ hrs).

### Intentionally out of scope (not seeded)

Rare languages (Hindi, Gujarati, Tamil, Telugu, Urdu, Hebrew, German, Portuguese, Arabic, French, Italian, Mandarin, Modern Greek, Serbian, Spanish, Latin), South African Sign Language, SAL/FAL variants BrainTrack does not offer, and niche subjects (Maritime Economics, Sport and Exercise Science, Nautical Science, Marine Sciences, Equine Studies, Agricultural Technology, Agricultural Management Practices). Also omitted: CAT/IT P1 rewrite practicals (26 Nov), LO CAT (1 Sep, rewrite 12 Oct), pledge signing (9 Oct).

## Fixes applied

1. `server/data/nsc-2026-timetable.ts` — `NSC_2026_TIMETABLE` fully rewritten from the official PDF: 90 November rows (86 papers + 4 non-exam days), every date, session and duration transcribed from the FINAL — February 2026 revision. Four new `SUBJECT_NAME_MAPPINGS` entries added (Technical Mathematics, Technical Sciences, Design, Dance Studies).
2. `server/nsc-timetable.ts` — header notes the verified revision. The hardcoded `nonExaminationDays` (03/04/05/09 Nov) in `getExamWidgets` was already correct.
3. `client/src/components/exam-countdown.tsx` — `FINALS_DATE` corrected from 2026-10-26 to **2026-10-13T09:00 SAST** (first official paper: CAT P1 Practical). It was 13 days late.
4. `docs/nsc-timetable-fix.sql` — production correction script (delete + reinsert of the November 2026 session; see file header for the required post-step: regenerate learner schedules).

## Production impact

The seed only runs when the `November` session is absent, so **production rows are wrong until `docs/nsc-timetable-fix.sql` is applied** and learner schedules are regenerated (`regenerateAllLearnerSchedules()` / the admin regenerate endpoint). Until then, learner countdowns for 63 schools point at fabricated dates — e.g. a Mathematics learner is told P1 is on 2 Nov when it is actually 23 Oct (10 days late).
