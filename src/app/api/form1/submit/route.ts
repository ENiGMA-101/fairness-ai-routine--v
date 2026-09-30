import { NextResponse, type NextRequest } from "next/server";
import { db, ensureTablesExist, isDatabaseConfigured, markDatabaseBroken } from "@/db";
import { form1Responses } from "@/db/schema";
import { addForm1Response } from "@/lib/storage";
import {
  DEPARTMENTS,
  FORM1_ALLOWED_VALUES,
  FORM1_REQUIRED_BY_ROLE,
  ROLE_OPTIONS,
  SURVEY_VERSION,
} from "@/lib/survey";
import { invalidate } from "@/lib/stats-cache";

export const dynamic = "force-dynamic";

type Role = "Student" | "Teacher";
type Body = {
  browser_id?: string;
  role?: string;
  department?: string;
  department_other?: string | null;
  answers?: Record<string, string>;
};

const INSERT_BY_QUESTION: Record<string, (value: string) => Partial<typeof form1Responses.$inferInsert>> = {
  semester: (value) => ({ semester: value }),
  q_avoid: (value) => ({ qAvoid: value }),
  q_weekly_off: (value) => ({ qWeeklyOff: value }),
  q_between_classes: (value) => ({ qBetweenClasses: value }),
  q_extra_time: (value) => ({ qExtraTime: value }),
  q_long_gap: (value) => ({ qLongGap: value }),
  q_midday_break: (value) => ({ qMiddayBreak: value }),
  q_max_hours: (value) => ({ qMaxHours: value }),
  q_lab_cap: (value) => ({ qLabCap: value }),
  q_priority_group: (value) => ({ qPriorityGroup: value }),
  q_conflict_student: (value) => ({ qConflictStudent: value }),
  q_teaching_schedule: (value) => ({ qTeachingSchedule: value }),
  q_zero_day: (value) => ({ qZeroDay: value }),
  q_consecutive: (value) => ({ qConsecutive: value }),
  q_gap_pref: (value) => ({ qGapPref: value }),
  q_faculty_conflict: (value) => ({ qFacultyConflict: value }),
  q_compensate: (value) => ({ qCompensate: value }),
  q_conflict_teacher: (value) => ({ qConflictTeacher: value }),
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
  const allowedRoles = ROLE_OPTIONS.map((option) => option.value);

  if (!browserId) return NextResponse.json({ error: "browser_id is required" }, { status: 400 });
  if (!allowedRoles.includes(role)) return NextResponse.json({ error: "role is required" }, { status: 400 });
  if (!DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) {
    return NextResponse.json({ error: "Please select a valid department" }, { status: 400 });
  }
  if (department === "Other" && !departmentOther) {
    return NextResponse.json({ error: "Please specify your department" }, { status: 400 });
  }

  const typedRole = role as Role;
  const requiredQuestions = FORM1_REQUIRED_BY_ROLE[typedRole];
  const normalizedAnswers: Record<string, string> = {};
  for (const questionId of requiredQuestions) {
    const value = answers[questionId]?.toString().trim();
    if (!value) {
      return NextResponse.json({ error: "Please answer every required question" }, { status: 400 });
    }
    if (!FORM1_ALLOWED_VALUES[questionId]?.includes(value)) {
      return NextResponse.json({ error: `Invalid answer for ${questionId}` }, { status: 400 });
    }
    normalizedAnswers[questionId] = value;
  }

  const values: Partial<typeof form1Responses.$inferInsert> = {
    browserId,
    surveyVersion: SURVEY_VERSION,
    role,
    department,
    departmentOther: department === "Other" ? departmentOther : null,
  };
  for (const [questionId, value] of Object.entries(normalizedAnswers)) {
    Object.assign(values, INSERT_BY_QUESTION[questionId](value));
  }

  const storagePayload = {
    browserId,
    surveyVersion: SURVEY_VERSION,
    role,
    department,
    departmentOther: department === "Other" ? departmentOther : null,
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

  if (isDatabaseConfigured()) {
    try {
      await ensureTablesExist();
      const inserted = await db
        .insert(form1Responses)
        .values(values as typeof form1Responses.$inferInsert)
        .onConflictDoNothing({ target: [form1Responses.browserId, form1Responses.surveyVersion] })
        .returning({ id: form1Responses.id });

      if (!inserted.length) {
        return NextResponse.json({ error: "duplicate", duplicate: true }, { status: 409 });
      }
      addForm1Response(storagePayload);
      invalidateForm1Caches();
      return NextResponse.json({ ok: true, id: inserted[0].id });
    } catch (error) {
      console.warn("PostgreSQL insert failed, using preview fallback:", error);
      markDatabaseBroken(error instanceof Error ? error.message : String(error));
    }
  }

  const localResult = addForm1Response(storagePayload);
  if (!localResult.ok && localResult.duplicate) {
    return NextResponse.json({ error: "duplicate", duplicate: true }, { status: 409 });
  }
  invalidateForm1Caches();
  return NextResponse.json({ ok: true, id: localResult.id, storage: "preview_fallback" });
}

function invalidateForm1Caches() {
  invalidate("poll-stats-form1");
  invalidate("form1-results");
  invalidate("home-stats");
}
