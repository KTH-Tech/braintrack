/**
 * scripts/grant-trial.cjs — manually start a 14-day trial for a learner by
 * email, so they can reach their classroom without going through /subscribe.
 * Use for stuck/registered learners (e.g. a founder's own child) pre-launch.
 *
 * USAGE (from the repo root, with the prod DB env sourced):
 *   set -a; source /c/dev/bt-prod-db.env; set +a
 *   node scripts/grant-trial.cjs zuanechinner73@gmail.com
 *
 * Idempotent: if the learner already has a subscription row it does nothing.
 * A manual trial has no card on file, so it lapses at day 14 unless the learner
 * later adds a payment method via /subscribe.
 */
const { Client } = require("pg");
const EMAIL = (process.argv[2] || "").trim().toLowerCase();
let url = process.env.PGURL_EXTERNAL || process.env.DATABASE_URL || "";
if (url && !/sslmode=/.test(url)) url += (url.includes("?") ? "&" : "?") + "sslmode=no-verify";

(async () => {
  if (!EMAIL) { console.error("Usage: node scripts/grant-trial.cjs <email>"); process.exit(1); }
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await c.connect();
    const u = await c.query("SELECT id, first_name, last_name, role FROM users WHERE email=$1", [EMAIL]);
    if (!u.rows.length) { console.error("No user with email " + EMAIL); process.exit(1); }
    const uid = u.rows[0].id;
    const existing = await c.query("SELECT id, status, trial_ends_at FROM subscriptions WHERE user_id=$1", [uid]);
    if (existing.rows.length) { console.log("Already has a subscription:", JSON.stringify(existing.rows[0])); return; }

    const cols = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='subscriptions'");
    const names = new Set(cols.rows.map((r) => r.column_name));
    const now = new Date();
    const trialEnds = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const want = { user_id: uid, plan: "premium", price_rands: 169, status: "trial",
      trial_ends_at: trialEnds, start_date: now, created_at: now, updated_at: now };
    const usable = Object.entries(want).filter(([k]) => names.has(k));
    const r = await c.query(
      "INSERT INTO subscriptions (" + usable.map(([k]) => k).join(", ") + ") VALUES (" +
      usable.map((_, i) => "$" + (i + 1)).join(", ") + ") RETURNING id, status, trial_ends_at, plan",
      usable.map(([, v]) => v)
    );
    console.log("TRIAL STARTED for " + EMAIL + ":", JSON.stringify(r.rows[0]));
    console.log("She can now reach her classroom (trial active until " + trialEnds.toISOString().slice(0, 10) + ").");
  } catch (e) { console.error("FAILED:", e.message); process.exit(1); }
  finally { await c.end().catch(() => {}); }
})();
