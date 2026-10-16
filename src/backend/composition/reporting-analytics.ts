import { GetReportingAnalytics } from "../application/reporting/get-reporting-analytics";
import type { ReadInspectionFacts } from "../ports/read-inspection-facts";

export function createReportingAnalytics(reader: ReadInspectionFacts): GetReportingAnalytics {
  return new GetReportingAnalytics(reader);
}
