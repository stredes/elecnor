import type { ReportSnapshot } from "../../application/reporting/report-snapshot-contract";

export interface ReadReportSnapshot {
  read(): Promise<ReportSnapshot>;
}
