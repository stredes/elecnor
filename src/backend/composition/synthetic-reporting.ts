import { GetDashboardOverview } from "../application/reporting/get-dashboard-overview";
import { GetReportingAnalytics } from "../application/reporting/get-reporting-analytics";
import { GetReportingDetails } from "../application/reporting/get-reporting-details";
import { MemoryReportingFactsReader } from "../adapters/outbound/memory-reporting-facts-reader";
import { MemoryReportingDetailsReader } from "../adapters/outbound/memory-reporting-details-reader";
import { syntheticReportingDetailFacts, syntheticReportingFacts } from "./synthetic-reporting-data";
import { getMetricDetail } from "../domain/reporting/get-metric-detail";
import { calculateRegionalSummary } from "../domain/reporting/calculate-regional-summary";
import { calculateWorkContextInspections, calculateWorkContextPeople } from "../domain/reporting/calculate-work-context-people";
import { calculatePeopleSample } from "../domain/reporting/calculate-people-sample";

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
    return { overview: overviewResult, details: detailsResult, analytics: analyticsResult, executive: { regions: calculateRegionalSummary(syntheticReportingFacts.inspections, syntheticReportingFacts.metrics), peopleByWorkContext: calculateWorkContextPeople(syntheticReportingFacts.inspections), inspectionsByWorkContext: calculateWorkContextInspections(syntheticReportingFacts.inspections), peopleSample: calculatePeopleSample(syntheticReportingFacts.inspections) } };
  },
};

export const syntheticMetricDetailQuery = {
  async execute(code: string) {
    return getMetricDetail(syntheticReportingDetailFacts, code);
  },
};
