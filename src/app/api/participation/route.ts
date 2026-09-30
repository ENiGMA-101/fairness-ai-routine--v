import { NextResponse, type NextRequest } from "next/server";
import { and, eq, lt, sql } from "drizzle-orm";
import { db, ensureTablesExist } from "@/db";
import { form1Responses, form2Responses, surveyPresence } from "@/db/schema";
import { SURVEY_VERSION } from "@/lib/survey";
import { PRESENCE_TIMEOUT_SECONDS, type ParticipationSnapshot } from "@/lib/participation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store, max-age=0" };

type CountsRow = {
  live_total: string;
  live_form1: string;
  live_form2: string;
  submitted_total: string;
  submitted_form1: string;
  submitted_form2: string;
};

/** Database-only aggregates. Drafts and local submission markers are never read. */
export async function GET() {
  try {
    await ensureTablesExist();
    const result = await db.execute<CountsRow>(sql`
      WITH active AS (
        SELECT ${surveyPresence.browserId} AS browser_id, ${surveyPresence.scope} AS scope
        FROM ${surveyPresence}
        WHERE ${surveyPresence.lastSeen} > now() - make_interval(secs => ${PRESENCE_TIMEOUT_SECONDS})
      ), submitted AS (
        SELECT ${form1Responses.browserId} AS browser_id, 'form1' AS form
        FROM ${form1Responses} WHERE ${form1Responses.surveyVersion} = ${SURVEY_VERSION}
        UNION ALL
        SELECT ${form2Responses.browserId} AS browser_id, 'form2' AS form
        FROM ${form2Responses} WHERE ${form2Responses.surveyVersion} = ${SURVEY_VERSION}
      )
      SELECT
        (SELECT count(DISTINCT browser_id) FROM active) AS live_total,
        (SELECT count(DISTINCT browser_id) FROM active WHERE scope = 'form1') AS live_form1,
        (SELECT count(DISTINCT browser_id) FROM active WHERE scope = 'form2') AS live_form2,
        (SELECT count(DISTINCT browser_id) FROM submitted) AS submitted_total,
        (SELECT count(DISTINCT browser_id) FROM submitted WHERE form = 'form1') AS submitted_form1,
        (SELECT count(DISTINCT browser_id) FROM submitted WHERE form = 'form2') AS submitted_form2
    `);
    const row = result.rows[0];
    const snapshot: ParticipationSnapshot = {
      live: { total: Number(row.live_total), form1: Number(row.live_form1), form2: Number(row.live_form2) },
      submitted: { total: Number(row.submitted_total), form1: Number(row.submitted_form1), form2: Number(row.submitted_form2) },
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(snapshot, { headers });
  } catch (error) {
    console.error("Participation aggregate unavailable:", error);
    return NextResponse.json({ error: "Participation is temporarily unavailable. Please retry." }, { status: 503, headers });
  }
}

const validId = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);

/** A heartbeat carries only IDs and a page scope. It cannot create a response. */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid presence payload" }, { status: 400 });
  }
  const { browserId, sessionId, scope, action = "heartbeat" } = body;
  if (!validId(browserId) || !validId(sessionId) || !["heartbeat", "leave"].includes(String(action))) {
    return NextResponse.json({ error: "Valid browser and session IDs are required" }, { status: 400 });
  }
  if (action !== "leave" && scope !== "home" && scope !== "form1" && scope !== "form2") {
    return NextResponse.json({ error: "Invalid survey scope" }, { status: 400 });
  }
  try {
    await ensureTablesExist();
    if (action === "leave") {
      await db.delete(surveyPresence).where(and(
        eq(surveyPresence.sessionId, sessionId), eq(surveyPresence.browserId, browserId),
      ));
    } else {
      await db.insert(surveyPresence).values({ browserId, sessionId, scope: scope as string })
        .onConflictDoUpdate({
          target: surveyPresence.sessionId,
          set: { scope: scope as string, lastSeen: sql`now()` },
          setWhere: eq(surveyPresence.browserId, browserId),
        });
      // Physical cleanup is additive and never touches either response table.
      await db.delete(surveyPresence).where(lt(surveyPresence.lastSeen, sql`now() - interval '5 minutes'`));
    }
    return NextResponse.json({ ok: true }, { headers });
  } catch (error) {
    console.error("Presence heartbeat unavailable:", error);
    return NextResponse.json({ error: "Presence is temporarily unavailable" }, { status: 503, headers });
  }
}
