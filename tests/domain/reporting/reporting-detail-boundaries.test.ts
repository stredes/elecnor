import { describe, expect, it } from "vitest";
import { calculateMetricDetail } from "@/backend/domain/reporting/calculate-metric-detail";
import { calculateMetricRanking } from "@/backend/domain/reporting/calculate-metric-ranking";
import { calculateNarrative } from "@/backend/domain/reporting/calculate-narrative";
import { calculateMetricSnapshot } from "@/backend/domain/reporting/calculate-metric-snapshot";
import { calculateSectionApprovals } from "@/backend/domain/reporting/calculate-section-approvals";
import type { MetricStat, NarrativeInput } from "@/backend/domain/reporting/reporting-detail-contract";
import type { ReportingFacts } from "@/backend/domain/reporting/reporting-facts-contract";

const empty: ReportingFacts = { inspections: [], importLogs: [], metrics: [] };

describe("NP-0035/AC-02/TEST-02 reporting boundaries", () => {
  it("keeps no evidence as empty/null and does not synthesize EPP", () => {
    expect(calculateSectionApprovals(empty)).toEqual({ sections: [], allApproved: 0 });
    expect(calculateNarrative({
      sections: [], distribution: [], scatter: [], weak: [], strong: [],
    })).toMatchObject({
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
    expect(calculateMetricDetail(recordFacts, "RECORDS")?.records).toHaveLength(200);
  });

  it("uses the strong universe for the highest synthesis", () => {
    const input = {
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

const thresholdFacts: ReportingFacts = {
  inspections: ["I-1", "I-2", "I-3", "I-4"].map((id) => ({
    id, technician: null, percentage: null, actions: null,
  })),
  importLogs: [],
  metrics: [
    row("I-1", 10, 7, "CONFORME"), row("I-2", 0, 0, "NA"),
    row("I-3", 10, null, "DESCONOCIDO"), row("I-4", 10, 7, "CONFORME"),
  ],
};

function row(inspectionId: string, applicable: number, conforming: number | null, state: string) {
  return { inspectionId, section: "seccion", metric: "Métrica", code: "M",
    applicable, conforming, state };
}

const recordFacts: ReportingFacts = {
  inspections: Array.from({ length: 201 }, (_, index) => ({
    id: `I-${index}`, date: `2026-10-${String((index % 28) + 1).padStart(2, "0")}`,
    technician: "Ana", percentage: null, actions: null,
  })),
  importLogs: [],
  metrics: Array.from({ length: 201 }, (_, index) => ({
    inspectionId: `I-${index}`, code: "RECORDS", metric: "Métrica", section: "s",
    applicable: 1, conforming: 1, state: "CONFORME", observation: `O-${index}`,
  })),
};
