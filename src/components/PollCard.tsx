"use client";

import { useState, type ReactNode } from "react";
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

  return { stats: cache, load };
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
}: PollCardProps) {
  const { stats, load } = useStats(form);
  const current = stats[questionId];

  const handle = (option: Option) => {
    onChange(option.value);
    void load(questionId);
  };

  return (
    <section className="mb-5 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
      {visual ? <div className="mb-4">{visual}</div> : null}
      <h3 className="text-[16px] font-semibold leading-snug text-zinc-900">
        {index ? <span className="text-violet-600">{index}. </span> : null}
        {title}
      </h3>
      {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}

      <div className="mt-4 space-y-3">
        {options.map((opt) => {
          const selected = value === opt.value;
          const pct = current?.percentages?.[opt.value] ?? 0;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handle(opt)}
              className={`relative w-full overflow-hidden rounded-2xl border-2 px-4 py-3.5 text-left transition ${
                selected
                  ? "border-violet-600 bg-violet-50"
                  : "border-zinc-200 bg-white hover:border-zinc-400"
              }`}
            >
              {current ? (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                    selected ? "bg-violet-200" : "bg-zinc-100"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              ) : null}
              <div className="relative flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? "border-violet-600 bg-violet-600" : "border-zinc-300"
                    }`}
                  >
                    {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                  </span>
                  <span className="text-[15px]">{opt.label}</span>
                </span>
                {current ? (
                  <span className="shrink-0 text-sm font-bold text-zinc-700">{pct}%</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {current ? (
        <div className="mt-3 text-xs text-zinc-400">
          {current.total} response{current.total === 1 ? "" : "s"} • live
        </div>
      ) : (
        <div className="mt-3 text-xs text-zinc-400">Percentages appear once you pick an option</div>
      )}
    </section>
  );
}
