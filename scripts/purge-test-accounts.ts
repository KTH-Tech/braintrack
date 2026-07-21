/**
 * Remove the dev/QA accounts from production, keeping the real admin.
 *
 * The `users` table has NO foreign keys pointing at it, so there is no cascade.
 * A plain DELETE would orphan roughly 250 rows across 21 tables. This clears
 * every child row first, inside a single transaction, so the database ends up
 * either fully clean or completely untouched.
 *
 * Dry-run by default. Pass --confirm to actually delete.
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";

const KEEP_EMAIL = "karlit@kth-tech.com";
const log = (...a: any[]) => console.log(`[${new Date().toISOString()}]`, ...a);

// Child tables to clear before the users themselves. parent_links appears twice
// because a test account can sit on either side of the link.
const CHILD_TABLES: Array<[string, string]> = [
  ["activity_events", "user_id"],
  ["attempts", "user_id"],
  ["coin_transactions", "user_id"],
  ["consent_log", "user_id"],
  ["daily_challenges", "user_id"],
  ["learner_exam_schedule", "user_id"],
  ["learning_events", "user_id"],
  ["notifications", "user_id"],
  ["onboarding_results", "user_id"],
  ["parent_links", "parent_user_id"],
  ["parent_links", "learner_user_id"],
  ["personal_bests", "user_id"],
  ["prep_scores", "user_id"],
  ["refresh_tokens", "user_id"],
  ["study_sessions", "user_id"],
  ["subscriptions", "user_id"],
  ["topic_mastery", "user_id"],
  ["user_badges", "user_id"],
  ["user_coins", "user_id"],
  ["user_progress", "user_id"],
  ["user_streaks", "user_id"],
];

async function main() {
  const confirm = process.argv.includes("--confirm");

  const keep = await db.execute(sql`SELECT id, email FROM users WHERE email = ${KEEP_EMAIL}`);
  const keepRow = (keep as any).rows[0];
  if (!keepRow) {
    // Refuse to wipe every account just because the admin lookup failed.
    throw new Error(
      `Admin ${KEEP_EMAIL} not found — aborting rather than risk deleting every account.`,
    );
  }
  log(`KEEPING: ${keepRow.email} (${keepRow.id})`);

  const doomed = await db.execute(sql`
    SELECT id, email, role FROM users WHERE email <> ${KEEP_EMAIL} ORDER BY email
  `);
  const rows = (doomed as any).rows as Array<{ id: string; email: string; role: string }>;

  if (rows.length === 0) {
    log("Nothing to delete.");
    process.exit(0);
  }

  log(`DELETING ${rows.length} accounts:`);
  rows.forEach((r) => log(`   ${r.email} (${r.role})`));

  if (!confirm) {
    log("DRY RUN — re-run with --confirm to apply.");
    process.exit(0);
  }

  const ids = rows.map((r) => r.id);
  await db.execute(sql`BEGIN`);
  try {
    let removed = 0;
    for (const [table, col] of CHILD_TABLES) {
      const res = await db.execute(
        // Drizzle binds a JS array as a single parameter, which ANY() rejects
        // ("requires array on right side"), so expand to an explicit IN list.
        sql`DELETE FROM ${sql.identifier(table)} WHERE ${sql.identifier(col)} IN (${sql.join(
          ids.map((i) => sql`${i}`),
          sql`, `,
        )})`,
      );
      const n = (res as any).rowCount ?? 0;
      if (n > 0) {
        removed += n;
        log(`   ${table}.${col}: ${n}`);
      }
    }
    const userRes = await db.execute(
      sql`DELETE FROM users WHERE id IN (${sql.join(
        ids.map((i) => sql`${i}`),
        sql`, `,
      )})`,
    );
    await db.execute(sql`COMMIT`);
    log(`DONE — ${(userRes as any).rowCount ?? 0} accounts, ${removed} related rows.`);
  } catch (err) {
    await db.execute(sql`ROLLBACK`);
    throw err;
  }

  const left = await db.execute(sql`SELECT email, role FROM users ORDER BY email`);
  log("REMAINING:");
  (left as any).rows.forEach((r: any) => log(`   ${r.email} (${r.role})`));
  process.exit(0);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
