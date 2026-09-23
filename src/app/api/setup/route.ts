import { NextResponse, type NextRequest } from "next/server";
import { db, ensureTablesExist, getDatabaseUrl, isDatabaseConfigured } from "@/db";
import { isAdminRequest, publicMessage } from "@/lib/admin";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

function detectedEnv(): string | null {
  if (process.env.DATABASE_URL) return "DATABASE_URL";
  if (process.env.POSTGRES_URL) return "POSTGRES_URL";
  if (process.env.POSTGRES_PRISMA_URL) return "POSTGRES_PRISMA_URL";
  return null;
}

function maskedHost(): string | null {
  const url = getDatabaseUrl();
  if (!url) return null;
  try {
    const parsed = new URL(
      url.replace("postgresql://", "http://").replace("postgres://", "http://"),
    );
    return parsed.hostname;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      connected: false,
      detectedEnv: null,
      mode: "zero_config",
      message:
        "No database connected — the built-in storage engine is active. Survey works out of the box.",
    });
  }

  try {
    await db.execute(sql`select 1`);
    await ensureTablesExist();

    const f1Result = await db.execute(sql`select count(*) from form1_responses`);
    const f2Result = await db.execute(sql`select count(*) from form2_responses`);

    return NextResponse.json({
      configured: true,
      connected: true,
      host: maskedHost(),
      detectedEnv: detectedEnv(),
      tablesReady: true,
      f1Count: Number((f1Result.rows[0] as { count?: string })?.count ?? 0),
      f2Count: Number((f2Result.rows[0] as { count?: string })?.count ?? 0),
      message: "Database connected, tables initialized.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        connected: false,
        host: maskedHost(),
        detectedEnv: detectedEnv(),
        tablesReady: false,
        error: publicMessage(error),
        message: "Database unreachable — falling back to built-in storage.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    await ensureTablesExist();
    return NextResponse.json({ ok: true, message: "Tables verified." });
  } catch (error) {
    return NextResponse.json({ ok: false, error: publicMessage(error) }, { status: 500 });
  }
}
