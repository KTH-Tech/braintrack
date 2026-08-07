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

/** A learner's personal best + rank for a game/subject in a scope/period. */
async function bestAndRank(opts: {
  userId: string;
  game: GameName;
  subjectId: number | null;
  schoolId?: number | null;
  since?: Date | null;
}): Promise<{ best: number | null; rank: number | null; totalPlayers: number }> {
  const { userId, game, subjectId, schoolId, since } = opts;
  const subjectClause =
    subjectId == null ? sql`AND subject_id IS NULL` : sql`AND subject_id = ${subjectId}`;
  const schoolClause = schoolId == null ? sql`` : sql`AND school_id = ${schoolId}`;
  const sinceClause = since == null ? sql`` : sql`AND created_at >= ${since.toISOString()}`;

  const r = await db.execute<{ user_id: string; best_score: number; rank: number }>(sql`
    WITH best AS (
      SELECT user_id, MAX(score) AS best_score
        FROM game_scores
       WHERE game = ${game}
         ${subjectClause}
         ${schoolClause}
         ${sinceClause}
       GROUP BY user_id
    )
    SELECT user_id, best_score,
           RANK() OVER (ORDER BY best_score DESC) AS rank
      FROM best
  `);
  const rows = r.rows ?? [];
  const totalPlayers = rows.length;
  const mine = rows.find((x) => x.user_id === userId);
  return {
    best: mine ? Number(mine.best_score) : null,
    rank: mine ? Number(mine.rank) : null,
    totalPlayers,
  };
}

/** Privacy-safe display name: first name + last initial (POPIA minimisation). */
function displayName(firstName: string | null, lastName: string | null): string {
  const f = (firstName || "").trim();
  const l = (lastName || "").trim();
  if (!f && !l) return "Learner";
  return l ? `${f} ${l.charAt(0).toUpperCase()}.` : f;
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

      // Free tier past its daily allowance: do NOT record. Return their existing
      // best/rank so the client can still show a view-only board + upsell.
      if (!isSubscriber && playsToday >= DAILY_FREE_LIMIT) {
        const standing = await bestAndRank({ userId, game, subjectId });
        return res.status(403).json({
          error: "daily_limit",
          recorded: false,
          viewOnly: true,
          message: "Free plan includes one game a day. Subscribe for unlimited plays.",
          best: standing.best,
          rank: standing.rank,
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

      const standing = await bestAndRank({ userId, game, subjectId });
      return res.json({
        recorded: true,
        viewOnly: !isSubscriber,
        best: standing.best,
        rank: standing.rank,
        totalPlayers: standing.totalPlayers,
      });
    } catch (err: any) {
      console.error("Error recording game score:", err);
      res.status(500).json({ error: "Failed to record score" });
    }
  });

  // ── GET /api/games/leaderboard?game=&subject=&scope=&period= ─────────────
  app.get("/api/games/leaderboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const game = req.query.game as GameName;
      if (!GAME_NAMES.includes(game)) {
        return res.status(400).json({ error: "Unknown or missing game" });
      }
      const subjectId = req.query.subject ? parseInt(req.query.subject as string, 10) : null;
      const scope = ["school", "global", "schools"].includes(req.query.scope as string)
        ? (req.query.scope as "school" | "global" | "schools")
        : "global";
      const period = req.query.period === "week" ? "week" : "all";
      const since = period === "week" ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null;

      const isSubscriber = await storage.hasActiveSubscription(userId);

      const subjectClause =
        subjectId == null || Number.isNaN(subjectId)
          ? sql``
          : sql`AND gs.subject_id = ${subjectId}`;
      const sinceClause = since == null ? sql`` : sql`AND gs.created_at >= ${since.toISOString()}`;

      // Requesting user's school (for scope=school and to flag their own row).
      const [me] = await db
        .select({ schoolId: users.schoolId })
        .from(users)
        .where(eq(users.id, userId));
      const mySchoolId = me?.schoolId ?? null;

      // ── School-vs-school aggregate (the "63 schools competing" board) ──────
      if (scope === "schools") {
        const r = await db.execute<{
          school_id: number;
          school_name: string | null;
          total_score: number;
          avg_score: number;
          plays: number;
          players: number;
        }>(sql`
          SELECT gs.school_id,
                 ps.school_name,
                 SUM(gs.score)::int         AS total_score,
                 ROUND(AVG(gs.score))::int  AS avg_score,
                 COUNT(*)::int              AS plays,
                 COUNT(DISTINCT gs.user_id)::int AS players
            FROM game_scores gs
            LEFT JOIN partner_schools ps ON ps.id = gs.school_id
           WHERE gs.game = ${game}
             AND gs.school_id IS NOT NULL
             ${subjectClause}
             ${sinceClause}
           GROUP BY gs.school_id, ps.school_name
           ORDER BY avg_score DESC, total_score DESC
           LIMIT ${LEADERBOARD_TOP}
        `);
        const rows = (r.rows ?? []).map((x, i) => ({
          rank: i + 1,
          schoolId: x.school_id,
          schoolName: x.school_name || `School #${x.school_id}`,
          totalScore: Number(x.total_score),
          avgScore: Number(x.avg_score),
          plays: Number(x.plays),
          players: Number(x.players),
          isMySchool: mySchoolId != null && x.school_id === mySchoolId,
        }));
        return res.json({ scope, game, period, subjectId, viewOnly: !isSubscriber, rows });
      }

      // ── Per-learner board (global or within the user's school) ─────────────
      if (scope === "school" && mySchoolId == null) {
        return res.json({
          scope,
          game,
          period,
          subjectId,
          viewOnly: !isSubscriber,
          rows: [],
          note: "No school linked to this account.",
        });
      }
      const schoolClause =
        scope === "school" ? sql`AND gs.school_id = ${mySchoolId}` : sql``;

      const r = await db.execute<{
        user_id: string;
        first_name: string | null;
        last_name: string | null;
        best_score: number;
        plays: number;
        rank: number;
      }>(sql`
        WITH best AS (
          SELECT gs.user_id,
                 MAX(gs.score) AS best_score,
                 COUNT(*)      AS plays
            FROM game_scores gs
           WHERE gs.game = ${game}
             ${subjectClause}
             ${schoolClause}
             ${sinceClause}
           GROUP BY gs.user_id
        )
        SELECT b.user_id, u.first_name, u.last_name, b.best_score, b.plays,
               RANK() OVER (ORDER BY b.best_score DESC) AS rank
          FROM best b
          LEFT JOIN users u ON u.id = b.user_id
         ORDER BY b.best_score DESC
         LIMIT ${LEADERBOARD_TOP}
      `);

      const allRows = r.rows ?? [];
      const rows = allRows.map((x) => ({
        rank: Number(x.rank),
        userId: x.user_id === userId ? x.user_id : undefined, // only expose own id
        name: displayName(x.first_name, x.last_name),
        best: Number(x.best_score),
        plays: Number(x.plays),
        isMe: x.user_id === userId,
      }));

      // The requester's own standing, even if outside the top N.
      const mine = await bestAndRank({
        userId,
        game,
        subjectId,
        schoolId: scope === "school" ? mySchoolId : null,
        since,
      });

      return res.json({
        scope,
        game,
        period,
        subjectId,
        viewOnly: !isSubscriber,
        me: { best: mine.best, rank: mine.rank, totalPlayers: mine.totalPlayers },
        rows,
      });
    } catch (err: any) {
      console.error("Error building leaderboard:", err);
      res.status(500).json({ error: "Failed to load leaderboard" });
    }
  });
}
