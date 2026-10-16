import { describe, expect, it } from "vitest";
import { parseInspectionDetail } from "@/backend/domain/inspections/detail-contract";

describe("inspection detail contract", () => {
  it("falls back to original metric names without changing the score", () => {
    const detail = parseInspectionDetail({
      inspection: inspection(),
      metrics: [{
        id: "metric-1", sectionNormalized: null, sectionOriginal: "EPP",
        metricNormalized: "", metricOriginal: "Casco", metricCode: "EPP-01",
        status: "NO CONFORME", applicable: 2, conforming: 1,
        nonConforming: 1, notApplicable: 0, observation: "Falta casco",
      }],
    });

    expect(detail.inspection.score).toBe(8);
    expect(detail.metrics[0]).toMatchObject({
      section: "EPP", metric: "Casco", code: "EPP-01",
    });
  });

  it("rejects a detail without an inspection or metric collection", () => {
    expect(() => parseInspectionDetail({ inspection: inspection() })).toThrow();
  });
});

function inspection() {
  return {
    id: "inspection-1", filename: "original.pdf", date: "2026-01-10", time: "09:00",
    technician: "Técnico A", auditor: "Auditor A", auditorRole: null, address: "Calle 1",
    city: "Ciudad", region: "Norte", percentage: 80, score: 8, maxScore: 10,
    actions: 0, rubric: "SYN", status: "COMPLETA", observation: null,
  };
}
