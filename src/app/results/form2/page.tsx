import Link from "next/link";
import RefreshButton from "@/components/RefreshButton";
import { BarRow, RatingCard, StatTile } from "@/components/ResultCards";
import { getForm2Results, type Form2Results } from "@/lib/results";
import { cachedValue } from "@/lib/stats-cache";

export const revalidate = 30;

export default async function Form2ResultsPage() {
  let data: Form2Results | null = null;
  let error = "";
  try {
    data = await cachedValue("form2-results", 30_000, getForm2Results);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load results";
  }

  const sorted = data ? [...data.slots].sort((a, b) => b.average - a.average) : [];

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-sm font-semibold text-zinc-600 hover:text-black">
          ← Home
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/results/form1"
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-500"
          >
            Form 1 results →
          </Link>
          <RefreshButton />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Form 2 — live results</h1>
          <p className="mt-1 text-zinc-600">
            Time-slot rating survey. Average score per slot (1 = hate it, 5 = love it).
          </p>
        </div>
        {data?.isFallback && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            ✔ Zero-Config Storage Active
          </span>
        )}
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {data ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <StatTile label="Total responses" value={String(data.totalResponses)} />
            <StatTile label="Students" value={String(data.students)} />
            <StatTile label="Teachers" value={String(data.teachers)} />
            <StatTile
              label="Most liked slot"
              value={data.bestSlot && data.totalResponses ? data.bestSlot.label : "—"}
              hint={
                data.bestSlot && data.totalResponses
                  ? `avg ${data.bestSlot.average.toFixed(2)}`
                  : undefined
              }
            />
          </div>

          {data.totalResponses === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
              No responses yet.{" "}
              <Link href="/form2" className="font-semibold text-violet-700">
                Be the first to rate the time slots →
              </Link>
            </div>
          ) : (
            <>
              <section className="mt-8 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">Slot ranking (highest → lowest)</h2>
                <div className="mt-4 space-y-3">
                  {sorted.map((slot, i) => {
                    const width = Math.round((slot.average / 5) * 100);
                    const tone =
                      slot.average >= 4
                        ? "bg-emerald-500"
                        : slot.average >= 3
                          ? "bg-amber-400"
                          : "bg-red-400";
                    return (
                      <div key={slot.id} className="flex items-center gap-3">
                        <div className="w-8 text-xs text-zinc-400">#{i + 1}</div>
                        <div className="w-28 shrink-0 text-sm font-semibold">{slot.label}</div>
                        <div className="h-7 flex-1 overflow-hidden rounded-lg bg-zinc-100">
                          <div
                            className={`flex h-full items-center justify-end rounded-lg pr-2 text-[11px] font-bold text-white transition-all duration-700 ${tone}`}
                            style={{ width: `${Math.max(width, 8)}%` }}
                          >
                            {slot.average.toFixed(2)}
                          </div>
                        </div>
                        <div className="w-14 text-right text-[11px] text-zinc-500">
                          n={slot.total}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {data.worstSlot ? (
                  <p className="mt-4 text-xs text-zinc-500">
                    Least preferred slot: <b>{data.worstSlot.label}</b> (avg{" "}
                    {data.worstSlot.average.toFixed(2)}) — a strong candidate for reduced allocation.
                  </p>
                ) : null}
              </section>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {data.slots.map((slot) => (
                  <RatingCard key={slot.id} summary={slot} />
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <RatingCard summary={data.longGap} />
                <RatingCard summary={data.fairness} />
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[20px] border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="text-[15px] font-semibold">Role split</div>
                  <div className="mt-4 space-y-2">
                    {data.roleSplit.rows.map((row) => (
                      <BarRow key={row.value} row={row} />
                    ))}
                  </div>
                </div>
                <div className="rounded-[20px] border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="text-[15px] font-semibold">Department split</div>
                  <div className="mt-4 space-y-2">
                    {data.departmentSplit.rows.map((row) => (
                      <BarRow key={row.value} row={row} />
                    ))}
                  </div>
                </div>
              </div>

              <section className="mt-4 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">Additional feedback &amp; constraints</h2>
                {data.feedback.length === 0 ? (
                  <p className="mt-3 text-sm text-zinc-500">No written feedback yet.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {data.feedback.map((item, i) => (
                      <li key={i} className="rounded-2xl bg-zinc-50 p-4">
                        <div className="text-[11px] uppercase tracking-wide text-zinc-400">
                          {item.role} • {item.department}
                        </div>
                        <div className="mt-1 text-sm leading-relaxed text-zinc-700">{item.text}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </>
      ) : null}
    </main>
  );
}
