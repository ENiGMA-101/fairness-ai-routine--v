"use client";

import { useState } from "react";
import { Sunrise, Sun, Moon, Sparkles } from "lucide-react";
import { FORM2_COPY, TIME_SLOTS } from "@/lib/survey";
import type { PollStatsMap } from "@/lib/poll-stats-client";

type Props = {
  values: Record<string, number>;
  onChange: (id: string, rating: number) => void;
  initialStats?: PollStatsMap | null;
  statsStatus?: "loading" | "ready" | "error";
  invalidSlotId?: string | null;
  scaleOrder?: readonly number[];
};

const SCALE = [
  { n: 1, emoji: "😣", label: "Hate it" },
  { n: 2, emoji: "🙁", label: "Dislike it" },
  { n: 3, emoji: "😐", label: "Neutral" },
  { n: 4, emoji: "🙂", label: "Like it" },
  { n: 5, emoji: "🤩", label: "Love it" },
];

function SlotIcon({ id }: { id: string }) {
  if (id.includes("8_00") || id.includes("9_30")) return <Sunrise className="h-4 w-4 text-amber-500" />;
  if (id.includes("17_00")) return <Moon className="h-4 w-4 text-violet-500" />;
  return <Sun className="h-4 w-4 text-sky-500" />;
}

export default function TimeSlotMatrix({ values, onChange, initialStats, statsStatus = "loading", invalidSlotId, scaleOrder }: Props) {
  const [clickedSlots, setClickedSlots] = useState<Record<string, boolean>>({});
  const ratedCount = TIME_SLOTS.filter(({ id }) => values[id] !== undefined).length;
  const orderedScale = scaleOrder?.length === SCALE.length
    ? scaleOrder.map((n) => SCALE.find((item) => item.n === n)!).filter(Boolean)
    : SCALE;

  function select(id: string, rating: number) {
    onChange(id, rating); // UI updates immediately; the database is read once for the entire form
    setClickedSlots((previous) => ({ ...previous, [id]: true }));
  }

  return (
    <section id="question-time-slots" tabIndex={-1} className={`survey-card mb-5 min-w-0 scroll-mt-32 rounded-[24px] border bg-white p-4 shadow-[0_12px_36px_-28px_rgba(38,48,84,0.42)] outline-none focus-visible:ring-4 focus-visible:ring-sky-300 sm:mb-6 sm:rounded-[26px] sm:p-7 dark:bg-[#18233b] ${invalidSlotId ? "border-rose-400 ring-2 ring-rose-300" : "border-slate-200 dark:border-slate-700"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-xs font-black text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">1</span>
            <h3 className="text-[16px] font-bold text-slate-900 sm:text-[17px] dark:text-white">{FORM2_COPY.matrixTitle} *</h3>
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{FORM2_COPY.matrixInstruction}</p>
          <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">{FORM2_COPY.matrixScale}</p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">The rating cards may appear in a different order; each number keeps the same meaning.</p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>{FORM2_COPY.rowsLabel}</span>
            <span>{FORM2_COPY.columnsLabel}</span>
          </div>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">{ratedCount} / {TIME_SLOTS.length} rated</span>
      </div>

      <div className="mt-5 space-y-3">
        {TIME_SLOTS.map((slot) => {
          const chosen = values[slot.id];
          const stats = initialStats?.[slot.id] ?? null;
          const showAll = !!clickedSlots[slot.id] && stats !== null;
          return (
            <div id={`slot-${slot.id}`} data-slot-id={slot.id} key={slot.id} tabIndex={-1} className={`min-w-0 scroll-mt-32 rounded-2xl border p-3 outline-none focus-visible:ring-4 focus-visible:ring-sky-300 sm:p-4 dark:bg-[#1e2c47] ${invalidSlotId === slot.id ? "border-rose-400 bg-rose-50 ring-2 ring-rose-200 dark:bg-rose-500/10" : "border-slate-200 bg-slate-50/70 dark:border-slate-600"}`}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-700"><SlotIcon id={slot.id} /></span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{slot.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{slot.range}</div>
                </div>
                {showAll && <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-200">{stats.total} responses</span>}
              </div>
              <div className="mt-3 grid grid-cols-5 gap-1.5" role="group" aria-label={`Rate ${slot.label}`}>
                {orderedScale.map(({ n, emoji, label }) => {
                  const selected = chosen === n;
                  const percent = stats?.percentages?.[String(n)] ?? 0;
                  const count = stats?.counts?.[String(n)] ?? 0;
                  return (
                      <button
                        key={n}
                        type="button"
                        data-rating-value={n}
                        aria-label={`${slot.label}: ${n} of 5 — ${label}`}
                      aria-pressed={selected}
                      onClick={() => select(slot.id, n)}
                      className={`flex min-h-[62px] min-w-0 touch-manipulation flex-col items-center justify-center rounded-xl border-2 px-0.5 py-1.5 text-[11px] font-bold transition-colors focus-visible:ring-4 focus-visible:ring-sky-300 sm:px-1 sm:text-xs ${selected
                        ? "border-sky-500 bg-sky-100 text-sky-900 dark:border-sky-400 dark:bg-sky-400/20 dark:text-sky-100"
                        : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 dark:border-slate-600 dark:bg-[#18233b] dark:text-slate-300 dark:hover:border-sky-400"}`}
                    >
                      <span aria-hidden="true" className="text-base">{emoji}</span><span>{n}</span>
                      {showAll && <span className={`rounded-full px-1.5 text-[10px] font-black ${selected ? "bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950" : "bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-100"}`}>{percent}%</span>}
                      {showAll && <span className="text-[9px] font-normal text-slate-500 dark:text-slate-300">{count} vote{count === 1 ? "" : "s"}</span>}
                    </button>
                  );
                })}
              </div>
              {showAll && (
                <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400" aria-live="polite">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                  <span>All five ratings shown · your choice counts only after Submit</span>
                </div>
              )}
              {clickedSlots[slot.id] && !stats && <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400" aria-live="polite">{statsStatus === "error" ? "Community results unavailable right now; your selection is ready." : "Fetching community results… your selection is ready."}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
