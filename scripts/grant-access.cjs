/**
 * scripts/grant-access.cjs — give a learner PERMANENT comp access (no trial, no
 * paywall, R0) and optionally (re)set their login password. For founder/family
 * / VIP accounts that should never be charged.
 *
 * Unlike grant-trial.cjs (a 14-day trial that lapses), this writes an ACTIVE
 * comp subscription with a far-future end date, so storage.hasActiveSubscription
 * always passes and the learner lands straight in the classroom.
 *
 * Password is hashed with bcrypt cost 12 — the SAME scheme as server/local-auth.ts
 * (bcryptjs, BCRYPT_COST = 12) — so the login endpoint accepts it. Plaintext is
 * passed as a CLI arg (never written into this file) and never logged.
 *
 * USAGE (from repo root, prod DB env sourced):
 *   set -a; source /c/dev/bt-prod-db.env; set +a
 *   node scripts/grant-access.cjs zuanechinner73@gmail.com "Godfirst@88399"
 *   node scripts/grant-access.cjs zuanechinner73@gmail.com "Godfirst@88399" --name "Zuane Chinner"
 *   node scripts/grant-access.cjs zuanechinner73@gmail.com        # comp only, don't touch password
 *
 * Idempotent + re-runnable. Only NULLs/sets known columns that exist.
 */
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

const BCRYPT_COST = 12;
const COMP_END = new Date("2027-12-31T23:59:59+02:00"); // far-future: effectively permanent

const argv = process.argv.slice(2).filter((a) => a !== "--name" || true);
const rawArgs = process.argv.slice(2);
const EMAIL = (rawArgs[0] || "").trim().toLowerCase();
const PASSWORD = rawArgs[1] && !rawArgs[1].startsWith("--") ? rawArgs[1] : null;
const nameIdx = rawArgs.indexOf("--name");
const NAME = nameIdx !== -1 ? (rawArgs[nameIdx + 1] || "").trim() : "Zuane Chinner";
const [FIRST, ...restName] = NAME.split(/\s+/);
const LAST = restName.join(" ");

let url = process.env.PGURL_EXTERNAL || process.env.DATABASE_URL || "";
if (url && !/sslmode=/.test(url)) url += (url.includes("?") ? "&" : "?") + "sslmode=no-verify";

(async () => {
  if (!EMAIL || !EMAIL.includes("@")) {
    console.error('Usage: node scripts/grant-access.cjs <email> ["<password>"] [--name "First Last"]');
    process.exit(1);
  }
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await c.connect();

    const u = await c.query("SELECT id, first_name, last_name, role FROM users WHERE lower(email)=$1", [EMAIL]);
    if (!u.rows.length) { console.error("No user with email " + EMAIL); process.exit(1); }
    const uid = u.rows[0].id;

    // Which user columns actually exist (schema-safe).
    const ucols = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='users'");
    const uset = new Set(ucols.rows.map((r) => r.column_name));

    const now = new Date();
    const userPatch = {};
    if (uset.has("first_name") && FIRST) userPatch.first_name = FIRST;
    if (uset.has("last_name")) userPatch.last_name = LAST || null;
    if (uset.has("role")) userPatch.role = "learner";
    if (uset.has("role_confirmed")) userPatch.role_confirmed = true;
    if (uset.has("onboarded")) userPatch.onboarded = true;
    if (uset.has("is_minor")) userPatch.is_minor = false;
    if (uset.has("parent_consent_granted")) userPatch.parent_consent_granted = true;
    if (uset.has("parent_consent_granted_at")) userPatch.parent_consent_granted_at = now;
    if (uset.has("updated_at")) userPatch.updated_at = now;
    if (PASSWORD && uset.has("password_hash")) {
      userPatch.password_hash = await bcrypt.hash(PASSWORD, BCRYPT_COST);
    }

    const uEntries = Object.entries(userPatch);
    if (uEntries.length) {
      await c.query(
        "UPDATE users SET " + uEntries.map(([k], i) => `${k}=$${i + 1}`).join(", ") + ` WHERE id=$${uEntries.length + 1}`,
        [...uEntries.map(([, v]) => v), uid]
      );
    }
    console.log("USER updated: " + EMAIL + " → " + FIRST + " " + LAST +
      (PASSWORD ? " (password set)" : " (password unchanged)"));

    // ── Comp subscription: active, R0, far-future end date ──────────────────
    const scols = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='subscriptions'");
    const sset = new Set(scols.rows.map((r) => r.column_name));
    const want = {
      user_id: uid,
      user_role: "learner",
      plan: "premium",
      price_rands: 0,
      status: "active",
      payment_provider: "comp",
      billing_method: "comp",
      start_date: now,
      end_date: COMP_END,
      next_renewal_at: null,
      trial_ends_at: null,
      last_payment_status: "comp",
      updated_at: now,
      created_at: now,
    };
    const usable = Object.entries(want).filter(([k]) => sset.has(k));

    const existing = await c.query("SELECT id FROM subscriptions WHERE user_id=$1", [uid]);
    if (existing.rows.length) {
      const upd = usable.filter(([k]) => k !== "user_id" && k !== "created_at");
      await c.query(
        "UPDATE subscriptions SET " + upd.map(([k], i) => `${k}=$${i + 1}`).join(", ") + ` WHERE id=$${upd.length + 1}`,
        [...upd.map(([, v]) => v), existing.rows[0].id]
      );
      console.log("SUBSCRIPTION comped (updated existing row): active · R0 · until " + COMP_END.toISOString().slice(0, 10));
    } else {
      await c.query(
        "INSERT INTO subscriptions (" + usable.map(([k]) => k).join(", ") + ") VALUES (" +
        usable.map((_, i) => "$" + (i + 1)).join(", ") + ")",
        usable.map(([, v]) => v)
      );
      console.log("SUBSCRIPTION comped (new row): active · R0 · until " + COMP_END.toISOString().slice(0, 10));
    }

    console.log("\nDONE. " + EMAIL + " can log in and reach the classroom — permanent free access, never paywalled.");
  } catch (e) { console.error("FAILED:", e.message); process.exit(1); }
  finally { await c.end().catch(() => {}); }
})();
