/**
 * scripts/generate-questions.ts — runnable driver for the simulated question
 * generator (server/question-generator.ts).
 *
 * Usage:
 *   source /c/dev/bt-openai.env
 *   source /c/dev/bt-prod-db.env
 *   export DATABASE_URL="${PGURL_EXTERNAL}?sslmode=no-verify"
 *
 *   npx tsx scripts/generate-questions.ts --ensure-schema
 *   npx tsx scripts/generate-questions.ts --subject "Business Studies" --dry
 *   npx tsx scripts/generate-questions.ts --subject "Business Studies" --per-paper 6 --release
 *   npx tsx scripts/generate-questions.ts --limit 3            # 3 (subject,paper) pairs
 *   npx tsx scripts/generate-questions.ts --resume             # continue a full run
 *
 * Flags:
 *   --subject "X"     restrict to one subject (repeatable)
 *   --paper N         restrict to one paper number
 *   --limit N         process at most N (subject, paper, language) units
 *   --per-paper N     questions per paper per language (default 6)
 *   --topics N        how many high-yield topics to spread across (default 4)
 *   --dry             build prompts + print plan, no OpenAI call, no writes
 *   --release         set released_at on rows scoring `pass`
 *   --publish         project released rows into subject_daily_challenges /
 *                     subject_quizzes so the learner quiz surfaces show them
 *                     (append-only; implies --release to be useful)
 *   --resume          skip units already recorded in the checkpoint file
 *   --reset           clear the checkpoint file before starting
 *   --state PATH      checkpoint file (default .generate-questions-state.json)
 *   --verbose         print each generated question in full
 *
 * Resumability: every completed (subject, paper, language) unit is appended to
 * the checkpoint file immediately after its rows commit, so an interrupted run
 * re-entered with --resume never regenerates (or re-bills) completed work.
 * Independently, `generated_questions.content_hash` is UNIQUE, so even a run
 * without --resume cannot create duplicate rows.
 */
import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { sql } from "drizzle-orm";
import { db, pool } from "../server/db";
import {
  loadExaminerProfiles, languagesFor, deriveLiveStats, pickTopicsDetailed,
  allocateByWeight, fetchExemplars, generateForTopic, scoreGeneratedQuestion,
  persistQuestion, buildUserPrompt, publishToQuizSurfaces, GENERATION_MODEL,
  type ProfileRow, type TopicTarget,
} from "../server/question-generator";

// ───────────────────────────── arg parsing ───────────────────────────────────

const argv = process.argv.slice(2);
const has = (f: string) => argv.includes(f);
const val = (f: string, d?: string) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const all = (f: string) => argv.reduce<string[]>((acc, a, i) => {
  if (a === f && argv[i + 1] && !argv[i + 1].startsWith("--")) acc.push(argv[i + 1]);
  return acc;
}, []);

const OPT = {
  subjects: all("--subject"),
  paper: val("--paper") ? Number(val("--paper")) : null,
  limit: val("--limit") ? Number(val("--limit")) : Infinity,
  perPaper: Number(val("--per-paper", "6")),
  topics: Number(val("--topics", "4")),
  dry: has("--dry"),
  release: has("--release"),
  resume: has("--resume"),
  reset: has("--reset"),
  verbose: has("--verbose"),
  publish: has("--publish"),
  ensureSchema: has("--ensure-schema"),
  statePath: resolve(process.cwd(), val("--state", ".generate-questions-state.json")!),
};

// ─────────────────────────────── checkpoint ──────────────────────────────────

interface State {
  startedAt: string;
  batchId: string;
  done: string[];               // "subject|paper|language"
  stats: Record<string, number>;
}

function loadState(): State {
  if (!OPT.reset && existsSync(OPT.statePath)) {
    try { return JSON.parse(readFileSync(OPT.statePath, "utf8")) as State; } catch { /* fall through */ }
  }
  return {
    startedAt: new Date().toISOString(),
    batchId: `gen-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "")}`,
    done: [], stats: { generated: 0, pass: 0, review: 0, reject: 0, released: 0, duplicate: 0 },
  };
}
const state = loadState();
const saveState = () => writeFileSync(OPT.statePath, JSON.stringify(state, null, 2));

// ─────────────────────── schema guard (additive only) ────────────────────────

/**
 * The scoring columns are additive and the table is empty, so this is safe to
 * run against production even while the memo backfill is working on
 * `dbe_verbatim_questions` — it touches neither that table nor any row data.
 * Kept out of `drizzle-kit push` deliberately: push drops what it does not
 * know about, which is how an earlier version of these tables was lost.
 */
async function ensureSchema() {
  const stmts = [
    sql`ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS examiner_tip text`,
    sql`ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS caps_alignment integer DEFAULT 0`,
    sql`ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS structure_score integer DEFAULT 0`,
    sql`ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS answer_completeness integer DEFAULT 0`,
    sql`ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS quality_score integer DEFAULT 0`,
    sql`ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS quality_flag text NOT NULL DEFAULT 'review'`,
    sql`ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS score_detail jsonb`,
    sql`ALTER TABLE generated_questions ADD COLUMN IF NOT EXISTS batch_id text`,
    sql`CREATE INDEX IF NOT EXISTS generated_questions_subject_paper_lang_idx
          ON generated_questions (subject, paper_number, language)`,
    sql`CREATE INDEX IF NOT EXISTS generated_questions_batch_idx ON generated_questions (batch_id)`,
    sql`CREATE INDEX IF NOT EXISTS generated_questions_quality_flag_idx
          ON generated_questions (quality_flag, quality_score)`,
  ];
  for (const s of stmts) await db.execute(s);
  console.log("[schema] generated_questions scoring columns + indexes ensured.");
}

// ───────────────────────────── planning ──────────────────────────────────────

interface Unit {
  profile: ProfileRow;
  language: string;
}

async function plan(): Promise<Unit[]> {
  const profiles = OPT.subjects.length
    ? (await Promise.all(OPT.subjects.map((s) => loadExaminerProfiles(s)))).flat()
    : await loadExaminerProfiles();

  const filtered = profiles.filter((p) => OPT.paper === null || p.paperNumber === OPT.paper);
  const units: Unit[] = [];

  for (const p of filtered) {
    const langs = await languagesFor(p.subject, p.paperNumber);
    if (!langs.length) continue;               // no usable exemplars — skip entirely
    for (const language of langs) {
      const key = `${p.subject}|${p.paperNumber}|${language}`;
      if (OPT.resume && state.done.includes(key)) continue;
      units.push({ profile: p, language });
    }
  }
  return units.slice(0, OPT.limit === Infinity ? undefined : OPT.limit);
}

// ─────────────────────────────── run ─────────────────────────────────────────

async function runUnit(unit: Unit): Promise<void> {
  const { profile: p, language } = unit;
  const key = `${p.subject}|${p.paperNumber}|${language}`;
  const stats = await deriveLiveStats(p.subject, p.paperNumber, language, p.profile);

  if (stats.exemplarCount < 3) {
    console.log(`  ⤫ SKIP ${key} — only ${stats.exemplarCount} usable exemplars (need 3)`);
    return;
  }

  const { topics, crossWired } = await pickTopicsDetailed(p.subject, OPT.topics);
  if (crossWired.length) {
    console.log(`  ⚠ ${p.subject}: dropped ${crossWired.length} cross-wired topic(s) — ${crossWired.join("; ")}`);
  }
  if (!topics.length) {
    console.log(`  ⤫ SKIP ${key} — no usable dbe_topic_frequency rows for this subject` +
      (crossWired.length ? " (all were cross-wired to another subject)" : ""));
    return;
  }
  const alloc = allocateByWeight(topics, OPT.perPaper);

  console.log(`\n▸ ${p.subject} P${p.paperNumber} [${language}]`);
  console.log(`  exemplars=${stats.exemplarCount} modalMarks=${stats.modalMarks} ` +
    `range=${stats.markMin}-${stats.markMax} memo≈${stats.avgMemoLength}ch ` +
    `depth=${stats.maxNumberingDepth} ticks=${stats.usesTickMarks}` +
    (stats.repaired.length ? `\n  repaired from live data: ${stats.repaired.join(", ")}` : ""));
  console.log(`  verbs: ${stats.commandVerbs.map((v) => `${v.verb}(${v.count})`).join(", ") || "none observed"}`);
  console.log(`  topics: ${alloc.map((a) => `${a.topic.topic}×${a.count}`).join(", ")}`);

  for (const { topic, count } of alloc) {
    const exemplars = await fetchExemplars(p.subject, p.paperNumber, language, topic.topic, 4);
    if (exemplars.length < 3) {
      console.log(`    ⤫ ${topic.topic}: only ${exemplars.length} exemplars, skipping`);
      continue;
    }

    if (OPT.dry) {
      const prompt = buildUserPrompt({
        subject: p.subject, paperNumber: p.paperNumber, language,
        topic, stats, profile: p.profile, exemplars, count,
        mcqCount: Math.round(count * 0.4),
      });
      console.log(`    · ${topic.topic}: would generate ${count} ` +
        `(exemplars ${exemplars.map((e) => `#${e.id}/rel${e.relevance}`).join(",")}, prompt ${prompt.length} chars)`);
      if (OPT.verbose) console.log("\n" + prompt + "\n");
      continue;
    }

    let questions;
    try {
      questions = await generateForTopic({
        subject: p.subject, paperNumber: p.paperNumber, language,
        topic, stats, profile: p.profile, exemplars, count,
      });
    } catch (err: any) {
      console.log(`    ✗ ${topic.topic}: generation failed — ${err.message}`);
      continue;
    }

    for (const q of questions) {
      const score = scoreGeneratedQuestion(q, stats, topic, language);
      state.stats.generated++;
      state.stats[score.qualityFlag]++;

      const inserted = await persistQuestion({
        q, score, subject: p.subject, paperNumber: p.paperNumber, language,
        profileId: p.id, topic, exemplarIds: exemplars.map((e) => e.id),
        batchId: state.batchId, release: OPT.release,
      });
      if (!inserted) state.stats.duplicate++;
      else if (OPT.release && score.qualityFlag === "pass") state.stats.released++;

      const mark = score.qualityFlag === "pass" ? "✓" : score.qualityFlag === "review" ? "~" : "✗";
      console.log(`    ${mark} Q${q.questionNumber} [${q.marks}m ${q.cognitiveLevel}${q.mcqOptions ? " MCQ" : ""}] ` +
        `score=${score.qualityScore} (caps ${score.capsAlignment}/struct ${score.structureScore}/ans ${score.answerCompleteness})` +
        (inserted ? "" : " [dup]") +
        (score.detail.reasons.length ? `\n        ${score.detail.reasons.join("; ")}` : ""));

      if (OPT.verbose) {
        console.log(`\n${"─".repeat(74)}\nQUESTION ${q.questionNumber} (${q.marks} marks) — ${q.topic}\n` +
          `${q.questionText}\n\nMEMO:\n${q.answerText}\n` +
          (q.mcqOptions ? `\nOPTIONS: ${q.mcqOptions.map((o) => `${o.letter}) ${o.text}`).join("  ")}\nCORRECT: ${q.correctOption}\n` : "") +
          `\nEXAMINER TIP:\n${q.examinerTip}\n${"─".repeat(74)}\n`);
      }
    }
  }

  if (!OPT.dry) { state.done.push(key); saveState(); }
}

async function main() {
  console.log(`generate-questions — model=${GENERATION_MODEL} batch=${state.batchId}` +
    `${OPT.dry ? " [DRY RUN]" : ""}${OPT.release ? " [RELEASE ON]" : ""}`);

  if (OPT.ensureSchema) { await ensureSchema(); if (argv.length === 1) { await pool.end(); return; } }

  const units = await plan();
  console.log(`Planned ${units.length} (subject, paper, language) unit(s), ` +
    `${OPT.perPaper} questions each across ${OPT.topics} topics.\n`);

  for (const u of units) await runUnit(u);

  // Projection into the learner surfaces is a separate, explicitly-requested
  // step: generating content and making it visible to learners are different
  // decisions, and --publish is the one that changes what a learner sees.
  if (OPT.publish && !OPT.dry) {
    console.log(`\n▸ Publishing to subject_daily_challenges / subject_quizzes`);
    const subjects = [...new Set(units.map((u) => u.profile.subject))];
    for (const s of subjects) {
      const r = await publishToQuizSurfaces(s);
      console.log(r.skipped
        ? `    ⤫ ${s}: ${r.skipped}`
        : `    ✓ ${s}: daily=${r.daily} quiz=${r.quiz}`);
    }
  }

  console.log(`\n${"═".repeat(74)}`);
  console.log(`Batch ${state.batchId} — generated=${state.stats.generated} ` +
    `pass=${state.stats.pass} review=${state.stats.review} reject=${state.stats.reject} ` +
    `released=${state.stats.released} duplicate=${state.stats.duplicate}`);
  if (!OPT.dry) console.log(`Checkpoint: ${OPT.statePath} (${state.done.length} units done)`);
  console.log("═".repeat(74));

  await pool.end();
}

main().catch(async (e) => { console.error(e); await pool.end(); process.exit(1); });
