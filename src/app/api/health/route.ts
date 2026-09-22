import { db, ensureTablesExist, getDatabaseUrl, isDatabaseConfigured } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isDatabaseConfigured();
  if (!configured) {
    return Response.json(
      {
        ok: false,
        status: "database_not_configured",
        message: "DATABASE_URL is not set. Add it in Vercel Project Settings > Environment Variables.",
      },
      { status: 503 },
    );
  }

  try {
    await db.execute(sql`select 1`);
    await ensureTablesExist();
    return Response.json({
      ok: true,
      database: "connected",
      tables: "ready",
      usingEnv: process.env.DATABASE_URL
        ? "DATABASE_URL"
        : process.env.POSTGRES_URL
          ? "POSTGRES_URL"
          : "OTHER",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database error";
    return Response.json(
      {
        ok: false,
        status: "database_error",
        error: message,
      },
      { status: 500 },
    );
  }
}
