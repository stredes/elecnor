import { calculateMetricRankings } from "../../domain/reporting/calculate-metric-rankings";
import { calculateReportingNarrative } from "../../domain/reporting/calculate-reporting-narrative";
import { calculateSectionApprovals } from "../../domain/reporting/calculate-section-approvals";
import { calculateSections } from "../../domain/reporting/calculate-sections";
import { calculateKpis } from "../../domain/reporting/calculate-kpis";
import { countScoreBands } from "../../domain/reporting/count-score-bands";
import type { ReportingFacts } from "../../domain/reporting/reporting-facts-contract";
import type { ReadInspectionFacts } from "../../ports/read-inspection-facts";
import type { ReadReportingDetails } from "../../ports/read-reporting-details";
import type { ReportingDetailsResult } from "./reporting-details-result-contract";

const emptyOverview: ReportingFacts = { inspections: [], importLogs: [], metrics: [] };

export class GetReportingDetails {
  public constructor(private readonly reader: ReadReportingDetails, private readonly overviewReader?: ReadInspectionFacts) {}

  public async execute(): Promise<ReportingDetailsResult> {
    const [facts, overviewFacts] = await Promise.all([
      this.reader.read(), this.overviewReader?.read() ?? Promise.resolve(emptyOverview),
    ]);
    const sections = calculateSections(facts);
    const approvals = calculateSectionApprovals(facts);
    const rankings = calculateMetricRankings(facts);
    const kpis = calculateKpis(overviewFacts);
    const lowBands = countScoreBands(overviewFacts).slice(0, 3).reduce((sum, band) => sum + band.count, 0);
    const narrative = calculateReportingNarrative({ sections: sections.map(({ name, compliance }) => ({ name, percentage: compliance })),
      weak: rankings.weak, strong: rankings.strong, scatter: rankings.scatter, lowBands,
      global: kpis["Promedio global"], validScores: kpis["Puntajes válidos"], below70: kpis["Bajo 70%"] });
    return { sections, approvals, rankings, narrative };
  }
}
