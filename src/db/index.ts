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
  browser_id text UNIQUE NOT NULL,
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
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS form2_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_id text UNIQUE NOT NULL,
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
  created_at timestamptz NOT NULL DEFAULT now()
);
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
