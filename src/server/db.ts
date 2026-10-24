import pg from 'pg';
import crypto from 'node:crypto';
import { GameSettings } from '../types/game';
import { DEFAULT_SETTINGS } from '../game/constants';
import { calculateLevel } from '../game/storage';

const { Pool } = pg;

export interface CloudUserRecord {
  id: string;
  googleSub: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CloudSaveRecord {
  userId: string;
  saveVersion: number;
  xp: number;
  level: number;
  coins: number;
  unlockedPens: string[];
  equippedPenId: string;
  settings: GameSettings;
  challengeProgress: {
    completedChallenges: string[];
    championshipTrophies: number;
    matchesPlayed: number;
    matchesWon: number;
    knockoutsCount: number;
    trickShotsCount: number;
    equippedArena: string;
    selectedTableId?: string;
    lastDailyDate: string;
    dailyStreak: number;
  };
  achievements: Array<{ key: string; unlockedAt: string }>;
  revision: number;
  updatedAt: string;
}

export interface CloudMatchRecord {
  id: string;
  userId: string;
  idempotencyKey: string;
  matchMode: string;
  result: 'win' | 'loss' | 'draw';
  opponentType: 'bot' | 'human';
  opponentName: string;
  shotsTaken: number;
  knockouts: number;
  durationSeconds: number | null;
  coinsAwarded: number;
  xpAwarded: number;
  playedAt: string;
}

export interface UpsertSaveInput {
  userId: string;
  saveVersion: number;
  xp: number;
  level: number;
  coins: number;
  unlockedPens: string[];
  equippedPenId: string;
  settings: GameSettings;
  challengeProgress: CloudSaveRecord['challengeProgress'];
  achievements?: string[];
  expectedRevision?: number;
  forceOverwrite?: boolean;
}

export interface RecordMatchInput {
  userId: string;
  idempotencyKey: string;
  matchMode: string;
  result: 'win' | 'loss' | 'draw';
  opponentType: 'bot' | 'human';
  opponentName: string;
  shotsTaken: number;
  knockouts: number;
  durationSeconds: number | null;
  coinsAwarded: number;
  xpAwarded: number;
  unlockedAchievements?: string[];
}

export interface CloudStorageRepository {
  upsertGoogleUser(profile: {
    googleSub: string;
    displayName: string;
    avatarUrl: string | null;
  }): Promise<CloudUserRecord>;
  getUserById(userId: string): Promise<CloudUserRecord | null>;
  getSaveByUserId(userId: string): Promise<CloudSaveRecord | null>;
  upsertSave(
    input: UpsertSaveInput
  ): Promise<
    | { status: 'ok'; save: CloudSaveRecord }
    | { status: 'conflict'; serverSave: CloudSaveRecord }
  >;
  getMatchHistory(userId: string, limit?: number): Promise<CloudMatchRecord[]>;
  recordCompletedMatch(input: RecordMatchInput): Promise<{
    match: CloudMatchRecord;
    save: CloudSaveRecord;
    wasDuplicate: boolean;
  }>;
  deleteUserAccount(userId: string): Promise<boolean>;
}

let poolInstance: pg.Pool | null = null;
let testRepositoryOverride: CloudStorageRepository | null = null;

export function isDatabaseConfigured(): boolean {
  if (testRepositoryOverride) return true;
  const url = process.env.DATABASE_URL;
  return Boolean(url && url.trim().length > 0 && !url.includes('YOUR_PASSWORD'));
}

export function setTestCloudRepository(repo: CloudStorageRepository | null): void {
  testRepositoryOverride = repo;
}

function getPool(): pg.Pool {
  if (!poolInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not configured.');
    }
    poolInstance = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 8000,
      ssl: connectionString.includes('localhost')
        ? undefined
        : { rejectUnauthorized: false },
    });
  }
  return poolInstance;
}

function createInitialCloudSave(userId: string): CloudSaveRecord {
  return {
    userId,
    saveVersion: 3,
    xp: 0,
    level: 1,
    coins: 250,
    unlockedPens: ['matador_pinpoint', 'matador_alltime'],
    equippedPenId: 'matador_pinpoint',
    settings: { ...DEFAULT_SETTINGS },
    challengeProgress: {
      completedChallenges: [],
      championshipTrophies: 0,
      matchesPlayed: 0,
      matchesWon: 0,
      knockoutsCount: 0,
      trickShotsCount: 0,
      equippedArena: 'classic',
      selectedTableId: 'school_bench',
      lastDailyDate: '',
      dailyStreak: 0,
    },
    achievements: [],
    revision: 1,
    updatedAt: new Date().toISOString(),
  };
}

class PostgresCloudRepository implements CloudStorageRepository {
  async upsertGoogleUser(profile: {
    googleSub: string;
    displayName: string;
    avatarUrl: string | null;
  }): Promise<CloudUserRecord> {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const newId = crypto.randomUUID();
      const userRes = await client.query(
        `INSERT INTO users (id, google_sub, display_name, avatar_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (google_sub)
         DO UPDATE SET
           display_name = EXCLUDED.display_name,
           avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
           updated_at = NOW()
         RETURNING id, google_sub, display_name, avatar_url, created_at, updated_at`,
        [newId, profile.googleSub, profile.displayName, profile.avatarUrl]
      );
      const row = userRes.rows[0];

      // Ensure an initial player_saves row exists for this user
      const initial = createInitialCloudSave(row.id);
      await client.query(
        `INSERT INTO player_saves (
           user_id, save_version, xp, level, coins, unlocked_pens, equipped_pen_id,
           settings, challenge_progress, revision, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, $9::jsonb, 1, NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        [
          row.id,
          initial.saveVersion,
          initial.xp,
          initial.level,
          initial.coins,
          JSON.stringify(initial.unlockedPens),
          initial.equippedPenId,
          JSON.stringify(initial.settings),
          JSON.stringify(initial.challengeProgress),
        ]
      );

      await client.query('COMMIT');
      return {
        id: row.id,
        googleSub: row.google_sub,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getUserById(userId: string): Promise<CloudUserRecord | null> {
    const pool = getPool();
    const res = await pool.query(
      `SELECT id, google_sub, display_name, avatar_url, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [userId]
    );
    if (res.rowCount === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      googleSub: row.google_sub,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  async getSaveByUserId(userId: string): Promise<CloudSaveRecord | null> {
    const pool = getPool();
    const saveRes = await pool.query(
      `SELECT user_id, save_version, xp, level, coins, unlocked_pens, equipped_pen_id,
              settings, challenge_progress, revision, updated_at
       FROM player_saves
       WHERE user_id = $1`,
      [userId]
    );
    if (saveRes.rowCount === 0) return null;
    const row = saveRes.rows[0];

    const achRes = await pool.query(
      `SELECT achievement_key, unlocked_at
       FROM achievements
       WHERE user_id = $1
       ORDER BY unlocked_at ASC`,
      [userId]
    );

    const defaults = createInitialCloudSave(userId);
    return {
      userId: row.user_id,
      saveVersion: Number(row.save_version) || 3,
      xp: Number(row.xp) || 0,
      level: Number(row.level) || 1,
      coins: Number(row.coins) || 0,
      unlockedPens: Array.isArray(row.unlocked_pens)
        ? row.unlocked_pens
        : defaults.unlockedPens,
      equippedPenId: row.equipped_pen_id || 'matador_pinpoint',
      settings: { ...DEFAULT_SETTINGS, ...(row.settings || {}) },
      challengeProgress: {
        ...defaults.challengeProgress,
        ...(row.challenge_progress || {}),
      },
      achievements: achRes.rows.map((a) => ({
        key: a.achievement_key,
        unlockedAt: new Date(a.unlocked_at).toISOString(),
      })),
      revision: Number(row.revision) || 1,
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  async upsertSave(
    input: UpsertSaveInput
  ): Promise<
    | { status: 'ok'; save: CloudSaveRecord }
    | { status: 'conflict'; serverSave: CloudSaveRecord }
  > {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existingRes = await client.query(
        `SELECT revision FROM player_saves WHERE user_id = $1 FOR UPDATE`,
        [input.userId]
      );

      if (existingRes.rowCount && existingRes.rowCount > 0) {
        const currentRev = Number(existingRes.rows[0].revision) || 1;
        if (
          !input.forceOverwrite &&
          input.expectedRevision !== undefined &&
          input.expectedRevision < currentRev
        ) {
          await client.query('ROLLBACK');
          const serverSave = await this.getSaveByUserId(input.userId);
          return {
            status: 'conflict',
            serverSave: serverSave || createInitialCloudSave(input.userId),
          };
        }

        const nextRevision = currentRev + 1;
        await client.query(
          `UPDATE player_saves
           SET save_version = $2,
               xp = $3,
               level = $4,
               coins = $5,
               unlocked_pens = $6::jsonb,
               equipped_pen_id = $7,
               settings = $8::jsonb,
               challenge_progress = $9::jsonb,
               revision = $10,
               updated_at = NOW()
           WHERE user_id = $1`,
          [
            input.userId,
            input.saveVersion,
            input.xp,
            input.level,
            input.coins,
            JSON.stringify(input.unlockedPens),
            input.equippedPenId,
            JSON.stringify(input.settings),
            JSON.stringify(input.challengeProgress),
            nextRevision,
          ]
        );
      } else {
        await client.query(
          `INSERT INTO player_saves (
             user_id, save_version, xp, level, coins, unlocked_pens, equipped_pen_id,
             settings, challenge_progress, revision, updated_at
           )
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, $9::jsonb, 1, NOW())`,
          [
            input.userId,
            input.saveVersion,
            input.xp,
            input.level,
            input.coins,
            JSON.stringify(input.unlockedPens),
            input.equippedPenId,
            JSON.stringify(input.settings),
            JSON.stringify(input.challengeProgress),
          ]
        );
      }

      if (input.achievements && input.achievements.length > 0) {
        for (const achKey of input.achievements) {
          await client.query(
            `INSERT INTO achievements (id, user_id, achievement_key, unlocked_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (user_id, achievement_key) DO NOTHING`,
            [crypto.randomUUID(), input.userId, achKey]
          );
        }
      }

      await client.query('COMMIT');
      const updated = await this.getSaveByUserId(input.userId);
      return {
        status: 'ok',
        save: updated || createInitialCloudSave(input.userId),
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getMatchHistory(userId: string, limit = 25): Promise<CloudMatchRecord[]> {
    const pool = getPool();
    const safeLimit = Math.max(1, Math.min(100, limit));
    const res = await pool.query(
      `SELECT id, user_id, idempotency_key, match_mode, result, opponent_type,
              opponent_name, shots_taken, knockouts, duration_seconds,
              coins_awarded, xp_awarded, played_at
       FROM match_history
       WHERE user_id = $1
       ORDER BY played_at DESC
       LIMIT $2`,
      [userId, safeLimit]
    );

    return res.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      idempotencyKey: r.idempotency_key,
      matchMode: r.match_mode,
      result: r.result,
      opponentType: r.opponent_type,
      opponentName: r.opponent_name,
      shotsTaken: Number(r.shots_taken) || 0,
      knockouts: Number(r.knockouts) || 0,
      durationSeconds: r.duration_seconds !== null ? Number(r.duration_seconds) : null,
      coinsAwarded: Number(r.coins_awarded) || 0,
      xpAwarded: Number(r.xp_awarded) || 0,
      playedAt: new Date(r.played_at).toISOString(),
    }));
  }

  async recordCompletedMatch(input: RecordMatchInput): Promise<{
    match: CloudMatchRecord;
    save: CloudSaveRecord;
    wasDuplicate: boolean;
  }> {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check idempotency key first inside transaction
      const dupRes = await client.query(
        `SELECT id, user_id, idempotency_key, match_mode, result, opponent_type,
                opponent_name, shots_taken, knockouts, duration_seconds,
                coins_awarded, xp_awarded, played_at
         FROM match_history
         WHERE user_id = $1 AND idempotency_key = $2`,
        [input.userId, input.idempotencyKey]
      );

      if (dupRes.rowCount && dupRes.rowCount > 0) {
        await client.query('COMMIT');
        const r = dupRes.rows[0];
        const existingSave =
          (await this.getSaveByUserId(input.userId)) || createInitialCloudSave(input.userId);
        return {
          match: {
            id: r.id,
            userId: r.user_id,
            idempotencyKey: r.idempotency_key,
            matchMode: r.match_mode,
            result: r.result,
            opponentType: r.opponent_type,
            opponentName: r.opponent_name,
            shotsTaken: Number(r.shots_taken) || 0,
            knockouts: Number(r.knockouts) || 0,
            durationSeconds: r.duration_seconds !== null ? Number(r.duration_seconds) : null,
            coinsAwarded: Number(r.coins_awarded) || 0,
            xpAwarded: Number(r.xp_awarded) || 0,
            playedAt: new Date(r.played_at).toISOString(),
          },
          save: existingSave,
          wasDuplicate: true,
        };
      }

      const matchId = crypto.randomUUID();
      const insertRes = await client.query(
        `INSERT INTO match_history (
           id, user_id, idempotency_key, match_mode, result, opponent_type,
           opponent_name, shots_taken, knockouts, duration_seconds,
           coins_awarded, xp_awarded, played_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         RETURNING id, user_id, idempotency_key, match_mode, result, opponent_type,
                   opponent_name, shots_taken, knockouts, duration_seconds,
                   coins_awarded, xp_awarded, played_at`,
        [
          matchId,
          input.userId,
          input.idempotencyKey,
          input.matchMode,
          input.result,
          input.opponentType,
          input.opponentName,
          input.shotsTaken,
          input.knockouts,
          input.durationSeconds,
          input.coinsAwarded,
          input.xpAwarded,
        ]
      );

      // Update player_saves atomically in the same transaction
      const saveRowRes = await client.query(
        `SELECT xp, coins, challenge_progress, revision
         FROM player_saves
         WHERE user_id = $1
         FOR UPDATE`,
        [input.userId]
      );

      if (saveRowRes.rowCount && saveRowRes.rowCount > 0) {
        const sRow = saveRowRes.rows[0];
        const nextXp = Math.max(0, (Number(sRow.xp) || 0) + input.xpAwarded);
        const nextCoins = Math.max(0, (Number(sRow.coins) || 0) + input.coinsAwarded);
        const nextLevel = calculateLevel(nextXp);
        const cp = {
          ...createInitialCloudSave(input.userId).challengeProgress,
          ...(sRow.challenge_progress || {}),
        };
        cp.matchesPlayed = (cp.matchesPlayed || 0) + 1;
        if (input.result === 'win') {
          cp.matchesWon = (cp.matchesWon || 0) + 1;
        }
        cp.knockoutsCount = (cp.knockoutsCount || 0) + input.knockouts;

        await client.query(
          `UPDATE player_saves
           SET xp = $2,
               level = $3,
               coins = $4,
               challenge_progress = $5::jsonb,
               revision = revision + 1,
               updated_at = NOW()
           WHERE user_id = $1`,
          [input.userId, nextXp, nextLevel, nextCoins, JSON.stringify(cp)]
        );
      }

      if (input.unlockedAchievements && input.unlockedAchievements.length > 0) {
        for (const key of input.unlockedAchievements) {
          await client.query(
            `INSERT INTO achievements (id, user_id, achievement_key, unlocked_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (user_id, achievement_key) DO NOTHING`,
            [crypto.randomUUID(), input.userId, key]
          );
        }
      }

      await client.query('COMMIT');
      const r = insertRes.rows[0];
      const updatedSave =
        (await this.getSaveByUserId(input.userId)) || createInitialCloudSave(input.userId);

      return {
        match: {
          id: r.id,
          userId: r.user_id,
          idempotencyKey: r.idempotency_key,
          matchMode: r.match_mode,
          result: r.result,
          opponentType: r.opponent_type,
          opponentName: r.opponent_name,
          shotsTaken: Number(r.shots_taken) || 0,
          knockouts: Number(r.knockouts) || 0,
          durationSeconds: r.duration_seconds !== null ? Number(r.duration_seconds) : null,
          coinsAwarded: Number(r.coins_awarded) || 0,
          xpAwarded: Number(r.xp_awarded) || 0,
          playedAt: new Date(r.played_at).toISOString(),
        },
        save: updatedSave,
        wasDuplicate: false,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async deleteUserAccount(userId: string): Promise<boolean> {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM achievements WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM match_history WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM player_saves WHERE user_id = $1', [userId]);
      const res = await client.query('DELETE FROM users WHERE id = $1', [userId]);
      await client.query('COMMIT');
      return (res.rowCount || 0) > 0;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

/**
 * In-memory transactional repository for automated tests when an external Neon database is not attached.
 */
export class InMemoryCloudRepository implements CloudStorageRepository {
  private users = new Map<string, CloudUserRecord>();
  private usersBySub = new Map<string, string>();
  private saves = new Map<string, CloudSaveRecord>();
  private matches = new Map<string, CloudMatchRecord[]>();

  async upsertGoogleUser(profile: {
    googleSub: string;
    displayName: string;
    avatarUrl: string | null;
  }): Promise<CloudUserRecord> {
    const now = new Date().toISOString();
    const existingId = this.usersBySub.get(profile.googleSub);
    if (existingId && this.users.has(existingId)) {
      const prev = this.users.get(existingId)!;
      const updated: CloudUserRecord = {
        ...prev,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl ?? prev.avatarUrl,
        updatedAt: now,
      };
      this.users.set(existingId, updated);
      return updated;
    }

    const id = crypto.randomUUID();
    const record: CloudUserRecord = {
      id,
      googleSub: profile.googleSub,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, record);
    this.usersBySub.set(profile.googleSub, id);
    this.saves.set(id, createInitialCloudSave(id));
    this.matches.set(id, []);
    return record;
  }

  async getUserById(userId: string): Promise<CloudUserRecord | null> {
    return this.users.get(userId) || null;
  }

  async getSaveByUserId(userId: string): Promise<CloudSaveRecord | null> {
    const s = this.saves.get(userId);
    return s ? JSON.parse(JSON.stringify(s)) : null;
  }

  async upsertSave(
    input: UpsertSaveInput
  ): Promise<
    | { status: 'ok'; save: CloudSaveRecord }
    | { status: 'conflict'; serverSave: CloudSaveRecord }
  > {
    const existing = this.saves.get(input.userId);
    if (existing) {
      if (
        !input.forceOverwrite &&
        input.expectedRevision !== undefined &&
        input.expectedRevision < existing.revision
      ) {
        return {
          status: 'conflict',
          serverSave: JSON.parse(JSON.stringify(existing)),
        };
      }
    }

    const base = existing || createInitialCloudSave(input.userId);
    const achMap = new Map<string, string>(
      base.achievements.map((a) => [a.key, a.unlockedAt])
    );
    if (input.achievements) {
      const now = new Date().toISOString();
      for (const k of input.achievements) {
        if (!achMap.has(k)) achMap.set(k, now);
      }
    }

    const updated: CloudSaveRecord = {
      userId: input.userId,
      saveVersion: input.saveVersion,
      xp: input.xp,
      level: input.level,
      coins: input.coins,
      unlockedPens: [...input.unlockedPens],
      equippedPenId: input.equippedPenId,
      settings: { ...input.settings },
      challengeProgress: { ...input.challengeProgress },
      achievements: Array.from(achMap.entries()).map(([key, unlockedAt]) => ({
        key,
        unlockedAt,
      })),
      revision: existing ? existing.revision + 1 : 1,
      updatedAt: new Date().toISOString(),
    };

    this.saves.set(input.userId, updated);
    return { status: 'ok', save: JSON.parse(JSON.stringify(updated)) };
  }

  async getMatchHistory(userId: string, limit = 25): Promise<CloudMatchRecord[]> {
    const list = this.matches.get(userId) || [];
    return JSON.parse(JSON.stringify(list.slice(0, limit)));
  }

  async recordCompletedMatch(input: RecordMatchInput): Promise<{
    match: CloudMatchRecord;
    save: CloudSaveRecord;
    wasDuplicate: boolean;
  }> {
    const userMatches = this.matches.get(input.userId) || [];
    const existingMatch = userMatches.find(
      (m) => m.idempotencyKey === input.idempotencyKey
    );
    if (existingMatch) {
      const save = this.saves.get(input.userId) || createInitialCloudSave(input.userId);
      return {
        match: JSON.parse(JSON.stringify(existingMatch)),
        save: JSON.parse(JSON.stringify(save)),
        wasDuplicate: true,
      };
    }

    const now = new Date().toISOString();
    const newMatch: CloudMatchRecord = {
      id: crypto.randomUUID(),
      userId: input.userId,
      idempotencyKey: input.idempotencyKey,
      matchMode: input.matchMode,
      result: input.result,
      opponentType: input.opponentType,
      opponentName: input.opponentName,
      shotsTaken: input.shotsTaken,
      knockouts: input.knockouts,
      durationSeconds: input.durationSeconds,
      coinsAwarded: input.coinsAwarded,
      xpAwarded: input.xpAwarded,
      playedAt: now,
    };

    userMatches.unshift(newMatch);
    this.matches.set(input.userId, userMatches);

    const prevSave = this.saves.get(input.userId) || createInitialCloudSave(input.userId);
    const nextXp = Math.max(0, prevSave.xp + input.xpAwarded);
    const nextCoins = Math.max(0, prevSave.coins + input.coinsAwarded);
    const nextLevel = calculateLevel(nextXp);
    const cp = { ...prevSave.challengeProgress };
    cp.matchesPlayed = (cp.matchesPlayed || 0) + 1;
    if (input.result === 'win') cp.matchesWon = (cp.matchesWon || 0) + 1;
    cp.knockoutsCount = (cp.knockoutsCount || 0) + input.knockouts;

    const updatedSave: CloudSaveRecord = {
      ...prevSave,
      xp: nextXp,
      level: nextLevel,
      coins: nextCoins,
      challengeProgress: cp,
      revision: prevSave.revision + 1,
      updatedAt: now,
    };
    this.saves.set(input.userId, updatedSave);

    return {
      match: JSON.parse(JSON.stringify(newMatch)),
      save: JSON.parse(JSON.stringify(updatedSave)),
      wasDuplicate: false,
    };
  }

  async deleteUserAccount(userId: string): Promise<boolean> {
    const u = this.users.get(userId);
    if (!u) return false;
    this.users.delete(userId);
    this.usersBySub.delete(u.googleSub);
    this.saves.delete(userId);
    this.matches.delete(userId);
    return true;
  }
}

const pgRepo = new PostgresCloudRepository();

export function getCloudRepository(): CloudStorageRepository | null {
  if (testRepositoryOverride) return testRepositoryOverride;
  if (!isDatabaseConfigured()) return null;
  return pgRepo;
}
