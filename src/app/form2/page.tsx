"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? `Submission failed (${res.status})`);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[32px] border border-zinc-200 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl">
            ✓
          </div>
          <h1 className="mt-6 text-2xl font-bold">Response submitted successfully</h1>
          <p className="mt-2 text-sm text-zinc-500">Your time-slot ratings are recorded. Thanks!</p>
          <Link
            href="/results/form2"
            className="mt-6 block rounded-full bg-black py-3 text-sm font-semibold text-white"
          >
            View live results
          </Link>
          <Link href="/" className="mt-3 block text-xs text-zinc-400">
            ← Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-bold">
            ← Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tabular-nums">
              {answered}/{total}
            </span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full bg-black transition-all duration-500"
                style={{ width: `${(answered / total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 rounded-[24px] border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black leading-tight">
            Fairness-Aware AI Routine Generator — Time-Slot Rating Survey
          </h1>
          <p className="mt-3 text-zinc-600">
            প্রতিটি সময়স্লট ১–৫ রেটিং দিন। আপনার রেটিং দেওয়ার সাথে সাথেই অন্যদের রেটিং দেখতে পাবেন।
          </p>
        </div>

        <section className="mb-5 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold">Are you a Student or a Teacher? *</h3>
          <div className="mt-4 space-y-3">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`w-full rounded-2xl border-2 px-4 py-3 text-left transition ${
                  role === r
                    ? "border-violet-600 bg-violet-50"
                    : "border-zinc-200 bg-white hover:border-zinc-400"
                }`}
              >
                {r === "Student" ? "Student (শিক্ষার্থী)" : "Teacher (শিক্ষক)"}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-5 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold">Which department do you belong to? *</h3>
          <div className="mt-4 space-y-3">
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDepartment(d)}
                className={`w-full rounded-2xl border-2 px-4 py-3 text-left transition ${
                  department === d
                    ? "border-violet-600 bg-violet-50"
                    : "border-zinc-200 bg-white hover:border-zinc-400"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          {department === "Other" ? (
            <input
              value={departmentOther}
              onChange={(e) => setDepartmentOther(e.target.value)}
              placeholder="আপনার বিভাগের নাম লিখুন"
              className="mt-3 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500"
            />
          ) : null}
        </section>

        <TimeSlotMatrix
          values={timeSlots}
          onChange={(id, rating) => setTimeSlots((prev) => ({ ...prev, [id]: rating }))}
        />

        <RatingPoll
          form="form2"
          questionId="long_gap_rating"
          title="2. Long campus gaps between classes (idle wait time) *"
          titleBn="মনে করুন, আপনার একটি ক্লাস সকালে এবং পরের ক্লাসটি অনেক পরে — মাঝখানে ২ ঘণ্টারও বেশি ফাঁকা সময় আছে। এই ব্যাপারটি আপনার কাছে কেমন লাগে?"
          leftLabel="আমি এটি একেবারেই পছন্দ করি না / সময়ের অপচয়"
          rightLabel="আমার এতে সমস্যা নেই / এই সময়টা আমার কাজে লাগে"
          value={longGap}
          onChange={setLongGap}
          visual={<VisualLongGapForm2 />}
        />

        <RatingPoll
          form="form2"
          questionId="fairness_rating"
          title="3. Multi-semester fairness (algorithmic memory) *"
          titleBn="ধরুন, কোনো শিক্ষার্থী দল বা শিক্ষক এই সেমিস্টারে একটি খারাপ রুটিন পেলেন। এআই (AI)-এর কি এটি মনে রাখা উচিত এবং পরের সেমিস্টারে তাদের একটি ভালো রুটিন দেওয়ার চেষ্টা করা উচিত?"
          leftLabel="না, প্রতিটি সেমিস্টারকে আলাদাভাবে দেখা উচিত"
          rightLabel="হ্যাঁ, এআই-এর উচিত পরের সেমিস্টারে তাদের সুবিধা পুষিয়ে দেওয়া"
          value={fairness}
          onChange={setFairness}
          visual={<VisualFairness />}
        />

        <section className="mb-5 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold">4. Additional feedback &amp; constraints</h3>
          <p className="mt-1 text-sm text-zinc-600">
            এআই রুটিন জেনারেটরের বিবেচনা করা উচিত — এমন আর কোনো পরামর্শ বা সমস্যা কি আপনার জানা আছে?
            আপনার মতামত এখানে লিখুন।
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Short answer text"
            className="mt-4 h-28 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500"
          />
        </section>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit || loading}
          className="w-full rounded-[20px] bg-black py-5 text-lg font-bold text-white transition disabled:opacity-40"
        >
          {loading ? "Submitting…" : `Submit (${answered}/${total})`}
        </button>
        <p className="mt-3 text-center text-xs text-zinc-400">
          Anonymous • one response per browser • stored in PostgreSQL
        </p>
      </div>
    </div>
  );
}
