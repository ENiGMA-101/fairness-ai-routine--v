import type { Option } from "@/lib/survey";

/** Statistics for one question, counting only valid, submitted answers. */
export type VoteStats = {
  total: number;
  counts: Record<string, number>;
  percentages: Record<string, number>;
};

/**
 * The denominator is the number of answers matching this question's defined options.
 * Missing, empty, or out-of-domain responses never dilute a percentage. All defined
 * options are returned, including those with no votes.
 */
export function countValidVotes(values: readonly unknown[], allowed: readonly string[]): VoteStats {
  const choices = [...new Set(allowed)];
  const counts: Record<string, number> = Object.fromEntries(choices.map((choice) => [choice, 0]));
  let total = 0;

  for (const raw of values) {
    if (typeof raw !== "string" && typeof raw !== "number") continue;
    const answer = String(raw);
    if (!Object.hasOwn(counts, answer)) continue;
    counts[answer] += 1;
    total += 1;
  }

  const percentages: Record<string, number> = {};
  for (const choice of choices) {
    percentages[choice] = total === 0 ? 0 : Math.round((counts[choice] / total) * 100);
  }
  return { counts, total, percentages };
}

/** Leader(s) are decided by real vote counts, not option position or rounded %. */
export function leadingValues<T extends { value: string; count: number }>(
  rows: readonly T[],
): T[] {
  const highest = Math.max(0, ...rows.map(({ count }) => count));
  return highest === 0 ? [] : rows.filter(({ count }) => count === highest);
}

/**
 * Interactive survey only: rank by live percentage, then actual count, then
 * original order. The canonical definitions and results pages are never sorted.
 */
export function sortOptionsByLivePercentage<T extends Option>(
  options: readonly T[],
  stats?: VoteStats | null,
): T[] {
  if (!stats || stats.total === 0) return [...options];
  return options
    .map((option, index) => ({ option, index }))
    .sort((a, b) => {
      const percentDiff = (stats.percentages[b.option.value] ?? 0) - (stats.percentages[a.option.value] ?? 0);
      const countDiff = (stats.counts[b.option.value] ?? 0) - (stats.counts[a.option.value] ?? 0);
      return percentDiff || countDiff || a.index - b.index;
    })
    .map(({ option }) => option);
}
