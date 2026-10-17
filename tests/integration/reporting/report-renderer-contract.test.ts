import { describe, expect, it } from "vitest";
import { GetDashboardOverview } from "@/backend/application/reporting/get-dashboard-overview";
import { GetReportingDetails } from "@/backend/application/reporting/get-reporting-details";
import { buildReportSnapshot } from "@/backend/application/reporting/build-report-snapshot";
import { MemoryReportingFactsReader } from "@/backend/adapters/outbound/memory-reporting-facts-reader";
import { MemoryReportingDetailsReader } from "@/backend/adapters/outbound/memory-reporting-details-reader";
import { MemoryReportRenderer } from "@/backend/adapters/outbound/memory-report-renderer";
import { baselineReportingFacts } from "../../domain/reporting/reporting-fixtures";

describe("NP-0040/AC-02/TEST-02 report renderer contract", () => {
  it("keeps untrusted text as a text cell, never as a formula", async () => {
    const overview = await new GetDashboardOverview(new MemoryReportingFactsReader(baselineReportingFacts)).execute();
    const details = await new GetReportingDetails(new MemoryReportingDetailsReader({ inspections: [], metrics: [] })).execute();
    const snapshot = buildReportSnapshot(overview, details);
    const renderer = new MemoryReportRenderer([{ type: "text", value: "=SUM(A1)" }]);

    const result = await renderer.render(snapshot);

    expect(result.status).toBe("RENDERED");
    expect(result.sheets[0]?.cells[0]).toEqual({ type: "text", value: "=SUM(A1)" });
    expect(renderer.lastSnapshot).toBe(snapshot);
  });
});
