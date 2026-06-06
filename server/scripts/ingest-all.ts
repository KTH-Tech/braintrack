import { runIngestionBatch } from "../dbe-ingestion";
import catalog from "../data/dbe-papers-catalog.json";
import type { DBECatalogEntry } from "../dbe-ingestion";

async function main() {
  const subjects = [...new Set((catalog as DBECatalogEntry[]).map(e => e.subject))].sort();
  console.log(`\nDBE Ingestion: ${(catalog as DBECatalogEntry[]).length} catalog entries across ${subjects.length} subjects\n`);

  let totalCompleted = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const subject of subjects) {
    const start = Date.now();
    process.stdout.write(`  → ${subject} ... `);
    try {
      const summary = await runIngestionBatch(catalog as DBECatalogEntry[], { subject });
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      totalCompleted += summary.completed;
      totalFailed += summary.failed;
      totalSkipped += summary.skipped;
      console.log(`done (${summary.completed} ok, ${summary.failed} failed, ${summary.skipped} skipped) [${elapsed}s]`);
      if (summary.errors.length > 0) {
        summary.errors.slice(0, 3).forEach(e => console.log(`     ⚠ ${e}`));
      }
    } catch (err: any) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      totalFailed++;
      console.log(`ERROR [${elapsed}s]: ${err?.message ?? err}`);
    }
  }

  console.log(`\n✅ Ingestion complete — ${totalCompleted} completed, ${totalFailed} failed, ${totalSkipped} skipped\n`);
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
