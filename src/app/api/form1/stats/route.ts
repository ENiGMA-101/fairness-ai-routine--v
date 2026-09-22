import { NextResponse, type NextRequest } from "next/server";
import { db, ensureTablesExist, isDatabaseConfigured } from "@/db";
import { form1Responses } from "@/db/schema";
import { FORM1_ROW_KEYS } from "@/lib/results";
import { FORM1_COLUMN_KEYS } from "@/lib/survey";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const question = req.nextUrl.searchParams.get("question") ?? "";
  if (!FORM1_COLUMN_KEYS.includes(question as (typeof FORM1_COLUMN_KEYS)[number])) {
    return NextResponse.json({ error: "invalid question" }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ total: 0, counts: {}, percentages: {} });
  }

  try {
    await ensureTablesExist();
    const key = FORM1_ROW_KEYS[question];
    const rows = await db.select({ value: form1Responses[key] }).from(form1Responses);

    const counts: Record<string, number> = {};
    let total = 0;
    for (const row of rows) {
      const raw = row.value;
      if (raw === null || raw === "") continue;
      const value = String(raw);
      counts[value] = (counts[value] ?? 0) + 1;
      total += 1;
    }

    const percentages: Record<string, number> = {};
    for (const [value, count] of Object.entries(counts)) {
      percentages[value] = total ? Math.round((count / total) * 100) : 0;
    }

    return NextResponse.json({ total, counts, percentages });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "Unexpected error";
    if (rawMessage.includes("relation") && rawMessage.includes("does not exist")) {
      try {
        await ensureTablesExist();
        return NextResponse.json({ total: 0, counts: {}, percentages: {} });
      } catch {
        return NextResponse.json({ total: 0, counts: {}, percentages: {} });
      }
    }
    return NextResponse.json({ total: 0, counts: {}, percentages: {} });
  }
}
