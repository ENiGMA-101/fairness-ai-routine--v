import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Clock,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Users,
} from "lucide-react";
import ResponseCounters from "@/components/ResponseCounters";
// Fully static — no DB round-trip on navigation, so Home/back is instant.
export const revalidate = 300;

export const metadata = {
  title: "Fairness-Aware AI Routine Generator — Research Survey",
  description:
    "Participate in the University of Asia Pacific research survey on fairness-aware class routine generation. Anonymous, 2–3 minutes, live results.",
};


export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f5f2]">
      {/* Header */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-xs font-black text-white shadow-sm">
              AI
            </div>
            <div>
              <div className="text-sm font-black leading-tight tracking-tight text-zinc-900 sm:text-base">
                Fairness-Aware AI Routine Generator
              </div>
              <div className="text-[11px] font-semibold text-zinc-400">
                University of Asia Pacific • Research Survey 2025
              </div>
            </div>
          </div>
          <Link
            href="/results/form1"
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 shadow-sm transition hover:border-zinc-400"
          >
            <BarChart3 className="h-3.5 w-3.5 text-violet-600" />
            Live Results
          </Link>
        </div>
      </header>

      {/* FORMS FIRST — the two surveys are the primary content above the fold */}
      <section className="mx-auto max-w-6xl px-5 pt-8 pb-6 sm:pt-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-700">
            <Users className="h-3.5 w-3.5" /> Participate in our research
          </span>
          <h1 className="mt-3 text-3xl font-black leading-[1.1] tracking-tight text-zinc-900 sm:text-4xl">
            Choose your survey and start — <span className="text-violet-600">2–3 minutes</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-zinc-500 sm:text-base">
            নিচের ফর্মগুলো একই পৃষ্ঠায় স্ক্রল করে পূরণ করুন — কোনো লগইন বা তথ্য প্রয়োজন নেই।
          </p>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {/* Form 1 — primary CTA */}
          <Link
            href="/form1"
            className="group relative overflow-hidden rounded-[30px] border-2 border-zinc-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-400 hover:shadow-2xl"
          >
            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-10 translate-x-10 rounded-full bg-violet-100 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-violet-600 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-sm">
                  Form 01
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
                  <Clock className="h-3.5 w-3.5" /> 2–3 min
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-black tracking-tight text-zinc-900">
                Student &amp; Teacher Survey
              </h2>
              <p className="mt-1 text-sm font-bold text-violet-600">
                শিক্ষার্থী ও শিক্ষক জরিপ
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Preference questions for routine generation: daily timing, long gaps, midday
                break, lab load and student–teacher conflict resolution.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold text-zinc-500">
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">13 questions</span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">Bangla + English</span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">Live results</span>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                  <GraduationCap className="h-4 w-4 text-violet-600" />
                  Open Form 1
                </span>
                <span className="flex items-center gap-1.5 rounded-2xl bg-zinc-950 px-5 py-2.5 text-xs font-bold text-white shadow transition group-hover:bg-violet-600">
                  Start now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* Form 2 */}
          <Link
            href="/form2"
            className="group relative overflow-hidden rounded-[30px] bg-zinc-950 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-10 translate-x-10 rounded-full bg-violet-700/40 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-violet-400/40 bg-violet-500/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-violet-300">
                  Form 02
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500">
                  <Clock className="h-3.5 w-3.5" /> 2 min
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-black tracking-tight text-white">
                Time-Slot Rating Survey
              </h2>
              <p className="mt-1 text-sm font-bold text-violet-400">সময়ের পছন্দ রেটিং</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Rate all seven daily class slots 1–5, judge long campus gaps, and decide whether
                the AI should remember fairness across semesters.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold text-zinc-500">
                <span className="rounded-full bg-white/10 px-2.5 py-1">7 time slots</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1">Emoji rating</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1">Slot ranking</span>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                  <Clock className="h-4 w-4 text-violet-400" />
                  Open Form 2
                </span>
                <span className="flex items-center gap-1.5 rounded-2xl bg-white px-5 py-2.5 text-xs font-bold text-zinc-950 shadow transition group-hover:bg-violet-400">
                  Start now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Trust strip */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> 100% anonymous
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-sky-600" /> One response per browser
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-violet-600" /> Live aggregate results only
          </span>
        </div>
      </section>

      {/* Research context (below the forms) */}
      <section className="border-t border-zinc-200/80 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">
              About this research
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              The Fairness-Aware AI Routine Generator produces a feasible university class routine
              by balancing students, teachers, courses, labs, rooms and available time — while
              keeping multi-semester fairness for everyone.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">
              Why your answer matters
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              Every vote shapes the priority weights of the scheduling algorithm: morning vs.
              evening preferences, acceptable daily hours, lab limits, and how the AI resolves
              conflicts between students and faculty.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">
              Data &amp; privacy
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              No name, email or student ID is collected — only your role, department and answers.
              Results are published only in aggregate percentage form.
            </p>
          </div>
        </div>

          {/* Aggregate response counters (client-side → page stays fully static & instant) */}
          <ResponseCounters />
      </section>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-8 text-xs leading-relaxed text-zinc-400">
          <div className="font-bold text-zinc-500">
            Fairness-Aware AI Routine Generator — Research Project 2025
          </div>
          <div className="mt-1">
            University of Asia Pacific • Departmental thesis research survey • Responses are
            anonymous and aggregated for analysis only.
          </div>
        </div>
      </footer>
    </main>
  );
}
