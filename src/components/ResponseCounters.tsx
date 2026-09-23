"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

type Counts = { form1: number; form2: number };

/**
 * Client-side response counters so the landing page is 100% static HTML.
 * The page renders instantly; numbers stream in a moment later.
 */
export default function ResponseCounters() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/counters", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data === "object") {
          setCounts({ form1: Number(data.form1) || 0, form2: Number(data.form2) || 0 });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 border-t border-zinc-100 px-5 py-8 sm:grid-cols-3">
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Form 01 responses
        </div>
        <div className="mt-1 text-3xl font-black text-zinc-900 tabular-nums">
          {counts ? counts.form1 : <span className="inline-block h-8 w-12 animate-pulse rounded bg-zinc-200 align-middle" />}
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Form 02 responses
        </div>
        <div className="mt-1 text-3xl font-black text-zinc-900 tabular-nums">
          {counts ? counts.form2 : <span className="inline-block h-8 w-12 animate-pulse rounded bg-zinc-200 align-middle" />}
        </div>
      </div>
      <Link
        href="/results/form2"
        className="flex flex-col justify-center rounded-2xl border border-violet-200 bg-violet-50 p-4 transition hover:border-violet-400"
      >
        <div className="text-[11px] font-bold uppercase tracking-wider text-violet-500">Explore</div>
        <div className="mt-1 flex items-center gap-1.5 text-sm font-black text-violet-800">
          Time-slot rankings <ArrowRight className="h-4 w-4" />
        </div>
      </Link>
    </div>
  );
}
