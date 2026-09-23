import type { Distribution, RatingSummary } from "@/lib/results";
import { Award, Star, TrendingUp, Users } from "lucide-react";

export function BarRow({
  row,
  highlight,
  total,
}: {
  row: Distribution["rows"][number];
  highlight?: boolean;
  total?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className={highlight ? "text-violet-950 font-bold" : "text-zinc-700"}>
          {row.label}
        </span>
        <span className="text-zinc-500">
          <b className="text-zinc-900">{row.percent}%</b> ({row.count} votes)
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 border border-zinc-200/50">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            highlight
              ? "bg-gradient-to-r from-violet-500 to-indigo-600 shadow-sm"
              : "bg-zinc-400"
          }`}
          style={{ width: `${Math.max(row.percent, 3)}%` }}
        />
      </div>
    </div>
  );
}

export function DistributionCard({ dist }: { dist: Distribution }) {
  if (!dist.rows.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-400">
        No answers yet
      </div>
    );
  }
  const top = dist.rows[0];
  return (
    <div className="rounded-[28px] border border-zinc-200/80 bg-white p-6 md:p-7 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
        <div>
          <h3 className="text-[16px] font-bold leading-snug text-zinc-900">{dist.title}</h3>
          {dist.titleEn ? (
            <p className="mt-0.5 text-xs font-medium text-zinc-500">{dist.titleEn}</p>
          ) : null}
        </div>
        <div className="shrink-0 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 border border-violet-100">
          n = {dist.total}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {dist.rows.map((row, i) => (
          <BarRow key={row.value} row={row} highlight={i === 0} total={dist.total} />
        ))}
      </div>
      {top && dist.rows.length > 1 ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-violet-50/60 p-2.5 text-xs text-violet-900 border border-violet-100">
          <TrendingUp className="h-4 w-4 text-violet-600 shrink-0" />
          <span>
            Leading Choice: <b>{top.label}</b> with <b>{top.percent}%</b>
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function RatingCard({ summary }: { summary: RatingSummary }) {
  const tone =
    summary.average >= 3.8
      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
      : summary.average >= 2.8
        ? "bg-amber-50 text-amber-700 border-amber-300"
        : "bg-red-50 text-red-700 border-red-300";

  return (
    <div className="rounded-[28px] border border-zinc-200/80 bg-white p-6 md:p-7 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
        <div>
          <div className="text-[16px] font-bold text-zinc-900">{summary.label}</div>
          {summary.range ? (
            <div className="text-xs font-medium text-zinc-400">{summary.range}</div>
          ) : null}
        </div>
        <div className={`shrink-0 flex items-center gap-1 rounded-2xl border px-3 py-1.5 text-sm font-black ${tone}`}>
          <Star className="h-4 w-4 fill-current" />
          {summary.average.toFixed(2)}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {summary.distribution.map((row) => (
          <div key={row.value} className="flex items-center gap-2 text-xs">
            <span className="w-12 font-bold text-zinc-600">{row.value} ★</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-violet-600 transition-all duration-500"
                style={{ width: `${row.percent}%` }}
              />
            </div>
            <span className="w-14 text-right font-semibold text-zinc-700">
              {row.percent}% ({row.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</span>
        {icon ? <span className="text-zinc-400">{icon}</span> : null}
      </div>
      <div className="mt-2 text-3xl font-black tracking-tight text-zinc-900">{value}</div>
      {hint ? <div className="mt-1 text-xs font-medium text-zinc-500">{hint}</div> : null}
    </div>
  );
}
