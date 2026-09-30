"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
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

/** Shares one aggregate refresh loop and one heartbeat across the public site. */
export default function ParticipationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const scope = scopeFor(pathname);
  const [snapshot, setSnapshot] = useState<ParticipationSnapshot | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  const refresh = useCallback(async () => {
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
    }
  }, []);

  useEffect(() => {
    if (!scope) return;
    const browserId = getBrowserId();
    // Each tab/route lifetime has its own token. A late leave cannot remove a new
    // tab or route, and aggregates deduplicate all sessions by the browser ID.
    const sessionId = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let alive = true;
    let pending = false;
    const heartbeat = async () => {
      if (!alive || pending || document.hidden || !navigator.onLine) return;
      pending = true;
      try {
        const response = await fetch("/api/participation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ browserId, sessionId, scope, action: "heartbeat" }),
          keepalive: true,
        });
        if (!response.ok) throw new Error("Presence unavailable");
        if (alive) await refresh();
      } catch {
        if (alive) setStatus("reconnecting");
      } finally {
        pending = false;
      }
    };
    const leave = () => {
      const payload = JSON.stringify({ browserId, sessionId, action: "leave" });
      if (navigator.sendBeacon?.("/api/participation", new Blob([payload], { type: "application/json" }))) return;
      void fetch("/api/participation", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true,
      }).catch(() => {});
    };
    const visibilityChanged = () => {
      if (document.hidden) leave();
      else void heartbeat();
    };
    const online = () => { void heartbeat(); };
    void heartbeat();
    const timer = window.setInterval(() => { void heartbeat(); }, HEARTBEAT_INTERVAL_MS);
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", online);
    window.addEventListener("online", online);
    window.addEventListener("focus", online);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      alive = false;
      window.clearInterval(timer);
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("pageshow", online);
      window.removeEventListener("online", online);
      window.removeEventListener("focus", online);
      document.removeEventListener("visibilitychange", visibilityChanged);
      leave();
    };
  }, [scope, refresh]);

  useEffect(() => {
    if (!scope) return;
    const update = () => { if (!document.hidden) void refresh(); };
    update();
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
  }, [scope, refresh]);

  return <ParticipationContext.Provider value={{ snapshot, status, refresh }}>{children}</ParticipationContext.Provider>;
}
