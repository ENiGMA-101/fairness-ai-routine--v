"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";
const KEY = "fairness-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const dark = document.documentElement.classList.contains("dark");
    setTheme(dark ? "dark" : "light");
    const onStorage = (event: StorageEvent) => {
      if (event.key !== KEY) return;
      const next: Theme = event.newValue === "dark" ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.style.colorScheme = next;
      setTheme(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function toggle() {
    const next: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem(KEY, next);
    setTheme(next);
  }

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      title={isDark ? "Use light theme" : "Use dark theme"}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/95 px-4 py-3 text-xs font-bold text-slate-800 shadow-[0_14px_42px_-12px_rgba(32,39,80,.4)] backdrop-blur-xl transition-transform hover:-translate-y-0.5 hover:border-violet-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 dark:border-slate-600 dark:bg-[#1d2b45]/95 dark:text-slate-100 dark:hover:border-violet-400 dark:focus-visible:ring-violet-500/40"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-violet-500/20 dark:text-violet-200">
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </span>
      <span>{isDark ? "Light theme" : "Dark theme"}</span>
    </button>
  );
}
