import { NextResponse } from "next/server";
import { db, isDatabaseConfigured, isDatabaseMarkedBroken, markDatabaseBroken } from "@/db";
import { form1Responses, form2Responses } from "@/db/schema";
import { getAllForm1, getAllForm2 } from "@/lib/storage";
import { cachedValue } from "@/lib/stats-cache";

export const dynamic = "force-dynamic";

async function fetchCounts() {
  if (isDatabaseConfigured() && !isDatabaseMarkedBroken()) {
    try {
      const one = await db.select({ id: form1Responses.id }).from(form1Responses);
      const two = await db.select({ id: form2Responses.id }).from(form2Responses);
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
