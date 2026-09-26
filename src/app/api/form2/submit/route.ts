import { NextResponse, type NextRequest } from "next/server";
import { db, ensureTablesExist, isDatabaseConfigured } from "@/db";
import { form2Responses } from "@/db/schema";
import {
  DEPARTMENTS,
  ROLE_OPTIONS,
  SURVEY_VERSION,
  TIME_SLOTS,
} from "@/lib/survey";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ROLES = ROLE_OPTIONS.map(
  (option) => option.value,
);

type Body = {
  browser_id?: string;
  role?: string;
  department?: string;
  department_other?: string | null;
  time_slots?: Record<string, number>;
  long_gap_rating?: number;
  fairness_rating?: number;
  feedback?: string | null;
};

function rating(value: unknown): number | null {
  const n = Number(value);

  if (
    !Number.isInteger(n) ||
    n < 1 ||
    n > 5
  ) {
    return null;
  }

  return n;
}

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

  const browserId =
    (body.browser_id ?? "").trim();

  const role =
    (body.role ?? "").trim();

  const department =
    (body.department ?? "").trim();

  const departmentOther =
    body.department_other?.toString().trim() || null;

  const timeSlots =
    body.time_slots ?? {};

  if (!browserId) {
    return NextResponse.json(
      { error: "browser_id is required" },
      { status: 400 },
    );
  }

  if (!ROLES.includes(role)) {
    return NextResponse.json(
      { error: "role is required" },
      { status: 400 },
    );
  }

  if (!department) {
    return NextResponse.json(
      { error: "department is required" },
      { status: 400 },
    );
  }

  if (
    department === "Other" &&
    !departmentOther
  ) {
    return NextResponse.json(
      {
        error:
          "Please specify your department",
      },
      { status: 400 },
    );
  }

  if (
    department !== "Other" &&
    !DEPARTMENTS.includes(
      department as (typeof DEPARTMENTS)[number],
    )
  ) {
    return NextResponse.json(
      { error: "Unknown department" },
      { status: 400 },
    );
  }

  const slotValues = TIME_SLOTS.map((slot) => {
    const value = rating(
      timeSlots[slot.id],
    );

    if (value === null) {
      return null;
    }

    return value;
  });

  if (
    slotValues.some(
      (entry) => entry === null,
    )
  ) {
    return NextResponse.json(
      {
        error:
          "All 7 time slots must be rated 1–5",
      },
      { status: 400 },
    );
  }

  const longGap = rating(
    body.long_gap_rating,
  );

  const fairness = rating(
    body.fairness_rating,
  );

  if (
    longGap === null ||
    fairness === null
  ) {
    return NextResponse.json(
      {
        error:
          "Both rating questions are required",
      },
      { status: 400 },
    );
  }

  const feedbackText =
    body.feedback
      ?.toString()
      .trim()
      .slice(0, 2000) || null;

  /*
   * IMPORTANT:
   * Never store research responses in Vercel /tmp.
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

  const values: typeof form2Responses.$inferInsert = {
    browserId,
    surveyVersion: SURVEY_VERSION,
    role,
    department,
    departmentOther:
      department === "Other"
        ? departmentOther
        : null,

    timeSlot800: slotValues[0]!,
    timeSlot930: slotValues[1]!,
    timeSlot1100: slotValues[2]!,
    timeSlot1230: slotValues[3]!,
    timeSlot1400: slotValues[4]!,
    timeSlot1530: slotValues[5]!,
    timeSlot1700: slotValues[6]!,

    longGapRating: longGap,
    fairnessRating: fairness,
    feedback: feedbackText,
  };

  try {
    await ensureTablesExist();

    const inserted = await db
      .insert(form2Responses)
      .values(values)
      .onConflictDoNothing({
        target: [
          form2Responses.browserId,
          form2Responses.surveyVersion,
        ],
      })
      .returning({
        id: form2Responses.id,
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
      "Form 2 database insert failed:",
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