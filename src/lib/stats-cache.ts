type CacheEntry = { data: unknown; expiry: number };

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * Simple in-memory TTL cache used to keep server pages instant.
 * On Vercel each lambda has its own copy — still cuts repeated DB hits to one per TTL window.
 * Concurrent callers for the same key share ONE in-flight fetch (no thundering herd on Neon
 * when many visitors poll the live endpoints at the same moment).
 */
export async function cachedValue<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
  options: { staleOnError?: boolean } = {},
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiry > now) return hit.data as T;
  const running = inflight.get(key);
  if (running) return running as Promise<T>;

  const request = (async () => {
    try {
      const data = await fetcher();
      cache.set(key, { data, expiry: Date.now() + ttlMs });
      return data;
    } catch (err) {
      if (hit && options.staleOnError !== false) return hit.data as T; // stale-while-error
      cache.delete(key);
      throw err;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, request);
  return request;
}

export function invalidate(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
  // A fetch that started before a submission may hold pre-submission data: don't share it.
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) inflight.delete(key);
  }
}
