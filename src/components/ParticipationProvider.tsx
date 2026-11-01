"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getBrowserId, SUBMISSION_EVENT } from "@/lib/browser";
import { HEARTBEAT_INTERVAL_MS, PARTICIPATION_POLL_MS, type ParticipationSnapshot, type PresenceScope } from "@/lib/participation";

type ConnectionStatus = "connecting" | "live" | "reconnecting";
type ParticipationContextValue = {
  snapshot: ParticipationSnapshot | null;
  status: ConnectionStatus;
  refresh: () => Promise<void>;
};
const ParticipationContext = createContext<ParticipationContextValue | null>(null);

export function useParticipation() {
  const value = useContext(ParticipationContext);
  if (!value) throw new Error("ParticipationProvider is required");
  return value;
}

function scopeFor(path: string): PresenceScope | null {
  if (path === "/form1" || path === "/results/form1") return "form1";
  if (path === "/form2" || path === "/results/form2") return "form2";
  return path === "/" ? "home" : null;
}

// Only these pages actually render participation counters. The survey forms need
// presence (so they are counted as live) but never display the snapshot, so they
// must not poll the aggregate endpoint every few seconds while someone is answering.
const SNAPSHOT_PATHS = new Set(["/", "/results/form1", "/results/form2"]);

/** Run low-priority work after the browser is idle so it never competes with navigation or hydration. */
function whenIdle(task: () => void, timeout = 1500): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, 150);
  return () => window.clearTimeout(id);
}

/**
 * Shares one aggregate refresh loop and one presence heartbeat across the public site.
 * The provider lives in the root layout, so it (and its last snapshot) survives
 * client-side navigation; a route change only updates the presence scope.
 */
export default function ParticipationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const scope = scopeFor(pathname);
  const wantsSnapshot = SNAPSHOT_PATHS.has(pathname);
  const [snapshot, setSnapshot] = useState<ParticipationSnapshot | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  const scopeRef = useRef<PresenceScope | null>(scope);
  const sessionRef = useRef("");
  const lastSentScope = useRef<PresenceScope | null>(null);
  const inflightRefresh = useRef<Promise<void> | null>(null);
  const inflightBeat = useRef<Promise<boolean> | null>(null);

  /** One GET at a time; concurrent callers (poll, focus, submit, heartbeat) share it. */
  const refresh = useCallback((): Promise<void> => {
    if (inflightRefresh.current) return inflightRefresh.current;
    const request = (async () => {
      try {
        const response = await fetch("/api/participation", { cache: "no-store" });
        if (!response.ok) throw new Error("Connection unavailable");
        const data = await response.json() as ParticipationSnapshot;
        if (!data.live || !data.submitted || typeof data.live.total !== "number" || typeof data.submitted.total !== "number") {
          throw new Error("Invalid participation data");
        }
        setSnapshot(data);
        setStatus("live");
      } catch {
        // Retain the last acknowledged values, never substitute invented counts.
        setStatus("reconnecting");
      } finally {
        inflightRefresh.current = null;
      }
    })();
    inflightRefresh.current = request;
    return request;
  }, []);

  /** Presence heartbeat (never blocks UI; deduplicated while one is in flight). */
  const heartbeat = useCallback((): Promise<boolean> => {
    const scopeNow = scopeRef.current;
    if (!scopeNow || document.hidden || !navigator.onLine || !sessionRef.current) return Promise.resolve(false);
    if (inflightBeat.current) return inflightBeat.current;
    const request = (async () => {
      try {
        const response = await fetch("/api/participation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ browserId: getBrowserId(), sessionId: sessionRef.current, scope: scopeNow, action: "heartbeat" }),
          keepalive: true,
        });
        if (!response.ok) throw new Error("Presence unavailable");
        lastSentScope.current = scopeNow;
        return true;
      } catch {
        setStatus("reconnecting");
        return false;
      } finally {
        inflightBeat.current = null;
      }
    })();
    inflightBeat.current = request;
    return request;
  }, []);

  // Presence lifecycle: ONE session per tab. A route change only changes `scope`,
  // so there is no leave/re-join churn while navigating between pages.
  useEffect(() => {
    sessionRef.current = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const browserId = getBrowserId();
    const sessionId = sessionRef.current;
    const leave = () => {
      const payload = JSON.stringify({ browserId, sessionId, action: "leave" });
      if (navigator.sendBeacon?.("/api/participation", new Blob([payload], { type: "application/json" }))) return;
      void fetch("/api/participation", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true,
      }).catch(() => {});
    };
    const resume = () => { void heartbeat(); };
    const visibilityChanged = () => {
      if (document.hidden) leave();
      else resume();
    };
    const timer = window.setInterval(resume, HEARTBEAT_INTERVAL_MS);
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", resume);
    window.addEventListener("online", resume);
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("pageshow", resume);
      window.removeEventListener("online", resume);
      window.removeEventListener("focus", resume);
      document.removeEventListener("visibilitychange", visibilityChanged);
      leave();
      sessionRef.current = "";
      lastSentScope.current = null;
    };
  }, [heartbeat]);

  // Scope / page change: register the new scope (only if it changed) and, on pages
  // that show counters, take one snapshot. Deferred to idle time so it never delays
  // the navigation that triggered it. This replaces the old double POST+GET+GET burst.
  useEffect(() => {
    scopeRef.current = scope;
    if (!scope) return;
    return whenIdle(() => {
      if (document.hidden) return;
      void (async () => {
        if (lastSentScope.current !== scope) await heartbeat();
        if (wantsSnapshot) await refresh();
      })();
    });
  }, [scope, wantsSnapshot, heartbeat, refresh]);

  // Live counter polling: only while a page that displays the counters is visible.
  useEffect(() => {
    if (!wantsSnapshot) return;
    const update = () => { if (!document.hidden) void refresh(); };
    const timer = window.setInterval(update, PARTICIPATION_POLL_MS);
    window.addEventListener(SUBMISSION_EVENT, update);
    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(SUBMISSION_EVENT, update);
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [wantsSnapshot, refresh]);

  const value = useMemo(() => ({ snapshot, status, refresh }), [snapshot, status, refresh]);
  return <ParticipationContext.Provider value={value}>{children}</ParticipationContext.Provider>;
}
