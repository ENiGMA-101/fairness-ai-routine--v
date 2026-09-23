import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest, isTokenValid, extractToken } from "@/lib/admin";
import { getAllForm1, getAllForm2 } from "@/lib/storage";

export const dynamic = "force-dynamic";

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escapeCell = (cell: unknown) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };
  return [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
  ].join("\n");
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const form = req.nextUrl.searchParams.get("form") || "form1";
  const format = req.nextUrl.searchParams.get("format") || "json";

  if (form === "form1") {
    const data = getAllForm1();
    if (format === "csv") {
      return new NextResponse(toCsv(data as unknown as Record<string, unknown>[]), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="survey_form1_responses.csv"`,
          "x-admin-token-valid": String(isTokenValid(extractToken(req))),
        },
      });
    }
    return NextResponse.json({ form: "form1", count: data.length, data });
  }

  if (form === "form2") {
    const data = getAllForm2();
    if (format === "csv") {
      return new NextResponse(toCsv(data as unknown as Record<string, unknown>[]), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="survey_form2_responses.csv"`,
        },
      });
    }
    return NextResponse.json({ form: "form2", count: data.length, data });
  }

  return NextResponse.json({ error: "Invalid form parameter" }, { status: 400 });
}
