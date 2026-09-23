import { NextResponse, type NextRequest } from "next/server";
import { db, ensureTablesExist, isDatabaseConfigured, markDatabaseBroken } from "@/db";
import { form1Responses } from "@/db/schema";
import { addForm1Response } from "@/lib/storage";
import { FORM1_COLUMN_KEYS, DEPARTMENTS, SEMESTERS } from "@/lib/survey";

export const dynamic = "force-dynamic";

const ROLES = ["Student", "Teacher"];
const VALUES: Record<string, string[]> = {
  q_avoid: ["morning", "evening"],
  q_weekly_off: ["one_day_off", "daily"],
  q_between_classes: ["back_to_back", "with_break"],
  q_extra_time: ["early", "late", "either"],
  q_long_gap: ["same_day", "different_day"],
  q_midday_break: ["mandatory", "flexible"],
  q_max_hours: ["3h", "4h_plus"],
  q_lab_cap: ["one", "two"],
  q_priority_group: ["seniors", "juniors"],
  q_conflict_student: ["students_first", "teacher_first"],
  q_teaching_schedule: ["less_days", "daily_less"],
  q_zero_day: ["yes", "no"],
  q_consecutive: ["continuous", "with_break"],
  q_gap_pref: ["no_gap", "consultation"],
  q_faculty_conflict: ["seniority", "first_come"],
  q_compensate: ["yes", "no"],
  q_conflict_teacher: ["students_first", "teacher_first"],
};

type Body = {
  browser_id?: string;
  role?: string;
  department?: string;
  department_other?: string | null;
  answers?: Record<string, string>;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const browserId = (body.browser_id ?? "").trim();
  const role = (body.role ?? "").trim();
  const department = (body.department ?? "").trim();
  const departmentOther = body.department_other?.toString().trim() || null;
  const answers = body.answers ?? {};

  if (!browserId) return NextResponse.json({ error: "browser_id is required" }, { status: 400 });
  if (!ROLES.includes(role)) return NextResponse.json({ error: "role is required" }, { status: 400 });
  if (!department) return NextResponse.json({ error: "department is required" }, { status: 400 });
  if (department === "Other" && !departmentOther) {
    return NextResponse.json({ error: "Please specify your department" }, { status: 400 });
  }
  if (department !== "Other" && !DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) {
    return NextResponse.json({ error: "Unknown department" }, { status: 400 });
  }

  const values: Partial<typeof form1Responses.$inferInsert> = {
    browserId,
    role,
    department,
    departmentOther,
  };

  const provided = new Set<string>();
  for (const [key, raw] of Object.entries(answers)) {
    if (!FORM1_COLUMN_KEYS.includes(key as (typeof FORM1_COLUMN_KEYS)[number])) continue;
    const value = raw?.toString().trim();
    if (!value) continue;
    if (key === "role" || key === "department") continue;
    if (key === "semester") {
      if (!SEMESTERS.includes(value as (typeof SEMESTERS)[number])) continue;
      values.semester = value;
    } else {
      const allowed = VALUES[key];
      if (!allowed || !allowed.includes(value)) continue;
      const mapped: Record<string, Partial<typeof form1Responses.$inferInsert>> = {
        q_avoid: { qAvoid: value },
        q_weekly_off: { qWeeklyOff: value },
        q_between_classes: { qBetweenClasses: value },
        q_extra_time: { qExtraTime: value },
        q_long_gap: { qLongGap: value },
        q_midday_break: { qMiddayBreak: value },
        q_max_hours: { qMaxHours: value },
        q_lab_cap: { qLabCap: value },
        q_priority_group: { qPriorityGroup: value },
        q_conflict_student: { qConflictStudent: value },
        q_teaching_schedule: { qTeachingSchedule: value },
        q_zero_day: { qZeroDay: value },
        q_consecutive: { qConsecutive: value },
        q_gap_pref: { qGapPref: value },
        q_faculty_conflict: { qFacultyConflict: value },
        q_compensate: { qCompensate: value },
        q_conflict_teacher: { qConflictTeacher: value },
      };
      Object.assign(values, mapped[key]);
    }
    provided.add(key);
  }

  if (role === "Student" && !provided.has("semester")) {
    return NextResponse.json({ error: "Semester is required for students" }, { status: 400 });
  }

  // Prepared data object for fallback / local storage
  const storagePayload = {
    browserId,
    role,
    department,
    departmentOther,
    semester: values.semester ?? null,
    qAvoid: values.qAvoid ?? null,
    qWeeklyOff: values.qWeeklyOff ?? null,
    qBetweenClasses: values.qBetweenClasses ?? null,
    qExtraTime: values.qExtraTime ?? null,
    qLongGap: values.qLongGap ?? null,
    qMiddayBreak: values.qMiddayBreak ?? null,
    qMaxHours: values.qMaxHours ?? null,
    qLabCap: values.qLabCap ?? null,
    qPriorityGroup: values.qPriorityGroup ?? null,
    qConflictStudent: values.qConflictStudent ?? null,
    qTeachingSchedule: values.qTeachingSchedule ?? null,
    qZeroDay: values.qZeroDay ?? null,
    qConsecutive: values.qConsecutive ?? null,
    qGapPref: values.qGapPref ?? null,
    qFacultyConflict: values.qFacultyConflict ?? null,
    qCompensate: values.qCompensate ?? null,
    qConflictTeacher: values.qConflictTeacher ?? null,
  };

  // Try PostgreSQL if configured
  if (isDatabaseConfigured()) {
    try {
      await ensureTablesExist();
      const inserted = await db
        .insert(form1Responses)
        .values(values as typeof form1Responses.$inferInsert)
        .onConflictDoNothing({ target: form1Responses.browserId })
        .returning({ id: form1Responses.id });

      if (!inserted.length) {
        return NextResponse.json({ error: "duplicate", duplicate: true }, { status: 409 });
      }

      // Mirror to storage as backup
      addForm1Response(storagePayload);
      return NextResponse.json({ ok: true, id: inserted[0].id, storage: "database" });
    } catch (pgError) {
      console.warn("PostgreSQL insert failed, using fallback storage:", pgError);
      markDatabaseBroken(pgError instanceof Error ? pgError.message : String(pgError));
      // Seamlessly fall through to local fallback storage!
    }
  }

  // Fallback storage (works with ZERO database configured!)
  const localResult = addForm1Response(storagePayload);
  if (!localResult.ok && localResult.duplicate) {
    return NextResponse.json({ error: "duplicate", duplicate: true }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    id: localResult.id,
    storage: "local_fallback",
    note: "Stored successfully without requiring an external database.",
  });
}
