import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, ensureTablesExist, isDatabaseConfigured, isDatabaseMarkedBroken, markDatabaseBroken } from "@/db";
import { form1Responses } from "@/db/schema";
import { FORM1_ROW_KEYS } from "@/lib/results";
import { FORM1_COLUMN_KEYS, SURVEY_VERSION, optionValuesForStat } from "@/lib/survey";
import { buildQuestionStats, type PollStatsMap } from "@/lib/poll-stats";
import { getAllForm1 } from "@/lib/storage";

export const dynamic = "force-dynamic";

async function readAll(): Promise<PollStatsMap> {
  let columns: Record<string, (string | null)[]>;

  if (isDatabaseConfigured() && !isDatabaseMarkedBroken()) {
    try {
      await ensureTablesExist();
      // One live database read for ALL questions — never cached, so a response
      // submitted by anyone is reflected on the next poll.
      const rows = await db
        .select()
        .from(form1Responses)
        .where(eq(form1Responses.surveyVersion, SURVEY_VERSION));
      columns = {};
      for (const key of FORM1_COLUMN_KEYS) {
        const column = FORM1_ROW_KEYS[key];
        columns[key] = rows.map((row) => (row[column] as string | null) ?? null);
      }
    } catch (error) {
      markDatabaseBroken(error instanceof Error ? error.message : String(error));
      const records = getAllForm1();
      columns = {};
      for (const key of FORM1_COLUMN_KEYS) {
        const column = FORM1_ROW_KEYS[key];
        columns[key] = records.map((row) => {
          const value = (row as unknown as Record<string, unknown>)[column];
          return value ? String(value) : null;
        });
      }
    }
  } else {
    const records = getAllForm1();
    columns = {};
    for (const key of FORM1_COLUMN_KEYS) {
      const column = FORM1_ROW_KEYS[key];
      columns[key] = records.map((row) => {
        const value = (row as unknown as Record<string, unknown>)[column];
        return value ? String(value) : null;
      });
    }
  }

  const result: PollStatsMap = {};
  for (const key of FORM1_COLUMN_KEYS) {
    result[key] = buildQuestionStats(columns[key], optionValuesForStat("form1", key));
  }
  return result;
}

export async function GET() {
  const data = await readAll();
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
