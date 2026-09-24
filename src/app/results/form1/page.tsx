import Link from "next/link";
import HomeButton from "@/components/HomeButton";
import RefreshButton from "@/components/RefreshButton";
import { DistributionCard, StatTile } from "@/components/ResultCards";
import { getForm1Results, type Form1Results } from "@/lib/results";
import { cachedValue } from "@/lib/stats-cache";

export const revalidate = 30;

export default async function Form1ResultsPage() {
  let data: Form1Results | null = null;
  let error = "";
  try {
    data = await cachedValue("form1-results", 30_000, getForm1Results);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load results";
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <HomeButton />
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/results/form2"
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-500"
          >
            Form 2 results →
          </Link>
          <RefreshButton />
        </div>
      </div>

      <div className="mt-7 rounded-[26px] border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-6 sm:p-8 dark:border-violet-500/30 dark:from-[#29254b] dark:via-[#18243b] dark:to-[#183449]">
        <span className="text-[10px] font-black uppercase tracking-[.18em] text-violet-700 dark:text-violet-200">Research insights · Form 01</span>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Student &amp; teacher preferences</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">See how submitted answers balance class times, gaps, lab load and fair choices. Questions stay in the original survey order here.</p>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {data ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatTile label="Total responses" value={String(data.totalResponses)} />
            <StatTile label="Students" value={String(data.students)} />
            <StatTile label="Teachers" value={String(data.teachers)} />
          </div>

          {data.totalResponses === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
              No responses yet.{" "}
              <Link href="/form1" className="font-semibold text-violet-700">
                Be the first to answer Form 1 →
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {data.distributions
                .filter((d) => d.total > 0)
                .map((dist) => (
                  <DistributionCard key={dist.id} dist={dist} />
                ))}
            </div>
          )}
        </>
      ) : null}
    </main>
  );
}
