import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, ensureTablesExist, isDatabaseConfigured, isDatabaseMarkedBroken, markDatabaseBroken } from "@/db";
import { form2Responses } from "@/db/schema";
import { FORM2_ROW_KEYS } from "@/lib/results";
import { FORM2_COLUMN_KEYS, SURVEY_VERSION } from "@/lib/survey";
import { getAllForm2 } from "@/lib/storage";
import { cachedValue } from "@/lib/stats-cache";

export const dynamic = "force-dynamic";

type QStats = { total: number; counts: Record<string, number>; percentages: Record<string, number> };

type StatsMap = Record<string, QStats>;

function tally(values: (string | number | null)[]): QStats {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const key = String(value);
    counts[key] = (counts[key] ?? 0) + 1;
    total += 1;
  }
  const percentages: Record<string, number> = {};
  for (const [key, count] of Object.entries(counts)) {
    percentages[key] = total ? Math.round((count / total) * 100) : 0;
  }
  return { total, counts, percentages };
}

async function readAll(): Promise<StatsMap> {
  if (isDatabaseConfigured() && !isDatabaseMarkedBroken()) {
    try {
      await ensureTablesExist();
      // Seven slots plus gap/fairness from one read, rather than nine click requests.
      const rows = await db
        .select()
        .from(form2Responses)
        .where(eq(form2Responses.surveyVersion, SURVEY_VERSION));
      const result: StatsMap = {};
      for (const key of FORM2_COLUMN_KEYS) {
        const column = FORM2_ROW_KEYS[key];
        result[key] = tally(rows.map((row) => (row[column] as string | number | null) ?? null));
      }
      return result;
    } catch (error) {
      markDatabaseBroken(error instanceof Error ? error.message : String(error));
    }
  }

  const rows = getAllForm2();
  const result: StatsMap = {};
  for (const key of FORM2_COLUMN_KEYS) {
    const column = FORM2_ROW_KEYS[key];
    result[key] = tally(rows.map((row) => {
      const value = (row as unknown as Record<string, unknown>)[column];
      return value === null || value === undefined ? null : String(value);
    }));
  }
  return result;
}

export async function GET() {
  const data = await cachedValue("poll-stats-form2", 12_000, readAll);
  return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
}
