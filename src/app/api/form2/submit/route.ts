import { NextResponse, type NextRequest } from "next/server";
import { db, ensureTablesExist, isDatabaseConfigured, markDatabaseBroken } from "@/db";
import { form2Responses } from "@/db/schema";
import { addForm2Response } from "@/lib/storage";
import { DEPARTMENTS, ROLE_OPTIONS, SURVEY_VERSION, TIME_SLOTS } from "@/lib/survey";
import { invalidate } from "@/lib/stats-cache";

export const dynamic = "force-dynamic";

const ROLES = ROLE_OPTIONS.map((option) => option.value);

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

  const feedbackText = body.feedback?.toString().trim().slice(0, 2000) || null;

  const storagePayload = {
    browserId,
    surveyVersion: SURVEY_VERSION,
    role,
    department,
    departmentOther: department === "Other" ? departmentOther : null,
    timeSlot800: slotValues[0]!.value,
    timeSlot930: slotValues[1]!.value,
    timeSlot1100: slotValues[2]!.value,
    timeSlot1230: slotValues[3]!.value,
    timeSlot1400: slotValues[4]!.value,
    timeSlot1530: slotValues[5]!.value,
    timeSlot1700: slotValues[6]!.value,
    longGapRating: longGap,
    fairnessRating: fairness,
    feedback: feedbackText,
  };

  // Try PostgreSQL if configured
  if (isDatabaseConfigured()) {
    try {
      await ensureTablesExist();
      const inserted = await db
        .insert(form2Responses)
        .values(storagePayload)
        .onConflictDoNothing({ target: [form2Responses.browserId, form2Responses.surveyVersion] })
        .returning({ id: form2Responses.id });

      if (!inserted.length) {
        return NextResponse.json({ error: "duplicate", duplicate: true }, { status: 409 });
      }

      // Backup to local storage
      addForm2Response(storagePayload);
      invalidate("poll-stats-form2");
      invalidate("form2-results");
      invalidate("home-stats");
      return NextResponse.json({ ok: true, id: inserted[0].id, storage: "database" });
    } catch (pgError) {
      console.warn("PostgreSQL insert failed, using fallback storage:", pgError);
      markDatabaseBroken(pgError instanceof Error ? pgError.message : String(pgError));
      // Seamlessly fall through to local fallback storage!
    }
  }

  // Fallback storage (works with ZERO database configured!)
  const localResult = addForm2Response(storagePayload);
  if (!localResult.ok && localResult.duplicate) {
    return NextResponse.json({ error: "duplicate", duplicate: true }, { status: 409 });
  }
  invalidate("poll-stats-form2");
  invalidate("form2-results");
  invalidate("home-stats");

  return NextResponse.json({
    ok: true,
    id: localResult.id,
    storage: "local_fallback",
    note: "Stored successfully without requiring an external database.",
  });
}
