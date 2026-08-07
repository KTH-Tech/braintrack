-- Migration 0039_game_scores
--
-- Learning-games arcade (Rapid Fire, Memory Match) score ledger. ADDITIVE ONLY:
-- one new table + its indexes, every statement guarded with IF NOT EXISTS, so
-- this is safe to run more than once and safe to auto-apply from
-- script/predeploy-migrate.ts. Touches no existing table.
--
-- Column notes:
--   user_id   VARCHAR REFERENCES users(id) — the player. FK enforced here at
--             the DB layer (the ORM keeps it as a plain varchar to match every
--             other user_id column in the schema).
--   game      TEXT — 'rapid_fire' | 'memory_match', pinned by a CHECK.
--   subject_id INTEGER REFERENCES subjects(id) — NULL for subject-agnostic
--             decks (Memory Match "Command Words").
--   school_id INTEGER — DENORMALISED snapshot of the player's users.school_id at
--             write time (NOT a live FK) so leaderboards aggregate without a
--             join and stay correct if the learner later changes school.

CREATE TABLE IF NOT EXISTS game_scores (
  id           SERIAL PRIMARY KEY,
  user_id      VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game         TEXT    NOT NULL CHECK (game IN ('rapid_fire', 'memory_match')),
  subject_id   INTEGER REFERENCES subjects(id),
  score        INTEGER NOT NULL DEFAULT 0,
  correct      INTEGER NOT NULL DEFAULT 0,
  total        INTEGER NOT NULL DEFAULT 0,
  duration_ms  INTEGER NOT NULL DEFAULT 0,
  school_id    INTEGER,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Leaderboard read path: filter by (game, subject) and order/bound by time.
CREATE INDEX IF NOT EXISTS game_scores_game_subject_created_idx
  ON game_scores (game, subject_id, created_at);

-- School and school-vs-school aggregation.
CREATE INDEX IF NOT EXISTS game_scores_school_idx
  ON game_scores (school_id);

-- Free-tier daily-cap count: "rows for this user since SA midnight".
CREATE INDEX IF NOT EXISTS game_scores_user_created_idx
  ON game_scores (user_id, created_at);
