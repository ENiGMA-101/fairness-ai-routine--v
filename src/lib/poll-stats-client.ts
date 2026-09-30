"use client";

import { useEffect, useState } from "react";
import type { PollStats, PollStatsMap } from "@/lib/poll-stats";

export type { PollStats, PollStatsMap };
export type SurveyForm = "form1" | "form2";

type Snapshot = { data: PollStatsMap; fetchedAt: number };

// Live polling cadence. Stats refresh from the database this often so results
// submitted by anyone appear without a manual page refresh.
const POLL_INTERVAL_MS = 6000;
// A cached snapshot younger than this is reused for the instant first paint;
// the polling loop always fetches fresh data regardless.
const FRESH_FOR = 4000;
const SESSION_MAX_AGE = 5 * 60_000;

const snapshots: Partial<Record<SurveyForm, Snapshot>> = {};
const pending: Partial<Record<SurveyForm, Promise<PollStatsMap>>> = {};

function sessionKey(form: SurveyForm) {
  return `fairness-poll-stats:${form}`;
}

/** Only anonymous, aggregate counts are cached; no respondent answers or IDs. */
export function getPollStatsSnapshot(form: SurveyForm): PollStatsMap | null {
  if (typeof window === "undefined") return null;
  let snapshot = snapshots[form];
  if (!snapshot) {
    try {
      const stored = window.sessionStorage.getItem(sessionKey(form));
      if (stored) {
        const parsed = JSON.parse(stored) as Snapshot;
        if (parsed?.data && typeof parsed.fetchedAt === "number") {
          snapshot = parsed;
          snapshots[form] = parsed;
        }
      }
    } catch {
      // Storage can be disabled; the form still fetches from the API.
    }
  }
  return snapshot && Date.now() - snapshot.fetchedAt < SESSION_MAX_AGE ? snapshot.data : null;
}

/** Deduplicated one-request fetch for the entire survey, not one per option. */
export function preloadPollStats(form: SurveyForm, refresh = false): Promise<PollStatsMap> {
  const snapshot = getPollStatsSnapshot(form);
  if (!refresh && snapshot && snapshots[form] && Date.now() - snapshots[form]!.fetchedAt < FRESH_FOR) {
    return Promise.resolve(snapshot);
  }
  if (pending[form]) return pending[form];

  const request = fetch(`/api/${form}/stats/all`, { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) throw new Error("Poll statistics are unavailable");
      const data: unknown = await response.json();
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid poll statistics");
      const map = data as PollStatsMap;
      const next: Snapshot = { data: map, fetchedAt: Date.now() };
      snapshots[form] = next;
      try { window.sessionStorage.setItem(sessionKey(form), JSON.stringify(next)); } catch { /* private mode */ }
      return map;
    })
    .finally(() => { delete pending[form]; });

  pending[form] = request;
  return request;
}

/**
 * Live poll stats for a survey. Paints the cached snapshot instantly, then keeps
 * the newest database stats in state on every poll so the UI always reflects the
 * latest submitted responses.
 */
export function useSurveyPollStats(form: SurveyForm) {
  const [stats, setStats] = useState<PollStatsMap>({});
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    const cached = getPollStatsSnapshot(form);
    if (cached) {
      queueMicrotask(() => {
        if (!active) return;
        setStats(cached);
        setStatus("ready");
      });
    }

    const update = (refresh: boolean) => {
      void preloadPollStats(form, refresh)
        .then((latest) => {
          if (!active) return;
          setStats(latest); // always replace with the newest snapshot
          setStatus("ready");
        })
        .catch(() => {
          if (active && !getPollStatsSnapshot(form)) setStatus("error");
        });
    };

    update(false);
    const timer = window.setInterval(() => {
      if (!document.hidden) update(true);
    }, POLL_INTERVAL_MS);

    // Refresh immediately when the tab regains focus.
    const onVisible = () => {
      if (!document.hidden) update(true);
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [form]);

  return { stats, status };
}
