import type { Metadata } from "next";
import type { ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import ParticipationProvider from "@/components/ParticipationProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fairness-Aware AI Routine Generator | Research Survey",
  description:
    "Help shape fairer university class schedules. Share anonymous student or teacher preferences and rate time slots for fairness-aware AI research.",
};

// Keep the requested dark theme on first visit and respect every saved choice.
// Runs before hydration so light/dark preferences never cause a bright flash.
const themeScript = `try{const saved=localStorage.getItem('fairness-theme');const dark=saved!=='light';document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light'}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" className="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-screen antialiased">
        <ParticipationProvider>{children}</ParticipationProvider>
        <ThemeToggle />
      </body>
    </html>
  );
}
