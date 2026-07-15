// Dev launcher for the Claude preview panel: ensures the embedded Postgres is
// up on :5433, then boots the app on :5001 with the local test env.
// Run from the braintrack repo root: node _dev-launch.mjs
import net from "net";
import { spawn } from "child_process";

const PG_PORT = 5433;
const APP_PORT = process.env.PORT || "5001";
const DATA_DIR = "C:/Users/USER/AppData/Local/Temp/claude/C--Users-USER-OneDrive-01--2026-KTH-KT-One-Drive-Karli-Personal/e45056a5-70cf-48bd-9692-d72c2cfa4f2a/scratchpad/pgdata";

function portOpen(port) {
  return new Promise((resolve) => {
    const s = net.connect({ port, host: "127.0.0.1" }, () => { s.destroy(); resolve(true); });
    s.on("error", () => resolve(false));
    s.setTimeout(1500, () => { s.destroy(); resolve(false); });
  });
}

async function ensurePg() {
  if (await portOpen(PG_PORT)) { console.log("[launch] postgres already up on :" + PG_PORT); return; }
  console.log("[launch] starting embedded postgres...");
  const { default: EmbeddedPostgres } = await import("embedded-postgres");
  const pg = new EmbeddedPostgres({ databaseDir: DATA_DIR, user: "postgres", password: "postgres", port: PG_PORT, persistent: true });
  try { await pg.initialise(); console.log("[launch] initialised fresh pg cluster"); } catch { /* exists */ }
  await pg.start();
  try { await pg.createDatabase("braintrack"); } catch { /* exists */ }
  console.log("[launch] postgres READY on :" + PG_PORT);
}

await ensurePg();

console.log("[launch] booting app on :" + APP_PORT);
const child = spawn(
  process.execPath,
  ["--env-file=.env", "--import", "tsx/esm", "server/index.ts"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "development",
      TEST_MODE: "true",
      PORT: APP_PORT,
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5433/braintrack",
      APP_URL: `http://localhost:${APP_PORT}`,
      // requireRole("admin") checks the ADMIN_EMAILS allowlist on top of the DB
      // role — include the seeded dev admin so admin pages work locally.
      ADMIN_EMAILS: "test-admin@braintrack.test,karlit@kthtech.co.za,kreativethinkinghub@gmail.com",
    },
  },
);
child.on("exit", (code) => process.exit(code ?? 0));
