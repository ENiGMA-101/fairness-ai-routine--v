"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { useStats, type Stats } from "./PollCard";

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
  initialStats?: Record<string, Stats> | null;
};

const RATING_DESCRIPTIONS = [
  { n: 1, emoji: "😡", desc: "Strongly against" },
  { n: 2, emoji: "🙁", desc: "Prefer not" },
  { n: 3, emoji: "😐", desc: "Neutral" },
  { n: 4, emoji: "🙂", desc: "Good idea" },
  { n: 5, emoji: "🤩", desc: "Strongly support" },
];

export default function RatingPoll({
  form,
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
}: Props) {
  const { stats, load } = useStats(form);
  const current = initialStats?.[questionId] ?? stats[questionId];
  // Distribution hidden until THIS user picks a rating here.
  const [revealed, setRevealed] = useState(false);
  const showStats = revealed && Boolean(current);

  // Preload on mount in background
  useEffect(() => {
    void load(questionId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (n: number) => {
    onChange(n);
    setRevealed(true);
    void load(questionId);
  };

  return (
    <section className="mb-6 rounded-[28px] border border-zinc-200/80 bg-white p-6 md:p-7 shadow-sm transition-all hover:shadow-md">
      {visual ? <div className="mb-5">{visual}</div> : null}

      <div className="flex items-start gap-3">
        {index ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-violet-700">
            {index}
          </span>
        ) : null}
        <div className="flex-1">
          {title ? (
            <h3 className="text-[17px] font-bold leading-snug text-zinc-900">{title}</h3>
          ) : null}
          {titleBn ? (
            <p className="mt-1.5 text-[15px] leading-relaxed text-zinc-700 font-medium">{titleBn}</p>
          ) : null}
        </div>
      </div>

      {/* 1-5 Button Grid */}
      <div className="mt-6 grid grid-cols-5 gap-2">
        {RATING_DESCRIPTIONS.map((item) => {
          const active = value === item.n;
          return (
            <button
              key={item.n}
              type="button"
              onClick={() => select(item.n)}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 py-3.5 transition-all ${
                active
                  ? "border-violet-600 bg-violet-600 text-white shadow-lg scale-[1.04]"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 hover:bg-violet-50/30"
              }`}
            >
              <span className="text-xl sm:text-2xl">{item.emoji}</span>
              <span className="mt-1 text-sm font-black">{item.n}</span>
            </button>
          );
        })}
      </div>

      {/* End labels */}
      <div className="mt-3 flex justify-between gap-4 text-xs font-medium text-zinc-500">
        <span className="max-w-[48%] rounded-lg bg-zinc-100 p-1.5 text-zinc-700">{leftLabel}</span>
        <span className="max-w-[48%] text-right rounded-lg bg-zinc-100 p-1.5 text-zinc-700">
          {rightLabel}
        </span>
      </div>

      {/* Live Distribution — only after user picks a rating */}
      {showStats ? (
        <div className="mt-5 space-y-2 rounded-2xl bg-zinc-50 p-4 border border-zinc-200">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span className="font-bold text-violet-700 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Live community votes
            </span>
            <span>{current.total} response{current.total === 1 ? "" : "s"}</span>
          </div>
          {[1, 2, 3, 4, 5].map((n) => {
            const pct = current.percentages?.[String(n)] ?? 0;
            return (
              <div key={n} className="flex items-center gap-2.5 text-xs">
                <span className="w-5 font-bold text-zinc-600">{n} ★</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right font-black text-zinc-800">{pct}%</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
