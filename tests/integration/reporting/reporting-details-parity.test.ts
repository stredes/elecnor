import { describe, expect, it } from "vitest";
import { GetReportingDetails } from "@/backend/application/reporting/get-reporting-details";
import {
  MemoryReportingFactsReader,
} from "@/backend/adapters/outbound/memory-reporting-facts-reader";
import { detailFacts } from "../../domain/reporting/reporting-detail-fixtures";

describe("NP-0035/AC-01/TEST-01 reporting details", () => {
  it("coordinates section, metric and narrative projections from one reader", async () => {
    const useCase = new GetReportingDetails(new MemoryReportingFactsReader(detailFacts));
    const result = await useCase.execute();

    expect(result.sectionInspections.allApproved).toBe(3);
    expect(result.narrative.globalGap).toEqual({ global: 70, gap: 30, healthy: 1 });
    expect(result.metrics.weak[0].code).toBe("PREP_EPP_CHECK");
    expect(result.narrative.lowBandCount).toBe(1);
    await expect(useCase.metricDetail("PREP_EPP_CHECK")).resolves.toMatchObject({
      compliance: 60,
    });
  });
});
