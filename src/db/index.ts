import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

type Db = ReturnType<typeof drizzle>;

const globalForDb = globalThis as typeof globalThis & {
  __fairnessPool?: Pool;
  __fairnessDb?: Db;
  __tablesInitPromise?: Promise<void>;
  __fairnessDbBrokenAt?: number;
};

export function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.SUPABASE_DATABASE_URL ||
    process.env.NEON_DATABASE_URL
  );
}

export function isDatabaseConfigured(): boolean {
  const url = getDatabaseUrl();
  return Boolean(url && url.trim().length > 0 && !url.includes("xxx.supabase.co"));
}

export function getPool(): Pool {
  if (!globalForDb.__fairnessPool) {
    const url = getDatabaseUrl();
    if (!url) {
      throw new Error("DATABASE_URL is not configured.");
    }

    const isLocal = url.includes("localhost") || url.includes("127.0.0.1");

    globalForDb.__fairnessPool = new Pool({
      connectionString: url,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 20000,
      connectionTimeoutMillis: 5000,
    });
  }
  return globalForDb.__fairnessPool;
}

export function getDb(): Db {
  if (!globalForDb.__fairnessDb) {
    globalForDb.__fairnessDb = drizzle(getPool());
  }
  return globalForDb.__fairnessDb;
}

const BROKEN_RETRY_MS = 30_000;

/**
 * If the configured database is unreachable (bad credentials, SSL, firewall…),
 * remember it for a short while so the app falls back to built-in storage
 * instantly instead of waiting for a connection timeout on every request.
 */
export function markDatabaseBroken(message: string): void {
  if (isConnectionError(message)) {
    globalForDb.__fairnessDbBrokenAt = Date.now();
  }
}

export function isDatabaseMarkedBroken(): boolean {
  const at = globalForDb.__fairnessDbBrokenAt;
  if (!at) return false;
  if (Date.now() - at > BROKEN_RETRY_MS) {
    globalForDb.__fairnessDbBrokenAt = undefined; // allow one retry
    return false;
  }
  return true;
}

function isConnectionError(message: string): boolean {
  const lower = message.toLowerCase();
  return [
    "econnrefused",
    "connection",
    "timeout",
    "password authentication",
    "ssl",
    "could not connect",
    "network",
    "enotfound",
    "terminated",
    "database_unavailable",
    "too many connections",
  ].some((needle) => lower.includes(needle));
}

export const DDL_SCHEMA = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS form1_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_id text NOT NULL,
  survey_version integer NOT NULL DEFAULT 2,
  role text NOT NULL,
  department text NOT NULL,
  department_other text,
  semester text,
  q_avoid text,
  q_weekly_off text,
  q_between_classes text,
  q_extra_time text,
  q_long_gap text,
  q_midday_break text,
  q_max_hours text,
  q_lab_cap text,
  q_priority_group text,
  q_conflict_student text,
  q_teaching_schedule text,
  q_zero_day text,
  q_consecutive text,
  q_gap_pref text,
  q_faculty_conflict text,
  q_compensate text,
  q_conflict_teacher text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT form1_role_check CHECK (role IN ('Student', 'Teacher')),
  CONSTRAINT form1_browser_version_unique UNIQUE (browser_id, survey_version)
);

CREATE TABLE IF NOT EXISTS form2_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_id text NOT NULL,
  survey_version integer NOT NULL DEFAULT 2,
  role text NOT NULL,
  department text NOT NULL,
  department_other text,
  time_slot_8_00 int NOT NULL,
  time_slot_9_30 int NOT NULL,
  time_slot_11_00 int NOT NULL,
  time_slot_12_30 int NOT NULL,
  time_slot_14_00 int NOT NULL,
  time_slot_15_30 int NOT NULL,
  time_slot_17_00 int NOT NULL,
  long_gap_rating int NOT NULL,
  fairness_rating int NOT NULL,
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT form2_role_check CHECK (role IN ('Student', 'Teacher')),
  CONSTRAINT form2_rating_range_check CHECK (
    time_slot_8_00 BETWEEN 1 AND 5 AND time_slot_9_30 BETWEEN 1 AND 5 AND
    time_slot_11_00 BETWEEN 1 AND 5 AND time_slot_12_30 BETWEEN 1 AND 5 AND
    time_slot_14_00 BETWEEN 1 AND 5 AND time_slot_15_30 BETWEEN 1 AND 5 AND
    time_slot_17_00 BETWEEN 1 AND 5 AND long_gap_rating BETWEEN 1 AND 5 AND
    fairness_rating BETWEEN 1 AND 5
  ),
  CONSTRAINT form2_browser_version_unique UNIQUE (browser_id, survey_version)
);

-- Upgrade existing pre-versioned installations without mixing old answers.
ALTER TABLE form1_responses ADD COLUMN IF NOT EXISTS survey_version integer;
ALTER TABLE form2_responses ADD COLUMN IF NOT EXISTS survey_version integer;
UPDATE form1_responses SET survey_version = 1 WHERE survey_version IS NULL;
UPDATE form2_responses SET survey_version = 1 WHERE survey_version IS NULL;
ALTER TABLE form1_responses ALTER COLUMN survey_version SET DEFAULT 2;
ALTER TABLE form2_responses ALTER COLUMN survey_version SET DEFAULT 2;
ALTER TABLE form1_responses ALTER COLUMN survey_version SET NOT NULL;
ALTER TABLE form2_responses ALTER COLUMN survey_version SET NOT NULL;
ALTER TABLE form1_responses DROP CONSTRAINT IF EXISTS form1_responses_browser_id_key;
ALTER TABLE form1_responses DROP CONSTRAINT IF EXISTS form1_responses_browser_id_unique;
ALTER TABLE form2_responses DROP CONSTRAINT IF EXISTS form2_responses_browser_id_key;
ALTER TABLE form2_responses DROP CONSTRAINT IF EXISTS form2_responses_browser_id_unique;
CREATE UNIQUE INDEX IF NOT EXISTS form1_browser_version_unique ON form1_responses (browser_id, survey_version);
CREATE UNIQUE INDEX IF NOT EXISTS form2_browser_version_unique ON form2_responses (browser_id, survey_version);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'form1_v2_answer_domain_check') THEN
    ALTER TABLE form1_responses ADD CONSTRAINT form1_v2_answer_domain_check CHECK (
      survey_version <> 2 OR (
        (q_avoid IS NULL OR q_avoid IN ('morning','evening')) AND
        (q_weekly_off IS NULL OR q_weekly_off IN ('one_day_off','daily')) AND
        (q_between_classes IS NULL OR q_between_classes IN ('back_to_back','with_break')) AND
        (q_extra_time IS NULL OR q_extra_time IN ('yes','no')) AND
        (q_long_gap IS NULL OR q_long_gap IN ('same_day','different_day')) AND
        (q_midday_break IS NULL OR q_midday_break IN ('mandatory','flexible')) AND
        (q_max_hours IS NULL OR q_max_hours IN ('4_hours','6_hours')) AND
        (q_lab_cap IS NULL OR q_lab_cap IN ('one','two')) AND
        (q_priority_group IS NULL OR q_priority_group IN ('seniors','juniors')) AND
        (q_conflict_student IS NULL OR q_conflict_student IN ('students_first','teacher_first')) AND
        (q_teaching_schedule IS NULL OR q_teaching_schedule IN ('less_days','daily_less')) AND
        (q_zero_day IS NULL OR q_zero_day IN ('yes','no')) AND
        (q_consecutive IS NULL OR q_consecutive IN ('continuous','with_break')) AND
        (q_gap_pref IS NULL OR q_gap_pref IN ('no_gap','consultation')) AND
        (q_faculty_conflict IS NULL OR q_faculty_conflict IN ('seniority_workload','semester_rotation')) AND
        (q_compensate IS NULL OR q_compensate IN ('yes','no')) AND
        (q_conflict_teacher IS NULL OR q_conflict_teacher IN ('students_first','teacher_first'))
      )
    ) NOT VALID;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'form1_v2_role_completeness_check') THEN
    ALTER TABLE form1_responses ADD CONSTRAINT form1_v2_role_completeness_check CHECK (
      survey_version <> 2 OR
      (role = 'Student' AND semester IS NOT NULL AND q_avoid IS NOT NULL AND q_weekly_off IS NOT NULL AND
       q_between_classes IS NOT NULL AND q_extra_time IS NOT NULL AND q_long_gap IS NOT NULL AND
       q_midday_break IS NOT NULL AND q_max_hours IS NOT NULL AND q_lab_cap IS NOT NULL AND
       q_priority_group IS NOT NULL AND q_conflict_student IS NOT NULL AND
       q_teaching_schedule IS NULL AND q_zero_day IS NULL AND q_consecutive IS NULL AND q_gap_pref IS NULL AND
       q_faculty_conflict IS NULL AND q_compensate IS NULL AND q_conflict_teacher IS NULL)
      OR
      (role = 'Teacher' AND semester IS NULL AND q_avoid IS NULL AND q_weekly_off IS NULL AND
       q_between_classes IS NULL AND q_extra_time IS NULL AND q_long_gap IS NULL AND q_midday_break IS NULL AND
       q_max_hours IS NULL AND q_lab_cap IS NULL AND q_priority_group IS NULL AND q_conflict_student IS NULL AND
       q_teaching_schedule IS NOT NULL AND q_zero_day IS NOT NULL AND q_consecutive IS NOT NULL AND
       q_gap_pref IS NOT NULL AND q_faculty_conflict IS NOT NULL AND q_compensate IS NOT NULL AND
       q_conflict_teacher IS NOT NULL)
    ) NOT VALID;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'form2_rating_range_check') THEN
    ALTER TABLE form2_responses ADD CONSTRAINT form2_rating_range_check CHECK (
      time_slot_8_00 BETWEEN 1 AND 5 AND time_slot_9_30 BETWEEN 1 AND 5 AND
      time_slot_11_00 BETWEEN 1 AND 5 AND time_slot_12_30 BETWEEN 1 AND 5 AND
      time_slot_14_00 BETWEEN 1 AND 5 AND time_slot_15_30 BETWEEN 1 AND 5 AND
      time_slot_17_00 BETWEEN 1 AND 5 AND long_gap_rating BETWEEN 1 AND 5 AND fairness_rating BETWEEN 1 AND 5
    ) NOT VALID;
  END IF;
END $$;
`;

/**
 * Safely and idempotently creates tables if connected to a real Postgres database.
 * If connection fails, throws so caller can seamlessly fallback to local storage.
 */
export async function ensureTablesExist(): Promise<void> {
  if (!isDatabaseConfigured()) return;

  if (isDatabaseMarkedBroken()) {
    throw new Error("database_unavailable");
  }

  if (!globalForDb.__tablesInitPromise) {
    globalForDb.__tablesInitPromise = (async () => {
      try {
        const poolInstance = getPool();
        await poolInstance.query(DDL_SCHEMA);
      } catch (err) {
        globalForDb.__tablesInitPromise = undefined;
        markDatabaseBroken(err instanceof Error ? err.message : String(err));
        throw err;
      }
    })();
  }
  return globalForDb.__tablesInitPromise;
}

/**
 * Lazy proxies so importing this module never throws during Next.js builds.
 */
export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const real = getPool() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(getPool()) : value;
  },
});

export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});
