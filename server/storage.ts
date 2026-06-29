import { 
  subjects, examPapers, onboardingResults, subscriptions, userProgress, tutorSessions,
  topics, questions, attempts, usage, activationCodes, examSessions, userStreaks, userBadges, userActiveSessions,
  topicMastery, simulatedExams, partnerSchools, schoolReferrals, dailyChallenges, tutorFeedback,
  userCoins, coinTransactions, userUnlockedThemes, pushSubscriptions, parentLinks, auditLog, consentRecords, consentLog,
  referralFlags, refreshTokens, subjectBoosts, prepScores, userXP, nscTimetable, timetableSubjectMapping, systemConfig, notifications,
  type PushSubscription,
  type Subject, type InsertSubject,
  type ExamPaper, type InsertExamPaper,
  type OnboardingResult, type InsertOnboardingResult,
  type Subscription, type InsertSubscription,
  type UserProgress, type InsertUserProgress,
  type TutorSession, type InsertTutorSession,
  type Topic, type InsertTopic,
  type Question, type InsertQuestion,
  type Attempt, type InsertAttempt,
  type Usage, type InsertUsage,
  type ActivationCode, type InsertActivationCode,
  type ExamSession, type InsertExamSession,
  type UserStreak, type InsertUserStreak,
  type UserBadge, type InsertUserBadge,
  type UserActiveSession, type InsertUserActiveSession,
  type TopicMastery, type InsertTopicMastery,
  type SimulatedExam, type InsertSimulatedExam,
  type MasteryBand,
  type PartnerSchool, type InsertPartnerSchool,
  type SchoolReferral, type InsertSchoolReferral,
  type DailyChallenge, type InsertDailyChallenge,
  type TutorFeedback, type InsertTutorFeedback,
  type UserCoins, type CoinTransaction,
  type ConsentRecord, type InsertConsentRecord,
  type ConsentLog, type InsertConsentLog,
  type ReferralFlag,
  type RefreshToken,
  type NscTimetable,
  type TimetableSubjectMapping,
} from "@shared/schema";
import { users } from "@shared/models/auth";
import { db, pool } from "./db";
import { eq, desc, and, sql, asc, isNull, inArray, gte, type SQL } from "drizzle-orm";
import { GRADE_12_SUBJECTS, CAPS_TOPICS } from "../client/src/lib/constants";
import { 
  calculateMasteryScore, 
  getMasteryBand, 
  updateMasteryAfterAttempt,
  CAPS_TOPIC_INTELLIGENCE 
} from "./caps-intelligence";

export interface IStorage {
  // Subjects
  getAllSubjects(): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  // Topics
  getTopicsBySubject(subjectId: number): Promise<Topic[]>;
  getTopic(id: number): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  // Exam Papers
  getExamPapersBySubject(subjectId: number): Promise<ExamPaper[]>;
  getExamPaper(id: number): Promise<ExamPaper | undefined>;
  createExamPaper(paper: InsertExamPaper): Promise<ExamPaper>;
  
  // Questions
  getQuestionsByPaper(examPaperId: number): Promise<Question[]>;
  getQuestionsByTopic(topicId: number): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  
  // Attempts
  getAttemptsByUser(userId: string): Promise<Attempt[]>;
  getAttemptsByQuestion(questionId: number): Promise<Attempt[]>;
  createAttempt(attempt: InsertAttempt): Promise<Attempt>;
  
  // Usage Limits
  getDailyUsage(userId: string, date: string): Promise<Usage | undefined>;
  incrementUsage(userId: string, type: 'tutor' | 'marking' | 'full_solution'): Promise<Usage>;
  
  // Activation Codes
  validateActivationCode(code: string): Promise<ActivationCode | undefined>;
  getActivationCodeByCode(code: string): Promise<ActivationCode | undefined>;
  useActivationCode(codeId: number): Promise<ActivationCode | undefined>;
  
  // Onboarding
  getOnboardingResult(userId: string): Promise<OnboardingResult | undefined>;
  createOnboardingResult(result: InsertOnboardingResult): Promise<OnboardingResult>;
  hasCompletedOnboarding(userId: string): Promise<boolean>;
  updateOnboardingSelectedSubjects(userId: string, selectedSubjects: number[]): Promise<OnboardingResult | undefined>;
  
  // Subscriptions
  getSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(sub: InsertSubscription): Promise<Subscription>;
  createSubscriptionWithCode(userId: string, codeId: number): Promise<Subscription>;
  createPendingSubscription(data: { userId: string; plan: string; priceRands: number; netcashCheckoutRef?: string; pendingMethod?: "debicheck" | "card"; paymentProvider?: string }): Promise<Subscription>;
  activateSubscription(userId: string, plan: string, priceRands: number): Promise<Subscription>;
  updateSubscriptionStatus(userId: string, status: string): Promise<Subscription | undefined>;
  adminToggleSubscription(userId: string, status: string): Promise<Subscription>;
  hasActiveSubscription(userId: string): Promise<boolean>;
  // Netcash recurring billing (Task #393)
  startTrial(userId: string, parentCell: string, learnerCell: string, plan: string, priceRands: number, parentApproval?: boolean): Promise<Subscription>;
  getSubscriptionByNetcashRef(reference: string): Promise<Subscription | undefined>;
  setNetcashIdentifiers(userId: string, ids: { subscriptionId?: string; mandateId?: string; cardToken?: string; billingMethod?: "debicheck" | "card"; nextRenewalAt?: Date; lastPaymentStatus?: string }): Promise<void>;
  // PayFast recurring billing (Task #440)
  getSubscriptionByPayfastToken(token: string): Promise<Subscription | undefined>;
  getSubscriptionByMPaymentId(mPaymentId: string): Promise<Subscription | undefined>;
  setPayfastIdentifiers(userId: string, ids: { token?: string; paymentId?: string; nextRenewalAt?: Date }): Promise<void>;
  recordRecurringSuccess(userId: string, nextRenewalAt: Date): Promise<void>;
  recordRecurringFailure(userId: string, gracePeriodEndsAt: Date): Promise<void>;
  markLapsed(userId: string): Promise<void>;
  markActiveSubscription(userId: string): Promise<void>;
  extendTrial(userId: string, days: number): Promise<{ newTrialEndsAt: Date }>;
  grantFreshTrial(userId: string): Promise<{ newTrialEndsAt: Date }>;
  enforceLapsedSubscriptions(): Promise<{ trialsLapsed: number; graceLapsed: number }>;
  getTrialReminderBatch(daysFromNow: 1 | 0): Promise<Subscription[]>;
  getTrialReminderEmailBatch(daysFromNow: 1 | 0): Promise<Subscription[]>;
  markTrialReminderEmailSent(userId: string, slot: "d13" | "d14"): Promise<void>;
  markTrialReminderSent(userId: string, slot: "d13" | "d14"): Promise<void>;
  getBillingOverview(filter?: { ending?: number; lapsedDays?: number; status?: string }): Promise<Array<Subscription & { userEmail: string | null; userName: string | null }>>;
  getBillingSummary(): Promise<{ active: number; trial: number; grace: number; lapsed: number; cancelled: number; mrr: number }>;
  
  // User Progress
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserProgressBySubject(userId: string, subjectId: number): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, subjectId: number, correct?: boolean): Promise<UserProgress>;
  getUserStats(userId: string): Promise<{
    papersCompleted: number;
    questionsAnswered: number;
    studyStreak: number;
    accuracy: number;
  }>;
  
  // Tutor Sessions
  createTutorSession(session: InsertTutorSession): Promise<TutorSession>;
  getTutorSession(id: number): Promise<TutorSession | undefined>;
  updateTutorSession(id: number, messages: any[]): Promise<TutorSession | undefined>;
  
  // Tutor Feedback
  createTutorFeedback(feedback: InsertTutorFeedback): Promise<TutorFeedback>;
  getTutorFeedbackBySession(sessionId: number): Promise<TutorFeedback[]>;
  
  // Exam Sessions (Exam Ready feature)
  createExamSession(session: Partial<InsertExamSession>): Promise<ExamSession>;
  getExamSession(id: number): Promise<ExamSession | undefined>;
  updateExamSession(id: number, updates: Partial<ExamSession>): Promise<ExamSession | undefined>;
  getExamSessionsByUser(userId: string): Promise<ExamSession[]>;
  getAllExamPapers(): Promise<ExamPaper[]>;
  getExamSessionCountBySubject(userId: string, subjectId: number, date: string): Promise<number>;
  getLatestExamSessionBySubject(userId: string, subjectId: number): Promise<ExamSession | undefined>;
  getExamSessionCountInLastHour(userId: string): Promise<number>;
  
  // Streaks and Badges
  getUserStreak(userId: string): Promise<UserStreak | undefined>;
  updateUserStreak(userId: string): Promise<UserStreak>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badgeCode: string): Promise<UserBadge | null>;
  hasBadge(userId: string, badgeCode: string): Promise<boolean>;
  checkAndAwardBadges(userId: string): Promise<UserBadge[]>;
  hasActivePowerUp(userId: string, itemKey: string): Promise<boolean>;
  consumePowerUp(userId: string, itemKey: string): Promise<void>;
  
  // Session Management - Prevent profile sharing
  createUserSession(userId: string, sessionToken: string, deviceInfo: { ip?: string; userAgent?: string; fingerprint?: string }): Promise<UserActiveSession>;
  validateSession(userId: string, sessionToken: string): Promise<boolean>;
  invalidateOtherSessions(userId: string, currentSessionToken: string): Promise<void>;
  getActiveSessionCount(userId: string): Promise<number>;
  
  // Topic Mastery (CAPS Intelligence)
  getTopicMastery(userId: string, topicId: number): Promise<TopicMastery | undefined>;
  getTopicMasteryBySubject(userId: string, subjectId: number): Promise<TopicMastery[]>;
  getAllTopicMastery(userId: string): Promise<TopicMastery[]>;
  createOrUpdateTopicMastery(userId: string, topicId: number, subjectId: number, updates: Partial<InsertTopicMastery>): Promise<TopicMastery>;
  updateMasteryAfterAttempt(userId: string, topicId: number, subjectId: number, attemptData: {
    isCorrect: boolean;
    marksAwarded: number;
    marksAvailable: number;
    timeSpentSeconds: number;
    expectedTimeSeconds: number;
    errorType: string | null;
  }): Promise<TopicMastery>;
  getWeakTopics(userId: string, limit?: number): Promise<TopicMastery[]>;
  getTopicsForReview(userId: string): Promise<TopicMastery[]>;
  
  // Subject Boost & Rescue Packs
  getSubjectBoostStatus(userId: string, subjectId: number): Promise<boolean>;
  activateSubjectBoost(userId: string, subjectId: number): Promise<void>;
  getTriggeredRescuePacks(userId: string): Promise<any[]>;
  triggerRescuePack(userId: string, type: 'topic' | 'subject', referenceId: number): Promise<void>;

  // Seed data
  getSimulatedExamsBySubject(subjectId: number): Promise<SimulatedExam[]>;
  getSimulatedExam(id: number): Promise<SimulatedExam | undefined>;
  createSimulatedExam(exam: InsertSimulatedExam): Promise<SimulatedExam>;
  
  // Partner Schools
  getPartnerSchools(): Promise<PartnerSchool[]>;
  getPartnerSchoolById(id: number): Promise<PartnerSchool | undefined>;
  getPartnerSchoolByCode(code: string): Promise<PartnerSchool | undefined>;
  createPartnerSchool(school: InsertPartnerSchool): Promise<PartnerSchool>;
  updatePartnerSchoolStats(id: number, revenue: number): Promise<void>;
  
  // School Referrals
  getSchoolReferrals(partnerSchoolId: number): Promise<SchoolReferral[]>;
  createSchoolReferral(referral: Omit<InsertSchoolReferral, 'commissionAmount'>, commissionAmount: number, paymentReference?: string): Promise<SchoolReferral>;
  updateReferralStatus(id: number, status: string): Promise<void>;
  
  // Daily Challenges
  getDailyChallenge(userId: string, date: string): Promise<DailyChallenge | undefined>;
  createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge>;
  completeDailyChallenge(id: number, answersJson: any, score: number, timeSpentSeconds: number): Promise<DailyChallenge | undefined>;
  getDailyChallengeHistory(userId: string, limit?: number): Promise<DailyChallenge[]>;
  getDailyChallengeStreak(userId: string): Promise<number>;
  
  // Seed data
  seedSubjects(): Promise<void>;
  seedExamPapers(): Promise<void>;
  seedMockExams(): Promise<void>;
  seedTestUsers(): Promise<void>;
  seedNscTimetable(): Promise<void>;

  // NSC Timetable
  getNscTimetable(filters?: { week?: number; sessionTime?: string; subjectName?: string }): Promise<NscTimetable[]>;
  getTimetableSubjectMappings(): Promise<TimetableSubjectMapping[]>;
  updateTimetableSubjectMapping(id: number, subjectId: number | null): Promise<TimetableSubjectMapping>;
  resolveNscSubjectMappings(): Promise<{ resolved: number; unmatched: string[] }>;

  // Coin Wallet
  getUserCoins(userId: string): Promise<UserCoins>;
  awardCoins(userId: string, amount: number, type: string, description: string, referenceId?: string): Promise<UserCoins>;
  spendCoins(userId: string, amount: number, type: string, description: string, referenceId?: string): Promise<UserCoins>;
  getCoinTransactions(userId: string): Promise<CoinTransaction[]>;
  // XP System
  awardXP(userId: string, amount: number, reason?: string): Promise<{ totalXP: number; currentLevel: string; levelledUp: boolean }>;

  // Theme Unlocks
  getUserUnlockedThemes(userId: string): Promise<string[]>;
  unlockTheme(userId: string, themeName: string, coinsCost: number): Promise<void>;

  // Push Notifications
  savePushSubscription(userId: string, endpoint: string, p256dh: string, auth: string): Promise<PushSubscription>;
  getPushSubscriptions(userId: string): Promise<PushSubscription[]>;
  getAllActivePushSubscriptions(): Promise<PushSubscription[]>;
  deletePushSubscription(userId: string, endpoint: string): Promise<void>;
  disablePushSubscription(userId: string, endpoint: string): Promise<void>;

  // POPIA Consent Records
  createConsentRecord(data: InsertConsentRecord): Promise<ConsentRecord>;
  revokeConsent(id: number): Promise<ConsentRecord | undefined>;
  getConsentRecord(learnerId: string): Promise<ConsentRecord | undefined>;

  // Account Lockout (Authentication Hardening)
  incrementLoginFailures(userId: string): Promise<{ locked: boolean; lockedUntil: Date | null }>;
  resetLoginFailures(userId: string): Promise<void>;
  isAccountLocked(userId: string): Promise<{ locked: boolean; lockedUntil: Date | null }>;
  forceUnlockAccount(userId: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;

  // RBAC Helpers
  isParentOfLearner(parentId: string, learnerId: string): Promise<boolean>;
  getLearnersForParent(parentId: string): Promise<Array<{ learnerUserId: string; learnerName: string }>>;
  insertAuditLog(entry: { userId: string; action: string; target?: string; metadata?: any; ipAddress?: string }): Promise<void>;

  // Consent Audit Log (POPIA — Task #816)
  insertConsentLog(payload: InsertConsentLog): Promise<ConsentLog>;
  getConsentLog(userId: string): Promise<ConsentLog[]>;

  // Partner Attribution (immutable field — admin-only update)
  updateFirstTouchSource(targetUserId: string, source: string): Promise<void>;

  // Referral Fraud Detection (T014)
  createReferralFlag(data: {
    referrerId: string;
    referredId: string;
    flagReason: "same_ip" | "burst_pattern" | "low_engagement";
    commissionHalted?: boolean;
    metadata?: Record<string, any>;
  }): Promise<ReferralFlag>;
  getReferralFlags(filters?: { reviewed?: boolean; referrerId?: string }): Promise<ReferralFlag[]>;
  markReferralFlagReviewed(flagId: number, reviewedBy: string): Promise<ReferralFlag | undefined>;
  incrementReferralFlagBlockedAttempts(referrerId: string): Promise<void>;
  getReferralCountInWindow(referrerId: string, windowDays: number): Promise<number>;
  hasExistingReferralFlag(referrerId: string, referredId: string, reason: string): Promise<boolean>;

  // Notifications
  createNotification(data: { userId: string; type: string; titleEn: string; titleAf: string; messageEn: string; messageAf: string; channel?: string; data?: any }): Promise<any>;
  getNotificationsForUser(userId: string, limit?: number): Promise<any[]>;

  // JWT Refresh Tokens
  createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken>;
  getRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | undefined>;
  revokeRefreshToken(tokenHash: string): Promise<void>;
  revokeAllRefreshTokens(userId: string): Promise<void>;
  revokeRefreshTokenAtomic(tokenHash: string): Promise<RefreshToken | undefined>;

  // Browser Sessions (connect-pg-simple `sessions` table)
  deleteUserSessions(userId: string): Promise<number>;

  // System Config (key-value platform settings)
  getSystemConfigValue(key: string): Promise<unknown | undefined>;
  setSystemConfigValue(key: string, value: unknown, updatedBy?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Subjects
  async getAllSubjects(): Promise<Subject[]> {
    return db.select().from(subjects).orderBy(subjects.name);
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [created] = await db.insert(subjects).values(subject).returning();
    return created;
  }

  // Topics
  async getTopicsBySubject(subjectId: number): Promise<Topic[]> {
    return db.select().from(topics)
      .where(eq(topics.subjectId, subjectId))
      .orderBy(topics.orderIndex);
  }

  async getTopic(id: number): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.id, id));
    return topic;
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const [created] = await db.insert(topics).values(topic).returning();
    return created;
  }

  // Exam Papers
  async getExamPapersBySubject(subjectId: number): Promise<ExamPaper[]> {
    return db.select().from(examPapers)
      .where(eq(examPapers.subjectId, subjectId))
      .orderBy(desc(examPapers.year));
  }

  async getExamPaper(id: number): Promise<ExamPaper | undefined> {
    const [paper] = await db.select().from(examPapers).where(eq(examPapers.id, id));
    return paper;
  }

  async createExamPaper(paper: InsertExamPaper): Promise<ExamPaper> {
    const [created] = await db.insert(examPapers).values(paper).returning();
    return created;
  }

  // Questions
  async getQuestionsByPaper(examPaperId: number): Promise<Question[]> {
    const direct = await db.select().from(questions)
      .where(eq(questions.examPaperId, examPaperId))
      .orderBy(questions.questionNumber);
    if (direct.length > 0) return direct;

    // Fallback: legacy `questions` table is empty for this paper. Surface
    // simulated DBE questions for the same subject so practice mode is usable
    // until verbatim ingestion catches up.
    const { dbeSimulatedQuestions, examPapers, subjects } = await import("@shared/schema");
    const [paper] = await db
      .select({ subjectId: examPapers.subjectId })
      .from(examPapers)
      .where(eq(examPapers.id, examPaperId))
      .limit(1);
    if (!paper?.subjectId) return [];

    const [subject] = await db
      .select({ name: subjects.name })
      .from(subjects)
      .where(eq(subjects.id, paper.subjectId))
      .limit(1);
    if (!subject?.name) return [];

    const sims = await db.select().from(dbeSimulatedQuestions)
      .where(eq(dbeSimulatedQuestions.subject, subject.name))
      .orderBy(desc(dbeSimulatedQuestions.qualityScore))
      .limit(40);

    return sims.map((q, idx) => ({
      id: q.id,
      examPaperId,
      topicId: null,
      questionNumber: String(idx + 1),
      questionText: q.questionText,
      memoText: q.memoText ?? "",
      marks: q.marks ?? null,
      difficulty: null,
      cognitiveLevel: q.cognitiveLevel ?? "application",
      commandVerbs: null,
      markingSteps: null,
      alternativeAnswers: null,
      commonErrors: null,
      examinerNotes: null,
      isSimulated: true,
      dbeReferenceYear: null,
      createdAt: q.createdAt,
    })) as Question[];
  }

  async getQuestionsByTopic(topicId: number): Promise<Question[]> {
    return db.select().from(questions)
      .where(eq(questions.topicId, topicId));
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [created] = await db.insert(questions).values(question).returning();
    return created;
  }

  // Attempts
  async getAttemptsByUser(userId: string): Promise<Attempt[]> {
    return db.select().from(attempts)
      .where(eq(attempts.userId, userId))
      .orderBy(desc(attempts.createdAt));
  }

  async getAttemptsByQuestion(questionId: number): Promise<Attempt[]> {
    return db.select().from(attempts)
      .where(eq(attempts.questionId, questionId));
  }

  async createAttempt(attempt: InsertAttempt): Promise<Attempt> {
    const [created] = await db.insert(attempts).values(attempt).returning();
    return created;
  }

  // Usage Limits
  async getDailyUsage(userId: string, date: string): Promise<Usage | undefined> {
    const [usageRecord] = await db.select().from(usage)
      .where(and(eq(usage.userId, userId), eq(usage.usageDate, date)));
    return usageRecord;
  }

  async incrementUsage(userId: string, type: 'tutor' | 'marking' | 'full_solution'): Promise<Usage> {
    // Task #819 step 2 — atomic increment via single ON CONFLICT UPSERT.
    // Eliminates the read-modify-write race that previously allowed concurrent
    // tutor calls to land on the same row, increment from the same baseline,
    // and lose one of the increments (allowing learners to over-consume their
    // daily quota under bursty load).
    const today = new Date().toISOString().split('T')[0];
    const newRow: any = { userId, usageDate: today, tutorCount: 0, markingCount: 0, fullSolutionCount: 0 };
    if (type === 'tutor') newRow.tutorCount = 1;
    if (type === 'marking') newRow.markingCount = 1;
    if (type === 'full_solution') newRow.fullSolutionCount = 1;

    const setExpr: Record<string, any> = {};
    if (type === 'tutor') setExpr.tutorCount = sql`${usage.tutorCount} + 1`;
    if (type === 'marking') setExpr.markingCount = sql`${usage.markingCount} + 1`;
    if (type === 'full_solution') setExpr.fullSolutionCount = sql`${usage.fullSolutionCount} + 1`;

    const [row] = await db
      .insert(usage)
      .values(newRow)
      .onConflictDoUpdate({
        target: [usage.userId, usage.usageDate],
        set: setExpr,
      })
      .returning();
    return row;
  }

  // Activation Codes
  async validateActivationCode(code: string): Promise<ActivationCode | undefined> {
    const [codeRecord] = await db.select().from(activationCodes)
      .where(and(
        eq(activationCodes.code, code),
        eq(activationCodes.status, 'active')
      ));
    
    if (!codeRecord) return undefined;
    if (codeRecord.currentUses >= codeRecord.maxUses) return undefined;
    if (codeRecord.expiresAt && new Date(codeRecord.expiresAt) < new Date()) return undefined;
    
    return codeRecord;
  }

  async getActivationCodeByCode(code: string): Promise<ActivationCode | undefined> {
    const [codeRecord] = await db.select().from(activationCodes)
      .where(eq(activationCodes.code, code.toUpperCase()));
    return codeRecord;
  }

  async useActivationCode(codeId: number): Promise<ActivationCode | undefined> {
    // Task #819 step 2 — single atomic increment that also enforces the
    // maxUses cap in the same statement. Prevents the previous race where two
    // simultaneous redemptions could both pass the validateActivationCode
    // check and both successfully increment currentUses past maxUses.
    const [updated] = await db.update(activationCodes)
      .set({ currentUses: sql`${activationCodes.currentUses} + 1` })
      .where(and(
        eq(activationCodes.id, codeId),
        sql`${activationCodes.currentUses} < ${activationCodes.maxUses}`,
      ))
      .returning();
    return updated;
  }

  // Onboarding
  async getOnboardingResult(userId: string): Promise<OnboardingResult | undefined> {
    const [result] = await db.select().from(onboardingResults)
      .where(eq(onboardingResults.userId, userId));
    return result;
  }

  async createOnboardingResult(result: InsertOnboardingResult): Promise<OnboardingResult> {
    const [created] = await db.insert(onboardingResults).values(result).returning();
    return created;
  }

  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const result = await this.getOnboardingResult(userId);
    return !!result;
  }

  async updateOnboardingSelectedSubjects(userId: string, selectedSubjects: number[]): Promise<OnboardingResult | undefined> {
    const [updated] = await db.update(onboardingResults)
      .set({ selectedSubjects })
      .where(eq(onboardingResults.userId, userId))
      .returning();
    return updated;
  }

  // Subscriptions
  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
    return sub;
  }

  async createSubscription(sub: InsertSubscription): Promise<Subscription> {
    const [created] = await db.insert(subscriptions).values({
      ...sub,
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }).returning();
    return created;
  }

  async createSubscriptionWithCode(userId: string, codeId: number): Promise<Subscription> {
    // Task #819 step 1 — atomic redemption: the activation-code use-count
    // bump AND the subscription INSERT must commit together. If the INSERT
    // fails the use-count rolls back, so a learner is never charged a
    // redemption that did not produce a subscription.
    return await db.transaction(async (tx) => {
      const [usedCode] = await tx.update(activationCodes)
        .set({ currentUses: sql`${activationCodes.currentUses} + 1` })
        .where(and(
          eq(activationCodes.id, codeId),
          sql`${activationCodes.currentUses} < ${activationCodes.maxUses}`,
        ))
        .returning();
      if (!usedCode) {
        throw new Error("Activation code is no longer available (already fully redeemed).");
      }
      const [created] = await tx.insert(subscriptions).values({
        userId,
        plan: "monthly",
        priceRands: 0,
        activationCodeId: codeId,
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }).returning();
      return created;
    });
  }

  async createPendingSubscription(data: { userId: string; plan: string; priceRands: number; netcashCheckoutRef?: string; pendingMethod?: "debicheck" | "card"; paymentProvider?: string }): Promise<Subscription> {
    const existing = await this.getSubscription(data.userId);
    // CRITICAL: do NOT downgrade an active trial to "pending". Trial users
    // who pick a payment method mid-trial keep full access until trialEndsAt.
    // We only flip to "pending" for brand-new subs that have never had any
    // status (i.e. inserts), or for subs in a terminal failed/lapsed state
    // that are retrying checkout.
    const preserveStatus = existing && (existing.status === "trial" || existing.status === "active");
    const setData: Record<string, unknown> = {
      plan: data.plan,
      priceRands: data.priceRands,
      updatedAt: new Date(),
    };
    if (!preserveStatus) setData.status = "pending";
    if (data.netcashCheckoutRef) setData.netcashCheckoutRef = data.netcashCheckoutRef;
    if (data.pendingMethod) setData.pendingMethod = data.pendingMethod;
    if (data.paymentProvider) setData.paymentProvider = data.paymentProvider;

    if (existing) {
      const [updated] = await db.update(subscriptions)
        .set(setData)
        .where(eq(subscriptions.userId, data.userId))
        .returning();
      return updated;
    }

    const [created] = await db.insert(subscriptions).values({
      userId: data.userId,
      plan: data.plan,
      priceRands: data.priceRands,
      netcashCheckoutRef: data.netcashCheckoutRef,
      pendingMethod: data.pendingMethod,
      paymentProvider: data.paymentProvider || "netcash",
      status: "pending",
    }).returning();
    return created;
  }

  // Enforce lifecycle transitions to "lapsed":
  //   1. Trials whose trialEndsAt has passed AND who never set a payment method.
  //   2. Subs in grace whose gracePeriodEndsAt has passed without a successful renewal.
  // Returns the count of rows marked lapsed in each bucket.
  async enforceLapsedSubscriptions(): Promise<{ trialsLapsed: number; graceLapsed: number }> {
    const now = new Date();
    const trialsLapsedRows = await db.update(subscriptions)
      .set({ status: "lapsed", billingMethod: "lapsed", updatedAt: now })
      .where(and(
        eq(subscriptions.status, "trial"),
        sql`${subscriptions.trialEndsAt} IS NOT NULL`,
        sql`${subscriptions.trialEndsAt} < ${now}`,
        sql`(${subscriptions.netcashMandateId} IS NULL AND ${subscriptions.netcashCardToken} IS NULL)`,
      ))
      .returning({ id: subscriptions.id });
    const graceLapsedRows = await db.update(subscriptions)
      .set({ status: "lapsed", billingMethod: "lapsed", updatedAt: now })
      .where(and(
        eq(subscriptions.status, "grace"),
        sql`${subscriptions.gracePeriodEndsAt} IS NOT NULL`,
        sql`${subscriptions.gracePeriodEndsAt} < ${now}`,
      ))
      .returning({ id: subscriptions.id });
    return { trialsLapsed: trialsLapsedRows.length, graceLapsed: graceLapsedRows.length };
  }

  async activateSubscription(userId: string, plan: string, priceRands: number): Promise<Subscription> {
    const existing = await this.getSubscription(userId);
    const tenMonthsFromNow = new Date(Date.now() + 10 * 30 * 24 * 60 * 60 * 1000);
    
    if (existing) {
      const [updated] = await db.update(subscriptions)
        .set({
          plan,
          priceRands,
          status: "active",
          startDate: new Date(),
          endDate: tenMonthsFromNow,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(subscriptions).values({
      userId,
      plan,
      priceRands,
      status: "active",
      startDate: new Date(),
      endDate: tenMonthsFromNow,
    }).returning();
    return created;
  }

  async getSubscriptionByNetcashRef(reference: string): Promise<Subscription | undefined> {
    const [row] = await db.select().from(subscriptions)
      .where(eq(subscriptions.netcashCheckoutRef, reference))
      .limit(1);
    return row;
  }

  async startTrial(userId: string, parentCell: string, learnerCell: string, plan: string, priceRands: number, parentApproval?: boolean): Promise<Subscription> {
    const existing = await this.getSubscription(userId);
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const consentFields = parentApproval
      ? { parentConsent: true, parentConsentDate: new Date() }
      : {};
    if (existing) {
      const [updated] = await db.update(subscriptions)
        .set({
          plan,
          priceRands,
          status: "trial",
          billingMethod: "trial",
          parentCell,
          learnerCell,
          ...consentFields,
          startDate: existing.startDate ?? new Date(),
          trialEndsAt,
          endDate: trialEndsAt,
          paymentProvider: "netcash",
          // Reset reminder dedup flags so a re-entered trial gets a fresh
          // Day-13 / Day-14 push + email reminder cycle.
          trialReminderD13Sent: false,
          trialReminderD14Sent: false,
          trialReminderEmailD13Sent: false,
          trialReminderEmailD14Sent: false,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(subscriptions).values({
      userId,
      plan,
      priceRands,
      status: "trial",
      billingMethod: "trial",
      parentCell,
      learnerCell,
      ...consentFields,
      startDate: new Date(),
      trialEndsAt,
      endDate: trialEndsAt,
      paymentProvider: "netcash",
    }).returning();
    return created;
  }

  async setNetcashIdentifiers(userId: string, ids: { subscriptionId?: string; mandateId?: string; cardToken?: string; billingMethod?: "debicheck" | "card"; nextRenewalAt?: Date; lastPaymentStatus?: string }): Promise<void> {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (ids.subscriptionId) set.netcashSubscriptionId = ids.subscriptionId;
    if (ids.mandateId) set.netcashMandateId = ids.mandateId;
    if (ids.cardToken) set.netcashCardToken = ids.cardToken;
    if (ids.billingMethod) set.billingMethod = ids.billingMethod;
    if (ids.nextRenewalAt) set.nextRenewalAt = ids.nextRenewalAt;
    if (ids.lastPaymentStatus) set.lastPaymentStatus = ids.lastPaymentStatus;
    await db.update(subscriptions).set(set).where(eq(subscriptions.userId, userId));
  }

  // PayFast recurring billing (Task #440)
  async getSubscriptionByPayfastToken(token: string): Promise<Subscription | undefined> {
    const [row] = await db.select().from(subscriptions)
      .where(eq(subscriptions.payfastSubscriptionId, token))
      .limit(1);
    return row;
  }

  async getSubscriptionByMPaymentId(mPaymentId: string): Promise<Subscription | undefined> {
    // m_payment_id is stored as netcashCheckoutRef for PayFast flows
    // (reusing the existing column — no migration required per task spec).
    const [row] = await db.select().from(subscriptions)
      .where(eq(subscriptions.netcashCheckoutRef, mPaymentId))
      .limit(1);
    return row;
  }

  async setPayfastIdentifiers(userId: string, ids: { token?: string; paymentId?: string; nextRenewalAt?: Date }): Promise<void> {
    const set: Record<string, unknown> = {
      paymentProvider: "payfast",
      billingMethod: "card",
      updatedAt: new Date(),
    };
    if (ids.token) set.payfastSubscriptionId = ids.token;
    if (ids.nextRenewalAt) set.nextRenewalAt = ids.nextRenewalAt;
    await db.update(subscriptions).set(set).where(eq(subscriptions.userId, userId));
  }

  async recordRecurringSuccess(userId: string, nextRenewalAt: Date): Promise<void> {
    await db.update(subscriptions)
      .set({
        status: "active",
        nextRenewalAt,
        endDate: nextRenewalAt,
        gracePeriodEndsAt: null,
        lastPaymentStatus: "success",
        lastPaymentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));
  }

  async recordRecurringFailure(userId: string, gracePeriodEndsAt: Date): Promise<void> {
    // Honour the 3-day grace contract: explicitly flip to status="grace",
    // extend endDate to gracePeriodEndsAt so hasActiveSubscription() keeps
    // granting access during the window, and record the failure metadata.
    await db.update(subscriptions)
      .set({
        status: "grace",
        gracePeriodEndsAt,
        endDate: gracePeriodEndsAt,
        lastPaymentStatus: "failed",
        lastPaymentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));
  }

  async markLapsed(userId: string): Promise<void> {
    await db.update(subscriptions)
      .set({ status: "lapsed", billingMethod: "lapsed", updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId));
  }

  async markActiveSubscription(userId: string): Promise<void> {
    const existing = await this.getSubscription(userId);
    const nextRenewalAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    if (existing) {
      await db.update(subscriptions)
        .set({
          status: "active",
          billingMethod: "admin_override",
          adminGranted: true,
          nextRenewalAt,
          endDate: nextRenewalAt,
          gracePeriodEndsAt: null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId));
    } else {
      await db.insert(subscriptions).values({
        userId,
        plan: "brain_boost",
        priceRands: 169,
        status: "active",
        billingMethod: "admin_override",
        adminGranted: true,
        startDate: new Date(),
        nextRenewalAt,
        endDate: nextRenewalAt,
        paymentProvider: "netcash",
      });
    }
  }

  async extendTrial(userId: string, days: number): Promise<{ newTrialEndsAt: Date }> {
    const existing = await this.getSubscription(userId);
    if (!existing) throw Object.assign(new Error("No subscription found for user"), { code: "NOT_FOUND" });
    const base = existing.trialEndsAt && existing.trialEndsAt > new Date()
      ? existing.trialEndsAt
      : new Date();
    const newTrialEndsAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    await db.update(subscriptions)
      .set({
        status: "trial",
        trialEndsAt: newTrialEndsAt,
        endDate: newTrialEndsAt,
        // Reset reminder dedup flags so the extended trial gets a fresh
        // Day-13 / Day-14 push + email reminder cycle.
        trialReminderD13Sent: false,
        trialReminderD14Sent: false,
        trialReminderEmailD13Sent: false,
        trialReminderEmailD14Sent: false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));
    return { newTrialEndsAt };
  }

  async grantFreshTrial(userId: string): Promise<{ newTrialEndsAt: Date }> {
    const newTrialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const existing = await this.getSubscription(userId);
    if (existing) {
      await db.update(subscriptions)
        .set({
          status: "trial",
          billingMethod: "trial",
          trialEndsAt: newTrialEndsAt,
          endDate: newTrialEndsAt,
          gracePeriodEndsAt: null,
          trialReminderD13Sent: false,
          trialReminderD14Sent: false,
          trialReminderEmailD13Sent: false,
          trialReminderEmailD14Sent: false,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId));
    } else {
      await db.insert(subscriptions).values({
        userId,
        plan: "brain_boost",
        priceRands: 169,
        status: "trial",
        billingMethod: "trial",
        startDate: new Date(),
        trialEndsAt: newTrialEndsAt,
        endDate: newTrialEndsAt,
        paymentProvider: "netcash",
      });
    }
    return { newTrialEndsAt };
  }

  async getTrialReminderBatch(daysFromNow: 1 | 0): Promise<Subscription[]> {
    // d14 = trialEndsAt within next 24h ; d13 = trial ends within 24-48h.
    const now = new Date();
    const lower = new Date(now.getTime() + (daysFromNow === 1 ? 24 : 0) * 60 * 60 * 1000);
    const upper = new Date(now.getTime() + (daysFromNow === 1 ? 48 : 24) * 60 * 60 * 1000);
    const flag = daysFromNow === 1 ? subscriptions.trialReminderD13Sent : subscriptions.trialReminderD14Sent;
    return db.select().from(subscriptions)
      .where(and(
        eq(subscriptions.status, "trial"),
        eq(flag, false),
        sql`${subscriptions.trialEndsAt} >= ${lower}`,
        sql`${subscriptions.trialEndsAt} < ${upper}`,
      ));
  }

  async markTrialReminderSent(userId: string, slot: "d13" | "d14"): Promise<void> {
    const set = slot === "d13" ? { trialReminderD13Sent: true } : { trialReminderD14Sent: true };
    await db.update(subscriptions).set({ ...set, updatedAt: new Date() }).where(eq(subscriptions.userId, userId));
  }

  // Task #666 — Email reminder dedup. Independent of the push flag so the
  // nightly job sends at most one Day-13 and one Day-14 email per trial.
  async getTrialReminderEmailBatch(daysFromNow: 1 | 0): Promise<Subscription[]> {
    const now = new Date();
    const lower = new Date(now.getTime() + (daysFromNow === 1 ? 24 : 0) * 60 * 60 * 1000);
    const upper = new Date(now.getTime() + (daysFromNow === 1 ? 48 : 24) * 60 * 60 * 1000);
    const flag = daysFromNow === 1 ? subscriptions.trialReminderEmailD13Sent : subscriptions.trialReminderEmailD14Sent;
    return db.select().from(subscriptions)
      .where(and(
        eq(subscriptions.status, "trial"),
        eq(flag, false),
        sql`${subscriptions.trialEndsAt} >= ${lower}`,
        sql`${subscriptions.trialEndsAt} < ${upper}`,
      ));
  }

  async markTrialReminderEmailSent(userId: string, slot: "d13" | "d14"): Promise<void> {
    const set = slot === "d13" ? { trialReminderEmailD13Sent: true } : { trialReminderEmailD14Sent: true };
    await db.update(subscriptions).set({ ...set, updatedAt: new Date() }).where(eq(subscriptions.userId, userId));
  }

  async getBillingOverview(filter?: { ending?: number; lapsedDays?: number; status?: string }): Promise<Array<Subscription & { userEmail: string | null; userName: string | null }>> {
    const conditions: SQL<unknown>[] = [];
    if (filter?.ending != null) {
      const upper = new Date(Date.now() + filter.ending * 24 * 60 * 60 * 1000);
      conditions.push(eq(subscriptions.status, "trial"));
      conditions.push(sql`${subscriptions.trialEndsAt} <= ${upper}`);
    }
    if (filter?.lapsedDays != null) {
      const lower = new Date(Date.now() - filter.lapsedDays * 24 * 60 * 60 * 1000);
      conditions.push(eq(subscriptions.status, "lapsed"));
      conditions.push(sql`${subscriptions.updatedAt} >= ${lower}`);
    }
    if (filter?.status != null && !filter.ending && !filter.lapsedDays) {
      conditions.push(eq(subscriptions.status, filter.status));
    }
    const where = conditions.length ? and(...conditions) : undefined;
    let orderCol: any = desc(subscriptions.updatedAt);
    if (filter?.status === "trial") orderCol = subscriptions.trialEndsAt;
    if (filter?.status === "grace") orderCol = subscriptions.gracePeriodEndsAt;
    const rows = await db.select({
      sub: subscriptions,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
    }).from(subscriptions)
      .leftJoin(users, eq(users.id, subscriptions.userId))
      .where(where as any)
      .orderBy(orderCol)
      .limit(500);
    return rows.map((r: any) => ({
      ...r.sub,
      userEmail: r.email ?? null,
      userName: [r.firstName, r.lastName].filter(Boolean).join(" ") || null,
    }));
  }

  async getBillingSummary(): Promise<{ active: number; trial: number; grace: number; lapsed: number; cancelled: number; mrr: number }> {
    const rows = await db
      .select({ status: subscriptions.status, priceRands: subscriptions.priceRands })
      .from(subscriptions);
    const counts = { active: 0, trial: 0, grace: 0, lapsed: 0, cancelled: 0, mrr: 0 };
    for (const r of rows) {
      if (r.status === "active") { counts.active++; counts.mrr += (r.priceRands ?? 0); }
      else if (r.status === "trial") counts.trial++;
      else if (r.status === "grace") counts.grace++;
      else if (r.status === "lapsed") counts.lapsed++;
      else if (r.status === "cancelled") counts.cancelled++;
    }
    return counts;
  }

  async updateSubscriptionStatus(userId: string, status: string): Promise<Subscription | undefined> {
    const [updated] = await db.update(subscriptions)
      .set({ status, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return updated;
  }

  async adminToggleSubscription(userId: string, status: string): Promise<Subscription> {
    const existing = await this.getSubscription(userId);
    
    if (existing) {
      const newStatus = status || (existing.status === "active" ? "inactive" : "active");
      const [updated] = await db.update(subscriptions)
        .set({ 
          status: newStatus, 
          adminGranted: newStatus === "active",
          updatedAt: new Date() 
        })
        .where(eq(subscriptions.userId, userId))
        .returning();
      return updated;
    }
    
    // Create new subscription with admin grant
    const [created] = await db.insert(subscriptions).values({
      userId,
      plan: "standard",
      priceRands: 0,
      status: status || "active",
      adminGranted: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    }).returning();
    return created;
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const sub = await this.getSubscription(userId);
    if (!sub) return false;
    const now = Date.now();
    // Trial users have full access until trialEndsAt.
    if (sub.status === "trial") {
      const trialEnd = sub.trialEndsAt?.getTime() ?? sub.endDate?.getTime() ?? 0;
      return trialEnd > now;
    }
    // Active users keep access until their endDate / nextRenewalAt.
    if (sub.status === "active") {
      const end = sub.endDate?.getTime() ?? sub.nextRenewalAt?.getTime() ?? Number.POSITIVE_INFINITY;
      return end > now;
    }
    // Grace users (most recent recurring renewal failed) keep full access
    // until gracePeriodEndsAt — the 3-day window contract for retry/recovery.
    if (sub.status === "grace") {
      const graceEnd = sub.gracePeriodEndsAt?.getTime() ?? sub.endDate?.getTime() ?? 0;
      return graceEnd > now;
    }
    return false;
  }

  // User Progress
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return db.select().from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async getUserProgressBySubject(userId: string, subjectId: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.subjectId, subjectId)));
    return progress;
  }

  async updateUserProgress(userId: string, subjectId: number, correct?: boolean): Promise<UserProgress> {
    const existing = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.subjectId, subjectId)));
    
    if (existing.length > 0) {
      const updates: any = {
        questionsAttempted: existing[0].questionsAttempted + 1,
        lastAccessedAt: new Date(),
      };
      if (correct === true) {
        updates.correctAnswers = existing[0].correctAnswers + 1;
      }
      
      const [updated] = await db.update(userProgress)
        .set(updates)
        .where(eq(userProgress.id, existing[0].id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(userProgress).values({
      userId,
      subjectId,
      questionsAttempted: 1,
      correctAnswers: correct ? 1 : 0,
    }).returning();
    return created;
  }

  async getUserStats(userId: string): Promise<{
    papersCompleted: number;
    questionsAnswered: number;
    studyStreak: number;
    accuracy: number;
  }> {
    const progress = await this.getUserProgress(userId);
    const papersCompleted = progress.reduce((sum, p) => sum + p.papersCompleted, 0);
    const questionsAnswered = progress.reduce((sum, p) => sum + p.questionsAttempted, 0);
    const correctAnswers = progress.reduce((sum, p) => sum + p.correctAnswers, 0);
    
    const accuracy = questionsAnswered > 0 
      ? Math.round((correctAnswers / questionsAnswered) * 100) 
      : 0;
    
    const streakRecord = await this.getUserStreak(userId);
    return {
      papersCompleted,
      questionsAnswered,
      studyStreak: streakRecord?.currentStreak ?? 0,
      accuracy,
    };
  }

  // Tutor Sessions
  async createTutorSession(session: InsertTutorSession): Promise<TutorSession> {
    const [created] = await db.insert(tutorSessions).values(session).returning();
    return created;
  }

  async getTutorSession(id: number): Promise<TutorSession | undefined> {
    const [session] = await db.select().from(tutorSessions).where(eq(tutorSessions.id, id));
    return session;
  }

  async updateTutorSession(id: number, messages: any[]): Promise<TutorSession | undefined> {
    const [updated] = await db.update(tutorSessions)
      .set({ messages, updatedAt: new Date() })
      .where(eq(tutorSessions.id, id))
      .returning();
    return updated;
  }

  // Tutor Feedback
  async createTutorFeedback(feedback: InsertTutorFeedback): Promise<TutorFeedback> {
    const [created] = await db.insert(tutorFeedback).values(feedback).returning();
    return created;
  }

  async getTutorFeedbackBySession(sessionId: number): Promise<TutorFeedback[]> {
    return db.select().from(tutorFeedback).where(eq(tutorFeedback.sessionId, sessionId));
  }

  // Exam Sessions (Exam Ready feature)
  async createExamSession(session: Partial<InsertExamSession>): Promise<ExamSession> {
    const [created] = await db.insert(examSessions).values(session as InsertExamSession).returning();
    return created;
  }

  async getExamSession(id: number): Promise<ExamSession | undefined> {
    const [session] = await db.select().from(examSessions).where(eq(examSessions.id, id));
    return session;
  }

  async updateExamSession(id: number, updates: Partial<ExamSession>): Promise<ExamSession | undefined> {
    const [updated] = await db.update(examSessions)
      .set(updates)
      .where(eq(examSessions.id, id))
      .returning();
    return updated;
  }

  async getExamSessionsByUser(userId: string): Promise<ExamSession[]> {
    return db.select().from(examSessions)
      .where(eq(examSessions.userId, userId))
      .orderBy(desc(examSessions.startedAt));
  }

  async getAllExamPapers(): Promise<ExamPaper[]> {
    return db.select().from(examPapers).orderBy(desc(examPapers.year));
  }

  async getExamSessionCountBySubject(userId: string, subjectId: number, date: string): Promise<number> {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(examSessions)
      .innerJoin(examPapers, eq(examSessions.examPaperId, examPapers.id))
      .where(
        and(
          eq(examSessions.userId, userId),
          eq(examPapers.subjectId, subjectId),
          sql`${examSessions.startedAt} >= ${startOfDay}`,
          sql`${examSessions.startedAt} <= ${endOfDay}`
        )
      );
    return result[0]?.count ?? 0;
  }

  async getLatestExamSessionBySubject(userId: string, subjectId: number): Promise<ExamSession | undefined> {
    const [session] = await db
      .select({ examSessions })
      .from(examSessions)
      .innerJoin(examPapers, eq(examSessions.examPaperId, examPapers.id))
      .where(
        and(
          eq(examSessions.userId, userId),
          eq(examPapers.subjectId, subjectId)
        )
      )
      .orderBy(desc(examSessions.startedAt))
      .limit(1);
    return session?.examSessions;
  }

  async getExamSessionCountInLastHour(userId: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(examSessions)
      .where(
        and(
          eq(examSessions.userId, userId),
          sql`${examSessions.startedAt} >= ${oneHourAgo}`
        )
      );
    return result[0]?.count ?? 0;
  }

  // User Streaks
  async getUserStreak(userId: string): Promise<UserStreak | undefined> {
    const [streak] = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId));
    return streak;
  }

  async updateUserStreak(userId: string): Promise<UserStreak> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.getUserStreak(userId);
    
    if (existing) {
      const lastDate = existing.lastActivityDate;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let newStreak = existing.currentStreak;
      if (lastDate === today) {
        // Already logged activity today
        return existing;
      } else if (lastDate === yesterday) {
        // Consecutive day - increment streak
        newStreak = existing.currentStreak + 1;
      } else {
        // Streak broken — check for active streak-freeze before resetting
        const hasFreeze = await this.hasActivePowerUp(userId, "streak-freeze");
        if (hasFreeze) {
          await this.consumePowerUp(userId, "streak-freeze");
          newStreak = existing.currentStreak; // preserve streak
        } else {
          newStreak = 1;
        }
      }
      
      const [updated] = await db.update(userStreaks)
        .set({
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, existing.longestStreak),
          lastActivityDate: today,
          totalDaysActive: existing.totalDaysActive + 1,
          updatedAt: new Date(),
        })
        .where(eq(userStreaks.userId, userId))
        .returning();
      return updated;
    }
    
    // Create new streak record
    const [created] = await db.insert(userStreaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: today,
      totalDaysActive: 1,
    }).returning();
    return created;
  }

  // User Badges
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return db.select().from(userBadges).where(eq(userBadges.userId, userId));
  }

  async hasBadge(userId: string, badgeCode: string): Promise<boolean> {
    const existing = await db.select().from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeCode, badgeCode)));
    return existing.length > 0;
  }

  async awardBadge(userId: string, badgeCode: string): Promise<UserBadge | null> {
    const existing = await db.select().from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeCode, badgeCode)));
    
    if (existing.length > 0) {
      return null;
    }
    
    const [created] = await db.insert(userBadges).values({
      userId,
      badgeCode,
    }).returning();
    console.log(`[BADGE] Awarded "${badgeCode}" — badge id ${created.id}`);

    const BADGE_COIN_REWARDS: Record<string, number> = {
      streak_3: 5, streak_7: 10, streak_14: 20, streak_30: 50,
      questions_10: 5, questions_50: 15, questions_100: 30, questions_500: 75,
      accuracy_70: 10, accuracy_80: 20, accuracy_90: 40,
      subject_mastery: 50, exam_complete: 25, first_paper: 10, high_score: 15,
      exam_champion: 60,
    };
    const reward = BADGE_COIN_REWARDS[badgeCode] || 5;
    await this.awardCoins(userId, reward, "badge_earned", `badge_${badgeCode}`);
    console.log(`[COINS] +${reward} coins for badge "${badgeCode}"`);

    return created;
  }

  async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    const newBadges: UserBadge[] = [];
    
    // Get user stats
    const stats = await this.getUserStats(userId);
    const streak = await this.getUserStreak(userId);
    const examSessions = await this.getExamSessionsByUser(userId);
    const completedExams = examSessions.filter(s => s.status === 'completed').length;
    
    // Streak badges
    const currentStreak = streak?.currentStreak || 0;
    if (currentStreak >= 3) {
      const badge = await this.awardBadge(userId, 'streak_3');
      if (badge) newBadges.push(badge);
    }
    if (currentStreak >= 7) {
      const badge = await this.awardBadge(userId, 'streak_7');
      if (badge) newBadges.push(badge);
    }
    if (currentStreak >= 14) {
      const badge = await this.awardBadge(userId, 'streak_14');
      if (badge) newBadges.push(badge);
    }
    if (currentStreak >= 30) {
      const badge = await this.awardBadge(userId, 'streak_30');
      if (badge) newBadges.push(badge);
    }
    
    // Questions answered badges
    if (stats.questionsAnswered >= 10) {
      const badge = await this.awardBadge(userId, 'questions_10');
      if (badge) newBadges.push(badge);
    }
    if (stats.questionsAnswered >= 50) {
      const badge = await this.awardBadge(userId, 'questions_50');
      if (badge) newBadges.push(badge);
    }
    if (stats.questionsAnswered >= 100) {
      const badge = await this.awardBadge(userId, 'questions_100');
      if (badge) newBadges.push(badge);
    }
    if (stats.questionsAnswered >= 500) {
      const badge = await this.awardBadge(userId, 'questions_500');
      if (badge) newBadges.push(badge);
    }
    
    // Accuracy badges
    if (stats.questionsAnswered >= 20) {
      if (stats.accuracy >= 70) {
        const badge = await this.awardBadge(userId, 'accuracy_70');
        if (badge) newBadges.push(badge);
      }
      if (stats.accuracy >= 80) {
        const badge = await this.awardBadge(userId, 'accuracy_80');
        if (badge) newBadges.push(badge);
      }
      if (stats.accuracy >= 90) {
        const badge = await this.awardBadge(userId, 'accuracy_90');
        if (badge) newBadges.push(badge);
      }
    }
    
    // Exam completion badge
    if (completedExams >= 5) {
      const badge = await this.awardBadge(userId, 'exam_champion');
      if (badge) newBadges.push(badge);
    }
    
    return newBadges;
  }

  // Session Management - Prevent profile sharing/cloning
  async createUserSession(userId: string, sessionToken: string, deviceInfo: { ip?: string; userAgent?: string; fingerprint?: string }): Promise<UserActiveSession> {
    // Invalidate all other sessions for this user (only 1 device allowed)
    await this.invalidateOtherSessions(userId, sessionToken);
    
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const [created] = await db.insert(userActiveSessions).values({
      userId,
      sessionToken,
      deviceFingerprint: deviceInfo.fingerprint,
      ipAddress: deviceInfo.ip,
      userAgent: deviceInfo.userAgent,
      isActive: true,
      expiresAt,
    }).returning();
    return created;
  }

  async validateSession(userId: string, sessionToken: string): Promise<boolean> {
    const [session] = await db.select().from(userActiveSessions)
      .where(and(
        eq(userActiveSessions.userId, userId),
        eq(userActiveSessions.sessionToken, sessionToken),
        eq(userActiveSessions.isActive, true)
      ));
    
    if (!session) return false;
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) return false;
    
    // Update last activity
    await db.update(userActiveSessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(userActiveSessions.id, session.id));
    
    return true;
  }

  async invalidateOtherSessions(userId: string, currentSessionToken: string): Promise<void> {
    await db.update(userActiveSessions)
      .set({ isActive: false })
      .where(and(
        eq(userActiveSessions.userId, userId),
        sql`${userActiveSessions.sessionToken} != ${currentSessionToken}`
      ));
  }

  async getActiveSessionCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(userActiveSessions)
      .where(and(
        eq(userActiveSessions.userId, userId),
        eq(userActiveSessions.isActive, true)
      ));
    return result[0]?.count || 0;
  }

  // Seed subjects and topics
  async seedMockExams(): Promise<void> {
    const { MOCK_EXAMS } = await import("./data/mock-exams");
    const allSubjects = await this.getAllSubjects();
    
    for (const exam of MOCK_EXAMS) {
      const subject = allSubjects.find(s => s.code === "BSTD"); // Example mapping
      if (!subject) continue;

      const [paper] = await db.insert(examPapers).values({
        ...exam.paper,
        subjectId: subject.id
      }).onConflictDoNothing().returning();

      if (paper) {
        for (const q of exam.questions) {
          await db.insert(questions).values({
            questionNumber: q.questionNumber,
            questionText: q.questionTextEn,
            memoText: q.memoTextEn,
            marks: q.marks,
            cognitiveLevel: q.cognitiveLevel,
            difficulty: q.difficulty,
            examPaperId: paper.id,
            topicId: 1, // Placeholder topic
          }).onConflictDoNothing();
        }
      }
    }
  }

  /**
   * Shared alias table: maps lowercase NSC official name → lowercase BrainTrack subject name.
   * Also provides a code-path fallback via the returned `nameToCode` map which maps the same
   * lowercase official names directly to BrainTrack subject codes (e.g. "ENGH"), enabling a
   * secondary code-based lookup when name normalisation alone is insufficient.
   */
  private _nscAliases(): {
    nameAliases: Record<string, string>;
    nameToCode: Record<string, string>;
  } {
    return {
      nameAliases: {
        "english eerste addisionele taal": "english first additional language",
        "afrikaans eerste addisionele taal": "afrikaans first additional language",
      },
      nameToCode: {
        "english home language": "ENGH",
        "english eerste addisionele taal": "ENGF",
        "english first additional language": "ENGF",
        "afrikaans home language": "AFRH",
        "afrikaans eerste addisionele taal": "AFRF",
        "afrikaans first additional language": "AFRF",
        "mathematics": "MATH",
        "mathematical literacy": "MATL",
        "technical mathematics": "TMATH",
        "physical sciences": "PHYS",
        "life sciences": "LIFE",
        "agricultural sciences": "AGR",
        "technical sciences": "TSCI",
        "accounting": "ACC",
        "business studies": "BUS",
        "economics": "ECO",
        "history": "HIS",
        "geography": "GEO",
        "religion studies": "RELI",
        "tourism": "TOUR",
        "visual arts": "ART",
        "dramatic arts": "DRAMA",
        "dance studies": "DANCE",
        "music": "MUSIC",
        "design": "DESIGN",
        "information technology": "IT",
        "computer applications technology": "CAT",
        "engineering graphics and design": "EGD",
        "civil technology": "CIVT",
        "electrical technology": "ELEC",
        "mechanical technology": "MECH",
        "digital technology": "DIGT",
        "agricultural management practices": "AGRM",
        "agricultural technology": "AGRT",
        "consumer studies": "CON",
        "hospitality studies": "HOSP",
        "life orientation": "LO",
        "marine sciences": "MRSCI",
      },
    };
  }

  /** Build name→id and code→id lookup maps from the subjects table. */
  private _buildSubjectLookups(allSubjects: { id: number; name: string; code: string }[]): {
    nameToId: Map<string, number>;
    codeToId: Map<string, number>;
  } {
    const nameToId = new Map<string, number>();
    const codeToId = new Map<string, number>();
    for (const s of allSubjects) {
      nameToId.set(s.name.toLowerCase(), s.id);
      codeToId.set(s.code.toLowerCase(), s.id);
    }
    return { nameToId, codeToId };
  }

  /** Resolve an official NSC name to a subjectId using name → alias → code fallback. */
  private _resolveOfficialName(
    officialName: string,
    nameToId: Map<string, number>,
    codeToId: Map<string, number>,
    nameAliases: Record<string, string>,
    nameToCode: Record<string, string>,
  ): number | null {
    const lc = officialName.toLowerCase();
    const resolvedName = nameAliases[lc] ?? lc;
    const byName = nameToId.get(resolvedName) ?? null;
    if (byName !== null) return byName;
    const code = nameToCode[lc] ?? nameToCode[resolvedName];
    if (code) {
      const byCode = codeToId.get(code.toLowerCase()) ?? null;
      if (byCode !== null) return byCode;
    }
    return null;
  }

  async seedNscTimetable(): Promise<void> {
    const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(nscTimetable);
    if (Number(countRow?.count ?? 0) > 0) return;

    const { NSC_2026_TIMETABLE, SUBJECT_NAME_MAPPINGS } = await import("./data/nsc-2026-timetable");

    await db.insert(nscTimetable).values(
      NSC_2026_TIMETABLE.map((entry) => ({ ...entry, year: 2026 }))
    );

    const allSubjects = await this.getAllSubjects();
    const { nameToId, codeToId } = this._buildSubjectLookups(allSubjects);
    const { nameAliases, nameToCode } = this._nscAliases();

    const resolvedMappings = SUBJECT_NAME_MAPPINGS.map((m) => ({
      timetableSubjectName: m.timetableName,
      braintrackSubjectId: this._resolveOfficialName(m.timetableName, nameToId, codeToId, nameAliases, nameToCode),
    }));

    await db.insert(timetableSubjectMapping).values(resolvedMappings);

    const matched = resolvedMappings.filter((m) => m.braintrackSubjectId !== null).length;
    console.log(`[seedNscTimetable] Seeded ${NSC_2026_TIMETABLE.length} timetable entries and ${resolvedMappings.length} subject mappings (${matched} resolved to subject IDs).`);
  }

  /** Detect actual column names in timetable_subject_mapping to handle schema/DB drift. */
  private async _getTimetableMappingCols(): Promise<{ nameCol: string; idCol: string }> {
    const colInfoRows = await db.execute(sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'timetable_subject_mapping'
    `);
    const colNames = new Set((colInfoRows.rows as any[]).map(r => r.column_name as string));
    return {
      nameCol: colNames.has("official_name") ? "official_name" : "timetable_subject_name",
      idCol:   colNames.has("subject_id")    ? "subject_id"    : "braintrack_subject_id",
    };
  }

  async getTimetableSubjectMappings(): Promise<TimetableSubjectMapping[]> {
    const { nameCol, idCol } = await this._getTimetableMappingCols();
    // nosemgrep: javascript.drizzle-orm.security.audit.ban-drizzle-sql-raw -- nameCol and idCol are hardcoded internal constants from _getTimetableMappingCols(), not user-controlled values; sql.raw() is required to interpolate column identifiers
    const colName = sql.raw(`"${nameCol}"`); // nosemgrep: javascript.drizzle-orm.security.audit.ban-drizzle-sql-raw
    const colId = sql.raw(`"${idCol}"`); // nosemgrep: javascript.drizzle-orm.security.audit.ban-drizzle-sql-raw
    const rows = await db.execute(
      sql`SELECT id,
               ${colName} AS "timetableSubjectName",
               ${colId}   AS "braintrackSubjectId",
               created_at AS "createdAt"
          FROM timetable_subject_mapping
          ORDER BY ${colName}`
    );
    return rows.rows as unknown as TimetableSubjectMapping[];
  }

  async updateTimetableSubjectMapping(id: number, subjectId: number | null): Promise<TimetableSubjectMapping> {
    const { idCol } = await this._getTimetableMappingCols();
    const colIdUpd = sql.raw(`"${idCol}"`); // nosemgrep: javascript.drizzle-orm.security.audit.ban-drizzle-sql-raw -- idCol is a hardcoded internal constant, not user-controlled; sql.raw() required for column identifier interpolation
    await db.execute(
      sql`UPDATE timetable_subject_mapping SET ${colIdUpd} = ${subjectId} WHERE id = ${id}`
    );
    const result = await db.execute(
      sql`SELECT * FROM timetable_subject_mapping WHERE id = ${id}`
    );
    const row = result.rows[0];
    if (!row) throw new Error(`Mapping id=${id} not found`);
    return row as unknown as TimetableSubjectMapping;
  }

  async resolveNscSubjectMappings(): Promise<{ resolved: number; unmatched: string[] }> {
    const { nameCol, idCol } = await this._getTimetableMappingCols();
    // nosemgrep: javascript.drizzle-orm.security.audit.ban-drizzle-sql-raw -- nameCol and idCol are hardcoded internal constants from _getTimetableMappingCols(), not user-controlled values; sql.raw() is required to safely interpolate column identifiers
    const colNameRes = sql.raw(`"${nameCol}"`); // nosemgrep: javascript.drizzle-orm.security.audit.ban-drizzle-sql-raw
    const colIdRes = sql.raw(`"${idCol}"`); // nosemgrep: javascript.drizzle-orm.security.audit.ban-drizzle-sql-raw

    // Fetch only rows where the subject FK is null (idempotent — never overwrites)
    const nullRowsResult = await db.execute(
      sql`SELECT id, ${colNameRes} AS official_name
          FROM timetable_subject_mapping
          WHERE ${colIdRes} IS NULL`
    );
    const nullRows = nullRowsResult.rows as { id: number; official_name: string }[];

    if (nullRows.length === 0) return { resolved: 0, unmatched: [] };

    const allSubjects = await this.getAllSubjects();
    const { nameToId, codeToId } = this._buildSubjectLookups(allSubjects);
    const { nameAliases, nameToCode } = this._nscAliases();

    let resolved = 0;
    const unmatched: string[] = [];

    for (const row of nullRows) {
      const subjectId = this._resolveOfficialName(row.official_name, nameToId, codeToId, nameAliases, nameToCode);

      if (subjectId !== null) {
        await db.execute(
          sql`UPDATE timetable_subject_mapping
              SET ${colIdRes} = ${subjectId}
              WHERE id = ${row.id}`
        );
        resolved++;
      } else {
        unmatched.push(row.official_name);
        console.warn(`[resolveNscSubjectMappings] No subject match for: "${row.official_name}"`);
      }
    }

    console.log(`[resolveNscSubjectMappings] Resolved ${resolved} mappings; ${unmatched.length} unmatched.`);
    return { resolved, unmatched };
  }

  async seedSubjects(): Promise<void> {
    const existing = await this.getAllSubjects();
    const existingCodes = new Set(existing.map((s) => s.code));

    // Additive: insert any subjects missing from the DB, then backfill topics
    for (const subject of GRADE_12_SUBJECTS) {
      if (!existingCodes.has(subject.code)) {
        const created = await this.createSubject(subject);
        await this.seedTopicsForSubject(created.id, subject.code);
      } else {
        const existingSubject = existing.find((s) => s.code === subject.code);
        if (existingSubject) {
          await this.seedTopicsForSubject(existingSubject.id, subject.code);
        }
      }
    }
  }
  
  // Seed topics for a subject (idempotent based on capsCode)
  private async seedTopicsForSubject(subjectId: number, subjectCode: string): Promise<void> {
    const subjectTopics = CAPS_TOPICS[subjectCode];
    if (!subjectTopics) return;
    
    // Get existing topics for this subject
    const existingTopics = await this.getTopicsBySubject(subjectId);
    const existingCapsCodes = new Set(existingTopics.map(t => t.capsCode));
    
    // Only insert topics that don't exist yet (by capsCode)
    for (let i = 0; i < subjectTopics.length; i++) {
      const topic = subjectTopics[i];
      if (!existingCapsCodes.has(topic.capsCode)) {
        const intel = CAPS_TOPIC_INTELLIGENCE[topic.capsCode];
        await this.createTopic({
          subjectId,
          name: topic.name,
          nameAfrikaans: topic.nameAfrikaans,
          capsCode: topic.capsCode,
          orderIndex: i + 1,
          ...(intel ? {
            capsWeighting: intel.capsWeighting,
            tenYearFrequency: intel.tenYearFrequency,
            tenYearLikelihood: intel.tenYearLikelihood,
            typicalMarks: intel.typicalMarks ?? null,
            cognitiveKnowledge: intel.cognitiveKnowledge,
            cognitiveApplication: intel.cognitiveApplication,
            cognitiveHigherOrder: intel.cognitiveHigherOrder,
            examTips: intel.examTips ?? null,
            commonTraps: intel.commonTraps ?? null,
          } : {}),
        });
      }
    }
  }

  // ============================================
  // TEST USER SEEDING (development only)
  // ============================================

  static readonly TEST_LEARNER_ID = "00000000-0000-0000-0000-000000000001";
  static readonly TEST_PARENT_ID  = "00000000-0000-0000-0000-000000000002";
  static readonly TEST_ADMIN_ID   = "00000000-0000-0000-0000-000000000003";

  async seedTestUsers(): Promise<void> {
    if (process.env.NODE_ENV === "production") return;

    const { TEST_LEARNER_ID, TEST_PARENT_ID, TEST_ADMIN_ID } = DatabaseStorage;

    const testUsers = [
      {
        id: TEST_LEARNER_ID,
        email: "test-learner@braintrack.test",
        firstName: "Test",
        lastName: "Learner",
        role: "learner",
        roleConfirmed: true,
        theme: "dark",
        preferredLanguage: "en",
        selectedSubjects: [1, 2, 3],
      },
      {
        id: TEST_PARENT_ID,
        email: "test-parent@braintrack.test",
        firstName: "Test",
        lastName: "Parent",
        role: "parent",
        roleConfirmed: true,
        theme: "dark",
        preferredLanguage: "en",
      },
      {
        id: TEST_ADMIN_ID,
        email: "test-admin@braintrack.test",
        firstName: "Test",
        lastName: "Admin",
        // Admin access is now restricted to the email allowlist in
        // server/replit_integrations/auth/replitAuth.ts. Seeded test users
        // get learner role; only allowlisted emails are promoted at login.
        role: "learner",
        roleConfirmed: true,
        theme: "dark",
        preferredLanguage: "en",
      },
    ];

    for (const u of testUsers) {
      await db.insert(users).values(u).onConflictDoUpdate({
        target: users.id,
        set: {
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          roleConfirmed: u.roleConfirmed,
          updatedAt: new Date(),
        },
      });
    }

    // Onboarding results for all three
    const onboardingBase = {
      learningStyle: "visual",
      studyPreference: "solo",
      focusDuration: 45,
      challenges: ["time_management", "exam_anxiety"],
      goals: ["pass_matric", "university_entry"],
      preferredLanguage: "english",
    };

    for (const userId of [TEST_LEARNER_ID, TEST_PARENT_ID, TEST_ADMIN_ID]) {
      const existing = await this.getOnboardingResult(userId);
      if (!existing) {
        await db.insert(onboardingResults).values({
          ...onboardingBase,
          userId,
          selectedSubjects: userId === TEST_LEARNER_ID ? [1, 2, 3] : [],
        });
      }
    }

    // ── Learner linked data ─────────────────────────────────────────────────

    // Resolve subject IDs for MATH, PHYS, LIFE
    const allSubjects = await this.getAllSubjects();
    const mathSubject  = allSubjects.find(s => s.code === "MATH");
    const physSubject  = allSubjects.find(s => s.code === "PHYS");
    const lifeSubject  = allSubjects.find(s => s.code === "LIFE");
    const learnerSubjects = [mathSubject, physSubject, lifeSubject].filter(Boolean) as typeof allSubjects;

    // Update learner's selectedSubjects with real IDs
    if (learnerSubjects.length > 0) {
      await db.update(users)
        .set({ selectedSubjects: learnerSubjects.map(s => s.id), updatedAt: new Date() })
        .where(eq(users.id, TEST_LEARNER_ID));
    }

    // Topic mastery — 2 red, 2 amber, 2 green spread across subjects
    const existingMastery = await this.getAllTopicMastery(TEST_LEARNER_ID);
    if (existingMastery.length === 0 && learnerSubjects.length > 0) {
      const bands: Array<{ masteryScore: number; masteryBand: "red" | "amber" | "green" }> = [
        { masteryScore: 35, masteryBand: "red" },
        { masteryScore: 50, masteryBand: "red" },
        { masteryScore: 65, masteryBand: "amber" },
        { masteryScore: 72, masteryBand: "amber" },
        { masteryScore: 80, masteryBand: "green" },
        { masteryScore: 92, masteryBand: "green" },
      ];
      let bandIdx = 0;
      for (const subj of learnerSubjects) {
        const subjectTopics = await this.getTopicsBySubject(subj.id);
        for (let i = 0; i < 2 && i < subjectTopics.length && bandIdx < bands.length; i++, bandIdx++) {
          const topic = subjectTopics[i];
          const band = bands[bandIdx];
          const now = new Date();
          await db.insert(topicMastery).values({
            userId: TEST_LEARNER_ID,
            topicId: topic.id,
            subjectId: subj.id,
            masteryScore: band.masteryScore,
            masteryBand: band.masteryBand,
            accuracyScore: band.masteryScore,
            marksRatio: band.masteryScore,
            timeEfficiency: 80,
            questionsAttempted: 10,
            questionsCorrect: Math.round(10 * band.masteryScore / 100),
            totalMarksEarned: band.masteryScore,
            totalMarksAvailable: 100,
            lastAttemptAt: now,
            nextReviewAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            confidenceLevel: band.masteryScore,
          }).onConflictDoUpdate({
            target: [topicMastery.userId, topicMastery.topicId],
            set: {
              masteryScore: band.masteryScore,
              masteryBand: band.masteryBand,
              accuracyScore: band.masteryScore,
              marksRatio: band.masteryScore,
              timeEfficiency: 80,
              questionsAttempted: 10,
              questionsCorrect: Math.round(10 * band.masteryScore / 100),
              totalMarksEarned: band.masteryScore,
              totalMarksAvailable: 100,
              lastAttemptAt: now,
              nextReviewAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
              confidenceLevel: band.masteryScore,
              updatedAt: now,
            },
          });
        }
      }
    }

    // User progress per subject
    for (const subj of learnerSubjects) {
      const existingProgress = await this.getUserProgressBySubject(TEST_LEARNER_ID, subj.id);
      if (!existingProgress) {
        await db.insert(userProgress).values({
          userId: TEST_LEARNER_ID,
          subjectId: subj.id,
          papersCompleted: 2,
          questionsAttempted: 30,
          correctAnswers: 20,
        });
      }
    }

    // Prep scores — 8 entries over the past 2 months
    const existingPrepScores = await db.select({ id: prepScores.id })
      .from(prepScores)
      .where(eq(prepScores.userId, TEST_LEARNER_ID))
      .limit(1);
    if (existingPrepScores.length === 0) {
      const prepEntries = [
        { daysAgo: 60, score: 42, status: "catch_up", streak: 0, accuracy: 45 },
        { daysAgo: 52, score: 48, status: "catch_up", streak: 2, accuracy: 50 },
        { daysAgo: 45, score: 55, status: "building",  streak: 4, accuracy: 58 },
        { daysAgo: 37, score: 61, status: "building",  streak: 6, accuracy: 64 },
        { daysAgo: 28, score: 67, status: "building",  streak: 7, accuracy: 70 },
        { daysAgo: 20, score: 73, status: "locked_in", streak: 9, accuracy: 75 },
        { daysAgo: 10, score: 78, status: "locked_in", streak: 11, accuracy: 80 },
        { daysAgo: 2,  score: 82, status: "star",      streak: 14, accuracy: 85 },
      ] as const;
      for (const entry of prepEntries) {
        const recordedAt = new Date(Date.now() - entry.daysAgo * 24 * 60 * 60 * 1000);
        await db.insert(prepScores).values({
          userId: TEST_LEARNER_ID,
          score: entry.score,
          status: entry.status,
          streak: entry.streak,
          accuracy: entry.accuracy,
          questionsAnswered: entry.score * 2,
          papersCompleted: Math.floor(entry.score / 20),
          recordedAt,
        });
      }
    }

    // User XP (level 4, 1200 XP, 7-day streak)
    const existingXP = await db.select({ id: userXP.id })
      .from(userXP)
      .where(eq(userXP.userId, TEST_LEARNER_ID))
      .limit(1);
    if (existingXP.length === 0) {
      await db.insert(userXP).values({
        userId: TEST_LEARNER_ID,
        totalXP: 1200,
        currentLevel: "level_4",
        streakDays: 7,
        longestStreak: 14,
        lastActiveDate: new Date().toISOString().split("T")[0],
      });
    } else {
      await db.update(userXP)
        .set({ totalXP: 1200, currentLevel: "level_4", streakDays: 7, longestStreak: 14 })
        .where(eq(userXP.userId, TEST_LEARNER_ID));
    }

    // User streaks
    const existingStreak = await this.getUserStreak(TEST_LEARNER_ID);
    if (!existingStreak) {
      await db.insert(userStreaks).values({
        userId: TEST_LEARNER_ID,
        currentStreak: 7,
        longestStreak: 14,
        lastActivityDate: new Date().toISOString().split("T")[0],
        totalDaysActive: 42,
      });
    }

    // Coins
    const existingCoins = await db.select({ id: userCoins.id })
      .from(userCoins)
      .where(eq(userCoins.userId, TEST_LEARNER_ID))
      .limit(1);
    if (existingCoins.length === 0) {
      await db.insert(userCoins).values({
        userId: TEST_LEARNER_ID,
        balance: 350,
        totalEarned: 500,
        totalSpent: 150,
      });
    }

    // ── Parent ↔ Learner link ───────────────────────────────────────────────

    const existingLink = await db.select({ id: parentLinks.id })
      .from(parentLinks)
      .where(eq(parentLinks.parentUserId, TEST_PARENT_ID))
      .limit(1);
    if (existingLink.length === 0) {
      await db.insert(parentLinks).values({
        parentUserId: TEST_PARENT_ID,
        learnerUserId: TEST_LEARNER_ID,
        activationToken: "dev-seed-activation-token-00000001",
        learnerName: "Test Learner",
        status: "confirmed",
        activatedAt: new Date(),
      });
    }

    const existingConsent = await this.getConsentRecord(TEST_LEARNER_ID);
    if (!existingConsent) {
      await db.insert(consentRecords).values({
        parentId: TEST_PARENT_ID,
        learnerId: TEST_LEARNER_ID,
        consentMethod: "admin",
      });
    }

    console.log("[seed] Test users seeded (learner, parent, admin)");
  }

  // Seed exam papers for all subjects (2015-2025)
  async seedExamPapers(): Promise<void> {
    const allSubjects = await this.getAllSubjects();
    
    // Check if papers already exist
    const existingPapers = await db.select({ count: sql<number>`count(*)` }).from(examPapers);
    if (existingPapers[0]?.count > 0) {
      console.log("Exam papers already seeded, skipping...");
      return;
    }

    console.log("Seeding exam papers for 2015-2025...");
    
    // Subject code mapping for DBE paper URLs
    const subjectCodeMap: Record<string, string> = {
      "Mathematics": "mathematics",
      "Mathematical Literacy": "mathematical-literacy",
      "Physical Sciences": "physical-sciences",
      "Life Sciences": "life-sciences",
      "Accounting": "accounting",
      "Business Studies": "business-studies",
      "Economics": "economics",
      "Geography": "geography",
      "History": "history",
      "English Home Language": "english-hl",
      "English First Additional Language": "english-fal",
      "Afrikaans Home Language": "afrikaans-hl",
      "Afrikaans First Additional Language": "afrikaans-fal",
      "Information Technology": "information-technology",
      "Computer Applications Technology": "computer-applications-technology",
      "Engineering Graphics and Design": "engineering-graphics-design",
      "Agricultural Sciences": "agricultural-sciences",
      "Consumer Studies": "consumer-studies",
      "Tourism": "tourism",
      "Visual Arts": "visual-arts",
    };

    // Paper configurations per subject
    const paperConfigs: Record<string, { papers: number[]; months: string[] }> = {
      "Mathematics": { papers: [1, 2], months: ["November"] },
      "Mathematical Literacy": { papers: [1, 2], months: ["November"] },
      "Physical Sciences": { papers: [1, 2], months: ["November"] },
      "Life Sciences": { papers: [1, 2], months: ["November"] },
      "Accounting": { papers: [1], months: ["November"] },
      "Business Studies": { papers: [1], months: ["November"] },
      "Economics": { papers: [1, 2], months: ["November"] },
      "Geography": { papers: [1, 2], months: ["November"] },
      "History": { papers: [1, 2], months: ["November"] },
      "English Home Language": { papers: [1, 2, 3], months: ["November"] },
      "English First Additional Language": { papers: [1, 2, 3], months: ["November"] },
      "Afrikaans Home Language": { papers: [1, 2, 3], months: ["November"] },
      "Afrikaans First Additional Language": { papers: [1, 2, 3], months: ["November"] },
      "Information Technology": { papers: [1, 2], months: ["November"] },
      "Computer Applications Technology": { papers: [1, 2], months: ["November"] },
      "Engineering Graphics and Design": { papers: [1], months: ["November"] },
      "Agricultural Sciences": { papers: [1, 2], months: ["November"] },
      "Consumer Studies": { papers: [1], months: ["November"] },
      "Tourism": { papers: [1], months: ["November"] },
      "Visual Arts": { papers: [1], months: ["November"] },
    };

    const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    const languages = ["English", "Afrikaans"];

    for (const subject of allSubjects) {
      const subjectCode = subjectCodeMap[subject.name];
      const config = paperConfigs[subject.name];
      
      if (!subjectCode || !config) continue;

      for (const year of years) {
        for (const month of config.months) {
          for (const paperNumber of config.papers) {
            for (const language of languages) {
              // Generate DBE-style URLs (these are placeholder URLs that follow DBE naming conventions)
              const langCode = language === "English" ? "eng" : "afr";
              const baseUrl = `https://www.education.gov.za/Portals/0/Documents/NSC/${year}`;
              const paperUrl = `${baseUrl}/${subjectCode}-p${paperNumber}-${langCode}.pdf`;
              const memoUrl = `${baseUrl}/${subjectCode}-p${paperNumber}-memo-${langCode}.pdf`;

              await this.createExamPaper({
                subjectId: subject.id,
                year,
                month,
                paperNumber,
                language,
                paperUrl,
                memoUrl,
                source: "Department of Basic Education",
                sourceLink: "https://www.education.gov.za",
              });
            }
          }
        }
      }
    }

    console.log("Exam papers seeding complete!");
  }

  // Topic Mastery (CAPS Intelligence) Methods
  async getTopicMastery(userId: string, topicId: number): Promise<TopicMastery | undefined> {
    const [mastery] = await db.select()
      .from(topicMastery)
      .where(and(
        eq(topicMastery.userId, userId),
        eq(topicMastery.topicId, topicId)
      ));
    return mastery;
  }

  async getTopicMasteryBySubject(userId: string, subjectId: number): Promise<TopicMastery[]> {
    return db.select()
      .from(topicMastery)
      .where(and(
        eq(topicMastery.userId, userId),
        eq(topicMastery.subjectId, subjectId)
      ))
      .orderBy(asc(topicMastery.masteryScore));
  }

  async getAllTopicMastery(userId: string): Promise<TopicMastery[]> {
    return db.select()
      .from(topicMastery)
      .where(eq(topicMastery.userId, userId))
      .orderBy(asc(topicMastery.masteryScore));
  }

  async createOrUpdateTopicMastery(
    userId: string, 
    topicId: number, 
    subjectId: number, 
    updates: Partial<TopicMastery>
  ): Promise<TopicMastery> {
    const existing = await this.getTopicMastery(userId, topicId);
    
    if (existing) {
      const [updated] = await db.update(topicMastery)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(
          eq(topicMastery.userId, userId),
          eq(topicMastery.topicId, topicId)
        ))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(topicMastery)
        .values({
          userId,
          topicId,
          subjectId,
          masteryScore: 0,
          masteryBand: "red",
          accuracyScore: 0,
          marksRatio: 0,
          timeEfficiency: 0,
          conceptErrors: 0,
          methodErrors: 0,
          languageErrors: 0,
          questionsAttempted: 0,
          questionsCorrect: 0,
          totalMarksEarned: 0,
          totalMarksAvailable: 0,
          reviewInterval: 1,
          confidenceLevel: 0,
          consecutiveCorrect: 0,
          consecutiveIncorrect: 0,
          ...updates
        })
        .onConflictDoUpdate({
          target: [topicMastery.userId, topicMastery.topicId],
          set: { ...updates, updatedAt: new Date() },
        })
        .returning();
      return created;
    }
  }

  async updateMasteryAfterAttempt(
    userId: string, 
    topicId: number, 
    subjectId: number, 
    attemptData: {
      isCorrect: boolean;
      marksAwarded: number;
      marksAvailable: number;
      timeSpentSeconds: number;
      expectedTimeSeconds: number;
      errorType: string | null;
    }
  ): Promise<TopicMastery> {
    // Get or create mastery record
    let currentMastery = await this.getTopicMastery(userId, topicId);
    
    if (!currentMastery) {
      currentMastery = await this.createOrUpdateTopicMastery(userId, topicId, subjectId, {});
    }
    
    // Calculate updates using caps-intelligence module
    const updates = updateMasteryAfterAttempt(
      currentMastery,
      attemptData.isCorrect,
      attemptData.marksAwarded,
      attemptData.marksAvailable,
      attemptData.timeSpentSeconds,
      attemptData.expectedTimeSeconds,
      attemptData.errorType
    );
    
    // Apply updates
    return this.createOrUpdateTopicMastery(userId, topicId, subjectId, updates);
  }

  async getWeakTopics(userId: string, limit: number = 5): Promise<TopicMastery[]> {
    const [userRow] = await db.select({ selectedSubjects: users.selectedSubjects })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const enrolled: number[] = (userRow?.selectedSubjects as number[] | null) ?? [];
    const conditions = [eq(topicMastery.userId, userId)];
    if (enrolled.length > 0) {
      conditions.push(inArray(topicMastery.subjectId, enrolled));
    }
    return db.select()
      .from(topicMastery)
      .where(and(...conditions))
      .orderBy(asc(topicMastery.masteryScore))
      .limit(limit);
  }

  // XP levels: starter → learner → scholar → achiever → expert → master
  private static readonly XP_LEVELS: { level: string; minXP: number }[] = [
    { level: "master",   minXP: 1500 },
    { level: "expert",   minXP: 1000 },
    { level: "achiever", minXP:  600 },
    { level: "scholar",  minXP:  300 },
    { level: "learner",  minXP:  100 },
    { level: "starter",  minXP:    0 },
  ];

  private static resolveLevel(totalXP: number): string {
    for (const { level, minXP } of DatabaseStorage.XP_LEVELS) {
      if (totalXP >= minXP) return level;
    }
    return "starter";
  }

  async awardXP(userId: string, amount: number, _reason?: string): Promise<{ totalXP: number; currentLevel: string; levelledUp: boolean }> {
    const existing = await db.select({ totalXP: userXP.totalXP, currentLevel: userXP.currentLevel })
      .from(userXP).where(eq(userXP.userId, userId)).limit(1);
    const prevXP = existing[0]?.totalXP ?? 0;
    const prevLevel = existing[0]?.currentLevel ?? "starter";
    const newXP = prevXP + amount;
    const newLevel = DatabaseStorage.resolveLevel(newXP);
    await db.insert(userXP)
      .values({ userId, totalXP: newXP, currentLevel: newLevel, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: userXP.userId,
        set: { totalXP: newXP, currentLevel: newLevel, updatedAt: new Date() },
      });
    return { totalXP: newXP, currentLevel: newLevel, levelledUp: newLevel !== prevLevel };
  }

  async getTopicsForReview(userId: string): Promise<TopicMastery[]> {
    const now = new Date();
    return db.select()
      .from(topicMastery)
      .where(and(
        eq(topicMastery.userId, userId),
        sql`${topicMastery.nextReviewAt} <= ${now}`
      ))
      .orderBy(asc(topicMastery.nextReviewAt));
  }

  // Simulated Exams Methods
  async getSimulatedExamsBySubject(subjectId: number): Promise<SimulatedExam[]> {
    return db.select()
      .from(simulatedExams)
      .where(and(
        eq(simulatedExams.subjectId, subjectId),
        eq(simulatedExams.status, "active")
      ))
      .orderBy(asc(simulatedExams.examNumber));
  }

  async getSimulatedExam(id: number): Promise<SimulatedExam | undefined> {
    const [exam] = await db.select()
      .from(simulatedExams)
      .where(eq(simulatedExams.id, id));
    return exam;
  }

  async createSimulatedExam(exam: InsertSimulatedExam): Promise<SimulatedExam> {
    const [created] = await db.insert(simulatedExams)
      .values(exam)
      .returning();
    return created;
  }

  // Partner Schools Methods
  async getPartnerSchools(): Promise<PartnerSchool[]> {
    return db.select()
      .from(partnerSchools)
      .orderBy(desc(partnerSchools.totalReferrals));
  }

  async getPartnerSchoolById(id: number): Promise<PartnerSchool | undefined> {
    const [school] = await db.select()
      .from(partnerSchools)
      .where(eq(partnerSchools.id, id));
    return school;
  }

  async getPartnerSchoolByCode(code: string): Promise<PartnerSchool | undefined> {
    const [school] = await db.select()
      .from(partnerSchools)
      .where(eq(partnerSchools.schoolCode, code));
    return school;
  }

  async createPartnerSchool(school: InsertPartnerSchool): Promise<PartnerSchool> {
    const [created] = await db.insert(partnerSchools)
      .values(school)
      .returning();
    return created;
  }

  async updatePartnerSchoolStats(id: number, revenue: number): Promise<void> {
    await db.update(partnerSchools)
      .set({
        totalReferrals: sql`${partnerSchools.totalReferrals} + 1`,
        totalRevenue: sql`${partnerSchools.totalRevenue} + ${revenue}`,
        updatedAt: new Date()
      })
      .where(eq(partnerSchools.id, id));
  }

  // School Referrals Methods
  async getSchoolReferrals(partnerSchoolId: number): Promise<SchoolReferral[]> {
    return db.select()
      .from(schoolReferrals)
      .where(eq(schoolReferrals.partnerSchoolId, partnerSchoolId))
      .orderBy(desc(schoolReferrals.createdAt));
  }

  async createSchoolReferral(referral: Omit<InsertSchoolReferral, 'commissionAmount'>, commissionAmount: number, paymentReference?: string): Promise<SchoolReferral> {
    const [created] = await db.insert(schoolReferrals)
      .values({
        ...referral,
        commissionAmount,
        ...(paymentReference ? { paymentReference } : {}),
      })
      .returning();
    return created;
  }

  async updateReferralStatus(id: number, status: string): Promise<void> {
    await db.update(schoolReferrals)
      .set({ status })
      .where(eq(schoolReferrals.id, id));
  }

  // Daily Challenges
  async getDailyChallenge(userId: string, date: string, subjectId?: number | null): Promise<DailyChallenge | undefined> {
    const conditions = [
      eq(dailyChallenges.userId, userId),
      eq(dailyChallenges.challengeDate, date),
    ];
    if (subjectId != null) {
      conditions.push(eq(dailyChallenges.subjectId, subjectId));
    } else {
      conditions.push(isNull(dailyChallenges.subjectId));
    }
    const [challenge] = await db.select()
      .from(dailyChallenges)
      .where(and(...conditions))
      .orderBy(desc(dailyChallenges.createdAt))
      .limit(1);
    return challenge;
  }

  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const [created] = await db.insert(dailyChallenges)
      .values(challenge)
      .returning();
    return created;
  }

  async completeDailyChallenge(id: number, answersJson: any, score: number, timeSpentSeconds: number): Promise<DailyChallenge | undefined> {
    const [updated] = await db.update(dailyChallenges)
      .set({
        answersJson,
        score,
        timeSpentSeconds,
        completedAt: new Date()
      })
      .where(eq(dailyChallenges.id, id))
      .returning();
    return updated;
  }

  async getDailyChallengeHistory(userId: string, limit: number = 30): Promise<DailyChallenge[]> {
    return db.select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.userId, userId))
      .orderBy(desc(dailyChallenges.challengeDate))
      .limit(limit);
  }

  async getDailyChallengeStreak(userId: string): Promise<number> {
    const history = await db.select()
      .from(dailyChallenges)
      .where(and(
        eq(dailyChallenges.userId, userId),
        sql`${dailyChallenges.completedAt} IS NOT NULL`
      ))
      .orderBy(desc(dailyChallenges.challengeDate))
      .limit(60);
    
    if (history.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < history.length; i++) {
      const challengeDate = new Date(history[i].challengeDate);
      challengeDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);
      
      if (challengeDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // ============================================
  // SUBJECT BOOST & RESCUE PACKS (stubs)
  // ============================================

  async getSubjectBoostStatus(userId: string, subjectId: number): Promise<boolean> {
    const existing = await db
      .select()
      .from(subjectBoosts)
      .where(and(eq(subjectBoosts.userId, userId), eq(subjectBoosts.subjectId, subjectId)))
      .limit(1);
    return existing.length > 0;
  }

  async activateSubjectBoost(userId: string, subjectId: number): Promise<void> {
    const existing = await db
      .select()
      .from(subjectBoosts)
      .where(and(eq(subjectBoosts.userId, userId), eq(subjectBoosts.subjectId, subjectId)))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(subjectBoosts).values({ userId, subjectId });
    }
  }

  async getTriggeredRescuePacks(userId: string): Promise<any[]> {
    return db.select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.type, "rescue_pack")))
      .orderBy(desc(notifications.createdAt))
      .limit(10);
  }

  async triggerRescuePack(userId: string, type: 'topic' | 'subject', referenceId: number): Promise<void> {
    // Idempotency: skip if same (user, referenceId) rescue pack created in last 24 h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await db.select({ id: notifications.id })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.type, "rescue_pack"),
        gte(notifications.createdAt, since),
        sql`(${notifications.data}->>'referenceId')::int = ${referenceId}`,
      ))
      .limit(1);
    if (existing.length > 0) return;

    await db.insert(notifications).values({
      userId,
      type: "rescue_pack",
      titleEn: type === 'topic' ? "Rescue Pack Activated!" : "Subject Rescue Pack!",
      titleAf: type === 'topic' ? "Reddingspakket Geaktiveer!" : "Vak-reddingspakket!",
      messageEn: type === 'topic'
        ? "Your AI Tutor has prepared extra practice for your weak topic. Let's fix it!"
        : "You've been struggling with this subject. Here are targeted exercises to help.",
      messageAf: type === 'topic'
        ? "Jou AI Tutor het ekstra oefening vir jou swak onderwerp voorberei."
        : "Hier is geteikende oefeninge vir hierdie vak.",
      channel: "in_app",
      status: "pending",
      data: { referenceId, type },
    });
  }

  // ============================================
  // COIN WALLET
  // ============================================

  async getUserCoins(userId: string): Promise<UserCoins> {
    // Task #819 — wallet initialisation must tolerate concurrent first-writes.
    // The previous select-then-insert pattern threw unique_violation on
    // user_coins.user_id when two callers (e.g. badge award + daily login)
    // raced on a brand-new account. INSERT ... ON CONFLICT DO NOTHING makes
    // the initialisation idempotent; the follow-up SELECT then always returns
    // the row regardless of which call won the race.
    await db.insert(userCoins)
      .values({ userId, balance: 0, totalEarned: 0, totalSpent: 0 })
      .onConflictDoNothing({ target: userCoins.userId });
    const [row] = await db.select().from(userCoins).where(eq(userCoins.userId, userId));
    return row;
  }

  async awardCoins(userId: string, amount: number, type: string, description: string, referenceId?: string): Promise<UserCoins> {
    // Task #819 steps 1+2 — atomic SQL increment inside a transaction so
    // wallet balance and the ledger row always commit together. Eliminates
    // both the read-modify-write lost-update race and the "ledger entry
    // written without balance bump" inconsistency on partial failure.
    await this.getUserCoins(userId); // ensure wallet row exists
    const hasDoubleCoins = await this.hasActivePowerUp(userId, "double-coins");
    const effectiveAmount = hasDoubleCoins ? amount * 2 : amount;
    return await db.transaction(async (tx) => {
      const [updated] = await tx.update(userCoins)
        .set({
          balance: sql`${userCoins.balance} + ${effectiveAmount}`,
          totalEarned: sql`${userCoins.totalEarned} + ${effectiveAmount}`,
          updatedAt: new Date(),
        })
        .where(eq(userCoins.userId, userId))
        .returning();
      await tx.insert(coinTransactions).values({ userId, amount: effectiveAmount, type, description, referenceId: referenceId ?? null });
      return updated;
    });
  }

  async spendCoins(userId: string, amount: number, type: string, description: string, referenceId?: string): Promise<UserCoins> {
    // Task #819 steps 1+2 — atomic conditional decrement. The balance check
    // is enforced inside the UPDATE WHERE clause so two concurrent spends
    // cannot both pass a pre-flight check and drive balance negative. The
    // debit and the negative ledger row commit together via the transaction.
    await this.getUserCoins(userId); // ensure wallet row exists
    return await db.transaction(async (tx) => {
      const [updated] = await tx.update(userCoins)
        .set({
          balance: sql`${userCoins.balance} - ${amount}`,
          totalSpent: sql`${userCoins.totalSpent} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(and(
          eq(userCoins.userId, userId),
          sql`${userCoins.balance} >= ${amount}`,
        ))
        .returning();
      if (!updated) {
        const [current] = await tx.select().from(userCoins).where(eq(userCoins.userId, userId));
        throw new Error(`Insufficient coins. Need ${amount}, have ${current?.balance ?? 0}.`);
      }
      await tx.insert(coinTransactions).values({ userId, amount: -amount, type, description, referenceId: referenceId ?? null });
      return updated;
    });
  }

  async getCoinTransactions(userId: string): Promise<CoinTransaction[]> {
    return db.select().from(coinTransactions)
      .where(eq(coinTransactions.userId, userId))
      .orderBy(sql`${coinTransactions.createdAt} DESC`)
      .limit(20);
  }

  // ============================================
  // THEME UNLOCKS
  // ============================================

  async getUserUnlockedThemes(userId: string): Promise<string[]> {
    const rows = await db.select().from(userUnlockedThemes).where(eq(userUnlockedThemes.userId, userId));
    return rows.map(r => r.themeName);
  }

  async unlockTheme(userId: string, themeName: string, coinsCost: number): Promise<void> {
    await db.insert(userUnlockedThemes).values({ userId, themeName, coinsCost });
  }

  async hasActivePowerUp(userId: string, itemKey: string): Promise<boolean> {
    if (itemKey === "streak-freeze") {
      const result = await db.execute(
        sql`SELECT id FROM user_unlocks WHERE user_id = ${userId} AND item_key = ${itemKey} AND consumed_at IS NULL`
      );
      return (result.rows?.length ?? 0) > 0;
    }
    if (itemKey === "double-coins") {
      const result = await db.execute(
        sql`SELECT id FROM user_unlocks WHERE user_id = ${userId} AND item_key = ${itemKey} AND expires_at IS NOT NULL AND expires_at > NOW()`
      );
      return (result.rows?.length ?? 0) > 0;
    }
    return false;
  }

  async consumePowerUp(userId: string, itemKey: string): Promise<void> {
    await db.execute(
      sql`UPDATE user_unlocks SET consumed_at = NOW() WHERE user_id = ${userId} AND item_key = ${itemKey}`
    );
  }

  async savePushSubscription(userId: string, endpoint: string, p256dh: string, auth: string): Promise<PushSubscription> {
    const existing = await db.select().from(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
    if (existing.length > 0) {
      const [updated] = await db.update(pushSubscriptions)
        .set({ enabled: true })
        .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)))
        .returning();
      return updated;
    }
    const [created] = await db.insert(pushSubscriptions).values({ userId, endpoint, p256dh, auth, enabled: true }).returning();
    return created;
  }

  async getPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    return db.select().from(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.enabled, true)));
  }

  async getAllActivePushSubscriptions(): Promise<PushSubscription[]> {
    return db.select().from(pushSubscriptions).where(eq(pushSubscriptions.enabled, true));
  }

  async deletePushSubscription(userId: string, endpoint: string): Promise<void> {
    await db.delete(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
  }

  async disablePushSubscription(userId: string, endpoint: string): Promise<void> {
    await db.update(pushSubscriptions)
      .set({ enabled: false })
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
  }

  // ============================================
  // POPIA CONSENT RECORDS
  // ============================================

  async createConsentRecord(data: InsertConsentRecord): Promise<ConsentRecord> {
    const [created] = await db.insert(consentRecords).values(data as any).returning();
    return created;
  }

  async revokeConsent(id: number): Promise<ConsentRecord | undefined> {
    const [updated] = await db.update(consentRecords)
      .set({ revokedAt: new Date() })
      .where(eq(consentRecords.id, id))
      .returning();
    return updated;
  }

  async getConsentRecord(learnerId: string): Promise<ConsentRecord | undefined> {
    const [record] = await db.select().from(consentRecords)
      .where(and(
        eq(consentRecords.learnerId, learnerId),
        sql`${consentRecords.revokedAt} IS NULL`
      ))
      .orderBy(desc(consentRecords.consentTimestamp))
      .limit(1);
    return record;
  }

  async insertConsentLog(payload: InsertConsentLog): Promise<ConsentLog> {
    const [row] = await db.insert(consentLog).values(payload as any).returning();
    return row;
  }

  async getConsentLog(userId: string): Promise<ConsentLog[]> {
    return db
      .select()
      .from(consentLog)
      .where(eq(consentLog.userId, userId))
      .orderBy(desc(consentLog.createdAt));
  }

  async insertAuditLog(entry: { userId: string; action: string; target?: string; metadata?: Record<string, any>; ipAddress?: string }): Promise<void> {
    try {
      await db.insert(auditLog).values({
        adminUserId: entry.userId,
        action: entry.action,
        entityType: entry.target || 'system',
        entityId: null,
        details: {
          metadata: entry.metadata || {},
          ipAddress: entry.ipAddress || null,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error('[AuditLog] Failed to write audit log entry:', err);
    }
  }

  async getBillingActionLog(limit = 50): Promise<Array<{
    id: number;
    adminUserId: string;
    action: string;
    details: any;
    createdAt: Date | null;
  }>> {
    try {
      const rows = await db
        .select()
        .from(auditLog)
        .where(
          sql`${auditLog.action} LIKE 'billing.%'`
        )
        .orderBy(desc(auditLog.createdAt))
        .limit(limit);
      return rows;
    } catch (err) {
      console.error('[AuditLog] Failed to fetch billing action log:', err);
      return [];
    }
  }

  async isParentOfLearner(parentId: string, learnerId: string): Promise<boolean> {
    // Task #48 — accept any parent_links row that pairs the parent with the
    // learner, regardless of `status`, so authorization does not silently
    // break when a row exists with the learner attached but `status` has not
    // yet been flipped to "activated". This intentionally does NOT depend on
    // the subscriptions table.
    const [link] = await db.select().from(parentLinks)
      .where(and(
        eq(parentLinks.parentUserId, parentId),
        eq(parentLinks.learnerUserId, learnerId)
      ))
      .limit(1);
    return !!link;
  }

  async getLearnersForParent(parentId: string): Promise<Array<{ learnerUserId: string; learnerName: string }>> {
    // Task #48 — fallback-friendly resolution. The parent dashboard must work
    // independently of the `subscriptions` table. We resolve linked learners
    // purely from `parent_links`: prefer activated rows, but also include any
    // row that already has a learnerUserId attached even if `status` was not
    // yet flipped to "activated" (e.g. a webhook racing with the redirect).
    // This means a parent can see their child's progress as soon as the link
    // is established, without requiring any subscription row to exist.
    const rows = await db.select({
      learnerUserId: parentLinks.learnerUserId,
      learnerName: parentLinks.learnerName,
      status: parentLinks.status,
      activatedAt: parentLinks.activatedAt,
    }).from(parentLinks)
      .where(eq(parentLinks.parentUserId, parentId));

    const out: Array<{ learnerUserId: string; learnerName: string }> = [];
    const seen = new Set<string>();
    // Sort: activated first, then anything with an activatedAt timestamp,
    // then the rest. Keeps dashboard order stable + privileges real links.
    const sorted = [...rows].sort((a, b) => {
      const aAct = a.status === "activated" ? 0 : a.activatedAt ? 1 : 2;
      const bAct = b.status === "activated" ? 0 : b.activatedAt ? 1 : 2;
      return aAct - bAct;
    });
    for (const r of sorted) {
      if (!r.learnerUserId || seen.has(r.learnerUserId)) continue;
      seen.add(r.learnerUserId);
      out.push({ learnerUserId: r.learnerUserId, learnerName: r.learnerName });
    }
    return out;
  }

  // Partner Attribution — admin-only update.
  // This is the ONLY path through which first_touch_source may be changed after initial insert.
  // All calls MUST be accompanied by an audit log entry (enforced at the route layer).
  async updateFirstTouchSource(targetUserId: string, source: string): Promise<void> {
    await db.update(users)
      .set({ firstTouchSource: source, updatedAt: new Date() })
      .where(eq(users.id, targetUserId));
  }

  // ============================================
  // ACCOUNT LOCKOUT (AUTHENTICATION HARDENING)
  // ============================================

  private getLockDurationMinutes(failureCount: number): number {
    const schedule: [number, number][] = [
      [10, 480], [9, 240], [8, 120], [7, 60], [6, 30], [5, 15],
    ];
    for (const [threshold, minutes] of schedule) {
      if (failureCount >= threshold) return minutes;
    }
    return 15;
  }

  async incrementLoginFailures(userId: string): Promise<{ locked: boolean; lockedUntil: Date | null }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return { locked: false, lockedUntil: null };

    const newFailureCount = (user.failedLoginAttempts ?? 0) + 1;
    const shouldLock = newFailureCount >= 5;
    const lockDurationMs = shouldLock ? this.getLockDurationMinutes(newFailureCount) * 60 * 1000 : 0;
    const lockedUntil = shouldLock ? new Date(Date.now() + lockDurationMs) : null;

    await db.update(users)
      .set({
        failedLoginAttempts: newFailureCount,
        isLocked: shouldLock,
        lockedAt: shouldLock ? new Date() : user.lockedAt,
        lockedUntil,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return { locked: shouldLock, lockedUntil };
  }

  async resetLoginFailures(userId: string): Promise<void> {
    await db.update(users)
      .set({
        failedLoginAttempts: 0,
        isLocked: false,
        lockedAt: null,
        lockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async isAccountLocked(userId: string): Promise<{ locked: boolean; lockedUntil: Date | null }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return { locked: false, lockedUntil: null };

    if (!user.isLocked) return { locked: false, lockedUntil: null };

    if (user.lockedUntil && new Date() > user.lockedUntil) {
      await db.update(users)
        .set({ isLocked: false, lockedUntil: null, updatedAt: new Date() })
        .where(eq(users.id, userId));
      return { locked: false, lockedUntil: null };
    }

    return { locked: true, lockedUntil: user.lockedUntil ?? null };
  }

  async forceUnlockAccount(userId: string): Promise<void> {
    await db.update(users)
      .set({
        isLocked: false,
        lockedAt: null,
        lockedUntil: null,
        failedLoginAttempts: 0,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Hard-delete a user and every row that references them. The schema has
  // no DB-level FK constraints to users, so we sweep all known link-column
  // patterns (user_id, parent_user_id, learner_user_id, parent_id,
  // learner_id, referrer_id, referred_id, referee_user_id, created_by,
  // assigned_to) across every public table, then delete the users row —
  // all inside a single transaction so a partial failure rolls back.
  async deleteUser(userId: string): Promise<void> {
    const linkColumnPatterns = [
      "user_id",
      "parent_user_id",
      "learner_user_id",
      "parent_id",
      "learner_id",
      "referrer_id",
      "referred_id",
      "referee_user_id",
      "created_by",
      "assigned_to",
    ];

    // Pull (table, column) pairs that match our patterns from information_schema.
    const colsResult = await db.execute(sql`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name <> 'users'
        AND column_name = ANY(${sql`ARRAY[${sql.join(linkColumnPatterns.map(p => sql`${p}`), sql`, `)}]::text[]`})
    `);

    // assertSafeIdentifier enforces that a string is a plain SQL identifier
    // (letters, digits, underscores only, must start with a letter or
    // underscore). This is required because Drizzle's parameterised builders
    // cannot express dynamic identifiers — sql.raw() must be used for the
    // GDPR erasure DELETE loop below. The guard makes the implicit regex check
    // explicit and auditable: any row whose table_name or column_name fails
    // validation is dropped from the work-set and never reaches sql.raw().
    function assertSafeIdentifier(name: string): void {
      if (!/^[a-z_][a-z0-9_]*$/i.test(name)) {
        throw new Error(`[gdpr-erase] Unsafe SQL identifier rejected: "${name}"`);
      }
    }

    const targets = (colsResult.rows as any[]).filter((r) => {
      try {
        assertSafeIdentifier(r.table_name);
        assertSafeIdentifier(r.column_name);
        return true;
      } catch {
        return false;
      }
    });

    await db.transaction(async (tx) => {
      for (const t of targets) {
        // Identifiers have already passed assertSafeIdentifier() above, so
        // it is safe to inline them via sql.raw(). sql.raw() is required here
        // because Drizzle's parameterised builders cannot interpolate dynamic
        // table/column identifiers — only literal values. The userId is still
        // bound as a proper parameterised value.
        assertSafeIdentifier(t.table_name);  // belt-and-suspenders: re-assert at point of use
        assertSafeIdentifier(t.column_name); // belt-and-suspenders: re-assert at point of use
        await tx.execute(sql`
          DELETE FROM ${sql.raw(`"${t.table_name}"`)}
          WHERE ${sql.raw(`"${t.column_name}"`)} = ${userId}
        `);
      }
      await tx.delete(users).where(eq(users.id, userId));
    });
  }

  // ============================================
  // REFERRAL FRAUD DETECTION (T014)
  // ============================================

  async createReferralFlag(data: {
    referrerId: string;
    referredId: string;
    flagReason: "same_ip" | "burst_pattern" | "low_engagement";
    commissionHalted?: boolean;
    metadata?: Record<string, any>;
  }): Promise<ReferralFlag> {
    const [created] = await db.insert(referralFlags).values({
      referrerId: data.referrerId,
      referredId: data.referredId,
      flagReason: data.flagReason,
      commissionHalted: data.commissionHalted ?? false,
      metadata: data.metadata ?? null,
      reviewed: false,
    }).returning();
    return created;
  }

  async getReferralFlags(filters?: { reviewed?: boolean; referrerId?: string }): Promise<ReferralFlag[]> {
    const conditions = [];
    if (filters?.reviewed !== undefined) {
      conditions.push(eq(referralFlags.reviewed, filters.reviewed));
    }
    if (filters?.referrerId) {
      conditions.push(eq(referralFlags.referrerId, filters.referrerId));
    }
    const query = db.select().from(referralFlags);
    if (conditions.length > 0) {
      return query.where(and(...conditions)).orderBy(desc(referralFlags.flaggedAt));
    }
    return query.orderBy(desc(referralFlags.flaggedAt));
  }

  async markReferralFlagReviewed(flagId: number, reviewedBy: string): Promise<ReferralFlag | undefined> {
    const [updated] = await db.update(referralFlags)
      .set({ reviewed: true, reviewedBy })
      .where(eq(referralFlags.id, flagId))
      .returning();
    return updated;
  }

  async incrementReferralFlagBlockedAttempts(referrerId: string): Promise<void> {
    const now = new Date().toISOString();
    await db.execute(sql`
      UPDATE referral_flags
      SET metadata = jsonb_set(
        jsonb_set(
          COALESCE(metadata, '{}')::jsonb,
          '{blockedAttempts}',
          ((COALESCE((COALESCE(metadata, '{}')::jsonb->>'blockedAttempts')::int, 0) + 1)::text)::jsonb
        ),
        '{lastBlockedAt}',
        to_jsonb(${now}::text)
      )
      WHERE referrer_id = ${referrerId}
        AND commission_halted = true
        AND reviewed = false
    `);
  }

  async getReferralCountInWindow(referrerId: string, windowDays: number): Promise<number> {
    const windowStart = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(schoolReferrals)
      .where(
        sql`${schoolReferrals.createdAt} >= ${windowStart}`
      );
    return Number(result[0]?.count ?? 0);
  }

  async hasExistingReferralFlag(referrerId: string, referredId: string, reason: string): Promise<boolean> {
    const [existing] = await db.select({ id: referralFlags.id })
      .from(referralFlags)
      .where(and(
        eq(referralFlags.referrerId, referrerId),
        eq(referralFlags.referredId, referredId),
        eq(referralFlags.flagReason, reason as any)
      ))
      .limit(1);
    return !!existing;
  }

  // ============================================
  // JWT REFRESH TOKENS
  // ============================================

  async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken> {
    const [created] = await db.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt,
      revoked: false,
    }).returning();
    return created;
  }

  async getRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | undefined> {
    const [token] = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
    return token;
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await db.update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await db.update(refreshTokens)
      .set({ revoked: true })
      .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.revoked, false)));
  }

  async revokeRefreshTokenAtomic(tokenHash: string): Promise<RefreshToken | undefined> {
    const result = await pool.query<{
      id: number; user_id: string; token_hash: string;
      expires_at: Date; revoked: boolean; created_at: Date;
    }>(
      `UPDATE refresh_tokens
       SET revoked = true
       WHERE token_hash = $1 AND revoked = false AND expires_at > NOW()
       RETURNING *`,
      [tokenHash]
    );
    if (result.rows.length === 0) return undefined;
    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: row.expires_at,
      revoked: row.revoked,
      createdAt: row.created_at,
    };
  }

  async deleteUserSessions(userId: string): Promise<number> {
    const result = await pool.query(
      `DELETE FROM sessions WHERE sess->'passport'->'user'->'claims'->>'sub' = $1`,
      [userId]
    );
    return result.rowCount ?? 0;
  }

  async createNotification(data: { userId: string; type: string; titleEn: string; titleAf: string; messageEn: string; messageAf: string; channel?: string; data?: any }): Promise<any> {
    const [row] = await db.insert(notifications).values({
      userId: data.userId,
      type: data.type,
      titleEn: data.titleEn,
      titleAf: data.titleAf,
      messageEn: data.messageEn,
      messageAf: data.messageAf,
      channel: data.channel ?? "push",
      status: "sent",
      data: data.data ?? null,
      sentAt: new Date(),
    }).returning();
    return row;
  }

  async getNotificationsForUser(userId: string, limit = 20): Promise<any[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  // ============================================
  // NSC TIMETABLE STORAGE METHODS (T114)
  // ============================================

  async getNscTimetable(
    yearOrFilters?: number | { year?: number; session?: string; sessionTime?: string; subjectName?: string },
    session?: string,
  ): Promise<any[]> {
    let year: number | undefined;
    let sess: string | undefined;
    let startTime: string | undefined;
    let subjectName: string | undefined;
    if (typeof yearOrFilters === "number") {
      year = yearOrFilters;
      sess = session;
    } else if (yearOrFilters && typeof yearOrFilters === "object") {
      year = yearOrFilters.year;
      sess = yearOrFilters.session;
      startTime = yearOrFilters.sessionTime;
      subjectName = yearOrFilters.subjectName;
    }
    const conditions: SQL<unknown>[] = [];
    if (year !== undefined) conditions.push(eq(nscTimetable.year, year));
    if (sess) conditions.push(eq(nscTimetable.session, sess));
    if (startTime) conditions.push(eq(nscTimetable.startTime, startTime));
    if (subjectName) conditions.push(sql`lower(${nscTimetable.subjectName}) like ${"%" + subjectName.toLowerCase() + "%"}`);
    const query = db.select().from(nscTimetable);
    if (conditions.length > 0) {
      return query.where(and(...conditions)).orderBy(nscTimetable.examDate, nscTimetable.startTime);
    }
    return query.orderBy(nscTimetable.examDate, nscTimetable.startTime);
  }

  async getLearnerExamSchedule(userId: string): Promise<any[]> {
    const { learnerExamSchedule } = await import("@shared/schema");
    return db.select().from(learnerExamSchedule)
      .where(eq(learnerExamSchedule.userId, userId))
      .orderBy(learnerExamSchedule.examDate, learnerExamSchedule.startTime);
  }

  async logTimetableUpload(data: {
    uploadedBy: string;
    year: number;
    session: string;
    entriesImported: number;
    mappingsCreated: number;
    schedulesRegenerated: number;
    status: string;
    errorMessage?: string;
  }): Promise<void> {
    const { timetableUploadLog } = await import("@shared/schema");
    await db.insert(timetableUploadLog).values({
      uploadedBy: data.uploadedBy,
      year: data.year,
      session: data.session,
      entriesImported: data.entriesImported,
      mappingsCreated: data.mappingsCreated,
      schedulesRegenerated: data.schedulesRegenerated,
      status: data.status,
      errorMessage: data.errorMessage ?? null,
    });
  }

  async getTimetableUploadLogs(): Promise<any[]> {
    const { timetableUploadLog } = await import("@shared/schema");
    return db.select().from(timetableUploadLog)
      .orderBy(desc(timetableUploadLog.uploadedAt))
      .limit(50);
  }

  async getSystemConfigValue(key: string): Promise<unknown | undefined> {
    const [row] = await db.select().from(systemConfig).where(eq(systemConfig.key, key));
    return row?.value;
  }

  async setSystemConfigValue(key: string, value: unknown, updatedBy?: string): Promise<void> {
    await db.insert(systemConfig)
      .values({ key, value: value as any, updatedAt: new Date(), updatedBy: updatedBy ?? null })
      .onConflictDoUpdate({
        target: systemConfig.key,
        set: { value: value as any, updatedAt: new Date(), updatedBy: updatedBy ?? null },
      });
  }
}

export const storage = new DatabaseStorage();
