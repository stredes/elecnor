import { describe, expect, it } from "vitest";
import { calculateMetricDetail } from "@/backend/domain/reporting/calculate-metric-detail";
import {
  calculateMetricStats,
  calculateMetricRanking,
} from "@/backend/domain/reporting/calculate-metric-ranking";
import { detailFacts } from "./reporting-detail-fixtures";

describe("NP-0035 metric parity", () => {
  it("preserves compliance, technicians, ranking and metric detail", () => {
    const stats = calculateMetricStats(detailFacts);
    expect(stats.map((metric) => metric.code)).toEqual(["AST", "PREP_EPP_CHECK", "EPP_DIRECT"]);
    expect(stats[1]).toMatchObject({
      observations: 3,
      applicable: 20,
      conforming: 12,
      nonConforming: 1,
      compliance: 60,
    });

    const ranking = calculateMetricRanking(stats);
    expect(ranking.weak.map((metric) => metric.code)).toEqual([
      "PREP_EPP_CHECK", "AST", "EPP_DIRECT",
    ]);
    expect(ranking.strong.map((metric) => metric.code)).toEqual([
      "EPP_DIRECT", "AST", "PREP_EPP_CHECK",
    ]);

    const detail = calculateMetricDetail(detailFacts, "PREP_EPP_CHECK");
    expect(detail).toMatchObject({
      code: "PREP_EPP_CHECK",
      observations: 3,
      applicable: 20,
      compliance: 60,
    });
    expect(detail?.technicians.map((technician) => technician.technician)).toEqual([
      "Ana", "Bruno",
    ]);
    expect(detail?.records.map((record) => record.inspectionId)).toEqual([
      "I-2", "I-1",
    ]);
  });
});
