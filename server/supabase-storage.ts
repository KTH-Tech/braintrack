/**
 * Supabase Storage helper — voice notes + topic audio (H4 / Task #5).
 *
 * Falls back gracefully: if SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set,
 * every function returns null and the caller keeps writing to disk. This means the
 * same binary runs in local dev (disk) and production (Supabase Storage) without any
 * code branch at the call site.
 *
 * Bucket names must be created in the Supabase dashboard:
 *   - "voice-notes"   (private, 10 MB per file)
 *   - "topic-audio"   (private, 20 MB per file)
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

// ─── Voice Notes ─────────────────────────────────────────────────────────────

/**
 * Upload a voice note buffer to Supabase Storage.
 * Returns the public-facing path key (used in voice_notes.audio_url), or null on failure/unconfigured.
 *
 * Path in bucket: `{userId}/{noteId}.{ext}`
 */
export async function uploadVoiceNote(opts: {
  buffer: Buffer;
  userId: string;
  noteId: number;
  ext: string;
  mimetype: string;
}): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const objectPath = `${opts.userId}/${opts.noteId}.${opts.ext}`;
  const { error } = await client.storage
    .from("voice-notes")
    .upload(objectPath, opts.buffer, {
      contentType: opts.mimetype,
      upsert: true,
    });

  if (error) {
    console.error("[supabase-storage] voice-note upload error:", error.message);
    return null;
  }
  return `supabase://voice-notes/${objectPath}`;
}

/**
 * Generate a signed URL for a voice note (valid for 1 hour).
 * Pass the stored `audio_url` value (starts with "supabase://voice-notes/").
 */
export async function getVoiceNoteSignedUrl(storedUrl: string): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const SUPABASE_PREFIX = "supabase://voice-notes/";
  if (!storedUrl.startsWith(SUPABASE_PREFIX)) return null;

  const objectPath = storedUrl.slice(SUPABASE_PREFIX.length);
  const { data, error } = await client.storage
    .from("voice-notes")
    .createSignedUrl(objectPath, 3600);

  if (error || !data) {
    console.error("[supabase-storage] signed URL error:", error?.message);
    return null;
  }
  return data.signedUrl;
}

// ─── Topic Audio ─────────────────────────────────────────────────────────────

/**
 * Upload a topic audio MP3 to Supabase Storage.
 * Returns the stored URL key, or null on failure/unconfigured.
 *
 * Path in bucket: `{lang}/{topicId}.mp3`
 */
export async function uploadTopicAudio(opts: {
  buffer: Buffer;
  topicId: number;
  lang: "en" | "af";
}): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const objectPath = `${opts.lang}/${opts.topicId}.mp3`;
  const { error } = await client.storage
    .from("topic-audio")
    .upload(objectPath, opts.buffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (error) {
    console.error("[supabase-storage] topic-audio upload error:", error.message);
    return null;
  }
  return `supabase://topic-audio/${objectPath}`;
}

/**
 * Generate a signed URL for a topic audio file (valid for 24 hours).
 */
export async function getTopicAudioSignedUrl(storedUrl: string): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const SUPABASE_PREFIX = "supabase://topic-audio/";
  if (!storedUrl.startsWith(SUPABASE_PREFIX)) return null;

  const objectPath = storedUrl.slice(SUPABASE_PREFIX.length);
  const { data, error } = await client.storage
    .from("topic-audio")
    .createSignedUrl(objectPath, 86400);

  if (error || !data) {
    console.error("[supabase-storage] topic-audio signed URL error:", error?.message);
    return null;
  }
  return data.signedUrl;
}

// ─── Disk-to-Supabase migration helper ───────────────────────────────────────

/**
 * Returns true if Supabase Storage is configured and reachable.
 * Used by the migration script and health checks.
 */
export async function isStorageConfigured(): Promise<boolean> {
  const client = getClient();
  if (!client) return false;
  const { error } = await client.storage.from("voice-notes").list("", { limit: 1 });
  return !error;
}
