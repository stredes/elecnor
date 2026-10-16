import { describe, expect, it } from "vitest";
import { ListInspections } from "@/backend/application/list-inspections";
import { MemoryInspectionReader } from "@/backend/adapters/outbound/memory-inspection-reader";
import { parseInspectionQuery } from "@/backend/domain/inspection-list-query";

describe("NP-0030/AC-01/TEST-01 inspection list parity", () => {
  it("returns rows, total, options and pagination through the reader port", async () => {
    const query = new ListInspections(new MemoryInspectionReader());
    const result = await query.execute(parseInspectionQuery({ limit: "25", offset: "0" }));

    expect(result.data.map((row) => row.id)).toEqual([
      "synthetic-inspection-3",
      "synthetic-inspection-2",
      "synthetic-inspection-1",
    ]);
    expect(result.total).toBe(3);
    expect(result.limit).toBe(25);
    expect(result.offset).toBe(0);
    expect(result.dates).toEqual(["2026-03-01", "2026-02-15", "2026-01-10"]);
    expect(result.auditors).toEqual(["Auditor A", "Auditor B"]);
    expect(result.regions).toEqual(["Norte", "Sur"]);
  });
});
