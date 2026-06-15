# Task #369 — Memo Recovery Verification

Generated: 2026-05-09T03:10:06.121Z

## Overall coverage
- Total verbatim questions: **62,664**
- Memo-less questions: **18,035**
- Memo coverage: **71%**

### Baseline (captured 2026-05-09T03:02:49.668Z)
```
total_questions,missing_memo
62579,18002
```

## 2024 + 2025 NSC papers

| Year | Total | Missing memo | Coverage % |
|------|------:|-------------:|-----------:|
| 2024 | 6553 | 1983 | 70% |
| 2025 | 6647 | 1886 | 72% |

### Baseline 2024–2025
```
year,total,missing
2024,6471,1955
2025,6647,1886
```

## Top-5 most-affected subjects (re-ingest scope)

| Subject | Total | Missing memo | Coverage % |
|---------|------:|-------------:|-----------:|
| Life Sciences | 2810 | 1597 | 43% |
| Electrical Technology | 2022 | 1568 | 22% |
| Mechanical Technology | 2091 | 1484 | 29% |
| Physical Sciences | 1815 | 1163 | 36% |
| Agricultural Sciences | 4246 | 1055 | 75% |

### Baseline top-5
```
subject,total,missing
Life Sciences,2810,1597
Electrical Technology,2022,1568
Mechanical Technology,2091,1484
Physical Sciences,1815,1163
Agricultural Sciences,4246,1055
```

## Re-ingestion runner state
- Cumulative successful tuples: **9**
- Pending retry (failed last pass): **0**
- Tuples with improved memo coverage: **0 / 3**
- Sum of memo-coverage % gains across tuples: **64**

## Verification SQL (top-30 worst remaining papers)

```sql
SELECT subject, year, paper_number, count(*) FROM dbe_verbatim_questions
 WHERE memo_text IS NULL OR length(trim(memo_text)) < 10
 GROUP BY 1,2,3 ORDER BY 4 DESC;
```

```
subject | year | paper | missing
Mechanical Technology | 2023 | 1 | 258
Mechanical Technology | 2025 | 1 | 252
Mechanical Technology | 2024 | 1 | 237
Electrical Technology | 2023 | 1 | 218
Electrical Technology | 2025 | 1 | 210
Electrical Technology | 2022 | 1 | 208
Electrical Technology | 2024 | 1 | 202
Mechanical Technology | 2022 | 1 | 192
Electrical Technology | 2020 | 1 | 188
Mechanical Technology | 2020 | 1 | 188
Electrical Technology | 2019 | 1 | 180
Civil Technology | 2021 | 1 | 173
Electrical Technology | 2021 | 1 | 166
Mechanical Technology | 2021 | 1 | 164
Computer Applications Technology | 2019 | 2 | 146
Computer Applications Technology | 2016 | 2 | 142
Civil Technology | 2019 | 1 | 141
Physical Sciences | 2023 | 2 | 132
Agricultural Management Practices | 2021 | 1 | 102
Agricultural Management Practices | 2017 | 1 | 101
Marine Sciences | 2024 | 2 | 101
isiXhosa Home Language | 2021 | 2 | 99
Physical Sciences | 2020 | 2 | 98
Civil Technology | 2018 | 1 | 98
Electrical Technology | 2015 | 1 | 95
Life Sciences | 2021 | 1 | 92
Geography | 2021 | 1 | 91
isiXhosa Home Language | 2024 | 2 | 89
Physical Sciences | 2024 | 2 | 88
Economics | 2023 | 1 | 87
```

## Notes
- Re-ingestion alone cannot recover memos whose source PDF is a scanned image.
- The OCR fallback in `server/dbe-ingestion.ts:fetchAndParsePDF` (gated by `ENABLE_OCR_FALLBACK=1`) routes such PDFs to OpenAI vision for text recovery; enable it on the next pass to close the residual gap.
- Rows where `source_memo_url` is NULL fall under follow-up #385 (re-scrape DBE for missing memo links) — re-ingestion can't help them.
