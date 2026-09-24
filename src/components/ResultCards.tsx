import type { ReactNode } from "react";
import type { Distribution, RatingSummary } from "@/lib/results";
import { Sparkles, Star } from "lucide-react";

export function BarRow({
  row,
  highlight,
}: {
  row: Distribution["rows"][number];
  highlight?: boolean;
  total?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-3 text-xs">
        <span className={`min-w-0 font-medium leading-relaxed ${highlight ? "font-semibold text-violet-800 dark:text-violet-200" : "text-slate-600 dark:text-slate-300"}`}>{row.label}</span>
        <span className="shrink-0 font-bold tabular-nums text-slate-900 dark:text-slate-100">{row.percent}% <span className="font-normal text-slate-400 dark:text-slate-500">· {row.count}</span></span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/90" role="img" aria-label={`${row.label}: ${row.percent} percent`}>
        <div className={`h-full rounded-full transition-[width] duration-500 ${highlight ? "bg-gradient-to-r from-violet-600 to-fuchsia-500" : "bg-gradient-to-r from-sky-400 to-indigo-400 dark:from-sky-500 dark:to-indigo-500"}`} style={{ width: `${Math.max(row.percent, 2)}%` }} />
      </div>
    </div>
  );
}

export function DistributionCard({ dist }: { dist: Distribution }) {
  if (!dist.rows.length) return null;
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_32px_-26px_rgba(24,37,77,.38)] sm:p-6 dark:border-slate-700 dark:bg-[#18243b]">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-700">
        <div>
          <h3 className="text-sm font-bold leading-relaxed text-slate-900 dark:text-white">{dist.title}</h3>
          {dist.titleEn && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{dist.titleEn}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-800 dark:bg-violet-500/20 dark:text-violet-200">n={dist.total}</span>
      </div>
      <div className="mt-4 space-y-4">{dist.rows.map((row, index) => <BarRow key={row.value} row={row} highlight={index === 0} />)}</div>
      {dist.rows.length > 1 && <p className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400"><Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-500" /> Leading response · <strong className="font-semibold text-violet-700 dark:text-violet-200">{dist.rows[0].percent}%</strong></p>}
    </article>
  );
}

export function RatingCard({ summary }: { summary: RatingSummary }) {
  const mood = summary.average >= 3.8
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200"
    : summary.average >= 2.8
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200"
      : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200";
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_32px_-26px_rgba(24,37,77,.38)] sm:p-6 dark:border-slate-700 dark:bg-[#18243b]">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-700">
        <div><h3 className="text-sm font-bold text-slate-900 dark:text-white">{summary.label}</h3>{summary.range && <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{summary.range}</p>}</div>
        <span className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-sm font-black tabular-nums ${mood}`}><Star className="h-3.5 w-3.5 fill-current" />{summary.average.toFixed(2)}</span>
      </div>
      <div className="mt-4 space-y-3">
        {[1, 2, 3, 4, 5].map((n) => {
          const row = summary.distribution.find((item) => item.value === String(n));
          const percent = row?.percent ?? 0;
          return <div key={n} className="flex items-center gap-2.5 text-xs"><span className="w-7 font-semibold text-slate-500 dark:text-slate-400">{n} ★</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/90"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500" style={{ width: `${percent}%` }} /></div><span className="w-10 text-right font-bold tabular-nums text-slate-700 dark:text-slate-200">{percent}%</span></div>;
        })}
      </div>
    </article>
  );
}

export function StatTile({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#18243b]">
      <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-black uppercase tracking-[.14em] text-slate-500 dark:text-slate-400">{label}</span>{icon && <span className="text-violet-500">{icon}</span>}</div>
      <div className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</div>
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}
