/* eslint-disable @next/next/no-html-link-for-pages -- A native link bypasses slow client-side route transitions to the fully static Home page. */
import { ArrowLeft, House } from "lucide-react";

/** A direct link to the static landing page, with no route-data wait. */
export default function HomeButton({ label = "Home" }: { label?: string }) {
  return (
    <a
      href="/"
      aria-label="Return to the survey home page"
      className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-[0_8px_24px_-12px_rgba(104,67,201,.75)] transition-transform hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 dark:focus-visible:ring-violet-500/50 sm:px-5 sm:text-[15px]"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      <House className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}
