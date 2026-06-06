/**
 * Backfill Whisper transcripts for existing learner voice notes.
 *
 * The upload handler at POST /api/topics/:id/voice-notes only kicks off a
 * Whisper transcription for *new* uploads. Any voice note recorded before the
 * Whisper pipeline shipped has `transcript IS NULL` and/or
 * `transcript_status IS NULL`, so the Smart Tutor never sees its content.
 *
 * This one-shot script iterates those rows, locates the audio file under
 * `uploads/audio/voice-notes/<userId>/...` (the on-disk path is stored in the
 * `audio_url` column), and reuses the same Whisper-1 + verbose_json semantics
 * as `transcribeVoiceNoteInBackground` in `server/routes.ts` to fill them in.
 *
 * Idempotent and safe to re-run:
 *   - skips rows whose `transcript_status` is already a terminal value
 *     (`ready`, `empty`, `failed`) AND have a populated `transcript` (or are
 *     marked `empty`/`failed`).
 *   - rows still in `pending` / `processing` / NULL are (re)processed.
 *   - missing audio files are recorded as `failed` with a clear error rather
 *     than crashing the run.
 *
 * Run:  npx tsx scripts/backfill-voice-note-transcripts.ts
 *
 * Env:
 *   BACKFILL_LIMIT       (optional)  — process at most N rows
 *   BACKFILL_DRY_RUN     ("1" => no DB writes, no OpenAI calls)
 */
import { createReadStream, existsSync } from "fs";
import { join, resolve as resolvePath } from "path";
import OpenAI from "openai";
import type { TranscriptionVerbose } from "openai/resources/audio/transcriptions";
import { and, desc, eq, isNull, or, sql } from "drizzle-orm";
import { db, pool } from "../server/db";
import { voiceNotes } from "@shared/schema";

const VOICE_NOTES_DIR = join(process.cwd(), "uploads", "audio", "voice-notes");
const DRY_RUN = process.env.BACKFILL_DRY_RUN === "1";
const LIMIT = process.env.BACKFILL_LIMIT ? parseInt(process.env.BACKFILL_LIMIT, 10) : undefined;

// Support both OPENAI_API_KEY (set explicitly) and the Replit OpenAI
// integration key (AI_INTEGRATIONS_OPENAI_API_KEY) so the script works
// in environments where only the integration key is configured.
const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

if (!OPENAI_API_KEY && !DRY_RUN) {
  console.error(
    "No OpenAI API key found. Set OPENAI_API_KEY or AI_INTEGRATIONS_OPENAI_API_KEY (set BACKFILL_DRY_RUN=1 to dry-run)."
  );
  process.exit(1);
}

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  return _openai;
}

function resolveAudioPath(audioUrl: string, userId: string): string | null {
  if (!audioUrl) return null;
  // Stored value is the relative on-disk path: `voice-notes/<userId>/<filename>`.
  // Older rows may also be just `<filename>` or a leading-slash variant.
  const cleaned = audioUrl.replace(/^\/+/, "");
  const UPLOADS_ROOT = resolvePath(process.cwd(), "uploads", "audio");
  const candidates = [
    resolvePath(UPLOADS_ROOT, cleaned),
    resolvePath(VOICE_NOTES_DIR, userId, cleaned.split("/").pop() || ""),
    resolvePath(VOICE_NOTES_DIR, cleaned),
  ];
  for (const p of candidates) {
    // Path-containment check: use path.resolve() so that any `..` segments in
    // the stored URL are fully normalised before comparison. The resolved path
    // must start with the uploads/audio root to prevent directory traversal.
    if (p && p.startsWith(UPLOADS_ROOT + "/") && existsSync(p)) return p;
  }
  return null;
}

async function transcribeOne(noteId: number, filePath: string) {
  const fileStream = createReadStream(filePath);
  const result: TranscriptionVerbose = await getOpenAI().audio.transcriptions.create({
    model: "whisper-1",
    file: fileStream,
    response_format: "verbose_json",
  });
  const transcript = (result.text ?? "").toString().trim();
  const language = result.language ?? null;

  await db.update(voiceNotes)
    .set({
      transcript: transcript || null,
      transcriptLang: language,
      transcriptStatus: transcript ? "ready" : "empty",
      transcriptError: null,
      transcribedAt: new Date(),
    })
    .where(eq(voiceNotes.id, noteId));

  return { transcript, language };
}

async function main() {
  console.log("[backfill-voice-notes] Starting", { dryRun: DRY_RUN, limit: LIMIT ?? "none" });

  // Rows that need backfilling: never transcribed (NULL status), or stuck in
  // pending/processing, or marked ready/empty but somehow have no transcript.
  const rows = await db
    .select()
    .from(voiceNotes)
    .where(
      or(
        isNull(voiceNotes.transcriptStatus),
        isNull(voiceNotes.transcript),
        eq(voiceNotes.transcriptStatus, "pending"),
        eq(voiceNotes.transcriptStatus, "processing"),
      ),
    )
    .orderBy(desc(voiceNotes.createdAt));

  const todo = LIMIT ? rows.slice(0, LIMIT) : rows;
  console.log(`[backfill-voice-notes] Candidate rows: ${rows.length} (processing ${todo.length})`);

  let ok = 0;
  let empty = 0;
  let missing = 0;
  let failed = 0;

  for (const row of todo) {
    const tag = `note#${row.id} user=${row.userId} topic=${row.topicId}`;
    // Skip rows already in a terminal state with content.
    if (
      row.transcriptStatus &&
      ["ready", "empty", "failed"].includes(row.transcriptStatus) &&
      (row.transcript || row.transcriptStatus !== "ready")
    ) {
      console.log(`[skip] ${tag} status=${row.transcriptStatus} (already terminal)`);
      continue;
    }

    const filePath = resolveAudioPath(row.audioUrl, row.userId);
    if (!filePath) {
      missing++;
      console.warn(`[missing] ${tag} audioUrl=${row.audioUrl} — file not found on disk`);
      if (!DRY_RUN) {
        await db.update(voiceNotes)
          .set({
            transcriptStatus: "failed",
            transcriptError: "audio file not found on disk during backfill",
          })
          .where(eq(voiceNotes.id, row.id));
      }
      continue;
    }

    if (DRY_RUN) {
      console.log(`[dry-run] ${tag} would transcribe ${filePath}`);
      continue;
    }

    try {
      await db.update(voiceNotes)
        .set({ transcriptStatus: "processing", transcriptError: null })
        .where(eq(voiceNotes.id, row.id));

      const { transcript, language } = await transcribeOne(row.id, filePath);
      if (transcript) {
        ok++;
        console.log(`[ok] ${tag} lang=${language ?? "?"} chars=${transcript.length}`);
      } else {
        empty++;
        console.log(`[empty] ${tag} — Whisper returned no text`);
      }
    } catch (err: any) {
      failed++;
      const msg = (err?.message || "transcription failed").toString().slice(0, 500);
      console.error(`[fail] ${tag} — ${msg}`);
      try {
        await db.update(voiceNotes)
          .set({ transcriptStatus: "failed", transcriptError: msg })
          .where(eq(voiceNotes.id, row.id));
      } catch (innerErr) {
        console.error(`[fail] ${tag} — failed to record failure status`, innerErr);
      }
    }
  }

  console.log("[backfill-voice-notes] Done", {
    candidates: rows.length,
    processed: todo.length,
    ok,
    empty,
    missing,
    failed,
  });
}

main()
  .catch((err) => {
    console.error("[backfill-voice-notes] Fatal error:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try { await pool.end(); } catch {}
  });
