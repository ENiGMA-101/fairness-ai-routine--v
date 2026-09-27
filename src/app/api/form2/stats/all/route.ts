import { NextResponse } from "next/server";
import { getForm2PollStats } from "@/lib/poll-stats-server";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store, max-age=0" };

export async function GET() {
  try {
    return NextResponse.json(await getForm2PollStats(), { headers });
  } catch {
    return NextResponse.json({ error: "Live poll results are temporarily unavailable" }, { status: 503, headers });
  }
}
