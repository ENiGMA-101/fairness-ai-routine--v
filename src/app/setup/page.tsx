"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  Database,
  FileSpreadsheet,
  RefreshCw,
  Home,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Status = {
  loading: boolean;
  configured?: boolean;
  connected?: boolean;
  host?: string;
  detectedEnv?: string | null;
  tablesReady?: boolean;
  f1Count?: number;
  f2Count?: number;
  error?: string;
  message?: string;
  unauthorized?: boolean;
};

const TOKEN_KEY = "admin_token";

export default function AdminConsolePage() {
  const [token, setToken] = useState("");
  const [active, setActive] = useState("");
  const [status, setStatus] = useState<Status>({ loading: false });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(TOKEN_KEY);
    if (stored) {
      setActive(stored);
      setToken(stored);
    }
  }, []);

  const check = useCallback(async (tok: string) => {
    if (!tok) return;
    setTesting(true);
    setStatus({ loading: true });
    try {
      const res = await fetch(`/api/setup?token=${encodeURIComponent(tok)}`, {
        cache: "no-store",
        headers: { "x-admin-token": tok },
      });
      const data = await res.json();
      setStatus({ loading: false, ...data, unauthorized: res.status === 401 });
      if (res.status === 401) window.sessionStorage.removeItem(TOKEN_KEY);
      else window.sessionStorage.setItem(TOKEN_KEY, tok);
    } catch {
      setStatus({
        loading: false,
        error: "Network error while checking status.",
        unauthorized: false,
      });
    } finally {
      setTesting(false);
    }
  }, []);

  const authorize = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = token.trim();
    if (!clean) return;
    setActive(clean);
    void check(clean);
  };

  const exportUrl = (form: "form1" | "form2") =>
    `/api/export?form=${form}&format=csv&token=${encodeURIComponent(active)}`;

  return (
    <main className="min-h-screen bg-[#f6f5f2] pb-16">
      <div className="mx-auto max-w-3xl px-5 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-zinc-600 hover:text-zinc-900"
          >
            <Home className="h-4 w-4" /> Back to survey
          </Link>
          <span className="flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5" /> Administrator Console
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-black tracking-tight text-zinc-900">Admin Console</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Diagnostics and data export are protected. Enter the admin token to continue.
        </p>

        {/* Token gate */}
        {!active || status.unauthorized ? (
          <form
            onSubmit={authorize}
            className="mt-6 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-800">
              <KeyRound className="h-4 w-4 text-zinc-500" /> Admin token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter admin token"
              className="mt-3 w-full rounded-xl border-2 border-zinc-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              autoComplete="current-password"
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-black py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              Unlock Console
            </button>
            {status.unauthorized ? (
              <p className="mt-3 text-xs font-semibold text-red-600">
                Incorrect token. Access denied.
              </p>
            ) : null}
            <p className="mt-4 text-xs leading-relaxed text-zinc-400">
              The token is the <b>ADMIN_TOKEN</b> environment variable configured for this project
              (set it in Vercel → Settings → Environment Variables).
            </p>
          </form>
        ) : (
          <>
            {/* Status */}
            <section className="mt-6 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      status.connected
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {status.connected ? (
                      <Database className="h-5 w-5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black text-zinc-900">
                      {status.loading
                        ? "Checking status…"
                        : status.connected
                          ? "PostgreSQL connected"
                          : "Built-in storage active"}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {status.message ?? status.error ?? "Ready"}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => check(active)}
                  disabled={testing}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-300 px-4 py-2 text-xs font-bold text-zinc-700 transition hover:border-zinc-500"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${testing ? "animate-spin" : ""}`} />
                  {testing ? "Checking…" : "Refresh"}
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4">
                <div className="rounded-2xl bg-zinc-50 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Form 1 responses
                  </div>
                  <div className="mt-1 text-2xl font-black text-zinc-900">
                    {status.f1Count ?? "—"}
                  </div>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Form 2 responses
                  </div>
                  <div className="mt-1 text-2xl font-black text-zinc-900">
                    {status.f2Count ?? "—"}
                  </div>
                </div>
              </div>
            </section>

            {/* Export */}
            <section className="mt-4 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-black text-zinc-900">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export responses
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Downloads all recorded submissions as CSV (opens in Excel / Google Sheets).
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                  href={exportUrl("form1")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  <FileSpreadsheet className="h-4 w-4" /> Export Form 1
                </a>
                <a
                  href={exportUrl("form2")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
                >
                  <FileSpreadsheet className="h-4 w-4" /> Export Form 2
                </a>
              </div>
            </section>

            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>
                This console is not linked from the public site. Keep <b>ADMIN_TOKEN</b> secret —
                anyone with it can export collected responses.
              </span>
            </div>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  window.sessionStorage.removeItem(TOKEN_KEY);
                  setActive("");
                  setToken("");
                  setStatus({ loading: false });
                }}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-600"
              >
                Lock console
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
