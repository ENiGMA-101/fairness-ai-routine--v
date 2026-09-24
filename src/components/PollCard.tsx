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
  options: Option[];
  value?: string | null;
  onChange: (value: string) => void;
  visual?: ReactNode;
  index?: number;
  initialStats?: PollStats | null;
  statsStatus?: "loading" | "ready" | "error";
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
}: PollCardProps) {
  // Fixed position and result visibility are separate. Every poll card,
  // including semester, reveals ALL its options only after a local click.
  const [clickedQuestion, setClickedQuestion] = useState<string | null>(null);
  const clicked = clickedQuestion === questionId;
  const stats = initialStats ?? null;
  const showAllResults = clicked && stats !== null;
  const waiting = clicked && stats === null;

  function select(option: Option) {
    onChange(option.value);
    setClickedQuestion(questionId); // selection never makes a database request
  }

  return (
    <section
      id={`question-${questionId}`}
      className="survey-card mb-6 rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_-28px_rgba(38,48,84,0.42)] transition-shadow hover:shadow-[0_18px_42px_-28px_rgba(66,58,154,0.42)] sm:p-7 dark:border-slate-700 dark:bg-[#18233b]"
    >
      {visual && <div className="survey-visual mb-5">{visual}</div>}

      <div className="flex items-start gap-3">
        {index && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">{index}</span>
        )}
        <div>
          <h3 className="text-[16px] font-bold leading-snug text-slate-900 sm:text-[17px] dark:text-slate-50">{title}</h3>
          {subtitle && <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>

      <div className="mt-5 space-y-2.5" role="group" aria-label={subtitle ?? title}>
        {options.map((option) => {
          const selected = value === option.value;
          const percent = stats?.percentages?.[option.value] ?? 0;
          const count = stats?.counts?.[option.value] ?? 0;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => select(option)}
              className={`group relative flex min-h-[58px] w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border-[1.5px] px-4 py-3 text-left transition-all sm:px-5 ${
                selected
                  ? "border-violet-500 bg-violet-50 text-slate-950 ring-[3px] ring-violet-500/10 dark:border-violet-400 dark:bg-violet-500/15 dark:text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/40 dark:border-slate-600 dark:bg-[#1e2c47] dark:text-slate-200 dark:hover:border-violet-400 dark:hover:bg-violet-500/10"
              }`}
            >
              {showAllResults && (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-y-0 left-0 transition-[width] duration-300 ${selected ? "bg-violet-200/70 dark:bg-violet-500/25" : "bg-sky-100/90 dark:bg-sky-500/10"}`}
                  style={{ width: `${percent}%` }}
                />
              )}
              <span className="relative flex min-w-0 items-center gap-3">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-violet-600 bg-violet-600 text-white dark:border-violet-400 dark:bg-violet-400 dark:text-slate-950" : "border-slate-300 bg-white dark:border-slate-500 dark:bg-slate-800"}`}>
                  {selected && <Check className="h-3 w-3 stroke-[3]" />}
                </span>
                <span className={`text-sm leading-snug sm:text-[15px] ${selected ? "font-semibold" : "font-medium"}`}>{option.label}</span>
              </span>
              {showAllResults && (
                <span className="relative flex shrink-0 flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-2" data-poll-result={option.value}>
                  <span className="text-[10px] text-slate-500 dark:text-slate-300 sm:text-xs">{count} vote{count === 1 ? "" : "s"}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-black shadow-sm ${selected ? "bg-violet-600 text-white dark:bg-violet-400 dark:text-slate-950" : "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200"}`}>{percent}%</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
        {showAllResults ? (
          <><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" /> All options · {stats.total} submitted response{stats.total === 1 ? "" : "s"}. Your choice counts only after Submit.</>
        ) : waiting ? (
          <><span className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-violet-300" /> {statsStatus === "error" ? "Results unavailable right now. Your selection is saved on this page." : "Fetching community results… your selection is ready."}</>
        ) : (
          <><Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-500" /> Choose one option to reveal the whole question&apos;s results</>
        )}
      </p>
    </section>
  );
}
