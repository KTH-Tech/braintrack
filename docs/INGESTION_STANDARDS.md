# BrainTrack DBE Ingestion Standards

The measurable bar a subject's questions must clear before they reach a learner.
This is the acceptance spec for the DBE ingestion pipeline (`server/dbe-ingestion.ts`,
`scripts/run-ingest-2015-2025.ts`) and for the QC dashboard + confidence gate work.

Thresholds below are sensible defaults — tune the numbers, keep the structure.

> **Status note (2026-07):** the pipeline is mechanically verified (fetch → parse →
> extract → insert produces real questions), but yield is near-zero without a real
> `OPENAI_API_KEY` + `ENABLE_OCR_FALLBACK=1` because many DBE PDFs are scanned /
> CID-font and need the OCR path. Use `scripts/diagnose-one-subject.ts` to measure
> true yield for a subject before mass-ingesting.

---

## 1. Source & provenance
- **Primary source: official DBE** (`education.gov.za`). Fallback sources
  (saexampapers, stanmore) only when DBE is missing a paper, and **flagged** as
  non-primary.
- **Released papers only** — never ingest embargoed / unreleased content.
- Every question row stores **source URL, paper identity (subject/year/paper#/session),
  ingested-at, and a content hash** of the source PDF. No provenance → not promotable.

## 2. Coverage
- **≥ 90%** of a subject's catalogued **non-memo papers** ingest with `status = completed`.
- **Memo coverage ≥ 85%** where a memo exists in the catalog.
- Any shortfall is **listed by paper**, never silently dropped.

## 3. Extraction fidelity
- **Verbatim** — question text matches the PDF. No paraphrase, no AI-invented content.
- **Garbling guard** — alphabetic-character ratio **≥ 35%** (CID-font check). Below that →
  OCR fallback → if still below, **quarantine**, do not insert.
- **Per-paper yield** within a sane band of the paper's real question count
  (default **≥ 70%** of mark-bearing questions). "6 papers → 1 question" fails this hard.

## 4. Structural completeness
A question is **valid** only with all of: `questionNumber` · non-empty `questionText` ·
`marks` (numeric where the paper assigns them) · `subject` · `year` · `paperNumber` ·
`session`. Missing any required field → **rejected**, logged, not inserted.

## 5. Data integrity (hard invariants)
- **Zero NUL bytes (U+0000); valid UTF-8; no lone surrogates** in any text field.
  Enforced by `sanitizeText()` at every write boundary.
- **No duplicates** — dedupe by content hash + (subject, year, paper#, questionNumber).
- **Idempotent** — re-ingesting a paper replaces cleanly, never double-inserts.

## 6. Confidence scoring & the learner gate
Every question carries a **confidence score [0–1]** (`computeQualityScore` + signals:
alpha ratio, structure match, memo pairing, marks parsed):

| Score | State | Visible to learners? |
|------|-------|----------------------|
| **≥ 0.70** | Passed | ✅ Yes |
| **0.40 – 0.69** | Needs review | ❌ QC dashboard only |
| **< 0.40** | Quarantined | ❌ Never auto-shown |

## 7. Subject promotion gate (per-subject go-live)
A subject flips **live to learners** only when **all** hold:
- Coverage §2 met (≥ 90% papers, ≥ 85% memos)
- **≥ 95%** of inserted questions are integrity-clean (§5)
- **Median per-paper yield** ≥ the subject baseline (§3)
- **Human spot-check sign-off** on a random sample (≥ 20 questions) via the QC dashboard

Subjects promote **independently** — Maths goes live when Maths passes, not when
everything does.

## 8. Resilience (the run itself)
- **Per-paper isolation** — one bad paper cannot abort the batch. Bookkeeping writes
  (`logIngestionComplete` / `logIngestionFailure`) never throw.
- **Resumable** — a re-run skips already-completed papers (subject-level resume via
  `dbe_ingestion_log`); a crash restarts from the last completed paper, not paper 1.
- Fetch: 45s timeout + retries; permanent failures are logged, not fatal.

## 9. Observability (QC dashboard)
Per subject: papers done / total · questions passed / review / quarantined ·
median yield · memo coverage · last-ingest date · **promotion status**
(🔴 not ready / 🟡 in review / 🟢 live).

---

## Running ingestion

**Measure one subject's true yield first** (needs a real OpenAI key for OCR):

```bash
DATABASE_URL=<db> OPENAI_API_KEY=<real> ENABLE_OCR_FALLBACK=1 \
  npx tsx scripts/diagnose-one-subject.ts "Mathematics" 2023
```

**Full corpus (production, detached)** — only after the diagnostic shows good yield:

```bash
DATABASE_URL=<prod> OPENAI_API_KEY=<real> ENABLE_OCR_FALLBACK=1 \
  nohup npx tsx scripts/run-ingest-2015-2025.ts > ingest.log 2>&1 &
tail -f ingest.log
```

Then verify per-subject counts and promote only subjects that clear §7.
