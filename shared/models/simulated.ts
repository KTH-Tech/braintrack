/**
 * shared/models/simulated.ts — the simulated-content pipeline.
 *
 * These tables MUST live in the Drizzle schema, not be created by ad-hoc SQL:
 * `drizzle-kit push` drops anything it doesn't know about, which is exactly how
 * an earlier raw-SQL version of these tables was silently deleted in production.
 *
 * Pipeline shape:
 *   dbe_verbatim_questions  (official DBE source material — grounding only)
 *        │
 *        ├─ examiner_profiles      distilled "how this paper is built and marked"
 *        │
 *        └─ generated_questions    NEW questions written against that profile,
 *                                  each independently solved and verified before
 *                                  release_at is ever set
 *                 │
 *                 └─ simulated_paper_bank   assembled full papers
 *                          │
 *                          └─ learner_paper_allocations  ≥8 papers per learner
 */
import { sql } from "drizzle-orm";
import {
  pgTable, text, varchar, integer, boolean, timestamp, serial, jsonb,
  numeric, index, uniqueIndex,
} from "drizzle-orm/pg-core";

/** Per subject×paper: structure, mark distribution and marking conventions
 *  distilled from the verbatim bank. Grounds question generation. */
export const examinerProfiles = pgTable("examiner_profiles", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  paperNumber: integer("paper_number").notNull(),
  profile: jsonb("profile").notNull(),
  questionSampleSize: integer("question_sample_size").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
}, (t) => ({
  subjectPaperUq: uniqueIndex("examiner_profiles_subject_paper_uq").on(t.subject, t.paperNumber),
}));

/** AI-generated questions. Nothing here reaches a learner until it has been
 *  solver-verified, similarity-checked against the verbatim corpus, and
 *  released — released_at is the single gate. */
export const generatedQuestions = pgTable("generated_questions", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  paperNumber: integer("paper_number").notNull(),
  language: text("language").notNull().default("English"),
  questionNumber: text("question_number"),
  questionText: text("question_text").notNull(),
  answerText: text("answer_text").notNull(),
  markingRubric: jsonb("marking_rubric"),
  marks: integer("marks"),
  topic: text("topic"),
  cognitiveLevel: text("cognitive_level"),
  mcqOptions: jsonb("mcq_options"),
  correctOption: text("correct_option"),
  examinerProfileId: integer("examiner_profile_id"),
  groundingQuestionIds: jsonb("grounding_question_ids"),
  generationModel: text("generation_model"),
  // Verification trail — the basis of any accuracy claim.
  solverVerified: boolean("solver_verified").default(false),
  solverAnswerMatch: numeric("solver_answer_match"),
  similarityMax: numeric("similarity_max"),
  humanApproved: boolean("human_approved"),
  releasedAt: timestamp("released_at", { withTimezone: true }),
  contentHash: text("content_hash").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (t) => ({
  subjectReleasedIdx: index("generated_questions_subject_released_idx").on(t.subject, t.releasedAt),
}));

/** A full assembled simulated paper. */
export const simulatedPaperBank = pgTable("simulated_paper_bank", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  paperNumber: integer("paper_number").notNull(),
  language: text("language").notNull().default("English"),
  title: text("title").notNull(),
  totalMarks: integer("total_marks").notNull(),
  durationMinutes: integer("duration_minutes"),
  questionIds: jsonb("question_ids").notNull(),
  blueprint: jsonb("blueprint"),
  releasedAt: timestamp("released_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * Payment provider webhook events, recorded once per provider event id.
 *
 * This is the idempotency ledger: payment webhooks are retried by the provider
 * on any non-2xx and can be delivered more than once, so applying an event
 * twice would double-activate or double-charge state. The unique index on
 * provider_event_id makes re-application impossible at the database level
 * rather than relying on application checks.
 */
export const paymentEvents = pgTable("payment_events", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(),
  providerEventId: text("provider_event_id").notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload"),
  receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow(),
}, (t) => ({
  providerEventUq: uniqueIndex("payment_events_provider_event_uq").on(t.provider, t.providerEventId),
}));

/**
 * Anonymised cohort performance — aggregate learner outcomes rolled up per
 * (subject, topic, paper, cognitive level, grade, province, school-size band,
 * ISO-week). This is the ONLY analytics surface intended to persist learner
 * performance for ongoing product improvement.
 *
 * PRIVACY / POPIA (data minimisation + de-identification):
 *  - There is deliberately NO user_id, NO learner identifier, NO school id,
 *    and NO free-text here. A row is a count over a bucket, never a person.
 *  - `sampleSize` is the number of DISTINCT learners contributing to the
 *    bucket. A k-anonymity guard (K_ANONYMITY_MIN = 10) means a bucket is
 *    only ever written or returned when sampleSize >= 10, so no individual
 *    learner can be re-identified from a thin bucket (e.g. a single learner
 *    at a small school in a small province). The guard is enforced in code
 *    (server/cohort-analytics.ts), not by convention: buckets that fall
 *    below K are SUPPRESSED (never written) at aggregation time, and the
 *    read path additionally filters on sampleSize >= K as defence in depth.
 *  - `province` and `schoolSizeBand` are nullable and intentionally coarse
 *    (a province name and a 3-way size band, never a school id/name), so
 *    that even a written bucket generalises the cohort rather than pointing
 *    at one classroom.
 */
export const cohortPerformance = pgTable("cohort_performance", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  topic: text("topic"),
  paperNumber: integer("paper_number"),
  cognitiveLevel: text("cognitive_level"),
  grade: integer("grade"),
  // Coarse, non-identifying cohort dimensions. Nullable by design.
  province: text("province"),
  schoolSizeBand: text("school_size_band"), // 'small' | 'medium' | 'large'
  // ISO week the underlying attempts fall in, e.g. '2026-W29'.
  bucketPeriod: text("bucket_period").notNull(),
  attempts: integer("attempts").notNull().default(0),
  correct: integer("correct").notNull().default(0),
  avgScorePct: numeric("avg_score_pct", { mode: "number" }),
  // Distinct learners behind this bucket. MUST be >= 10 for the row to exist.
  sampleSize: integer("sample_size").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => ({
  // One aggregate row per fully-qualified bucket. Re-runs upsert in place.
  bucketUq: uniqueIndex("cohort_performance_bucket_uq").on(
    t.subject, t.topic, t.paperNumber, t.cognitiveLevel,
    t.grade, t.province, t.schoolSizeBand, t.bucketPeriod,
  ),
  subjectPeriodIdx: index("cohort_performance_subject_period_idx").on(t.subject, t.bucketPeriod),
}));

/** Which papers each learner holds — enforces the ≥8-papers-per-learner rule. */
export const learnerPaperAllocations = pgTable("learner_paper_allocations", {
  id: serial("id").primaryKey(),
  learnerUserId: varchar("learner_user_id").notNull(),
  subject: text("subject").notNull(),
  paperBankId: integer("paper_bank_id").notNull(),
  status: text("status").notNull().default("assigned"),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  scorePct: numeric("score_pct"),
}, (t) => ({
  learnerSubjectIdx: index("lpa_learner_subject_idx").on(t.learnerUserId, t.subject),
  learnerPaperUq: uniqueIndex("lpa_learner_paper_uq").on(t.learnerUserId, t.paperBankId),
}));
