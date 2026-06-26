/**
 * Tiny in-memory request de-duplicator + TTL cache, shared across all hook
 * instances in the tab.
 *
 * Why: hooks like useAuth / useEntitlement keep their own state, so every
 * component that mounts them independently fires the same Supabase request for
 * the same user (the audit saw the `profiles` row fetched many times per page).
 * Routing those reads through here means N concurrent callers share ONE
 * in-flight promise, and the result is reused for a short window afterwards.
 *
 * Scope: per-session, per-tab (module memory). Failures are evicted immediately
 * so a later caller can retry, and callers can invalidate on writes / sign-out.
 */

type Entry<T> = { at: number; promise: Promise<T> }

const store = new Map<string, Entry<unknown>>()

export function cachedRequest<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now()
  const hit = store.get(key) as Entry<T> | undefined
  if (hit && now - hit.at < ttlMs) return hit.promise

  const promise = fn()
  store.set(key, { at: now, promise })
  // Drop the entry if the request fails so the next caller re-fetches.
  promise.catch(() => {
    const cur = store.get(key)
    if (cur && cur.promise === promise) store.delete(key)
  })
  return promise
}

/** Invalidate everything (sign-out) or just keys starting with `prefix`. */
export function invalidateCache(prefix?: string) {
  if (!prefix) {
    store.clear()
    return
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}
