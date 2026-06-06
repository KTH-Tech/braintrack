import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "./db";
import { topicNotes, topics } from "@shared/schema";
import { storage } from "./storage";

const TTL_MS = 60 * 60 * 1000;
const SEEDER_VERSION_KEY = "topic_content_seeder.curated_count_version";

type CacheEntry = {
  counts: Map<number, number>;
  loadedAt: number;
  version: string | null;
};

let entry: CacheEntry | null = null;
let inflight: Promise<Map<number, number>> | null = null;

async function loadCountsForAllSubjects(): Promise<Map<number, number>> {
  const rows = await db
    .select({ subjectId: topics.subjectId, topicId: topicNotes.topicId })
    .from(topicNotes)
    .innerJoin(topics, eq(topicNotes.topicId, topics.id))
    .where(and(
      eq(topicNotes.source, "caps_seed_v1"),
      sql`length(${topicNotes.summary}) > 0`,
    ));
  const seen = new Set<string>();
  const counts = new Map<number, number>();
  for (const r of rows) {
    const key = `${r.subjectId}:${r.topicId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    counts.set(r.subjectId, (counts.get(r.subjectId) ?? 0) + 1);
  }
  return counts;
}

async function readSeederVersion(): Promise<string | null> {
  try {
    const v = await storage.getSystemConfigValue(SEEDER_VERSION_KEY);
    if (v == null) return null;
    return typeof v === "string" ? v : JSON.stringify(v);
  } catch {
    return null;
  }
}

export async function getCuratedTopicCountsBySubject(
  subjectIds: number[],
): Promise<Map<number, number>> {
  if (subjectIds.length === 0) return new Map();

  const now = Date.now();
  if (entry && now - entry.loadedAt < TTL_MS) {
    const currentVersion = await readSeederVersion();
    if (currentVersion === entry.version) {
      return filterToRequested(entry.counts, subjectIds);
    }
  }

  if (inflight) {
    const counts = await inflight;
    return filterToRequested(counts, subjectIds);
  }

  inflight = (async () => {
    const [counts, version] = await Promise.all([
      loadCountsForAllSubjects(),
      readSeederVersion(),
    ]);
    entry = { counts, loadedAt: Date.now(), version };
    return counts;
  })();

  try {
    const counts = await inflight;
    return filterToRequested(counts, subjectIds);
  } finally {
    inflight = null;
  }
}

function filterToRequested(
  all: Map<number, number>,
  subjectIds: number[],
): Map<number, number> {
  const out = new Map<number, number>();
  for (const id of subjectIds) {
    const v = all.get(id);
    if (v !== undefined) out.set(id, v);
  }
  return out;
}

export function invalidateCuratedTopicCountCache(): void {
  entry = null;
}

/**
 * Bump the shared version stamp in system_config AND drop the local cache.
 * Use this for any write that changes curated topic-note counts (seeder run,
 * admin topic-note create/update/delete/bulk-import) so that every web-app
 * instance — not just the one that served the request — picks up the change
 * on its next /api/subjects hit.
 */
export async function bumpCuratedTopicCountVersion(updatedBy?: string): Promise<void> {
  const version = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    await storage.setSystemConfigValue(SEEDER_VERSION_KEY, version, updatedBy);
  } catch (e) {
    console.warn("Failed to bump curated-topic-count cache version:", e);
  }
  invalidateCuratedTopicCountCache();
}

export async function markSeederCompleted(updatedBy?: string): Promise<void> {
  await bumpCuratedTopicCountVersion(updatedBy);
}
