"use client";

import { Moon, Sun } from "lucide-react";

const KEY = "fairness-theme";

/**
 * CSS-driven theme toggle. The saved theme is applied to <html class="dark"> by
 * the inline script in layout before paint, so this button needs no React state
 * (no hydration mismatch, no setState-in-effect). It simply flips the class and
 * persists the choice; every `dark:` variant updates instantly.
 */
function toggleTheme() {
  const root = document.documentElement;
  const dark = root.classList.toggle("dark");
  root.style.colorScheme = dark ? "dark" : "light";
  try {
    window.localStorage.setItem(KEY, dark ? "dark" : "light");
  } catch {
    /* storage unavailable */
  }
}

export default function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark / light theme"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/95 px-4 py-3 text-xs font-bold text-slate-800 shadow-[0_14px_42px_-12px_rgba(32,39,80,.4)] backdrop-blur-xl transition-transform hover:-translate-y-0.5 hover:border-violet-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 dark:border-slate-600 dark:bg-[#1d2b45]/95 dark:text-slate-100 dark:hover:border-violet-400 dark:focus-visible:ring-violet-500/40"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-violet-500/20 dark:text-violet-200">
        <Sun className="h-4 w-4 dark:hidden" aria-hidden="true" />
        <Moon className="hidden h-4 w-4 dark:block" aria-hidden="true" />
      </span>
      <span className="dark:hidden">Dark mode</span>
      <span className="hidden dark:inline">Light mode</span>
    </button>
  );
}
