"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SetupState = {
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
};

export default function SetupPage() {
  const [state, setState] = useState<SetupState>({ loading: true });
  const [testing, setTesting] = useState(false);

  const checkStatus = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/setup", { cache: "no-store" });
      const data = await res.json();
      setState({ loading: false, ...data });
    } catch {
      setState({
        loading: false,
        configured: false,
        connected: false,
        error: "Network error checking database status",
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    void checkStatus();
  }, []);

  const createTables = async () => {
    setTesting(true);
    try {
      await fetch("/api/setup", { method: "POST" });
      await checkStatus();
    } catch {
      setTesting(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-zinc-600 hover:text-black">
          ← Back to home
        </Link>
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-500">
          Database Guide &amp; Diagnostics
        </span>
      </div>

      <h1 className="mt-6 text-3xl font-black">Vercel + Database Setup Guide</h1>
      <p className="mt-2 text-zinc-600">
        Fix for: <code>Failed query: insert into &quot;form2_responses&quot;</code>. Follow the 1-minute
        guide below to connect your free database.
      </p>

      {/* Live Status Card */}
      <div className="mt-8 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                state.connected
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {state.loading ? "…" : state.connected ? "✓" : "!"}
            </div>
            <div>
              <div className="font-bold text-zinc-900">
                {state.loading
                  ? "Checking database connection…"
                  : state.connected
                    ? "Database Connected & Ready!"
                    : "Database Not Connected Yet"}
              </div>
              <div className="text-xs text-zinc-500">
                {state.connected
                  ? `Connected via ${state.detectedEnv || "DATABASE_URL"} (${state.host}) • Tables verified`
                  : state.error || "No active PostgreSQL database found in environment"}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={checkStatus}
              disabled={testing}
              className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold hover:border-zinc-500"
            >
              {testing ? "Testing…" : "↻ Test Connection"}
            </button>
            {state.connected && (
              <button
                type="button"
                onClick={createTables}
                disabled={testing}
                className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
              >
                Re-verify Tables
              </button>
            )}
          </div>
        </div>

        {state.connected && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 text-xs">
            <div>
              <span className="text-zinc-400">Form 1 rows:</span>{" "}
              <b className="text-zinc-800">{state.f1Count ?? 0}</b>
            </div>
            <div>
              <span className="text-zinc-400">Form 2 rows:</span>{" "}
              <b className="text-zinc-800">{state.f2Count ?? 0}</b>
            </div>
          </div>
        )}
      </div>

      {/* Why the error happened */}
      <section className="mt-8 rounded-[24px] border border-amber-200 bg-amber-50/60 p-6">
        <h2 className="font-bold text-amber-900">
          Why did you see &quot;Failed query: insert into form2_responses&quot;?
        </h2>
        <div className="mt-3 space-y-2 text-sm text-amber-950">
          <p>
            When you deploy a new project to Vercel, Vercel gives you an empty database without any
            tables created yet.
          </p>
          <p>
            <b>What we fixed:</b> The app now has <b>Auto-Schema Healing</b> built in. The moment
            you submit the form or visit any page, the app will <b>automatically create the tables</b>{" "}
            (<code>form1_responses</code> &amp; <code>form2_responses</code>) if they are missing. You
            never have to run manual SQL commands!
          </p>
        </div>
      </section>

      {/* How to add a free database in 60 seconds */}
      <section className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold">How to connect a free database in 60 seconds</h2>

        {/* Method 1: Inside Vercel Storage */}
        <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">
              Method 1 — Recommended
            </span>
            <span className="text-xs text-zinc-500">1-click directly in Vercel dashboard</span>
          </div>
          <h3 className="mt-2 text-lg font-bold">Add Neon Postgres inside Vercel</h3>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-zinc-700">
            <li>
              Go to your project at{" "}
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-violet-600 underline"
              >
                vercel.com
              </a>
              .
            </li>
            <li>
              Click the <b>Storage</b> tab at the top of your project page.
            </li>
            <li>
              Click <b>Create Database</b> → Choose <b>Neon</b> (Postgres).
            </li>
            <li>
              Select your region (e.g., Washington, Frankfurt, or Singapore) and click <b>Continue</b>.
            </li>
            <li>
              Click <b>Connect to Project</b>. Vercel automatically sets <code>POSTGRES_URL</code>.
            </li>
            <li>
              Redeploy your project (or go to <b>Deployments</b> → <b>Redeploy</b>).
            </li>
          </ol>
          <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600">
            ✔ <b>Zero SQL needed:</b> Our updated code will automatically detect{" "}
            <code>POSTGRES_URL</code> and automatically run <code>CREATE TABLE IF NOT EXISTS</code>{" "}
            on your first submission!
          </div>
        </div>

        {/* Method 2: Free Neon.tech account */}
        <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-700">
              Method 2
            </span>
            <span className="text-xs text-zinc-500">Free forever, NO credit card needed</span>
          </div>
          <h3 className="mt-2 text-lg font-bold">Connect via Neon.tech (Free PostgreSQL)</h3>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-zinc-700">
            <li>
              Open{" "}
              <a
                href="https://neon.tech"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-violet-600 underline"
              >
                neon.tech
              </a>{" "}
              and sign up with GitHub or Google (takes 10 seconds, no credit card).
            </li>
            <li>
              Click <b>Create Project</b> (name it e.g. <code>fairness-survey</code>).
            </li>
            <li>
              On your Neon dashboard, copy the <b>Connection string</b>:
              <div className="mt-1 rounded-lg bg-zinc-100 p-2 font-mono text-xs text-zinc-800">
                postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require
              </div>
            </li>
            <li>
              In your Vercel Project → <b>Settings</b> → <b>Environment Variables</b>:
              <div className="mt-1">
                Name: <code>DATABASE_URL</code>
                <br />
                Value: <i>(paste your Neon connection string)</i>
              </div>
            </li>
            <li>
              Click <b>Save</b>, then trigger a <b>Redeploy</b> in Vercel.
            </li>
          </ol>
        </div>

        {/* Method 3: Supabase */}
        <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-700">
              Method 3
            </span>
            <span className="text-xs text-zinc-500">Free Supabase project</span>
          </div>
          <h3 className="mt-2 text-lg font-bold">Connect via Supabase</h3>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-zinc-700">
            <li>
              Create a free project at{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-violet-600 underline"
              >
                supabase.com
              </a>
              .
            </li>
            <li>
              Go to <b>Project Settings</b> → <b>Database</b>.
            </li>
            <li>
              Under <b>Connection string</b>, select <b>URI</b> (mode: <b>Transaction</b>, port{" "}
              <code>6543</code>).
            </li>
            <li>
              Copy the URI and set it as <code>DATABASE_URL</code> in Vercel.
            </li>
          </ol>
        </div>
      </section>

      {/* Download ZIP */}
      <section className="mt-10 rounded-[24px] border border-violet-200 bg-violet-50 p-6 text-center">
        <h3 className="text-lg font-bold text-violet-900">
          Need to re-upload the updated ZIP to Vercel?
        </h3>
        <p className="mt-1 text-sm text-violet-700">
          The ZIP contains the auto-healing tables, multi-env variable detection, and SSL handling.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a
            href="/fairness-app.zip"
            download
            className="rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-violet-700"
          >
            ⬇ Download updated fairness-app.zip
          </a>
          <Link
            href="/"
            className="rounded-full border border-violet-300 bg-white px-6 py-3 text-sm font-semibold text-violet-800"
          >
            Back to survey
          </Link>
        </div>
      </section>
    </main>
  );
}
