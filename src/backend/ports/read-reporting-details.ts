import type { ReportingDetailFacts } from "../domain/reporting/reporting-details-contract";

export interface ReadReportingDetails {
  read(): Promise<ReportingDetailFacts>;
}
