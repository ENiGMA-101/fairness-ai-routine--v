"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const refresh = () => { if (!document.hidden) router.refresh(); };
    const timer = window.setInterval(refresh, 15_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);

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
