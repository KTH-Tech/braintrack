import { defineConfig } from "drizzle-kit";

// When running against Supabase via PgBouncer (transaction mode), Drizzle Kit
// migration commands need a DIRECT connection (port 5432) — not the pooler
// (port 6543) — because migrations use DDL statements that must run outside
// a pooled transaction context.
//
// Set DATABASE_URL_DIRECT to the Supabase direct connection string for
// `drizzle-kit push` / `drizzle-kit generate`. Leave it unset in normal
// app operation; the pool (DATABASE_URL → pooler) handles all runtime queries.
const migrationUrl = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    "DATABASE_URL (or DATABASE_URL_DIRECT for Supabase migrations) must be set."
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl,
  },
});
