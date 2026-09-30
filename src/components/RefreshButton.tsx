"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        setBusy(true);
        router.refresh();
        setTimeout(() => setBusy(false), 600);
      }}
      className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-zinc-500"
    >
      {busy ? "Refreshing…" : "↻ Refresh"}
    </button>
  );
}
