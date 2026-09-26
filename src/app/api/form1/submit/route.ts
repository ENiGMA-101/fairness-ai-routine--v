import { NextResponse, type NextRequest } from "next/server";
import { db, ensureTablesExist, isDatabaseConfigured } from "@/db";
import { form1Responses } from "@/db/schema";
import {
  DEPARTMENTS,
  FORM1_ALLOWED_VALUES,
  FORM1_REQUIRED_BY_ROLE,
  ROLE_OPTIONS,
  SURVEY_VERSION,
} from "@/lib/survey";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Role = "Student" | "Teacher";

type Body = {
  browser_id?: string;
  role?: string;
  department?: string;
  department_other?: string | null;
  answers?: Record<string, string>;
};

const INSERT_BY_QUESTION: Record<
  string,
  (value: string) => Partial<typeof form1Responses.$inferInsert>
> = {
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
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const browserId = (body.browser_id ?? "").trim();
  const role = (body.role ?? "").trim();
  const department = (body.department ?? "").trim();
  const departmentOther =
    body.department_other?.toString().trim() || null;

  const answers = body.answers ?? {};

  const allowedRoles = ROLE_OPTIONS.map((option) => option.value);

  if (!browserId) {
    return NextResponse.json(
      { error: "browser_id is required" },
      { status: 400 },
    );
  }

  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "role is required" },
      { status: 400 },
    );
  }

  if (
    !DEPARTMENTS.includes(
      department as (typeof DEPARTMENTS)[number],
    )
  ) {
    return NextResponse.json(
      { error: "Please select a valid department" },
      { status: 400 },
    );
  }

  if (department === "Other" && !departmentOther) {
    return NextResponse.json(
      { error: "Please specify your department" },
      { status: 400 },
    );
  }

  const typedRole = role as Role;
  const requiredQuestions =
    FORM1_REQUIRED_BY_ROLE[typedRole];

  const normalizedAnswers: Record<string, string> = {};

  for (const questionId of requiredQuestions) {
    const value = answers[questionId]?.toString().trim();

    if (!value) {
      return NextResponse.json(
        { error: "Please answer every required question" },
        { status: 400 },
      );
    }

    if (!FORM1_ALLOWED_VALUES[questionId]?.includes(value)) {
      return NextResponse.json(
        { error: `Invalid answer for ${questionId}` },
        { status: 400 },
      );
    }

    normalizedAnswers[questionId] = value;
  }

  const values: typeof form1Responses.$inferInsert = {
    browserId,
    surveyVersion: SURVEY_VERSION,
    role,
    department,
    departmentOther:
      department === "Other" ? departmentOther : null,

    semester: null,
    qAvoid: null,
    qWeeklyOff: null,
    qBetweenClasses: null,
    qExtraTime: null,
    qLongGap: null,
    qMiddayBreak: null,
    qMaxHours: null,
    qLabCap: null,
    qPriorityGroup: null,
    qConflictStudent: null,
    qTeachingSchedule: null,
    qZeroDay: null,
    qConsecutive: null,
    qGapPref: null,
    qFacultyConflict: null,
    qCompensate: null,
    qConflictTeacher: null,
  };

  for (const [questionId, value] of Object.entries(
    normalizedAnswers,
  )) {
    Object.assign(
      values,
      INSERT_BY_QUESTION[questionId](value),
    );
  }

  /*
   * IMPORTANT:
   * Never silently fall back to /tmp on production.
   * If PostgreSQL is unavailable, the response must fail instead
   * of pretending that research data was saved.
   */
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Database is not configured. Set DATABASE_URL in Vercel.",
        code: "DATABASE_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  try {
    await ensureTablesExist();

    const inserted = await db
      .insert(form1Responses)
      .values(values)
      .onConflictDoNothing({
        target: [
          form1Responses.browserId,
          form1Responses.surveyVersion,
        ],
      })
      .returning({
        id: form1Responses.id,
      });

    if (!inserted.length) {
      return NextResponse.json(
        {
          error: "duplicate",
          duplicate: true,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        id: inserted[0].id,
        storage: "database",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Form 1 database insert failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Could not save your response. Please try again.",
        code: "DATABASE_WRITE_FAILED",
      },
      { status: 503 },
    );
  }
}