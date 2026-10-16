import type { ReportingOverview } from "../../domain/reporting/reporting-overview-contract";
import type { ReportingDetailsResult } from "./reporting-details-result-contract";
import type { ReportSnapshot } from "./report-snapshot-contract";

export function buildReportSnapshot(overview: ReportingOverview, details: ReportingDetailsResult): ReportSnapshot {
  return { overview, details };
}
