import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fairness-Aware AI Routine Generator — UAP Survey",
  description:
    "Anonymous research survey on fairness-aware class routine generation: student & teacher preference poll plus time-slot rating, with live results.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-[#f6f5f2] text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
