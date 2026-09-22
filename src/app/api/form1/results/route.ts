import { NextResponse } from "next/server";
import { getForm1Results } from "@/lib/results";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getForm1Results();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
