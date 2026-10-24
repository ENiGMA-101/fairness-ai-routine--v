import { PlayerConfig } from '../types/game';

export const MAX_PLAYER_NAME_LENGTH = 18;

// Control characters (ASCII 0-31, 127, C1 controls) and unsafe markup characters
const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F-\u009F]/;
const UNSAFE_INPUT_REGEX = /[<>{}`\\]/;

export interface NameValidationResult {
  valid: boolean;
  trimmed: string;
  error?: string;
}

/**
 * Validates a single player's display name:
 * - Trims leading and trailing whitespace
 * - Rejects empty or whitespace-only strings
 * - Enforces maximum length of 18 characters
 * - Rejects control characters and unsafe HTML/script characters
 * - Detects duplicate display names across active participants
 */
export function validatePlayerName(
  rawName: string,
  playerIndex: number,
  allActiveNames?: string[]
): NameValidationResult {
  if (typeof rawName !== 'string') {
    return {
      valid: false,
      trimmed: '',
      error: `Please enter a valid name for Player ${playerIndex + 1}.`,
    };
  }

  if (CONTROL_CHAR_REGEX.test(rawName)) {
    return {
      valid: false,
      trimmed: rawName.trim(),
      error: 'Name cannot contain control characters.',
    };
  }

  if (UNSAFE_INPUT_REGEX.test(rawName)) {
    return {
      valid: false,
      trimmed: rawName.trim(),
      error: 'Name contains unsupported special characters (<, >, {, }, \\).',
    };
  }

  const trimmed = rawName.trim().replace(/\s+/g, ' ');

  if (trimmed.length === 0) {
    return {
      valid: false,
      trimmed: '',
      error: `Player ${playerIndex + 1} name is required.`,
    };
  }

  if (trimmed.length > MAX_PLAYER_NAME_LENGTH) {
    return {
      valid: false,
      trimmed,
      error: `Name must be ${MAX_PLAYER_NAME_LENGTH} characters or fewer.`,
    };
  }

  if (allActiveNames && allActiveNames.length > 0) {
    const normalizedLower = trimmed.toLowerCase();
    for (let i = 0; i < allActiveNames.length; i++) {
      if (i === playerIndex) continue;
      const otherTrimmed = (allActiveNames[i] || '').trim().replace(/\s+/g, ' ').toLowerCase();
      if (otherTrimmed.length > 0 && otherTrimmed === normalizedLower) {
        return {
          valid: false,
          trimmed,
          error: `Duplicate name with Player ${i + 1}. Please enter a distinct name.`,
        };
      }
    }
  }

  return {
    valid: true,
    trimmed,
  };
}

/**
 * Disambiguates duplicate display names gracefully if a caller requests automatic disambiguation
 * (e.g. ["Rafi", "Rafi"] -> ["Rafi (1)", "Rafi (2)"]).
 */
export function disambiguateDisplayNames(names: string[]): string[] {
  const counts = new Map<string, number>();
  const trimmedList = names.map((n) => n.trim().replace(/\s+/g, ' '));

  for (const name of trimmedList) {
    const key = name.toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const seen = new Map<string, number>();
  return trimmedList.map((name) => {
    const key = name.toLowerCase();
    if ((counts.get(key) || 0) <= 1) return name;
    const idx = (seen.get(key) || 0) + 1;
    seen.set(key, idx);
    const suffix = ` (${idx})`;
    const base = name.slice(0, Math.max(1, MAX_PLAYER_NAME_LENGTH - suffix.length));
    return `${base}${suffix}`;
  });
}

export interface RosterValidationResult {
  valid: boolean;
  errors: Record<number, string>;
  normalizedPlayers: PlayerConfig[];
}

/**
 * Validates the active match roster (2 or 3 players) and assigns stable player IDs.
 */
export function validateMatchRoster(
  players: PlayerConfig[],
  playerCount: 2 | 3
): RosterValidationResult {
  const active = players.slice(0, playerCount);
  const allNames = active.map((p) => p.name);
  const errors: Record<number, string> = {};

  const normalizedPlayers: PlayerConfig[] = active.map((p, idx) => {
    const stableId = `player_${idx + 1}`;
    if (p.isBot) {
      return {
        ...p,
        id: stableId,
        name: p.name.trim() || `Bot ${idx + 1}`,
      };
    }

    const res = validatePlayerName(p.name, idx, allNames);
    if (!res.valid && res.error) {
      errors[idx] = res.error;
    }

    return {
      ...p,
      id: stableId,
      name: res.trimmed,
    };
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalizedPlayers,
  };
}
