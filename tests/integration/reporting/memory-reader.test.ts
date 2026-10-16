import { describe, expect, it } from "vitest";
import { MemoryReportingFactsReader } from "@/backend/adapters/outbound/memory-reporting-facts-reader";
import { baselineReportingFacts } from "./reporting-fixtures";

describe("reporting memory reader boundary", () => {
  it("does not expose its collection storage", async () => {
    const result = await new MemoryReportingFactsReader(baselineReportingFacts).read();

    expect(result).not.toBe(baselineReportingFacts);
    expect(result.inspections).not.toBe(baselineReportingFacts.inspections);
    expect(result.importLogs).not.toBe(baselineReportingFacts.importLogs);
    expect(result.metrics).not.toBe(baselineReportingFacts.metrics);
  });
});
