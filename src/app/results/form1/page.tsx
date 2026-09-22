import Link from "next/link";
import RefreshButton from "@/components/RefreshButton";
import { DistributionCard, StatTile } from "@/components/ResultCards";
import { getForm1Results, type Form1Results } from "@/lib/results";

export const dynamic = "force-dynamic";

export default async function Form1ResultsPage() {
  let data: Form1Results | null = null;
  let error = "";
  try {
    data = await getForm1Results();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load results";
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-sm font-semibold text-zinc-600">
          ← Home
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/results/form2"
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700"
          >
            Form 2 results →
          </Link>
          <RefreshButton />
        </div>
      </div>

      <h1 className="mt-6 text-3xl font-black">Form 1 — live results</h1>
      <p className="mt-2 text-zinc-600">
        Student &amp; teacher preference survey. Bars update as new responses arrive.
      </p>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Could not read from the database: {error}
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
