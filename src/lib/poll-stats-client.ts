"use client";

import { useEffect, useState } from "react";

export type PollStats = {
  total: number;
  counts: Record<string, number>;
  percentages: Record<string, number>;
};

export type PollStatsMap = Record<
  string,
  PollStats
>;

export type SurveyForm =
  | "form1"
  | "form2";

type Snapshot = {
  data: PollStatsMap;
  fetchedAt: number;
};

const snapshots: Partial<
  Record<SurveyForm, Snapshot>
> = {};

const pending: Partial<
  Record<
    SurveyForm,
    Promise<PollStatsMap>
  >
> = {};

/*
 * Fetch the current database state.
 *
 * IMPORTANT:
 * No sessionStorage.
 * No 5-minute browser cache.
 */
export function getPollStatsSnapshot(
  form: SurveyForm,
): PollStatsMap | null {
  if (typeof window === "undefined") {
    return null;
  }

  return snapshots[form]?.data ?? null;
}

export function preloadPollStats(
  form: SurveyForm,
  refresh = false,
): Promise<PollStatsMap> {
  if (!refresh && pending[form]) {
    return pending[form]!;
  }

  const request = fetch(
    `/api/${form}/stats/all?ts=${Date.now()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control":
          "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    },
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          "Poll statistics are unavailable",
        );
      }

      const data: unknown =
        await response.json();

      if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
      ) {
        throw new Error(
          "Invalid poll statistics",
        );
      }

      const map =
        data as PollStatsMap;

      snapshots[form] = {
        data: map,
        fetchedAt: Date.now(),
      };

      return map;
    })
    .finally(() => {
      delete pending[form];
    });

  pending[form] = request;

  return request;
}

export function useSurveyPollStats(
  form: SurveyForm,
) {
  const [stats, setStats] =
    useState<PollStatsMap>({});

  const [status, setStatus] =
    useState<
      "loading" | "ready" | "error"
    >("loading");

  useEffect(() => {
    let active = true;

    const update = () => {
      void preloadPollStats(
        form,
        true,
      )
        .then((latest) => {
          if (!active) return;

          setStats(latest);
          setStatus("ready");
        })
        .catch(() => {
          if (!active) return;

          setStatus("error");
        });
    };

    /*
     * Fetch immediately.
     */
    update();

    /*
     * Refresh every 5 seconds.
     *
     * This means another person's submission will
     * normally appear within a few seconds.
     */
    const timer =
      window.setInterval(() => {
        if (!document.hidden) {
          update();
        }
      }, 5000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [form]);

  return {
    stats,
    status,
  };
}