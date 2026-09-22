import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

type Db = ReturnType<typeof drizzle>;

const globalForDb = globalThis as typeof globalThis & {
  __fairnessPool?: Pool;
  __fairnessDb?: Db;
};

function getPool(): Pool {
  if (!globalForDb.__fairnessPool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is required — set it in .env (locally) or in your host's environment variables.",
      );
    }
    globalForDb.__fairnessPool = new Pool({ connectionString: url });
  }
  return globalForDb.__fairnessPool;
}

function getDb(): Db {
  if (!globalForDb.__fairnessDb) {
    globalForDb.__fairnessDb = drizzle(getPool());
  }
  return globalForDb.__fairnessDb;
}

/**
 * Lazy proxies: importing this module never throws, so `next build` succeeds even
 * before DATABASE_URL is configured. The real pool is created on first query.
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
