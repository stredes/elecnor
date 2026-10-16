import { describe, expect, it } from "vitest";
import { GetReportingDetails } from "@/backend/application/reporting/get-reporting-details";
import { MemoryReportingDetailsReader } from "@/backend/adapters/outbound/memory-reporting-details-reader";

describe("NP-0035 reporting composition", () => {
  it("uses an injected facts reader and returns backend-owned policies", async () => {
    const useCase = new GetReportingDetails(new MemoryReportingDetailsReader({ inspections: [], metrics: [] }));
    await expect(useCase.execute()).resolves.toMatchObject({ sections: [], rankings: { weak: [], strong: [] } });
  });
});
