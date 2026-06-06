/**
 * Detached batch ingestion runner — re-ingests every subject's papers
 * for 2015–2025, retrying any that previously came back empty.
 *
 * Run:   npx tsx scripts/run-ingest-2015-2025.ts
 * Tail:  tail -f /tmp/ingest.log
 *
 * Survives workflow restarts when started with nohup.
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { runIngestionBatch, rebuildMasteryFromExisting } from "../server/dbe-ingestion";
import catalogJson from "../server/data/dbe-papers-catalog.json";

const YEAR_START = 2015;
const YEAR_END = 2025;
const MAX_CONCURRENT = 2;

const log = (...args: any[]) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}]`, ...args);
};

async function main() {
  const fullCatalog = catalogJson as any[];
  const catalog = fullCatalog.filter(
    (e) => typeof e.year === "number" && e.year >= YEAR_START && e.year <= YEAR_END,
  );
  const allSubjects = [...new Set(catalog.filter((e) => !e.isMemo).map((e) => e.subject))].sort();

  log(`Catalog: ${catalog.length} entries · ${allSubjects.length} subjects · years ${YEAR_START}-${YEAR_END}`);

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
    const total = catalog.filter((e) => e.subject === subject && !e.isMemo).length;
    const done = doneMap.get(subject) ?? 0;
    if (done < total) queue.push(subject);
  }
  log(`Queue: ${queue.length} subjects need (re)ingestion · ${allSubjects.length - queue.length} already complete`);

  let finished = 0;
  for (let i = 0; i < queue.length; i += MAX_CONCURRENT) {
    const batch = queue.slice(i, i + MAX_CONCURRENT);
    await Promise.all(
      batch.map(async (subject) => {
        const t0 = Date.now();
        try {
          log(`▶ ${subject}: starting`);
          const summary = await runIngestionBatch(catalog, { subject });
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
      }),
    );
  }
  log(`DONE — processed ${finished} subjects`);
  process.exit(0);
}

main().catch((err) => {
  log("FATAL", err);
  process.exit(1);
});
