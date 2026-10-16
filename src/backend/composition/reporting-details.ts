import { GetReportingDetails } from "../application/reporting/get-reporting-details";
import type { ReadReportingDetails } from "../ports/read-reporting-details";

export function createReportingDetails(reader: ReadReportingDetails): GetReportingDetails {
  return new GetReportingDetails(reader);
}
