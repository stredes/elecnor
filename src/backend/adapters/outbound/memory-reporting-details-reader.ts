import type { ReportingDetailFacts } from "../../domain/reporting/reporting-details-contract";
import type { ReadReportingDetails } from "../../ports/read-reporting-details";

export class MemoryReportingDetailsReader implements ReadReportingDetails {
  public constructor(private readonly facts: ReportingDetailFacts) {}

  public async read(): Promise<ReportingDetailFacts> {
    return { inspections: [...this.facts.inspections], metrics: [...this.facts.metrics] };
  }
}
