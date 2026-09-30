import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, ensureTablesExist, isDatabaseConfigured, isDatabaseMarkedBroken, markDatabaseBroken } from "@/db";
import { form2Responses } from "@/db/schema";
import { FORM2_ROW_KEYS } from "@/lib/results";
import { FORM2_COLUMN_KEYS, SURVEY_VERSION, optionValuesForStat } from "@/lib/survey";
import { buildQuestionStats, type PollStatsMap } from "@/lib/poll-stats";
import { getAllForm2 } from "@/lib/storage";

export const dynamic = "force-dynamic";

async function readAll(): Promise<PollStatsMap> {
  let columns: Record<string, (string | number | null)[]>;

  const fromRecords = () => {
    const records = getAllForm2();
    const map: Record<string, (string | number | null)[]> = {};
    for (const key of FORM2_COLUMN_KEYS) {
      const column = FORM2_ROW_KEYS[key];
      map[key] = records.map((row) => {
        const value = (row as unknown as Record<string, unknown>)[column];
        return value === null || value === undefined ? null : (value as string | number);
      });
    }
    return map;
  };

  if (isDatabaseConfigured() && !isDatabaseMarkedBroken()) {
    try {
      await ensureTablesExist();
      // Live read for all seven slots plus gap/fairness — never cached.
      const rows = await db
        .select()
        .from(form2Responses)
        .where(eq(form2Responses.surveyVersion, SURVEY_VERSION));
      columns = {};
      for (const key of FORM2_COLUMN_KEYS) {
        const column = FORM2_ROW_KEYS[key];
        columns[key] = rows.map((row) => (row[column] as string | number | null) ?? null);
      }
    } catch (error) {
      markDatabaseBroken(error instanceof Error ? error.message : String(error));
      columns = fromRecords();
    }
  } else {
    columns = fromRecords();
  }

  const result: PollStatsMap = {};
  for (const key of FORM2_COLUMN_KEYS) {
    result[key] = buildQuestionStats(columns[key], optionValuesForStat("form2", key));
  }
  return result;
}

export async function GET() {
  const data = await readAll();
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
