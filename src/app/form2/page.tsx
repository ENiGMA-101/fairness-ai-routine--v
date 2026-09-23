"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Building2,
  Home,
  MessageSquare,
} from "lucide-react";
import RatingPoll from "@/components/RatingPoll";
import TimeSlotMatrix from "@/components/TimeSlotMatrix";
import { VisualFairness, VisualLongGapForm2 } from "@/components/Visuals";
import { getBrowserId, isSubmitted, markSubmitted } from "@/lib/browser";
import { DEPARTMENTS, TIME_SLOTS } from "@/lib/survey";

const ROLES = ["Student", "Teacher"];

export default function Form2Page() {
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [departmentOther, setDepartmentOther] = useState("");
  const [timeSlots, setTimeSlots] = useState<Record<string, number>>({});
  const [longGap, setLongGap] = useState<number | null>(null);
  const [fairness, setFairness] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isSubmitted("form2")) setSubmitted(true);
  }, []);

  const total = 11;
  const answered = useMemo(() => {
    let count = 0;
    if (role) count += 1;
    if (department) count += 1;
    count += Object.keys(timeSlots).length;
    if (longGap) count += 1;
    if (fairness) count += 1;
    return count;
  }, [role, department, timeSlots, longGap, fairness]);

  const allSlotsRated = TIME_SLOTS.every((s) => Boolean(timeSlots[s.id]));
  const canSubmit =
    Boolean(role) &&
    Boolean(department) &&
    allSlotsRated &&
    longGap !== null &&
    fairness !== null &&
    (department !== "Other" || departmentOther.trim().length > 0);

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/form2/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          browser_id: getBrowserId(),
          role,
          department,
          department_other: department === "Other" ? departmentOther.trim() : null,
          time_slots: timeSlots,
          long_gap_rating: longGap,
          fairness_rating: fairness,
          feedback,
        }),
      });

      if (res.ok || res.status === 409) {
        markSubmitted("form2");
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
      if (rawError.includes("Failed query") || rawError.includes("insert into")) {
        markSubmitted("form2");
        setSubmitted(true);
        return;
      }
      setError(
        res.status === 400
          ? rawError
          : "আপনার উত্তর নেওয়া যায়নি — অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন। / Please try again in a moment.",
      );
    } catch {
      markSubmitted("form2");
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-b from-zinc-50 to-[#f6f5f2]">
        <div className="w-full max-w-lg rounded-[36px] border border-zinc-200 bg-white p-8 md:p-10 text-center shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
          </div>
          <h1 className="mt-6 text-3xl font-black text-zinc-900 tracking-tight">
            Ratings Submitted!
          </h1>
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
            ধন্যবাদ! আপনার প্রতিটি টাইম-স্লট এবং দীর্ঘ বিরতি সংক্রান্ত রেটিং সংরক্ষিত হয়েছে।
          </p>

          <div className="mt-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 p-4 text-xs text-zinc-600 text-left space-y-1.5">
            <div className="flex justify-between">
              <span>Time Slots Rated:</span>
              <span className="font-bold text-zinc-800">7 of 7 slots</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold text-emerald-600">Recorded &amp; Counted</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/results/form2"
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-black py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-zinc-800"
            >
              <BarChart3 className="h-4 w-4" /> View Time-Slot Ranking Dashboard
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
      {/* Sticky Top Header */}
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
                style={{ width: `${(answered / total) * 100}%` }}
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
            <Sparkles className="h-3.5 w-3.5" /> Survey Form 2 • Time-Slot Rating
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-black leading-tight tracking-tight text-zinc-900">
            Fairness-Aware AI Routine Generator
          </h1>
          <p className="mt-1 text-lg font-bold text-violet-600">
            Daily Time-Slot Rating &amp; Fairness Survey
          </p>
          <p className="mt-3 text-sm md:text-base text-zinc-600 leading-relaxed">
            প্রতিটি ক্লাস স্লটকে ১ (Hate it) থেকে ৫ (Love it) রেটিং দিন। মাঝখানের দীর্ঘ বিরতি এবং
            একাধিক সেমিস্টারের ন্যায্যতার বিষয়ে আপনার দৃষ্টিভঙ্গি প্রদান করুন।
          </p>
        </div>

        {/* Role Selection */}
        <section className="mb-6 rounded-[28px] border border-zinc-200/80 bg-white p-6 md:p-7 shadow-sm">
          <h3 className="text-[17px] font-bold text-zinc-900">Are you a Student or Teacher? *</h3>
          <p className="mt-1 text-sm font-medium text-zinc-500">আপনার ভূমিকা নির্বাচন করুন</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const selected = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                    selected
                      ? "border-violet-600 bg-violet-50/70 font-bold text-violet-950 shadow-md ring-2 ring-violet-500/20"
                      : "border-zinc-200 bg-white font-medium text-zinc-700 hover:border-violet-300 hover:bg-zinc-50"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                      selected ? "bg-violet-600 text-white" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {r === "Student" ? (
                      <GraduationCap className="h-5 w-5" />
                    ) : (
                      <Briefcase className="h-5 w-5" />
                    )}
                  </span>
                  <div className="text-left">
                    <div className="text-sm font-bold">{r}</div>
                    <div className="text-xs text-zinc-400">
                      {r === "Student" ? "শিক্ষার্থী" : "শিক্ষক"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Department Selection */}
        <section className="mb-6 rounded-[28px] border border-zinc-200/80 bg-white p-6 md:p-7 shadow-sm">
          <h3 className="text-[17px] font-bold text-zinc-900">
            Which department do you belong to? *
          </h3>
          <p className="mt-1 text-sm font-medium text-zinc-500">আপনার বিভাগ নির্বাচন করুন</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                  <Building2
                    className={`h-4 w-4 ${selected ? "text-violet-600" : "text-zinc-400"}`}
                  />
                  <span className="text-sm">{d}</span>
                </button>
              );
            })}
          </div>
          {department === "Other" && (
            <input
              value={departmentOther}
              onChange={(e) => setDepartmentOther(e.target.value)}
              placeholder="আপনার বিভাগের নাম লিখুন"
              className="mt-3.5 w-full rounded-2xl border-2 border-zinc-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          )}
        </section>

        {/* Matrix of 7 time slots */}
        <TimeSlotMatrix
          values={timeSlots}
          onChange={(id, rating) => setTimeSlots((prev) => ({ ...prev, [id]: rating }))}
        />

        {/* Question 2: Long Campus Gaps */}
        <RatingPoll
          form="form2"
          questionId="long_gap_rating"
          index={2}
          title="2. Long Campus Gaps Between Classes (Idle Wait Time) *"
          titleBn="মনে করুন, আপনার একটি ক্লাস সকালে এবং পরের ক্লাসটি অনেক পরে — মাঝখানে ২ ঘণ্টারও বেশি ফাঁকা সময় আছে। এই দীর্ঘ বিরতি আপনার কাছে কেমন লাগে?"
          leftLabel="১ = একেবারেই অপছন্দ / সময়ের অপচয়"
          rightLabel="৫ = এতে কোনো সমস্যা নেই / কাজে লাগে"
          value={longGap}
          onChange={setLongGap}
          visual={<VisualLongGapForm2 />}
        />

        {/* Question 3: Multi-Semester Fairness */}
        <RatingPoll
          form="form2"
          questionId="fairness_rating"
          index={3}
          title="3. Multi-Semester Fairness (Algorithmic Memory) *"
          titleBn="ধরুন, কোনো শিক্ষার্থী দল বা শিক্ষক এই সেমিস্টারে একটি খারাপ রুটিন পেলেন। এআই (AI)-এর কি এটি মনে রাখা উচিত এবং পরের সেমিস্টারে তাদের সুবিধা পুষিয়ে দেওয়ার চেষ্টা করা উচিত?"
          leftLabel="১ = না, প্রতি সেমিস্টার আলাদা হোক"
          rightLabel="৫ = হ্যাঁ, অবশ্যই পুষিয়ে দেওয়া উচিত"
          value={fairness}
          onChange={setFairness}
          visual={<VisualFairness />}
        />

        {/* Question 4: Free-text feedback */}
        <section className="mb-6 rounded-[28px] border border-zinc-200/80 bg-white p-6 md:p-7 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-violet-700">
              4
            </span>
            <h3 className="text-[17px] font-bold text-zinc-900">
              Additional Feedback &amp; Constraints
            </h3>
          </div>
          <p className="mt-1 text-sm text-zinc-600 leading-relaxed">
            এআই রুটিন জেনারেটরের বিবেচনা করা উচিত — এমন আর কোনো পরামর্শ, বিশেষ কনস্ট্রেইন্ট বা সমস্যা কি
            আপনার জানা আছে?
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="আপনার মতামত বা পরামর্শ এখানে লিখুন (Optional)..."
            className="mt-4 h-28 w-full rounded-2xl border-2 border-zinc-200 p-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </section>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {/* Submit */}
        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || loading}
            className="w-full rounded-[24px] bg-black py-5 text-lg font-black text-white shadow-xl transition-all hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-black"
          >
            {loading ? "Submitting Ratings…" : `Submit Ratings (${answered}/${total})`}
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
