import type { ReactNode } from "react";
import {
  Sun,
  Moon,
  Clock,
  Calendar,
  BookOpen,
  Coffee,
  GraduationCap,
  Scale,
  Sparkles,
  ArrowRight,
  Check,
  X,
  Users,
  Briefcase,
  FlaskConical,
  Zap,
  BatteryCharging,
  Hourglass,
  CalendarDays,
  Flame,
} from "lucide-react";

export function VisualAvoid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-xs">
      <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-4 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-red-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <Sun className="h-4 w-4 text-amber-600" />
            </span>
            Option A: Avoid Early Morning
          </div>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
            8–11 AM OFF
          </span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white/80 p-2.5 text-zinc-700">
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-zinc-400" /> 08:00 – 10:50 AM
            </span>
            <span className="flex items-center gap-1 rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <X className="h-3 w-3" /> Avoid
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white/80 p-2.5 text-zinc-700">
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-zinc-400" /> 11:00 AM Onward
            </span>
            <span className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <Check className="h-3 w-3" /> Preferred
            </span>
          </div>
        </div>
        <div className="mt-2.5 text-[11px] text-zinc-500">
          💡 Good for long commute or avoiding early morning rush
        </div>
      </div>

      <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-blue-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Moon className="h-4 w-4 text-indigo-600" />
            </span>
            Option B: Avoid Late Evening
          </div>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
            3:30–6:20 PM OFF
          </span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white/80 p-2.5 text-zinc-700">
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-zinc-400" /> Morning &amp; Midday
            </span>
            <span className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <Check className="h-3 w-3" /> Preferred
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-white/80 p-2.5 text-zinc-700">
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-zinc-400" /> 03:30 – 06:20 PM
            </span>
            <span className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <X className="h-3 w-3" /> Avoid
            </span>
          </div>
        </div>
        <div className="mt-2.5 text-[11px] text-zinc-500">
          💡 Reach home before dark; evening is free for self-study
        </div>
      </div>
    </div>
  );
}

export function VisualPacked() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-xs">
      <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-emerald-900">4 Intense Days + 1 Day OFF</span>
          <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow">
            🎉 100% OFF DAY
          </span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5 text-center">
          {["Sun", "Mon", "Tue", "Wed"].map((day) => (
            <div key={day} className="rounded-xl border border-emerald-300 bg-emerald-100/70 p-2">
              <div className="font-bold text-emerald-900">{day}</div>
              <div className="mt-1 text-[10px] font-semibold text-emerald-700">5-6 hrs</div>
            </div>
          ))}
          <div className="rounded-xl border-2 border-dashed border-emerald-500 bg-white p-2">
            <div className="font-black text-emerald-700">Thu</div>
            <div className="mt-1 font-black text-emerald-600">FREE!</div>
          </div>
        </div>
        <div className="mt-3 text-[11px] font-medium text-emerald-800">
          ✔ Dedicated weekly day for projects, study &amp; rest
        </div>
      </div>

      <div className="rounded-2xl border-2 border-zinc-200 bg-gradient-to-br from-zinc-50 to-slate-100 p-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-zinc-800">5 Lighter Days (Spread Out)</span>
          <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-[10px] font-bold text-zinc-700">
            Balanced Daily
          </span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu"].map((day) => (
            <div key={day} className="rounded-xl border border-zinc-300 bg-white p-2">
              <div className="font-bold text-zinc-700">{day}</div>
              <div className="mt-1 text-[10px] text-zinc-500">2-3 hrs</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[11px] font-medium text-zinc-600">
          ✔ No exhausting 6-hour days, but campus visit every day
        </div>
      </div>
    </div>
  );
}

export function VisualBetween() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-xs">
      <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <div className="flex items-center gap-2 font-bold text-indigo-900">
          <Zap className="h-4 w-4 text-indigo-600" /> Back-to-Back (Minimal Waiting)
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="rounded-xl bg-indigo-600 p-2.5 font-bold text-white shadow-sm flex justify-between">
            <span>Class 1: 09:00 – 10:20</span>
            <span className="text-[10px] bg-indigo-700 px-1.5 py-0.5 rounded">Theory</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1 text-[11px] font-bold text-indigo-600">
            <span>⚡ 10 min break</span>
          </div>
          <div className="rounded-xl bg-indigo-600 p-2.5 font-bold text-white shadow-sm flex justify-between">
            <span>Class 2: 10:30 – 11:50</span>
            <span className="text-[10px] bg-indigo-700 px-1.5 py-0.5 rounded">Lab/Theory</span>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-indigo-800">
          ✨ Fast paced: dismiss from campus early!
        </div>
      </div>

      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <Coffee className="h-4 w-4 text-amber-600" /> Adequate Break &amp; Self-Study
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="rounded-xl bg-amber-700 p-2.5 font-bold text-white shadow-sm flex justify-between">
            <span>Class 1: 09:00 – 10:20</span>
            <span className="text-[10px] bg-amber-800 px-1.5 py-0.5 rounded">Morning</span>
          </div>
          <div className="rounded-xl border-2 border-dashed border-amber-300 bg-white p-2 text-center text-amber-800 font-semibold">
            ☕ Lunch • Library • Relax (2h Break)
          </div>
          <div className="rounded-xl bg-emerald-700 p-2.5 font-bold text-white shadow-sm flex justify-between">
            <span>Class 2: 12:30 – 01:50</span>
            <span className="text-[10px] bg-emerald-800 px-1.5 py-0.5 rounded">Afternoon</span>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-amber-800">
          🌱 Time to absorb material &amp; discuss with peers
        </div>
      </div>
    </div>
  );
}

export function VisualEarlyLate() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-xs">
      <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-4">
        <div className="flex items-center gap-2 font-bold text-sky-900">
          <Sun className="h-4 w-4 text-amber-500" /> 08:00 AM – 09:20 AM Slot
        </div>
        <div className="mt-2 text-zinc-600 leading-relaxed">
          Early morning start, but your day finishes much earlier in the afternoon.
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white p-2.5 border border-sky-200 font-semibold text-sky-800">
          <ArrowRight className="h-4 w-4 text-sky-500" /> Dismissed by 2:00 PM
        </div>
      </div>

      <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 p-4">
        <div className="flex items-center gap-2 font-bold text-purple-900">
          <Moon className="h-4 w-4 text-purple-600" /> 05:00 PM – 06:20 PM Slot
        </div>
        <div className="mt-2 text-zinc-600 leading-relaxed">
          Sleep in later in the morning, but you travel home in evening rush hour.
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white p-2.5 border border-purple-200 font-semibold text-purple-800">
          <ArrowRight className="h-4 w-4 text-purple-500" /> Dismissed after 6:30 PM
        </div>
      </div>
    </div>
  );
}

export function VisualLongGap() {
  return (
    <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-4 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-red-900">
          <Hourglass className="h-4 w-4 text-red-600" />
          The Long Gap Dilemma (2 Hours 40 Minutes+)
        </div>
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
          Campus Idle Wait
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 rounded-xl bg-blue-600 p-2.5 text-center font-bold text-white shadow">
          Class 1 (08:00–09:20)
        </div>
        <div className="flex-1 rounded-xl border-2 border-dashed border-red-400 bg-white p-2 text-center font-bold text-red-600">
          ⏳ 2h 40m Gap
        </div>
        <div className="flex-1 rounded-xl bg-blue-600 p-2.5 text-center font-bold text-white shadow">
          Class 2 (12:00–01:20)
        </div>
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-zinc-600 font-medium">
        <span>Option A: Keep same day (finish together)</span>
        <span>Option B: Move to another day (no idle waiting)</span>
      </div>
    </div>
  );
}

export function VisualMidday() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-xs">
      <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
        <div className="flex items-center gap-2 font-bold text-emerald-900">
          <span className="text-base">🍱🕌</span> Mandatory Break (1:00 – 2:20 PM)
        </div>
        <div className="mt-2 text-zinc-600">
          Fixed sacred break window for all students &amp; teachers. Zero classes scheduled.
        </div>
        <div className="mt-3 rounded-xl border border-emerald-300 bg-white p-2.5 font-bold text-emerald-700">
          ✔ Guaranteed lunch &amp; prayer time every day
        </div>
      </div>

      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <Zap className="h-4 w-4 text-amber-600" /> Flexible Schedule
        </div>
        <div className="mt-2 text-zinc-600">
          Classes can run through midday if it allows an earlier finish or an extra day off.
        </div>
        <div className="mt-3 rounded-xl border border-amber-300 bg-white p-2.5 font-bold text-amber-700">
          ✔ Flexible routine optimization
        </div>
      </div>
    </div>
  );
}

export function VisualMaxHours() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-xs">
      <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
        <div className="flex items-center gap-2 font-bold text-violet-900">
          <BatteryCharging className="h-4 w-4 text-violet-600" /> Max 3 Hours / Day
        </div>
        <div className="mt-2 text-zinc-600">
          High concentration, lower daily fatigue, but spread across more days.
        </div>
      </div>
      <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-zinc-100 p-4">
        <div className="flex items-center gap-2 font-bold text-zinc-800">
          <Flame className="h-4 w-4 text-orange-600" /> 4+ Hours / Day (Packed)
        </div>
        <div className="mt-2 text-zinc-600">
          High endurance sprint days in exchange for more free weekdays.
        </div>
      </div>
    </div>
  );
}

export function VisualLabCap() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-xs">
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 font-bold text-emerald-900">
          <FlaskConical className="h-4 w-4 text-emerald-600" /> 1 Lab / Day (3 Hours)
        </div>
        <div className="mt-2 text-zinc-600">
          Standard practical session. Ample focus without cognitive overload.
        </div>
      </div>
      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
        <div className="flex items-center gap-2 font-bold text-rose-900">
          <span className="text-base">🔬🔬</span> 2 Labs / Day (6 Hours)
        </div>
        <div className="mt-2 text-zinc-600">
          Double practical sessions in one day. High physical and mental strain.
        </div>
      </div>
    </div>
  );
}

export function VisualPriority() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-xs">
      <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2 font-bold text-blue-900">
          <GraduationCap className="h-4 w-4 text-blue-600" /> Seniors Get Priority
        </div>
        <div className="mt-2 text-zinc-600">
          Crucial credit requirements to graduate on time and manage thesis/internships.
        </div>
      </div>
      <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 p-4">
        <div className="flex items-center gap-2 font-bold text-teal-900">
          <BookOpen className="h-4 w-4 text-teal-600" /> Juniors Get Priority
        </div>
        <div className="mt-2 text-zinc-600">
          Helps new students transition comfortably to university life and build habits.
        </div>
      </div>
    </div>
  );
}

export function VisualConflict() {
  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-indigo-900">
          <Scale className="h-4 w-4 text-indigo-600" />
          Student vs Teacher Preference Conflict
        </div>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
          AI Arbiter
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-blue-200 bg-white p-3 shadow-sm">
          <div className="font-bold text-blue-800">Students First</div>
          <div className="mt-1 text-[11px] text-zinc-500">
            Optimize for student learning, travel safety &amp; attendance.
          </div>
        </div>
        <div className="rounded-xl border border-purple-200 bg-white p-3 shadow-sm">
          <div className="font-bold text-purple-800">Teacher First</div>
          <div className="mt-1 text-[11px] text-zinc-500">
            Optimize for faculty research, consultation hours &amp; prep time.
          </div>
        </div>
      </div>
    </div>
  );
}

export function VisualTeachingSchedule() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-xs">
      <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2 font-bold text-blue-900">
          <Briefcase className="h-4 w-4 text-blue-600" /> Compact (Fewer Days, More Classes)
        </div>
        <div className="mt-2 text-zinc-600">3–4 classes per day on 2–3 dedicated teaching days.</div>
      </div>
      <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-4">
        <div className="flex items-center gap-2 font-bold text-purple-900">
          <CalendarDays className="h-4 w-4 text-purple-600" /> Distributed (Daily Lighter Load)
        </div>
        <div className="mt-2 text-zinc-600">1–2 classes daily spread throughout the week.</div>
      </div>
    </div>
  );
}

export function VisualZeroDay() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-xs">
      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4">
        <div className="flex items-center gap-2 font-bold text-sky-900">
          <Calendar className="h-4 w-4 text-sky-600" /> 1 Zero-Teaching Day (Recommended)
        </div>
        <div className="mt-2 text-zinc-600">
          A full day with 0 teaching hours for research, PhD work, and exam paper grading.
        </div>
      </div>
      <div className="rounded-2xl border-2 border-zinc-200 bg-zinc-50 p-4">
        <div className="flex items-center gap-2 font-bold text-zinc-800">
          <Clock className="h-4 w-4 text-zinc-600" /> Flexible Spread
        </div>
        <div className="mt-2 text-zinc-600">
          Classes spread across all days without a dedicated zero day.
        </div>
      </div>
    </div>
  );
}

export function VisualConsecutive() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-xs">
      <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4">
        <div className="font-bold text-indigo-900">Continuous 3 Classes</div>
        <div className="mt-1 text-zinc-600">Finish all teaching in one continuous stretch.</div>
      </div>
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
        <div className="font-bold text-emerald-900">With Breathers</div>
        <div className="mt-1 text-zinc-600">Rest, drink water, and review notes between classes.</div>
      </div>
    </div>
  );
}

export function VisualGapPref() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-xs">
      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
        <div className="font-bold text-rose-900">Minimize Gaps</div>
        <div className="mt-1 text-zinc-600">Leave campus immediately after your final lecture.</div>
      </div>
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
        <div className="font-bold text-emerald-900">1–2h Consultation Window</div>
        <div className="mt-1 text-zinc-600">
          Dedicated office hours for advising students and thesis counseling.
        </div>
      </div>
    </div>
  );
}

export function VisualFacultyConflict() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 text-xs">
      <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
        <div className="font-bold text-blue-900">Seniority &amp; Workload Metric</div>
        <div className="mt-1 text-zinc-600">
          Fair algorithmic weight based on academic rank and semester course load.
        </div>
      </div>
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
        <div className="font-bold text-amber-900">First-Come, First-Served</div>
        <div className="mt-1 text-zinc-600">Early slot requests receive priority approval.</div>
      </div>
    </div>
  );
}

export function VisualCompensate() {
  return (
    <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-r from-red-50 via-amber-50 to-emerald-50 p-4 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-violet-900">Algorithmic Fairness (Semester Memory)</span>
        <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">
          Multi-Semester AI
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-center">
        <div className="flex-1 rounded-xl border border-red-200 bg-white p-2.5">
          <div className="font-bold text-red-600">Semester 1 (Bad Slots)</div>
          <div className="text-[10px] text-zinc-500">Unfavorable evening hours</div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white font-bold shrink-0">
          →
        </div>
        <div className="flex-1 rounded-xl border border-emerald-200 bg-white p-2.5">
          <div className="font-bold text-emerald-600">Semester 2 (Compensated)</div>
          <div className="text-[10px] text-zinc-500">Priority for best preferred slots</div>
        </div>
      </div>
    </div>
  );
}

export function VisualLongGapForm2() {
  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 text-xs">
      <div className="flex items-center justify-between font-bold text-indigo-900">
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-600" /> Routine Timeline
        </span>
        <span className="rounded-full bg-indigo-200 px-2.5 py-0.5 text-[10px] text-indigo-800">
          Campus Idle Wait
        </span>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between rounded-xl bg-blue-600 p-2.5 font-bold text-white shadow-sm">
          <span>08:00 AM – 09:20 AM</span>
          <span className="text-[10px] bg-blue-700 px-2 py-0.5 rounded">Morning Lecture</span>
        </div>
        <div className="rounded-xl border-2 border-dashed border-red-300 bg-white p-3 text-center">
          <div className="font-bold text-red-600 text-sm">
            ⏳ 2 Hours 40 Minutes Gap (09:20 AM – 12:00 PM)
          </div>
          <div className="mt-0.5 text-[11px] text-zinc-500">
            Waiting on campus • Unproductive or Study time?
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-blue-600 p-2.5 font-bold text-white shadow-sm">
          <span>12:00 PM – 01:20 PM</span>
          <span className="text-[10px] bg-blue-700 px-2 py-0.5 rounded">Afternoon Class</span>
        </div>
      </div>
    </div>
  );
}

export function VisualFairness() {
  return (
    <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 text-xs">
      <div className="flex items-center justify-between font-bold text-violet-900">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600" /> Multi-Semester Memory
        </span>
        <span className="rounded-full bg-violet-200 px-2.5 py-0.5 text-[10px] text-violet-800 font-bold">
          AI Fairness Balance
        </span>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="rounded-xl border border-red-200 bg-white p-3 text-center shadow-sm">
          <div className="font-bold text-red-700">Current Semester</div>
          <div className="mt-1 rounded bg-red-50 p-1 text-[11px] text-red-600">
            Unfavorable routine
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white font-bold shadow">
          →
        </div>
        <div className="rounded-xl border border-emerald-300 bg-white p-3 text-center shadow-sm">
          <div className="font-bold text-emerald-700">Next Semester</div>
          <div className="mt-1 rounded bg-emerald-50 p-1 text-[11px] text-emerald-600 font-semibold">
            Priority preferred slots
          </div>
        </div>
      </div>
    </div>
  );
}

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
