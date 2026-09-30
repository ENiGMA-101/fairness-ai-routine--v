/**
 * Single source of truth for live poll statistics.
 *
 * Percentage rule (used everywhere):
 *   percentage = optionVoteCount / totalValidResponsesForThatQuestion * 100
 *
 * - The denominator is the number of VALID submitted answers for that specific
 *   question (never page opens, never total questions, never empty answers,
 *   never unsubmitted browser selections).
 * - Every defined option is represented, even with 0 votes.
 * - Percentages are rounded consistently.
 */

export type PollStats = {
  /** Number of valid submitted answers for this question (the denominator). */
  total: number;
  counts: Record<string, number>;
  percentages: Record<string, number>;
};

export type PollStatsMap = Record<string, PollStats>;

/**
 * Build stats for one question.
 * @param values raw column values from submitted rows (null/empty are ignored)
 * @param optionValues every canonical option value for this question
 */
export function buildQuestionStats(
  values: (string | number | null | undefined)[],
  optionValues: readonly string[],
): PollStats {
  const counts: Record<string, number> = {};
  for (const optionValue of optionValues) counts[optionValue] = 0;

  let total = 0;
  for (const raw of values) {
    if (raw === null || raw === undefined || raw === "") continue;
    const key = String(raw);
    if (!(key in counts)) counts[key] = 0; // safety for unexpected stored values
    counts[key] += 1;
    total += 1;
  }

  const percentages: Record<string, number> = {};
  for (const [key, count] of Object.entries(counts)) {
    percentages[key] = total ? Math.round((count / total) * 100) : 0;
  }

  return { total, counts, percentages };
}

export type LeaderInfo = {
  value: string;
  label: string;
  percent: number;
  count: number;
};

export type DistRow = { value: string; label: string; count: number; percent: number };

export type LeaderResult = {
  /** Highest-count option, or null when there are no votes yet. */
  leader: LeaderInfo | null;
  /** All option values tied at the top count (for safe tie handling). */
  tiedValues: string[];
  isTie: boolean;
};

/**
 * Determine the leading option by the HIGHEST actual count — never by position
 * in the option array. Ties are reported explicitly so the UI never marks one
 * tied option as the unique leader.
 */
export function computeLeader(rows: DistRow[]): LeaderResult {
  if (!rows.length) return { leader: null, tiedValues: [], isTie: false };
  const maxCount = Math.max(...rows.map((row) => row.count));
  if (maxCount <= 0) return { leader: null, tiedValues: [], isTie: false };
  const top = rows.filter((row) => row.count === maxCount);
  const best = top[0];
  return {
    leader: { value: best.value, label: best.label, percent: best.percent, count: best.count },
    tiedValues: top.map((row) => row.value),
    isTie: top.length > 1,
  };
}

/**
 * Order options for the interactive survey UI: highest live percentage first,
 * lowest last. Equal percentages keep a stable order (original index) so the
 * list never jitters and never claims one tied option is the leader.
 */
export function sortOptionsByPercentage<T extends { value: string }>(
  options: readonly T[],
  percentages: Record<string, number> | undefined,
): T[] {
  if (!percentages) return [...options];
  return options
    .map((option, index) => ({ option, index, percent: percentages[option.value] ?? 0 }))
    .sort((a, b) => (b.percent - a.percent) || (a.index - b.index))
    .map((entry) => entry.option);
}
