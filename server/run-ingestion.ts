import { runIngestionBatch } from "./dbe-ingestion";
import catalog from "./data/dbe-papers-catalog.json";
import type { DBECatalogEntry } from "./dbe-ingestion";

/**
 * Grade 12 NSC ingestion runner.
 *
 * The DBE papers catalog (`server/data/dbe-papers-catalog.json`) is exclusively
 * NSC (Grade 12) past papers, so iterating every distinct subject in the catalog
 * gives us the full Grade 12 surface for 2015–2025.
 *
 * Filters:
 *   --subject="<name>"   restrict to one subject
 *   --year=<YYYY>        restrict to one year (passed to runIngestionBatch)
 *   --force              clear and re-ingest existing rows
 */
async function main() {
  const args = process.argv.slice(2);
  const getArg = (k: string) => {
    const m = args.find(a => a.startsWith(`--${k}=`));
    return m ? m.split("=").slice(1).join("=") : undefined;
  };

  const filterSubject = getArg("subject");
  const filterYear = getArg("year") ? parseInt(getArg("year")!, 10) : undefined;
  const force = args.includes("--force");

  const all = catalog as DBECatalogEntry[];
  const subjects = filterSubject
    ? [filterSubject]
    : [...new Set(all.map(e => e.subject))].sort();

  console.log(`\n=== BrainTrack Grade 12 NSC Ingestion ===`);
  console.log(`Catalog entries: ${all.length} | Subjects to process: ${subjects.length}`);
  if (filterYear) console.log(`Year filter: ${filterYear}`);
  if (force) console.log(`Force re-ingest: ON`);
  console.log();

  let totalCompleted = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  const subjectStats: Array<{ subject: string; ok: number; failed: number; skipped: number; ms: number }> = [];

  for (const subject of subjects) {
    const start = Date.now();
    process.stdout.write(`  → ${subject.padEnd(28)} `);
    try {
      const opts: { subject: string; year?: number; force?: boolean } = { subject };
      if (filterYear) opts.year = filterYear;
      if (force) opts.force = true;
      const summary = await runIngestionBatch(all, opts);
      const ms = Date.now() - start;
      totalCompleted += summary.completed;
      totalFailed += summary.failed;
      totalSkipped += summary.skipped;
      subjectStats.push({ subject, ok: summary.completed, failed: summary.failed, skipped: summary.skipped, ms });
      console.log(`ok=${summary.completed}  fail=${summary.failed}  skip=${summary.skipped}  (${(ms / 1000).toFixed(1)}s)`);
      if (summary.errors.length > 0) {
        summary.errors.slice(0, 3).forEach(e => console.log(`     ⚠ ${e}`));
      }
    } catch (err: unknown) {
      const ms = Date.now() - start;
      const msg = err instanceof Error ? err.message : String(err);
      totalFailed++;
      subjectStats.push({ subject, ok: 0, failed: 1, skipped: 0, ms });
      console.log(`FATAL (${(ms / 1000).toFixed(1)}s): ${msg}`);
    }
  }

  console.log(`\n--- Grade 12 ingestion summary ---`);
  console.log(`  Completed: ${totalCompleted}`);
  console.log(`  Failed:    ${totalFailed}`);
  console.log(`  Skipped:   ${totalSkipped}`);
  console.log(`  Subjects:  ${subjectStats.length}`);
  console.log(`==================================\n`);

  process.exit(totalFailed > 0 && totalCompleted === 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
