-- ============================================================================
-- ClashOfPens — Versioned SQL Migration 0001: Core Cloud Save & Match Schema
-- Target Database: Neon Serverless PostgreSQL
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1. Authenticated Users (linked via verified Google OIDC subject identifier)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  google_sub TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) BETWEEN 1 AND 64),
  avatar_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users (google_sub);

-- 2. Player Cloud Saves (1:1 per user, with optimistic concurrency revision control)
CREATE TABLE IF NOT EXISTS player_saves (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  save_version INTEGER NOT NULL DEFAULT 3 CHECK (save_version >= 1),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  coins INTEGER NOT NULL DEFAULT 250 CHECK (coins >= 0),
  unlocked_pens JSONB NOT NULL DEFAULT '["matador_pinpoint", "matador_alltime"]'::jsonb
    CHECK (jsonb_typeof(unlocked_pens) = 'array'),
  equipped_pen_id TEXT NOT NULL DEFAULT 'matador_pinpoint'
    CHECK (char_length(trim(equipped_pen_id)) BETWEEN 1 AND 64),
  settings JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(settings) = 'object'),
  challenge_progress JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(challenge_progress) = 'object'),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Completed Match History (only completed matches; deduplicated via idempotency_key)
CREATE TABLE IF NOT EXISTS match_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL CHECK (char_length(trim(idempotency_key)) BETWEEN 6 AND 128),
  match_mode TEXT NOT NULL CHECK (match_mode IN ('quick', 'practice', 'pass_and_play', 'ai_battle', 'challenge', 'championship')),
  result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
  opponent_type TEXT NOT NULL CHECK (opponent_type IN ('bot', 'human')),
  opponent_name TEXT NOT NULL CHECK (char_length(trim(opponent_name)) BETWEEN 1 AND 64),
  shots_taken INTEGER NOT NULL DEFAULT 0 CHECK (shots_taken >= 0 AND shots_taken <= 1000),
  knockouts INTEGER NOT NULL DEFAULT 0 CHECK (knockouts >= 0 AND knockouts <= 20),
  duration_seconds INTEGER NULL CHECK (duration_seconds IS NULL OR (duration_seconds >= 0 AND duration_seconds <= 86400)),
  coins_awarded INTEGER NOT NULL DEFAULT 0 CHECK (coins_awarded >= 0 AND coins_awarded <= 5000),
  xp_awarded INTEGER NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0 AND xp_awarded <= 5000),
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_match_history_user_idempotency UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_match_history_user_played_at
  ON match_history (user_id, played_at DESC);

-- 4. Player Achievements (earned achievements with unlock timestamps)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL CHECK (char_length(trim(achievement_key)) BETWEEN 1 AND 64),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_achievements_user_key UNIQUE (user_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements (user_id);

INSERT INTO schema_migrations (version)
VALUES ('0001_initial_schema')
ON CONFLICT (version) DO NOTHING;

COMMIT;
