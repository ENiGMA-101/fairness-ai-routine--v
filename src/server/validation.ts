import { DEFAULT_SETTINGS } from '../game/constants';
import { SKINS_BY_ID, DEFAULT_PEN_ID } from '../game/skins';
import { CHALLENGES_DATA } from '../game/challenges';
import { calculateLevel } from '../game/storage';
import { RecordMatchInput, UpsertSaveInput } from './db';
import { GameSettings } from '../types/game';

const VALID_SKIN_IDS = new Set(Object.keys(SKINS_BY_ID));
const VALID_CHALLENGE_IDS = new Set(CHALLENGES_DATA.map((c) => c.id));
const VALID_MODES = new Set([
  'quick',
  'practice',
  'pass_and_play',
  'ai_battle',
  'challenge',
  'championship',
]);

export function validateSavePayload(
  body: any,
  userId: string
): { valid: true; data: UpsertSaveInput } | { valid: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, error: 'Invalid save payload: expected JSON object.' };
  }

  const xp = Number(body.xp ?? 0);
  const coins = Number(body.coins ?? 0);
  const saveVersion = Number(body.saveVersion ?? body.version ?? 3);

  if (!Number.isFinite(xp) || !Number.isInteger(xp) || xp < 0 || xp > 50_000_000) {
    return { valid: false, error: 'Invalid XP balance: must be a non-negative integer.' };
  }

  if (!Number.isFinite(coins) || !Number.isInteger(coins) || coins < 0 || coins > 50_000_000) {
    return { valid: false, error: 'Invalid coin balance: must be a non-negative integer.' };
  }

  if (!Number.isInteger(saveVersion) || saveVersion < 1 || saveVersion > 20) {
    return { valid: false, error: 'Invalid save_version.' };
  }

  // Validate unlocked_pens JSONB array
  const rawUnlocked = body.unlockedPens ?? body.unlockedSkins;
  if (!Array.isArray(rawUnlocked)) {
    return { valid: false, error: 'unlockedPens must be an array of pen skin IDs.' };
  }

  const unlockedSet = new Set<string>(['matador_pinpoint', 'matador_alltime']);
  for (const item of rawUnlocked) {
    if (typeof item !== 'string') {
      return { valid: false, error: 'unlockedPens must contain only string IDs.' };
    }
    if (VALID_SKIN_IDS.has(item)) {
      unlockedSet.add(item);
    }
  }
  const unlockedPens = Array.from(unlockedSet);

  const rawEquipped = String(body.equippedPenId ?? body.equippedSkin ?? DEFAULT_PEN_ID);
  const equippedPenId = unlockedSet.has(rawEquipped) ? rawEquipped : DEFAULT_PEN_ID;

  // Validate settings JSONB object
  const rawSettings = body.settings ?? {};
  if (typeof rawSettings !== 'object' || Array.isArray(rawSettings) || rawSettings === null) {
    return { valid: false, error: 'settings must be a JSON object.' };
  }

  const settings: GameSettings = {
    fall: rawSettings.fall === 'strict' ? 'strict' : 'center',
    sound: typeof rawSettings.sound === 'boolean' ? rawSettings.sound : DEFAULT_SETTINGS.sound,
    music: typeof rawSettings.music === 'boolean' ? rawSettings.music : DEFAULT_SETTINGS.music,
    vibrate:
      typeof rawSettings.vibrate === 'boolean' ? rawSettings.vibrate : DEFAULT_SETTINGS.vibrate,
    guide: typeof rawSettings.guide === 'boolean' ? rawSettings.guide : DEFAULT_SETTINGS.guide,
    desk:
      typeof rawSettings.desk === 'string' && rawSettings.desk.length <= 40
        ? rawSettings.desk
        : DEFAULT_SETTINGS.desk,
    skill:
      rawSettings.skill === 'easy' || rawSettings.skill === 'sharp'
        ? rawSettings.skill
        : 'normal',
    reducedMotion:
      typeof rawSettings.reducedMotion === 'boolean'
        ? rawSettings.reducedMotion
        : DEFAULT_SETTINGS.reducedMotion,
    dragFlickGesture:
      typeof rawSettings.dragFlickGesture === 'boolean'
        ? rawSettings.dragFlickGesture
        : DEFAULT_SETTINGS.dragFlickGesture,
  };

  // Validate challenge_progress JSONB object
  const rawCp = body.challengeProgress ?? {};
  if (typeof rawCp !== 'object' || Array.isArray(rawCp) || rawCp === null) {
    return { valid: false, error: 'challengeProgress must be a JSON object.' };
  }

  const rawCompletedChallenges = rawCp.completedChallenges ?? body.completedChallenges ?? [];
  if (!Array.isArray(rawCompletedChallenges)) {
    return { valid: false, error: 'completedChallenges must be an array.' };
  }
  const completedChallenges = Array.from(
    new Set(
      rawCompletedChallenges.filter(
        (id: unknown): id is string => typeof id === 'string' && VALID_CHALLENGE_IDS.has(id)
      )
    )
  );

  const nonNegInt = (v: unknown, fallback = 0): number => {
    const n = Number(v ?? fallback);
    return Number.isInteger(n) && n >= 0 && n <= 1_000_000 ? n : fallback;
  };

  const challengeProgress = {
    completedChallenges,
    championshipTrophies: nonNegInt(
      rawCp.championshipTrophies ?? body.championshipTrophies,
      0
    ),
    matchesPlayed: nonNegInt(rawCp.matchesPlayed ?? body.matchesPlayed, 0),
    matchesWon: nonNegInt(rawCp.matchesWon ?? body.matchesWon, 0),
    knockoutsCount: nonNegInt(rawCp.knockoutsCount ?? body.knockoutsCount, 0),
    trickShotsCount: nonNegInt(rawCp.trickShotsCount ?? body.trickShotsCount, 0),
    equippedArena:
      typeof (rawCp.equippedArena ?? body.equippedArena) === 'string'
        ? String(rawCp.equippedArena ?? body.equippedArena).slice(0, 40)
        : 'classic',
    selectedTableId:
      typeof rawCp.selectedTableId === 'string'
        ? rawCp.selectedTableId.slice(0, 40)
        : 'school_bench',
    lastDailyDate:
      typeof (rawCp.lastDailyDate ?? body.lastDailyDate) === 'string'
        ? String(rawCp.lastDailyDate ?? body.lastDailyDate).slice(0, 20)
        : '',
    dailyStreak: nonNegInt(rawCp.dailyStreak ?? body.dailyStreak, 0),
  };

  let expectedRevision: number | undefined;
  if (body.expectedRevision !== undefined && body.expectedRevision !== null) {
    const rev = Number(body.expectedRevision);
    if (!Number.isInteger(rev) || rev < 1) {
      return { valid: false, error: 'expectedRevision must be a positive integer.' };
    }
    expectedRevision = rev;
  }

  const rawAchievements = Array.isArray(body.achievements)
    ? body.achievements
        .filter((a: unknown): a is string => typeof a === 'string' && a.length <= 64)
        .slice(0, 50)
    : undefined;

  return {
    valid: true,
    data: {
      userId,
      saveVersion,
      xp,
      level: calculateLevel(xp),
      coins,
      unlockedPens,
      equippedPenId,
      settings,
      challengeProgress,
      achievements: rawAchievements,
      expectedRevision,
      forceOverwrite: Boolean(body.forceOverwrite),
    },
  };
}

export function validateMatchSubmissionPayload(
  body: any,
  userId: string
): { valid: true; data: RecordMatchInput } | { valid: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, error: 'Invalid match submission payload.' };
  }

  const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : '';
  if (
    idempotencyKey.length < 6 ||
    idempotencyKey.length > 128 ||
    !/^[a-zA-Z0-9_.:-]+$/.test(idempotencyKey)
  ) {
    return {
      valid: false,
      error: 'Valid idempotencyKey (6-128 alphanumeric characters) is required.',
    };
  }

  const matchMode = String(body.matchMode || 'quick');
  if (!VALID_MODES.has(matchMode)) {
    return { valid: false, error: 'Invalid matchMode.' };
  }

  const result = body.result;
  if (result !== 'win' && result !== 'loss' && result !== 'draw') {
    return {
      valid: false,
      error: 'Only completed matches (win, loss, draw) may be recorded.',
    };
  }

  const opponentType = body.opponentType === 'human' ? 'human' : 'bot';
  const opponentName =
    typeof body.opponentName === 'string'
      ? body.opponentName.trim().replace(/[\u0000-\u001F\u007F-\u009F<>]/g, '').slice(0, 48)
      : 'Opponent';
  if (!opponentName) {
    return { valid: false, error: 'opponentName is required.' };
  }

  const shotsTaken = Number(body.shotsTaken ?? 0);
  const knockouts = Number(body.knockouts ?? 0);
  if (
    !Number.isInteger(shotsTaken) ||
    shotsTaken < 0 ||
    shotsTaken > 1000 ||
    !Number.isInteger(knockouts) ||
    knockouts < 0 ||
    knockouts > 20
  ) {
    return { valid: false, error: 'Invalid shotsTaken or knockouts count.' };
  }

  let durationSeconds: number | null = null;
  if (body.durationSeconds !== undefined && body.durationSeconds !== null) {
    const d = Number(body.durationSeconds);
    if (!Number.isInteger(d) || d < 0 || d > 86400) {
      return { valid: false, error: 'Invalid durationSeconds.' };
    }
    durationSeconds = d;
  }

  // Server-authoritative reward bounds check (do not trust arbitrary client coin/XP claims)
  const baseAllowedCoins = result === 'win' ? 80 : 25;
  const baseAllowedXp = result === 'win' ? 120 : 40;
  const modeBonusCoins =
    result === 'win' && (matchMode === 'championship' || matchMode === 'challenge') ? 750 : 0;
  const modeBonusXp =
    result === 'win' && (matchMode === 'championship' || matchMode === 'challenge') ? 800 : 0;

  const maxAllowedCoins = baseAllowedCoins + modeBonusCoins;
  const maxAllowedXp = baseAllowedXp + modeBonusXp;

  const requestedCoins =
    body.coinsAwarded !== undefined ? Number(body.coinsAwarded) : baseAllowedCoins;
  const requestedXp = body.xpAwarded !== undefined ? Number(body.xpAwarded) : baseAllowedXp;

  if (
    !Number.isInteger(requestedCoins) ||
    requestedCoins < 0 ||
    !Number.isInteger(requestedXp) ||
    requestedXp < 0
  ) {
    return { valid: false, error: 'Rewards cannot be negative.' };
  }

  const coinsAwarded = Math.min(requestedCoins, maxAllowedCoins);
  const xpAwarded = Math.min(requestedXp, maxAllowedXp);

  const unlockedAchievements = Array.isArray(body.unlockedAchievements)
    ? body.unlockedAchievements
        .filter((a: unknown): a is string => typeof a === 'string' && a.length <= 64)
        .slice(0, 20)
    : undefined;

  return {
    valid: true,
    data: {
      userId,
      idempotencyKey,
      matchMode,
      result,
      opponentType,
      opponentName,
      shotsTaken,
      knockouts,
      durationSeconds,
      coinsAwarded,
      xpAwarded,
      unlockedAchievements,
    },
  };
}
