/**
 * scripts/seed-launch-content.ts — one-shot launch seeder for the LEARNER MCQ
 * pool (generated_questions), which feeds the daily quiz, the boost quiz, AND
 * Exam Mode. Every question is generated → quality-scored → independently
 * solver-verified (the correct-answer key is re-solved) → CAPS-checked, and only
 * the strict passes (solver='agree' AND caps='on_syllabus') are released.
 *
 * WHY: the learner serve gates now refuse anything unverified, so until this
 * runs the daily quiz / Exam Mode show "coming soon". This fills the pool.
 *
 * This does NOT populate dbe_simulated_questions (the written-response papers
 * behind /exam/full + mini-mock) — that is a separate generation run via the
 * Simulator "Generate Exam" + "Release" buttons (or scripts/generate-questions).
 *
 * USAGE (needs a real DATABASE_URL + an OpenAI key in the env):
 *   source /c/dev/bt-openai.env
 *   source /c/dev/bt-prod-db.env
 *   export DATABASE_URL="${PGURL_EXTERNAL}?sslmode=no-verify"
 *
 *   npx tsx scripts/seed-launch-content.ts --dry                 # list plan, no calls
 *   npx tsx scripts/seed-launch-content.ts --count 20            # 20 MCQs/subject, all subjects
 *   npx tsx scripts/seed-launch-content.ts --subject "Business Studies" --count 30
 *   npx tsx scripts/seed-launch-content.ts --limit 5            # first 5 subjects only
 *
 * Idempotent: content_hash is UNIQUE and released rows are skipped, so re-runs
 * only top up. Safe to stop and re-run.
 */
import { sql } from "drizzle-orm";
import { db, pool } from "../server/db";
import { loadExaminerProfiles } from "../server/question-generator";
import { generateVerifyReleaseMcqs } from "../server/mcq-pipeline";

const argv = process.argv.slice(2);
const has = (f: string) => argv.includes(f);
const val = (f: string, d?: string) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};

const OPT = {
  subjects: argv.reduce<string[]>((a, x, i) => {
    if (x === "--subject" && argv[i + 1]) a.push(argv[i + 1]);
    return a;
  }, []),
  count: Number(val("--count", "20")),
  topicCount: Number(val("--topics", "6")),
  limit: val("--limit") ? Number(val("--limit")) : Infinity,
  dry: has("--dry"),
};

async function main() {
  // Subjects that can actually generate = those with an examiner profile.
  const profiles = await loadExaminerProfiles();
  let subjects = [...new Set(profiles.map((p) => p.subject))].sort();
  if (OPT.subjects.length) subjects = subjects.filter((s) => OPT.subjects.includes(s));
  if (Number.isFinite(OPT.limit)) subjects = subjects.slice(0, OPT.limit);

  console.log(`seed-launch-content — ${subjects.length} subject(s), ` +
    `target ${OPT.count} MCQ/subject across ${OPT.topicCount} topics` +
    `${OPT.dry ? " [DRY RUN]" : ""}`);
  if (!subjects.length) {
    console.log("No subjects with examiner profiles found — profile subjects first.");
    await pool.end();
    return;
  }

  if (OPT.dry) {
    subjects.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
    await pool.end();
    return;
  }

  const totals = { generated: 0, banked: 0, verified: 0, released: 0, held: 0, errors: 0 };
  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    process.stdout.write(`\n[${i + 1}/${subjects.length}] ${subject} … `);
    try {
      const r = await generateVerifyReleaseMcqs({
        subject, count: OPT.count, topicCount: OPT.topicCount,
      });
      totals.generated += r.generated; totals.banked += r.banked;
      totals.verified += r.verified; totals.released += r.released;
      totals.held += r.heldForReview; totals.errors += r.errors.length;
      console.log(
        `gen ${r.generated} · banked ${r.banked} · verified ${r.verified} · ` +
        `RELEASED ${r.released} · held ${r.heldForReview}` +
        (r.errors.length ? ` · ${r.errors.length} err` : ""),
      );
      if (r.errors.length) r.errors.slice(0, 3).forEach((e) => console.log(`      ! ${e}`));
    } catch (e: any) {
      totals.errors++;
      console.log(`FAILED — ${e?.message ?? e}`);
    }
  }

  // Show how many subjects now actually have servable (released+verified) MCQs.
  const covered = await db.execute<{ subject: string; n: number }>(sql`
    SELECT subject, count(*)::int AS n
      FROM generated_questions
     WHERE released_at IS NOT NULL AND quality_flag = 'pass'
       AND mcq_options IS NOT NULL AND correct_option IS NOT NULL
       AND solver_verdict = 'agree' AND caps_verdict = 'on_syllabus'
     GROUP BY subject ORDER BY subject
  `);

  console.log(`\n${"═".repeat(72)}`);
  console.log(`TOTALS — generated ${totals.generated} · banked ${totals.banked} · ` +
    `verified ${totals.verified} · RELEASED ${totals.released} · held ${totals.held} · ` +
    `errors ${totals.errors}`);
  console.log(`Subjects with servable MCQs now: ${(covered.rows ?? []).length}`);
  (covered.rows ?? []).forEach((r) => console.log(`   ${r.subject}: ${r.n}`));
  console.log("═".repeat(72));

  await pool.end();
}

main().catch(async (e) => { console.error(e); await pool.end(); process.exit(1); });
