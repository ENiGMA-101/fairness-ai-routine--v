import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { form2Responses } from "@/db/schema";
import { FORM2_ROW_KEYS } from "@/lib/results";
import { FORM2_COLUMN_KEYS } from "@/lib/survey";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const question = req.nextUrl.searchParams.get("question") ?? "";
  if (!FORM2_COLUMN_KEYS.includes(question as (typeof FORM2_COLUMN_KEYS)[number])) {
    return NextResponse.json({ error: "invalid question" }, { status: 400 });
  }

  try {
    const key = FORM2_ROW_KEYS[question];
    const rows = await db.select({ value: form2Responses[key] }).from(form2Responses);

    const counts: Record<string, number> = {};
    let total = 0;
    for (const row of rows) {
      const raw = row.value;
      if (raw === null || raw === undefined || raw === "") continue;
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
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
