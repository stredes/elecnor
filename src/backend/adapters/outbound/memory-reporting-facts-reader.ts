import type { ReportingFacts } from "../../domain/reporting/reporting-facts-contract";
import type { ReadInspectionFacts } from "../../ports/read-inspection-facts";

export class MemoryReportingFactsReader implements ReadInspectionFacts {
  public constructor(private readonly facts: ReportingFacts) {}

  public async read(): Promise<ReportingFacts> {
    return this.facts;
  }
}
