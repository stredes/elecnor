import { calculateMetricRankings } from "../../domain/reporting/calculate-metric-rankings";
import { calculateReportingNarrative } from "../../domain/reporting/calculate-reporting-narrative";
import { calculateSectionApprovals } from "../../domain/reporting/calculate-section-approvals";
import { calculateSections } from "../../domain/reporting/calculate-sections";
import type { ReadReportingDetails } from "../../ports/read-reporting-details";

export class GetReportingDetails {
  public constructor(private readonly reader: ReadReportingDetails) {}

  public async execute() {
    const facts = await this.reader.read();
    const sections = calculateSections(facts);
    const approvals = calculateSectionApprovals(facts);
    const rankings = calculateMetricRankings(facts);
    const narrative = calculateReportingNarrative({ sections: sections.map(({ name, compliance }) => ({ name, percentage: compliance })),
      weak: rankings.weak, strong: rankings.strong, scatter: rankings.scatter, lowBands: 0, global: "n/a", validScores: 0, below70: 0 });
    return { sections, approvals, rankings, narrative };
  }
}

export type ReportingDetailsResult = Awaited<ReturnType<GetReportingDetails["execute"]>>;
