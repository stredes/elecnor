import { describe, expect, it } from "vitest";
import { GetReportingDetails } from "@/backend/application/reporting/get-reporting-details";
import { MemoryReportingDetailsReader } from "@/backend/adapters/outbound/memory-reporting-details-reader";
import { MemoryReportingFactsReader } from "@/backend/adapters/outbound/memory-reporting-facts-reader";
import { baselineReportingFacts } from "../../domain/reporting/reporting-fixtures";

describe("NP-0035/AC-01/TEST-06 narrative overview integration", () => {
  it("uses overview facts for low bands, global gap, and healthy score count", async () => {
    const details = new MemoryReportingDetailsReader({ inspections: [], metrics: [] });
    const overview = new MemoryReportingFactsReader(baselineReportingFacts);
    const result = await new GetReportingDetails(details, overview).execute();
    expect(result.narrative.lowBands).toBe(1);
    expect(result.narrative.gap).toBe(26.67);
    expect(result.narrative.healthy).toBe(2);
  });
});
