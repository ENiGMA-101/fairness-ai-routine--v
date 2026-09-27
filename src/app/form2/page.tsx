"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import {
  GraduationCap,
  CheckCircle2,
  Sparkles,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import RatingPoll from "@/components/RatingPoll";
import TimeSlotMatrix from "@/components/TimeSlotMatrix";
import ProfilePoll from "@/components/ProfilePoll";
import SurveyNavigator, { focusSurveyQuestion } from "@/components/SurveyNavigator";
import HomeButton from "@/components/HomeButton";
import { useSurveyPollStats } from "@/lib/poll-stats-client";
import { VisualFairness, VisualLongGapForm2 } from "@/components/Visuals";
import { getBrowserId, isSubmitted, markSubmitted } from "@/lib/browser";
import {
  FORM2_COPY,
  FORM2_DEPARTMENT_OPTIONS,
  ROLE_OPTIONS,
  TIME_SLOTS,
  RATING_SCALE,
  SURVEY_VERSION,
  shuffleSessionValues,
} from "@/lib/survey";

export default function Form2Page() {
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [departmentOther, setDepartmentOther] = useState("");
  const [timeSlots, setTimeSlots] = useState<Record<string, number>>({});
  const [longGap, setLongGap] = useState<number | null>(null);
  const [fairness, setFairness] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invalidQuestion, setInvalidQuestion] = useState<string | null>(null);
  const [invalidSlotId, setInvalidSlotId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const { stats: batchStats, status: statsStatus } = useSurveyPollStats("form2");

  useEffect(() => {
    if (isSubmitted("form2")) {
      setSubmitted(true);
      setAlreadySubmitted(true);
    }
  }, []);

  const [scaleOrders, setScaleOrders] = useState<Record<string, number[]>>({});
  useEffect(() => {
    let active = true;
    const key = `form2-rating-order:v${SURVEY_VERSION}`;
    let previous: Record<string, number[]> = {};
    try { previous = JSON.parse(window.sessionStorage.getItem(key) || "{}"); } catch { /* storage optional */ }
    const values = RATING_SCALE.map(({ value }) => value);
    const next = {
      matrix: shuffleSessionValues(values, previous.matrix),
      long_gap_rating: shuffleSessionValues(values, previous.long_gap_rating),
      fairness_rating: shuffleSessionValues(values, previous.fairness_rating),
    };
    try { window.sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* storage optional */ }
    queueMicrotask(() => { if (active) setScaleOrders(next); });
    return () => { active = false; };
  }, []);

  const total = 11;
  const answered = useMemo(() => {
    let count = 0;
    if (role) count += 1;
    if (department && (department !== "Other" || departmentOther.trim())) count += 1;
    count += Object.keys(timeSlots).length;
    if (longGap !== null) count += 1;
    if (fairness !== null) count += 1;
    return count;
  }, [role, department, departmentOther, timeSlots, longGap, fairness]);

  const allSlotsRated = TIME_SLOTS.every((s) => Boolean(timeSlots[s.id]));
  const canSubmit =
    Boolean(role) &&
    Boolean(department) &&
    allSlotsRated &&
    longGap !== null &&
    fairness !== null &&
    (department !== "Other" || departmentOther.trim().length > 0);

  const navigatorIds = useMemo(() => ["role", "department", "time-slots", "long_gap_rating", "fairness_rating", "feedback"], []);
  const clearValidation = (id: string) => {
    if (invalidQuestion === id) {
      setInvalidQuestion(null);
      setValidationMessage("");
    }
    setError("");
  };

  const submit = async () => {
    if (loading) return;
    if (!canSubmit) {
      const missingSlot = TIME_SLOTS.find(({ id }) => !timeSlots[id]);
      const missing = !role ? "role" : !department || (department === "Other" && !departmentOther.trim())
        ? "department" : missingSlot ? "time-slots" : longGap === null ? "long_gap_rating" : "fairness_rating";
      setInvalidQuestion(missing);
      setInvalidSlotId(missingSlot?.id ?? null);
      setValidationMessage("Please answer this required question before submitting. / অনুগ্রহ করে এই প্রশ্নের উত্তর দিন।");
      window.requestAnimationFrame(() => focusSurveyQuestion(missingSlot ? `slot-${missingSlot.id}` : missing));
      return;
    }
    setLoading(true);
    setError("");
    setValidationMessage("");

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

      if (res.status === 409) {
        markSubmitted("form2");
        setAlreadySubmitted(true);
        setSubmitted(true);
        return;
      }
      if (res.ok) {
        markSubmitted("form2");
        setSubmitted(true);
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch {
          /* animation is optional */
        }
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(res.status === 400 && data.error
        ? data.error
        : "আপনার উত্তর জমা হয়নি। অনুগ্রহ করে সংযোগ যাচাই করে আবার চেষ্টা করুন। / Your response was not saved. Please try again.");
    } catch {
      setError("সংযোগ পাওয়া যায়নি। আপনার উত্তর জমা হয়নি — পরে আবার চেষ্টা করুন। / Connection lost. Please retry.");
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
              Your earlier ratings are safely recorded and counted in the live results.
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <Link
              href="/results/form2"
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-black py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-zinc-800"
            >
              <BarChart3 className="h-4 w-4" /> View Live Results
            </Link>
            <HomeButton label="Back to survey home" />
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
            Thank you! Your response has been submitted successfully.
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
              href="/form1"
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-700"
            >
              <GraduationCap className="h-4 w-4" /> Now submit Form 1 (Student &amp; Teacher) →
            </Link>
            <Link
              href="/results/form2"
              className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-zinc-200 bg-white py-3.5 text-sm font-bold text-zinc-800 transition hover:bg-zinc-50"
            >
              <BarChart3 className="h-4 w-4" /> View Time-Slot Ranking Dashboard
            </Link>
            {/* placeholder-removed */}
            <HomeButton label="Back to survey home" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f5f2] pb-24 dark:bg-[#0a1326]">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <HomeButton />

          <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
            <span className="whitespace-nowrap text-[11px] font-bold text-zinc-500 tabular-nums sm:text-xs">
              {answered} / {total} answered
            </span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-200 sm:h-2.5 sm:w-28 md:w-36">
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
        {/* Research introduction */}
        <div className="mb-6 overflow-hidden rounded-[28px] border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-fuchsia-50 p-6 shadow-sm sm:p-8 dark:border-sky-500/30 dark:from-[#17334b] dark:via-[#18243b] dark:to-[#332248]">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200">
            <Sparkles className="h-3.5 w-3.5" /> Research survey · Form 02
          </div>
          <h1 className="mt-4 text-[27px] font-black leading-tight tracking-tight text-slate-950 sm:text-[34px] dark:text-white">
            Fairness-Aware AI <span className="text-sky-700 dark:text-sky-300">Routine Generator</span>
          </h1>
          <p className="mt-1 text-base font-bold text-slate-700 dark:text-slate-200">Time-slot Rating &amp; Fairness Survey</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            আপনার পছন্দের ক্লাসের সময় রেট করুন। একটি রেটিং বেছে নিলে সেই প্রশ্নের সব রেটিংয়ের ভোটসংখ্যা ও শতকরা ফল দেখতে পাবেন। ভোট গণনা হবে শুধু Submit চাপার পর।
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-sky-100 px-3 py-1.5 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200">7 daily slots</span>
            <span className="rounded-full bg-fuchsia-100 px-3 py-1.5 text-fuchsia-800 dark:bg-fuchsia-500/20 dark:text-fuchsia-200">Fairness over time</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">Anonymous</span>
          </div>
        </div>

        {/* Profile questions remain fixed and show their own live results after selection. */}
        <ProfilePoll
          id="role"
          title="Are you a Student or Teacher?"
          options={ROLE_OPTIONS}
          value={role}
          stats={batchStats.role}
          status={statsStatus}
          invalid={invalidQuestion === "role"}
          onChange={(value) => { setRole(value); clearValidation("role"); }}
        />

        <ProfilePoll
          id="department"
          title="Which Department do you belong to?"
          options={FORM2_DEPARTMENT_OPTIONS}
          value={department}
          stats={batchStats.department}
          status={statsStatus}
          invalid={invalidQuestion === "department"}
          onChange={(value) => { setDepartment(value); clearValidation("department"); }}
        >
          {department === "Other" && (
            <input
              id="department-other"
              value={departmentOther}
              onChange={(event) => { setDepartmentOther(event.target.value); clearValidation("department"); }}
              placeholder="Enter your department"
              aria-label="Other department name"
              className="mt-3 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-600"
            />
          )}
        </ProfilePoll>

        {/* Matrix of 7 time slots */}
        <TimeSlotMatrix
          values={timeSlots}
          onChange={(id, rating) => {
            setTimeSlots((prev) => ({ ...prev, [id]: rating }));
            setInvalidSlotId(null);
            clearValidation("time-slots");
          }}
          initialStats={batchStats}
          statsStatus={statsStatus}
          invalidSlotId={invalidSlotId}
          scaleOrder={scaleOrders.matrix}
        />

        {/* Questions 2 and 3 — fixed Google Forms order */}
        <RatingPoll
          form="form2"
          questionId="long_gap_rating"
          index={2}
          initialStats={batchStats}
          statsStatus={statsStatus}
          title={`${FORM2_COPY.longGapTitle} *`}
          titleBn={FORM2_COPY.longGapBn}
          leftLabel={FORM2_COPY.longGapLeft}
          rightLabel={FORM2_COPY.longGapRight}
          value={longGap}
          onChange={(rating) => { setLongGap(rating); clearValidation("long_gap_rating"); }}
          invalid={invalidQuestion === "long_gap_rating"}
          scaleOrder={scaleOrders.long_gap_rating}
          visual={<VisualLongGapForm2 />}
        />

        <RatingPoll
          form="form2"
          questionId="fairness_rating"
          index={3}
          initialStats={batchStats}
          statsStatus={statsStatus}
          title={`${FORM2_COPY.fairnessTitle} *`}
          titleBn={FORM2_COPY.fairnessBn}
          leftLabel={FORM2_COPY.fairnessLeft}
          rightLabel={FORM2_COPY.fairnessRight}
          value={fairness}
          onChange={(rating) => { setFairness(rating); clearValidation("fairness_rating"); }}
          invalid={invalidQuestion === "fairness_rating"}
          scaleOrder={scaleOrders.fairness_rating}
          visual={<VisualFairness />}
        />

        {/* Question 4: Free-text feedback (optional) */}
        <section id="question-feedback" tabIndex={-1} className="survey-card mb-5 scroll-mt-32 rounded-[24px] border border-zinc-200/80 bg-white p-4 outline-none focus-visible:ring-4 focus-visible:ring-violet-300 sm:mb-6 sm:rounded-[28px] sm:p-7">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-violet-700">
              4
            </span>
            <h3 className="text-[17px] font-bold text-zinc-900">{FORM2_COPY.feedbackTitle}</h3>
          </div>
          <p className="mt-1 text-sm text-zinc-600 leading-relaxed">{FORM2_COPY.feedbackBn}</p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={FORM2_COPY.feedbackPlaceholder}
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
            disabled={loading}
            aria-busy={loading}
            className="w-full min-h-[58px] touch-manipulation rounded-[20px] bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 text-base font-black text-white shadow-xl shadow-violet-500/20 transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-wait disabled:opacity-65 sm:rounded-[24px] sm:py-5 sm:text-lg"
          >
            {loading ? "Submitting Ratings…" : `Submit Ratings (${answered}/${total})`}
          </button>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-zinc-400">
            <span>🔒 Fully anonymous</span><span>•</span>
            <span>One vote per browser</span><span>•</span>
            <span>Live results after selection</span>
          </div>
        </div>
      </div>
      <SurveyNavigator ids={navigatorIds} answered={answered} total={total} validationMessage={validationMessage} />
    </div>
  );
}
