/**
 * Targeted re-ingestion of Bantu language subjects (Sepedi/isiZulu/isiXhosa/
 * isiNdebele/Setswana/Sesotho/siSwati/Xitsonga/Tshivenda HL/FAL/SAL).
 *
 * Task #314 verification: previous run-ingest-2015-2025 left these subjects
 * stuck at 1 question/paper. The AI fallback splitter (aiSplitLanguagePaper)
 * has been verified to work on the same paper text when invoked directly,
 * so a fresh run with the OPENAI key present should succeed.
 *
 * Run:   npx tsx scripts/reingest-bantu-languages.ts
 * Tail:  tail -f /tmp/bantu-ingest.log
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { runIngestionBatch, rebuildMasteryFromExisting } from "../server/dbe-ingestion";
import catalogJson from "../server/data/dbe-papers-catalog.json";

const BANTU_PATTERNS = [
  "sepedi", "sesotho", "setswana", "isizulu", "isixhosa",
  "isindebele", "siswati", "xitsonga", "tshivenda",
];

const log = (...args: any[]) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}]`, ...args);
};

function isBantuSubject(subject: string): boolean {
  const s = subject.toLowerCase();
  return BANTU_PATTERNS.some((p) => s.includes(p));
}

async function main() {
  const fullCatalog = catalogJson as any[];
  const allSubjects = [
    ...new Set(
      fullCatalog
        .filter((e) => !e.isMemo && typeof e.subject === "string" && isBantuSubject(e.subject))
        .map((e) => e.subject as string)
    ),
  ].sort();

  log(`Bantu subjects found in catalog: ${allSubjects.length}`);
  for (const s of allSubjects) log(`  • ${s}`);

  const counts = await db.execute(sql`
    SELECT subject, COUNT(*) AS done
    FROM dbe_ingestion_log
    WHERE status = 'completed' AND is_memo = false AND COALESCE(question_count,0) > 1
    GROUP BY subject
  `);
  const doneMap = new Map<string, number>();
  for (const row of counts.rows) {
    doneMap.set(row.subject as string, Number((row as any).done));
  }

  const queue: string[] = [];
  for (const subject of allSubjects) {
    const total = fullCatalog.filter((e) => e.subject === subject && !e.isMemo).length;
    const done = doneMap.get(subject) ?? 0;
    if (done < total) queue.push(subject);
  }
  log(`Queue: ${queue.length} subjects need (re)ingestion`);

  let finished = 0;
  for (const subject of queue) {
    const t0 = Date.now();
    try {
      log(`▶ ${subject}: starting`);
      const summary = await runIngestionBatch(fullCatalog, { subject });
      log(
        `✔ ${subject}: ${summary.completed} ok / ${summary.failed} failed / ${summary.skipped} skipped (${(
          (Date.now() - t0) / 1000
        ).toFixed(1)}s)`,
      );
      try {
        await rebuildMasteryFromExisting(subject);
      } catch (e: any) {
        log(`  mastery rebuild failed for ${subject}: ${e?.message}`);
      }
    } catch (err: any) {
      log(`✖ ${subject}: FAILED ${err?.message ?? String(err)}`);
    } finally {
      finished++;
      log(`  progress: ${finished}/${queue.length}`);
    }
  }
  log(`DONE — processed ${finished} Bantu subjects`);
  process.exit(0);
}

main().catch((err) => {
  log("FATAL", err);
  process.exit(1);
});
