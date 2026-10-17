import { GetDashboardOverview } from "../application/reporting/get-dashboard-overview";
import { GetReportingAnalytics } from "../application/reporting/get-reporting-analytics";
import { GetReportingDetails } from "../application/reporting/get-reporting-details";
import { MemoryReportingFactsReader } from "../adapters/outbound/memory-reporting-facts-reader";
import { MemoryReportingDetailsReader } from "../adapters/outbound/memory-reporting-details-reader";
import { syntheticReportingDetailFacts, syntheticReportingFacts } from "./synthetic-reporting-data";
import { getMetricDetail } from "../domain/reporting/get-metric-detail";

const factsReader = new MemoryReportingFactsReader(syntheticReportingFacts);
const detailsReader = new MemoryReportingDetailsReader(syntheticReportingDetailFacts);
const overview = new GetDashboardOverview(factsReader);
const details = new GetReportingDetails(detailsReader, factsReader);
const analytics = new GetReportingAnalytics(factsReader);

export const syntheticReportingQuery = {
  async execute() {
    const [overviewResult, detailsResult, analyticsResult] = await Promise.all([
      overview.execute(), details.execute(), analytics.execute(),
    ]);
    return { overview: overviewResult, details: detailsResult, analytics: analyticsResult };
  },
};

export const syntheticMetricDetailQuery = {
  async execute(code: string) {
    return getMetricDetail(syntheticReportingDetailFacts, code);
  },
};
