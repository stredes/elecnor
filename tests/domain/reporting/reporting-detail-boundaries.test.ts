import { describe, expect, it } from "vitest";
import { calculateMetricDetail } from "@/backend/domain/reporting/calculate-metric-detail";
import { calculateGlobalGap } from "@/backend/domain/reporting/calculate-global-gap";
import {
  calculateMetricRanking,
  calculateMetricStats,
  selectMetricBand,
} from "@/backend/domain/reporting/calculate-metric-ranking";
import { calculateNarrative } from "@/backend/domain/reporting/calculate-narrative";
import { calculateMetricSnapshot } from "@/backend/domain/reporting/calculate-metric-snapshot";
import { calculateSectionApprovals } from "@/backend/domain/reporting/calculate-section-approvals";
import type { MetricStat, NarrativeInput } from "@/backend/domain/reporting/reporting-detail-contract";
import type { ReportingFacts } from "@/backend/domain/reporting/reporting-facts-contract";
import { recordFacts, metricRow, thresholdFacts } from "./reporting-boundary-fixtures";

const empty: ReportingFacts = { inspections: [], importLogs: [], metrics: [] };

describe("NP-0035/AC-02/TEST-02 reporting boundaries", () => {
  it("keeps no evidence as empty/null and does not synthesize EPP", () => {
    expect(calculateSectionApprovals(empty)).toEqual({ sections: [], allApproved: 0 });
    expect(calculateGlobalGap({ score: Number.NaN, validScores: 0, below70: 0 }))
      .toEqual({ global: 0, gap: 100, healthy: 0 });
    expect(calculateNarrative({
      global: { score: 0, validScores: 0, below70: 0 },
      sections: [], distribution: [], scatter: [], weak: [], strong: [],
    })).toMatchObject({
      globalGap: { global: 0, gap: 100, healthy: 0 },
      sectionGap: { weakest: null, restAverage: null },
      lowBandCount: 0,
      scatterRisk: { risk: 0, total: 0 },
      eppInsight: { directAverage: null, checklist: null },
    });
    expect(calculateMetricSnapshot(snapshot(0, 0, null), "section").nonCompliance).toBeNull();
  });

  it("accepts exact 70 and keeps NA/unknown outside approvals", () => {
    const result = calculateSectionApprovals(thresholdFacts);
    expect(result.sections[0]).toMatchObject({
      total: 4, evaluated: 2, approved: 2, belowThreshold: 0,
      notEvaluated: 2, approvalPercentage: 100,
    });
    expect(result.allApproved).toBe(2);
  });

  it("preserves snapshot rounding, top limits and records200", () => {
    expect(calculateMetricSnapshot(snapshot(3, 2, 66.7), "section").nonCompliance).toBe(33.3);
    expect(calculateMetricSnapshot(snapshot(3, 2, 33.333), "stat").nonCompliance).toBe(66.67);
    const stats = Array.from({ length: 13 }, (_, index) => metric(`M-${index}`, 50));
    expect(calculateMetricRanking(stats).weak).toHaveLength(10);
    expect(calculateMetricRanking(stats).strong).toHaveLength(10);
    expect(selectMetricBand(stats, "weak")).toHaveLength(12);
    expect(calculateMetricDetail(recordFacts, "RECORDS")?.records).toHaveLength(200);
  });

  it("inherits technicians from the inspection when metric facts omit them", () => {
    const facts = {
      ...thresholdFacts,
      inspections: thresholdFacts.inspections.map((item) =>
        item.id === "I-1" ? { ...item, technician: "Ana" } : item),
      metrics: [metricRow("I-1", 10, 7, "CONFORME")],
    };
    const stats = calculateMetricStats(facts);
    const detail = calculateMetricDetail(facts, "M");
    expect(stats[0].technicians.conforming).toEqual(["Ana"]);
    expect(detail?.technicians[0].technician).toBe("Ana");
    const orphanFacts = {
      inspections: [{ technician: "Luis", percentage: null, actions: null }],
      importLogs: [], metrics: [{ ...metricRow("I-1", 10, 7, "CONFORME"), inspectionId: undefined }],
    } as ReportingFacts;
    expect(calculateMetricStats(orphanFacts)[0].technicians.conforming).toEqual([]);
  });

  it("uses the strong universe for the highest synthesis", () => {
    const input = {
      global: { score: 0, validScores: 0, below70: 0 },
      sections: [], distribution: [], scatter: [],
      weak: [metric("WEAK", 40)], strong: [metric("STRONG", 99)],
    } as unknown as NarrativeInput;
    const range = calculateNarrative(input).metricRange;
    expect(range.lowest?.code).toBe("WEAK");
    expect(range.highest?.code).toBe("STRONG");
  });
});

function snapshot(applicable: number, conforming: number, compliance: number | null) {
  return { code: "M", metric: "Métrica", section: "s", applicable, conforming,
    nonConforming: applicable - conforming, compliance };
}

function metric(code: string, compliance: number): MetricStat {
  return { metric: code, code, section: "s", observations: 1, applicable: 1,
    conforming: compliance / 100, nonConforming: 0, compliance,
    technicians: { conforming: [], nonConforming: [] } };
}
