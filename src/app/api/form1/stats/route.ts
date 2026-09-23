import { NextResponse, type NextRequest } from "next/server";
import { db, ensureTablesExist, isDatabaseConfigured, markDatabaseBroken } from "@/db";
import { form1Responses } from "@/db/schema";
import { FORM1_ROW_KEYS } from "@/lib/results";
import { getAllForm1 } from "@/lib/storage";
import { FORM1_COLUMN_KEYS } from "@/lib/survey";

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
      const rows = await db.select({ value: form1Responses[key] }).from(form1Responses);
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
