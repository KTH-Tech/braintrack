/**
 * server/cohort-analytics.ts — anonymised cohort roll-up + k-anonymity guard.
 *
 * Rolls up per-learner attempt data into de-identified aggregate buckets in
 * `cohort_performance`, and reads back the "weakest topics" improvement signal.
 *
 * Source of truth for correctness: the `attempts` table (one row per answered
 * question) joined to `dbe_verbatim_questions` for the subject / topic / paper
 * dimensions, and to `users` (grade) + `partner_schools` (province, size band)
 * for the coarse cohort dimensions. No identifiers are copied into the output.
 *
 * PRIVACY: see the header on `cohortPerformance` in shared/models/simulated.ts.
 * The k-anonymity minimum below is enforced in code — buckets with fewer than
 * K distinct learners are never written and never returned.
 */
import { sql, inArray } from "drizzle-orm";
import { db } from "./db";
import { cohortPerformance } from "@shared/schema";

/**
 * k-anonymity threshold. A cohort bucket must contain at least this many
 * DISTINCT learners before it may be persisted or exposed, so that no single
 * learner's performance can be inferred from a bucket. Enforced in the SQL
 * HAVING clause, re-checked in JS before every insert, and re-applied on read.
 * Do not lower this without a POPIA review — it is the de-identification
 * guarantee, not a tuning knob.
 */
export const K_ANONYMITY_MIN = 10;

export interface CohortAggregationResult {
  bucketsConsidered: number;   // distinct groups seen in the source data
  bucketsWritten: number;      // groups that met K and were upserted
  bucketsSuppressed: number;   // groups dropped for failing K
  attemptsRolledUp: number;    // total attempts across written buckets
}

/**
 * Recompute cohort aggregates. Idempotent: each bucket upserts in place on the
 * unique bucket key, so re-running (e.g. the daily cron) refreshes counts
 * rather than duplicating them.
 *
 * `sinceDays` optionally limits the roll-up to recent attempts (default: all).
 */
export async function aggregateCohortPerformance(
  opts: { sinceDays?: number } = {},
): Promise<CohortAggregationResult> {
  const sinceClause = opts.sinceDays && opts.sinceDays > 0
    ? sql`AND a.created_at >= now() - (${opts.sinceDays} * interval '1 day')`
    : sql``;

  // Aggregate at full granularity. The HAVING clause is the primary,
  // database-level k-anonymity enforcement: groups with < K distinct learners
  // never leave the query. school_size_band is derived from the school's
  // self-declared expected learner count — a coarse 3-way band, never the
  // school id or name.
  const grouped: any = await db.execute(sql`
    SELECT
      d.subject                                        AS subject,
      d.topic                                          AS topic,
      d.paper_number                                   AS paper_number,
      a.cognitive_level                                AS cognitive_level,
      u.grade                                          AS grade,
      ps.province                                      AS province,
      CASE
        WHEN ps.expected_learner_count IS NULL THEN NULL
        WHEN ps.expected_learner_count < 300  THEN 'small'
        WHEN ps.expected_learner_count <= 800 THEN 'medium'
        ELSE 'large'
      END                                              AS school_size_band,
      to_char(a.created_at, 'IYYY"-W"IW')              AS bucket_period,
      COUNT(*)::int                                    AS attempts,
      SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END)::int AS correct,
      ROUND(AVG(
        CASE
          WHEN a.marks_available > 0
            THEN a.marks_awarded::numeric / a.marks_available * 100
          WHEN a.is_correct THEN 100
          ELSE 0
        END
      ), 2)                                            AS avg_score_pct,
      COUNT(DISTINCT a.user_id)::int                   AS sample_size
    FROM attempts a
    JOIN dbe_verbatim_questions d ON d.id = a.dbe_verbatim_question_id
    JOIN users u ON u.id = a.user_id
    LEFT JOIN partner_schools ps ON ps.id = u.school_id
    WHERE a.dbe_verbatim_question_id IS NOT NULL
      AND a.is_correct IS NOT NULL
      -- Demo accounts are seeded with synthetic attempts. Including them would
      -- both distort the cohort averages and count toward the k-anonymity
      -- threshold with a user who is not a real learner.
      AND u.is_demo = false
      ${sinceClause}
    GROUP BY
      d.subject, d.topic, d.paper_number, a.cognitive_level,
      u.grade, ps.province, school_size_band, bucket_period
    HAVING COUNT(DISTINCT a.user_id) >= ${K_ANONYMITY_MIN}
  `);

  const rows: any[] = (grouped.rows ?? grouped) as any[];

  // Defence in depth: even though the SQL HAVING already enforced K, drop any
  // bucket that does not independently satisfy the guard before it can be
  // persisted. This keeps the k-anonymity invariant true regardless of how the
  // query above is later edited. NEVER remove this filter.
  const safe = rows.filter((r) => Number(r.sample_size) >= K_ANONYMITY_MIN);
  const suppressed = rows.length - safe.length;

  const values = safe.map((r) => ({
    subject: r.subject as string,
    topic: (r.topic ?? null) as string | null,
    paperNumber: r.paper_number != null ? Number(r.paper_number) : null,
    cognitiveLevel: (r.cognitive_level ?? null) as string | null,
    grade: r.grade != null ? Number(r.grade) : null,
    province: (r.province ?? null) as string | null,
    schoolSizeBand: (r.school_size_band ?? null) as string | null,
    bucketPeriod: r.bucket_period as string,
    attempts: Number(r.attempts),
    correct: Number(r.correct),
    avgScorePct: r.avg_score_pct != null ? Number(r.avg_score_pct) : null,
    sampleSize: Number(r.sample_size),
    updatedAt: new Date(),
  }));

  // Idempotency: recompute is a full replace of the periods we just derived.
  // We DELETE the affected bucket_periods and re-INSERT rather than upsert,
  // because Postgres treats NULLs as DISTINCT in a unique index — buckets with
  // a NULL topic/province/grade/band would never match ON CONFLICT and would
  // duplicate across daily runs. Deleting by period sidesteps that entirely and
  // keeps the roll-up exact. Wrapped in a transaction so a reader never sees a
  // half-rebuilt period.
  const periods = Array.from(new Set(values.map((v) => v.bucketPeriod)));
  let attemptsRolledUp = 0;

  await db.transaction(async (tx) => {
    if (periods.length > 0) {
      await tx.delete(cohortPerformance).where(
        inArray(cohortPerformance.bucketPeriod, periods),
      );
    }
    // Insert in chunks to stay well under Postgres' parameter limit.
    for (let i = 0; i < values.length; i += 500) {
      const chunk = values.slice(i, i + 500);
      if (chunk.length > 0) await tx.insert(cohortPerformance).values(chunk);
    }
  });
  for (const v of values) attemptsRolledUp += v.attempts;

  return {
    bucketsConsidered: rows.length,
    bucketsWritten: values.length,
    bucketsSuppressed: suppressed,
    attemptsRolledUp,
  };
}

export interface WeakTopic {
  subject: string;
  topic: string | null;
  paperNumber: number | null;
  attempts: number;
  avgScorePct: number | null;
  sampleSize: number;
}

/**
 * The "ongoing improvement" signal: weakest topics by cohort, worst average
 * score first. Reads only from the already-anonymised `cohort_performance`
 * table and re-applies the k-anonymity floor on read as defence in depth.
 */
export async function getWeakestTopicsByCohort(
  opts: { subject?: string; limit?: number } = {},
): Promise<WeakTopic[]> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 200);
  const subjectClause = opts.subject
    ? sql`AND subject = ${opts.subject}`
    : sql``;

  // Roll the per-week buckets up to a per-topic view. SUM(sample_size) here is
  // an upper bound on distinct learners (a learner may recur across weeks);
  // every contributing bucket already passed K, so the aggregate is safe. The
  // explicit `HAVING SUM(sample_size) >= K` keeps the read path guarded even
  // if a sub-K row ever reaches the table by another path.
  const res: any = await db.execute(sql`
    SELECT
      subject,
      topic,
      paper_number                                     AS paper_number,
      SUM(attempts)::int                               AS attempts,
      ROUND(
        SUM(avg_score_pct * attempts) / NULLIF(SUM(attempts), 0), 2
      )                                                AS avg_score_pct,
      SUM(sample_size)::int                            AS sample_size
    FROM cohort_performance
    WHERE sample_size >= ${K_ANONYMITY_MIN}
      ${subjectClause}
    GROUP BY subject, topic, paper_number
    HAVING SUM(sample_size) >= ${K_ANONYMITY_MIN}
    ORDER BY avg_score_pct ASC NULLS LAST, attempts DESC
    LIMIT ${limit}
  `);

  const rows: any[] = (res.rows ?? res) as any[];
  return rows.map((r) => ({
    subject: r.subject as string,
    topic: (r.topic ?? null) as string | null,
    paperNumber: r.paper_number != null ? Number(r.paper_number) : null,
    attempts: Number(r.attempts),
    avgScorePct: r.avg_score_pct != null ? Number(r.avg_score_pct) : null,
    sampleSize: Number(r.sample_size),
  }));
}
