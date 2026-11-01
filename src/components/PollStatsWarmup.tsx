"use client";

import { useEffect } from "react";
import { preloadPollStats } from "@/lib/poll-stats-client";

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/**
 * Warm the aggregate poll snapshots so Form 1 / Form 2 open with results ready.
 * This is strictly optional background work, so it:
 *  - waits for the page's own load event (never competes with JS/CSS/poster),
 *  - then waits for an idle moment,
 *  - fetches the two forms one after the other (each is a full-table read),
 *  - is skipped entirely on Data Saver / 2G connections.
 * Both calls are deduplicated and cached by `preloadPollStats`.
 */
export default function PollStatsWarmup() {
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return;

    let cancelled = false;
    let cancelIdle = () => {};
    const run = () => {
      if (cancelled || document.hidden) return;
      void preloadPollStats("form1")
        .catch(() => {})
        .then(() => (cancelled ? undefined : preloadPollStats("form2").catch(() => {})));
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(run, { timeout: 4000 });
        cancelIdle = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(run, 1500);
        cancelIdle = () => window.clearTimeout(id);
      }
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      cancelIdle();
      window.removeEventListener("load", schedule);
    };
  }, []);
  return null;
}
