import { GameSettings, PlayerProgress } from '../types/game';
import { calculateLevel, evaluateUnlockedAchievements } from './storage';
import type { CloudSaveRecord } from '../server/db';

export type SyncStatus = 'saved' | 'syncing' | 'offline' | 'error';

export type ConflictResolutionChoice = 'merge' | 'keep_cloud' | 'keep_local';

export interface SaveConflictDetails {
  localProgress: PlayerProgress;
  localRevision: number;
  localUpdatedAt: string;
  cloudSave: CloudSaveRecord;
}

/**
 * Returns the exact status label required by the specification:
 * - "Saved"
 * - "Syncing"
 * - "Offline — saved on this device"
 * - "Sync failed — Retry"
 */
export function formatSyncStatusLabel(status: SyncStatus): string {
  switch (status) {
    case 'saved':
      return 'Saved';
    case 'syncing':
      return 'Syncing';
    case 'offline':
      return 'Offline — saved on this device';
    case 'error':
      return 'Sync failed — Retry';
  }
}

export function hasMeaningfulProgress(progress: PlayerProgress): boolean {
  return (
    progress.xp > 0 ||
    progress.matchesPlayed > 0 ||
    progress.coins !== 250 ||
    progress.unlockedSkins.length > 2 ||
    progress.completedChallenges.length > 0 ||
    progress.championshipTrophies > 0
  );
}

export function cloudSaveHasMeaningfulProgress(cloud: CloudSaveRecord): boolean {
  const cp = cloud.challengeProgress;
  return (
    cloud.xp > 0 ||
    (cp?.matchesPlayed || 0) > 0 ||
    cloud.coins !== 250 ||
    cloud.unlockedPens.length > 2 ||
    (cp?.completedChallenges?.length || 0) > 0 ||
    (cp?.championshipTrophies || 0) > 0 ||
    cloud.revision > 1
  );
}

export function cloudSaveToPlayerProgress(cloud: CloudSaveRecord): PlayerProgress {
  const cp = cloud.challengeProgress;
  const unlocked = Array.from(
    new Set(['matador_pinpoint', 'matador_alltime', ...(cloud.unlockedPens || [])])
  );
  return {
    version: cloud.saveVersion || 3,
    level: calculateLevel(cloud.xp),
    xp: Math.max(0, cloud.xp),
    coins: Math.max(0, cloud.coins),
    matchesPlayed: cp?.matchesPlayed || 0,
    matchesWon: cp?.matchesWon || 0,
    knockoutsCount: cp?.knockoutsCount || 0,
    trickShotsCount: cp?.trickShotsCount || 0,
    unlockedSkins: unlocked,
    equippedSkin: unlocked.includes(cloud.equippedPenId)
      ? cloud.equippedPenId
      : 'matador_pinpoint',
    equippedArena: cp?.equippedArena || 'classic',
    completedChallenges: Array.isArray(cp?.completedChallenges)
      ? [...cp.completedChallenges]
      : [],
    championshipTrophies: cp?.championshipTrophies || 0,
    lastDailyDate: cp?.lastDailyDate || '',
    dailyStreak: cp?.dailyStreak || 0,
  };
}

/**
 * Compares local progress and cloud save to determine whether automatic sync or explicit user conflict resolution is required.
 */
export function evaluateSyncComparison(
  localProgress: PlayerProgress,
  localLastSyncedRev: number | null,
  cloudSave: CloudSaveRecord | null
): 'push_local' | 'pull_cloud' | 'in_sync' | 'conflict' {
  if (!cloudSave) {
    return 'push_local';
  }

  const localHas = hasMeaningfulProgress(localProgress);
  const cloudHas = cloudSaveHasMeaningfulProgress(cloudSave);

  if (!cloudHas && localHas) {
    return 'push_local';
  }
  if (!localHas && cloudHas) {
    return 'pull_cloud';
  }
  if (!localHas && !cloudHas) {
    return 'in_sync';
  }

  // Check if core progress values match
  const cloudAsProgress = cloudSaveToPlayerProgress(cloudSave);
  const sameStats =
    localProgress.xp === cloudAsProgress.xp &&
    localProgress.coins === cloudAsProgress.coins &&
    localProgress.matchesPlayed === cloudAsProgress.matchesPlayed &&
    localProgress.unlockedSkins.length === cloudAsProgress.unlockedSkins.length &&
    localProgress.completedChallenges.length ===
      cloudAsProgress.completedChallenges.length;

  if (sameStats) {
    return 'in_sync';
  }

  // If this device was previously synced at the current cloud revision and only local advanced
  if (localLastSyncedRev !== null && localLastSyncedRev === cloudSave.revision) {
    return 'push_local';
  }

  // Both copies have divergent progress -> require explicit conflict resolution
  return 'conflict';
}

/**
 * Deterministically merges local and cloud progress so no unlocked pens, challenges, or high-water stats are lost.
 */
export function mergeLocalAndCloudProgress(
  local: PlayerProgress,
  localSettings: GameSettings,
  cloud: CloudSaveRecord
): { progress: PlayerProgress; settings: GameSettings } {
  const cloudProg = cloudSaveToPlayerProgress(cloud);
  const mergedSkins = Array.from(
    new Set([
      'matador_pinpoint',
      'matador_alltime',
      ...local.unlockedSkins,
      ...cloudProg.unlockedSkins,
    ])
  );
  const mergedChallenges = Array.from(
    new Set([...local.completedChallenges, ...cloudProg.completedChallenges])
  );

  const mergedXp = Math.max(local.xp, cloudProg.xp);
  const mergedCoins = Math.max(local.coins, cloudProg.coins);

  const progress: PlayerProgress = {
    version: 3,
    xp: mergedXp,
    level: calculateLevel(mergedXp),
    coins: mergedCoins,
    matchesPlayed: Math.max(local.matchesPlayed, cloudProg.matchesPlayed),
    matchesWon: Math.max(local.matchesWon, cloudProg.matchesWon),
    knockoutsCount: Math.max(local.knockoutsCount, cloudProg.knockoutsCount),
    trickShotsCount: Math.max(local.trickShotsCount, cloudProg.trickShotsCount),
    unlockedSkins: mergedSkins,
    equippedSkin: mergedSkins.includes(local.equippedSkin)
      ? local.equippedSkin
      : cloudProg.equippedSkin,
    equippedArena: local.equippedArena || cloudProg.equippedArena || 'classic',
    completedChallenges: mergedChallenges,
    championshipTrophies: Math.max(
      local.championshipTrophies,
      cloudProg.championshipTrophies
    ),
    lastDailyDate:
      local.lastDailyDate >= cloudProg.lastDailyDate
        ? local.lastDailyDate
        : cloudProg.lastDailyDate,
    dailyStreak: Math.max(local.dailyStreak, cloudProg.dailyStreak),
  };

  return {
    progress,
    settings: { ...cloud.settings, ...localSettings },
  };
}

export function buildSaveApiPayload(
  progress: PlayerProgress,
  settings: GameSettings,
  selectedTableId: string,
  expectedRevision?: number,
  forceOverwrite?: boolean
) {
  return {
    saveVersion: progress.version || 3,
    xp: progress.xp,
    level: calculateLevel(progress.xp),
    coins: progress.coins,
    unlockedPens: progress.unlockedSkins,
    equippedPenId: progress.equippedSkin,
    settings,
    challengeProgress: {
      completedChallenges: progress.completedChallenges,
      championshipTrophies: progress.championshipTrophies,
      matchesPlayed: progress.matchesPlayed,
      matchesWon: progress.matchesWon,
      knockoutsCount: progress.knockoutsCount,
      trickShotsCount: progress.trickShotsCount,
      equippedArena: progress.equippedArena,
      selectedTableId,
      lastDailyDate: progress.lastDailyDate,
      dailyStreak: progress.dailyStreak,
    },
    achievements: evaluateUnlockedAchievements(progress),
    expectedRevision,
    forceOverwrite: Boolean(forceOverwrite),
  };
}
