import { NextResponse } from "next/server";
import { db, isDatabaseConfigured, isDatabaseMarkedBroken, markDatabaseBroken } from "@/db";
import { form1Responses } from "@/db/schema";
import { FORM1_ROW_KEYS } from "@/lib/results";
import { FORM1_COLUMN_KEYS } from "@/lib/survey";
import { getAllForm1 } from "@/lib/storage";
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
      // One database read for ALL questions, never one read per option click.
      const rows = await db.select().from(form1Responses);
      const result: StatsMap = {};
      for (const key of FORM1_COLUMN_KEYS) {
        const column = FORM1_ROW_KEYS[key];
        result[key] = tally(rows.map((row) => (row[column] as string | null) ?? null));
      }
      return result;
    } catch (error) {
      markDatabaseBroken(error instanceof Error ? error.message : String(error));
    }
  }

  // Preview-only fallback; production needs durable PostgreSQL.
  const rows = getAllForm1();
  const result: StatsMap = {};
  for (const key of FORM1_COLUMN_KEYS) {
    const column = FORM1_ROW_KEYS[key];
    result[key] = tally(rows.map((row) => {
      const value = (row as unknown as Record<string, unknown>)[column];
      return value ? String(value) : null;
    }));
  }
  return result;
}

export async function GET() {
  const data = await cachedValue("poll-stats-form1", 12_000, readAll);
  return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
}
