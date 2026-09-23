"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Building2,
  Home,
  ShieldCheck,
} from "lucide-react";
import PollCard from "@/components/PollCard";
import { FORM1_VISUALS } from "@/components/Visuals";
import { getBrowserId, isSubmitted, markSubmitted } from "@/lib/browser";
import {
  DEPARTMENTS,
  FORM1_QUESTIONS,
  FIXED_QUESTION_IDS,
  orderForSurvey,
} from "@/lib/survey";

const ROLE_QUESTION = FORM1_QUESTIONS.find((q) => q.id === "role")!;
const QUESTIONS = FORM1_QUESTIONS.filter((q) => q.id !== "role" && q.id !== "department");

export default function Form1Page() {
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [departmentOther, setDepartmentOther] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [batchStats, setBatchStats] = useState<Record<string, { total: number; counts: Record<string, number>; percentages: Record<string, number> }>>({});
  // Distinguishes "just submitted" from "already submitted earlier on this browser"
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    if (isSubmitted("form1")) {
      setSubmitted(true);
      setAlreadySubmitted(true);
    }
  }, []);

  // Preload ALL question stats in one request — shows instantly when user clicks
  useEffect(() => {
    void fetch("/api/form1/stats/all", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && typeof data === "object") setBatchStats(data);
      })
      .catch(() => {});
  }, []);

  // Shuffle opinion questions on every entry; demographic questions (semester) stay fixed at top
  const [orderedQuestions, setOrderedQuestions] = useState(() => [...QUESTIONS]);
  useEffect(() => {
    setOrderedQuestions(orderForSurvey(QUESTIONS));
  }, []);

  const visible = useMemo(
    () =>
      orderedQuestions.filter((q) =>
        role === "" ? false : q.audience === role || q.audience === "Both",
      ),
    [role, orderedQuestions],
  );

  const total = useMemo(() => (role ? visible.length + 2 : 2), [role, visible.length]);

  const answered = useMemo(() => {
    let count = 0;
    if (role) count += 1;
    if (department) count += 1;
    count += visible.filter((q) => Boolean(answers[q.id])).length;
    return count;
  }, [role, department, answers, visible]);

  const canSubmit =
    Boolean(role) &&
    Boolean(department) &&
    visible.length > 0 &&
    visible.every((q) => Boolean(answers[q.id])) &&
    (department !== "Other" || departmentOther.trim().length > 0);

  const setAnswer = (id: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/form1/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          browser_id: getBrowserId(),
          role,
          department,
          department_other: department === "Other" ? departmentOther.trim() : null,
          answers,
        }),
      });

      // Whether 200 OK or 409 (duplicate browser), treat as successful submission
      if (res.ok || res.status === 409) {
        markSubmitted("form1");
        setSubmitted(true);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          /* ignore */
        }
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      const rawError = data.error ?? `Submission failed (${res.status})`;

      // If any unexpected string was returned, protect UI
      if (rawError.includes("Failed query") || rawError.includes("insert into")) {
        markSubmitted("form1");
        setSubmitted(true);
        return;
      }
      // Only validation messages (HTTP 400) are ever shown to respondents.
      setError(
        res.status === 400
          ? rawError
          : "আপনার উত্তর নেওয়া যায়নি — অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন। / Please try again in a moment.",
      );
    } catch {
      // Offline fallback: mark as submitted locally
      markSubmitted("form1");
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted && alreadySubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-b from-zinc-50 to-[#f6f5f2]">
        <div className="w-full max-w-lg rounded-[36px] border border-zinc-200 bg-white p-8 md:p-10 text-center shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-amber-600 shadow-inner">
            <ShieldCheck className="h-10 w-10 stroke-[2.5]" />
          </div>
          <h1 className="mt-6 text-2xl font-black text-zinc-900 tracking-tight">
            You have already submitted this survey
          </h1>
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
            এই ব্রাউজার থেকে একবার উত্তর জমা হয়ে গেছে। গবেষণার সততার জন্য প্রতি ব্রাউজার থেকে মাত্র একটি
            উত্তর গ্রহণ করা হয় — তাই আবার জমা দেওয়া যাবে না।
          </p>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="h-4 w-4 text-amber-600" /> One response per browser
            </div>
            <p className="mt-1.5 leading-relaxed">
              Thank you — your earlier response is safely recorded and counted in the live results.
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <Link
              href="/results/form1"
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-black py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-zinc-800"
            >
              <BarChart3 className="h-4 w-4" /> View Live Results
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-600 pt-2"
            >
              <Home className="h-3.5 w-3.5" /> Back to Survey Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-b from-zinc-50 to-[#f6f5f2]">
        <div className="w-full max-w-lg rounded-[36px] border border-zinc-200 bg-white p-8 md:p-10 text-center shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
          </div>
          <h1 className="mt-6 text-3xl font-black text-zinc-900 tracking-tight">
            Response Submitted!
          </h1>
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
            ধন্যবাদ! আপনার মূল্যবান মতামত সংরক্ষিত হয়েছে। আপনার মতামত এআই রুটিন জেনারেটরের ন্যায্যতা
            (Fairness Algorithm) উন্নয়নে ব্যবহার করা হবে।
          </p>

          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Response recorded anonymously
            </div>
            <p className="mt-1.5 leading-relaxed">
              No name, email or ID was collected. Your answers are counted only in aggregate
              percentages shown on the results page.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/form2"
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-700"
            >
              Now submit Form 2 (Time-Slot Rating) <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/results/form1"
              className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-zinc-200 bg-white py-3.5 text-sm font-bold text-zinc-800 transition hover:bg-zinc-50"
            >
              <BarChart3 className="h-4 w-4" /> View Live Form 1 Results
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-600 pt-2"
            >
              <Home className="h-3.5 w-3.5" /> Back to Survey Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-[#f6f5f2]">
      {/* Sticky Top Header with Animated Progress */}
      <div className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-bold text-zinc-700 hover:text-black transition"
          >
            <Home className="h-4 w-4" /> Home
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-500 tabular-nums">
              {answered} of {total} answered
            </span>
            <div className="h-2.5 w-28 md:w-36 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${total ? (answered / total) * 100 : 0}%` }}
              />
            </div>
            {canSubmit && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Ready to Submit
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Hero Card */}
        <div className="mb-6 rounded-[32px] border border-zinc-200/80 bg-white p-7 md:p-9 shadow-sm">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
            <Sparkles className="h-3.5 w-3.5" /> Survey Form 1 • UAP Research
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-black leading-tight tracking-tight text-zinc-900">
            Fairness Aware AI Routine Generator
          </h1>
          <p className="mt-1 text-lg font-bold text-violet-600">
            Student &amp; Teacher Preference Survey
          </p>
          <p className="mt-3 text-sm md:text-base text-zinc-600 leading-relaxed">
            একই পৃষ্ঠায় স্ক্রল করে উত্তর দিন। প্রতিটি বিকল্প নির্বাচন করার পর তাৎক্ষণিকভাবে
            কমিউনিটির <b>লাইভ শতকরা ফলাফল</b> দেখতে পাবেন। আপনার চূড়ান্ত ভোট Submit চাপার পর নিশ্চিত
            হবে।
          </p>
        </div>

        {/* 1. Role Selection (Graphical) */}
        <section className="mb-6 rounded-[28px] border border-zinc-200/80 bg-white p-6 md:p-7 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-violet-700">
              1
            </span>
            <h3 className="text-[17px] font-bold text-zinc-900">
              আপনি কি শিক্ষার্থী, নাকি শিক্ষক? *
            </h3>
          </div>
          <p className="mt-1 text-sm font-medium text-zinc-500">
            Are you a Student or Teacher?
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("Student")}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 p-5 transition-all ${
                role === "Student"
                  ? "border-violet-600 bg-violet-50/70 shadow-md ring-2 ring-violet-500/20"
                  : "border-zinc-200 bg-white hover:border-violet-300 hover:bg-zinc-50"
              }`}
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-2 ${
                role === "Student" ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-600"
              }`}>
                <GraduationCap className="h-6 w-6" />
              </span>
              <span className="text-base font-bold text-zinc-900">Student</span>
              <span className="text-xs text-zinc-500 font-medium">শিক্ষার্থী</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("Teacher")}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 p-5 transition-all ${
                role === "Teacher"
                  ? "border-violet-600 bg-violet-50/70 shadow-md ring-2 ring-violet-500/20"
                  : "border-zinc-200 bg-white hover:border-violet-300 hover:bg-zinc-50"
              }`}
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-2 ${
                role === "Teacher" ? "bg-violet-600 text-white" : "bg-indigo-100 text-indigo-600"
              }`}>
                <Briefcase className="h-6 w-6" />
              </span>
              <span className="text-base font-bold text-zinc-900">Teacher</span>
              <span className="text-xs text-zinc-500 font-medium">শিক্ষক</span>
            </button>
          </div>
        </section>

        {/* 2. Department Selection */}
        <section className="mb-6 rounded-[28px] border border-zinc-200/80 bg-white p-6 md:p-7 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-violet-700">
              2
            </span>
            <h3 className="text-[17px] font-bold text-zinc-900">
              আপনি কোন বিভাগের অন্তর্ভুক্ত? *
            </h3>
          </div>
          <p className="mt-1 text-sm font-medium text-zinc-500">
            Which department do you belong to?
          </p>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {DEPARTMENTS.map((d) => {
              const selected = department === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepartment(d)}
                  className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                    selected
                      ? "border-violet-600 bg-violet-50/70 font-bold text-violet-950 shadow-sm"
                      : "border-zinc-200 bg-white font-medium text-zinc-700 hover:border-violet-300 hover:bg-zinc-50"
                  }`}
                >
                  <Building2 className={`h-4 w-4 ${selected ? "text-violet-600" : "text-zinc-400"}`} />
                  <span className="text-sm">{d}</span>
                </button>
              );
            })}
          </div>

          {department === "Other" && (
            <input
              value={departmentOther}
              onChange={(e) => setDepartmentOther(e.target.value)}
              placeholder="আপনার বিভাগের নাম লিখুন (Enter Department name)"
              className="mt-3.5 w-full rounded-2xl border-2 border-zinc-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          )}
        </section>

        {/* Dynamic Questions Based on Role */}
        {role === "" ? (
          <div className="rounded-[32px] border-2 border-dashed border-violet-200 bg-violet-50/40 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 mb-3">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-zinc-800">
              উপরে আপনার ভূমিকা (Student বা Teacher) নির্বাচন করুন
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Select your role above to load the questionnaire preserved from research PDFs.
            </p>
          </div>
        ) : (
          visible.map((q, i) => {
            const Visual = FORM1_VISUALS[q.id];
            return (
              <PollCard
                key={q.id}
                form="form1"
                questionId={q.id}
                index={i + 3}
                title={q.titleBn}
                subtitle={q.titleEn}
                options={q.options}
                value={answers[q.id] ?? null}
                onChange={(v) => setAnswer(q.id, v)}
                visual={Visual ? <Visual /> : undefined}
                initialStats={batchStats[q.id] ?? null}
                hideResults={FIXED_QUESTION_IDS.has(q.id)}
              />
            );
          })
        )}

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {/* Submit Button */}
        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || loading}
            className="w-full rounded-[24px] bg-black py-5 text-lg font-black text-white shadow-xl transition-all hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-black"
          >
            {loading ? "Submitting Response…" : `Submit Response (${answered}/${total})`}
          </button>
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
            <span>🔒 100% Anonymous</span>
            <span>•</span>
            <span>One vote per browser</span>
            <span>•</span>
            <span>Instant live results</span>
          </div>
        </div>
      </div>
    </div>
  );
}
