import { describe, expect, it } from "vitest";
import { createAsyncCache } from "@/backend/composition/async-cache";

describe("reporting async cache", () => {
  it("deduplicates concurrent reads and expires entries", async () => {
    let now = 0;
    let calls = 0;
    const cache = createAsyncCache(async () => ({ calls: ++calls }), 10, () => now);

    const [first, second] = await Promise.all([cache.read(), cache.read()]);
    expect(first).toEqual({ calls: 1 });
    expect(second).toEqual({ calls: 1 });
    now = 11;
    await expect(cache.read()).resolves.toEqual({ calls: 2 });
  });
});
