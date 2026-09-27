"use client";

import { useEffect, useState } from "react";
import type { VoteStats } from "@/lib/poll-analytics";
import { SURVEY_VERSION } from "@/lib/survey";

export type PollStats = VoteStats;
export type PollStatsMap = Record<string, PollStats>;
export type SurveyForm = "form1" | "form2";

type Snapshot = { data: PollStatsMap; fetchedAt: number };

// Reuse the most recent aggregate snapshot for an immediate first click, then
// always fetch a fresh no-cache response on mount and on every polling tick.
const SESSION_MAX_AGE = 60_000;
const SNAPSHOT_REUSE_MS = 8_000;
export const POLL_REFRESH_MS = 5_000;
const snapshots: Partial<Record<SurveyForm, Snapshot>> = {};
const pending: Partial<Record<SurveyForm, Promise<PollStatsMap>>> = {};

function sessionKey(form: SurveyForm) {
  return `fairness-poll-stats:v${SURVEY_VERSION}:${form}`;
}

/** Anonymous aggregate counts only: no respondent answers or browser IDs. */
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
      // Browser storage may be disabled; live polling still works.
    }
  }
  return snapshot && Date.now() - snapshot.fetchedAt < SESSION_MAX_AGE ? snapshot.data : null;
}

/** Coalesce simultaneous requests for this form; never cache a refreshed response. */
export function preloadPollStats(form: SurveyForm, refresh = false): Promise<PollStatsMap> {
  const snapshot = getPollStatsSnapshot(form);
  if (!refresh && snapshot && snapshots[form] && Date.now() - snapshots[form].fetchedAt < SNAPSHOT_REUSE_MS) {
    return Promise.resolve(snapshot);
  }
  if (pending[form]) return pending[form];

  const request = fetch(`/api/${form}/stats/all`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Live poll results are temporarily unavailable");
      const data: unknown = await response.json();
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Invalid poll statistics");
      }
      const snapshot: Snapshot = { data: data as PollStatsMap, fetchedAt: Date.now() };
      snapshots[form] = snapshot;
      try {
        window.sessionStorage.setItem(sessionKey(form), JSON.stringify(snapshot));
      } catch {
        // Private browsing may disallow sessionStorage.
      }
      return snapshot.data;
    })
    .finally(() => { delete pending[form]; });

  pending[form] = request;
  return request;
}

/**
 * The survey updates whenever another browser submits: one fresh aggregate request
 * per visible form every 5s and immediately when this tab regains focus.
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

    const update = () => {
      void preloadPollStats(form, true)
        .then((latest) => {
          if (!active) return;
          // Always adopt the newest server response; never keep the older snapshot.
          setStats(latest);
          setStatus("ready");
        })
        .catch(() => {
          if (active) setStatus("error");
        });
    };

    update();
    const timer = window.setInterval(() => {
      if (!document.hidden) update();
    }, POLL_REFRESH_MS);
    const onFocus = () => { if (!document.hidden) update(); };
    const onVisibility = () => { if (!document.hidden) update(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [form]);

  return { stats, status };
}
