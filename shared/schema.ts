import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  serial,
  jsonb,
  date,
  index,
  uniqueIndex,
  check,
  bigint,
  numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";
export * from "./models/chat";
// Simulated-content pipeline (examiner profiles -> generated questions ->
// assembled papers -> per-learner allocations). These MUST be part of the
// schema: drizzle-kit push drops tables it doesn't know about, which is how an
// earlier raw-SQL version of them was silently deleted from production.
export * from "./models/simulated";

// Grade 12 Subjects - NSC Curriculum
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAfrikaans: text("name_afrikaans").notNull(),
  code: text("code").notNull().unique(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Topics within subjects (aligned with CAPS curriculum) - CAPS Intelligence Engine
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => subjects.id),
  name: text("name").notNull(),
  nameAfrikaans: text("name_afrikaans").notNull(),
  capsCode: text("caps_code"),
  orderIndex: integer("order_index").notNull().default(0),
  // CAPS Intelligence Fields
  capsWeighting: text("caps_weighting").notNull().default("medium"), // high, medium, low
  paperNumber: integer("paper_number"), // 1 or 2 (null if single paper subject)
  termNumber: integer("term_number"), // 1-4 for term-based teaching
  // Cognitive Levels (Bloom's Taxonomy percentages)
  cognitiveKnowledge: integer("cognitive_knowledge").notNull().default(30), // Knowledge & Recall %
  cognitiveApplication: integer("cognitive_application").notNull().default(40), // Application %
  cognitiveHigherOrder: integer("cognitive_higher_order").notNull().default(30), // Higher-order reasoning %
  // 10-Year Predictive Analytics (2015-2025 NSC patterns)
  tenYearFrequency: text("ten_year_frequency").notNull().default("medium"), // very_high, high, medium, low, rare
  tenYearLikelihood: integer("ten_year_likelihood").notNull().default(50), // 0-100 likelihood score
  typicalMarks: integer("typical_marks"), // typical marks allocation in NSC
  examTips: text("exam_tips"), // examiner tips for this topic
  commonTraps: text("common_traps").array(), // common learner errors
  termId: integer("term_id").references(() => terms.id),
  summaryEn: text("summary_en"),
  summaryAf: text("summary_af"),
  // Audio Lesson (TTS-generated from notes/summary text)
  audioUrl: text("audio_url"),
  audioUrlAf: text("audio_url_af"),
  audioGeneratedAt: timestamp("audio_generated_at"),
  audioSourceHashEn: text("audio_source_hash_en"),
  audioSourceHashAf: text("audio_source_hash_af"),
  // Admin-pinned audio: if true, the batch script and auto-generation must NOT
  // overwrite this language's audio (admin uploaded a human recording or has
  // explicitly approved the current MP3). Cleared when an admin presses
  // "Regenerate" or "Unpin" in the admin Topic Audio Review page.
  audioPinnedEn: boolean("audio_pinned_en").notNull().default(false),
  audioPinnedAf: boolean("audio_pinned_af").notNull().default(false),
  audioOriginEn: text("audio_origin_en"), // 'tts' | 'upload'
  audioOriginAf: text("audio_origin_af"),
  audioGeneratedAtEn: timestamp("audio_generated_at_en"),
  audioGeneratedAtAf: timestamp("audio_generated_at_af"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Learner Voice Notes — private audio recordings per topic
export const voiceNotes = pgTable(
  "voice_notes",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id),
    subjectId: integer("subject_id").references(() => subjects.id),
    audioUrl: text("audio_url").notNull(),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    sizeBytes: integer("size_bytes").notNull().default(0),
    title: text("title"),
    transcript: text("transcript"),
    transcriptLang: text("transcript_lang"),
    transcriptStatus: text("transcript_status"),
    transcriptError: text("transcript_error"),
    transcribedAt: timestamp("transcribed_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("voice_notes_user_idx").on(table.userId),
    index("voice_notes_topic_idx").on(table.topicId),
    index("voice_notes_user_topic_idx").on(table.userId, table.topicId),
  ],
);

export const insertVoiceNoteSchema = createInsertSchema(voiceNotes).omit({
  id: true,
  createdAt: true,
});
export type VoiceNote = typeof voiceNotes.$inferSelect;
export type InsertVoiceNote = z.infer<typeof insertVoiceNoteSchema>;

// Self-recorded lesson narrations. One row per (user, topic, language) — the
// learner reads the notes aloud and the audio lesson player plays their own
// recording back. Re-recording overwrites the prior file + row.
export const topicLessonRecordings = pgTable(
  "topic_lesson_recordings",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id),
    language: text("language").notNull(),
    audioPath: text("audio_path").notNull(),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    sizeBytes: integer("size_bytes").notNull().default(0),
    mimeType: text("mime_type"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("topic_lesson_rec_user_idx").on(table.userId),
    index("topic_lesson_rec_topic_idx").on(table.topicId),
    uniqueIndex("topic_lesson_rec_user_topic_lang_uniq").on(table.userId, table.topicId, table.language),
  ],
);
export type TopicLessonRecording = typeof topicLessonRecordings.$inferSelect;

// NSC Exam Papers
export const examPapers = pgTable(
  "exam_papers",
  {
    id: serial("id").primaryKey(),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id),
    year: integer("year").notNull(),
    month: text("month").notNull(),
    paperNumber: integer("paper_number").notNull(),
    language: text("language").notNull(),
    paperUrl: text("paper_url").notNull(),
    memoUrl: text("memo_url").notNull(),
    source: text("source").notNull().default("DBE"),
    sourceLink: text("source_link").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("exam_papers_subject_year_idx").on(table.subjectId, table.year),
  ],
);

// Individual Questions from Exam Papers - Enhanced with CAPS Intelligence
export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    examPaperId: integer("exam_paper_id")
      .notNull()
      .references(() => examPapers.id),
    topicId: integer("topic_id").references(() => topics.id),
    questionNumber: text("question_number").notNull(),
    questionText: text("question_text").notNull(),
    memoText: text("memo_text").notNull(),
    marks: integer("marks"),
    difficulty: text("difficulty"), // easy, medium, hard
    // CAPS Cognitive Level for this question
    cognitiveLevel: text("cognitive_level").notNull().default("application"), // knowledge, application, higher_order
    // NSC Command Verbs used (CAPS-aligned)
    commandVerbs: text("command_verbs").array(), // define, explain, calculate, analyse, evaluate, etc.
    // Marking guidance
    markingSteps: jsonb("marking_steps"), // step-by-step mark allocation
    alternativeAnswers: text("alternative_answers").array(), // acceptable alternative responses
    commonErrors: text("common_errors").array(), // typical learner mistakes
    examinerNotes: text("examiner_notes"), // examiner-style guidance
    // Simulated vs DBE reference
    isSimulated: boolean("is_simulated").notNull().default(true), // true = original/simulated, false = DBE reference
    dbeReferenceYear: integer("dbe_reference_year"), // if referencing DBE, which year
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("questions_exam_paper_idx").on(table.examPaperId),
    index("questions_topic_idx").on(table.topicId),
    index("questions_cognitive_idx").on(table.cognitiveLevel),
  ],
);

// User Attempts on Questions - Enhanced with Error Type Tracking
export const attempts = pgTable(
  "attempts",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    // Nullable: an attempt is sourced from either the legacy `questions`
    // table OR the `dbe_verbatim_questions` table (Mini Mock / Full Exam).
    questionId: integer("question_id").references(() => questions.id),
    // DBE verbatim question reference for exam-mode practice (Mini Mock,
    // Full Exam). Mutually-exclusive with `questionId` in practice but
    // both columns are nullable so existing admin-published attempts keep
    // working unchanged.
    dbeVerbatimQuestionId: integer("dbe_verbatim_question_id").references(
      (): any => dbeVerbatimQuestions.id,
    ),
    answerText: text("answer_text").notNull(),
    isCorrect: boolean("is_correct"),
    marksAwarded: integer("marks_awarded"),
    marksAvailable: integer("marks_available"), // total marks for this question
    feedbackJson: jsonb("feedback_json"),
    // Error Type Classification for mastery calculation
    errorType: text("error_type"), // concept, method, language, none (if correct)
    errorDetails: text("error_details"), // specific error description
    // Time tracking for efficiency scoring
    timeSpentSeconds: integer("time_spent_seconds"),
    expectedTimeSeconds: integer("expected_time_seconds"), // expected time per mark × marks
    // Cognitive level attempted
    cognitiveLevel: text("cognitive_level"), // knowledge, application, higher_order
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("attempts_user_idx").on(table.userId),
    index("attempts_question_idx").on(table.questionId),
    index("attempts_dbe_verbatim_idx").on(table.dbeVerbatimQuestionId),
    index("attempts_error_type_idx").on(table.errorType),
  ],
);

// Topic-Level Mastery Tracking - Per User × Topic
export const topicMastery = pgTable(
  "topic_mastery",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id),
    // Mastery Score (0-100) calculated from accuracy, marks, time efficiency, error distribution
    masteryScore: integer("mastery_score").notNull().default(0),
    // Mastery Band: red (<60), amber (60-75), green (>75)
    masteryBand: text("mastery_band").notNull().default("red"), // red, amber, green
    // Component scores
    accuracyScore: integer("accuracy_score").notNull().default(0), // % correct
    marksRatio: integer("marks_ratio").notNull().default(0), // marks achieved / marks available %
    timeEfficiency: integer("time_efficiency").notNull().default(0), // time used / expected time %
    // Error Type Distribution
    conceptErrors: integer("concept_errors").notNull().default(0),
    methodErrors: integer("method_errors").notNull().default(0),
    languageErrors: integer("language_errors").notNull().default(0),
    // Attempt counts
    questionsAttempted: integer("questions_attempted").notNull().default(0),
    questionsCorrect: integer("questions_correct").notNull().default(0),
    totalMarksEarned: integer("total_marks_earned").notNull().default(0),
    totalMarksAvailable: integer("total_marks_available").notNull().default(0),
    // Spaced Repetition Data
    lastAttemptAt: timestamp("last_attempt_at"),
    nextReviewAt: timestamp("next_review_at"),
    reviewInterval: integer("review_interval").notNull().default(1), // days until next review
    // Confidence tracking
    confidenceLevel: integer("confidence_level").notNull().default(0), // 0-100
    consecutiveCorrect: integer("consecutive_correct").notNull().default(0),
    consecutiveIncorrect: integer("consecutive_incorrect").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("topic_mastery_user_idx").on(table.userId),
    index("topic_mastery_topic_idx").on(table.topicId),
    index("topic_mastery_subject_idx").on(table.subjectId),
    index("topic_mastery_band_idx").on(table.masteryBand),
    uniqueIndex("topic_mastery_user_id_topic_id_unique").on(
      table.userId,
      table.topicId,
    ),
  ],
);

// Simulated Exams - AI-Generated NSC-Style Exams
export const simulatedExams = pgTable(
  "simulated_exams",
  {
    id: serial("id").primaryKey(),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id),
    examNumber: integer("exam_number").notNull(), // 1-4 per subject
    paperNumber: integer("paper_number").notNull().default(1), // Paper 1 or Paper 2
    title: text("title").notNull(),
    titleAfrikaans: text("title_afrikaans").notNull(),
    // Exam structure (JSON with all questions and memos)
    questionsJson: jsonb("questions_json").notNull(), // array of simulated questions
    memorandumJson: jsonb("memorandum_json").notNull(), // full marking memo
    capsCoverageMap: jsonb("caps_coverage_map").notNull(), // topic coverage summary
    // Cognitive split
    knowledgeMarks: integer("knowledge_marks").notNull().default(0),
    applicationMarks: integer("application_marks").notNull().default(0),
    higherOrderMarks: integer("higher_order_marks").notNull().default(0),
    totalMarks: integer("total_marks").notNull().default(150),
    timeMinutes: integer("time_minutes").notNull().default(180),
    // Compliance
    disclaimer: text("disclaimer")
      .notNull()
      .default(
        "This is a simulated examination developed in alignment with the CAPS curriculum and NSC assessment standards. It is not an official DBE examination.",
      ),
    officialDbeLink: text("official_dbe_link")
      .notNull()
      .default(
        "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
      ),
    // Status
    status: text("status").notNull().default("active"), // active, draft, archived
    generatedAt: timestamp("generated_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("simulated_exams_subject_idx").on(table.subjectId)],
);

// =============================================================================
// Task #428 — Per-Topic Content Layer (Notes, Flashcards & Literature)
// =============================================================================

// Curated notes per topic (CAPS-aligned), one row per (topic, language).
export const topicNotes = pgTable(
  "topic_notes",
  {
    id: serial("id").primaryKey(),
    topicId: integer("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
    language: varchar("language", { length: 8 }).notNull().default("en"),
    summary: text("summary").notNull().default(""),
    keyConcepts: jsonb("key_concepts").notNull().default([]),
    workedExamples: jsonb("worked_examples").notNull().default([]),
    diagrams: jsonb("diagrams"),
    source: varchar("source", { length: 64 }).notNull().default("caps_seed"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("topic_notes_topic_idx").on(table.topicId),
    uniqueIndex("topic_notes_topic_lang_unique").on(table.topicId, table.language),
  ],
);

export type TopicNote = typeof topicNotes.$inferSelect;
export type InsertTopicNote = typeof topicNotes.$inferInsert;

// Per-topic flashcard decks (CAPS-aligned, multiple cards per topic per language).
export const topicFlashcards = pgTable(
  "topic_flashcards",
  {
    id: serial("id").primaryKey(),
    topicId: integer("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
    language: varchar("language", { length: 8 }).notNull().default("en"),
    front: text("front").notNull(),
    back: text("back").notNull(),
    cardType: varchar("card_type", { length: 32 }).notNull().default("concept"),
    orderIndex: integer("order_index").notNull().default(0),
    source: varchar("source", { length: 64 }).notNull().default("caps_seed"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("topic_flashcards_topic_lang_idx").on(table.topicId, table.language)],
);

export type TopicFlashcard = typeof topicFlashcards.$inferSelect;
export type InsertTopicFlashcard = typeof topicFlashcards.$inferInsert;

// Literature set works (one per English HL / Afrikaans HL prescribed work).
export const literatureWorks = pgTable(
  "literature_works",
  {
    id: serial("id").primaryKey(),
    subjectId: integer("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
    externalId: varchar("external_id", { length: 64 }).notNull(),
    title: text("title").notNull(),
    titleAfrikaans: text("title_afrikaans"),
    author: text("author").notNull(),
    workType: varchar("work_type", { length: 32 }).notNull(), // novel | drama | poetry | short_stories
    yearPublished: integer("year_published"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("literature_works_subject_idx").on(table.subjectId),
    uniqueIndex("literature_works_subject_extid_unique").on(table.subjectId, table.externalId),
  ],
);

export type LiteratureWorkRow = typeof literatureWorks.$inferSelect;
export type InsertLiteratureWork = typeof literatureWorks.$inferInsert;

// Detailed literature notes per work per language (themes, characters, etc.).
export const literatureNotes = pgTable(
  "literature_notes",
  {
    id: serial("id").primaryKey(),
    workId: integer("work_id").notNull().references(() => literatureWorks.id, { onDelete: "cascade" }),
    language: varchar("language", { length: 8 }).notNull().default("en"),
    themes: jsonb("themes").notNull().default([]),
    characters: jsonb("characters").notNull().default([]),
    literaryDevices: jsonb("literary_devices").notNull().default([]),
    essayFrameworks: jsonb("essay_frameworks").notNull().default([]),
    summary: text("summary").notNull().default(""),
    source: varchar("source", { length: 64 }).notNull().default("caps_seed"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("literature_notes_work_idx").on(table.workId),
    uniqueIndex("literature_notes_work_lang_unique").on(table.workId, table.language),
  ],
);

export type LiteratureNoteRow = typeof literatureNotes.$inferSelect;
export type InsertLiteratureNote = typeof literatureNotes.$inferInsert;

// Generated Study Notes - Personalized per Learner's Learning Style
export const studyNotes = pgTable(
  "study_notes",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id),
    // Learning Style Adaptation (VARK: Visual, Auditory, Reading/Writing, Kinesthetic)
    learningStyle: text("learning_style").notNull(), // visual, auditory, reading, kinesthetic
    language: text("language").notNull().default("en"), // en or af
    // Generated Note Content
    title: text("title").notNull(),
    content: text("content").notNull(), // Main note content adapted to learning style
    keyPoints: text("key_points").array(), // Bullet points of key concepts
    mnemonics: text("mnemonics").array(), // Memory aids relevant to learning style
    diagrams: jsonb("diagrams"), // Visual learner: diagram descriptions/references
    audioScripts: text("audio_scripts").array(), // Auditory learner: verbal explanations
    practiceActivities: text("practice_activities").array(), // Kinesthetic learner: hands-on activities
    examTips: text("exam_tips").array(), // NSC exam-specific tips for this topic
    // CAPS Alignment
    capsReferences: text("caps_references").array(), // CAPS document references
    cognitiveLevel: text("cognitive_level").notNull().default("application"), // knowledge, application, higher_order
    estimatedStudyMinutes: integer("estimated_study_minutes")
      .notNull()
      .default(30),
    // Status and versioning
    version: integer("version").notNull().default(1),
    status: text("status").notNull().default("active"), // active, archived
    generatedAt: timestamp("generated_at").defaultNow(),
    lastAccessedAt: timestamp("last_accessed_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("study_notes_user_idx").on(table.userId),
    index("study_notes_subject_idx").on(table.subjectId),
    index("study_notes_topic_idx").on(table.topicId),
    index("study_notes_style_idx").on(table.learningStyle),
  ],
);

// Daily Usage Limits
export const usage = pgTable(
  "usage",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    usageDate: date("usage_date").notNull(),
    tutorCount: integer("tutor_count").notNull().default(0),
    markingCount: integer("marking_count").notNull().default(0),
    fullSolutionCount: integer("full_solution_count").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  // Task #819 step 2 + 3 — uniqueIndex (was a non-unique index) is REQUIRED
  // for the atomic ON CONFLICT (user_id, usage_date) DO UPDATE upsert used by
  // DatabaseStorage.incrementUsage. Without this, concurrent tutor calls can
  // insert duplicate (user_id, usage_date) rows and bypass the daily quota.
  (table) => [uniqueIndex("usage_user_date_idx").on(table.userId, table.usageDate)],
);

// Prep Score History - Track learner preparation status over time
export const prepScores = pgTable(
  "prep_scores",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    score: integer("score").notNull().default(0),
    status: text("status").notNull().default("catch_up"), // star, locked_in, building, catch_up
    streak: integer("streak").notNull().default(0),
    accuracy: integer("accuracy").notNull().default(0),
    questionsAnswered: integer("questions_answered").notNull().default(0),
    papersCompleted: integer("papers_completed").notNull().default(0),
    recordedAt: timestamp("recorded_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("prep_scores_user_idx").on(table.userId),
    index("prep_scores_date_idx").on(table.recordedAt),
  ],
);

// Push Notification Subscriptions
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("push_subscriptions_user_idx").on(table.userId)],
);

// Activation Codes for Subscription
export const activationCodes = pgTable("activation_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  schoolName: text("school_name"),
  maxUses: integer("max_uses").notNull().default(1),
  currentUses: integer("current_uses").notNull().default(0),
  status: text("status").notNull().default("active"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Onboarding Test Results
export const onboardingResults = pgTable(
  "onboarding_results",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    learningStyle: text("learning_style").notNull(),
    studyPreference: text("study_preference").notNull(),
    focusDuration: integer("focus_duration").notNull(),
    challenges: text("challenges").array().notNull(),
    goals: text("goals").array().notNull(),
    preferredLanguage: text("preferred_language").notNull().default("en"),
    selectedSubjects: integer("selected_subjects").array().notNull().default([]),
    // VARK questionnaire result — the questionnaire (client/src/lib/vark.ts
    // VARK_QUESTIONS + scoreVarkAnswers) tallies 12 scenario answers into a
    // primary VARK style and, when the runner-up is within 20% of the primary,
    // an optional secondary. Both columns are additive/nullable so existing
    // rows (created before migration 0034) stay valid, and the runtime write
    // path (server/routes.ts /api/onboarding) also tolerates the column being
    // missing — nothing here can regress an unmigrated DB.
    // — CAUSED LIVE REGRESSION — the claim above about "tolerating an
    // unmigrated DB" was WRONG for reads. Drizzle's typed SELECT projects
    // every schema column, so declaring these here without applying
    // migration 0034 made every read of onboarding_results 500 on prod,
    // taking down /api/subjects (returns []), /api/timetable/widgets
    // (nextExam=null), and /api/user/journey (500). Reverted 2026-07-22.
    // VARK still persists via users.vark_primary / users.vark_secondary.
    // Re-add these two columns AFTER migration 0034 is confirmed applied.
    rawAnswersJson: jsonb("raw_answers_json"),
    traitsJson: jsonb("traits_json"),
    recommendationsJson: jsonb("recommendations_json"),
    literatureSelectionsJson: jsonb("literature_selections_json"),
    scheduleLastUpdatedAt: timestamp("schedule_last_updated_at"),
    completedAt: timestamp("completed_at").defaultNow(),
  },
  (table) => [
    index("onboarding_user_idx").on(table.userId),
    check("onboarding_results_preferred_language_short_form", sql`${table.preferredLanguage} IN ('en', 'af')`),
  ],
);

// VARK Learning Events — tracks content interactions for auto-adapt engine
export const learningEvents = pgTable(
  "learning_events",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    contentType: text("content_type").notNull(), // visual, auditory, read, kinesthetic
    timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
    performanceScore: integer("performance_score"), // 0-100, null if no performance tracked
    subjectId: integer("subject_id").references(() => subjects.id),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("learning_events_user_idx").on(table.userId),
    index("learning_events_type_idx").on(table.contentType),
  ],
);

// Help Escalations — learners/parents request help, admin gets notified
export const helpEscalations = pgTable(
  "help_escalations",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    userName: text("user_name"),
    userRole: text("user_role").notNull().default("learner"),
    category: text("category").notNull(),
    subject: text("subject"),
    message: text("message").notNull(),
    status: text("status").notNull().default("open"),
    adminNote: text("admin_note"),
    resolvedAt: timestamp("resolved_at"),
    resolvedBy: varchar("resolved_by"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("help_escalations_user_idx").on(table.userId),
    index("help_escalations_status_idx").on(table.status),
  ],
);

export const insertHelpEscalationSchema = createInsertSchema(
  helpEscalations,
).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
  resolvedBy: true,
});
export type InsertHelpEscalation = z.infer<typeof insertHelpEscalationSchema>;
export type HelpEscalation = typeof helpEscalations.$inferSelect;

// User Subscriptions
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    userRole: text("user_role").notNull().default("learner"), // "parent" or "learner"
    parentUserId: varchar("parent_user_id"), // Links learner to parent account
    status: text("status").notNull().default("inactive"),
    plan: text("plan").notNull().default("monthly"),
    priceRands: integer("price_rands").notNull().default(79),
    activationCodeId: integer("activation_code_id").references(
      () => activationCodes.id,
    ),
    adminGranted: boolean("admin_granted").notNull().default(false),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    payfastSubscriptionId: text("payfast_subscription_id"),
    // Legacy Yoco/Ozow columns — kept for historical rows during migration.
    // New code MUST use the Netcash columns below.
    yocoCheckoutId: text("yoco_checkout_id"),
    yocoPaymentId: text("yoco_payment_id"),
    ozowTransactionId: text("ozow_transaction_id"),
    ozowReference: text("ozow_reference"),
    // Netcash recurring billing (Task #393)
    netcashSubscriptionId: text("netcash_subscription_id"),
    netcashMandateId: text("netcash_mandate_id"),
    netcashCardToken: text("netcash_card_token"),
    netcashCheckoutRef: text("netcash_checkout_ref"),
    // Paystack recurring billing — the active provider. Netcash columns above
    // are retained so historical records stay readable.
    paystackCustomerCode: text("paystack_customer_code"),
    paystackSubscriptionCode: text("paystack_subscription_code"),
    paystackAuthorizationCode: text("paystack_authorization_code"),
    billingMethod: text("billing_method").default("trial"), // trial | paystack | debicheck | card | lapsed
    pendingMethod: text("pending_method"), // debicheck | card while awaiting webhook
    trialEndsAt: timestamp("trial_ends_at"),
    nextRenewalAt: timestamp("next_renewal_at"),
    gracePeriodEndsAt: timestamp("grace_period_ends_at"),
    lastPaymentStatus: text("last_payment_status"),
    lastPaymentAt: timestamp("last_payment_at"),
    trialReminderD13Sent: boolean("trial_reminder_d13_sent").default(false),
    trialReminderD14Sent: boolean("trial_reminder_d14_sent").default(false),
    trialReminderEmailD13Sent: boolean("trial_reminder_email_d13_sent").default(false),
    trialReminderEmailD14Sent: boolean("trial_reminder_email_d14_sent").default(false),
    paymentProvider: text("payment_provider").default("netcash"),
    learnerPhone: text("learner_phone"),
    learnerName: text("learner_name"),
    parentEmail: text("parent_email"),
    parentPhone: text("parent_phone"),
    parentCell: text("parent_cell"), // SA-validated mandatory parent cell captured at trial signup
    learnerCell: varchar("learner_cell"), // SA-validated mandatory learner cell captured at trial signup (Task #409)
    parentConsent: boolean("parent_consent").default(false),
    parentConsentDate: timestamp("parent_consent_date"),
    planId: integer("plan_id").references(() => plans.id),
    learnerUserId: varchar("learner_user_id"),
    billingType: text("billing_type").default("monthly"),
    remainingBillingCycles: integer("remaining_billing_cycles"),
    autoStop: boolean("auto_stop").default(true),
    referralCode: text("referral_code"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("subscriptions_user_idx").on(table.userId),
    index("subscriptions_status_idx").on(table.status),
    uniqueIndex("subscriptions_referral_code_uniq").on(table.referralCode),
  ],
);

// User Progress Tracking
export const userProgress = pgTable(
  "user_progress",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id),
    papersCompleted: integer("papers_completed").notNull().default(0),
    questionsAttempted: integer("questions_attempted").notNull().default(0),
    correctAnswers: integer("correct_answers").notNull().default(0),
    lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("user_progress_user_idx").on(table.userId),
    index("user_progress_subject_idx").on(table.subjectId),
  ],
);

// User Streaks Tracking
export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: date("last_activity_date"),
  totalDaysActive: integer("total_days_active").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Badges
export const userBadges = pgTable(
  "user_badges",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    badgeCode: text("badge_code").notNull(),
    earnedAt: timestamp("earned_at").defaultNow(),
  },
  (table) => [index("user_badges_user_idx").on(table.userId)],
);

// Active User Sessions - Prevent profile sharing/cloning
export const userActiveSessions = pgTable(
  "user_active_sessions",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    sessionToken: text("session_token").notNull().unique(),
    deviceFingerprint: text("device_fingerprint"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    isActive: boolean("is_active").notNull().default(true),
    lastActivityAt: timestamp("last_activity_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    expiresAt: timestamp("expires_at"),
  },
  (table) => [
    index("user_sessions_user_idx").on(table.userId),
    index("user_sessions_token_idx").on(table.sessionToken),
  ],
);

// Exam Sessions for Exam Ready feature
export const examSessions = pgTable(
  "exam_sessions",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    examPaperId: integer("exam_paper_id")
      .notNull()
      .references(() => examPapers.id),
    status: text("status").notNull().default("in_progress"), // in_progress, completed, cancelled, violated
    startedAt: timestamp("started_at").defaultNow(),
    completedAt: timestamp("completed_at"),
    timeAllowedMinutes: integer("time_allowed_minutes").notNull().default(180),
    timeUsedSeconds: integer("time_used_seconds").notNull().default(0),
    violationType: text("violation_type"), // tab_switch, long_pause, fullscreen_exit, copy_paste
    violationCount: integer("violation_count").notNull().default(0),
    answersJson: jsonb("answers_json").default({}),
    score: integer("score"),
    totalMarks: integer("total_marks"),
    // Anti-cheating AI detection fields
    aiDetectionFlags: text("ai_detection_flags").array(), // Detected AI patterns
    flaggedForReview: boolean("flagged_for_review").notNull().default(false), // Needs teacher review
    copyPasteAttempts: integer("copy_paste_attempts").notNull().default(0),
    // Anti-automation exam token (T026) — signed JWT issued on session creation
    examToken: text("exam_token"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("exam_sessions_user_idx").on(table.userId),
    index("exam_sessions_status_idx").on(table.status),
  ],
);

// Smart Tutor Sessions
export const tutorSessions = pgTable(
  "tutor_sessions",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    examPaperId: integer("exam_paper_id").references(() => examPapers.id),
    questionId: integer("question_id").references(() => questions.id),
    questionNumber: text("question_number"),
    questionText: text("question_text").notNull(),
    memoAnswer: text("memo_answer").notNull(),
    mode: text("mode").notNull().default("hint_1"),
    messages: jsonb("messages").notNull().default([]),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("tutor_sessions_user_idx").on(table.userId)],
);

// Smart Tutor Feedback
export const tutorFeedback = pgTable("tutor_feedback", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => tutorSessions.id),
  messageIndex: integer("message_index").notNull(), // Index of the AI message in tutorSessions.messages
  rating: integer("rating").notNull(), // 1 for good, -1 for bad (or 1-5 stars)
  suggestion: text("suggestion"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const subjectsRelations = relations(subjects, ({ many }) => ({
  examPapers: many(examPapers),
  topics: many(topics),
  userProgress: many(userProgress),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [topics.subjectId],
    references: [subjects.id],
  }),
  questions: many(questions),
  topicMastery: many(topicMastery),
}));

export const topicMasteryRelations = relations(topicMastery, ({ one }) => ({
  topic: one(topics, {
    fields: [topicMastery.topicId],
    references: [topics.id],
  }),
  subject: one(subjects, {
    fields: [topicMastery.subjectId],
    references: [subjects.id],
  }),
}));

export const simulatedExamsRelations = relations(simulatedExams, ({ one }) => ({
  subject: one(subjects, {
    fields: [simulatedExams.subjectId],
    references: [subjects.id],
  }),
}));

export const examPapersRelations = relations(examPapers, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [examPapers.subjectId],
    references: [subjects.id],
  }),
  questions: many(questions),
  tutorSessions: many(tutorSessions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  examPaper: one(examPapers, {
    fields: [questions.examPaperId],
    references: [examPapers.id],
  }),
  topic: one(topics, {
    fields: [questions.topicId],
    references: [topics.id],
  }),
  attempts: many(attempts),
}));

export const attemptsRelations = relations(attempts, ({ one }) => ({
  question: one(questions, {
    fields: [attempts.questionId],
    references: [questions.id],
  }),
}));

export const tutorSessionsRelations = relations(
  tutorSessions,
  ({ one, many }) => ({
    examPaper: one(examPapers, {
      fields: [tutorSessions.examPaperId],
      references: [examPapers.id],
    }),
    question: one(questions, {
      fields: [tutorSessions.questionId],
      references: [questions.id],
    }),
    feedback: many(tutorFeedback),
  }),
);

export const tutorFeedbackRelations = relations(tutorFeedback, ({ one }) => ({
  session: one(tutorSessions, {
    fields: [tutorFeedback.sessionId],
    references: [tutorSessions.id],
  }),
}));

export const insertTutorFeedbackSchema = createInsertSchema(tutorFeedback).omit(
  {
    id: true,
    createdAt: true,
  },
);

export type TutorFeedback = typeof tutorFeedback.$inferSelect;
export type InsertTutorFeedback = z.infer<typeof insertTutorFeedbackSchema>;

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  activationCode: one(activationCodes, {
    fields: [subscriptions.activationCodeId],
    references: [activationCodes.id],
  }),
}));

// Zod Schemas
export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
  createdAt: true,
});

export const insertExamPaperSchema = createInsertSchema(examPapers).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export const insertAttemptSchema = createInsertSchema(attempts).omit({
  id: true,
  createdAt: true,
});

export const insertUsageSchema = createInsertSchema(usage).omit({
  id: true,
  createdAt: true,
});

export const insertActivationCodeSchema = createInsertSchema(
  activationCodes,
).omit({
  id: true,
  createdAt: true,
});

export const insertOnboardingResultSchema = createInsertSchema(
  onboardingResults,
).omit({
  id: true,
  completedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
});

export const insertTutorSessionSchema = createInsertSchema(tutorSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExamSessionSchema = createInsertSchema(examSessions).omit({
  id: true,
  createdAt: true,
});

export const insertUserStreakSchema = createInsertSchema(userStreaks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertUserActiveSessionSchema = createInsertSchema(
  userActiveSessions,
).omit({
  id: true,
  createdAt: true,
  lastActivityAt: true,
});

export const insertTopicMasterySchema = createInsertSchema(topicMastery).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSimulatedExamSchema = createInsertSchema(
  simulatedExams,
).omit({
  id: true,
  createdAt: true,
  generatedAt: true,
});

export const insertPrepScoreSchema = createInsertSchema(prepScores).omit({
  id: true,
  createdAt: true,
  recordedAt: true,
});

export const insertPushSubscriptionSchema = createInsertSchema(
  pushSubscriptions,
).omit({
  id: true,
  createdAt: true,
});

// Types
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;

export type ExamPaper = typeof examPapers.$inferSelect;
export type InsertExamPaper = z.infer<typeof insertExamPaperSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Attempt = typeof attempts.$inferSelect;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;

export type Usage = typeof usage.$inferSelect;
export type InsertUsage = z.infer<typeof insertUsageSchema>;

export type ActivationCode = typeof activationCodes.$inferSelect;
export type InsertActivationCode = z.infer<typeof insertActivationCodeSchema>;

export type OnboardingResult = typeof onboardingResults.$inferSelect;
export type InsertOnboardingResult = z.infer<
  typeof insertOnboardingResultSchema
>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type TutorSession = typeof tutorSessions.$inferSelect;
export type InsertTutorSession = z.infer<typeof insertTutorSessionSchema>;

export type ExamSession = typeof examSessions.$inferSelect;
export type InsertExamSession = z.infer<typeof insertExamSessionSchema>;

export type UserStreak = typeof userStreaks.$inferSelect;
export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

export type UserActiveSession = typeof userActiveSessions.$inferSelect;
export type InsertUserActiveSession = z.infer<
  typeof insertUserActiveSessionSchema
>;

export type TopicMastery = typeof topicMastery.$inferSelect;
export type InsertTopicMastery = z.infer<typeof insertTopicMasterySchema>;

export type SimulatedExam = typeof simulatedExams.$inferSelect;
export type InsertSimulatedExam = z.infer<typeof insertSimulatedExamSchema>;

export type PrepScore = typeof prepScores.$inferSelect;
export type InsertPrepScore = z.infer<typeof insertPrepScoreSchema>;

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<
  typeof insertPushSubscriptionSchema
>;

// CAPS Intelligence Types
export type CapsWeighting = "high" | "medium" | "low";
export type TenYearFrequency = "very_high" | "high" | "medium" | "low" | "rare";
export type CognitiveLevel = "knowledge" | "application" | "higher_order";
export type MasteryBand = "neutral" | "red" | "amber" | "green";
export type ErrorType = "concept" | "method" | "language" | "none";

// Adaptive Explanation Response Type (for Smart Tutor)
export interface AdaptiveExplanation {
  // Required keys for unknown frontend payload safety
  explanation: string;
  feedback: string;
  message: string;
  memo_hint: string;
  // Metadata (UI will safely ignore)
  explanation_level: MasteryBand;
  mastery_score: number;
  marking_logic: string[];
  common_traps: string[];
  next_action: string;
  caps_topic: string;
  cognitive_level: CognitiveLevel;
}

// Simulated Question Structure (for exam generation)
export interface SimulatedQuestion {
  questionNumber: string;
  questionText: string;
  marks: number;
  cognitiveLevel: CognitiveLevel;
  commandVerbs: string[];
  capsTopicCode: string;
  subQuestions?: SimulatedQuestion[];
}

// Simulated Memorandum Structure
export interface SimulatedMemorandum {
  questionNumber: string;
  markingSteps: {
    step: string;
    marks: number;
    acceptAlternatives?: string[];
    examinerNote?: string;
  }[];
  totalMarks: number;
  commonErrors: string[];
}

// CAPS Coverage Map Structure
export interface CapsCoverageMap {
  topic: string;
  topicCode: string;
  questionNumbers: string[];
  totalMarks: number;
  knowledgeMarks: number;
  applicationMarks: number;
  higherOrderMarks: number;
}

// Topic Priority Calculation Result
export interface TopicPriority {
  topicId: number;
  topicName: string;
  priority: number;
  capsWeight: number;
  tenYearFrequency: number;
  masteryRatio: number;
  examProximityFactor: number;
  recommendedAction: "teach" | "practice" | "challenge";
}

// Onboarding Questions Type
export interface OnboardingQuestion {
  id: string;
  questionEn: string;
  questionAf: string;
  type: "single" | "multiple" | "slider";
  options?: { value: string; labelEn: string; labelAf: string }[];
  min?: number;
  max?: number;
  step?: number;
}

// Tutor Message Type
export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Marking Feedback Type
export interface MarkingFeedback {
  language: string;
  overallFeedback: string;
  metPoints: string[];
  missingPoints: string[];
  tryAgainPrompt: string;
  marksAwarded: number;
  totalMarks: number;
}

// Daily Challenges
export const dailyChallenges = pgTable(
  "daily_challenges",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    challengeDate: date("challenge_date").notNull(),
    subjectId: integer("subject_id").references(() => subjects.id),
    questionsJson: jsonb("questions_json").notNull(),
    answersJson: jsonb("answers_json"),
    score: integer("score"),
    totalQuestions: integer("total_questions").notNull().default(5),
    completedAt: timestamp("completed_at"),
    timeSpentSeconds: integer("time_spent_seconds"),
    streak: integer("streak").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("daily_challenges_user_idx").on(table.userId),
    index("daily_challenges_date_idx").on(table.userId, table.challengeDate),
  ],
);

// Partner Schools - Referral Tracking System
export const partnerSchools = pgTable(
  "partner_schools",
  {
    id: serial("id").primaryKey(),
    schoolName: text("school_name").notNull(),
    schoolCode: text("school_code").notNull().unique(), // Unique referral code (custom or generated)
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    province: text("province"),
    district: text("district"),
    isActive: boolean("is_active").notNull().default(true),
    commissionRate: integer("commission_rate").notNull().default(10), // % commission on referrals
    totalReferrals: integer("total_referrals").notNull().default(0),
    totalRevenue: integer("total_revenue").notNull().default(0), // in cents
    qrCodeUrl: text("qr_code_url"), // URL to generated QR code image
    notes: text("notes"),
    // Phase 4: Endorsement & trial tracking
    endorsementStatus: text("endorsement_status").notNull().default("none"), // none, interested, endorsed, champion
    trialStartDate: timestamp("trial_start_date"),
    trialExpiryDate: timestamp("trial_expiry_date"),
    gradeRange: text("grade_range"), // e.g. "10-12"
    expectedLearnerCount: integer("expected_learner_count"),
    schoolType: text("school_type").notNull().default("public"), // public, private, independent
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("partner_schools_code_idx").on(table.schoolCode)],
);

// School Contact Log — admin interactions with schools
export const schoolContactLog = pgTable(
  "school_contact_log",
  {
    id: serial("id").primaryKey(),
    schoolId: integer("school_id")
      .notNull()
      .references(() => partnerSchools.id),
    type: text("type").notNull(), // call, email, meeting, demo, follow_up
    notes: text("notes").notNull(),
    adminId: varchar("admin_id"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("school_contact_log_school_idx").on(table.schoolId)],
);

export const insertDailyChallengeSchema = createInsertSchema(
  dailyChallenges,
).omit({
  id: true,
  createdAt: true,
});

export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;

export interface DailyChallengeQuestion {
  id: number;
  question: string;
  questionAf?: string;
  options: string[];
  optionsAf?: string[];
  correctIndex: number;
  subject: string;
  subjectAf?: string;
  topic?: string;
  difficulty: string;
  explanation: string;
  explanationAf?: string;
}

export const insertPartnerSchoolSchema = createInsertSchema(
  partnerSchools,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalReferrals: true,
  totalRevenue: true,
  qrCodeUrl: true,
});

export type InsertPartnerSchool = z.infer<typeof insertPartnerSchoolSchema>;
export type PartnerSchool = typeof partnerSchools.$inferSelect;

export const insertSchoolContactLogSchema = createInsertSchema(
  schoolContactLog,
).omit({
  id: true,
  createdAt: true,
});

export type InsertSchoolContactLog = z.infer<
  typeof insertSchoolContactLogSchema
>;
export type SchoolContactLog = typeof schoolContactLog.$inferSelect;

// School Referral Tracking - Links purchases to partner schools
export const schoolReferrals = pgTable(
  "school_referrals",
  {
    id: serial("id").primaryKey(),
    partnerSchoolId: integer("partner_school_id")
      .notNull()
      .references(() => partnerSchools.id),
    parentName: text("parent_name").notNull(),
    parentEmail: text("parent_email"),
    parentPhone: text("parent_phone"),
    learnerName: text("learner_name").notNull(),
    learnerSchool: text("learner_school"), // School name provided by parent (may differ)
    purchaseAmount: integer("purchase_amount").notNull(), // in cents
    commissionAmount: integer("commission_amount").notNull(), // in cents
    status: text("status").notNull().default("pending"), // pending, confirmed, paid
    paymentType: text("payment_type").notNull(), // monthly, once_off
    // Immutable payment-provider reference used to prevent replay attacks and
    // to prove a real Netcash payment triggered this record (unique per row).
    paymentReference: varchar("payment_reference", { length: 255 }).unique(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("school_referrals_partner_idx").on(table.partnerSchoolId)],
);

export const insertSchoolReferralSchema = createInsertSchema(
  schoolReferrals,
).omit({
  id: true,
  createdAt: true,
  commissionAmount: true,
});

export type InsertSchoolReferral = z.infer<typeof insertSchoolReferralSchema>;
export type SchoolReferral = typeof schoolReferrals.$inferSelect;

// Plans - Subscription tiers
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameAf: text("name_af").notNull(),
  monthlyPriceRands: integer("monthly_price_rands").notNull(),
  seasonPriceRands: integer("season_price_rands").notNull(),
  tier: integer("tier").notNull(),
  features: jsonb("features").notNull(),
  maxLevelEn: text("max_level_en").notNull(),
  maxLevelAf: text("max_level_af").notNull(),
  dailyQuestionsLimit: integer("daily_questions_limit").notNull(),
  dailyFullSolutionsLimit: integer("daily_full_solutions_limit").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Donations - Monthly donation tracking
export const donations = pgTable(
  "donations",
  {
    id: serial("id").primaryKey(),
    subscriptionId: integer("subscription_id")
      .notNull()
      .references(() => subscriptions.id),
    parentUserId: varchar("parent_user_id").notNull(),
    learnerUserId: varchar("learner_user_id").notNull(),
    schoolId: integer("school_id").references(() => partnerSchools.id),
    amountCents: integer("amount_cents").notNull().default(4000),
    month: text("month").notNull(),
    status: text("status").default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("donations_parent_month_idx").on(table.parentUserId, table.month),
  ],
);

// Digital Products
export const digitalProducts = pgTable("digital_products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameAf: text("name_af").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionAf: text("description_af").notNull(),
  priceRands: integer("price_rands").notNull(),
  category: text("category").notNull(),
  features: jsonb("features"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product Purchases
export const productPurchases = pgTable(
  "product_purchases",
  {
    id: serial("id").primaryKey(),
    parentUserId: varchar("parent_user_id").notNull(),
    learnerUserId: varchar("learner_user_id").notNull(),
    productId: integer("product_id")
      .notNull()
      .references(() => digitalProducts.id),
    amountCents: integer("amount_cents").notNull(),
    paymentRef: text("payment_ref"),
    paymentStatus: text("payment_status").default("pending"),
    purchasedAt: timestamp("purchased_at").defaultNow(),
    expiresAt: timestamp("expires_at"),
  },
  (table) => [
    index("product_purchases_parent_idx").on(table.parentUserId),
    index("product_purchases_learner_idx").on(table.learnerUserId),
  ],
);

// Terms - Academic terms within subjects
export const terms = pgTable(
  "terms",
  {
    id: serial("id").primaryKey(),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id),
    nameEn: text("name_en").notNull(),
    nameAf: text("name_af").notNull(),
    termNumber: integer("term_number").notNull(),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("terms_subject_idx").on(table.subjectId)],
);

// Support Tickets
export const supportTickets = pgTable(
  "support_tickets",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    category: text("category").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: text("status").default("open"),
    priority: text("priority").default("normal"),
    internalNotes: text("internal_notes"),
    assignedTo: varchar("assigned_to"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("support_tickets_user_idx").on(table.userId),
    index("support_tickets_status_idx").on(table.status),
  ],
);

// Help Articles
export const helpArticles = pgTable("help_articles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleEn: text("title_en").notNull(),
  titleAf: text("title_af").notNull(),
  contentEn: text("content_en").notNull(),
  contentAf: text("content_af").notNull(),
  category: text("category").notNull(),
  orderIndex: integer("order_index").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Study Plans
export const studyPlans = pgTable("study_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  dailyGoalMinutes: integer("daily_goal_minutes").default(30),
  weeklyTargets: jsonb("weekly_targets"),
  preferredStudyTime: text("preferred_study_time").default("afternoon"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Parent Links - Connect parents to learners
export const parentLinks = pgTable(
  "parent_links",
  {
    id: serial("id").primaryKey(),
    parentUserId: varchar("parent_user_id").notNull(),
    learnerUserId: varchar("learner_user_id"),
    activationToken: text("activation_token").notNull().unique(),
    learnerName: text("learner_name").notNull(),
    learnerPhone: text("learner_phone"),
    status: text("status").default("pending"),
    activatedAt: timestamp("activated_at"),
    reportEmailOptOut: boolean("report_email_opt_out").notNull().default(false),
    reportEmailOptOutAt: timestamp("report_email_opt_out_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("parent_links_parent_idx").on(table.parentUserId),
    index("parent_links_token_idx").on(table.activationToken),
  ],
);

// Security Events
export const securityEvents = pgTable(
  "security_events",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id"),
    eventType: text("event_type").notNull(),
    details: text("details"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("security_events_user_idx").on(table.userId),
    index("security_events_type_idx").on(table.eventType),
  ],
);

// Partners
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  type: text("type").notNull(),
  payoutRateCents: integer("payout_rate_cents").default(300),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payout Records
export const payoutRecords = pgTable(
  "payout_records",
  {
    id: serial("id").primaryKey(),
    partnerId: integer("partner_id")
      .notNull()
      .references(() => partners.id),
    month: text("month").notNull(),
    activeLearnerCount: integer("active_learner_count").notNull().default(0),
    rateCents: integer("rate_cents").notNull().default(300),
    totalAmountCents: integer("total_amount_cents").notNull().default(0),
    status: text("status").default("pending"),
    paidAt: timestamp("paid_at"),
    paidBy: varchar("paid_by"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("payout_records_partner_idx").on(table.partnerId),
    index("payout_records_month_idx").on(table.month),
  ],
);

// Audit Log
export const auditLog = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    adminUserId: varchar("admin_user_id").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    details: jsonb("details"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("audit_log_admin_idx").on(table.adminUserId),
    index("audit_log_entity_idx").on(table.entityType),
  ],
);

// Notifications
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    type: text("type").notNull(),
    titleEn: text("title_en").notNull(),
    titleAf: text("title_af").notNull(),
    messageEn: text("message_en").notNull(),
    messageAf: text("message_af").notNull(),
    channel: text("channel").default("push"),
    status: text("status").default("pending"),
    data: jsonb("data"),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("notifications_user_idx").on(table.userId),
    index("notifications_status_idx").on(table.status),
  ],
);

// Testimonials
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  school: text("school"),
  grade: integer("grade"),
  quoteEn: text("quote_en").notNull(),
  quoteAf: text("quote_af").notNull(),
  rating: integer("rating").default(5),
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User XP - Experience points and leveling
export const userXP = pgTable("user_xp", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  totalXP: integer("total_xp").default(0),
  currentLevel: text("current_level").default("starter"),
  streakDays: integer("streak_days").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActiveDate: date("last_active_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for new tables
export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

export const insertDigitalProductSchema = createInsertSchema(
  digitalProducts,
).omit({
  id: true,
  createdAt: true,
});

export const insertProductPurchaseSchema = createInsertSchema(
  productPurchases,
).omit({
  id: true,
  purchasedAt: true,
});

export const insertTermSchema = createInsertSchema(terms).omit({
  id: true,
  createdAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(
  supportTickets,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHelpArticleSchema = createInsertSchema(helpArticles).omit({
  id: true,
  createdAt: true,
});

export const insertStudyPlanSchema = createInsertSchema(studyPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParentLinkSchema = createInsertSchema(parentLinks).omit({
  id: true,
  createdAt: true,
});

export const insertSecurityEventSchema = createInsertSchema(
  securityEvents,
).omit({
  id: true,
  createdAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
});

export const insertPayoutRecordSchema = createInsertSchema(payoutRecords).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});

export const insertUserXPSchema = createInsertSchema(userXP).omit({
  id: true,
  updatedAt: true,
});

// Types for new tables
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;

export type DigitalProduct = typeof digitalProducts.$inferSelect;
export type InsertDigitalProduct = z.infer<typeof insertDigitalProductSchema>;

export type ProductPurchase = typeof productPurchases.$inferSelect;
export type InsertProductPurchase = z.infer<typeof insertProductPurchaseSchema>;

export type Term = typeof terms.$inferSelect;
export type InsertTerm = z.infer<typeof insertTermSchema>;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type HelpArticle = typeof helpArticles.$inferSelect;
export type InsertHelpArticle = z.infer<typeof insertHelpArticleSchema>;

export type StudyPlan = typeof studyPlans.$inferSelect;
export type InsertStudyPlan = z.infer<typeof insertStudyPlanSchema>;

export type ParentLink = typeof parentLinks.$inferSelect;
export type InsertParentLink = z.infer<typeof insertParentLinkSchema>;

export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;

export type PayoutRecord = typeof payoutRecords.$inferSelect;
export type InsertPayoutRecord = z.infer<typeof insertPayoutRecordSchema>;

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type InsertAuditLogEntry = z.infer<typeof insertAuditLogSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type UserXP = typeof userXP.$inferSelect;
export type InsertUserXP = z.infer<typeof insertUserXPSchema>;

// ============================================
// REFERRAL FRAUD DETECTION (T014)
// ============================================

export const referralFlags = pgTable(
  "referral_flags",
  {
    id: serial("id").primaryKey(),
    referrerId: varchar("referrer_id").notNull(),
    referredId: varchar("referred_id").notNull(),
    flagReason: text("flag_reason")
      .notNull()
      .$type<"same_ip" | "burst_pattern" | "low_engagement">(),
    flaggedAt: timestamp("flagged_at").defaultNow().notNull(),
    reviewed: boolean("reviewed").notNull().default(false),
    reviewedBy: varchar("reviewed_by"),
    commissionHalted: boolean("commission_halted").notNull().default(false),
    metadata: jsonb("metadata"),
  },
  (table) => [
    index("referral_flags_referrer_idx").on(table.referrerId),
    index("referral_flags_referred_idx").on(table.referredId),
    index("referral_flags_reviewed_idx").on(table.reviewed),
  ],
);

export const insertReferralFlagSchema = createInsertSchema(referralFlags).omit({
  id: true,
  flaggedAt: true,
});

export type ReferralFlag = typeof referralFlags.$inferSelect;
export type InsertReferralFlag = z.infer<typeof insertReferralFlagSchema>;

// ============================================
// JWT REFRESH TOKENS
// ============================================

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    revoked: boolean("revoked").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("refresh_tokens_user_idx").on(table.userId),
    index("refresh_tokens_hash_idx").on(table.tokenHash),
  ],
);

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({
  id: true,
  createdAt: true,
});

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;

// ============================================
// POPIA CONSENT RECORDS
// ============================================

export const consentRecords = pgTable(
  "consent_records",
  {
    id: serial("id").primaryKey(),
    parentId: varchar("parent_id").notNull(),
    learnerId: varchar("learner_id").notNull(),
    consentTimestamp: timestamp("consent_timestamp").defaultNow().notNull(),
    consentMethod: text("consent_method")
      .notNull()
      .$type<"whatsapp_link" | "in_app" | "admin">(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    revokedAt: timestamp("revoked_at"),
  },
  (table) => [
    index("consent_records_parent_idx").on(table.parentId),
    index("consent_records_learner_idx").on(table.learnerId),
  ],
);

export const insertConsentRecordSchema = createInsertSchema(
  consentRecords,
).omit({
  id: true,
  consentTimestamp: true,
});

export type ConsentRecord = typeof consentRecords.$inferSelect;
export type InsertConsentRecord = z.infer<typeof insertConsentRecordSchema>;

// ============================================
// CONSENT AUDIT LOG (POPIA compliance — Task #816)
// ============================================

export const consentLog = pgTable(
  "consent_log",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id"), // nullable: pre-auth / anonymous cookie events
    consentType: text("consent_type").notNull().$type<
      "terms_of_service" | "privacy_policy" | "cookie" | "parental" | "billing"
    >(),
    action: text("action").notNull().$type<"granted" | "revoked" | "updated">(),
    version: text("version").notNull().default(""),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("consent_log_user_idx").on(table.userId),
    index("consent_log_type_idx").on(table.consentType),
    index("consent_log_created_idx").on(table.createdAt),
  ],
);

export const insertConsentLogSchema = createInsertSchema(consentLog).omit({
  id: true,
  createdAt: true,
});
export type ConsentLog = typeof consentLog.$inferSelect;
export type InsertConsentLog = z.infer<typeof insertConsentLogSchema>;

// ============================================
// COIN WALLET SYSTEM
// ============================================

export const userCoins = pgTable(
  "user_coins",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull().unique(),
    balance: integer("balance").notNull().default(0),
    totalEarned: integer("total_earned").notNull().default(0),
    totalSpent: integer("total_spent").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("user_coins_user_idx").on(table.userId)],
);

export const coinTransactions = pgTable(
  "coin_transactions",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    amount: integer("amount").notNull(),
    type: text("type").notNull(),
    description: text("description"),
    referenceId: text("reference_id"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("coin_transactions_user_idx").on(table.userId)],
);

export const userUnlockedThemes = pgTable(
  "user_unlocked_themes",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    themeName: text("theme_name").notNull(),
    coinsCost: integer("coins_cost").notNull(),
    unlockedAt: timestamp("unlocked_at").defaultNow(),
  },
  (table) => [
    index("unlocked_themes_user_idx").on(table.userId),
    uniqueIndex("unlocked_themes_user_theme_idx").on(
      table.userId,
      table.themeName,
    ),
  ],
);

export const insertUserCoinsSchema = createInsertSchema(userCoins).omit({
  id: true,
  updatedAt: true,
});
export const insertCoinTransactionSchema = createInsertSchema(
  coinTransactions,
).omit({ id: true, createdAt: true });
export const insertUserUnlockedThemeSchema = createInsertSchema(
  userUnlockedThemes,
).omit({ id: true, unlockedAt: true });

export type UserCoins = typeof userCoins.$inferSelect;
export type InsertUserCoins = z.infer<typeof insertUserCoinsSchema>;
export type CoinTransaction = typeof coinTransactions.$inferSelect;
export type InsertCoinTransaction = z.infer<typeof insertCoinTransactionSchema>;
export type UserUnlockedTheme = typeof userUnlockedThemes.$inferSelect;
export type InsertUserUnlockedTheme = z.infer<
  typeof insertUserUnlockedThemeSchema
>;

// ============================================
// DBE INGESTION PIPELINE — DERIVED INTELLIGENCE ONLY
// NOTE: No raw DBE text is ever stored in these tables.
// Only derived metrics, counts, and structured intelligence are persisted.
// ============================================

export const dbeIngestionLog = pgTable(
  "dbe_ingestion_log",
  {
    id: serial("id").primaryKey(),
    subject: text("subject").notNull(),
    paperNumber: integer("paper_number").notNull(),
    year: integer("year").notNull(),
    session: text("session").notNull(),
    isMemo: boolean("is_memo").notNull().default(false),
    status: text("status")
      .notNull()
      .default("pending")
      .$type<"pending" | "completed" | "failed">(),
    ingestedAt: timestamp("ingested_at").defaultNow(),
    errorMessage: text("error_message"),
    contentHash: text("content_hash"),
    questionCount: integer("question_count"),
    verifiedAt: timestamp("verified_at"),
    verificationStatus: text("verification_status").$type<
      "passed" | "failed" | "pending"
    >(),
  },
  (table) => [
    index("dbe_ingestion_log_subject_year_idx").on(table.subject, table.year),
    index("dbe_ingestion_log_status_idx").on(table.status),
  ],
);

export const dbeVerbatimQuestions = pgTable(
  "dbe_verbatim_questions",
  {
    id: serial("id").primaryKey(),
    subject: text("subject").notNull(),
    year: integer("year").notNull(),
    session: text("session").notNull(),
    paperNumber: integer("paper_number").notNull(),
    language: text("language").notNull(),
    questionNumber: text("question_number").notNull(),
    questionText: text("question_text").notNull(),
    memoText: text("memo_text"),
    marks: integer("marks"),
    topic: text("topic"),
    cognitiveLevel: text("cognitive_level")
      .default("knowledge")
      .$type<"knowledge" | "comprehension" | "analysis" | "synthesis">(),
    contentHash: text("content_hash").notNull(),
    sourcePaperUrl: text("source_paper_url").notNull(),
    sourceMemoUrl: text("source_memo_url"),
    // Quality cross-check fields — combined overall
    qualityScore: integer("quality_score").default(0),
    accuracyFlag: text("accuracy_flag")
      .default("unscored")
      .$type<"clean" | "partial" | "garbled" | "unscored">(),
    predictiveRating: integer("predictive_rating").default(0),
    // Structured MCQ payload extracted at ingestion time. `mcqOptions` is null
    // for non-MCQ questions.
    mcqOptions: jsonb("mcq_options").$type<Array<{
      letter: "A" | "B" | "C" | "D" | "E";
      text: string;
    }> | null>(),
    // Verbatim source material this question depends on — scenario, extract,
    // paragraph, case study, text-rendered table. DBE attaches one stimulus
    // block to a parent question and asks several sub-questions about it, so
    // every sub-question of a group shares the parent's stimulus. NULL when
    // the question is self-contained.
    stimulusText: text("stimulus_text"),
    // TRUE when the question refers to material ("the extract below", "Diagram
    // 1") that could NOT be recovered from the source PDF — most often because
    // the stimulus is an image. Such a question is NOT answerable and must be
    // withheld or shown flagged, never served as a normal question.
    needsStimulus: boolean("needs_stimulus").notNull().default(false),
    // Memo-derived answer letter(s). Usually a single letter ("C"), but DBE
    // selection items legitimately have multi-letter answers marked in any
    // order — Hospitality 2025 P1 Q1.4.2 is "A C" for 2 marks, and Q1.4.1 is
    // "A C E H" for 4. Those are stored comma-joined ("A,C") and compared as a
    // SET, so order does not affect the mark. Parse with
    // `parseCorrectOptions()` rather than reading the first character.
    correctOption: text("correct_option"),
    // Question-text accuracy (separate from memo)
    questionQualityScore: integer("question_quality_score").default(0),
    questionAccuracyFlag: text("question_accuracy_flag")
      .default("unscored")
      .$type<"clean" | "partial" | "garbled" | "unscored">(),
    // Memo/answer accuracy (separate from question)
    memoQualityScore: integer("memo_quality_score").default(0),
    memoAccuracyFlag: text("memo_accuracy_flag")
      .default("unscored")
      .$type<"clean" | "partial" | "garbled" | "unscored">(),
    // Memo-Driven Marking Engine — structured mark scheme parsed from memo text.
    // Populated by server/memo-marker.ts at ingestion or on-demand. Used by
    // /api/exam/mini-mock and /api/exam/full for keyword-matched marking.
    markScheme: jsonb("mark_scheme").$type<{
      totalMarks: number;
      criteria: Array<{
        id: string;
        keywords: string[];
        acceptable: string[];
        marks: number;
        memoExcerpt: string;
      }>;
      partialRules: string[];
      denyPhrases?: string[];
      parsedAt: string;
    } | null>(),
    // Release gate (Task #394) — populated by server/release-gate.ts when a
    // (subject, year, paperNumber, session) tuple passes ≥98% memo + mark
    // scheme coverage. Learner endpoints filter on releasedAt IS NOT NULL.
    releasedAt: timestamp("released_at"),
    memoCoverage: integer("memo_coverage").default(0),
    markCoverage: integer("mark_coverage").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("dbe_verbatim_subject_year_idx").on(table.subject, table.year),
    index("dbe_verbatim_paper_idx").on(
      table.subject,
      table.year,
      table.paperNumber,
    ),
    index("dbe_verbatim_released_idx").on(
      table.subject,
      table.year,
      table.paperNumber,
      table.session,
    ),
  ],
);

export const dbeTopicCoverage = pgTable(
  "dbe_topic_coverage",
  {
    id: serial("id").primaryKey(),
    subject: text("subject").notNull(),
    year: integer("year").notNull(),
    paperNumber: integer("paper_number").notNull(),
    topicId: integer("topic_id").references(() => topics.id),
    coverageWeight: integer("coverage_weight").notNull().default(0),
    questionCount: integer("question_count").notNull().default(0),
    totalMarks: integer("total_marks").notNull().default(0),
    questionTypes: jsonb("question_types").notNull().default([]),
  },
  (table) => [
    index("dbe_topic_coverage_subject_year_idx").on(table.subject, table.year),
    index("dbe_topic_coverage_topic_idx").on(table.topicId),
  ],
);

export const dbeMemoRubrics = pgTable(
  "dbe_memo_rubrics",
  {
    id: serial("id").primaryKey(),
    subject: text("subject").notNull(),
    year: integer("year").notNull(),
    paperNumber: integer("paper_number").notNull(),
    topicId: integer("topic_id").references(() => topics.id),
    markAllocation: integer("mark_allocation").notNull().default(0),
    keyConcepts: jsonb("key_concepts").notNull().default([]),
    commonErrors: jsonb("common_errors").notNull().default([]),
    cognitiveLevel: text("cognitive_level")
      .notNull()
      .default("comprehension")
      .$type<"knowledge" | "comprehension" | "analysis" | "synthesis">(),
  },
  (table) => [
    index("dbe_memo_rubrics_subject_year_idx").on(table.subject, table.year),
    index("dbe_memo_rubrics_topic_idx").on(table.topicId),
  ],
);

export const dbeTopicFrequency = pgTable(
  "dbe_topic_frequency",
  {
    id: serial("id").primaryKey(),
    subject: text("subject").notNull(),
    topicId: integer("topic_id").references(() => topics.id),
    appearancesCount: integer("appearances_count").notNull().default(0),
    totalYearsSampled: integer("total_years_sampled").notNull().default(0),
    avgMarksPerAppearance: integer("avg_marks_per_appearance")
      .notNull()
      .default(0),
    frequencyRank: integer("frequency_rank").notNull().default(0),
  },
  (table) => [
    index("dbe_topic_frequency_subject_idx").on(table.subject),
    index("dbe_topic_frequency_topic_idx").on(table.topicId),
  ],
);

export const dbeSimulatedQuestions = pgTable(
  "dbe_simulated_questions",
  {
    id: serial("id").primaryKey(),
    subject: text("subject").notNull(),
    questionText: text("question_text").notNull(),
    memoText: text("memo_text"),
    marks: integer("marks"),
    cognitiveLevel: text("cognitive_level")
      .default("knowledge")
      .$type<"knowledge" | "application" | "higher_order">(),
    topic: text("topic"),
    qualityScore: integer("quality_score").default(0),
    capsAlignment: integer("caps_alignment").default(0),
    structureScore: integer("structure_score").default(0),
    metadata: jsonb("metadata").default({}),
    batchId: text("batch_id"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("dbe_simulated_subject_idx").on(table.subject),
    index("dbe_simulated_quality_idx").on(table.subject, table.qualityScore),
  ],
);

// Humanised, learner-facing flashcards produced by server/flashcard-generator.ts.
//
// NOTE: this table used to be filled by copying verbatim question_text → front
// and memo_text → back straight out of dbe_verbatim_questions. That put the
// examiner's marking rubric ("Die kandidaat ontwerp…", "KENMERKE •…", "[20]")
// in front of learners. Rows are now *synthesised* from those sources into
// atomic second-person recall cards and hard-validated before insert.
// One row per (card, language) — mirrors the topic_flashcards convention.
export const flashcards = pgTable(
  "flashcards",
  {
    id: serial("id").primaryKey(),
    subject: text("subject").notNull(),
    topic: text("topic"),
    language: varchar("language", { length: 8 }).notNull().default("en"),
    front: text("front").notNull(),
    back: text("back").notNull(),
    cardType: varchar("card_type", { length: 32 }).notNull().default("basic"),
    difficulty: text("difficulty").default("medium"),
    source: text("source").notNull().default("ai"),
    // Validation score (0–100) recorded at generation time. Cards below
    // MIN_QUALITY_SCORE are never inserted.
    qualityScore: integer("quality_score").default(0),
    // Provenance: the dbe_verbatim_questions row this card was distilled from,
    // so any card can be traced back to the real paper. Also used for resume.
    sourceQuestionId: integer("source_question_id"),
    metadata: jsonb("metadata").default({}),
    // ── Factual verification (server/content-verifier.ts) ────────────────────
    // `qualityScore` above measures whether a card is well-FORMED. It cannot
    // tell whether the card is TRUE: card #49 passed it while teaching LIFO as
    // a South African inventory valuation method, which CAPS does not teach and
    // IAS 2 prohibits. These columns hold the correctness verdicts. Advisory —
    // nothing here deletes or unpublishes a card.
    solverVerified: boolean("solver_verified"),
    solverAnswerMatch: numeric("solver_answer_match"),
    solverVerdict: text("solver_verdict").$type<"agree" | "disagree" | "uncertain">(),
    solverReason: text("solver_reason"),
    capsVerdict: text("caps_verdict").$type<"on_syllabus" | "off_syllabus" | "uncertain">(),
    capsConfidence: numeric("caps_confidence"),
    capsReason: text("caps_reason"),
    verificationFlag: text("verification_flag").$type<"ok" | "needs_review">(),
    verificationDetail: jsonb("verification_detail"),
    verificationModel: text("verification_model"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("flashcards_subject_idx").on(table.subject),
    index("flashcards_subject_lang_idx").on(table.subject, table.language),
    index("flashcards_source_question_idx").on(table.sourceQuestionId),
    index("flashcards_verification_idx").on(table.verificationFlag, table.capsVerdict),
  ],
);

export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = typeof flashcards.$inferInsert;

// Per-subject quiz template — assembled from simulated questions, used by
// the learner "Quick Quiz" flow. Independent from per-user daily challenges.
export const subjectQuizzes = pgTable(
  "subject_quizzes",
  {
    id: serial("id").primaryKey(),
    subject: text("subject").notNull(),
    questionsJson: jsonb("questions_json").notNull(),
    totalQuestions: integer("total_questions").notNull().default(10),
    generatedAt: timestamp("generated_at").defaultNow(),
  },
  (table) => [index("subject_quizzes_subject_idx").on(table.subject)],
);

// Per-subject daily challenge templates — pre-built so any learner can pick
// up a fresh, on-syllabus 5-question round for the subject they're studying.
export const subjectDailyChallenges = pgTable(
  "subject_daily_challenges",
  {
    id: serial("id").primaryKey(),
    subject: text("subject").notNull(),
    questionsJson: jsonb("questions_json").notNull(),
    totalQuestions: integer("total_questions").notNull().default(5),
    generatedAt: timestamp("generated_at").defaultNow(),
  },
  (table) => [index("subject_daily_challenges_subject_idx").on(table.subject)],
);

// Examiner & exam tips produced by server/content-generators.ts.
//   kind = 'examiner' → "what earns marks" per subject/topic, mined from the
//          verbatim bank + examiner_profiles (command words, mark-allocation
//          patterns, recurring stems, memo phrasing), with year/paper citations.
//   kind = 'exam'     → practical technique per subject: time-per-mark from the
//          real SACAI durations + paper mark totals, question-order strategy,
//          common mark-losing mistakes from the memos.
// Bilingual (tip/tipAf). `evidence` carries the citations/derivation so a tip
// can always be traced back to real DBE material. One row per generated tip.
export const subjectStudyTips = pgTable(
  "subject_study_tips",
  {
    id: serial("id").primaryKey(),
    subject: text("subject").notNull(),
    kind: varchar("kind", { length: 16 }).notNull(), // 'examiner' | 'exam'
    topic: text("topic"),                            // nullable — subject-wide when null
    paperNumber: integer("paper_number"),            // nullable — subject-wide when null
    category: varchar("category", { length: 48 }).notNull().default("general"),
    tip: text("tip").notNull(),
    tipAf: text("tip_af").notNull(),
    evidence: jsonb("evidence").default([]),         // [{year,paper,note}] / derivation
    sourceQuestionIds: integer("source_question_ids").array(),
    model: text("model"),
    generatedAt: timestamp("generated_at").defaultNow(),
  },
  (table) => [
    index("subject_study_tips_subject_kind_idx").on(table.subject, table.kind),
  ],
);

export type SubjectStudyTip = typeof subjectStudyTips.$inferSelect;
export type InsertSubjectStudyTip = typeof subjectStudyTips.$inferInsert;

export const userReferrals = pgTable(
  "user_referrals",
  {
    id: serial("id").primaryKey(),
    referrerId: text("referrer_id").notNull(),
    refereeEmail: text("referee_email"),
    refereeUserId: text("referee_user_id"),
    referralCode: text("referral_code"),
    // status: signed_up | converted | rewarded
    status: text("status").notNull().default("signed_up"),
    coinsAwarded: integer("coins_awarded").notNull().default(0),
    convertedAt: timestamp("converted_at"),
    rewardedAt: timestamp("rewarded_at"),
    attributedIp: varchar("attributed_ip"),
    attributedUserAgent: text("attributed_user_agent"),
    attributedFingerprint: varchar("attributed_fingerprint"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_referrals_referrer_idx").on(table.referrerId),
    uniqueIndex("user_referrals_referee_user_unique").on(table.refereeUserId),
    index("user_referrals_referrer_ip_idx").on(table.referrerId, table.attributedIp),
    index("user_referrals_referrer_created_idx").on(table.referrerId, table.createdAt),
    index("user_referrals_referrer_fp_idx").on(table.referrerId, table.attributedFingerprint),
  ],
);

export const insertUserReferralSchema = createInsertSchema(userReferrals).omit({
  id: true,
  createdAt: true,
});
export type UserReferral = typeof userReferrals.$inferSelect;

export const subjectBoosts = pgTable(
  "subject_boosts",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    subjectId: integer("subject_id").notNull(),
    activatedAt: timestamp("activated_at").defaultNow().notNull(),
  },
  (table) => [
    index("subject_boosts_user_subject_idx").on(table.userId, table.subjectId),
  ],
);
export type SubjectBoost = typeof subjectBoosts.$inferSelect;

// ============================================
// NSC TIMETABLE — EXAM-AWARE ENGINE (T114)
// All tables are additive — no existing tables modified.
// ============================================

// Official NSC exam timetable entries (Oct/Nov 2026 and future uploads)
export const nscTimetable = pgTable(
  "nsc_timetable",
  {
    id: serial("id").primaryKey(),
    year: integer("year").notNull(),
    session: text("session").notNull().default("November"), // October, November
    examDate: date("exam_date").notNull(),
    startTime: text("start_time").notNull().default("09:00"), // "09:00" or "14:00"
    durationMinutes: integer("duration_minutes").notNull().default(180),
    subjectName: text("subject_name").notNull(), // Official DBE subject name
    paperNumber: integer("paper_number").notNull().default(1),
    level: text("level").notNull().default("NSC"), // NSC, NSC-HG
    isNonExaminationDay: boolean("is_non_examination_day")
      .notNull()
      .default(false),
    notes: text("notes"),
    source: text("source").notNull().default("DBE_OFFICIAL"),
    createdAt: timestamp("created_at").defaultNow(),
    uploadedBy: varchar("uploaded_by"),
  },
  (table) => [
    index("nsc_timetable_year_session_idx").on(table.year, table.session),
    index("nsc_timetable_date_idx").on(table.examDate),
    index("nsc_timetable_subject_idx").on(table.subjectName),
  ],
);

// Maps official timetable subject names to internal BrainTrack subject IDs
export const timetableSubjectMapping = pgTable(
  "timetable_subject_mapping",
  {
    id: serial("id").primaryKey(),
    timetableSubjectName: text("timetable_subject_name").notNull(),
    braintrackSubjectId: integer("braintrack_subject_id").references(
      () => subjects.id,
    ),
    isConfirmed: boolean("is_confirmed").notNull().default(false),
    mappedBy: varchar("mapped_by"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("timetable_mapping_name_idx").on(table.timetableSubjectName),
    index("timetable_mapping_subject_idx").on(table.braintrackSubjectId),
  ],
);

// Per-learner materialised exam schedule (derived from selectedSubjects + timetable)
export const learnerExamSchedule = pgTable(
  "learner_exam_schedule",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    nscTimetableId: integer("nsc_timetable_id")
      .notNull()
      .references(() => nscTimetable.id),
    subjectId: integer("subject_id").references(() => subjects.id),
    subjectName: text("subject_name").notNull(),
    paperNumber: integer("paper_number").notNull(),
    examDate: date("exam_date").notNull(),
    startTime: text("start_time").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    daysRemaining: integer("days_remaining").notNull().default(0),
    urgencyState: text("urgency_state").notNull().default("build_mastery"),
    isPast: boolean("is_past").notNull().default(false),
    generatedAt: timestamp("generated_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("learner_exam_schedule_user_idx").on(table.userId),
    index("learner_exam_schedule_date_idx").on(table.userId, table.examDate),
    index("learner_exam_schedule_subject_idx").on(
      table.userId,
      table.subjectId,
    ),
  ],
);

// Audit trail for admin timetable uploads
export const timetableUploadLog = pgTable(
  "timetable_upload_log",
  {
    id: serial("id").primaryKey(),
    uploadedBy: varchar("uploaded_by").notNull(),
    filename: text("filename"),
    year: integer("year").notNull(),
    session: text("session").notNull(),
    entriesImported: integer("entries_imported").notNull().default(0),
    mappingsCreated: integer("mappings_created").notNull().default(0),
    schedulesRegenerated: integer("schedules_regenerated").notNull().default(0),
    status: text("status").notNull().default("success"),
    errorMessage: text("error_message"),
    rawPayload: jsonb("raw_payload"),
    uploadedAt: timestamp("uploaded_at").defaultNow(),
  },
  (table) => [
    index("timetable_upload_log_user_idx").on(table.uploadedBy),
    index("timetable_upload_log_year_idx").on(table.year, table.session),
  ],
);

// Types for timetable tables
export const insertNscTimetableSchema = createInsertSchema(nscTimetable).omit({
  id: true,
  createdAt: true,
});
export const insertTimetableSubjectMappingSchema = createInsertSchema(
  timetableSubjectMapping,
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLearnerExamScheduleSchema = createInsertSchema(
  learnerExamSchedule,
).omit({ id: true, generatedAt: true, updatedAt: true });
export const insertTimetableUploadLogSchema = createInsertSchema(
  timetableUploadLog,
).omit({ id: true, uploadedAt: true });

export type NscTimetable = typeof nscTimetable.$inferSelect;
export type InsertNscTimetable = z.infer<typeof insertNscTimetableSchema>;
export type TimetableSubjectMapping =
  typeof timetableSubjectMapping.$inferSelect;
export type InsertTimetableSubjectMapping = z.infer<
  typeof insertTimetableSubjectMappingSchema
>;
export type LearnerExamSchedule = typeof learnerExamSchedule.$inferSelect;
export type InsertLearnerExamSchedule = z.infer<
  typeof insertLearnerExamScheduleSchema
>;
export type TimetableUploadLog = typeof timetableUploadLog.$inferSelect;
export type InsertTimetableUploadLog = z.infer<
  typeof insertTimetableUploadLogSchema
>;

export type UrgencyState =
  | "build_mastery"
  | "focused_revision"
  | "exam_prep_mode"
  | "final_sprint";

// ============================================
// PRELIM EXAMS — School-set preliminary exam dates (Task #359)
// ============================================
// Prelims (Aug–Sept) are school-set rather than DBE-published. Either a
// learner enters their own dates or a school admin pushes a timetable to
// every learner linked to that school.
//
// Resolution rule (see server/nsc-timetable.ts → getEffectivePrelimExams):
//   1. Learner-source rows always win for a given (subjectId, paperNumber).
//   2. School-source rows fill in the gaps (cohort default).
export const prelimExams = pgTable(
  "prelim_exams",
  {
    id: serial("id").primaryKey(),
    source: text("source").notNull(), // 'learner' | 'school'
    userId: varchar("user_id"),       // set when source='learner'
    schoolId: integer("school_id"),   // set when source='school'
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id),
    subjectName: text("subject_name").notNull(),
    paperNumber: integer("paper_number").notNull().default(1),
    examDate: date("exam_date").notNull(),
    startTime: text("start_time").notNull().default("09:00"),
    durationMinutes: integer("duration_minutes").notNull().default(180),
    createdBy: varchar("created_by"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("prelim_exams_user_idx").on(table.userId),
    index("prelim_exams_school_idx").on(table.schoolId),
    index("prelim_exams_subject_idx").on(table.subjectId),
    uniqueIndex("prelim_exams_learner_unique_idx").on(
      table.userId,
      table.subjectId,
      table.paperNumber,
    ),
    uniqueIndex("prelim_exams_school_unique_idx").on(
      table.schoolId,
      table.subjectId,
      table.paperNumber,
    ),
  ],
);

export const insertPrelimExamSchema = createInsertSchema(prelimExams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type PrelimExam = typeof prelimExams.$inferSelect;
export type InsertPrelimExam = z.infer<typeof insertPrelimExamSchema>;

// ============================================
// EXAM COUNTDOWN REMINDERS — T148
// Dedup log + admin campaign settings
// ============================================

export const examCountdownReminders = pgTable(
  "exam_countdown_reminders",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    subjectName: text("subject_name").notNull(),
    examDate: date("exam_date").notNull(),
    paperNumber: integer("paper_number").notNull().default(1),
    milestoneDay: integer("milestone_day").notNull(),
    channel: text("channel").notNull().default("push"),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (table) => [
    index("exam_countdown_reminders_user_idx").on(table.userId),
    uniqueIndex("exam_countdown_reminders_dedup_idx").on(
      table.userId,
      table.subjectName,
      table.examDate,
      table.paperNumber,
      table.milestoneDay,
      table.channel,
    ),
  ],
);

export const reminderCampaignSettings = pgTable("reminder_campaign_settings", {
  id: serial("id").primaryKey(),
  cohortKey: text("cohort_key").notNull().unique(),
  enabled: boolean("enabled").notNull().default(true),
  milestones: jsonb("milestones")
    .$type<number[]>()
    .notNull()
    .default([30, 14, 7]),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
});

export const insertExamCountdownReminderSchema = createInsertSchema(
  examCountdownReminders,
).omit({ id: true, sentAt: true });
export const insertReminderCampaignSettingsSchema = createInsertSchema(
  reminderCampaignSettings,
).omit({ id: true, updatedAt: true });

export type ExamCountdownReminder = typeof examCountdownReminders.$inferSelect;
export type InsertExamCountdownReminder = z.infer<
  typeof insertExamCountdownReminderSchema
>;
export type ReminderCampaignSettings =
  typeof reminderCampaignSettings.$inferSelect;

// Link visit tracking — silent analytics for partner/channel links
export const linkVisits = pgTable(
  "link_visits",
  {
    id: serial("id").primaryKey(),
    source: text("source").notNull(),
    referralCode: text("referral_code"),
    userAgent: text("user_agent"),
    ip: text("ip"),
    visitedAt: timestamp("visited_at").defaultNow().notNull(),
  },
  (table) => [
    index("link_visits_source_idx").on(table.source),
    index("link_visits_visited_at_idx").on(table.visitedAt),
  ],
);
export type LinkVisit = typeof linkVisits.$inferSelect;

// Install banner event tracking — banner_shown | banner_dismissed | banner_installed
export const installBannerEvents = pgTable(
  "install_banner_events",
  {
    id: serial("id").primaryKey(),
    event: text("event").notNull(),
    btkSrc: text("btk_src"),
    btkRef: text("btk_ref"),
    userAgent: text("user_agent"),
    ip: text("ip"),
    occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  },
  (table) => [
    index("install_banner_events_event_idx").on(table.event),
    index("install_banner_events_btk_src_idx").on(table.btkSrc),
    index("install_banner_events_occurred_at_idx").on(table.occurredAt),
  ],
);
export type InstallBannerEvent = typeof installBannerEvents.$inferSelect;

export const insertDbeIngestionLogSchema = createInsertSchema(
  dbeIngestionLog,
).omit({
  id: true,
  ingestedAt: true,
});

export const insertDbeVerbatimQuestionSchema = createInsertSchema(
  dbeVerbatimQuestions,
).omit({
  id: true,
  createdAt: true,
});

export const insertDbeTopicCoverageSchema = createInsertSchema(
  dbeTopicCoverage,
).omit({
  id: true,
});

export const insertDbeMemoRubricSchema = createInsertSchema(
  dbeMemoRubrics,
).omit({
  id: true,
});

export const insertDbeTopicFrequencySchema = createInsertSchema(
  dbeTopicFrequency,
).omit({
  id: true,
});

export type DbeIngestionLog = typeof dbeIngestionLog.$inferSelect;
export type InsertDbeIngestionLog = z.infer<typeof insertDbeIngestionLogSchema>;

export type DbeTopicCoverage = typeof dbeTopicCoverage.$inferSelect;
export type InsertDbeTopicCoverage = z.infer<
  typeof insertDbeTopicCoverageSchema
>;

export type DbeMemoRubric = typeof dbeMemoRubrics.$inferSelect;
export type InsertDbeMemoRubric = z.infer<typeof insertDbeMemoRubricSchema>;

export type DbeTopicFrequency = typeof dbeTopicFrequency.$inferSelect;
export type InsertDbeTopicFrequency = z.infer<
  typeof insertDbeTopicFrequencySchema
>;

export type DbeVerbatimQuestion = typeof dbeVerbatimQuestions.$inferSelect;
export type InsertDbeVerbatimQuestion = z.infer<
  typeof insertDbeVerbatimQuestionSchema
>;

export const parentFeedback = pgTable("parent_feedback", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertParentFeedbackSchema = createInsertSchema(
  parentFeedback,
).pick({
  userId: true,
  rating: true,
  comment: true,
});

export type ParentFeedback = typeof parentFeedback.$inferSelect;
export type InsertParentFeedback = z.infer<typeof insertParentFeedbackSchema>;

// Product Config — admin-editable, published to landing page
export const productConfig = pgTable("product_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  config: jsonb("config").notNull(),
  published: boolean("published").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: text("updated_by"),
});

export const studySessions = pgTable(
  "study_sessions",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    subjectId: integer("subject_id").references(() => subjects.id),
    topicId: integer("topic_id").references(() => topics.id),
    context: text("context").notNull().default("study"),
    startedAt: timestamp("started_at").defaultNow(),
    endedAt: timestamp("ended_at"),
    durationSeconds: integer("duration_seconds"),
    questionsAnswered: integer("questions_answered").notNull().default(0),
  },
  (table) => [
    index("study_sessions_user_idx").on(table.userId),
    index("study_sessions_started_idx").on(table.userId, table.startedAt),
  ],
);

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
  startedAt: true,
});

export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;

// Wrong answers from boost quizzes — enables revision mode
export const boostQuizWrongAnswers = pgTable(
  "boost_quiz_wrong_answers",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id),
    questionText: text("question_text").notNull(),
    optionsJson: jsonb("options_json").notNull(),
    correctAnswer: varchar("correct_answer", { length: 5 }).notNull(),
    topic: text("topic"),
    explanation: text("explanation"),
    difficulty: varchar("difficulty", { length: 20 }),
    firstWrongAt: timestamp("first_wrong_at").defaultNow(),
    lastAttemptAt: timestamp("last_attempt_at"),
    timesWrong: integer("times_wrong").notNull().default(1),
    timesRetriedCorrectly: integer("times_retried_correctly")
      .notNull()
      .default(0),
  },
  (table) => [
    index("boost_wrong_user_subject_idx").on(table.userId, table.subjectId),
  ],
);

export type BoostQuizWrongAnswer = typeof boostQuizWrongAnswers.$inferSelect;

// Learner personalised study goals — daily question target and weekly active-day target
export const learnerGoals = pgTable(
  "learner_goals",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull().unique(),
    dailyQuestionsGoal: integer("daily_questions_goal").notNull().default(20),
    weeklyDaysGoal: integer("weekly_days_goal").notNull().default(5),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("learner_goals_user_idx").on(table.userId)],
);

export const insertLearnerGoalsSchema = createInsertSchema(learnerGoals).omit({
  id: true,
  updatedAt: true,
});

export type LearnerGoals = typeof learnerGoals.$inferSelect;
export type InsertLearnerGoals = z.infer<typeof insertLearnerGoalsSchema>;

// Platform-wide key-value config store (admin-managed)
export const systemConfig = pgTable("system_config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: text("updated_by"),
});

export type SystemConfig = typeof systemConfig.$inferSelect;

// Scheduled report email send log
export const reportEmailSendLog = pgTable(
  "report_email_send_log",
  {
    id: serial("id").primaryKey(),
    parentUserId: varchar("parent_user_id").notNull(),
    learnerUserId: varchar("learner_user_id"),
    learnerName: text("learner_name"),
    sentToEmail: text("sent_to_email"),
    status: text("status").notNull(), // "sent" | "failed" | "skipped"
    errorMessage: text("error_message"),
    trigger: text("trigger").default("scheduled"), // "scheduled" | "manual"
    sentAt: timestamp("sent_at").defaultNow(),
  },
  (table) => [
    index("resl_parent_idx").on(table.parentUserId),
    index("resl_sent_at_idx").on(table.sentAt),
  ],
);

export type ReportEmailSendLog = typeof reportEmailSendLog.$inferSelect;

// Task #815: Audit log of parent report-email opt-out / re-subscribe events.
// parent_links only stores the *current* opt-out flag + timestamp; this table
// preserves the full history so admins/support can answer "why didn't I get the
// email this week?" with concrete opt-out / re-subscribe timestamps.
export const reportEmailPreferenceLog = pgTable(
  "report_email_preference_log",
  {
    id: serial("id").primaryKey(),
    parentUserId: varchar("parent_user_id").notNull(),
    learnerUserId: varchar("learner_user_id"),
    learnerName: text("learner_name"),
    parentEmail: text("parent_email"),
    action: text("action").notNull(), // "opted_out" | "resubscribed"
    source: text("source").notNull().default("parent_dashboard"), // "parent_dashboard" | "unsubscribe_link"
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("repl_parent_idx").on(table.parentUserId),
    index("repl_created_at_idx").on(table.createdAt),
  ],
);

export type ReportEmailPreferenceLog = typeof reportEmailPreferenceLog.$inferSelect;

// ============================================
// GAMIFICATION & ANALYTICS — Phase 5
// ============================================

// Structured activity event log — feeds badge engine and analytics
export const activityEvents = pgTable(
  "activity_events",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    eventType: text("event_type").notNull(), // lesson_completed | quiz_submitted | score_recorded | study_session_started | study_session_ended | topic_mastered | report_viewed
    metadata: jsonb("metadata").default({}), // { subjectId, topicId, score, marksAwarded, marksAvailable, sessionId, ... }
    occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  },
  (table) => [
    index("activity_events_user_idx").on(table.userId),
    index("activity_events_type_idx").on(table.eventType),
    index("activity_events_occurred_idx").on(table.userId, table.occurredAt),
  ],
);

export const insertActivityEventSchema = createInsertSchema(
  activityEvents,
).omit({
  id: true,
  occurredAt: true,
});
export type ActivityEvent = typeof activityEvents.$inferSelect;
export type InsertActivityEvent = z.infer<typeof insertActivityEventSchema>;

// Per-subject personal bests — highest score and best streak per user×subject
export const personalBests = pgTable(
  "personal_bests",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id),
    highestScore: integer("highest_score").notNull().default(0), // 0-100 percent
    highestScoreAt: timestamp("highest_score_at"),
    bestStreak: integer("best_streak").notNull().default(0), // days
    totalSessions: integer("total_sessions").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("personal_bests_user_idx").on(table.userId),
    uniqueIndex("personal_bests_user_subject_idx").on(
      table.userId,
      table.subjectId,
    ),
  ],
);

export const insertPersonalBestSchema = createInsertSchema(personalBests).omit({
  id: true,
  updatedAt: true,
});
export type PersonalBest = typeof personalBests.$inferSelect;
export type InsertPersonalBest = z.infer<typeof insertPersonalBestSchema>;

// ============================================================
// LEARNER STORE — Store Items Catalogue & User Unlocks
// ============================================================

export const storeItems = pgTable(
  "store_items",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull().unique(),
    name: text("name").notNull(),
    nameAf: text("name_af").notNull(),
    description: text("description").notNull(),
    descriptionAf: text("description_af").notNull(),
    type: text("type").notNull(), // "theme" | "badge_frame" | "avatar_item" | "cosmetic"
    coinCost: integer("coin_cost").notNull().default(0),
    subscriptionTier: text("subscription_tier"), // null = free/earned, "basic" | "premium"
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("store_items_type_idx").on(table.type),
    index("store_items_active_idx").on(table.isActive),
  ],
);

export type StoreItem = typeof storeItems.$inferSelect;
export const insertStoreItemSchema = createInsertSchema(storeItems).omit({
  id: true,
  createdAt: true,
});
export type InsertStoreItem = z.infer<typeof insertStoreItemSchema>;

export const userUnlocks = pgTable(
  "user_unlocks",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    itemKey: text("item_key").notNull(),
    unlockMethod: text("unlock_method").notNull().default("coins"), // "coins" | "subscription" | "achievement"
    coinsSpent: integer("coins_spent").notNull().default(0),
    unlockedAt: timestamp("unlocked_at").defaultNow(),
  },
  (table) => [
    index("user_unlocks_user_idx").on(table.userId),
    uniqueIndex("user_unlocks_user_item_uniq").on(table.userId, table.itemKey),
  ],
);

export type UserUnlock = typeof userUnlocks.$inferSelect;
export const insertUserUnlockSchema = createInsertSchema(userUnlocks).omit({
  id: true,
  unlockedAt: true,
});
export type InsertUserUnlock = z.infer<typeof insertUserUnlockSchema>;

// Task #412 — one-time signed onboarding magic-links delivered to learners by SMS
export const onboardingLinkTokens = pgTable(
  "onboarding_link_tokens",
  {
    jti: varchar("jti").primaryKey(),
    userId: varchar("user_id").notNull(),
    sentTo: varchar("sent_to").notNull(),
    channel: varchar("channel").notNull().default("sms"),
    messageSid: varchar("message_sid"),
    deliveryStatus: varchar("delivery_status").notNull().default("pending"),
    deliveryError: text("delivery_error"),
    deliveryUpdatedAt: timestamp("delivery_updated_at"),
    // Task #771 — heartbeat from the SuccessScreen poll. If a Twilio failure
    // webhook arrives while this is recent (≤15s), we skip the push because
    // the open page will already paint the amber banner.
    lastPolledAt: timestamp("last_polled_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    claimedFromIp: varchar("claimed_from_ip"),
    claimedUserAgent: text("claimed_user_agent"),
    // Task #425 — tracks which retry generation this token belongs to.
    // 0 = original send, 1 = first auto-retry, 2 = second auto-retry.
    // The auto-retry job only picks up tokens where retryCount < 2.
    retryCount: integer("retry_count").notNull().default(0),
  },
  (table) => [
    index("onboarding_link_tokens_user_idx").on(table.userId),
    index("onboarding_link_tokens_created_at_idx").on(table.createdAt),
    index("onboarding_link_tokens_message_sid_idx").on(table.messageSid),
    index("onboarding_link_tokens_delivery_status_idx").on(table.deliveryStatus),
  ],
);
export type OnboardingLinkToken = typeof onboardingLinkTokens.$inferSelect;

// ============================================================
// DAILY FOCUS PUSH LOG — Task #381
// One row per (user_id, sent_date, channel) dispatch attempt.
// Prevents duplicate sends if the cron fires twice and feeds
// engagement analytics.
// ============================================================

export const dailyFocusPushLog = pgTable(
  "daily_focus_push_log",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    sentDate: date("sent_date").notNull(),
    channel: text("channel").notNull().default("learner"), // "learner" | "parent"
    payloadTag: text("payload_tag"),
    success: boolean("success").notNull().default(false),
    error: text("error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("dfpl_user_date_idx").on(table.userId, table.sentDate),
    index("dfpl_sent_date_idx").on(table.sentDate),
    uniqueIndex("dfpl_user_date_channel_uniq").on(table.userId, table.sentDate, table.channel),
  ],
);

export type DailyFocusPushLog = typeof dailyFocusPushLog.$inferSelect;
export const insertDailyFocusPushLogSchema = createInsertSchema(dailyFocusPushLog).omit({
  id: true,
  createdAt: true,
});
export type InsertDailyFocusPushLog = z.infer<typeof insertDailyFocusPushLogSchema>;

// ============================================================
// SCHOOL ENQUIRIES — Task #447
// Captures inbound school registrations from /school-onboarding
// so admins can review and action them.
// ============================================================

export const schoolEnquiries = pgTable(
  "school_enquiries",
  {
    id: serial("id").primaryKey(),
    schoolName: text("school_name").notNull(),
    contactPerson: text("contact_person").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    numLearners: integer("num_learners"),
    status: text("status").notNull().default("new"), // "new" | "contacted" | "converted" | "dismissed"
    adminNotes: text("admin_notes"),
    reviewedAt: timestamp("reviewed_at"),
    reviewedBy: varchar("reviewed_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("school_enquiries_status_idx").on(table.status),
    index("school_enquiries_created_at_idx").on(table.createdAt),
  ],
);

export type SchoolEnquiry = typeof schoolEnquiries.$inferSelect;
export const insertSchoolEnquirySchema = createInsertSchema(schoolEnquiries).omit({
  id: true,
  status: true,
  adminNotes: true,
  reviewedAt: true,
  reviewedBy: true,
  createdAt: true,
});
export type InsertSchoolEnquiry = z.infer<typeof insertSchoolEnquirySchema>;

// ============================================================
// ADMIN BILLING REMINDERS — Task #502
// Records every manual push-reminder dispatched from the
// Admin Billing page so admins can audit who was nudged, when,
// and whether the push was delivered.
// ============================================================

export const adminBillingReminders = pgTable(
  "admin_billing_reminders",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
    type: text("type").notNull().default("reminder"), // "reminder" | "outreach"
    result: jsonb("result").notNull().default({}), // { sent, failed, reason? }
    sentBy: varchar("sent_by").notNull(),
  },
  (table) => [
    index("abr_user_id_idx").on(table.userId),
    index("abr_sent_at_idx").on(table.sentAt),
    index("abr_sent_by_idx").on(table.sentBy),
  ],
);

export type AdminBillingReminder = typeof adminBillingReminders.$inferSelect;
export const insertAdminBillingReminderSchema = createInsertSchema(adminBillingReminders).omit({
  id: true,
  sentAt: true,
});
export type InsertAdminBillingReminder = z.infer<typeof insertAdminBillingReminderSchema>;

// ============================================================
// FLASHCARD PROGRESS — Task #604
// Persists SM2 spaced-repetition state (interval, ease factor,
// due date, last review) per user + card ID so progress is
// durable across devices and browser-data clears.
// localStorage remains the fast read-through cache; this table
// is the source of truth that gets merged in on session start.
// ============================================================

export const flashcardProgress = pgTable(
  "flashcard_progress",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    cardId: text("card_id").notNull(),
    n: integer("n").notNull().default(0),
    ef: integer("ef").notNull().default(250),
    interval: integer("interval").notNull().default(0),
    due: bigint("due", { mode: "number" }).notNull().default(0),
    lastReview: bigint("last_review", { mode: "number" }),
    reviewCount: integer("review_count").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("flashcard_progress_user_card_idx").on(table.userId, table.cardId),
    index("flashcard_progress_user_idx").on(table.userId),
  ],
);

export type FlashcardProgressRow = typeof flashcardProgress.$inferSelect;
export const insertFlashcardProgressSchema = createInsertSchema(flashcardProgress).omit({
  id: true,
  updatedAt: true,
});
export type InsertFlashcardProgress = z.infer<typeof insertFlashcardProgressSchema>;

// ============================================================
// TOPIC FLASHCARD POSITION — Task #741
// Stores the learner's last viewed card index + flipped state
// per (user, topic) so they can resume their place when they
// switch between phone, tablet, and laptop. localStorage stays
// as the fast/offline read-through cache.
// ============================================================

export const topicFlashcardPosition = pgTable(
  "topic_flashcard_position",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    topicId: integer("topic_id").notNull(),
    cardIdx: integer("card_idx").notNull().default(0),
    flipped: boolean("flipped").notNull().default(false),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("topic_flashcard_position_user_topic_idx").on(table.userId, table.topicId),
    index("topic_flashcard_position_user_idx").on(table.userId),
  ],
);

export type TopicFlashcardPositionRow = typeof topicFlashcardPosition.$inferSelect;

// =============================================================================
// PHONE OTP CODES — Phone-number change verification
// Codes are SHA-256-hashed (with random salt), expire in 10 minutes,
// rate-limited per user and per destination, and consumed on first match.
// =============================================================================

export const phoneOtpCodes = pgTable(
  "phone_otp_codes",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull(),
    phoneE164: text("phone_e164").notNull(),
    codeHash: text("code_hash").notNull(),
    codeSalt: text("code_salt").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    attempts: integer("attempts").notNull().default(0),
    consumedAt: timestamp("consumed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("phone_otp_codes_user_phone_idx").on(table.userId, table.phoneE164),
    index("phone_otp_codes_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export type PhoneOtpCode = typeof phoneOtpCodes.$inferSelect;

// NOTE — messaging_sends and users.whatsapp_opt_in
// ------------------------------------------------
// These are created by migration 0035_messaging_infra.sql but INTENTIONALLY
// not declared as Drizzle tables here. The pattern the earlier migration
// 0034_onboarding_vark_secondary tripped on — declaring a column in the ORM
// before the DDL exists on prod — took /api/user/journey, /api/subjects and
// /api/timetable/widgets to 500 for every learner. To keep the messaging
// scaffolding safe to deploy independently of the migration, all reads and
// writes to these objects go through raw SQL in
// server/messaging/{twilio-messaging.ts, nudge-cron.ts} and the
// PATCH /api/user/whatsapp-opt-in handler. When the column / table are not
// yet present, those code paths swallow the error and behave like the
// feature is off — never a 500 for an unrelated endpoint.
