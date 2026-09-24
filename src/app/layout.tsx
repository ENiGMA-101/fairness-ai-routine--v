import type { Metadata } from "next";
import type { ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fairness-Aware AI Routine Generator | Research Survey",
  description:
    "Help shape fairer university class schedules. Share anonymous student or teacher preferences and rate time slots for fairness-aware AI research.",
};

// This runs before React hydrates, preventing a bright flash when dark mode is saved.
const themeScript = `try{const saved=localStorage.getItem('fairness-theme');const dark=saved==='dark'||(saved!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light'}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-screen antialiased">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
