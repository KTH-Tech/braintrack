# NSC Portfolio/Practical Papers — No Separate DBE Memo

## Summary

Some NSC subjects have a portfolio or practical component where DBE assesses learner work
using an **embedded marking rubric** inside the question paper itself, rather than publishing a
separate downloadable memo PDF. This document lists every subject investigated and records
whether it qualifies as a confirmed no-memo paper.

---

## Confirmed No-Memo Papers

### Design Paper 2

**Status: CONFIRMED — `KNOWN_NO_MEMO_PAPERS` entry present.**

Design Paper 2 is a **creative portfolio submission**. Learners compile and submit a
physical/digital design portfolio; their work is assessed using an **embedded marking rubric**
that is printed inside the question paper itself. DBE does not publish a separate downloadable
memo PDF for this paper — and never has.

**Confirmed in Task #389** (May 2026): DBE website, saexampapers, stanmore mirror, and every
other known source were checked across all years (2015–2025). Zero memo PDFs exist for Design
P2 in any language or year. The catalog analysis confirms 12 QP entries and 0 memo entries.

---

## Year-Specific Exemptions (DBE Published in Some Years Only)

> Papers where DBE published memos in at least one year but not all years. These require
> year-scoped entries rather than blanket exemptions. None are implemented yet — each
> requires a separate approved task. See individual sections below for investigation details.

### Visual Arts Paper 2

**Status: INVESTIGATED — year-specific exemption pending a separate task. (Task #715 — May 2026)**

Visual Arts P2 appears in the DBE catalog with QPs for 2015, 2020, 2021, 2023, 2024, and
2025. **2023 has both English and Afrikaans memos** — confirming DBE does publish Memo 2 in
at least some years.

**Task #715 live investigation (May 2026):** Each year's Visual Arts P2 DBE module was fetched
directly from the live education.gov.za DNN pages (tabid/mid pairs sourced from catalog QP entries):

| Year | tabid | mid | Memo 2 on DBE? |
|------|-------|-----|----------------|
| 2015 | 979 | 4296 | **No** — only Paper 2 (QP) and Memo 1 listed |
| 2020 | 2702 | 9639 | **No** — only Paper 2 (QP) and Memo 1 listed |
| 2021 | 2922 | 10144 | **No** — only Paper 2 (QP) and Memo 1 listed |
| 2023 | 4682 | 12690 | **Yes** — Memo 2 (English) + Memo 2 (Afrikaans) listed |
| 2024 | 5193 | 13733 | **No** — only Paper 2 (QP) and Memo 1 listed |
| 2025 | 5742 | 14853 | **No** — only Paper 2 (QP) and Memo 1 listed |

saexampapers.co.za and stanmore mirrors were also checked — no Visual Arts P2 memo PDFs
found on any source for 2015, 2020, 2021, 2024, or 2025.

**Conclusion:** The task premise (Task #715 brief: "despite DBE publishing them") proved
incorrect upon live investigation. DBE has only published a Visual Arts P2 memo in 2023.
The memos for 2015, 2020, 2021, 2024, and 2025 do not exist on DBE or any known mirror.

**Recommended next step:** Add a year-specific `KNOWN_NO_MEMO_PAPERS` entry in
`scripts/triage-missing-memos.ts` for `{ subject: "Visual Arts", paperNumber: 2, years: [2015, 2020, 2021, 2024, 2025] }`.
This requires extending the type to support an optional `years?: number[]` field and updating
`isKnownNoMemo()` to check it. Because 2023 genuinely has memos, a blanket all-years exemption
would be incorrect — the year filter is essential to preserve the valid 2023 entry.

---

## Investigated — NOT Added (Evidence Does Not Support No-Memo Status)

### Music Paper 2

**Status: INVESTIGATED — NOT added to `KNOWN_NO_MEMO_PAPERS`.**

Music P2 has full memo coverage for every year from 2015 to 2025 (English and Afrikaans).
No memo gaps exist. Not a no-memo paper in any sense.

### Dramatic Arts Paper 2

**Status: INVESTIGATED — NOT applicable.**

Dramatic Arts only has Paper 1 in the DBE catalog. There is no P2 written exam or portfolio
paper. Dramatic Arts P2 does not exist as a downloadable paper in the NSC written exam
structure and will never appear in `dbe_verbatim_questions`. No exemption needed.

### Dance Studies Paper 2

**Status: INVESTIGATED — NOT applicable.**

Dance Studies only has Paper 1 in the DBE catalog. There is no P2 written exam or portfolio
paper. Dance Studies P2 does not exist as a downloadable paper in the NSC written exam
structure. No exemption needed.

---

## Impact on Triage Reports

The triage script (`scripts/triage-missing-memos.ts`) contains a `KNOWN_NO_MEMO_PAPERS`
exemption list. When this script runs, exempt rows are emitted with the hint:

```
MEMO_NOT_PUBLISHED_BY_DBE — portfolio/practical submission assessed by embedded rubric; no memo PDF exists
```

rather than `MEMO_MISSING_FROM_CATALOG`. This keeps the actionable count at **0** for those
rows — future agents should not waste time hunting for a memo that does not exist.

Current blanket exemptions:
- **Design P2** — all years
- **isiXhosa Home Language P3** — all years

Pending year-specific exemptions (investigation done, separate task required):
- **Visual Arts P2** — years 2015, 2020, 2021, 2024, 2025 (confirmed absent on live DBE; 2023 has a real memo — Task #715)

---

## Adding Future Known-No-Memo Papers

Edit the `KNOWN_NO_MEMO_PAPERS` constant near the top of the CSV-generation loop in
`scripts/triage-missing-memos.ts`. Add a `{ subject, paperNumber }` entry. All years and
languages are covered by a single entry.

Before adding any new entry, confirm:
1. You have checked the **live DBE website** for each year in scope and confirmed the memo is absent.
2. You have also checked saexampapers.co.za and stanmore mirrors.
3. An authoritative source explains *why* — e.g. embedded rubric in QP, performance-based
   assessment with no written memo, portfolio submission, or simply never published.
4. Document the finding in this file under "Confirmed No-Memo Papers".

For year-specific gaps (where DBE publishes a memo in some years but not others), the
`KNOWN_NO_MEMO_PAPERS` type will need to be extended with an optional `years?: number[]`
field and `isKnownNoMemo()` updated to check it. See the Visual Arts P2 entry in
"Year-Specific Exemptions" above for the recommended approach and exact code change needed.

---

## Catalog Analysis — May 2026 (Tasks #549, #715)

Run `node -e "..."` against `server/data/dbe-papers-catalog.json` to reproduce:

| Subject | Paper | QP entries | Memo entries | Status |
|---------|-------|-----------|--------------|--------|
| Design | P2 | 12 | 0 | CONFIRMED blanket no-memo (all years) |
| Visual Arts | P2 | 12 | 2 (2023 EN+AF) | Partial — 2023 has memo; 2015/2020/2021/2024/2025 confirmed absent on live DBE (Task #715) |
| Music | P2 | 30 | 30 | Full coverage — not a no-memo paper |
| Dramatic Arts | P2 | 0 | 0 | Does not exist in NSC written exam structure |
| Dance Studies | P2 | 0 | 0 | Does not exist in NSC written exam structure |

Live DBE investigation for Visual Arts P2 conducted in Task #715 (May 2026):
each year's DNN module was fetched directly from education.gov.za — see "Visual Arts Paper 2"
section above for the full per-year table.
