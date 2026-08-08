/**
 * server/games/routes.ts — learning-games arcade API.
 *
 * Registered from server/routes.ts via registerGamesRoutes(app). All endpoints
 * require auth. Every piece of playable content comes from decks.ts, which only
 * reads VERIFIED sources (see that file's header). No model calls at play time.
 *
 * FREE-vs-PAID GATE
 *   Subscriber (storage.hasActiveSubscription — trial | active | grace):
 *     unlimited plays, competitively ranked leaderboard.
 *   Non-subscriber:
 *     capped to DAILY_FREE_LIMIT completed games per day (enforced server-side
 *     by counting today's game_scores rows in SA time), and every leaderboard
 *     response carries viewOnly:true (ranks are visible; competing/appearing on
 *     the ranked board is an upgrade prompt).
 *
 * BOOT-SAFE: no top-level throws, no env reads, no client construction at import.
 */

import type { Express } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { storage } from "../storage";
import { isAuthenticated } from "../replit_integrations/auth";
import { users } from "@shared/models/auth";
import { subjects, gameScores } from "@shared/schema";
import {
  buildRapidFireDeck,
  buildCommandWordsDeck,
  buildHighYieldDeck,
  pairsToCards,
  type GameName,
} from "./decks";

const GAME_NAMES = ["rapid_fire", "memory_match"] as const;
const DAILY_FREE_LIMIT = 1; // completed games per day for non-subscribers
const LEADERBOARD_TOP = 50;
const RAPID_FIRE_COUNT = 10;
const MEMORY_PAIRS = 8;
const SA_OFFSET_MS = 2 * 60 * 60 * 1000; // Africa/Johannesburg (UTC+2, no DST)

/** UTC instant of the most recent SA (UTC+2) midnight — start of "today". */
function saDayStartUtc(now = Date.now()): Date {
  const sa = new Date(now + SA_OFFSET_MS);
  const saMidnight = Date.UTC(
    sa.getUTCFullYear(),
    sa.getUTCMonth(),
    sa.getUTCDate(),
    0,
    0,
    0,
    0,
  );
  return new Date(saMidnight - SA_OFFSET_MS);
}

/** Count a user's completed games since SA midnight (drives the free cap). */
async function countGamesToday(userId: string): Promise<number> {
  const since = saDayStartUtc();
  const r = await db.execute<{ n: number }>(sql`
    SELECT COUNT(*)::int AS n
      FROM game_scores
     WHERE user_id = ${userId}
       AND created_at >= ${since.toISOString()}
  `);
  return Number(r.rows?.[0]?.n ?? 0);
}

/**
 * LEARNER-ONLY stats (founder decision 2026-08: no leaderboards — a learner
 * only ever competes with themself, "you vs you"). Returns the caller's own
 * best + play count for a game/subject. No ranks, no other users' data.
 */
async function personalStats(opts: {
  userId: string;
  game: GameName;
  subjectId: number | null;
  since?: Date | null;
}): Promise<{ best: number | null; plays: number }> {
  const { userId, game, subjectId, since } = opts;
  const subjectClause =
    subjectId == null ? sql`AND subject_id IS NULL` : sql`AND subject_id = ${subjectId}`;
  const sinceClause = since == null ? sql`` : sql`AND created_at >= ${since.toISOString()}`;

  const r = await db.execute<{ best_score: number | null; plays: number }>(sql`
    SELECT MAX(score) AS best_score, COUNT(*)::int AS plays
      FROM game_scores
     WHERE user_id = ${userId}
       AND game = ${game}
       ${subjectClause}
       ${sinceClause}
  `);
  const row = r.rows?.[0];
  return {
    best: row?.best_score == null ? null : Number(row.best_score),
    plays: Number(row?.plays ?? 0),
  };
}

export function registerGamesRoutes(app: Express): void {
  // Score submission is a write — keep it modestly rate-limited per user.
  const gameScoreLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: "Please slow down before submitting more scores" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.TEST_MODE === "true",
    keyGenerator: (req) => {
      const uid = (req as any)?.user?.claims?.sub;
      return uid ? `u:${uid}` : (req.ip ?? "unknown");
    },
  });

  // ── GET /api/games/decks/:game?subject=&lang=&deck= ──────────────────────
  app.get("/api/games/decks/:game", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const game = req.params.game as GameName;
      if (!GAME_NAMES.includes(game)) {
        return res.status(400).json({ error: "Unknown game" });
      }
      const lang = (req.query.lang as string) === "af" ? "af" : "en";
      const subjectId = req.query.subject ? parseInt(req.query.subject as string, 10) : null;

      const isSubscriber = await storage.hasActiveSubscription(userId);
      const playsToday = await countGamesToday(userId);
      const locked = !isSubscriber && playsToday >= DAILY_FREE_LIMIT;
      const gate = {
        isSubscriber,
        playsToday,
        dailyLimit: isSubscriber ? null : DAILY_FREE_LIMIT,
        locked,
        viewOnly: !isSubscriber,
      };

      // Free tier already used its daily game — block a fresh start.
      if (locked) {
        return res.status(403).json({
          error: "daily_limit",
          message: "Free plan includes one game a day. Subscribe for unlimited plays.",
          gate,
        });
      }

      // Resolve subject (needed for rapid_fire and high-yield memory match).
      let subjectRow: { id: number; name: string } | null = null;
      if (subjectId != null && !Number.isNaN(subjectId)) {
        const [row] = await db
          .select({ id: subjects.id, name: subjects.name })
          .from(subjects)
          .where(eq(subjects.id, subjectId));
        if (!row) return res.status(404).json({ error: "Subject not found" });
        subjectRow = row;
      }

      if (game === "rapid_fire") {
        if (!subjectRow) {
          return res.status(400).json({ error: "subject is required for Rapid Fire" });
        }
        const questions = await buildRapidFireDeck({
          subjectName: subjectRow.name,
          lang,
          limit: RAPID_FIRE_COUNT,
        });
        if (questions.length === 0) {
          return res.json({
            game,
            subject: subjectRow,
            comingSoon: true,
            questions: [],
            gate,
          });
        }
        return res.json({ game, subject: subjectRow, questions, gate });
      }

      // memory_match
      const requestedDeck = (req.query.deck as string) || (subjectRow ? "high-yield" : "command-words");
      let deckType = requestedDeck === "high-yield" ? "high-yield" : "command-words";
      let pairs = deckType === "high-yield" && subjectRow
        ? await buildHighYieldDeck({ subjectName: subjectRow.name, count: MEMORY_PAIRS })
        : buildCommandWordsDeck(MEMORY_PAIRS);

      // High-Yield has no verified frequency data for this subject → fall back
      // to the universal, always-verified Command Words deck so the learner
      // always gets a playable, hallucination-safe session.
      let fellBack = false;
      if (deckType === "high-yield" && pairs.length === 0) {
        deckType = "command-words";
        pairs = buildCommandWordsDeck(MEMORY_PAIRS);
        fellBack = true;
      }

      return res.json({
        game,
        deckType,
        ...(fellBack ? { fellBackFromHighYield: true } : {}),
        subject: subjectRow,
        pairs,
        cards: pairsToCards(pairs),
        gate,
      });
    } catch (err: any) {
      console.error("Error building game deck:", err);
      res.status(500).json({ error: "Failed to load game" });
    }
  });

  // ── POST /api/games/score ────────────────────────────────────────────────
  const scoreSchema = z.object({
    game: z.enum(GAME_NAMES),
    subjectId: z.number().int().positive().nullable().optional(),
    score: z.number().int().min(0).max(100000),
    correct: z.number().int().min(0).max(1000),
    total: z.number().int().min(0).max(1000),
    durationMs: z.number().int().min(0).max(3 * 60 * 60 * 1000), // ≤ 3h sanity cap
  });

  app.post("/api/games/score", isAuthenticated, gameScoreLimiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = scoreSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid score payload", details: parsed.error.flatten() });
      }
      const { game, score, correct, total, durationMs } = parsed.data;
      const subjectId = parsed.data.subjectId ?? null;
      if (correct > total) {
        return res.status(400).json({ error: "correct cannot exceed total" });
      }

      const isSubscriber = await storage.hasActiveSubscription(userId);
      const playsToday = await countGamesToday(userId);

      // Free tier past its daily allowance: do NOT record. Return their own
      // existing best so the client can still show personal stats + upsell.
      if (!isSubscriber && playsToday >= DAILY_FREE_LIMIT) {
        const standing = await personalStats({ userId, game, subjectId });
        return res.status(403).json({
          error: "daily_limit",
          recorded: false,
          message: "Free plan includes one game a day. Subscribe for unlimited plays.",
          best: standing.best,
          plays: standing.plays,
        });
      }

      // Denormalise the player's current school for fast leaderboard aggregation.
      const [u] = await db
        .select({ schoolId: users.schoolId })
        .from(users)
        .where(eq(users.id, userId));
      const schoolId = u?.schoolId ?? null;

      await db.insert(gameScores).values({
        userId,
        game,
        subjectId,
        score,
        correct,
        total,
        durationMs,
        schoolId,
      });

      // Rewards integration (best-effort, never blocks recording). Modest so it
      // does not unbalance the coin economy — mirrors the boost-quiz cadence at
      // a lower rate. See report note for owner review.
      try {
        if (correct > 0) {
          await storage.awardXP(userId, correct * 2, `game_${game}`);
          await storage.awardCoins(userId, correct, "game", `Arcade ${game}: ${correct}/${total}`, subjectId?.toString());
        }
      } catch (e) {
        console.error("Non-fatal: game reward award failed:", e);
      }

      const standing = await personalStats({ userId, game, subjectId });
      const isNewBest = standing.best != null && score >= standing.best;
      return res.json({
        recorded: true,
        best: standing.best,
        plays: standing.plays,
        newPersonalBest: isNewBest,
      });
    } catch (err: any) {
      console.error("Error recording game score:", err);
      res.status(500).json({ error: "Failed to record score" });
    }
  });

  // ── GET /api/games/leaderboard?game=&subject=&period= ────────────────────
  // LEARNER-ONLY (founder decision 2026-08): ranked leaderboards are removed —
  // a learner only ever competes with themself ("you vs you"). The URL is kept
  // for compatibility but returns ONLY the caller's own arcade stats: no other
  // learners' names/ranks, no school-vs-school boards.
  app.get("/api/games/leaderboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const game = req.query.game as GameName;
      if (!GAME_NAMES.includes(game)) {
        return res.status(400).json({ error: "Unknown or missing game" });
      }
      const subjectIdRaw = req.query.subject ? parseInt(req.query.subject as string, 10) : null;
      const subjectId = subjectIdRaw != null && !Number.isNaN(subjectIdRaw) ? subjectIdRaw : null;
      const period = req.query.period === "week" ? "week" : "all";
      const since = period === "week" ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null;

      const me = await personalStats({ userId, game, subjectId, since });
      return res.json({
        learnerOnly: true,
        game,
        period,
        subjectId,
        me: { best: me.best, plays: me.plays },
      });
    } catch (err: any) {
      console.error("Error loading personal game stats:", err);
      res.status(500).json({ error: "Failed to load stats" });
    }
  });
}
