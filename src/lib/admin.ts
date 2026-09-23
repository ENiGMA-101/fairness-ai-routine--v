/**
 * Admin-only helpers. Diagnostics (/setup) and data export (/api/export) are not
 * public: they require the ADMIN_TOKEN environment variable (or its header/query).
 */

export const DEFAULT_ADMIN_TOKEN = "uap-research-admin";

export function getAdminToken(): string {
  return process.env.ADMIN_TOKEN?.trim() || DEFAULT_ADMIN_TOKEN;
}

export function isTokenValid(token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = getAdminToken();
  if (token.length !== expected.length) return false;
  // constant-time-ish comparison
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

export function extractToken(req: Request): string | null {
  const header = req.headers.get("x-admin-token");
  if (header) return header.trim();

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("token");
    if (query) return query.trim();
  } catch {
    /* ignore */
  }

  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
  if (match?.[1]) return decodeURIComponent(match[1]);
  return null;
}

export function isAdminRequest(req: Request): boolean {
  return isTokenValid(extractToken(req));
}

/** Never leak SQL/driver internals to the browser. */
export function publicMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const sensitive = [
    "failed query",
    "insert into",
    "select ",
    "database",
    "password",
    "econnrefused",
    "connection",
    "relation",
    "column",
    "syntax",
    "ssl",
    "timeout",
  ];
  const lower = raw.toLowerCase();
  if (sensitive.some((needle) => lower.includes(needle))) {
    return "Your response could not be stored right now. Please try again in a moment.";
  }
  return raw.slice(0, 300);
}
