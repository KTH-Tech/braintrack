/**
 * server/dbe-mapping-report.ts — DBE / CAPS curriculum-mapping proof.
 *
 * Produces a verifiable, per-subject provenance report over the official
 * `dbe_verbatim_questions` corpus, proving that ingested content maps to the
 * public DBE past-paper record and (where a topic was extracted) to the CAPS
 * topic taxonomy held in `topics`.
 *
 * Consumed by:
 *   - scripts/dbe-mapping-report.ts        (console table + JSON artifact)
 *   - GET /api/admin/dbe-mapping-report    (DBE portal)
 *
 * Honesty note: `topicMappedPct` is the share of rows whose `topic` column is
 * non-null; `capsMatchedPct` is the stricter share whose topic string actually
 * matches a real CAPS topic name for that subject. Both are reported as-is —
 * topic extraction is best-effort at ingestion and many rows are legitimately
 * NULL, so these numbers are expected to be low. They are never inflated.
 */
import { sql } from "drizzle-orm";
import { db } from "./db";

export interface DbeSubjectMapping {
  subject: string;
  questionsIngested: number;
  topicMappedCount: number;      // rows with a non-null topic
  topicMappedPct: number;        // topicMappedCount / questionsIngested * 100
  capsMatchedCount: number;      // rows whose topic matches a CAPS topics.name for this subject
  capsMatchedPct: number;
  distinctYears: number;
  years: number[];
  distinctPaperNumbers: number;
  distinctPaperInstances: number; // distinct (year, paper_number, session)
  memoCoveredCount: number;       // rows with non-null memo_text
  memoCoveragePct: number;
  releasedCount: number;
  distinctSourcePaperUrls: number;
  distinctSourceMemoUrls: number;
  sampleSourcePaperUrls: string[]; // provenance evidence (up to 3)
}

export interface DbeMappingReport {
  generatedAt: string;
  totals: {
    subjects: number;
    questionsIngested: number;
    topicMappedCount: number;
    topicMappedPct: number;
    capsMatchedCount: number;
    capsMatchedPct: number;
    memoCoveredCount: number;
    memoCoveragePct: number;
    releasedCount: number;
    distinctYears: number;
    distinctSourcePaperUrls: number;
  };
  subjects: DbeSubjectMapping[];
}

function pct(n: number, d: number): number {
  return d > 0 ? Math.round((n / d) * 10000) / 100 : 0;
}

/**
 * Compute the full mapping report. Read-only: a handful of aggregate SELECTs,
 * safe to run against production.
 */
export async function computeDbeMappingReport(): Promise<DbeMappingReport> {
  // Per-subject aggregates. `caps_matched` joins each question's free-text
  // topic to the CAPS taxonomy: topics.name = dbe.topic for the matching
  // subject (subjects.name = dbe.subject). Case-insensitive, trimmed.
  const perSubject: any = await db.execute(sql`
    SELECT
      d.subject                                             AS subject,
      COUNT(*)::int                                         AS questions_ingested,
      COUNT(d.topic)::int                                   AS topic_mapped_count,
      COUNT(DISTINCT d.year)::int                           AS distinct_years,
      COUNT(DISTINCT d.paper_number)::int                   AS distinct_paper_numbers,
      COUNT(DISTINCT (d.year, d.paper_number, d.session))::int AS distinct_paper_instances,
      COUNT(d.memo_text)::int                               AS memo_covered_count,
      COUNT(d.released_at)::int                             AS released_count,
      COUNT(DISTINCT d.source_paper_url)::int               AS distinct_source_paper_urls,
      COUNT(DISTINCT d.source_memo_url)::int                AS distinct_source_memo_urls,
      COALESCE(SUM(
        CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END
      ), 0)::int                                            AS caps_matched_count
    FROM dbe_verbatim_questions d
    LEFT JOIN subjects s
      ON lower(trim(s.name)) = lower(trim(d.subject))
    LEFT JOIN topics t
      ON t.subject_id = s.id
     AND d.topic IS NOT NULL
     AND lower(trim(t.name)) = lower(trim(d.topic))
    GROUP BY d.subject
    ORDER BY d.subject ASC
  `);

  const rows: any[] = (perSubject.rows ?? perSubject) as any[];

  // Distinct year list + up to 3 source paper URLs per subject (provenance).
  const yearsRes: any = await db.execute(sql`
    SELECT subject, array_agg(DISTINCT year ORDER BY year) AS years
    FROM dbe_verbatim_questions
    GROUP BY subject
  `);
  const yearsMap = new Map<string, number[]>();
  for (const r of (yearsRes.rows ?? yearsRes) as any[]) {
    yearsMap.set(r.subject, (r.years ?? []).map((y: any) => Number(y)));
  }

  const urlRes: any = await db.execute(sql`
    SELECT subject, source_paper_url
    FROM (
      SELECT subject, source_paper_url,
             ROW_NUMBER() OVER (PARTITION BY subject ORDER BY source_paper_url) AS rn
      FROM (SELECT DISTINCT subject, source_paper_url FROM dbe_verbatim_questions) u
    ) ranked
    WHERE rn <= 3
  `);
  const urlMap = new Map<string, string[]>();
  for (const r of (urlRes.rows ?? urlRes) as any[]) {
    const arr = urlMap.get(r.subject) ?? [];
    if (r.source_paper_url) arr.push(r.source_paper_url);
    urlMap.set(r.subject, arr);
  }

  const subjects: DbeSubjectMapping[] = rows.map((r) => {
    const questionsIngested = Number(r.questions_ingested);
    const topicMappedCount = Number(r.topic_mapped_count);
    const capsMatchedCount = Number(r.caps_matched_count);
    const memoCoveredCount = Number(r.memo_covered_count);
    return {
      subject: r.subject,
      questionsIngested,
      topicMappedCount,
      topicMappedPct: pct(topicMappedCount, questionsIngested),
      capsMatchedCount,
      capsMatchedPct: pct(capsMatchedCount, questionsIngested),
      distinctYears: Number(r.distinct_years),
      years: yearsMap.get(r.subject) ?? [],
      distinctPaperNumbers: Number(r.distinct_paper_numbers),
      distinctPaperInstances: Number(r.distinct_paper_instances),
      memoCoveredCount,
      memoCoveragePct: pct(memoCoveredCount, questionsIngested),
      releasedCount: Number(r.released_count),
      distinctSourcePaperUrls: Number(r.distinct_source_paper_urls),
      distinctSourceMemoUrls: Number(r.distinct_source_memo_urls),
      sampleSourcePaperUrls: urlMap.get(r.subject) ?? [],
    };
  });

  const totalsRes: any = await db.execute(sql`
    SELECT
      COUNT(*)::int                          AS questions_ingested,
      COUNT(topic)::int                       AS topic_mapped_count,
      COUNT(memo_text)::int                   AS memo_covered_count,
      COUNT(released_at)::int                 AS released_count,
      COUNT(DISTINCT year)::int               AS distinct_years,
      COUNT(DISTINCT source_paper_url)::int   AS distinct_source_paper_urls
    FROM dbe_verbatim_questions
  `);
  const t = ((totalsRes.rows ?? totalsRes) as any[])[0] ?? {};
  const totalQ = Number(t.questions_ingested ?? 0);
  const totalTopic = Number(t.topic_mapped_count ?? 0);
  const totalMemo = Number(t.memo_covered_count ?? 0);
  const totalCapsMatched = subjects.reduce((a, s) => a + s.capsMatchedCount, 0);

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      subjects: subjects.length,
      questionsIngested: totalQ,
      topicMappedCount: totalTopic,
      topicMappedPct: pct(totalTopic, totalQ),
      capsMatchedCount: totalCapsMatched,
      capsMatchedPct: pct(totalCapsMatched, totalQ),
      memoCoveredCount: totalMemo,
      memoCoveragePct: pct(totalMemo, totalQ),
      releasedCount: Number(t.released_count ?? 0),
      distinctYears: Number(t.distinct_years ?? 0),
      distinctSourcePaperUrls: Number(t.distinct_source_paper_urls ?? 0),
    },
    subjects,
  };
}
