---
name: DBE PDF ingestion gotchas
description: Non-obvious failure modes when re-ingesting DBE past-paper PDFs into dbe_verbatim_questions
---

# DBE PDF ingestion gotchas

## tsx PDF downloads OOM-kill (exit 137)
Running ingestion via `npx tsx` against large DBE PDFs blows the default Node heap.
- ~1.4MB PDFs ingest fine with defaults.
- ~3MB and ~5MB PDFs need `NODE_OPTIONS="--max-old-space-size=3072"` (or 4096).
**How to apply:** ingest ONE year per process, foreground, with a `timeout`. Avoid
background `nohup` loops — zombies re-insert rows concurrently and corrupt counts.
Use `psql "$DATABASE_URL"` for DB queries (lightweight) rather than tsx.

## Some DBE URLs 403 even when others 200
Individual LinkClick URLs can be blocked (e.g. Visual Arts P2 2015 Afrikaans QP =
403 after retries) while the rest of the same paper's URLs return 200. Treat a
single-language 403 as expected, not a code bug — that language just won't ingest.

## Deterministic splitter absorbs the last question's memo into the previous one
`splitByQuestionHeaders` sometimes fails to detect the final `QUESTION N`/`VRAAG N`
header in a memo PDF, so question N-1 absorbs N's memo (capped ~4000 chars) and
question N ends up with empty memo. Re-ingesting reproduces the SAME split (it's
deterministic, not transient). This shows in triage as `MEMO_PDF_EXTRACTION_FAILED`
with ~88-94% memo coverage, NOT a missing DBE memo. Visual Arts P1 2021/2022/2024
and P2 2023 all show this identical 1-question artifact. Fixing it needs a parser
change affecting all subjects — out of scope for a single-subject ingestion task.

## Release gate thresholds are lenient
`server/release-gate.ts`: MEMO_THRESHOLD_RATIO=0.60, MARK_THRESHOLD_RATIO=0.0.
So a paper at 88% memo coverage IS releasable. `releaseEligiblePapers(subject)` is
pure SQL (no downloads) — safe to run via tsx without OOM. It is the only sanctioned
writer of `released_at`; never flip `released_at` manually.

## Year-specific no-memo exemptions
`scripts/triage-missing-memos.ts` has `KNOWN_NO_MEMO_PAPERS` (whole subject+paper)
AND `KNOWN_NO_MEMO_PAPER_YEARS` (subject+paper+specific years). Use the year-scoped
list when DBE published a memo for SOME years but not others (e.g. Visual Arts P2:
memo only for 2023; 2015/2020/2021/2024/2025 have none).
