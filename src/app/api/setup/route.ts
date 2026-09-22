import { NextResponse } from "next/server";
import { db, ensureTablesExist, getDatabaseUrl, isDatabaseConfigured } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isDatabaseConfigured();
  const url = getDatabaseUrl();

  const detectedEnv = process.env.DATABASE_URL
    ? "DATABASE_URL"
    : process.env.POSTGRES_URL
      ? "POSTGRES_URL"
      : process.env.POSTGRES_PRISMA_URL
        ? "POSTGRES_PRISMA_URL"
        : null;

  if (!configured) {
    return NextResponse.json({
      configured: false,
      connected: false,
      detectedEnv: null,
      message: "No database environment variable detected.",
    });
  }

  // Mask database URL for safety (keep host only)
  let host = "unknown";
  try {
    if (url) {
      const parsed = new URL(url.replace("postgresql://", "http://").replace("postgres://", "http://"));
      host = parsed.hostname;
    }
  } catch {
    /* ignore */
  }

  try {
    await db.execute(sql`select 1`);
    await ensureTablesExist();

    const f1Result = await db.execute(sql`select count(*) from form1_responses`);
    const f2Result = await db.execute(sql`select count(*) from form2_responses`);

    const f1Count = Number((f1Result.rows[0] as { count?: string })?.count ?? 0);
    const f2Count = Number((f2Result.rows[0] as { count?: string })?.count ?? 0);

    return NextResponse.json({
      configured: true,
      connected: true,
      host,
      detectedEnv,
      tablesReady: true,
      f1Count,
      f2Count,
      message: "Database connected and all tables initialized successfully!",
    });
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        configured: true,
        connected: false,
        host,
        detectedEnv,
        tablesReady: false,
        error: raw,
        message: "Failed to connect to the database. Check credentials or SSL.",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  // 1-Click force table creation
  try {
    await ensureTablesExist();
    return NextResponse.json({ ok: true, message: "Tables created/verified successfully!" });
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: raw }, { status: 500 });
  }
}
