import { GetReportingDetails } from "../application/reporting/get-reporting-details";
import type { ReadInspectionFacts } from "../ports/read-inspection-facts";

export function createReportingDetails(reader: ReadInspectionFacts): GetReportingDetails {
  return new GetReportingDetails(reader);
}
