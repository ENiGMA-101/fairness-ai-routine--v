import type { Distribution, RatingSummary } from "@/lib/results";

export function BarRow({ row, highlight }: { row: Distribution["rows"][number]; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[54%] shrink-0 text-[13px] leading-snug text-zinc-700">{row.label}</div>
      <div className="h-7 flex-1 overflow-hidden rounded-lg bg-zinc-100">
        <div
          className={`flex h-full items-center justify-end rounded-lg pr-2 text-[11px] font-bold text-white transition-all duration-700 ${
            highlight ? "bg-violet-600" : "bg-zinc-500"
          }`}
          style={{ width: `${Math.max(row.percent, 6)}%` }}
        >
          {row.percent > 9 ? `${row.percent}%` : ""}
        </div>
      </div>
      <div className="w-16 shrink-0 text-right text-[11px] text-zinc-500">{row.count} votes</div>
    </div>
  );
}

export function DistributionCard({ dist }: { dist: Distribution }) {
  if (!dist.rows.length) {
    return (
      <div className="rounded-[20px] border border-dashed border-zinc-300 bg-white p-5 text-sm text-zinc-400">
        No answers yet
      </div>
    );
  }
  const top = dist.rows[0];
  return (
    <div className="rounded-[20px] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold leading-snug text-zinc-900">{dist.title}</div>
          {dist.titleEn ? <div className="text-xs text-zinc-400">{dist.titleEn}</div> : null}
        </div>
        <div className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-600">
          n = {dist.total}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {dist.rows.map((row, i) => (
          <BarRow key={row.value} row={row} highlight={i === 0} />
        ))}
      </div>
      {top ? (
        <div className="mt-3 text-xs text-zinc-500">
          Leading: <span className="font-semibold text-zinc-800">{top.label}</span> ({top.percent}%)
        </div>
      ) : null}
    </div>
  );
}

export function RatingCard({ summary }: { summary: RatingSummary }) {
  const tone =
    summary.average >= 4
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : summary.average >= 3
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-red-50 text-red-700 border-red-200";
  return (
    <div className="rounded-[20px] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold text-zinc-900">{summary.label}</div>
          {summary.range ? <div className="text-xs text-zinc-400">{summary.range}</div> : null}
        </div>
        <div className={`shrink-0 rounded-xl border px-3 py-1.5 text-sm font-bold ${tone}`}>
          ★ {summary.average.toFixed(2)}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {summary.distribution.map((row, i) => (
          <BarRow key={row.value} row={row} highlight={i === 0} />
        ))}
      </div>
    </div>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-zinc-400">{label}</div>
      <div className="mt-1 text-2xl font-black text-zinc-900">{value}</div>
      {hint ? <div className="text-xs text-zinc-500">{hint}</div> : null}
    </div>
  );
}
