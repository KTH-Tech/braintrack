/**
 * server/mcq-pipeline.ts — generate → score → VERIFY → release for daily-quiz
 * MCQs, writing into `generated_questions`.
 *
 * Why this module exists, and why it is separate from the exam pipeline:
 * the Simulator UI's written-response papers live in `dbe_simulated_questions`
 * and have no options/key to get wrong. The daily/boost quiz is multiple-choice,
 * so a hallucinated CORRECT-ANSWER KEY would mark every learner wrong on a
 * question they actually got right — the single worst content error the product
 * can make. This module is therefore deliberately stricter than the exam path.
 *
 * The strict release rule (owner-approved 2026-07-30): an MCQ is released ONLY
 * when ALL of these hold:
 *    quality_flag = 'pass'        — cleared structure/voice/completeness scoring
 *    solver_verdict = 'agree'     — the key was independently RE-SOLVED (with no
 *                                   sight of the stored answer) and the two
 *                                   answers agreed  → the key is corroborated
 *    caps_verdict  = 'on_syllabus' — the concept sits inside SA CAPS Grade 12
 * Anything less than 'agree' (disagree / uncertain / errored) is HELD, never
 * released. The learner serve path (/api/subjects/:id/boost/quiz) enforces the
 * SAME gate at read time, so even a mis-released row cannot reach a learner —
 * this module is the producer side of a two-sided guarantee.
 *
 * Nothing here ever deletes or un-publishes on its own; release is an explicit,
 * gated UPDATE and nothing more.
 */
import { sql } from "drizzle-orm";
import { db } from "./db";
import {
  loadExaminerProfiles, languagesFor, deriveLiveStats, pickTopics,
  allocateByWeight, fetchExemplars, generateForTopic, scoreGeneratedQuestion,
  persistQuestion,
} from "./question-generator";
import {
  verifyItem, persistVerification, ensureVerificationSchema,
  type VerifiableItem,
} from "./content-verifier";

export interface McqPipelineResult {
  subject: string;
  /** MCQ rows the model produced (written-response rows are ignored here). */
  generated: number;
  /** Of those, how many cleared quality scoring and were banked (unreleased). */
  banked: number;
  /** Duplicate content_hash — already existed, skipped. */
  duplicates: number;
  /** Banked rows that were run through solver + CAPS verification. */
  verified: number;
  /** Met the strict gate (quality pass + solver agree + CAPS on-syllabus) and
   *  were released. Only these can ever reach a learner. */
  released: number;
  /** Verified but NOT strict-pass → held for review, not released. */
  heldForReview: number;
  /** Diagnostic breakdown of WHY held rows were held (not mutually exclusive). */
  solverDisagree: number;
  solverUncertain: number;
  capsOff: number;
  capsUncertain: number;
  errors: string[];
}

/** One banked, not-yet-released MCQ row read back for verification. The index
 *  signature satisfies db.execute's `Record<string, unknown>` row constraint. */
interface BankedRow {
  [key: string]: unknown;
  id: number;
  subject: string;
  language: string;
  topic: string | null;
  paper_number: number | null;
  marks: number | null;
  cognitive_level: string | null;
  question_text: string;
  answer_text: string;
  mcq_options: Array<{ letter: string; text: string }> | null;
  correct_option: string | null;
  quality_score: number | null;
  quality_flag: string | null;
}

/**
 * Generate a batch of MCQs for one subject, verify each one's key, and release
 * only the strictly-verified. Synchronous end-to-end so the admin UI can show a
 * real result. `count` is the target MCQ volume; the generator is asked for
 * more raw questions than that because only a share come back as MCQs and only
 * the verified ones ship.
 */
export async function generateVerifyReleaseMcqs(opts: {
  subject: string;
  count?: number;
  topicCount?: number;
  /** Restrict generation to ONE language ("Afrikaans" | "English"). Used by
   *  the AF-parity seeding runs so the whole count goes to that language
   *  instead of English consuming the quota first. Omit = all available. */
  language?: string;
}): Promise<McqPipelineResult> {
  const subject = opts.subject.trim();
  const targetCount = Math.max(4, Math.min(60, opts.count ?? 20));
  const topicCount = Math.max(2, Math.min(12, opts.topicCount ?? 6));

  const result: McqPipelineResult = {
    subject, generated: 0, banked: 0, duplicates: 0, verified: 0, released: 0,
    heldForReview: 0, solverDisagree: 0, solverUncertain: 0, capsOff: 0,
    capsUncertain: 0, errors: [],
  };

  // The verification columns are additive + IF NOT EXISTS; safe to ensure here
  // so a fresh environment cannot silently skip the gate for lack of a column.
  await ensureVerificationSchema();

  const profiles = await loadExaminerProfiles(subject);
  if (!profiles.length) {
    result.errors.push(`No examiner profile for "${subject}" — ingest + profile the subject first.`);
    return result;
  }

  const batchId = `mcq-verify-${subject.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;

  // Spread the target across the subject's papers so the quiz pool isn't all
  // from one paper. The bulk of daily-quiz MCQs are English; Afrikaans is
  // generated when the paper has Afrikaans exemplars (the serve gate falls back
  // to English for AF learners, so English coverage is the priority).
  const perPaper = Math.max(2, Math.ceil(targetCount / profiles.length));

  for (const p of profiles) {
    const langs = await languagesFor(p.subject, p.paperNumber);
    if (!langs.length) continue;
    // English first; only add Afrikaans if it has its own exemplars — unless
    // opts.language pins the run to one language (AF-parity seeding), in which
    // case the full per-paper quota goes to that language alone.
    let orderedLangs = langs.includes("English")
      ? ["English", ...langs.filter((l) => l !== "English")]
      : langs;
    if (opts.language) {
      orderedLangs = orderedLangs.filter((l) => l === opts.language);
      if (!orderedLangs.length) {
        result.errors.push(
          `no ${opts.language} exemplars for ${p.subject} P${p.paperNumber} — ingest ${opts.language} papers first`,
        );
        continue;
      }
    }

    for (const language of orderedLangs) {
      let stats;
      try {
        stats = await deriveLiveStats(p.subject, p.paperNumber, language, p.profile);
      } catch (e: any) {
        result.errors.push(`stats ${p.subject} P${p.paperNumber} ${language}: ${e?.message ?? e}`);
        continue;
      }
      if (stats.exemplarCount < 3) continue;

      const topics = await pickTopics(p.subject, topicCount);
      if (!topics.length) continue;
      const alloc = allocateByWeight(topics, perPaper);

      for (const { topic, count } of alloc) {
        const exemplars = await fetchExemplars(p.subject, p.paperNumber, language, topic.topic, 4);
        if (exemplars.length < 3) continue;

        let questions;
        try {
          questions = await generateForTopic({
            subject: p.subject, paperNumber: p.paperNumber, language,
            topic, stats, profile: p.profile, exemplars, count,
          });
        } catch (e: any) {
          result.errors.push(`gen ${topic.topic} [${language}]: ${e?.message ?? e}`);
          continue;
        }

        // ONLY MCQ rows are relevant to the daily quiz. Written-response rows the
        // generator also produced are left for the exam pipeline, not banked here.
        const mcqs = questions.filter((q) => q.mcqOptions && q.correctOption);
        for (const q of mcqs) {
          result.generated++;
          const score = scoreGeneratedQuestion(q, stats, topic, language);
          // Bank UNRELEASED regardless of quality — release is decided only
          // after verification. Never pass release:true here.
          const inserted = await persistQuestion({
            q, score, subject: p.subject, paperNumber: p.paperNumber, language,
            profileId: p.id, topic, exemplarIds: exemplars.map((e) => e.id),
            batchId, release: false,
          });
          if (inserted) result.banked++;
          else result.duplicates++;
        }
      }
    }
  }

  // Read back everything this batch banked that is still unreleased + MCQ, then
  // verify and (strictly) release. Re-runnable: rows already released by a prior
  // run are excluded by `released_at IS NULL`.
  const banked = await db.execute<BankedRow>(sql`
    SELECT id, subject, language, topic, paper_number, marks, cognitive_level,
           question_text, answer_text, mcq_options, correct_option,
           quality_score, quality_flag
      FROM generated_questions
     WHERE batch_id = ${batchId}
       AND subject = ${subject}
       AND released_at IS NULL
       AND mcq_options IS NOT NULL
       AND correct_option IS NOT NULL
       AND verified_at IS NULL
  `);

  for (const row of banked.rows ?? []) {
    const item: VerifiableItem = {
      source: "generated",
      id: row.id,
      subject: row.subject,
      language: row.language,
      topic: row.topic,
      paperNumber: row.paper_number,
      marks: row.marks,
      cognitiveLevel: row.cognitive_level,
      prompt: row.question_text,
      memo: row.answer_text,
      // Guard the jsonb shape: content-verifier's classifier/solver call
      // .length/.map on this, so a non-array must degrade to null, not throw.
      mcqOptions: Array.isArray(row.mcq_options) ? row.mcq_options : null,
      correctOption: row.correct_option,
      priorQualityScore: row.quality_score,
      released: false,
    };

    let v;
    try {
      v = await verifyItem(item, { solver: true, caps: true });
    } catch (e: any) {
      result.errors.push(`verify #${row.id}: ${e?.message ?? e}`);
      continue;
    }
    result.verified++;
    // Release and verdict-write must be atomic in intent: never release a row
    // whose verdicts failed to persist (it would go live with NULL verdicts and,
    // worse, inflate the "released" count for something the serve gate — which
    // requires solver_verdict='agree' — would refuse to show anyway).
    let persisted = true;
    try {
      await persistVerification(v);
    } catch (e: any) {
      persisted = false;
      result.errors.push(`persist-verify #${row.id}: ${e?.message ?? e}`);
    }

    const solverAgree = v.solver?.verdict === "agree";
    const capsOnSyllabus = v.caps?.verdict === "on_syllabus";
    const qualityPass = row.quality_flag === "pass";

    if (v.solver?.verdict === "disagree") result.solverDisagree++;
    if (v.solver?.verdict === "uncertain") result.solverUncertain++;
    if (v.caps?.verdict === "off_syllabus") result.capsOff++;
    if (v.caps?.verdict === "uncertain") result.capsUncertain++;

    if (persisted && qualityPass && solverAgree && capsOnSyllabus) {
      // The single release point. Sets released_at ONLY on a strict pass.
      await db.execute(sql`
        UPDATE generated_questions SET released_at = now()
         WHERE id = ${row.id} AND released_at IS NULL
      `);
      result.released++;
    } else {
      result.heldForReview++;
    }
  }

  return result;
}
