import { NextResponse, type NextRequest } from "next/server";
import { db, ensureTablesExist, isDatabaseConfigured } from "@/db";
import { form2Responses } from "@/db/schema";
import { DEPARTMENTS, TIME_SLOTS } from "@/lib/survey";

export const dynamic = "force-dynamic";

const ROLES = ["Student", "Teacher"];

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
  if (!Number.isInteger(n) || n < 1 || n > 5) return null;
  return n;
}

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
  const timeSlots = body.time_slots ?? {};

  if (!browserId) return NextResponse.json({ error: "browser_id is required" }, { status: 400 });
  if (!ROLES.includes(role)) return NextResponse.json({ error: "role is required" }, { status: 400 });
  if (!department) return NextResponse.json({ error: "department is required" }, { status: 400 });
  if (department === "Other" && !departmentOther) {
    return NextResponse.json({ error: "Please specify your department" }, { status: 400 });
  }
  if (department !== "Other" && !DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) {
    return NextResponse.json({ error: "Unknown department" }, { status: 400 });
  }

  const slotValues = TIME_SLOTS.map((slot) => {
    const value = rating(timeSlots[slot.id]);
    if (value === null) return null;
    return { slot, value };
  });
  if (slotValues.some((entry) => entry === null)) {
    return NextResponse.json({ error: "All 7 time slots must be rated 1–5" }, { status: 400 });
  }

  const longGap = rating(body.long_gap_rating);
  const fairness = rating(body.fairness_rating);
  if (longGap === null || fairness === null) {
    return NextResponse.json({ error: "Both rating questions are required" }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Database not connected. Please add DATABASE_URL or POSTGRES_URL in Vercel Settings > Environment Variables (or visit /setup for the 1-click guide).",
      },
      { status: 500 },
    );
  }

  const insertData = {
    browserId,
    role,
    department,
    departmentOther,
    timeSlot800: slotValues[0]!.value,
    timeSlot930: slotValues[1]!.value,
    timeSlot1100: slotValues[2]!.value,
    timeSlot1230: slotValues[3]!.value,
    timeSlot1400: slotValues[4]!.value,
    timeSlot1530: slotValues[5]!.value,
    timeSlot1700: slotValues[6]!.value,
    longGapRating: longGap,
    fairnessRating: fairness,
    feedback: body.feedback?.toString().trim().slice(0, 2000) || null,
  };

  const doInsert = async () => {
    return await db
      .insert(form2Responses)
      .values(insertData)
      .onConflictDoNothing({ target: form2Responses.browserId })
      .returning({ id: form2Responses.id });
  };

  try {
    // Ensure tables exist before first write
    await ensureTablesExist();
    const inserted = await doInsert();

    if (!inserted.length) {
      return NextResponse.json({ error: "duplicate", duplicate: true }, { status: 409 });
    }
    return NextResponse.json({ ok: true, id: inserted[0].id });
  } catch (error) {
    // If the error was due to missing tables, retry once after explicit table creation
    const rawMessage = error instanceof Error ? error.message : String(error);
    if (rawMessage.includes("relation") && rawMessage.includes("does not exist")) {
      try {
        await ensureTablesExist();
        const retryInserted = await doInsert();
        if (!retryInserted.length) {
          return NextResponse.json({ error: "duplicate", duplicate: true }, { status: 409 });
        }
        return NextResponse.json({ ok: true, id: retryInserted[0].id });
      } catch (retryError) {
        const retryMsg = retryError instanceof Error ? retryError.message : String(retryError);
        return NextResponse.json(
          { error: `Database table error: ${retryMsg}. Visit /setup to initialize tables.` },
          { status: 500 },
        );
      }
    }

    // Friendly error messaging instead of raw SQL dumps
    if (rawMessage.includes("password authentication failed") || rawMessage.includes("connect ECONNREFUSED")) {
      return NextResponse.json(
        { error: "Database connection failed. Please verify your DATABASE_URL credentials." },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: `Database error: ${rawMessage}` }, { status: 500 });
  }
}
