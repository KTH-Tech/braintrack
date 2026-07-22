/**
 * Create (or remove) the demo learner + demo parent used to review the product.
 *
 * WHY THIS EXISTS
 * ---------------
 * The owner needs to sign in and see what a real learner and a real parent see,
 * against data that looks alive. Previously that need was met by creating ad-hoc
 * accounts in production, which is exactly how production ended up with 7 junk
 * users whose activity was being counted as business data.
 *
 * The fix is structural, not procedural: these accounts carry `users.is_demo =
 * true`, and every admin metric filters `is_demo = false`. A demo account cannot
 * leak into a number the owner is trying to trust, even if someone forgets it
 * exists. See migrations/0031_users_is_demo.sql.
 *
 * WHAT IT CREATES
 * ---------------
 * One learner and one parent, linked through `parent_links`, both `is_demo`.
 * The learner is deliberately mid-journey — roughly three weeks in, a live
 * streak, ~68% accuracy, a mix of strong and weak topics. Not brand new (empty
 * dashboards prove nothing) and not finished (a maxed-out learner hides the
 * product's actual job).
 *
 * PASSWORD
 * --------
 * Read from the DEMO_PASSWORD environment variable and hashed with the same
 * bcrypt cost the real signup path uses (server/local-auth.ts). No password is
 * invented, embedded, defaulted or printed — the owner chooses it, so the owner
 * is the only one who knows it.
 *
 * IDEMPOTENCY
 * -----------
 * Re-running is safe. Seeding clears the two accounts' child rows first, then
 * writes fresh ones, so a second run replaces rather than duplicates. Because
 * the generator is seeded with a fixed PRNG, a re-run also reproduces the same
 * data rather than drifting.
 *
 * REMOVAL
 * -------
 * `--remove` deletes both accounts and every related row, children first, in a
 * single transaction. `users` has NO foreign keys pointing at it, so there is no
 * cascade — a naive DELETE would orphan rows across ~21 tables. This mirrors
 * scripts/purge-test-accounts.ts, including the Drizzle gotcha that binding a JS
 * array to ANY() fails and must be expanded to an explicit IN list.
 *
 * USAGE
 * -----
 *   DEMO_PASSWORD='<chosen password>' npx tsx scripts/seed-demo-accounts.ts
 *   npx tsx scripts/seed-demo-accounts.ts --remove --confirm
 *   npx tsx scripts/seed-demo-accounts.ts --remove            (dry run)
 */
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "../server/db";

// Matches BCRYPT_COST in server/local-auth.ts. If that changes, change this too,
// otherwise demo accounts get a weaker hash than real ones.
const BCRYPT_COST = 12;
// Matches the min length registerSchema enforces on real signups.
const MIN_PASSWORD_LENGTH = 10;

// Fixed ids so the script is idempotent and so the rows are recognisable at a
// glance in any ad-hoc query.
const LEARNER_ID = "demo-learner-0001";
const PARENT_ID = "demo-parent-0001";
const LINK_TOKEN = "demo-parent-link-0001";

// `.invalid` is reserved by RFC 2606 and never resolves, so no message this app
// generates for a demo account can ever reach a real inbox. Sign-in is unaffected
// (it is email + password, not an email round-trip).
const LEARNER_EMAIL = "demo.learner@braintrack.invalid";
const PARENT_EMAIL = "demo.parent@braintrack.invalid";

// Subjects with genuinely deep released coverage, so attempts draw from real DBE
// questions. Mathematics is deliberately absent — ~63 released of 2,273, which
// would produce a thin, repetitive dashboard.
const DEMO_SUBJECT_NAMES = ["Geography", "Business Studies", "Economics", "Accounting", "Life Sciences", "English First Additional Language"];

const GRADE = 12;
const DAYS_ACTIVE = 24; // how far back the learner's history stretches
const TARGET_ATTEMPTS = 148;
const TARGET_ACCURACY = 0.68;

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

// Every table holding rows owned by a user, and the column that points at them.
// parent_links appears twice because a demo account sits on either side of it.
// Keep this in sync with scripts/purge-test-accounts.ts.
const CHILD_TABLES: Array<[string, string]> = [
  ["activity_events", "user_id"],
  ["attempts", "user_id"],
  ["coin_transactions", "user_id"],
  ["consent_log", "user_id"],
  ["daily_challenges", "user_id"],
  ["learner_exam_schedule", "user_id"],
  ["learning_events", "user_id"],
  ["notifications", "user_id"],
  ["onboarding_results", "user_id"],
  ["parent_links", "parent_user_id"],
  ["parent_links", "learner_user_id"],
  ["personal_bests", "user_id"],
  ["prep_scores", "user_id"],
  ["refresh_tokens", "user_id"],
  ["study_sessions", "user_id"],
  ["subscriptions", "user_id"],
  ["topic_mastery", "user_id"],
  ["user_badges", "user_id"],
  ["user_coins", "user_id"],
  ["user_progress", "user_id"],
  ["user_streaks", "user_id"],
];

/**
 * Deterministic PRNG (mulberry32). A fixed seed means re-running the script
 * reproduces byte-identical demo data instead of quietly drifting each time,
 * which makes "did my change break the demo dashboard?" answerable.
 */
function makeRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = makeRandom(20260721);
const pick = <T>(xs: T[]): T => xs[Math.floor(rand() * xs.length)];
const between = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));

/** N days before now, at a plausible after-school hour. */
function daysAgo(n: number, hour = 16): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, between(0, 59), between(0, 59), 0);
  return d;
}

/** Expand ids into an explicit IN list — Drizzle binds a JS array as a single
 *  parameter, which ANY() rejects with "requires array on right side". */
const idList = (ids: string[]) => sql.join(ids.map((i) => sql`${i}`), sql`, `);

async function deleteChildRows(ids: string[]): Promise<number> {
  let removed = 0;
  for (const [table, col] of CHILD_TABLES) {
    const res = await db.execute(
      sql`DELETE FROM ${sql.identifier(table)} WHERE ${sql.identifier(col)} IN (${idList(ids)})`,
    );
    const n = (res as any).rowCount ?? 0;
    if (n > 0) {
      removed += n;
      log(`   ${table}.${col}: ${n}`);
    }
  }
  return removed;
}

// ─────────────────────────────────────────────────────────────────────────────
// REMOVE
// ─────────────────────────────────────────────────────────────────────────────

async function remove() {
  const confirm = process.argv.includes("--confirm");

  const found = await db.execute(sql`
    SELECT id, email, role, is_demo FROM users WHERE id IN (${idList([LEARNER_ID, PARENT_ID])})
  `);
  const rows = (found as any).rows as Array<{ id: string; email: string; role: string; is_demo: boolean }>;

  if (rows.length === 0) {
    log("No demo accounts present. Nothing to remove.");
    return;
  }

  // Refuse to touch anything that is not flagged demo. If a real account has
  // somehow taken one of these ids, deleting it would be the exact failure this
  // whole facility exists to prevent.
  const notDemo = rows.filter((r) => !r.is_demo);
  if (notDemo.length > 0) {
    throw new Error(
      `Refusing to delete: ${notDemo.map((r) => r.email).join(", ")} ` +
        `occupies a demo id but is NOT flagged is_demo. Investigate by hand.`,
    );
  }

  log(`Removing ${rows.length} demo account(s):`);
  rows.forEach((r) => log(`   ${r.email} (${r.role})`));

  if (!confirm) {
    log("DRY RUN — re-run with --remove --confirm to apply.");
    return;
  }

  const ids = rows.map((r) => r.id);
  await db.execute(sql`BEGIN`);
  try {
    const removed = await deleteChildRows(ids);
    const userRes = await db.execute(sql`DELETE FROM users WHERE id IN (${idList(ids)})`);
    await db.execute(sql`COMMIT`);
    log(`DONE — ${(userRes as any).rowCount ?? 0} accounts, ${removed} related rows removed.`);
  } catch (err) {
    await db.execute(sql`ROLLBACK`);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────────────────────────────────────

type Subject = { id: number; name: string };
type Topic = { id: number; subjectId: number; name: string };

async function seed() {
  const password = process.env.DEMO_PASSWORD;
  if (!password) {
    throw new Error(
      "DEMO_PASSWORD is not set.\n" +
        "  This script never invents a password. Choose one and pass it in:\n" +
        "    DEMO_PASSWORD='<your password>' npx tsx scripts/seed-demo-accounts.ts",
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `DEMO_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters ` +
        `(the same minimum real signups enforce).`,
    );
  }

  // Guard against seeding onto a database that has not had the migration
  // applied — otherwise the accounts would be created WITHOUT the exclusion
  // flag and would silently pollute every metric.
  const col = await db.execute(sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_demo'
  `);
  if ((col as any).rows.length === 0) {
    throw new Error(
      "users.is_demo does not exist on this database. Apply " +
        "migrations/0031_users_is_demo.sql first — without it these accounts " +
        "would be counted as real users.",
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  // ── Resolve real content ──────────────────────────────────────────────────
  const subjectRows = await db.execute(sql`
    SELECT id, name FROM subjects
    WHERE name IN (${sql.join(DEMO_SUBJECT_NAMES.map((n) => sql`${n}`), sql`, `)})
    ORDER BY id
  `);
  const subjects = ((subjectRows as any).rows as any[]).map(
    (r): Subject => ({ id: Number(r.id), name: String(r.name) }),
  );
  if (subjects.length === 0) {
    throw new Error(
      `None of ${DEMO_SUBJECT_NAMES.join(", ")} exist in the subjects table — ` +
        `cannot build a realistic demo learner.`,
    );
  }
  log(`Subjects: ${subjects.map((s) => `${s.name}(${s.id})`).join(", ")}`);

  const subjectIds = subjects.map((s) => s.id);
  const topicRows = await db.execute(sql`
    SELECT id, subject_id, name FROM topics
    WHERE subject_id IN (${sql.join(subjectIds.map((i) => sql`${i}`), sql`, `)})
    ORDER BY subject_id, id
  `);
  const topics = ((topicRows as any).rows as any[]).map(
    (r): Topic => ({ id: Number(r.id), subjectId: Number(r.subject_id), name: String(r.name) }),
  );
  log(`Topics available: ${topics.length}`);

  // Real released DBE questions, so every attempt points at content the learner
  // could actually have seen.
  const questionRows = await db.execute(sql`
    SELECT id, subject, marks, cognitive_level
    FROM dbe_verbatim_questions
    WHERE released_at IS NOT NULL
      AND subject IN (${sql.join(subjects.map((s) => sql`${s.name}`), sql`, `)})
    ORDER BY id
    LIMIT 4000
  `);
  const questions = ((questionRows as any).rows as any[]).map((r) => ({
    id: Number(r.id),
    subject: String(r.subject),
    marks: r.marks != null ? Number(r.marks) : 3,
    cognitiveLevel: r.cognitive_level ? String(r.cognitive_level) : "application",
  }));
  if (questions.length === 0) {
    throw new Error(
      "No released dbe_verbatim_questions found for the demo subjects. " +
        "Seeding would produce an empty dashboard — aborting.",
    );
  }
  log(`Released questions to draw from: ${questions.length}`);

  const questionsBySubject = new Map<string, typeof questions>();
  for (const q of questions) {
    if (!questionsBySubject.has(q.subject)) questionsBySubject.set(q.subject, []);
    questionsBySubject.get(q.subject)!.push(q);
  }
  // Only keep subjects that actually have released content behind them.
  const usableSubjects = subjects.filter((s) => (questionsBySubject.get(s.name)?.length ?? 0) > 0);
  log(`Usable subjects: ${usableSubjects.map((s) => s.name).join(", ")}`);

  await db.execute(sql`BEGIN`);
  try {
    // ── Wipe any previous run's data (this is what makes re-runs safe) ───────
    log("Clearing any previous demo data…");
    await deleteChildRows([LEARNER_ID, PARENT_ID]);

    // ── Accounts ────────────────────────────────────────────────────────────
    // is_demo = true is the whole point. role_confirmed skips the role picker so
    // the owner lands straight on the dashboard.
    await db.execute(sql`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, role, role_confirmed,
        is_demo, grade, school_name, theme, preferred_language, selected_subjects,
        is_locked, failed_login_attempts, last_login_at, created_at, updated_at
      ) VALUES (
        ${LEARNER_ID}, ${LEARNER_EMAIL}, ${passwordHash}, 'Demo', 'Learner', 'learner', true,
        true, ${GRADE}, 'Demo High School', 'dark', 'en',
        ${JSON.stringify(usableSubjects.map((s) => s.id))}::jsonb,
        false, 0, ${daysAgo(0, 15)}, ${daysAgo(DAYS_ACTIVE, 9)}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        role_confirmed = EXCLUDED.role_confirmed,
        is_demo = EXCLUDED.is_demo,
        grade = EXCLUDED.grade,
        school_name = EXCLUDED.school_name,
        selected_subjects = EXCLUDED.selected_subjects,
        is_locked = false,
        failed_login_attempts = 0,
        last_login_at = EXCLUDED.last_login_at,
        updated_at = NOW()
    `);

    await db.execute(sql`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, role, role_confirmed,
        is_demo, theme, preferred_language, is_locked, failed_login_attempts,
        last_login_at, created_at, updated_at
      ) VALUES (
        ${PARENT_ID}, ${PARENT_EMAIL}, ${passwordHash}, 'Demo', 'Parent', 'parent', true,
        true, 'dark', 'en', false, 0, ${daysAgo(1, 20)}, ${daysAgo(DAYS_ACTIVE, 9)}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        role_confirmed = EXCLUDED.role_confirmed,
        is_demo = EXCLUDED.is_demo,
        is_locked = false,
        failed_login_attempts = 0,
        last_login_at = EXCLUDED.last_login_at,
        updated_at = NOW()
    `);
    log("Accounts written (is_demo = true).");

    // ── Parent ↔ learner link ───────────────────────────────────────────────
    // report_email_opt_out = true: belt and braces on top of the .invalid
    // address, so the scheduled parent-report job never tries to mail a demo.
    await db.execute(sql`
      INSERT INTO parent_links (
        parent_user_id, learner_user_id, activation_token, learner_name,
        status, activated_at, report_email_opt_out, created_at
      ) VALUES (
        ${PARENT_ID}, ${LEARNER_ID}, ${LINK_TOKEN}, 'Demo Learner',
        'activated', ${daysAgo(DAYS_ACTIVE - 1)}, true, ${daysAgo(DAYS_ACTIVE)}
      )
      ON CONFLICT (activation_token) DO UPDATE SET
        parent_user_id = EXCLUDED.parent_user_id,
        learner_user_id = EXCLUDED.learner_user_id,
        status = EXCLUDED.status,
        activated_at = EXCLUDED.activated_at,
        report_email_opt_out = EXCLUDED.report_email_opt_out
    `);

    // ── Onboarding ──────────────────────────────────────────────────────────
    await db.execute(sql`
      INSERT INTO onboarding_results (
        user_id, learning_style, study_preference, focus_duration,
        challenges, goals, preferred_language, selected_subjects, completed_at
      ) VALUES (
        ${LEARNER_ID}, 'visual', 'solo', 45,
        ARRAY['time_management','exam_stress']::text[],
        ARRAY['improve_marks','build_confidence']::text[],
        'en',
        ARRAY[${sql.join(usableSubjects.map((s) => sql`${s.id}`), sql`, `)}]::integer[],
        ${daysAgo(DAYS_ACTIVE, 9)}
      )
    `);

    // ── Attempts, drawn from real released questions ────────────────────────
    // Accuracy is targeted at ~68% and jittered per subject so the dashboard
    // shows a believable spread of strengths rather than one flat number.
    let totalAttempts = 0;
    let totalCorrect = 0;
    const perSubject = new Map<number, { attempted: number; correct: number }>();

    const perSubjectTarget = Math.floor(TARGET_ATTEMPTS / usableSubjects.length);
    for (const subject of usableSubjects) {
      const pool = questionsBySubject.get(subject.name)!;
      // ±10 percentage points around the target, so subjects differ.
      const subjectAccuracy = Math.min(0.9, Math.max(0.45, TARGET_ACCURACY + (rand() - 0.5) * 0.2));
      let attempted = 0;
      let correct = 0;

      for (let i = 0; i < perSubjectTarget; i++) {
        const q = pool[Math.floor(rand() * pool.length)];
        const isCorrect = rand() < subjectAccuracy;
        const marksAvailable = Math.max(1, Math.min(10, q.marks || 3));
        // Partial credit when wrong — a learner rarely scores a flat zero.
        const marksAwarded = isCorrect
          ? marksAvailable
          : Math.floor(marksAvailable * (rand() * 0.4));
        const expected = marksAvailable * 90;
        const timeSpent = Math.round(expected * (0.7 + rand() * 0.8));
        const errorType = isCorrect ? "none" : pick(["concept", "method", "language"]);
        const created = daysAgo(between(0, DAYS_ACTIVE - 1));

        await db.execute(sql`
          INSERT INTO attempts (
            user_id, dbe_verbatim_question_id, answer_text, is_correct,
            marks_awarded, marks_available, error_type, time_spent_seconds,
            expected_time_seconds, cognitive_level, created_at
          ) VALUES (
            ${LEARNER_ID}, ${q.id}, 'Demo practice answer', ${isCorrect},
            ${marksAwarded}, ${marksAvailable}, ${errorType}, ${timeSpent},
            ${expected}, ${q.cognitiveLevel}, ${created}
          )
        `);
        attempted++;
        if (isCorrect) correct++;
      }

      perSubject.set(subject.id, { attempted, correct });
      totalAttempts += attempted;
      totalCorrect += correct;
    }
    log(
      `Attempts: ${totalAttempts} (${Math.round((totalCorrect / totalAttempts) * 100)}% correct)`,
    );

    // ── Per-subject progress + personal bests ───────────────────────────────
    for (const subject of usableSubjects) {
      const p = perSubject.get(subject.id)!;
      await db.execute(sql`
        INSERT INTO user_progress (
          user_id, subject_id, papers_completed, questions_attempted,
          correct_answers, last_accessed_at, created_at
        ) VALUES (
          ${LEARNER_ID}, ${subject.id}, ${between(1, 3)}, ${p.attempted},
          ${p.correct}, ${daysAgo(between(0, 3))}, ${daysAgo(DAYS_ACTIVE - 1)}
        )
      `);

      const bestScore = Math.min(96, Math.round((p.correct / p.attempted) * 100) + between(6, 16));
      await db.execute(sql`
        INSERT INTO personal_bests (
          user_id, subject_id, highest_score, highest_score_at,
          best_streak, total_sessions, updated_at
        ) VALUES (
          ${LEARNER_ID}, ${subject.id}, ${bestScore}, ${daysAgo(between(2, 12))},
          ${between(4, 11)}, ${between(3, 8)}, NOW()
        )
      `);
    }

    // ── Topic mastery — a real spread, not uniformly good ────────────────────
    // Bands follow the app's own thresholds: red <60, amber 60–75, green >75.
    let masteryRows = 0;
    for (const subject of usableSubjects) {
      const subjectTopics = topics.filter((t) => t.subjectId === subject.id);
      // Up to 5 topics per subject — enough for "weak topics" widgets to have
      // something to rank without pretending the learner covered everything.
      for (const topic of subjectTopics.slice(0, 5)) {
        const score = between(38, 88);
        const band = score > 75 ? "green" : score >= 60 ? "amber" : "red";
        const attempted = between(6, 22);
        const correct = Math.max(1, Math.round(attempted * (score / 100)));
        const marksAvailable = attempted * 3;
        const marksEarned = Math.round(marksAvailable * (score / 100));
        const lastAttempt = daysAgo(between(0, 10));
        // Weaker topics come back round sooner — mirrors the spaced-repetition
        // behaviour the real mastery engine produces.
        const interval = band === "green" ? between(7, 14) : band === "amber" ? between(3, 6) : between(1, 2);
        const nextReview = new Date(lastAttempt.getTime() + interval * 86400000);

        await db.execute(sql`
          INSERT INTO topic_mastery (
            user_id, topic_id, subject_id, mastery_score, mastery_band,
            accuracy_score, marks_ratio, time_efficiency,
            concept_errors, method_errors, language_errors,
            questions_attempted, questions_correct,
            total_marks_earned, total_marks_available,
            last_attempt_at, next_review_at, review_interval,
            confidence_level, consecutive_correct, consecutive_incorrect,
            created_at, updated_at
          ) VALUES (
            ${LEARNER_ID}, ${topic.id}, ${subject.id}, ${score}, ${band},
            ${score}, ${Math.round((marksEarned / marksAvailable) * 100)}, ${between(75, 115)},
            ${between(0, 4)}, ${between(0, 3)}, ${between(0, 2)},
            ${attempted}, ${correct},
            ${marksEarned}, ${marksAvailable},
            ${lastAttempt}, ${nextReview}, ${interval},
            ${Math.max(10, score - between(0, 12))}, ${between(0, 4)}, ${band === "red" ? between(1, 3) : 0},
            ${daysAgo(DAYS_ACTIVE - 2)}, NOW()
          )
          ON CONFLICT (user_id, topic_id) DO UPDATE SET
            mastery_score = EXCLUDED.mastery_score,
            mastery_band = EXCLUDED.mastery_band,
            accuracy_score = EXCLUDED.accuracy_score,
            updated_at = NOW()
        `);
        masteryRows++;
      }
    }
    log(`Topic mastery rows: ${masteryRows}`);

    // ── Streak ──────────────────────────────────────────────────────────────
    // Live streak (last activity today) so the dashboard shows it as active
    // rather than broken.
    await db.execute(sql`
      INSERT INTO user_streaks (
        user_id, current_streak, longest_streak, total_days_active,
        last_activity_date, created_at, updated_at
      ) VALUES (${LEARNER_ID}, 9, 14, 19, CURRENT_DATE, ${daysAgo(DAYS_ACTIVE)}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        total_days_active = EXCLUDED.total_days_active,
        last_activity_date = EXCLUDED.last_activity_date,
        updated_at = NOW()
    `);

    // ── Study sessions ──────────────────────────────────────────────────────
    let sessions = 0;
    for (let i = 0; i < 22; i++) {
      const subject = pick(usableSubjects);
      const subjectTopics = topics.filter((t) => t.subjectId === subject.id);
      const topic = subjectTopics.length > 0 ? pick(subjectTopics) : null;
      const started = daysAgo(between(0, DAYS_ACTIVE - 1), between(15, 20));
      const duration = between(12, 55) * 60;
      await db.execute(sql`
        INSERT INTO study_sessions (
          user_id, subject_id, topic_id, context, started_at, ended_at,
          duration_seconds, questions_answered
        ) VALUES (
          ${LEARNER_ID}, ${subject.id}, ${topic?.id ?? null}, 'study',
          ${started}, ${new Date(started.getTime() + duration * 1000)},
          ${duration}, ${between(4, 16)}
        )
      `);
      sessions++;
    }
    log(`Study sessions: ${sessions}`);

    // ── Coins ───────────────────────────────────────────────────────────────
    const earned = between(680, 940);
    const spent = between(120, 260);
    await db.execute(sql`
      INSERT INTO user_coins (user_id, balance, total_earned, total_spent, updated_at)
      VALUES (${LEARNER_ID}, ${earned - spent}, ${earned}, ${spent}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        balance = EXCLUDED.balance,
        total_earned = EXCLUDED.total_earned,
        total_spent = EXCLUDED.total_spent,
        updated_at = NOW()
    `);
    for (let i = 0; i < 10; i++) {
      await db.execute(sql`
        INSERT INTO coin_transactions (user_id, amount, type, description, created_at)
        VALUES (
          ${LEARNER_ID}, ${between(10, 60)}, 'earned',
          ${pick(["Daily challenge completed", "Practice streak bonus", "Topic mastered", "Quiz completed"])},
          ${daysAgo(between(0, DAYS_ACTIVE - 1))}
        )
      `);
    }

    // ── Badges (codes taken from BADGE_DEFINITIONS in server/gamification.ts) ─
    const badges = ["first_quiz", "questions_10", "questions_50", "questions_100", "streak_3", "streak_7", "accuracy_70", "topic_mastery"];
    for (const [i, code] of badges.entries()) {
      await db.execute(sql`
        INSERT INTO user_badges (user_id, badge_code, earned_at)
        VALUES (${LEARNER_ID}, ${code}, ${daysAgo(DAYS_ACTIVE - 2 - i > 0 ? DAYS_ACTIVE - 2 - i : 1)})
      `);
    }
    log(`Badges: ${badges.length}`);

    // ── Prep-score history, so the trend line has shape ─────────────────────
    // Rising from 41 to 72 — visible improvement, still short of "done".
    const prepPoints = [41, 46, 52, 55, 61, 64, 69, 72];
    for (const [i, score] of prepPoints.entries()) {
      const at = daysAgo(DAYS_ACTIVE - 1 - Math.floor((i * (DAYS_ACTIVE - 1)) / prepPoints.length));
      const status = score >= 70 ? "locked_in" : score >= 55 ? "building" : "catch_up";
      await db.execute(sql`
        INSERT INTO prep_scores (
          user_id, score, status, streak, accuracy,
          questions_answered, papers_completed, recorded_at, created_at
        ) VALUES (
          ${LEARNER_ID}, ${score}, ${status}, ${Math.min(9, i + 2)}, ${Math.round(TARGET_ACCURACY * 100) + between(-6, 6)},
          ${Math.round((totalAttempts * (i + 1)) / prepPoints.length)}, ${Math.floor(i / 2)}, ${at}, ${at}
        )
      `);
    }

    // ── Exam schedule, from the real NSC timetable ──────────────────────────
    const timetableRows = await db.execute(sql`
      SELECT id, subject_name, paper_number, exam_date, start_time, duration_minutes
      FROM nsc_timetable
      WHERE subject_name IN (${sql.join(usableSubjects.map((s) => sql`${s.name}`), sql`, `)})
      ORDER BY exam_date
      LIMIT 8
    `);
    const timetable = (timetableRows as any).rows as any[];
    const subjectIdByName = new Map(usableSubjects.map((s) => [s.name, s.id]));
    for (const t of timetable) {
      const examDate = new Date(t.exam_date);
      const daysRemaining = Math.ceil((examDate.getTime() - Date.now()) / 86400000);
      const urgency =
        daysRemaining < 0 ? "past" : daysRemaining <= 14 ? "final_push" : daysRemaining <= 45 ? "consolidate" : "build_mastery";
      await db.execute(sql`
        INSERT INTO learner_exam_schedule (
          user_id, nsc_timetable_id, subject_id, subject_name, paper_number,
          exam_date, start_time, duration_minutes, days_remaining,
          urgency_state, is_past, generated_at, updated_at
        ) VALUES (
          ${LEARNER_ID}, ${Number(t.id)}, ${subjectIdByName.get(String(t.subject_name)) ?? null},
          ${String(t.subject_name)}, ${Number(t.paper_number)},
          ${examDate.toISOString().slice(0, 10)}, ${String(t.start_time)}, ${Number(t.duration_minutes)},
          ${Math.max(0, daysRemaining)}, ${urgency}, ${daysRemaining < 0}, NOW(), NOW()
        )
      `);
    }
    log(`Exam schedule entries: ${timetable.length}`);
    if (timetable.length === 0) {
      log("   (nsc_timetable has no rows for these subjects — countdown widgets will be empty)");
    }

    // ── Activity + learning events (feed the parent dashboard timeline) ──────
    for (let i = 0; i < 26; i++) {
      const subject = pick(usableSubjects);
      await db.execute(sql`
        INSERT INTO activity_events (user_id, event_type, metadata, occurred_at)
        VALUES (
          ${LEARNER_ID},
          ${pick(["quiz_submitted", "study_session_ended", "score_recorded", "topic_mastered", "lesson_completed"])},
          ${JSON.stringify({ subjectId: subject.id, subject: subject.name, score: between(45, 92) })}::jsonb,
          ${daysAgo(between(0, DAYS_ACTIVE - 1))}
        )
      `);
    }
    for (let i = 0; i < 16; i++) {
      const subject = pick(usableSubjects);
      await db.execute(sql`
        INSERT INTO learning_events (user_id, content_type, time_spent_seconds, performance_score, subject_id, created_at)
        VALUES (
          ${LEARNER_ID}, ${pick(["visual", "auditory", "read", "kinesthetic"])},
          ${between(180, 1800)}, ${between(45, 92)}, ${subject.id},
          ${daysAgo(between(0, DAYS_ACTIVE - 1))}
        )
      `);
    }

    // ── Daily challenges — a few completed, one open for today ──────────────
    for (let d = 6; d >= 0; d--) {
      const subject = pick(usableSubjects);
      const done = d > 0;
      const at = daysAgo(d, 17);
      await db.execute(sql`
        INSERT INTO daily_challenges (
          user_id, challenge_date, subject_id, questions_json, answers_json,
          score, total_questions, completed_at, time_spent_seconds, streak, created_at
        ) VALUES (
          ${LEARNER_ID}, ${at.toISOString().slice(0, 10)}, ${subject.id},
          ${JSON.stringify([])}::jsonb,
          ${done ? JSON.stringify([]) : null}::jsonb,
          ${done ? between(2, 5) : null}, 5,
          ${done ? at : null}, ${done ? between(180, 600) : null},
          ${9 - d}, ${at}
        )
      `);
    }

    // ── Subscription ────────────────────────────────────────────────────────
    // admin_granted with no payment-provider token: the Paystack charge job
    // only picks up trials that carry an authorization code, so this can never
    // trigger a real charge. Excluded from billing metrics regardless.
    await db.execute(sql`
      INSERT INTO subscriptions (
        user_id, user_role, parent_user_id, status, plan, price_rands,
        admin_granted, billing_method, start_date, end_date, created_at, updated_at
      ) VALUES (
        ${LEARNER_ID}, 'learner', ${PARENT_ID}, 'active', 'monthly', 0,
        true, 'trial', ${daysAgo(DAYS_ACTIVE)}, ${new Date(Date.now() + 365 * 86400000)},
        ${daysAgo(DAYS_ACTIVE)}, NOW()
      )
    `);

    await db.execute(sql`COMMIT`);
  } catch (err) {
    await db.execute(sql`ROLLBACK`);
    throw err;
  }

  log("");
  log("DONE. Demo accounts ready:");
  log(`   learner  ${LEARNER_EMAIL}`);
  log(`   parent   ${PARENT_EMAIL}`);
  log("   password: the DEMO_PASSWORD you supplied (not stored or printed here)");
  log("");
  log("Both are flagged is_demo = true and are excluded from every admin metric.");
  log("Signed in, each shows a persistent DEMO ACCOUNT badge.");

  // Confirm the exclusion actually holds, rather than assuming it.
  const check = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM users)::int                        AS all_users,
      (SELECT COUNT(*) FROM users WHERE is_demo = false)::int  AS counted_users,
      (SELECT COUNT(*) FROM users WHERE is_demo = true)::int   AS demo_users
  `);
  const c = (check as any).rows[0];
  log("");
  log(`Verification — users table: ${c.all_users} rows total, ${c.demo_users} demo, ${c.counted_users} counted by admin metrics.`);
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  if (process.argv.includes("--remove")) {
    await remove();
  } else {
    await seed();
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("FATAL:", e instanceof Error ? e.message : e);
  process.exit(1);
});
