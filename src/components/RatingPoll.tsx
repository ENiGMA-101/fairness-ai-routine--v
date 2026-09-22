"use client";

import type { ReactNode } from "react";
import { useStats } from "./PollCard";

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
};

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
}: Props) {
  const { stats, load } = useStats(form);
  const current = stats[questionId];

  const select = (n: number) => {
    onChange(n);
    void load(questionId);
  };

  return (
    <section className="mb-5 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
      {visual ? <div className="mb-4">{visual}</div> : null}
      {title ? <h3 className="text-[16px] font-semibold text-zinc-900">{title}</h3> : null}
      {titleBn ? <p className="mt-2 text-[15px] leading-relaxed text-zinc-700">{titleBn}</p> : null}

      <div className="mt-5 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => select(n)}
              className={`rounded-xl border-2 py-3 text-base font-bold transition ${
                active
                  ? "border-violet-600 bg-violet-50 text-violet-700"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between gap-4 text-xs text-zinc-500">
        <span className="max-w-[48%]">{leftLabel}</span>
        <span className="max-w-[48%] text-right">{rightLabel}</span>
      </div>

      {current ? (
        <div className="mt-5 space-y-1.5">
          {[1, 2, 3, 4, 5].map((n) => {
            const pct = current.percentages?.[String(n)] ?? 0;
            return (
              <div key={n} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-zinc-500">{n}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right font-semibold text-zinc-700">{pct}%</span>
              </div>
            );
          })}
          <div className="pt-1 text-xs text-zinc-400">
            {current.total} response{current.total === 1 ? "" : "s"} • live
          </div>
        </div>
      ) : null}
    </section>
  );
}
