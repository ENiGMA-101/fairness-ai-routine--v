import type { ReactNode } from "react";

function Card({
  children,
  tone = "zinc",
  title,
}: {
  children: ReactNode;
  tone?: "red" | "green" | "blue" | "amber" | "violet" | "sky" | "emerald" | "purple" | "zinc";
  title?: string;
}) {
  const tones: Record<string, string> = {
    red: "bg-red-50 border-red-200",
    green: "bg-green-50 border-green-200",
    blue: "bg-blue-50 border-blue-200",
    amber: "bg-amber-50 border-amber-200",
    violet: "bg-violet-50 border-violet-200",
    sky: "bg-sky-50 border-sky-200",
    emerald: "bg-emerald-50 border-emerald-200",
    purple: "bg-purple-50 border-purple-200",
    zinc: "bg-zinc-50 border-zinc-200",
  };
  return (
    <div className={`rounded-2xl border p-3 ${tones[tone]}`}>
      {title ? <div className="text-[13px] font-bold text-zinc-800">{title}</div> : null}
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}

function Block({ text, tone }: { text: string; tone: "bad" | "ok" | "neutral" }) {
  const tones = {
    bad: "bg-red-500",
    ok: "bg-emerald-600",
    neutral: "bg-blue-600",
  } as const;
  return <div className={`${tones[tone]} rounded-lg px-2 py-1 text-white`}>{text}</div>;
}

export function VisualAvoid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="red" title="Option A — avoid early morning (8:00–11:00)">
        <Block text="8:00 – 9:20 ❌" tone="bad" />
        <Block text="11:00 onwards ✔" tone="ok" />
      </Card>
      <Card tone="blue" title="Option B — avoid late afternoon (3:30–6:20)">
        <Block text="Morning classes ✔" tone="ok" />
        <Block text="15:30 – 18:20 ❌" tone="bad" />
      </Card>
    </div>
  );
}

export function VisualPacked() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="amber" title="4 packed days (Sun–Wed)">
        <div>8:00–11:00 Theory</div>
        <div>11:00–14:00 Lab</div>
        <div className="font-bold">5–6 hours/day, intense</div>
      </Card>
      <Card tone="emerald" title="1 full off day (Thursday)">
        <div className="text-2xl font-black">100% OFF</div>
        <div>Mid-week rest</div>
        <div className="font-bold">Dedicated class-free day</div>
      </Card>
    </div>
  );
}

export function VisualBetween() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="blue" title="Option A — back-to-back (minimal waiting)">
        <Block text="9:00 – 10:20" tone="neutral" />
        <Block text="10:30 – 11:50" tone="neutral" />
      </Card>
      <Card tone="amber" title="Option B — adequate break + self study">
        <Block text="9:00 – 10:20" tone="neutral" />
        <Block text="Break + study 📚" tone="bad" />
        <Block text="14:00 – 15:20" tone="ok" />
      </Card>
    </div>
  );
}

export function VisualEarlyLate() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="sky" title="8:00 AM – 9:20 AM">
        <div>Early morning slot</div>
        <div className="text-zinc-500">Dismissed earlier in the afternoon</div>
      </Card>
      <Card tone="purple" title="5:00 PM – 6:20 PM">
        <div>Late evening slot</div>
        <div className="text-zinc-500">Late return in the evening</div>
      </Card>
    </div>
  );
}

export function VisualLongGap() {
  return (
    <div className="rounded-2xl border border-dashed border-red-300 bg-red-50 p-3 text-center">
      <div className="font-bold text-red-700">2h 40m+ gap between classes</div>
      <div className="text-xs text-zinc-600">Keep both on the same day, or move one to another day?</div>
    </div>
  );
}

export function VisualMidday() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="emerald" title="Mandatory break">
        <div>No classes 13:00 – 14:20</div>
      </Card>
      <Card tone="amber" title="Flexible">
        <div>Classes may run through the midday window</div>
      </Card>
    </div>
  );
}

export function VisualMaxHours() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="violet" title="Option A — max 3h/day, balanced">
        <div>More days, lighter days</div>
      </Card>
      <Card tone="zinc" title="Option B — 4h+ packed day, many off days">
        <div>Fewer days, heavier days</div>
      </Card>
    </div>
  );
}

export function VisualLabCap() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="emerald" title="Single 3h lab per day">
        <div>Focus + recovery time</div>
      </Card>
      <Card tone="purple" title="Double lab (6h) — too much">
        <div>Fatigue, low quality work</div>
      </Card>
    </div>
  );
}

export function VisualPriority() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="blue" title="Prioritize seniors">
        <div>Need specific credits to graduate on time</div>
      </Card>
      <Card tone="green" title="Prioritize juniors">
        <div>Helps them adapt to campus life</div>
      </Card>
    </div>
  );
}

export function VisualConflict() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="blue" title="Core & technical rounds">
        <div>Student-focused priority</div>
      </Card>
      <Card tone="purple" title="Concentration & working hours">
        <div>Teacher-focused priority</div>
      </Card>
    </div>
  );
}

export function VisualTeachingSchedule() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="blue" title="High density: 3–4 classes/day">
        <div>Fewer teaching days per week</div>
      </Card>
      <Card tone="purple" title="Scattered: 1–2 classes daily">
        <div>Spread across the week</div>
      </Card>
    </div>
  );
}

export function VisualZeroDay() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="sky" title="Fixed availability (Sun–Wed)">
        <div>One day with 0 classes for research</div>
      </Card>
      <Card tone="violet" title="Soft availability">
        <div>Classes every day, but light</div>
      </Card>
    </div>
  );
}

export function VisualConsecutive() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="blue" title="Back-to-back teaching stretch">
        <div>9:00 → 12:00 continuous</div>
      </Card>
      <Card tone="amber" title="Breaks between classes">
        <div>Rest, review, and reset</div>
      </Card>
    </div>
  );
}

export function VisualGapPref() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="red" title="Minimize gap — no waiting">
        <div>Leave campus right after class</div>
      </Card>
      <Card tone="green" title="1–2h consultation gap">
        <div>Research + student consultation time</div>
      </Card>
    </div>
  );
}

export function VisualFacultyConflict() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="blue" title="Seniority & workload based">
        <div>AI balances load across the department</div>
      </Card>
      <Card tone="green" title="First-come, first-serve">
        <div>Whoever requests the slot first wins</div>
      </Card>
    </div>
  );
}

export function VisualCompensate() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card tone="red" title="This semester — unfavorable routine">
        <div>Late evening slots, long gaps</div>
      </Card>
      <Card tone="green" title="Next semester — rewarded">
        <div>Priority on preferred slots</div>
      </Card>
    </div>
  );
}

export function VisualLongGapForm2() {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
      <div className="flex justify-between rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white">
        <span>8:00 AM – 9:20 AM</span>
        <span>Morning lecture</span>
      </div>
      <div className="my-2 rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-3 text-center">
        <div className="text-sm font-bold text-red-600">⏳ 2 hours 40 minutes gap (9:20 – 12:00)</div>
        <div className="text-xs text-zinc-500">Waiting / studying / unproductive</div>
      </div>
      <div className="flex justify-between rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white">
        <span>12:00 PM – 1:20 PM</span>
        <span>Afternoon class</span>
      </div>
    </div>
  );
}

export function VisualFairness() {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl border bg-zinc-50 p-4 text-xs">
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center">
        <div className="font-bold">Current semester</div>
        <div className="mt-1 rounded bg-red-100 px-2 py-1">Unfavorable routine</div>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
        →
      </div>
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-center">
        <div className="font-bold">Next semester</div>
        <div className="mt-1 rounded bg-emerald-100 px-2 py-1">Priority preferred slots</div>
      </div>
    </div>
  );
}

/** Map of question id → illustration used on Form 1. */
export const FORM1_VISUALS: Record<string, () => ReactNode> = {
  q_avoid: VisualAvoid,
  q_weekly_off: VisualPacked,
  q_between_classes: VisualBetween,
  q_extra_time: VisualEarlyLate,
  q_long_gap: VisualLongGap,
  q_midday_break: VisualMidday,
  q_max_hours: VisualMaxHours,
  q_lab_cap: VisualLabCap,
  q_priority_group: VisualPriority,
  q_conflict_student: VisualConflict,
  q_teaching_schedule: VisualTeachingSchedule,
  q_zero_day: VisualZeroDay,
  q_consecutive: VisualConsecutive,
  q_gap_pref: VisualGapPref,
  q_faculty_conflict: VisualFacultyConflict,
  q_compensate: VisualCompensate,
  q_conflict_teacher: VisualConflict,
};
