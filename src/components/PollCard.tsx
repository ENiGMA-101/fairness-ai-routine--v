"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, Sparkles, ShieldCheck } from "lucide-react";
import type { Option } from "@/lib/survey";

export type Stats = {
  total: number;
  counts: Record<string, number>;
  percentages: Record<string, number>;
};

export function useStats(form: "form1" | "form2") {
  const [cache, setCache] = useState<Record<string, Stats>>({});

  const load = async (questionId: string) => {
    try {
      const res = await fetch(`/api/${form}/stats?question=${encodeURIComponent(questionId)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as Stats;
      setCache((prev) => ({ ...prev, [questionId]: data }));
    } catch {
      /* keep previous state on network error */
    }
  };

  const loadAll = async (allStats: Record<string, Stats>) => {
    setCache((prev) => ({ ...prev, ...allStats }));
  };

  return { stats: cache, load, loadAll, setCache };
}

type PollCardProps = {
  form: "form1" | "form2";
  questionId: string;
  title: string;
  subtitle?: string;
  options: Option[];
  value?: string | null;
  onChange: (value: string) => void;
  visual?: ReactNode;
  index?: number;
  initialStats?: Stats | null;
  /** Demographic / fixed question — never reveals community percentages. */
  hideResults?: boolean;
};

export default function PollCard({
  form,
  questionId,
  title,
  subtitle,
  options,
  value,
  onChange,
  visual,
  index,
  initialStats,
  hideResults,
}: PollCardProps) {
  const { stats, load } = useStats(form);
  const current = initialStats ?? stats[questionId];
  const revealStats = !hideResults;
  // Percentages stay hidden until THIS user clicks an option in THIS question.
  const [revealed, setRevealed] = useState(false);
  const showStats = revealStats && revealed && Boolean(current);

  // Preload: fire once on mount in background so percentages are ready when user clicks
  useEffect(() => {
    if (hideResults) return;
    void load(questionId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handle = (option: Option) => {
    onChange(option.value);
    if (hideResults) return;
    setRevealed(true);
    void load(questionId);
  };

  return (
    <section className="mb-6 rounded-[28px] border border-zinc-200/80 bg-white p-6 md:p-7 shadow-sm transition-all hover:shadow-md">
      {/* Graphical illustration */}
      {visual ? <div className="mb-5">{visual}</div> : null}

      {/* Question Header */}
      <div className="flex items-start gap-3">
        {index ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-violet-700">
            {index}
          </span>
        ) : null}
        <div className="flex-1">
          <h3 className="text-[17px] font-bold leading-snug text-zinc-900">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm font-medium text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {/* Poll Options */}
      <div className="mt-5 space-y-3">
        {options.map((opt) => {
          const selected = value === opt.value;
          const pct = current?.percentages?.[opt.value] ?? 0;
          const voteCount = current?.counts?.[opt.value] ?? 0;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handle(opt)}
              className={`group relative w-full overflow-hidden rounded-2xl border-2 px-5 py-4 text-left transition-all duration-300 ${
                selected
                  ? "border-violet-600 bg-violet-50/50 shadow-sm ring-2 ring-violet-500/20"
                  : "border-zinc-200 bg-white hover:border-violet-300 hover:bg-zinc-50/70"
              }`}
            >
              {/* Animated Live Percentage Fill — only visible after user selects */}
              {showStats ? (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${
                    selected ? "bg-violet-200/60" : "bg-zinc-100/80"
                  }`}
                  style={{ width: `${Math.max(pct, 1)}%` }}
                />
              ) : null}

              {/* Foreground Content */}
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      selected
                        ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                        : "border-zinc-300 bg-white group-hover:border-zinc-400"
                    }`}
                  >
                    {selected ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                  </span>
                  <span
                    className={`text-[15px] font-medium leading-snug ${
                      selected ? "font-bold text-violet-950" : "text-zinc-800"
                    }`}
                  >
                    {opt.label}
                  </span>
                </div>

                {/* Percentage & Vote Count Badge */}
                {current ? (
                  <div className="flex shrink-0 items-center gap-2">
                    {voteCount > 0 && (
                      <span className="hidden text-xs text-zinc-400 sm:inline">
                        {voteCount} vote{voteCount === 1 ? "" : "s"}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                        selected
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-zinc-200/70 text-zinc-700"
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Poll Footer */}
      <div className="mt-3.5 flex items-center justify-between text-xs text-zinc-400">
        {current ? (
          <span className="flex items-center gap-1.5 font-medium text-violet-600">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-600 animate-pulse" />
            {current.total} response{current.total === 1 ? "" : "s"} • Live results
          </span>
        ) : (
          <span className="flex items-center gap-1 text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
            Pick an option to see live community poll results
          </span>
        )}
      </div>
    </section>
  );
}
