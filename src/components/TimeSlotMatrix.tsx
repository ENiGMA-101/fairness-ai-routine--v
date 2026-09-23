"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Sunrise, Clock, Sparkles } from "lucide-react";
import { TIME_SLOTS } from "@/lib/survey";
import { useStats, type Stats } from "./PollCard";

type Props = {
  values: Record<string, number>;
  onChange: (id: string, rating: number) => void;
  initialStats?: Record<string, Stats> | null;
};

const RATING_EMOJIS = [
  { n: 1, emoji: "😡", label: "Hate it" },
  { n: 2, emoji: "🙁", label: "Dislike" },
  { n: 3, emoji: "😐", label: "Neutral" },
  { n: 4, emoji: "🙂", label: "Like" },
  { n: 5, emoji: "🤩", label: "Love it" },
];

function getSlotIcon(id: string) {
  if (id.includes("8_00") || id.includes("9_30")) {
    return <Sunrise className="h-4 w-4 text-amber-500" />;
  }
  if (id.includes("11_00") || id.includes("12_30")) {
    return <Sun className="h-4 w-4 text-amber-600" />;
  }
  if (id.includes("14_00") || id.includes("15_30")) {
    return <Sun className="h-4 w-4 text-orange-500" />;
  }
  return <Moon className="h-4 w-4 text-indigo-500" />;
}

export default function TimeSlotMatrix({ values, onChange, initialStats }: Props) {
  const { stats, load } = useStats("form2");
  // Which slots THIS user has clicked — percentages hidden until then.
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  // Preload all slot stats on mount in one background batch
  useEffect(() => {
    for (const slot of TIME_SLOTS) {
      void load(slot.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (id: string, rating: number) => {
    onChange(id, rating);
    setRevealed((prev: Record<string, boolean>) => ({ ...prev, [id]: true }));
    void load(id);
  };

  const ratedCount = TIME_SLOTS.filter((s) => Boolean(values[s.id])).length;

  return (
    <section className="mb-6 rounded-[28px] border border-zinc-200/80 bg-white p-6 md:p-7 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-violet-700">
              1
            </span>
            <h3 className="text-[17px] font-bold text-zinc-900">
              Time-Slot Preference Rating *
            </h3>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Rate each class time slot from 1 (Hate it) to 5 (Love it).
          </p>
        </div>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
          {ratedCount} of {TIME_SLOTS.length} rated
        </span>
      </div>

      {/* Rating Legend Header */}
      <div className="mt-5 hidden sm:grid grid-cols-[150px_repeat(5,1fr)] gap-2 pb-2 text-center text-xs font-semibold text-zinc-500">
        <div className="text-left pl-2">Time Slot</div>
        {RATING_EMOJIS.map((r) => (
          <div key={r.n} className="flex flex-col items-center justify-center">
            <span className="text-base">{r.emoji}</span>
            <span className="text-[11px] mt-0.5">{r.label}</span>
          </div>
        ))}
      </div>

      {/* Slots List */}
      <div className="mt-3 space-y-4">
        {TIME_SLOTS.map((slot) => {
          const current = initialStats?.[slot.id] ?? stats[slot.id];
          const chosen = values[slot.id];

          return (
            <div
              key={slot.id}
              className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 transition-all hover:bg-zinc-50 hover:border-zinc-300"
            >
              <div className="grid grid-cols-1 sm:grid-cols-[150px_repeat(5,1fr)] items-center gap-3">
                {/* Slot Info */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm shrink-0">
                    {getSlotIcon(slot.id)}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-zinc-900">{slot.label}</div>
                    <div className="text-[11px] font-medium text-zinc-400">{slot.range}</div>
                  </div>
                </div>

                {/* Rating 1-5 Buttons */}
                <div className="grid grid-cols-5 gap-1.5 sm:col-span-5">
                  {RATING_EMOJIS.map((r) => {
                    const active = chosen === r.n;
                    return (
                      <button
                        key={r.n}
                        type="button"
                        onClick={() => select(slot.id, r.n)}
                        className={`flex flex-col items-center justify-center rounded-xl border-2 py-2.5 transition-all ${
                          active
                            ? "border-violet-600 bg-violet-600 text-white shadow-md scale-[1.03]"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 hover:bg-violet-50/30"
                        }`}
                      >
                        <span className="text-base sm:text-lg">{r.emoji}</span>
                        <span className="mt-0.5 text-xs font-black">{r.n}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Percentages underneath each slot — only after user rates this slot */}
              {revealed[slot.id] && current ? (
                <div className="mt-3 pt-3 border-t border-zinc-200/60">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5">
                    <span className="font-semibold text-violet-700 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Live rating distribution
                    </span>
                    <span>{current.total} response{current.total === 1 ? "" : "s"}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const pct = current.percentages?.[String(n)] ?? 0;
                      return (
                        <div key={n} className="rounded-lg bg-white p-1 border border-zinc-200">
                          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                            <div
                              className="h-full rounded-full bg-violet-500 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="mt-1 text-[10px] font-bold text-zinc-600">{pct}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
