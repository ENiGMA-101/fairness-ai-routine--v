import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, ensureTablesExist, isDatabaseConfigured, isDatabaseMarkedBroken, markDatabaseBroken } from "@/db";
import { form1Responses, form2Responses } from "@/db/schema";
import { getAllForm1, getAllForm2 } from "@/lib/storage";
import { cachedValue } from "@/lib/stats-cache";
import { SURVEY_VERSION } from "@/lib/survey";

export const dynamic = "force-dynamic";

async function fetchCounts() {
  if (isDatabaseConfigured() && !isDatabaseMarkedBroken()) {
    try {
      await ensureTablesExist();
      const one = await db
        .select({ id: form1Responses.id })
        .from(form1Responses)
        .where(eq(form1Responses.surveyVersion, SURVEY_VERSION));
      const two = await db
        .select({ id: form2Responses.id })
        .from(form2Responses)
        .where(eq(form2Responses.surveyVersion, SURVEY_VERSION));
      return { form1: one.length, form2: two.length };
    } catch (err) {
      markDatabaseBroken(err instanceof Error ? err.message : String(err));
    }
  }
  return { form1: getAllForm1().length, form2: getAllForm2().length };
}

export async function GET() {
  try {
    const counts = await cachedValue("home-stats", 30_000, fetchCounts);
    return NextResponse.json(counts);
  } catch {
    return NextResponse.json({ form1: 0, form2: 0 });
  }
}
