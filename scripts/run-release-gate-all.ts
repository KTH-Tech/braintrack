/**
 * Run the release gate across every subject that still has unreleased rows.
 *
 * Much of the unreleased backlog is not missing memos — it is memo-complete
 * content that simply predates the last gate run, so it never got published.
 * This sweeps all subjects and releases every (year, paper, session, language)
 * tuple that clears MEMO_THRESHOLD_RATIO. Subjects genuinely short on memos are
 * left alone by the gate itself; they need re-ingestion, not a re-run.
 */
import { releaseEligiblePapers } from "../server/release-gate";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

async function main() {
  const before = await db.execute(sql`
    SELECT COUNT(*) FILTER (WHERE released_at IS NOT NULL) AS released,
           COUNT(*) AS total
    FROM dbe_verbatim_questions
  `);
  const b = (before as any).rows[0];
  log(`BEFORE: ${b.released}/${b.total} released`);

  const subjectRows = await db.execute(sql`
    SELECT DISTINCT subject
    FROM dbe_verbatim_questions
    WHERE released_at IS NULL
    ORDER BY subject
  `);
  const subjects = (subjectRows as any).rows.map((r: any) => r.subject as string);
  log(`Sweeping ${subjects.length} subjects with unreleased rows...`);

  let totalTuples = 0;
  for (const subject of subjects) {
    try {
      const results = await releaseEligiblePapers(subject);
      const released = results.filter((r) => r.released);
      if (released.length > 0) {
        totalTuples += released.length;
        log(`  ✓ ${subject}: released ${released.length}/${results.length} tuples`);
      }
    } catch (err: any) {
      // One bad subject must not abort the sweep.
      log(`  ! ${subject}: ${err?.message ?? err}`);
    }
  }

  const after = await db.execute(sql`
    SELECT COUNT(*) FILTER (WHERE released_at IS NOT NULL) AS released,
           COUNT(*) AS total
    FROM dbe_verbatim_questions
  `);
  const a = (after as any).rows[0];
  log(`AFTER: ${a.released}/${a.total} released`);
  log(`GAINED: ${Number(a.released) - Number(b.released)} questions across ${totalTuples} tuples`);
  process.exit(0);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
