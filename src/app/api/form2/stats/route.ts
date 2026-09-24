import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, ensureTablesExist, isDatabaseConfigured, markDatabaseBroken } from "@/db";
import { form2Responses } from "@/db/schema";
import { FORM2_ROW_KEYS } from "@/lib/results";
import { getAllForm2 } from "@/lib/storage";
import { FORM2_COLUMN_KEYS, SURVEY_VERSION } from "@/lib/survey";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const question = req.nextUrl.searchParams.get("question") ?? "";
  if (!FORM2_COLUMN_KEYS.includes(question as (typeof FORM2_COLUMN_KEYS)[number])) {
    return NextResponse.json({ error: "invalid question" }, { status: 400 });
  }

  const key = FORM2_ROW_KEYS[question];
  let values: (string | null)[] = [];

  if (isDatabaseConfigured()) {
    try {
      await ensureTablesExist();
      const rows = await db
        .select({ value: form2Responses[key] })
        .from(form2Responses)
        .where(eq(form2Responses.surveyVersion, SURVEY_VERSION));
      values = rows.map((r) =>
        r.value !== null && r.value !== undefined ? String(r.value) : null,
      );
    } catch (err) {
      markDatabaseBroken(err instanceof Error ? err.message : String(err));
      const records = getAllForm2();
      values = records.map((r) => {
        const val = (r as unknown as Record<string, unknown>)[key];
        return val !== null && val !== undefined ? String(val) : null;
      });
    }
  } else {
    const records = getAllForm2();
    values = records.map((r) => {
      const val = (r as unknown as Record<string, unknown>)[key];
      return val !== null && val !== undefined ? String(val) : null;
    });
  }

  const counts: Record<string, number> = {};
  let total = 0;
  for (const raw of values) {
    if (!raw) continue;
    counts[raw] = (counts[raw] ?? 0) + 1;
    total += 1;
  }

  const percentages: Record<string, number> = {};
  for (const [val, count] of Object.entries(counts)) {
    percentages[val] = total ? Math.round((count / total) * 100) : 0;
  }

  return NextResponse.json({ total, counts, percentages });
}
