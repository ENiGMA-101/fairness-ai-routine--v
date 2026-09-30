import { NextResponse } from "next/server";
import { countDistinct, eq } from "drizzle-orm";
import { db, ensureTablesExist } from "@/db";
import { form1Responses, form2Responses } from "@/db/schema";
import { SURVEY_VERSION } from "@/lib/survey";

export const dynamic = "force-dynamic";

/** Preserve the existing API shape; count acknowledged database responses only. */
export async function GET() {
  try {
    await ensureTablesExist();
    const [one, two] = await Promise.all([
      db.select({ count: countDistinct(form1Responses.browserId) }).from(form1Responses)
        .where(eq(form1Responses.surveyVersion, SURVEY_VERSION)),
      db.select({ count: countDistinct(form2Responses.browserId) }).from(form2Responses)
        .where(eq(form2Responses.surveyVersion, SURVEY_VERSION)),
    ]);
    return NextResponse.json({ form1: one[0].count, form2: two[0].count }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Response counters unavailable:", error);
    return NextResponse.json({ error: "Submitted response counts are temporarily unavailable" }, { status: 503 });
  }
}
