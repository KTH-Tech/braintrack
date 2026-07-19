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
