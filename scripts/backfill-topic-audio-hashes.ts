/**
 * Backfill per-language audio source hashes for existing topics.
 *
 * Task #363 added `audio_source_hash_en` / `audio_source_hash_af` columns,
 * but existing rows still have NULL values. Without these populated, the next
 * run of `scripts/generate-topic-audio.ts` would treat every topic as
 * out-of-date and re-render every MP3 (an expensive OpenAI TTS call per
 * topic per language).
 *
 * This one-shot script walks every topic with an `audio_url` / `audio_url_af`,
 * recomputes the narration hash for that language, and writes it to the
 * matching per-language column — without calling OpenAI.
 *
 * Idempotent: rows whose per-language hash already matches the freshly
 * computed value are left alone. Mismatches (or NULLs) are updated.
 *
 * After running, a normal `generate-topic-audio.ts` invocation should report
 * `skipped` for all already-rendered topics whose narration text is
 * unchanged.
 *
 * Run:  npx tsx scripts/backfill-topic-audio-hashes.ts
 */
import { createHash } from "crypto";
import { eq, isNotNull, or } from "drizzle-orm";
import { db } from "../server/db";
import { topics } from "@shared/schema";

type Lang = "en" | "af";

function buildTopicNarrationText(topic: any, lang: Lang): string {
  const name = lang === "af" ? topic.nameAfrikaans || topic.name : topic.name;
  const summary = lang === "af" ? topic.summaryAf || topic.summaryEn : topic.summaryEn || topic.summaryAf;
  const tips = topic.examTips ? String(topic.examTips) : "";
  const intro = lang === "af"
    ? `Welkom by 'n klankles oor ${name}.`
    : `Welcome to your audio lesson on ${name}.`;
  const wrap = lang === "af"
    ? "Onthou: hardop herhaling help inligting beter vasleg. Probeer hierdie konsepte saamvat in jou eie woorde."
    : "Remember: speaking concepts aloud helps them stick. Try summarising these ideas in your own words after listening.";
  const body = (summary && String(summary).trim()) || (lang === "af"
    ? `Hierdie onderwerp dek die kernidees van ${name} soos in die KABV-kurrikulum vereis.`
    : `This topic covers the core ideas of ${name} as required by the CAPS curriculum.`);
  return [intro, body, tips, wrap].filter(Boolean).join(" \n\n").slice(0, 3500);
}

function computeHash(topic: any, lang: Lang): string {
  const text = buildTopicNarrationText(topic, lang);
  return createHash("sha256").update(`${lang}:${text}`).digest("hex").slice(0, 16);
}

function expectedUrl(topicId: number, lang: Lang, hash: string): string {
  return `/uploads/audio/topics/topic-${topicId}-${lang}-${hash}.mp3`;
}

async function main() {
  console.log("[backfill-hashes] starting — reading topics with audio URLs");

  const rows = await db
    .select()
    .from(topics)
    .where(or(isNotNull(topics.audioUrl), isNotNull(topics.audioUrlAf)));

  console.log(`[backfill-hashes] ${rows.length} topics have at least one audio_url`);

  const stats = {
    enUpdated: 0,
    enAlreadySet: 0,
    enUrlMismatch: 0,
    afUpdated: 0,
    afAlreadySet: 0,
    afUrlMismatch: 0,
    failed: 0,
  };

  for (const t of rows) {
    const updateFields: Record<string, unknown> = {};

    if (t.audioUrl) {
      const hash = computeHash(t, "en");
      const expected = expectedUrl(t.id, "en", hash);
      if (t.audioUrl !== expected) {
        stats.enUrlMismatch++;
        console.warn(
          `[backfill-hashes] topic=${t.id} (${t.name}) lang=en URL mismatch — db=${t.audioUrl} expected=${expected} (skipping; next generator pass will rebuild)`,
        );
      } else if (t.audioSourceHashEn === hash) {
        stats.enAlreadySet++;
      } else {
        updateFields.audioSourceHashEn = hash;
      }
    }

    if (t.audioUrlAf) {
      const hash = computeHash(t, "af");
      const expected = expectedUrl(t.id, "af", hash);
      if (t.audioUrlAf !== expected) {
        stats.afUrlMismatch++;
        console.warn(
          `[backfill-hashes] topic=${t.id} (${t.name}) lang=af URL mismatch — db=${t.audioUrlAf} expected=${expected} (skipping; next generator pass will rebuild)`,
        );
      } else if (t.audioSourceHashAf === hash) {
        stats.afAlreadySet++;
      } else {
        updateFields.audioSourceHashAf = hash;
      }
    }

    if (Object.keys(updateFields).length === 0) continue;

    try {
      await db.update(topics).set(updateFields).where(eq(topics.id, t.id));
      if ("audioSourceHashEn" in updateFields) stats.enUpdated++;
      if ("audioSourceHashAf" in updateFields) stats.afUpdated++;
    } catch (err: any) {
      stats.failed++;
      console.error(`[backfill-hashes] DB update FAIL topic=${t.id} (${t.name}): ${err?.message || err}`);
    }
  }

  console.log("[backfill-hashes] DONE");
  console.log(
    `[backfill-hashes] EN: updated=${stats.enUpdated} alreadySet=${stats.enAlreadySet} urlMismatch=${stats.enUrlMismatch}`,
  );
  console.log(
    `[backfill-hashes] AF: updated=${stats.afUpdated} alreadySet=${stats.afAlreadySet} urlMismatch=${stats.afUrlMismatch}`,
  );
  console.log(`[backfill-hashes] failed=${stats.failed}`);
  process.exit(stats.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[backfill-hashes] fatal:", err);
  process.exit(1);
});
