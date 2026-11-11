import { describe, expect, it } from "vitest";
import { MemoryElecnorComparisonReader } from "@/backend/adapters/outbound/memory-elecnor-reader";

describe("MemoryElecnorComparisonReader", () => {
  it("supports the synthetic comparison flow used by local E2E tests", async () => {
    const reader = new MemoryElecnorComparisonReader();
    const result = await reader.list({ q: "", status: "all", limit: 500, offset: 0 });
    expect(result.total).toBeGreaterThan(0);
    expect(result.data[0]).toMatchObject({ name: "NORTE, CLARA" });
    expect(result.metrics.total_workers).toBe(result.total);
  });

  it("filters by name or RUT without losing the comparison contract", async () => {
    const reader = new MemoryElecnorComparisonReader();
    const result = await reader.list({ q: "clara", status: "all", limit: 500, offset: 0 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].rut).toBe("11.111.111-1");
  });
});
