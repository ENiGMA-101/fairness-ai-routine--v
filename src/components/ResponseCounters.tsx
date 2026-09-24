"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, BarChart3, UsersRound, Clock3 } from "lucide-react";

type Counts = { form1: number; form2: number };

/** Live counters hydrate separately so they never slow navigation to Home. */
export default function ResponseCounters() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let active = true;
    void fetch("/api/counters", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && data && typeof data === "object") {
          setCounts({ form1: Number(data.form1) || 0, form2: Number(data.form2) || 0 });
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const number = (value: number | undefined) =>
    value === undefined
      ? <span className="inline-block h-7 w-10 animate-pulse rounded-md bg-slate-200 align-middle dark:bg-slate-600" aria-label="Loading" />
      : value.toLocaleString();

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-5 sm:px-7 md:grid-cols-[1fr_1fr_1.5fr]">
      <div className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/65 p-3.5 dark:border-violet-500/25 dark:bg-violet-500/10">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200"><UsersRound className="h-5 w-5" /></span>
        <span><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Preference survey</span><span className="mt-0.5 block text-xl font-black text-slate-950 dark:text-white" aria-live="polite">{number(counts?.form1)} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">responses</span></span></span>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/75 p-3.5 dark:border-sky-500/25 dark:bg-sky-500/10">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200"><Clock3 className="h-5 w-5" /></span>
        <span><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Time-slot ratings</span><span className="mt-0.5 block text-xl font-black text-slate-950 dark:text-white" aria-live="polite">{number(counts?.form2)} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">responses</span></span></span>
      </div>
      <Link href="/results/form2" className="col-span-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 transition hover:border-violet-400 dark:border-slate-700 dark:bg-[#18243b] dark:hover:border-violet-400 md:col-span-1">
        <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"><BarChart3 className="h-5 w-5" /></span><span><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Explore insights</span><span className="text-sm font-black text-slate-900 dark:text-white">View time-slot rankings</span></span></span>
        <ArrowUpRight className="h-4 w-4 text-violet-600 dark:text-violet-300" />
      </Link>
    </div>
  );
}
