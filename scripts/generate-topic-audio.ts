/**
 * Pre-generate TTS audio lessons for every topic with a non-empty summary.
 *
 * For each topic with a `summaryEn` or `summaryAf`, generate an MP3 in both
 * English and Afrikaans, write to `uploads/audio/topics/`, and update the
 * `topics.audio_url` / `topics.audio_url_af` columns.
 *
 * Idempotent: each MP3 filename embeds a 16-char SHA-256 of the narration
 * text, so a topic is only re-rendered when its source text changes. Existing
 * files are skipped without an API call.
 *
 * Safe to run as a background workflow. Logs per-subject counts and errors.
 *
 * Run:  npx tsx scripts/generate-topic-audio.ts
 *
 * Env:
 *   AUDIO_GEN_CONCURRENCY  (default 2)   — parallel TTS requests
 *   AUDIO_GEN_LANGS        (default "en,af")
 *   AUDIO_GEN_SUBJECT_ID   (optional)    — restrict to a single subject id
 *   ELEVENLABS_API_KEY     — if set, use ElevenLabs (cloned voice) instead of OpenAI TTS
 *   ELEVENLABS_VOICE_ID    — the cloned voice ID in ElevenLabs
 */
import { createHash } from "crypto";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import OpenAI from "openai";
import { eq, and, isNotNull, or, ne, inArray } from "drizzle-orm";
import { db } from "../server/db";
import { subjects, topics, topicNotes } from "@shared/schema";

type Lang = "en" | "af";

const TOPICS_AUDIO_DIR = join(process.cwd(), "uploads", "audio", "topics");
const CONCURRENCY = Math.max(1, parseInt(process.env.AUDIO_GEN_CONCURRENCY || "2", 10));
const LANGS: Lang[] = (process.env.AUDIO_GEN_LANGS || "en,af")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter((s): s is Lang => s === "en" || s === "af");
const ONLY_SUBJECT_ID = process.env.AUDIO_GEN_SUBJECT_ID
  ? parseInt(process.env.AUDIO_GEN_SUBJECT_ID, 10)
  : null;

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "";
const USE_ELEVENLABS = !!(ELEVENLABS_API_KEY && ELEVENLABS_VOICE_ID);

// Support both OPENAI_API_KEY (set explicitly) and the Replit OpenAI
// integration key (AI_INTEGRATIONS_OPENAI_API_KEY) so the script works
// in environments where only the integration key is configured.
const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

if (!USE_ELEVENLABS && !OPENAI_API_KEY) {
  console.error(
    "[audio-gen] No TTS provider configured. Set ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID (preferred) or OPENAI_API_KEY — aborting."
  );
  process.exit(1);
}

if (LANGS.length === 0) {
  console.error("[audio-gen] AUDIO_GEN_LANGS resolved to no valid languages (expected 'en' and/or 'af') — aborting.");
  process.exit(1);
}

if (USE_ELEVENLABS) {
  console.log(`[audio-gen] TTS provider: ElevenLabs (cloned voice ${ELEVENLABS_VOICE_ID})`);
} else {
  console.log("[audio-gen] TTS provider: OpenAI (nova)");
}

const openai = USE_ELEVENLABS ? null : new OpenAI({ apiKey: OPENAI_API_KEY! });

function buildTopicNarrationText(topic: any, lang: Lang, noteSummary?: string | null): string {
  const name = lang === "af" ? topic.nameAfrikaans || topic.name : topic.name;
  const topicSummary = lang === "af" ? topic.summaryAf || topic.summaryEn : topic.summaryEn || topic.summaryAf;
  const summary = noteSummary || topicSummary;
  const tips = topic.examTips ? String(topic.examTips) : "";

  // Conversational, teacher-like intro — sounds natural when spoken aloud
  const intro = lang === "af"
    ? `Okay, kom ons kyk vandag na ${name}. Maak seker jy is gereed — hierdie is 'n belangrike onderwerp vir jou eksamen.`
    : `Alright, today we're diving into ${name}. This is an important topic for your exam, so let's break it down clearly.`;

  // Friendly exam-tip bridge, only if tips exist
  const tipsBridge = tips
    ? (lang === "af"
        ? `Hier is 'n paar eksamenwenke wat jy moet onthou:`
        : `Here are a few exam tips worth remembering:`)
    : "";

  // Closing that sounds like a real teacher wrapping up
  const wrap = lang === "af"
    ? "Goed gedaan dat jy geluister het. Probeer die kernpunte in jou eie woorde opsom — dit is die beste manier om seker te maak jy verstaan dit regtig. Sterkte met jou voorbereiding!"
    : "Great work listening through this. Try putting the key ideas into your own words — that's the best way to check that you've really understood it. Good luck with your preparation!";

  const body = (summary && String(summary).trim()) || (lang === "af"
    ? `${name} is 'n kernonderwerp in die KABV-kurrikulum. Sorg dat jy die basiese beginsels goed verstaan voor jou eksamen.`
    : `${name} is a core topic in the CAPS curriculum. Make sure you have a solid grasp of the fundamental concepts before your exam.`);

  const parts = [intro, body];
  if (tipsBridge && tips) parts.push(tipsBridge, tips);
  parts.push(wrap);
  return parts.filter(Boolean).join("\n\n").slice(0, 3500);
}

async function ttsElevenLabs(text: string, maxRetries = 4): Promise<Buffer> {
  let attempt = 0;
  while (true) {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.45,
              similarity_boost: 0.82,
              style: 0.3,
              use_speaker_boost: true,
            },
          }),
        }
      );
      if (!response.ok) {
        const status = response.status;
        const retryable = status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
        if (!retryable || attempt >= maxRetries) {
          const body = await response.text().catch(() => "");
          throw new Error(`ElevenLabs HTTP ${status}: ${body.slice(0, 200)}`);
        }
        const retryAfter = parseInt(response.headers.get("retry-after") || "0", 10);
        const delayMs = retryAfter > 0
          ? retryAfter * 1000
          : Math.min(1000 * Math.pow(2, attempt), 16000) + Math.floor(Math.random() * 500);
        await new Promise((r) => setTimeout(r, delayMs));
        attempt++;
        continue;
      }
      const arrayBuf = await response.arrayBuffer();
      return Buffer.from(arrayBuf);
    } catch (err: any) {
      if (attempt >= maxRetries) throw err;
      const delayMs = Math.min(1000 * Math.pow(2, attempt), 16000) + Math.floor(Math.random() * 500);
      await new Promise((r) => setTimeout(r, delayMs));
      attempt++;
    }
  }
}

async function ttsOpenAI(text: string, maxRetries = 4): Promise<Buffer> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const speech = await openai!.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: text,
        response_format: "mp3",
      });
      return Buffer.from(await speech.arrayBuffer());
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      const retryable = status === 429 || status === 500 || status === 503 || status === 502 || status === 504;
      if (!retryable || attempt >= maxRetries) throw err;
      const headerRetry = parseInt(err?.headers?.["retry-after"] || "0", 10);
      const delayMs = headerRetry > 0
        ? headerRetry * 1000
        : Math.min(1000 * Math.pow(2, attempt), 16000) + Math.floor(Math.random() * 500);
      await new Promise((r) => setTimeout(r, delayMs));
      attempt++;
    }
  }
}

async function ttsWithRetry(text: string, maxRetries = 4): Promise<Buffer> {
  return USE_ELEVENLABS ? ttsElevenLabs(text, maxRetries) : ttsOpenAI(text, maxRetries);
}

type Job = {
  topic: any;
  subjectName: string;
  lang: Lang;
  noteSummary: string | null;
};

type Result = "generated" | "skipped" | "failed";

async function processJob(job: Job): Promise<Result> {
  const { topic, lang, noteSummary } = job;
  const text = buildTopicNarrationText(topic, lang, noteSummary);
  const sourceHash = createHash("sha256").update(`${lang}:${text}`).digest("hex").slice(0, 16);
  const filename = `topic-${topic.id}-${lang}-${sourceHash}.mp3`;
  // Use path.resolve() so any unexpected `..` segments are fully normalised
  // before the containment check. filename is derived from a numeric id, a
  // fixed language code, and a SHA-256 hex digest — no user input — so this
  // guard should never trigger; it is belt-and-suspenders against future
  // refactors that alter filename construction.
  const { resolve: resolvePath } = await import("path");
  const resolvedBase = resolvePath(TOPICS_AUDIO_DIR);
  const filePath = resolvePath(resolvedBase, filename);
  if (!filePath.startsWith(resolvedBase + "/")) {
    console.error(`[audio-gen] Path traversal detected for topic=${topic.id}, lang=${lang}. Skipping.`);
    return "failed";
  }
  const audioUrl = `/api/audio/topics/${filename}`;

  const dbUrl = lang === "af" ? topic.audioUrlAf : topic.audioUrl;
  const dbHash = lang === "af" ? topic.audioSourceHashAf : topic.audioSourceHashEn;
  const pinned = lang === "af" ? topic.audioPinnedAf : topic.audioPinnedEn;
  const fileOnDisk = existsSync(filePath);

  // Admin-pinned audio (uploaded human recording or approved MP3) must never
  // be overwritten by the batch script — the admin will explicitly press
  // "Regenerate" in the Topic Audio Review page when they want a refresh.
  if (pinned) return "skipped";

  // Accept both the new authenticated path and the legacy public path as
  // "already up-to-date" so rows written before Task #418 are not needlessly
  // regenerated.  The URL in the DB will be normalised to the new form the
  // next time /api/topics/:id/audio is called for that topic.
  const legacyUrl = `/uploads/audio/topics/${filename}`;
  if ((dbUrl === audioUrl || dbUrl === legacyUrl) && dbHash === sourceHash) return "skipped";

  if (!fileOnDisk) {
    try {
      const buf = await ttsWithRetry(text);
      await writeFile(filePath, buf);
    } catch (err: any) {
      console.error(`[audio-gen] FAIL topic=${topic.id} (${topic.name}) lang=${lang}: ${err?.message || err}`);
      return "failed";
    }
  }

  const now = new Date();
  const origin = USE_ELEVENLABS ? "elevenlabs" : "tts";
  const updateFields = lang === "af"
    ? {
        audioUrlAf: audioUrl,
        audioGeneratedAt: now,
        audioGeneratedAtAf: now,
        audioSourceHashAf: sourceHash,
        audioOriginAf: origin,
      }
    : {
        audioUrl: audioUrl,
        audioGeneratedAt: now,
        audioGeneratedAtEn: now,
        audioSourceHashEn: sourceHash,
        audioOriginEn: origin,
      };
  try {
    await db.update(topics).set(updateFields).where(eq(topics.id, topic.id));
  } catch (err: any) {
    console.error(`[audio-gen] DB update FAIL topic=${topic.id} (${topic.name}) lang=${lang}: ${err?.message || err}`);
    return "failed";
  }
  return "generated";
}

async function runPool(jobs: Job[]): Promise<{ generated: number; skipped: number; failed: number }> {
  let cursor = 0;
  const counts = { generated: 0, skipped: 0, failed: 0 };
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= jobs.length) return;
      const job = jobs[i];
      const r = await processJob(job);
      counts[r]++;
      if ((counts.generated + counts.skipped + counts.failed) % 25 === 0) {
        console.log(`[audio-gen] progress: ${counts.generated} generated, ${counts.skipped} skipped, ${counts.failed} failed (of ${jobs.length})`);
      }
    }
  });
  await Promise.all(workers);
  return counts;
}

async function main() {
  await mkdir(TOPICS_AUDIO_DIR, { recursive: true });

  console.log(`[audio-gen] starting — concurrency=${CONCURRENCY}, langs=${LANGS.join(",")}${ONLY_SUBJECT_ID ? `, subjectId=${ONLY_SUBJECT_ID}` : ""}`);

  // Find all topic IDs that have topic_notes content (the primary content source)
  // or a legacy summaryEn/summaryAf value on the topics row itself.
  const noteTopicIds = await db
    .selectDistinct({ topicId: topicNotes.topicId })
    .from(topicNotes);
  const noteIds = noteTopicIds.map((r) => r.topicId);

  const whereSummary = or(
    and(isNotNull(topics.summaryEn), ne(topics.summaryEn, "")),
    and(isNotNull(topics.summaryAf), ne(topics.summaryAf, "")),
    noteIds.length > 0 ? inArray(topics.id, noteIds) : undefined,
  );
  const where = ONLY_SUBJECT_ID
    ? and(eq(topics.subjectId, ONLY_SUBJECT_ID), whereSummary)
    : whereSummary;

  const allTopics = await db.select().from(topics).where(where);
  const allSubjects = await db.select().from(subjects);
  const subjectName = new Map<number, string>(allSubjects.map((s) => [s.id, s.name]));

  // Build a lookup map: "topicId-lang" -> note summary
  const allTopicIds = allTopics.map((t) => t.id);
  const allNoteRows = allTopicIds.length > 0
    ? await db
        .select({ topicId: topicNotes.topicId, language: topicNotes.language, summary: topicNotes.summary })
        .from(topicNotes)
        .where(inArray(topicNotes.topicId, allTopicIds))
    : [];
  const noteMap = new Map<string, string>();
  for (const n of allNoteRows) noteMap.set(`${n.topicId}-${n.language}`, n.summary);

  console.log(`[audio-gen] ${allTopics.length} topics with content — ${allTopics.length * LANGS.length} potential audio files`);

  // Group by subject for per-subject reporting
  const bySubject = new Map<number, any[]>();
  for (const t of allTopics) {
    if (!bySubject.has(t.subjectId)) bySubject.set(t.subjectId, []);
    bySubject.get(t.subjectId)!.push(t);
  }

  const totals = { generated: 0, skipped: 0, failed: 0 };
  const subjectIds = Array.from(bySubject.keys()).sort((a, b) => {
    const an = subjectName.get(a) || "";
    const bn = subjectName.get(b) || "";
    return an.localeCompare(bn);
  });

  for (const sid of subjectIds) {
    const subjTopics = bySubject.get(sid)!;
    const sname = subjectName.get(sid) || `subject-${sid}`;
    const jobs: Job[] = [];
    for (const t of subjTopics) {
      for (const lang of LANGS) jobs.push({ topic: t, subjectName: sname, lang, noteSummary: noteMap.get(`${t.id}-${lang}`) || null });
    }
    console.log(`[audio-gen] === ${sname} (id=${sid}) — ${subjTopics.length} topics × ${LANGS.length} langs = ${jobs.length} jobs`);
    const counts = await runPool(jobs);
    console.log(`[audio-gen] === ${sname}: generated=${counts.generated} skipped=${counts.skipped} failed=${counts.failed}`);
    totals.generated += counts.generated;
    totals.skipped += counts.skipped;
    totals.failed += counts.failed;
  }

  console.log(`[audio-gen] DONE — generated=${totals.generated}, skipped=${totals.skipped}, failed=${totals.failed}`);
  process.exit(totals.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[audio-gen] fatal:", err);
  process.exit(1);
});
