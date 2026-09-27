import { eq } from "drizzle-orm";
import { db, ensureTablesExist, isDatabaseConfigured, markDatabaseBroken } from "@/db";
import { form1Responses, form2Responses } from "@/db/schema";
import { FORM1_ROW_KEYS, FORM2_ROW_KEYS } from "@/lib/results";
import { getAllForm1, getAllForm2 } from "@/lib/storage";
import {
  DEPARTMENTS,
  FORM1_ALLOWED_VALUES,
  FORM1_COLUMN_KEYS,
  FORM2_COLUMN_KEYS,
  RATING_SCALE,
  ROLE_OPTIONS,
  SURVEY_VERSION,
} from "@/lib/survey";
import { countValidVotes, type VoteStats } from "@/lib/poll-analytics";

export type PollStatsMap = Record<string, VoteStats>;

export function allowedForm2Values(question: string): readonly string[] {
  if (question === "role") return ROLE_OPTIONS.map(({ value }) => value);
  if (question === "department") return DEPARTMENTS;
  return RATING_SCALE.map(({ value }) => String(value));
}

/** One fresh read for all questions; errors never substitute stale local counts. */
export async function getForm1PollStats(): Promise<PollStatsMap> {
  let rows;
  if (isDatabaseConfigured()) {
    try {
      await ensureTablesExist();
      rows = await db.select().from(form1Responses).where(eq(form1Responses.surveyVersion, SURVEY_VERSION));
    } catch (error) {
      markDatabaseBroken(error instanceof Error ? error.message : String(error));
      throw new Error("Live poll results are temporarily unavailable");
    }
  } else {
    // Local preview only; a configured database is always authoritative.
    rows = getAllForm1();
  }

  const result: PollStatsMap = {};
  for (const key of FORM1_COLUMN_KEYS) {
    const property = FORM1_ROW_KEYS[key];
    const answers = rows.map((row) => (row as unknown as Record<string, unknown>)[property]);
    result[key] = countValidVotes(answers, FORM1_ALLOWED_VALUES[key] ?? []);
  }
  return result;
}

export async function getForm2PollStats(): Promise<PollStatsMap> {
  let rows;
  if (isDatabaseConfigured()) {
    try {
      await ensureTablesExist();
      rows = await db.select().from(form2Responses).where(eq(form2Responses.surveyVersion, SURVEY_VERSION));
    } catch (error) {
      markDatabaseBroken(error instanceof Error ? error.message : String(error));
      throw new Error("Live poll results are temporarily unavailable");
    }
  } else {
    rows = getAllForm2();
  }

  const result: PollStatsMap = {};
  for (const key of FORM2_COLUMN_KEYS) {
    const property = FORM2_ROW_KEYS[key];
    const answers = rows.map((row) => (row as unknown as Record<string, unknown>)[property]);
    result[key] = countValidVotes(answers, allowedForm2Values(key));
  }
  return result;
}
