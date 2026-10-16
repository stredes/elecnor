import { calculateKpis } from "../../domain/reporting/calculate-kpis";
import { calculatePercentiles } from "../../domain/reporting/calculate-percentiles";
import { countScoreBands } from "../../domain/reporting/count-score-bands";
import type { ReportingOverview } from "../../domain/reporting/reporting-overview-contract";
import type { ReadInspectionFacts } from "../../ports/read-inspection-facts";

export class GetDashboardOverview {
  public constructor(private readonly reader: ReadInspectionFacts) {}

  public async execute(): Promise<ReportingOverview> {
    const facts = await this.reader.read();
    const kpis = calculateKpis(facts);
    return {
      kpis,
      panorama: { ...calculatePercentiles(facts), "Puntaje perfecto": kpis["Puntaje perfecto"] },
      distribution: countScoreBands(facts),
    };
  }
}
