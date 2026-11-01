"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/** Busy state is tied to the real router refresh (not a fake timer), so it can't stick or lie. */
export default function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      aria-busy={pending}
      className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-zinc-500 active:bg-zinc-100 disabled:cursor-wait disabled:opacity-80"
    >
      {pending ? <><span className="btn-spinner" aria-hidden="true" />Refreshing…</> : "↻ Refresh"}
    </button>
  );
}
