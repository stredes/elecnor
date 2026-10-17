import { calculateGeolocation } from "../../domain/analytics/geolocation";
import { calculateRanking } from "../../domain/analytics/ranking";
import { calculateMonthlySeries, calculateWeeklySeries } from "../../domain/analytics/series";
import { calculateTraceability } from "../../domain/analytics/traceability";
import type { ReportingAnalytics } from "../../domain/analytics/analytics-contract";
import type { ReadInspectionFacts } from "../../ports/read-inspection-facts";

export class GetReportingAnalytics {
  public constructor(private readonly reader: ReadInspectionFacts) {}

  public async execute(): Promise<ReportingAnalytics> {
    const facts = await this.reader.read();
    const weekly = calculateWeeklySeries(facts.inspections);
    return {
      progress: calculateMonthlySeries(facts.inspections),
      evolution: { semanas: weekly, total: weekly.reduce((sum, item) => sum + item.inspecciones, 0) },
      ranking: calculateRanking(facts.inspections),
      traceability: calculateTraceability(facts.inspections),
      geolocation: calculateGeolocation(facts.inspections),
    };
  }
}
