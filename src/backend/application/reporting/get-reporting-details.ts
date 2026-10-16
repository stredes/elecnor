import { calculateMetricDetail } from "../../domain/reporting/calculate-metric-detail";
import { calculateKpis } from "../../domain/reporting/calculate-kpis";
import {
  calculateMetricRanking,
  calculateMetricStats,
} from "../../domain/reporting/calculate-metric-ranking";
import { calculateNarrative } from "../../domain/reporting/calculate-narrative";
import { calculateSectionApprovals } from "../../domain/reporting/calculate-section-approvals";
import { calculateSectionReports } from "../../domain/reporting/calculate-section-reports";
import { countScoreBands } from "../../domain/reporting/count-score-bands";
import type {
  ReportingDetails,
  MetricDetail,
} from "../../domain/reporting/reporting-detail-contract";
import type { ReadInspectionFacts } from "../../ports/read-inspection-facts";

export class GetReportingDetails {
  public constructor(private readonly reader: ReadInspectionFacts) {}

  public async execute(): Promise<ReportingDetails> {
    const facts = await this.reader.read();
    const kpis = calculateKpis(facts);
    const sections = calculateSectionReports(facts);
    const metrics = calculateMetricRanking(calculateMetricStats(facts));
    return {
      sections,
      sectionInspections: calculateSectionApprovals(facts),
      metrics,
      narrative: calculateNarrative({
        global: {
          score: Number.parseFloat(kpis["Promedio global"]) || 0,
          validScores: kpis["Puntajes válidos"],
          below70: kpis["Bajo 70%"],
        },
        sections: sections.map(({ name, percentage }) => ({ name, percentage })),
        distribution: countScoreBands(facts),
        scatter: metrics.scatter,
        weak: metrics.weak,
        strong: metrics.strong,
      }),
    };
  }

  public async metricDetail(code: string): Promise<MetricDetail | null> {
    return calculateMetricDetail(await this.reader.read(), code);
  }
}
