/**
 * scripts/verify-content.ts — runnable driver for the factual-correctness
 * verifier (server/content-verifier.ts).
 *
 * Usage:
 *   source /c/dev/bt-openai.env
 *   source /c/dev/bt-prod-db.env
 *   export DATABASE_URL="${PGURL_EXTERNAL}?sslmode=no-verify"
 *
 *   npx tsx scripts/verify-content.ts --ensure-schema
 *   npx tsx scripts/verify-content.ts --source generated --dry
 *   npx tsx scripts/verify-content.ts --source generated --subject Accounting
 *   npx tsx scripts/verify-content.ts --source flashcards --limit 20 --resume
 *
 * Flags:
 *   --source generated|flashcards   which table to verify (default generated)
 *   --subject "X"                   restrict to one subject (repeatable)
 *   --id N                          verify one row by id (repeatable)
 *   --limit N                       verify at most N items
 *   --only-released                 generated_questions: released rows only
 *   --checks solver,caps            run a subset (default both)
 *   --dry                           load + build prompts, no OpenAI, no writes
 *   --resume                        skip ids already in the checkpoint file
 *   --reset                         clear the checkpoint before starting
 *   --state PATH                    checkpoint (default .verify-content-state.json)
 *   --concurrency N                 items in flight (default 4)
 *   --verbose                       print full reasons and concept evidence
 *   --ensure-schema                 apply the additive verification columns
 *
 * Resumability: each item's id is appended to the checkpoint immediately after
 * its verdict commits, so an interrupted run re-entered with --resume never
 * re-verifies (or re-bills) completed work. Flagged items are accumulated in
 * the checkpoint too, so the summary report survives a resume rather than only
 * describing the final fragment.
 *
 * SAFETY: this script only ever writes verification columns. It cannot delete,
 * unpublish or alter content — a `needs_review` verdict is a message to a human,
 * not an action. Removals are the owner's decision.
 */
import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { pool } from "../server/db";
import {
  loadItems, verifyItem, persistVerification, ensureVerificationSchema,
  buildSolvePrompt, buildConceptPrompt, classifyItem,
  VERIFY_MODEL, SOLVER_MODEL,
  type ContentSource, type VerifiableItem, type ItemVerification,
} from "../server/content-verifier";

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

const rawSource = val("--source", "generated")!;
if (rawSource !== "generated" && rawSource !== "flashcards") {
  console.error(`--source must be "generated" or "flashcards" (got "${rawSource}")`);
  process.exit(1);
}
const checks = (val("--checks", "solver,caps") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const OPT = {
  source: rawSource as ContentSource,
  subjects: all("--subject"),
  ids: all("--id").map(Number).filter((n) => Number.isFinite(n)),
  limit: val("--limit") ? Number(val("--limit")) : undefined,
  onlyReleased: has("--only-released"),
  solver: checks.includes("solver"),
  caps: checks.includes("caps"),
  dry: has("--dry"),
  resume: has("--resume"),
  reset: has("--reset"),
  verbose: has("--verbose"),
  ensureSchema: has("--ensure-schema"),
  concurrency: Math.max(1, Number(val("--concurrency", "4"))),
  statePath: resolve(process.cwd(), val("--state", ".verify-content-state.json")!),
};

// ─────────────────────────────── checkpoint ──────────────────────────────────

interface FlaggedRecord {
  source: ContentSource; id: number; subject: string; language: string;
  topic: string | null; priorQualityScore: number | null; released: boolean;
  solverVerdict: string | null; capsVerdict: string | null; reasons: string[];
  offSyllabusConcepts: string[]; conceptHits: string;
}

interface State {
  startedAt: string;
  source: ContentSource;
  done: number[];
  stats: Record<string, number>;
  flagged: FlaggedRecord[];
}

function loadState(): State {
  if (!OPT.reset && existsSync(OPT.statePath)) {
    try {
      const s = JSON.parse(readFileSync(OPT.statePath, "utf8")) as State;
      // A checkpoint from a different --source describes different ids. Reusing
      // it would silently skip real work, so start clean instead.
      if (s.source === OPT.source) return s;
    } catch { /* fall through to a fresh state */ }
  }
  return {
    startedAt: new Date().toISOString(),
    source: OPT.source,
    done: [],
    stats: {
      verified: 0, ok: 0, needs_review: 0,
      solver_agree: 0, solver_disagree: 0, solver_uncertain: 0, solver_error: 0,
      caps_on: 0, caps_off: 0, caps_uncertain: 0, caps_error: 0,
      failed: 0,
    },
    flagged: [],
  };
}
const state = loadState();
const saveState = () => writeFileSync(OPT.statePath, JSON.stringify(state, null, 2));

// ─────────────────────────────── helpers ─────────────────────────────────────

const trunc = (s: string, n: number) =>
  (s ?? "").replace(/\s+/g, " ").trim().slice(0, n) + ((s ?? "").length > n ? "…" : "");

function conceptSummary(v: ItemVerification): string {
  const c = v.caps?.concepts ?? [];
  return c.length ? c.map((e) => `${e.concept}=${e.hits}`).join(", ") : "—";
}

function record(v: ItemVerification): void {
  state.stats.verified++;
  state.stats[v.flag]++;
  if (v.solver) {
    if (!v.solver.ran) state.stats.solver_error++;
    else state.stats[`solver_${v.solver.verdict}`]++;
  }
  if (v.caps) {
    if (!v.caps.ran) state.stats.caps_error++;
    else state.stats[v.caps.verdict === "on_syllabus" ? "caps_on"
      : v.caps.verdict === "off_syllabus" ? "caps_off" : "caps_uncertain"]++;
  }
  if (v.flag === "needs_review") {
    state.flagged.push({
      source: v.item.source, id: v.item.id, subject: v.item.subject, language: v.item.language,
      topic: v.item.topic, priorQualityScore: v.item.priorQualityScore, released: v.item.released,
      solverVerdict: v.solver?.verdict ?? null, capsVerdict: v.caps?.verdict ?? null,
      reasons: v.reasons, offSyllabusConcepts: v.caps?.offSyllabusConcepts ?? [],
      conceptHits: conceptSummary(v),
    });
  }
}

function line(v: ItemVerification): string {
  const i = v.item;
  const mark = v.flag === "ok" ? "✓" : v.caps?.verdict === "off_syllabus" ? "✗" : "~";
  const s = v.solver ? `solver=${v.solver.verdict}(${v.solver.matchScore.toFixed(2)})` : "solver=skipped";
  const c = v.caps ? `caps=${v.caps.verdict}(${v.caps.confidence.toFixed(2)})` : "caps=skipped";
  return `  ${mark} #${i.id} ${i.subject} [${i.language}] ${i.topic ?? "—"} ` +
    `${i.priorQualityScore != null ? `prior=${i.priorQualityScore} ` : ""}${i.released ? "RELEASED " : ""}` +
    `${s} ${c}\n      concepts: ${conceptSummary(v)}`;
}

/** Bounded-concurrency map. Each item is 4 model calls; unbounded fan-out over
 *  a few hundred rows would just collect rate-limit errors. */
async function mapPool<T, R>(items: T[], n: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
    }
  }));
  return out;
}

// ─────────────────────────────── report ──────────────────────────────────────

function report(): void {
  const s = state.stats;
  const W = 78;
  console.log(`\n${"═".repeat(W)}`);
  console.log(`VERIFICATION SUMMARY — source=${state.source}  model=${VERIFY_MODEL}  solver=${SOLVER_MODEL}`);
  console.log("═".repeat(W));
  console.log(`Items verified : ${s.verified}` + (s.failed ? `   (${s.failed} failed to persist)` : ""));
  console.log(`  ok           : ${s.ok}`);
  console.log(`  needs_review : ${s.needs_review}`);
  console.log(`\nSolver verification (independent re-answer, memo withheld)`);
  console.log(`  agree        : ${s.solver_agree}`);
  console.log(`  disagree     : ${s.solver_disagree}`);
  console.log(`  uncertain    : ${s.solver_uncertain}`);
  if (s.solver_error) console.log(`  errored      : ${s.solver_error}`);
  console.log(`\nCAPS syllabus alignment (corpus corroboration + SA-CAPS judge)`);
  console.log(`  on_syllabus  : ${s.caps_on}`);
  console.log(`  off_syllabus : ${s.caps_off}`);
  console.log(`  uncertain    : ${s.caps_uncertain}`);
  if (s.caps_error) console.log(`  errored      : ${s.caps_error}`);

  if (!state.flagged.length) {
    console.log(`\nNothing flagged.`);
    console.log("═".repeat(W));
    return;
  }

  // Off-syllabus first — that is the bucket a human must action today.
  const order = { off_syllabus: 0, uncertain: 1 } as Record<string, number>;
  const sorted = [...state.flagged].sort((a, b) =>
    (order[a.capsVerdict ?? ""] ?? 2) - (order[b.capsVerdict ?? ""] ?? 2) || a.id - b.id);

  console.log(`\n${"─".repeat(W)}`);
  console.log(`FLAGGED FOR HUMAN REVIEW — ${state.flagged.length} item(s)`);
  console.log(`Nothing has been deleted, unpublished or altered. Removals are your call.`);
  console.log("─".repeat(W));
  for (const f of sorted) {
    const banner = f.capsVerdict === "off_syllabus" ? "  ⛔ OFF-SYLLABUS" : "  ⚠";
    console.log(`\n${banner} ${f.source} #${f.id} — ${f.subject} [${f.language}] / ${f.topic ?? "no topic"}` +
      `${f.released ? "  ** LIVE TO LEARNERS **" : ""}` +
      `${f.priorQualityScore != null ? `  (old structural score: ${f.priorQualityScore})` : ""}`);
    console.log(`     solver=${f.solverVerdict ?? "—"}  caps=${f.capsVerdict ?? "—"}`);
    if (f.offSyllabusConcepts.length) {
      console.log(`     off-syllabus concept(s): ${f.offSyllabusConcepts.join(", ")}`);
    }
    console.log(`     corpus hits: ${f.conceptHits}`);
    for (const r of f.reasons) console.log(`     · ${trunc(r, 320)}`);
  }
  console.log(`\n${"═".repeat(W)}`);
}

// ──────────────────────────────── run ────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`verify-content — source=${OPT.source} model=${VERIFY_MODEL} solver=${SOLVER_MODEL}` +
    `${OPT.dry ? " [DRY RUN]" : ""} checks=${[OPT.solver && "solver", OPT.caps && "caps"].filter(Boolean).join("+") || "none"}`);

  if (!OPT.solver && !OPT.caps) {
    console.error("--checks selected neither solver nor caps; nothing to do.");
    process.exit(1);
  }

  if (OPT.ensureSchema) {
    await ensureVerificationSchema();
    console.log("[schema] verification columns + indexes ensured on generated_questions and flashcards.");
    if (argv.length === 1) { await pool.end(); return; }
  }

  let items: VerifiableItem[] = await loadItems(OPT.source, {
    subjects: OPT.subjects.length ? OPT.subjects : undefined,
    ids: OPT.ids.length ? OPT.ids : undefined,
    onlyReleased: OPT.onlyReleased,
    limit: OPT.limit,
  });

  if (OPT.resume && state.done.length) {
    const before = items.length;
    const done = new Set(state.done);
    items = items.filter((i) => !done.has(i.id));
    console.log(`Resume: skipping ${before - items.length} already-verified item(s).`);
  }

  console.log(`Loaded ${items.length} item(s) to verify.\n`);
  if (!items.length) { report(); await pool.end(); return; }

  if (OPT.dry) {
    for (const i of items) {
      const sp = buildSolvePrompt(i);
      const cp = buildConceptPrompt(i);
      console.log(`  · #${i.id} ${i.subject} [${i.language}] ${i.topic ?? "—"} ` +
        `kind=${classifyItem(i)} ${i.released ? "RELEASED " : ""}` +
        `solvePrompt=${sp.system.length + sp.user.length}ch conceptPrompt=${cp.system.length + cp.user.length}ch`);
      console.log(`      Q: ${trunc(i.prompt, 110)}`);
      console.log(`      A: ${trunc(i.memo, 110)}`);
      if (OPT.verbose) {
        console.log(`\n${"─".repeat(74)}\nSOLVE SYSTEM:\n${sp.system}\n\nSOLVE USER:\n${sp.user}\n${"─".repeat(74)}\n`);
      }
    }
    console.log(`\n[DRY RUN] ${items.length} item(s) would be verified — no OpenAI calls, no writes.`);
    await pool.end();
    return;
  }

  await mapPool(items, OPT.concurrency, async (item) => {
    let v: ItemVerification;
    try {
      v = await verifyItem(item, { solver: OPT.solver, caps: OPT.caps });
    } catch (err: any) {
      state.stats.failed++;
      console.log(`  ✗ #${item.id} ${item.subject} — verification threw: ${err.message}`);
      return;
    }
    record(v);
    console.log(line(v));
    if (OPT.verbose) for (const r of v.reasons) console.log(`      · ${r}`);
    try {
      await persistVerification(v);
    } catch (err: any) {
      state.stats.failed++;
      console.log(`      ! persist failed for #${item.id}: ${err.message}`);
      return;
    }
    // Checkpoint only AFTER the verdict is committed, so an interrupted run
    // never marks an item done whose verdict was never written.
    state.done.push(item.id);
    saveState();
  });

  report();
  console.log(`Checkpoint: ${OPT.statePath} (${state.done.length} item(s) done)`);
  await pool.end();
}

main().catch(async (e) => { console.error(e); await pool.end(); process.exit(1); });
