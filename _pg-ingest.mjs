import EmbeddedPostgres from "embedded-postgres";
const DATA_DIR = "C:/dev/bt-pgdata";
const pg = new EmbeddedPostgres({ databaseDir: DATA_DIR, user: "postgres", password: "postgres", port: 5433, persistent: true });
async function main() {
  try { await pg.initialise(); console.log("[pg] initialised fresh"); } catch { console.log("[pg] existing cluster reused"); }
  await pg.start();
  try { await pg.createDatabase("braintrack"); console.log("[pg] created braintrack"); } catch { console.log("[pg] braintrack exists"); }
  console.log("[pg] READY");
  const stop = async () => { try { await pg.stop(); } catch {} process.exit(0); };
  process.on("SIGINT", stop); process.on("SIGTERM", stop);
  setInterval(() => {}, 1 << 30);
}
main().catch((e) => { console.error("[pg] FATAL", e); process.exit(1); });
