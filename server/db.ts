import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// ─── PgBouncer / Supabase Pro connection pool ────────────────────────────────
//
// DATABASE_URL should point to the Supabase POOLED connection string
// (port 6543, transaction mode). PgBouncer sits in front and multiplies
// capacity across thousands of client connections, so each app instance
// only needs a small pool slice.
//
// Rules for PgBouncer transaction mode:
//  • No prepared statements that span transactions (node-postgres uses the
//    extended query protocol only when `statement: 'extended'` is set, which
//    we never do, so this is safe by default).
//  • No session-level SET commands that must persist across queries. We do
//    not use pg SET commands outside of transactions, so this is also safe.
//  • Keep per-instance max low — PgBouncer pools across all app instances.
//    10 connections per instance × N autoscale instances is plenty.
//
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                  // Reduced for PgBouncer: 10 per instance (was 20)
  min: 1,                   // Keep 1 warm connection ready
  idleTimeoutMillis: 30000, // 30 s idle before release back to PgBouncer
  connectionTimeoutMillis: 5000,
  maxUses: 7500,            // Retire a client after 7 500 uses (avoids stale TCP)
  allowExitOnIdle: false,
  // Enforce TLS for Supabase connections — rejectUnauthorized prevents MITM
  ...(process.env.DATABASE_URL?.includes('.supabase.') ? { ssl: { rejectUnauthorized: true } } : {}),
});

// Prevent unhandled pool errors from crashing the server.
// Postgres terminates idle connections periodically — the pool will reconnect automatically.
pool.on('error', (err) => {
  console.error('[db] Idle client error:', err.message);
});

// Graceful shutdown — let Node exit naturally after pool drains
// (do NOT call process.exit here; the workflow runner reads that as a crash)
let _shuttingDown = false;
async function gracefulShutdown(signal: string) {
  if (_shuttingDown) return;
  _shuttingDown = true;
  console.log(`[db] ${signal} received — draining pool…`);
  try {
    await Promise.race([
      pool.end(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('pool.end timeout')), 5000)),
    ]);
    console.log('[db] Pool drained cleanly.');
  } catch (err: any) {
    console.error('[db] Pool drain error:', err.message);
  }
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

export const db = drizzle(pool, { schema });
