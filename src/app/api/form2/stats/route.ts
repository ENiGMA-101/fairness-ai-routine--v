import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, ensureTablesExist, isDatabaseConfigured, markDatabaseBroken } from "@/db";
import { form2Responses } from "@/db/schema";
import { FORM2_ROW_KEYS } from "@/lib/results";
import { getAllForm2 } from "@/lib/storage";
import { FORM2_COLUMN_KEYS, SURVEY_VERSION, optionValuesForStat } from "@/lib/survey";
import { buildQuestionStats } from "@/lib/poll-stats";

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

  const stats = buildQuestionStats(values, optionValuesForStat("form2", question));
  return NextResponse.json(stats);
}
