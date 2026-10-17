import { describe, expect, it } from "vitest";
import { GetDashboardOverview } from "@/backend/application/reporting/get-dashboard-overview";
import { GetReportingDetails } from "@/backend/application/reporting/get-reporting-details";
import { MemoryReportingFactsReader } from "@/backend/adapters/outbound/memory-reporting-facts-reader";
import { MemoryReportingDetailsReader } from "@/backend/adapters/outbound/memory-reporting-details-reader";
import { buildReportSnapshot } from "@/backend/application/reporting/build-report-snapshot";
import { baselineReportingFacts } from "../../domain/reporting/reporting-fixtures";

describe("NP-0040/AC-01/TEST-01 report snapshot", () => {
  it("keeps the official overview and detail results without recalculation", async () => {
    const overview = await new GetDashboardOverview(new MemoryReportingFactsReader(baselineReportingFacts)).execute();
    const details = await new GetReportingDetails(new MemoryReportingDetailsReader({ inspections: [], metrics: [] })).execute();

    const snapshot = buildReportSnapshot(overview, details);

    expect(snapshot.overview).toBe(overview);
    expect(snapshot.details).toBe(details);
  });
});
