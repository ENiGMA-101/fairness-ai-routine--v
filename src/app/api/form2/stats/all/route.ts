import { NextResponse } from "next/server";
import { db, isDatabaseConfigured, isDatabaseMarkedBroken, markDatabaseBroken } from "@/db";
import { form2Responses } from "@/db/schema";
import { FORM2_ROW_KEYS } from "@/lib/results";
import { FORM2_COLUMN_KEYS } from "@/lib/survey";
import { getAllForm2 } from "@/lib/storage";

export const dynamic = "force-dynamic";

type QStats = { total: number; counts: Record<string, number>; percentages: Record<string, number> };

function compute(values: (string | number | null)[]): QStats {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const v of values) {
    if (v === null || v === undefined || v === "") continue;
    const k = String(v);
    counts[k] = (counts[k] ?? 0) + 1;
    total += 1;
  }
  const percentages: Record<string, number> = {};
  for (const [k, c] of Object.entries(counts)) {
    percentages[k] = total ? Math.round((c / total) * 100) : 0;
  }
  return { total, counts, percentages };
}

export async function GET() {
  const keys = FORM2_COLUMN_KEYS;

  if (isDatabaseConfigured() && !isDatabaseMarkedBroken()) {
    try {
      const rows = await db.select().from(form2Responses);
      const result: Record<string, QStats> = {};
      for (const key of keys) {
        const col = FORM2_ROW_KEYS[key];
        const vals = rows.map((r) => (r[col] as string | null) ?? null);
        result[key] = compute(vals);
      }
      return NextResponse.json(result);
    } catch (err) {
      markDatabaseBroken(err instanceof Error ? err.message : String(err));
    }
  }

  const records = getAllForm2();
  const result: Record<string, QStats> = {};
  for (const key of keys) {
    const col = FORM2_ROW_KEYS[key];
    const vals = records.map((r) => {
      const val = (r as unknown as Record<string, unknown>)[col];
      return val !== null && val !== undefined ? String(val) : null;
    });
    result[key] = compute(vals);
  }
  return NextResponse.json(result);
}
