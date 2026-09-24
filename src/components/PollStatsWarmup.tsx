"use client";

import { useEffect } from "react";
import { preloadPollStats } from "@/lib/poll-stats-client";

/**
 * Fetch aggregate-only poll snapshots after the landing page paints. The requests
 * never block Home or navigation, and both forms can reuse the cached response.
 */
export default function PollStatsWarmup() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void preloadPollStats("form1").catch(() => {});
      void preloadPollStats("form2").catch(() => {});
    }, 100);
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}
