"use client";

import { TIME_SLOTS } from "@/lib/survey";
import { useStats } from "./PollCard";

type Props = {
  values: Record<string, number>;
  onChange: (id: string, rating: number) => void;
};

export default function TimeSlotMatrix({ values, onChange }: Props) {
  const { stats, load } = useStats("form2");

  const select = (id: string, rating: number) => {
    onChange(id, rating);
    void load(id);
  };

  return (
    <section className="mb-5 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-[16px] font-semibold text-zinc-900">1. Time-slot preference rating *</h3>
      <p className="mt-1 text-sm text-zinc-500">
        1 = Hate it &nbsp;•&nbsp; 2 = Dislike &nbsp;•&nbsp; 3 = Neutral &nbsp;•&nbsp; 4 = Like&nbsp;•&nbsp; 5 = Love it
      </p>

      <div className="mt-6 space-y-5">
        {TIME_SLOTS.map((slot) => {
          const current = stats[slot.id];
          const chosen = values[slot.id];
          return (
            <div key={slot.id}>
              <div className="grid grid-cols-[110px_repeat(5,1fr)] items-center gap-2">
                <div>
                  <div className="text-sm font-semibold text-zinc-800">{slot.label}</div>
                  <div className="text-[11px] text-zinc-400">{slot.range}</div>
                </div>
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = chosen === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => select(slot.id, n)}
                      aria-label={`${slot.label} rating ${n}`}
                      className={`flex h-11 items-center justify-center rounded-xl border-2 text-sm font-bold transition ${
                        active
                          ? "border-violet-600 bg-violet-50 text-violet-700"
                          : "border-zinc-200 text-zinc-400 hover:border-zinc-400"
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              {current ? (
                <div className="ml-[110px] mt-2 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const pct = current.percentages?.[String(n)] ?? 0;
                    return (
                      <div key={n} className="text-center">
                        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                          <div className="h-full bg-violet-500" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="mt-0.5 text-[10px] text-zinc-500">{pct}%</div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
