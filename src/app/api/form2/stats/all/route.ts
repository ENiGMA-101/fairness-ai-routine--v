import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import {
  db,
  ensureTablesExist,
  isDatabaseConfigured,
} from "@/db";
import { form2Responses } from "@/db/schema";
import { FORM2_ROW_KEYS } from "@/lib/results";
import {
  FORM2_COLUMN_KEYS,
  SURVEY_VERSION,
} from "@/lib/survey";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type QStats = {
  total: number;
  counts: Record<string, number>;
  percentages: Record<string, number>;
};

type StatsMap = Record<string, QStats>;

function tally(
  values: (string | number | null)[],
): QStats {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const value of values) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      continue;
    }

    const key = String(value);

    counts[key] =
      (counts[key] ?? 0) + 1;

    total++;
  }

  const percentages: Record<
    string,
    number
  > = {};

  for (const [key, count] of Object.entries(
    counts,
  )) {
    percentages[key] =
      total > 0
        ? Math.round(
            (count / total) * 100,
          )
        : 0;
  }

  return {
    total,
    counts,
    percentages,
  };
}

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Database is not configured.",
        code: "DATABASE_NOT_CONFIGURED",
      },
      {
        status: 503,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      },
    );
  }

  try {
    await ensureTablesExist();

    /*
     * Always read the current PostgreSQL state.
     */
    const rows = await db
      .select()
      .from(form2Responses)
      .where(
        eq(
          form2Responses.surveyVersion,
          SURVEY_VERSION,
        ),
      );

    const result: StatsMap = {};

    for (const key of FORM2_COLUMN_KEYS) {
      const column =
        FORM2_ROW_KEYS[key];

      result[key] = tally(
        rows.map(
          (row) =>
            (row[column] as
              | string
              | number
              | null) ?? null,
        ),
      );
    }

    return NextResponse.json(
      result,
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Form 2 live stats failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Database is unavailable.",
        code: "DATABASE_READ_FAILED",
      },
      {
        status: 503,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
}