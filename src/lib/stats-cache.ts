type CacheEntry = { data: unknown; expiry: number };

const cache = new Map<string, CacheEntry>();

/**
 * Simple in-memory TTL cache used to keep server pages instant.
 * On Vercel each lambda has its own copy — still cuts repeated DB hits to one per TTL window.
 */
export async function cachedValue<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiry > now) return hit.data as T;
  try {
    const data = await fetcher();
    cache.set(key, { data, expiry: now + ttlMs });
    return data;
  } catch (err) {
    if (hit) return hit.data as T; // stale-while-error
    throw err;
  }
}

export function invalidate(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}
