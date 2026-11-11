export function createAsyncCache<T>(reader: () => Promise<T>, ttlMs: number, now = Date.now) {
  let entry: { value: T; expiresAt: number } | undefined;
  let pending: Promise<T> | undefined;

  return {
    read: async (): Promise<T> => {
      if (entry && entry.expiresAt > now()) return entry.value;
      if (!pending) {
        pending = reader().then((value) => {
          entry = { value, expiresAt: now() + ttlMs };
          return value;
        }).finally(() => { pending = undefined; });
      }
      return pending;
    },
    clear: () => { entry = undefined; },
  };
}

export function createAsyncKeyedCache<T>(
  reader: (key: string) => Promise<T>,
  ttlMs: number,
  now = Date.now,
) {
  const entries = new Map<string, { value: T; expiresAt: number }>();
  const pending = new Map<string, Promise<T>>();

  return {
    read: async (key: string): Promise<T> => {
      const entry = entries.get(key);
      if (entry && entry.expiresAt > now()) return entry.value;
      const active = pending.get(key);
      if (active) return active;
      const request = reader(key).then((value) => {
        entries.set(key, { value, expiresAt: now() + ttlMs });
        return value;
      }).finally(() => { pending.delete(key); });
      pending.set(key, request);
      return request;
    },
    clear: () => { entries.clear(); pending.clear(); },
  };
}
