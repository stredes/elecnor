import { GetDashboardOverview } from "../application/reporting/get-dashboard-overview";
import type { ReadInspectionFacts } from "../ports/read-inspection-facts";

export function createReportingOverview(
  reader: ReadInspectionFacts,
): GetDashboardOverview {
  return new GetDashboardOverview(reader);
}
