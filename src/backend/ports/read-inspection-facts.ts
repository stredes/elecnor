import type { ReportingFacts } from "../domain/reporting/reporting-facts-contract";

export interface ReadInspectionFacts {
  read(): Promise<ReportingFacts>;
}
