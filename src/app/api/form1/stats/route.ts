import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, ensureTablesExist, isDatabaseConfigured, markDatabaseBroken } from "@/db";
import { form1Responses } from "@/db/schema";
import { FORM1_ROW_KEYS } from "@/lib/results";
import { getAllForm1 } from "@/lib/storage";
import { FORM1_COLUMN_KEYS, SURVEY_VERSION, optionValuesForStat } from "@/lib/survey";
import { buildQuestionStats } from "@/lib/poll-stats";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const question = req.nextUrl.searchParams.get("question") ?? "";
  if (!FORM1_COLUMN_KEYS.includes(question as (typeof FORM1_COLUMN_KEYS)[number])) {
    return NextResponse.json({ error: "invalid question" }, { status: 400 });
  }

  const key = FORM1_ROW_KEYS[question];
  let values: (string | null)[] = [];

  if (isDatabaseConfigured()) {
    try {
      await ensureTablesExist();
      const rows = await db
        .select({ value: form1Responses[key] })
        .from(form1Responses)
        .where(eq(form1Responses.surveyVersion, SURVEY_VERSION));
      values = rows.map((r) => (r.value ? String(r.value) : null));
    } catch (err) {
      markDatabaseBroken(err instanceof Error ? err.message : String(err));
      const records = getAllForm1();
      values = records.map((r) => {
        const val = (r as unknown as Record<string, unknown>)[key];
        return val ? String(val) : null;
      });
    }
  } else {
    const records = getAllForm1();
    values = records.map((r) => {
      const val = (r as unknown as Record<string, unknown>)[key];
      return val ? String(val) : null;
    });
  }

  const stats = buildQuestionStats(values, optionValuesForStat("form1", question));
  return NextResponse.json(stats);
}
