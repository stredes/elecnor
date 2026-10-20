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
