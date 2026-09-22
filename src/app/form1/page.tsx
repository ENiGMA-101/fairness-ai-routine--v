"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PollCard from "@/components/PollCard";
import { FORM1_VISUALS } from "@/components/Visuals";
import { getBrowserId, isSubmitted, markSubmitted } from "@/lib/browser";
import { DEPARTMENTS, FORM1_QUESTIONS } from "@/lib/survey";

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

  useEffect(() => {
    if (isSubmitted("form1")) setSubmitted(true);
  }, []);

  const visible = useMemo(
    () => QUESTIONS.filter((q) => (role === "" ? false : q.audience === role || q.audience === "Both")),
    [role],
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
      if (res.ok || res.status === 409) {
        markSubmitted("form1");
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
          <p className="mt-2 text-sm text-zinc-500">
            Thank you! Your anonymous answers are stored. One response per browser is allowed.
          </p>
          <Link
            href="/results/form1"
            className="mt-6 block rounded-full bg-black py-3 text-sm font-semibold text-white"
          >
            View live results
          </Link>
          <Link
            href="/form2"
            className="mt-3 block rounded-full bg-zinc-100 py-3 text-sm font-semibold"
          >
            Also fill Form 2 (time-slot rating) →
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
                style={{ width: `${total ? (answered / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 rounded-[24px] border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black leading-tight">
            Fairness Aware AI Routine Generator — Student &amp; Teacher Survey
          </h1>
          <p className="mt-3 text-zinc-600">
            প্রশ্নগুলো একই পৃষ্ঠায় স্ক্রল করে উত্তর দিন। প্রতিটি উত্তর দেওয়ার পর লাইভ শতকরা ফলাফল দেখতে
            পাবেন — তবে আপনার ভোট গণনা হবে শুধু Submit চাপার পর।
          </p>
        </div>

        <PollCard
          form="form1"
          questionId="role"
          title={ROLE_QUESTION.titleBn}
          subtitle={ROLE_QUESTION.titleEn}
          options={ROLE_QUESTION.options}
          value={role}
          onChange={setRole}
        />

        <section className="mb-5 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold">
            <span className="text-violet-600">2. </span>
            আপনি কোন বিভাগের অন্তর্ভুক্ত?
          </h3>
          <p className="mt-1 text-sm text-zinc-500">Which department do you belong to? *</p>
          <div className="mt-4 space-y-3">
            {DEPARTMENTS.map((d) => {
              const selected = department === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepartment(d)}
                  className={`w-full rounded-2xl border-2 px-4 py-3 text-left transition ${
                    selected
                      ? "border-violet-600 bg-violet-50"
                      : "border-zinc-200 bg-white hover:border-zinc-400"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          {department === "Other" ? (
            <input
              value={departmentOther}
              onChange={(e) => setDepartmentOther(e.target.value)}
              placeholder="আপনার বিভাগের নাম লিখুন (Other department)"
              className="mt-3 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500"
            />
          ) : null}
        </section>

        {role === "" ? (
          <div className="rounded-[24px] border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
            উপরে আপনার ভূমিকা (Student / Teacher) নির্বাচন করলে প্রশ্নগুলো দেখা যাবে।
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
              />
            );
          })
        )}

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
