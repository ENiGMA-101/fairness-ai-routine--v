import Link from "next/link";
import { db } from "@/db";
import { form1Responses, form2Responses } from "@/db/schema";

export const dynamic = "force-dynamic";

async function getCounts() {
  try {
    const one = await db.select({ id: form1Responses.id }).from(form1Responses);
    const two = await db.select({ id: form2Responses.id }).from(form2Responses);
    return { form1: one.length, form2: two.length, ok: true as const };
  } catch {
    return { form1: 0, form2: 0, ok: false as const };
  }
}

export default async function Home() {
  const counts = await getCounts();

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="flex items-center justify-between">
        <div className="text-sm font-black tracking-tight sm:text-base">
          UAP • Fairness-Aware AI Routine Generator
        </div>
        <div className="text-xs text-zinc-500 sm:text-sm">Research Survey 2025</div>
      </header>

      <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
            Fairness-Aware AI Routine Generator
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-600">
            Two anonymous research forms: a preference poll (students + teachers) and a time-slot
            rating survey. Every question is preserved exactly from the source PDFs, in Bangla with
            English support, on one scrollable page with live Facebook-style result bars.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm">
              ⏱ 2–3 minutes
            </span>
            <span className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm">
              🔒 Anonymous
            </span>
            <span className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm">
              🗳 Live results
            </span>
            <span className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm">
              ☝️ One vote per browser
            </span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="text-xs uppercase tracking-wide text-zinc-400">Form 1 responses</div>
              <div className="text-3xl font-black">{counts.form1}</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="text-xs uppercase tracking-wide text-zinc-400">Form 2 responses</div>
              <div className="text-3xl font-black">{counts.form2}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/form1"
            className="block rounded-[28px] border border-zinc-200 bg-white p-8 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <div className="text-sm font-bold text-violet-600">FORM 1</div>
            <h2 className="mt-1 text-2xl font-bold">Student &amp; Teacher Survey</h2>
            <p className="mt-2 text-zinc-500">
              11 student questions + 7 teacher questions, with visual illustrations for every
              trade-off. Exact wording from the PDFs.
            </p>
            <div className="mt-5 inline-block rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">
              Start survey →
            </div>
          </Link>

          <Link
            href="/form2"
            className="block rounded-[28px] bg-black p-8 shadow-xl transition hover:-translate-y-0.5 hover:bg-zinc-900"
          >
            <div className="text-sm font-bold text-violet-300">FORM 2</div>
            <h2 className="mt-1 text-2xl font-bold text-white">Time-Slot Rating Survey</h2>
            <p className="mt-2 text-zinc-400">
              Rate all 7 daily slots 1–5, then judge long gaps and multi-semester fairness, and add
              your own constraints.
            </p>
            <div className="mt-5 inline-block rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
              Start rating →
            </div>
          </Link>
        </div>
      </div>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <Link
          href="/results/form1"
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-400"
        >
          <div className="text-xs uppercase tracking-wide text-zinc-400">Dashboard</div>
          <div className="mt-1 font-bold">Form 1 live results</div>
          <p className="mt-1 text-sm text-zinc-500">Every question, distribution bars and leaders.</p>
        </Link>
        <Link
          href="/results/form2"
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-400"
        >
          <div className="text-xs uppercase tracking-wide text-zinc-400">Dashboard</div>
          <div className="mt-1 font-bold">Form 2 live results</div>
          <p className="mt-1 text-sm text-zinc-500">Average rating per slot, best/worst slot, feedback.</p>
        </Link>
        <a
          href="/fairness-app.zip"
          download
          className="rounded-2xl border border-violet-300 bg-violet-50 p-5 shadow-sm transition hover:border-violet-500"
        >
          <div className="text-xs uppercase tracking-wide text-violet-500">Deploy anywhere</div>
          <div className="mt-1 font-bold text-violet-800">⬇ Download Vercel-ready ZIP</div>
          <p className="mt-1 text-sm text-violet-700">
            Full source, schema SQL and step-by-step Vercel deploy guide.
          </p>
        </a>
      </section>

      <footer className="mt-12 border-t border-zinc-200 pt-6 text-xs text-zinc-400">
        Data is stored in PostgreSQL (Drizzle ORM). Duplicate protection: browser ID in localStorage +
        a unique database constraint. Built for the Fairness-Aware AI Routine Generator research
        project, University of Asia Pacific.
      </footer>
    </main>
  );
}
