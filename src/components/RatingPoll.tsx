"use client";

import { useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import type { PollStats, PollStatsMap } from "@/lib/poll-stats-client";

type Props = {
  form: "form1" | "form2";
  questionId: string;
  title: string;
  titleBn?: string;
  leftLabel: string;
  rightLabel: string;
  value: number | null;
  onChange: (rating: number) => void;
  visual?: ReactNode;
  index?: number;
  initialStats?: PollStatsMap | null;
  statsStatus?: "loading" | "ready" | "error";
};

const SCALE = [
  { n: 1, emoji: "😣", label: "Strongly against" },
  { n: 2, emoji: "🙁", label: "Prefer not" },
  { n: 3, emoji: "😐", label: "Neutral" },
  { n: 4, emoji: "🙂", label: "Good idea" },
  { n: 5, emoji: "🤩", label: "Strongly support" },
];

export default function RatingPoll({
  questionId,
  title,
  titleBn,
  leftLabel,
  rightLabel,
  value,
  onChange,
  visual,
  index,
  initialStats,
  statsStatus = "loading",
}: Props) {
  const [clicked, setClicked] = useState(false);
  const stats: PollStats | null = initialStats?.[questionId] ?? null;
  const showAllResults = clicked && stats !== null;

  function select(rating: number) {
    onChange(rating); // instant UI change; no database request here
    setClicked(true);
  }

  return (
    <section className="survey-card mb-6 rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_-28px_rgba(38,48,84,0.42)] sm:p-7 dark:border-slate-700 dark:bg-[#18233b]">
      {visual && <div className="survey-visual mb-5">{visual}</div>}
      <div className="flex items-start gap-3">
        {index && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-fuchsia-100 text-xs font-black text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-200">{index}</span>}
        <div>
          <h3 className="text-[16px] font-bold leading-snug text-slate-900 sm:text-[17px] dark:text-white">{title}</h3>
          {titleBn && <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{titleBn}</p>}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-5 gap-1.5 sm:gap-2" role="group" aria-label={title}>
        {SCALE.map(({ n, emoji, label }) => {
          const selected = value === n;
          const percent = stats?.percentages?.[String(n)] ?? 0;
          const count = stats?.counts?.[String(n)] ?? 0;
          return (
            <button
              key={n}
              type="button"
              title={label}
              aria-label={`Rating ${n} of 5: ${label}`}
              aria-pressed={selected}
              onClick={() => select(n)}
              className={`flex min-h-[74px] flex-col items-center justify-center gap-0.5 rounded-2xl border-[1.5px] px-1 py-2 text-sm font-bold transition-all sm:min-h-[86px] ${selected
                ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-800 ring-[3px] ring-fuchsia-500/10 dark:border-fuchsia-400 dark:bg-fuchsia-500/15 dark:text-fuchsia-100"
                : "border-slate-200 bg-white text-slate-700 hover:border-fuchsia-300 dark:border-slate-600 dark:bg-[#1e2c47] dark:text-slate-200 dark:hover:border-fuchsia-400"}`}
            >
              <span className="text-xl" aria-hidden="true">{emoji}</span>
              <span>{n}</span>
              {showAllResults && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${selected ? "bg-fuchsia-600 text-white dark:bg-fuchsia-400 dark:text-slate-950" : "bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-100"}`}>{percent}%</span>}
              {showAllResults && <span className="text-[10px] font-normal text-slate-500 dark:text-slate-300">{count} vote{count === 1 ? "" : "s"}</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">
        <span className="max-w-[48%]">{leftLabel}</span>
        <span className="max-w-[48%] text-right">{rightLabel}</span>
      </div>

      {showAllResults ? (
        <div className="mt-5 rounded-2xl border border-fuchsia-200 bg-fuchsia-50/70 p-4 dark:border-fuchsia-500/25 dark:bg-fuchsia-500/10" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-1.5 font-semibold"><Sparkles className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-300" /> All rating results</span>
            <span>{stats.total} submitted response{stats.total === 1 ? "" : "s"}</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {SCALE.map(({ n }) => {
              const percent = stats.percentages?.[String(n)] ?? 0;
              const count = stats.counts?.[String(n)] ?? 0;
              return (
                <div key={n} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="w-7 font-bold">{n} ★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white dark:bg-slate-700"><div className={`h-full rounded-full transition-[width] duration-300 ${value === n ? "bg-gradient-to-r from-fuchsia-500 to-violet-500" : "bg-sky-400 dark:bg-sky-500"}`} style={{ width: `${percent}%` }} /></div>
                  <span className="w-16 text-right tabular-nums">{count} · {percent}%</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">Changing your selection does not add a vote. Your answer counts after Submit.</p>
        </div>
      ) : clicked ? (
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">{statsStatus === "error" ? "Results unavailable right now. Your selection is saved on this page." : "Fetching all community ratings… your selection is ready."}</p>
      ) : (
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Choose a rating to reveal all five results.</p>
      )}
    </section>
  );
}
