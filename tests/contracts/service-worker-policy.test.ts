import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "public/sw.js"), "utf8");

describe("section service worker cache policy", () => {
  it("uses a new cache generation so stale empty pages are evicted", () => {
    expect(source).toContain('CACHE_NAME = "elecnor-sections-v15"');
    expect(source).toContain('startsWith("elecnor-sections-")');
  });

  it("serves cached pages immediately while revalidating in the background", () => {
    expect(source).toContain("event.respondWith(staleWhileRevalidate(request))");
    expect(source).toContain("async function staleWhileRevalidate(request)");
    expect(source).not.toContain("networkFirst(");
  });
});
