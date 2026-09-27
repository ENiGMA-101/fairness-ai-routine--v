import { NextResponse, type NextRequest } from "next/server";
import { FORM1_COLUMN_KEYS, type Form1ColumnKey } from "@/lib/survey";
import { getForm1PollStats } from "@/lib/poll-stats-server";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store, max-age=0" };

export async function GET(request: NextRequest) {
  const question = request.nextUrl.searchParams.get("question") ?? "";
  if (!FORM1_COLUMN_KEYS.includes(question as Form1ColumnKey)) {
    return NextResponse.json({ error: "invalid question" }, { status: 400, headers });
  }
  try {
    const all = await getForm1PollStats();
    return NextResponse.json(all[question], { headers });
  } catch {
    return NextResponse.json({ error: "Live poll results are temporarily unavailable" }, { status: 503, headers });
  }
}
