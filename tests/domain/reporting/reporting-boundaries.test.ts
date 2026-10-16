import { describe, expect, it } from "vitest";
import { calculateKpis } from "@/backend/domain/reporting/calculate-kpis";
import { calculatePercentiles } from "@/backend/domain/reporting/calculate-percentiles";
import { countScoreBands } from "@/backend/domain/reporting/count-score-bands";
import type { ReportingFacts } from "@/backend/domain/reporting/reporting-facts-contract";

const empty: ReportingFacts = { inspections: [], importLogs: [], metrics: [] };

describe("NP-0034/AC-02/TEST-02 reporting boundaries", () => {
  it("keeps empty defaults and null percentiles without inventing evidence", () => {
    expect(calculateKpis(empty)).toMatchObject({
      "PDF recibidos": 0, "Puntajes válidos": 0, "Promedio global": "0.00%",
    });
    expect(calculatePercentiles(empty)).toEqual({ media: null, mediana: null, p25: null, p75: null });
    expect(countScoreBands(empty).every((band) => band.count === 0)).toBe(true);
  });

  it("keeps n1/n2 percentile indexes and exact score band limits", () => {
    const facts = withScores([0, 0.499999, 0.5, 0.599999, 0.6, 0.699999, 0.7,
      0.799999, 0.8, 0.899999, 0.9, 0.999999, 1, null]);
    expect(countScoreBands(facts).map((band) => band.count)).toEqual([2, 2, 2, 2, 2, 2, 1]);
    expect(calculatePercentiles(withScores([0.705]))).toEqual({ media: 70.5, mediana: 70.5, p25: 70.5, p75: 70.5 });
    expect(calculatePercentiles(withScores([0.5, 0.7]))).toEqual({ media: 60, mediana: 60, p25: 50, p75: 50 });
  });

  it("does not promote a value just below an SQL half tie", () => {
    expect(calculateKpis(withScores([0.70124999999999]))["Promedio global"]).toBe("70.12%");
  });
});

function withScores(scores: readonly (number | null)[]): ReportingFacts {
  return {
    inspections: scores.map((percentage) => ({ technician: null, percentage, actions: null })),
    importLogs: [], metrics: [],
  };
}
