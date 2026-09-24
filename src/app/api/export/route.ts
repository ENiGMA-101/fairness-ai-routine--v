import { desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db, ensureTablesExist, isDatabaseConfigured } from "@/db";
import { form1Responses, form2Responses } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin";
import { getAllForm1, getAllForm2 } from "@/lib/storage";
import { SURVEY_VERSION } from "@/lib/survey";

export const dynamic = "force-dynamic";

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escapeCell = (cell: unknown) => {
    if (cell === null || cell === undefined) return '""';
    return `"${String(cell).replace(/"/g, '""')}"`;
  };
  return [
    headers.map((header) => `"${header}"`).join(","),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
  ].join("\n");
}

async function readForm1() {
  if (!isDatabaseConfigured()) return getAllForm1();
  await ensureTablesExist();
  return db
    .select()
    .from(form1Responses)
    .where(eq(form1Responses.surveyVersion, SURVEY_VERSION))
    .orderBy(desc(form1Responses.createdAt));
}

async function readForm2() {
  if (!isDatabaseConfigured()) return getAllForm2();
  await ensureTablesExist();
  return db
    .select()
    .from(form2Responses)
    .where(eq(form2Responses.surveyVersion, SURVEY_VERSION))
    .orderBy(desc(form2Responses.createdAt));
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const form = req.nextUrl.searchParams.get("form") || "form1";
  const format = req.nextUrl.searchParams.get("format") || "json";
  if (form !== "form1" && form !== "form2") {
    return NextResponse.json({ error: "Invalid form parameter" }, { status: 400 });
  }

  const data = form === "form1" ? await readForm1() : await readForm2();
  if (format === "csv") {
    return new NextResponse(toCsv(data as unknown as Record<string, unknown>[]), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="survey_${form}_v${SURVEY_VERSION}_responses.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }
  return NextResponse.json({ form, surveyVersion: SURVEY_VERSION, count: data.length, data });
}
