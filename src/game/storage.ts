import { GameSettings, PlayerProgress } from '../types/game';
import { DEFAULT_SETTINGS } from './constants';
import { DEFAULT_PEN_ID } from './skins';

const SAVE_KEY = 'penfight.v3.save';
const LEGACY_V2_KEY = 'penfight.v2.save';
const SETTINGS_KEY = 'penfight.v3.settings';
const MATCH_HISTORY_KEY = 'penfight.v3.matches';
const SAVE_META_KEY = 'penfight.v3.meta';

export interface LocalSaveMetadata {
  revision: number;
  updatedAt: string;
  lastSyncedRevision: number | null;
  lastSyncedUserId: string | null;
}

export interface LocalMatchHistoryItem {
  id: string;
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
  syncedToCloud?: boolean;
}

export interface AchievementDef {
  key: string;
  title: string;
  banglaTitle: string;
  desc: string;
  icon: string;
}

export const ACHIEVEMENTS_CATALOG: AchievementDef[] = [
  {
    key: 'first_win',
    title: 'First Desk Victory',
    banglaTitle: 'প্রথম বিজয়',
    desc: 'Win your very first completed pen fight match.',
    icon: '🥇',
  },
  {
    key: 'knockout_10',
    title: 'Edge Enforcer',
    banglaTitle: 'কিনারার রাজা',
    desc: 'Knock 10 opponent pens off the wooden bench.',
    icon: '💥',
  },
  {
    key: 'collector_5',
    title: 'Stationery Connoisseur',
    banglaTitle: 'কলম সংগ্রাহক',
    desc: 'Own at least 5 pens in your Pen Locker.',
    icon: '✒️',
  },
  {
    key: 'challenge_master',
    title: 'Trick-Shot Scholar',
    banglaTitle: 'কৌশলী যোদ্ধা',
    desc: 'Complete 3 or more trick-shot challenge missions.',
    icon: '🎯',
  },
  {
    key: 'championship_winner',
    title: 'Grand Desk Champion',
    banglaTitle: 'গ্র্যান্ড চ্যাম্পিয়ন',
    desc: 'Win the 3-round Championship Cup tournament.',
    icon: '🏆',
  },
  {
    key: 'veteran_25',
    title: 'Last-Bench Legend',
    banglaTitle: 'লাস্ট-বেঞ্চ লিজেন্ড',
    desc: 'Complete 25 pen fight matches across any mode.',
    icon: '👑',
  },
];

export const INITIAL_PROGRESS: PlayerProgress = {
  version: 3,
  level: 1,
  xp: 0,
  coins: 250, // Starter coins
  matchesPlayed: 0,
  matchesWon: 0,
  knockoutsCount: 0,
  trickShotsCount: 0,
  unlockedSkins: ['matador_pinpoint', 'matador_alltime'],
  equippedSkin: DEFAULT_PEN_ID, // Strictly Matador Pin-Point
  equippedArena: 'classic',
  completedChallenges: [],
  championshipTrophies: 0,
  lastDailyDate: '',
  dailyStreak: 0,
};

export function evaluateUnlockedAchievements(progress: PlayerProgress): string[] {
  const unlocked: string[] = [];
  if (progress.matchesWon >= 1) unlocked.push('first_win');
  if (progress.knockoutsCount >= 10) unlocked.push('knockout_10');
  if (progress.unlockedSkins.length >= 5) unlocked.push('collector_5');
  if (progress.completedChallenges.length >= 3) unlocked.push('challenge_master');
  if (progress.championshipTrophies >= 1) unlocked.push('championship_winner');
  if (progress.matchesPlayed >= 25) unlocked.push('veteran_25');
  return unlocked;
}

export function loadProgress(): PlayerProgress {
  try {
    let raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_V2_KEY);
    }
    if (!raw) {
      return {
        ...INITIAL_PROGRESS,
        unlockedSkins: [...INITIAL_PROGRESS.unlockedSkins],
        completedChallenges: [...INITIAL_PROGRESS.completedChallenges],
      };
    }
    const parsed = JSON.parse(raw);
    const progress: PlayerProgress = {
      ...INITIAL_PROGRESS,
      ...parsed,
      unlockedSkins: Array.isArray(parsed?.unlockedSkins)
        ? [...parsed.unlockedSkins]
        : [...INITIAL_PROGRESS.unlockedSkins],
      completedChallenges: Array.isArray(parsed?.completedChallenges)
        ? [...parsed.completedChallenges]
        : [],
    };

    // Migration logic to ensure Matador Pin-Point and Matador All-Time are present
    if (!progress.unlockedSkins.includes('matador_pinpoint')) {
      progress.unlockedSkins.push('matador_pinpoint');
    }
    if (!progress.unlockedSkins.includes('matador_alltime')) {
      progress.unlockedSkins.push('matador_alltime');
    }

    // If equipped skin was the old generic 'blue' or invalid, set to Matador Pin-Point
    if (progress.equippedSkin === 'blue' || !progress.equippedSkin) {
      progress.equippedSkin = 'matador_pinpoint';
    }

    progress.coins = Math.max(0, Math.floor(Number(progress.coins) || 0));
    progress.xp = Math.max(0, Math.floor(Number(progress.xp) || 0));
    progress.level = calculateLevel(progress.xp);

    return progress;
  } catch {
    return {
      ...INITIAL_PROGRESS,
      unlockedSkins: [...INITIAL_PROGRESS.unlockedSkins],
      completedChallenges: [...INITIAL_PROGRESS.completedChallenges],
    };
  }
}

export function saveProgress(progress: PlayerProgress, bumpRevision = true): void {
  try {
    const normalized: PlayerProgress = {
      ...progress,
      coins: Math.max(0, Math.floor(Number(progress.coins) || 0)),
      xp: Math.max(0, Math.floor(Number(progress.xp) || 0)),
      level: calculateLevel(progress.xp),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(normalized));
    if (bumpRevision) {
      const meta = loadSaveMetadata();
      saveSaveMetadata({
        ...meta,
        revision: meta.revision + 1,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch {}
}

export function loadSaveMetadata(): LocalSaveMetadata {
  try {
    const raw = localStorage.getItem(SAVE_META_KEY);
    if (!raw) {
      return {
        revision: 1,
        updatedAt: new Date().toISOString(),
        lastSyncedRevision: null,
        lastSyncedUserId: null,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      revision: Math.max(1, Number(parsed.revision) || 1),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      lastSyncedRevision:
        parsed.lastSyncedRevision !== undefined ? parsed.lastSyncedRevision : null,
      lastSyncedUserId: parsed.lastSyncedUserId || null,
    };
  } catch {
    return {
      revision: 1,
      updatedAt: new Date().toISOString(),
      lastSyncedRevision: null,
      lastSyncedUserId: null,
    };
  }
}

export function saveSaveMetadata(meta: LocalSaveMetadata): void {
  try {
    localStorage.setItem(SAVE_META_KEY, JSON.stringify(meta));
  } catch {}
}

export function loadLocalMatchHistory(): LocalMatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(MATCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendLocalMatchHistory(
  item: LocalMatchHistoryItem
): LocalMatchHistoryItem[] {
  try {
    const current = loadLocalMatchHistory();
    // Deduplicate by idempotencyKey
    if (current.some((m) => m.idempotencyKey === item.idempotencyKey)) {
      return current;
    }
    const updated = [item, ...current].slice(0, 50);
    localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function markLocalMatchSynced(idempotencyKey: string): void {
  try {
    const current = loadLocalMatchHistory();
    const updated = current.map((m) =>
      m.idempotencyKey === idempotencyKey ? { ...m, syncedToCloud: true } : m
    );
    localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
}

export function xpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100;
}
