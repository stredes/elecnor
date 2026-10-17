import type { ReportingOverview } from "../../domain/reporting/reporting-overview-contract";
import type { ReportingDetailsResult } from "./reporting-details-result-contract";

export type ReportSnapshot = {
  readonly overview: ReportingOverview;
  readonly details: ReportingDetailsResult;
};
