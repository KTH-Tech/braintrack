/**
 * Migrate existing disk audio files to Supabase Storage.
 *
 * Run with:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   DATABASE_URL=postgres://... \
 *   npx tsx scripts/migrate-audio-to-supabase.ts
 *
 * Idempotent — already-migrated rows (audio_url starts with "supabase://") are skipped.
 * Dry-run mode: set DRY_RUN=1 to see what would be migrated without writing.
 */

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import * as schema from "../shared/schema";
import { eq, not, like } from "drizzle-orm";

const DRY_RUN = process.env.DRY_RUN === "1";
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DATABASE_URL = process.env.DATABASE_URL!;

if (!SUPABASE_URL || !SUPABASE_KEY || !DATABASE_URL) {
  console.error("Required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
const pool = new pg.Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

const CWD = process.cwd();
const VOICE_NOTES_ROOT = join(CWD, "uploads", "audio", "voice-notes");
const TOPICS_AUDIO_ROOT = join(CWD, "uploads", "audio", "topics");

async function uploadBuffer(bucket: string, path: string, buf: Buffer, contentType: string) {
  const { error } = await supabase.storage.from(bucket).upload(path, buf, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Supabase upload failed (${bucket}/${path}): ${error.message}`);
}

async function migrateVoiceNotes() {
  console.log("\n=== Voice Notes Migration ===");
  const rows = await db.select({
    id: schema.voiceNotes.id,
    userId: schema.voiceNotes.userId,
    audioUrl: schema.voiceNotes.audioUrl,
  })
    .from(schema.voiceNotes)
    .where(not(like(schema.voiceNotes.audioUrl, "supabase://%")));

  console.log(`Found ${rows.length} voice notes to migrate`);
  let ok = 0, skip = 0, fail = 0;

  for (const row of rows) {
    const rel = row.audioUrl.replace(/^\/+/, "");
    const diskPath = rel.startsWith("uploads/") ? join(CWD, rel) : join(VOICE_NOTES_ROOT, "..", rel);

    if (!existsSync(diskPath)) {
      console.warn(`  [skip] #${row.id} — file not found: ${diskPath}`);
      skip++;
      continue;
    }

    const buf = readFileSync(diskPath);
    const ext = diskPath.split(".").pop() ?? "webm";
    const objectPath = `${row.userId}/${row.id}.${ext}`;
    const mime = ext === "mp3" ? "audio/mpeg"
      : ext === "ogg" ? "audio/ogg"
      : ext === "wav" ? "audio/wav"
      : ext === "m4a" ? "audio/mp4"
      : "audio/webm";
    const newUrl = `supabase://voice-notes/${objectPath}`;

    if (DRY_RUN) {
      console.log(`  [dry] #${row.id} → ${newUrl}`);
      ok++;
      continue;
    }

    try {
      await uploadBuffer("voice-notes", objectPath, buf, mime);
      await db.update(schema.voiceNotes).set({ audioUrl: newUrl }).where(eq(schema.voiceNotes.id, row.id));
      console.log(`  [ok] #${row.id} → ${newUrl}`);
      ok++;
    } catch (err: any) {
      console.error(`  [FAIL] #${row.id}: ${err.message}`);
      fail++;
    }
  }

  console.log(`Voice notes: ${ok} migrated, ${skip} skipped, ${fail} failed`);
}

async function migrateTopicAudio() {
  console.log("\n=== Topic Audio Migration ===");
  // Topics with EN audio on disk
  const enRows = await db.select({ id: schema.topics.id, audioUrl: schema.topics.audioUrl })
    .from(schema.topics)
    .where(not(like(schema.topics.audioUrl as any, "supabase://%")));
  // Topics with AF audio on disk (separate column)
  const afRows = await db.select({ id: schema.topics.id, audioUrlAf: schema.topics.audioUrlAf })
    .from(schema.topics)
    .where(not(like(schema.topics.audioUrlAf as any, "supabase://%")));

  console.log(`Found ${enRows.length} EN + ${afRows.length} AF topic audio rows`);
  let ok = 0, skip = 0, fail = 0;

  const processUrl = async (topicId: number, storedUrl: string | null | undefined, lang: "en" | "af") => {
    if (!storedUrl) { skip++; return null; }
    if (storedUrl.startsWith("supabase://")) { skip++; return null; }

    const filename = storedUrl.split("/").pop();
    if (!filename) { skip++; return null; }
    const diskPath = join(TOPICS_AUDIO_ROOT, filename);
    if (!existsSync(diskPath)) {
      console.warn(`  [skip] topic #${topicId} ${lang} — file not found`);
      skip++;
      return null;
    }

    const buf = readFileSync(diskPath);
    const objectPath = `${lang}/${topicId}.mp3`;
    const newUrl = `supabase://topic-audio/${objectPath}`;

    if (DRY_RUN) {
      console.log(`  [dry] topic #${topicId} ${lang} → ${newUrl}`);
      ok++;
      return newUrl;
    }

    await uploadBuffer("topic-audio", objectPath, buf, "audio/mpeg");
    ok++;
    return newUrl;
  };

  for (const row of enRows) {
    try {
      const newUrl = await processUrl(row.id, row.audioUrl ?? undefined, "en");
      if (newUrl) await db.update(schema.topics).set({ audioUrl: newUrl }).where(eq(schema.topics.id, row.id));
    } catch (err: any) {
      console.error(`  [FAIL] topic #${row.id} EN: ${err.message}`);
      fail++;
    }
  }

  for (const row of afRows) {
    try {
      const newUrl = await processUrl(row.id, row.audioUrlAf ?? undefined, "af");
      if (newUrl) await db.update(schema.topics).set({ audioUrlAf: newUrl }).where(eq(schema.topics.id, row.id));
    } catch (err: any) {
      console.error(`  [FAIL] topic #${row.id} AF: ${err.message}`);
      fail++;
    }
  }

  console.log(`Topic audio: ${ok} migrated, ${skip} skipped, ${fail} failed`);
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  await migrateVoiceNotes();
  await migrateTopicAudio();
  await pool.end();
  console.log("\nDone.");
}

main().catch(err => {
  console.error("[migrate-audio-to-supabase] Fatal:", err.message);
  process.exit(1);
});
