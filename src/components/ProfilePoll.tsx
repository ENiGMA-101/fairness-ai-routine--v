"use client";

import { useState, type ReactNode } from "react";
import { BriefcaseBusiness, Building2, GraduationCap } from "lucide-react";
import type { Option } from "@/lib/survey";
import type { PollStats } from "@/lib/poll-stats-client";

type Props = {
  id: "role" | "department";
  title: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
  stats?: PollStats | null;
  status?: "loading" | "ready" | "error";
  invalid?: boolean;
  children?: ReactNode;
};

export default function ProfilePoll({
  id, title, options, value, onChange, stats, status = "loading", invalid = false, children,
}: Props) {
  const [clicked, setClicked] = useState(false);
  const showResults = clicked && !!stats;
  return (
    <section
      id={`question-${id}`}
      tabIndex={-1}
      data-invalid={invalid ? "true" : undefined}
      className={`survey-card mb-5 min-w-0 scroll-mt-32 rounded-[24px] border bg-white p-4 shadow-sm outline-none focus-visible:ring-4 focus-visible:ring-violet-300 sm:mb-6 sm:rounded-[28px] sm:p-7 dark:bg-[#18233b] ${invalid ? "border-rose-400 ring-2 ring-rose-300 dark:border-rose-400" : "border-slate-200 dark:border-slate-700"}`}
    >
      <h2 className="text-[17px] font-bold leading-snug text-slate-900 dark:text-white sm:text-[18px]">{title} <span className="text-rose-500" aria-label="Required">*</span></h2>
      <div className={`mt-4 grid min-w-0 gap-2.5 sm:gap-3 ${id === "role" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`} role="group" aria-label={title}>
        {options.map((option) => {
          const selected = value === option.value;
          const count = stats?.counts?.[option.value] ?? 0;
          const percent = stats?.percentages?.[option.value] ?? 0;
          return (
            <button
              key={option.value}
              data-profile-option={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => { onChange(option.value); setClicked(true); }}
              className={`min-w-0 touch-manipulation rounded-2xl border-2 p-3 text-left outline-none transition-colors focus-visible:ring-4 focus-visible:ring-violet-300 sm:p-4 dark:focus-visible:ring-violet-500/40 ${id === "role" ? "min-h-[108px]" : "min-h-[64px]"} ${selected
                ? "border-violet-500 bg-violet-50 font-semibold text-slate-950 ring-2 ring-violet-500/10 dark:border-violet-400 dark:bg-violet-500/15 dark:text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 dark:border-slate-600 dark:bg-[#1e2c47] dark:text-slate-200 dark:hover:border-violet-400"}`}
            >
              <span className={`flex min-w-0 items-center gap-2 ${id === "role" ? "flex-col justify-center text-center" : ""}`}>
                <span className={`flex shrink-0 items-center justify-center rounded-xl ${id === "role" ? "h-10 w-10" : "h-7 w-7"} ${selected ? "bg-violet-600 text-white dark:bg-violet-400 dark:text-slate-950" : "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-200"}`}>
                  {id === "role"
                    ? option.value === "Student" ? <GraduationCap className="h-5 w-5" /> : <BriefcaseBusiness className="h-5 w-5" />
                    : <Building2 className="h-4 w-4" />}
                </span>
                <span className="min-w-0 break-words text-[14px] leading-snug sm:text-[16px]">{option.label}</span>
              </span>
              {showResults && (
                <span data-profile-result={option.value} className="mt-3 block" aria-live="polite">
                  <span className="flex flex-wrap items-center justify-between gap-x-1 text-[11px] leading-tight sm:text-xs">
                    <span className="text-slate-600 dark:text-slate-300">{count} vote{count === 1 ? "" : "s"}</span>
                    <span className="font-bold text-violet-700 dark:text-violet-200">{percent}%</span>
                  </span>
                  <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                    <span className={`block h-full rounded-full ${selected ? "bg-violet-600 dark:bg-violet-400" : "bg-sky-500"}`} style={{ width: `${percent}%` }} />
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {children}
      <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400" aria-live="polite">
        {showResults ? `${stats.total} submitted response${stats.total === 1 ? "" : "s"} · Your choice counts only after Submit.`
          : clicked ? status === "error" ? "Results are temporarily unavailable; your choice remains selected." : "Loading community results…"
            : "Select an option to see live community results."}
      </p>
    </section>
  );
}
