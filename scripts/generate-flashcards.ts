/**
 * Generate humanised, learner-facing flashcards from released DBE past papers.
 *
 * WHY
 *   The `flashcards` table was previously filled by copying verbatim question
 *   text and memo text straight through, which put the examiner's marking
 *   rubric ("Die kandidaat ontwerp…", "KENMERKE •…", "[20]") in front of
 *   learners. This script synthesises atomic, second-person, EN+AF recall cards
 *   from the same sources and hard-validates every card before it is stored.
 *
 * SAFETY
 *   - Reads `dbe_verbatim_questions` only. Never writes to it.
 *   - Writes only to `flashcards`.
 *   - Nothing is inserted unless it passes server/flashcard-generator.ts
 *     validation. Rejections are counted and sampled, not silently dropped.
 *
 * USAGE
 *   # dry run — generate + validate + print samples, write nothing
 *   npx tsx scripts/generate-flashcards.ts --subject "Economics" --limit 12 --dry
 *
 *   # real run for one subject
 *   npx tsx scripts/generate-flashcards.ts --subject "Economics" --limit 300
 *
 *   # full pass across every subject with meaningful released content
 *   npx tsx scripts/generate-flashcards.ts --all --limit 400
 *
 *   # replace the legacy un-humanised rows (see --purge notes below)
 *   npx tsx scripts/generate-flashcards.ts --all --purge-legacy --limit 400
 *
 * FLAGS
 *   --subject "X"        Restrict to one subject (repeatable).
 *   --all                Every subject with >= --min-sources usable rows.
 *   --limit N            Max source questions per subject (default 200).
 *   --dry                Generate + validate + report. No DB writes at all.
 *   --purge-legacy       Delete rows with source != 'ai_humanised' for the
 *                        subjects being generated, before inserting. Legacy
 *                        rows are raw rubric text and are not salvageable.
 *   --model M            OpenAI model (default gpt-4o-mini).
 *   --batch N            Source questions per LLM call (default 4).
 *   --cards-per-source N Max cards asked for per source (default 3).
 *   --concurrency N      Parallel LLM calls (default 3).
 *   --min-quality N      Source quality_score floor (default 70).
 *   --min-sources N      With --all, skip subjects below this (default 150).
 *   --exclude-paper N    Skip a paper number (repeatable). For language
 *                        subjects use --exclude-paper 2: P2 is set-work
 *                        literature, which is context-bound (the learner needs
 *                        the novel/drama in hand) and rejects at ~70%.
 *   --samples N          Sample cards to print (default 6).
 *   --checkpoint PATH    Checkpoint file (default .flashcard-checkpoint.json).
 *   --reset-checkpoint   Start over, ignoring any existing checkpoint.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { and, eq, ne, sql } from "drizzle-orm";
import { db, pool } from "../server/db";
import { flashcards, dbeVerbatimQuestions } from "@shared/schema";
import {
  DEFAULT_MODEL,
  MIN_SOURCE_QUALITY,
  MIN_SOURCE_MEMO_CHARS,
  MAX_SOURCE_QUESTION_CHARS,
  generateCardsForBatch,
  loadSourceQuestions,
  loadTopicPriorities,
  selectSources,
  toFlashcardRows,
  type BatchResult,
  type SourceQuestion,
  type TopicPriority,
} from "../server/flashcard-generator";

// ─────────────────────────────────────────────────────────────────────────────
// Args
// ─────────────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);

function flag(name: string): boolean {
  return argv.includes(`--${name}`);
}
function opt(name: string, fallback: string): string {
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = argv.indexOf(`--${name}`);
  if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--")) return argv[i + 1];
  return fallback;
}
function optAll(name: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === `--${name}` && argv[i + 1] && !argv[i + 1].startsWith("--")) {
      out.push(argv[i + 1]);
    } else if (argv[i].startsWith(`--${name}=`)) {
      out.push(argv[i].slice(name.length + 3));
    }
  }
  return out;
}
function num(name: string, fallback: number): number {
  const v = Number(opt(name, String(fallback)));
  return Number.isFinite(v) ? v : fallback;
}

const CONFIG = {
  subjects: optAll("subject"),
  all: flag("all"),
  limit: num("limit", 200),
  dry: flag("dry"),
  purgeLegacy: flag("purge-legacy"),
  model: opt("model", DEFAULT_MODEL),
  batchSize: num("batch", 4),
  cardsPerSource: num("cards-per-source", 3),
  concurrency: num("concurrency", 3),
  minQuality: num("min-quality", MIN_SOURCE_QUALITY),
  minSources: num("min-sources", 150),
  excludePapers: optAll("exclude-paper").map(Number).filter(Number.isFinite),
  samples: num("samples", 6),
  checkpointPath: resolve(process.cwd(), opt("checkpoint", ".flashcard-checkpoint.json")),
  resetCheckpoint: flag("reset-checkpoint"),
};

// ─────────────────────────────────────────────────────────────────────────────
// Checkpoint
// ─────────────────────────────────────────────────────────────────────────────

interface Checkpoint {
  startedAt: string;
  updatedAt: string;
  /** subject → source question ids already turned into cards (or skipped). */
  processed: Record<string, number[]>;
  stats: Record<string, { accepted: number; rejected: number; inserted: number }>;
}

function loadCheckpoint(): Checkpoint {
  if (!CONFIG.resetCheckpoint && existsSync(CONFIG.checkpointPath)) {
    try {
      return JSON.parse(readFileSync(CONFIG.checkpointPath, "utf-8"));
    } catch {
      console.warn("[flashcards] checkpoint unreadable — starting fresh");
    }
  }
  return {
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    processed: {},
    stats: {},
  };
}

function saveCheckpoint(cp: Checkpoint) {
  if (CONFIG.dry) return;
  cp.updatedAt = new Date().toISOString();
  writeFileSync(CONFIG.checkpointPath, JSON.stringify(cp, null, 2));
}

// ─────────────────────────────────────────────────────────────────────────────
// Subject discovery
// ─────────────────────────────────────────────────────────────────────────────

async function discoverSubjects(): Promise<Array<{ subject: string; usable: number }>> {
  const rows = await db
    .select({
      subject: dbeVerbatimQuestions.subject,
      usable: sql<number>`count(*)::int`,
    })
    .from(dbeVerbatimQuestions)
    .where(
      and(
        sql`${dbeVerbatimQuestions.releasedAt} IS NOT NULL`,
        eq(dbeVerbatimQuestions.accuracyFlag, "clean"),
        sql`${dbeVerbatimQuestions.qualityScore} >= ${CONFIG.minQuality}`,
        sql`${dbeVerbatimQuestions.memoText} IS NOT NULL`,
        sql`length(trim(${dbeVerbatimQuestions.memoText})) >= ${MIN_SOURCE_MEMO_CHARS}`,
        sql`length(trim(${dbeVerbatimQuestions.questionText})) BETWEEN 20 AND ${MAX_SOURCE_QUESTION_CHARS}`,
      ),
    )
    .groupBy(dbeVerbatimQuestions.subject)
    .orderBy(sql`count(*) DESC`);

  return rows.filter((r) => r.usable >= CONFIG.minSources);
}

// ─────────────────────────────────────────────────────────────────────────────
// Concurrency helper
// ─────────────────────────────────────────────────────────────────────────────

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-subject run
// ─────────────────────────────────────────────────────────────────────────────

interface SubjectReport {
  subject: string;
  sourcesConsidered: number;
  sourcesUsed: number;
  rawCards: number;
  accepted: number;
  rejected: number;
  inserted: number;
  rejectionsByReason: Record<string, number>;
  topTopics: string[];
  errors: string[];
  sampleCards: Array<{
    topic: string | null;
    difficulty: string;
    cardType: string;
    front: string;
    back: string;
    frontAf: string;
    backAf: string;
    provenance: string;
  }>;
}

async function runSubject(subject: string, cp: Checkpoint): Promise<SubjectReport> {
  const report: SubjectReport = {
    subject,
    sourcesConsidered: 0,
    sourcesUsed: 0,
    rawCards: 0,
    accepted: 0,
    rejected: 0,
    inserted: 0,
    rejectionsByReason: {},
    topTopics: [],
    errors: [],
    sampleCards: [],
  };

  const priorities = await loadTopicPriorities(subject);
  report.topTopics = priorities.slice(0, 8).map(
    (p) =>
      `${p.name} (rank ${p.frequencyRank}, ${p.appearancesCount} appearances across ${p.totalYearsSampled} years sampled)`,
  );

  // Resume: skip sources already turned into cards, in the checkpoint or in the DB.
  const done = new Set<number>(cp.processed[subject] ?? []);
  if (!CONFIG.dry) {
    const existing = await db
      .selectDistinct({ id: flashcards.sourceQuestionId })
      .from(flashcards)
      .where(and(eq(flashcards.subject, subject), sql`${flashcards.sourceQuestionId} IS NOT NULL`));
    for (const r of existing) if (r.id != null) done.add(r.id);
  }

  const sources = await loadSourceQuestions({
    subject,
    limit: 4000,
    minQuality: CONFIG.minQuality,
    excludeIds: done,
    excludePapers: CONFIG.excludePapers,
  });
  report.sourcesConsidered = sources.length;
  if (sources.length === 0) return report;

  const selected = selectSources(sources, priorities, CONFIG.limit);
  report.sourcesUsed = selected.length;

  const allowedTopics = priorities.slice(0, 20).map((p) => p.name);

  // Chunk into LLM batches.
  const batches: Array<Array<{ source: SourceQuestion; topic: TopicPriority | null }>> = [];
  for (let i = 0; i < selected.length; i += CONFIG.batchSize) {
    batches.push(selected.slice(i, i + CONFIG.batchSize));
  }

  console.log(
    `[flashcards] ${subject}: ${sources.length} usable sources, ` +
      `${selected.length} selected, ${batches.length} batches (model=${CONFIG.model})`,
  );

  const pendingRows: any[] = [];
  let processedBatches = 0;

  /**
   * Long memos occasionally push a response past the model's output limit,
   * which truncates the JSON and loses the whole batch. Retry once with the
   * batch split in half rather than dropping four sources on the floor.
   */
  async function runBatch(
    batch: Array<{ source: SourceQuestion; topic: TopicPriority | null }>,
    allowSplit: boolean,
  ): Promise<BatchResult> {
    const res = await generateCardsForBatch(batch, allowedTopics, {
      model: CONFIG.model,
      cardsPerSource: CONFIG.cardsPerSource,
    });
    if (!res.error || !allowSplit || batch.length < 2) return res;

    const mid = Math.ceil(batch.length / 2);
    const [a, b] = [batch.slice(0, mid), batch.slice(mid)];
    const [ra, rb] = await Promise.all([runBatch(a, false), runBatch(b, false)]);
    return {
      cards: [...ra.cards, ...rb.cards],
      rejected: [...ra.rejected, ...rb.rejected],
      rawCount: ra.rawCount + rb.rawCount,
      error: ra.error && rb.error ? `${ra.error}; ${rb.error}` : undefined,
    };
  }

  const results = await mapLimit(batches, CONFIG.concurrency, async (batch) => {
    const res = await runBatch(batch, true);
    processedBatches++;
    if (processedBatches % 5 === 0) {
      console.log(`[flashcards]   ${subject}: ${processedBatches}/${batches.length} batches`);
    }
    return { batch, res };
  });

  for (const { batch, res } of results) {
    if (res.error) {
      report.errors.push(res.error);
      continue;
    }
    report.rawCards += res.rawCount;
    report.accepted += res.cards.length;
    report.rejected += res.rejected.length;

    for (const r of res.rejected) {
      for (const reason of r.validation.reasons.length ? r.validation.reasons : ["low_score"]) {
        report.rejectionsByReason[reason] = (report.rejectionsByReason[reason] ?? 0) + 1;
      }
    }

    for (const { card, validation, source } of res.cards) {
      const rows = toFlashcardRows(card, source, validation, CONFIG.model);
      pendingRows.push(...rows);
      if (report.sampleCards.length < CONFIG.samples) {
        report.sampleCards.push({
          topic: card.topic,
          difficulty: card.difficulty,
          cardType: card.cardType,
          front: card.front,
          back: card.back,
          frontAf: card.frontAf,
          backAf: card.backAf,
          provenance: `${source.subject} ${source.year} ${source.session} P${source.paperNumber} Q${source.questionNumber} (src #${source.id})`,
        });
      }
    }

    // Mark every source in the batch as handled, including ones that produced
    // nothing — a source the model correctly refused should not be retried
    // forever on resume.
    const list = cp.processed[subject] ?? (cp.processed[subject] = []);
    for (const b of batch) list.push(b.source.id);
  }

  if (!CONFIG.dry && pendingRows.length > 0) {
    if (CONFIG.purgeLegacy) {
      const deleted = await db
        .delete(flashcards)
        .where(and(eq(flashcards.subject, subject), ne(flashcards.source, "ai_humanised")))
        .returning({ id: flashcards.id });
      if (deleted.length > 0) {
        console.log(`[flashcards]   ${subject}: purged ${deleted.length} legacy rows`);
      }
    }
    for (let i = 0; i < pendingRows.length; i += 200) {
      await db.insert(flashcards).values(pendingRows.slice(i, i + 200));
    }
    report.inserted = pendingRows.length;
  }

  cp.stats[subject] = {
    accepted: (cp.stats[subject]?.accepted ?? 0) + report.accepted,
    rejected: (cp.stats[subject]?.rejected ?? 0) + report.rejected,
    inserted: (cp.stats[subject]?.inserted ?? 0) + report.inserted,
  };
  saveCheckpoint(cp);

  return report;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reporting
// ─────────────────────────────────────────────────────────────────────────────

function printReport(reports: SubjectReport[]) {
  console.log("\n" + "=".repeat(78));
  console.log("FLASHCARD GENERATION REPORT" + (CONFIG.dry ? "  [DRY RUN — nothing written]" : ""));
  console.log("=".repeat(78));

  let totalAccepted = 0;
  let totalRejected = 0;
  let totalInserted = 0;
  const allReasons: Record<string, number> = {};

  for (const r of reports) {
    totalAccepted += r.accepted;
    totalRejected += r.rejected;
    totalInserted += r.inserted;
    for (const [k, v] of Object.entries(r.rejectionsByReason)) {
      allReasons[k] = (allReasons[k] ?? 0) + v;
    }

    const rate = r.rawCards > 0 ? ((r.rejected / r.rawCards) * 100).toFixed(1) : "0.0";
    console.log(
      `\n${r.subject}\n` +
        `  sources: ${r.sourcesUsed} used of ${r.sourcesConsidered} usable\n` +
        `  cards:   ${r.rawCards} generated → ${r.accepted} accepted, ${r.rejected} rejected (${rate}% rejection)\n` +
        `  stored:  ${r.inserted} rows (EN+AF pairs)`,
    );
    if (r.topTopics.length) {
      console.log(`  high-yield topics prioritised:`);
      for (const t of r.topTopics.slice(0, 5)) console.log(`    · ${t}`);
    }
    if (Object.keys(r.rejectionsByReason).length) {
      const top = Object.entries(r.rejectionsByReason).sort((a, b) => b[1] - a[1]).slice(0, 6);
      console.log(`  rejection reasons: ${top.map(([k, v]) => `${k}=${v}`).join(", ")}`);
    }
    if (r.errors.length) {
      console.log(`  errors: ${r.errors.length} (${r.errors[0].slice(0, 120)})`);
    }
  }

  console.log("\n" + "-".repeat(78));
  console.log("SAMPLE CARDS");
  console.log("-".repeat(78));
  for (const r of reports) {
    for (const c of r.sampleCards) {
      console.log(
        `\n[${r.subject}] topic=${c.topic ?? "General"} · ${c.difficulty} · ${c.cardType}\n` +
          `  provenance: ${c.provenance}\n` +
          `  EN FRONT: ${c.front}\n` +
          `  EN BACK : ${c.back.replace(/\n/g, "\n            ")}\n` +
          `  AF FRONT: ${c.frontAf}\n` +
          `  AF BACK : ${c.backAf.replace(/\n/g, "\n            ")}`,
      );
    }
  }

  console.log("\n" + "=".repeat(78));
  console.log(
    `TOTAL: ${totalAccepted} accepted · ${totalRejected} rejected · ${totalInserted} rows stored`,
  );
  if (Object.keys(allReasons).length) {
    console.log("Rejection breakdown:");
    for (const [k, v] of Object.entries(allReasons).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${v.toString().padStart(5)}  ${k}`);
    }
  }
  console.log("=".repeat(78));
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  if (CONFIG.subjects.length === 0 && !CONFIG.all) {
    console.error(
      "Specify --subject \"Name\" (repeatable) or --all.\n" +
        "Add --dry to generate and validate without writing.",
    );
    process.exit(1);
  }

  const cp = loadCheckpoint();

  let subjectList: string[];
  if (CONFIG.all) {
    const discovered = await discoverSubjects();
    subjectList = discovered.map((d) => d.subject);
    console.log(
      `[flashcards] --all: ${subjectList.length} subjects with >= ${CONFIG.minSources} usable sources`,
    );
  } else {
    subjectList = CONFIG.subjects;
  }

  const reports: SubjectReport[] = [];
  for (const subject of subjectList) {
    try {
      reports.push(await runSubject(subject, cp));
    } catch (err: any) {
      console.error(`[flashcards] ${subject} failed:`, err?.message ?? err);
      reports.push({
        subject,
        sourcesConsidered: 0,
        sourcesUsed: 0,
        rawCards: 0,
        accepted: 0,
        rejected: 0,
        inserted: 0,
        rejectionsByReason: {},
        topTopics: [],
        errors: [String(err?.message ?? err)],
        sampleCards: [],
      });
    }
  }

  printReport(reports);
  saveCheckpoint(cp);
  await pool.end();
}

main().catch(async (err) => {
  console.error("[flashcards] fatal:", err);
  try {
    await pool.end();
  } catch {
    /* pool already closed */
  }
  process.exit(1);
});
