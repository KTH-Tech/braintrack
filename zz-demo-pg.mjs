import EmbeddedPostgres from "embedded-postgres";
const DATA_DIR = "C:/Users/USER/AppData/Local/Temp/claude/C--Users-USER-OneDrive-01--2026-KTH-KT-One-Drive-Karli-Personal/1cbb6ba8-d1d4-4b4c-be59-e842e2028f8f/scratchpad/pgdata";
const pg = new EmbeddedPostgres({ databaseDir: DATA_DIR, user: "postgres", password: "postgres", port: 5442, persistent: true });
try { await pg.initialise(); } catch {}
await pg.start();
console.log("[pg] READY");
setInterval(() => {}, 1 << 30);
