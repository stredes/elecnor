import { describe, expect, it } from "vitest";
import { GetReportingDetails } from "@/backend/application/reporting/get-reporting-details";
import { MemoryReportingDetailsReader } from "@/backend/adapters/outbound/memory-reporting-details-reader";

describe("NP-0035/AC-03/TEST-03 reporting consumers", () => {
  it("keeps calculation in backend and injects the reader outside pages", async () => {
    const result = await new GetReportingDetails(new MemoryReportingDetailsReader({ inspections: [], metrics: [] })).execute();
    expect(result).toEqual({ sections: [], approvals: [], rankings: { weak: [], strong: [], scatter: [] }, narrative: expect.any(Object) });
  });
});
