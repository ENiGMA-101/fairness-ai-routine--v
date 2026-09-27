"use client";

import { useState, type ReactNode } from "react";
import { Check, Sparkles } from "lucide-react";
import type { Option } from "@/lib/survey";
import type { PollStats } from "@/lib/poll-stats-client";

type PollCardProps = {
  form: "form1" | "form2";
  questionId: string;
  title: string;
  subtitle?: string;
  options: readonly Option[];
  value?: string | null;
  onChange: (value: string) => void;
  visual?: ReactNode;
  index?: number;
  initialStats?: PollStats | null;
  statsStatus?: "loading" | "ready" | "error";
  invalid?: boolean;
};

export default function PollCard({
  questionId,
  title,
  subtitle,
  options,
  value,
  onChange,
  visual,
  index,
  initialStats,
  statsStatus = "loading",
  invalid = false,
}: PollCardProps) {
  // Only a click in this question reveals its results. The parent supplies the
  // session's shuffled options, never a popularity-sorted list.
  const [clicked, setClicked] = useState(false);
  const stats = initialStats ?? null;
  const showResults = clicked && stats !== null;

  function select(option: Option) {
    onChange(option.value);
    setClicked(true); // local selection is immediate; no request is made here
  }

  return (
    <section
      id={`question-${questionId}`}
      tabIndex={-1}
      data-invalid={invalid ? "true" : undefined}
      className={`survey-card mb-5 min-w-0 scroll-mt-32 rounded-[24px] border bg-white p-4 shadow-[0_12px_36px_-28px_rgba(38,48,84,.42)] outline-none transition-shadow focus-visible:ring-4 focus-visible:ring-violet-300 sm:mb-6 sm:rounded-[26px] sm:p-7 dark:bg-[#18233b] ${invalid ? "border-rose-400 ring-2 ring-rose-300 dark:border-rose-400" : "border-slate-200 dark:border-slate-700"}`}
    >
      {visual && <div className="survey-visual mb-5 max-w-full overflow-hidden">{visual}</div>}
      <div className="flex min-w-0 items-start gap-3">
        {index !== undefined && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">{index}</span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-[16px] font-bold leading-snug text-slate-900 sm:text-[18px] dark:text-slate-50">{title} <span className="text-rose-500" aria-label="Required">*</span></h3>
          {subtitle && <p className="mt-1 break-words text-sm leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5 space-y-3" role="group" aria-label={subtitle ?? title}>
        {options.map((option) => {
          const selected = value === option.value;
          const percent = stats?.percentages?.[option.value] ?? 0;
          const count = stats?.counts?.[option.value] ?? 0;
          return (
            <button
              key={option.value}
              data-option-value={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => select(option)}
              className={`group block min-h-[66px] w-full touch-manipulation rounded-2xl border-2 px-4 py-3.5 text-left outline-none transition-colors focus-visible:ring-4 focus-visible:ring-violet-300 sm:min-h-[68px] sm:px-5 dark:focus-visible:ring-violet-500/40 ${selected
                ? "border-violet-500 bg-violet-50 text-slate-950 ring-[3px] ring-violet-500/10 dark:border-violet-400 dark:bg-violet-500/15 dark:text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/40 dark:border-slate-600 dark:bg-[#1e2c47] dark:text-slate-200 dark:hover:border-violet-400 dark:hover:bg-violet-500/10"}`}
            >
              <span className="flex min-w-0 items-start gap-3">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected
                  ? "border-violet-600 bg-violet-600 text-white dark:border-violet-400 dark:bg-violet-400 dark:text-slate-950"
                  : "border-slate-300 bg-white dark:border-slate-500 dark:bg-slate-800"}`}>
                  {selected && <Check className="h-3 w-3 stroke-[3]" />}
                </span>
                <span className={`min-w-0 flex-1 break-words text-[15px] leading-relaxed sm:text-[16px] ${selected ? "font-semibold" : "font-medium"}`}>{option.label}</span>
              </span>
              {showResults && (
                <span className="mt-3 block pl-8" data-poll-result={option.value} aria-live="polite">
                  <span className="flex flex-wrap items-center justify-between gap-x-2 text-xs font-semibold sm:text-sm">
                    <span className="text-slate-600 dark:text-slate-300">{count} vote{count === 1 ? "" : "s"}</span>
                    <span className={selected ? "text-violet-700 dark:text-violet-200" : "text-sky-700 dark:text-sky-200"}>{percent}%</span>
                  </span>
                  <span className="mt-1.5 block h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600" role="img" aria-label={`${option.label}: ${percent}% of ${stats.total} responses`}>
                    <span className={`block h-full rounded-full transition-[width] duration-300 ${selected ? "bg-gradient-to-r from-violet-600 to-fuchsia-500" : "bg-gradient-to-r from-sky-500 to-indigo-400"}`} style={{ width: `${percent}%` }} />
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-4 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400" aria-live="polite">
        {showResults ? (
          <><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" /> All options · {stats.total} submitted response{stats.total === 1 ? "" : "s"}. Your choice counts only after Submit.</>
        ) : clicked ? (
          <><span className="mt-0.5 h-3 w-3 shrink-0 animate-pulse rounded-full bg-violet-300" /> {statsStatus === "error" ? "Results unavailable right now; your selection is saved on this page." : "Fetching community results… your selection is ready."}</>
        ) : (
          <><Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-500" /> Choose one option to reveal this question&apos;s results</>
        )}
      </p>
    </section>
  );
}
