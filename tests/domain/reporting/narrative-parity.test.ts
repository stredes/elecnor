import { describe, expect, it } from "vitest";
import {
  calculateNarrative,
  formatSectionName,
} from "@/backend/domain/reporting/calculate-narrative";
import type { NarrativeInput } from "@/backend/domain/reporting/reporting-detail-contract";

describe("NP-0035 narrative parity", () => {
  it("moves section gap, risk and EPP synthesis to the backend policy", () => {
    const input: NarrativeInput = {
      global: { score: 73.33, validScores: 10, below70: 3 },
      sections: [
        { name: "preparacion", percentage: 50 },
        { name: "ejecucion", percentage: 90 },
      ],
      distribution: [
        { label: "0-49", count: 1 },
        { label: "50-59", count: 2 },
        { label: "60-69", count: 3 },
      ],
      scatter: [
        { x: 64, y: 9.4, label: "PREP_AGUA", section: "preparacion" },
        { x: 66, y: 95, label: "EJEC_1", section: "ejecucion" },
        { x: 3, y: 30, label: "RARO", section: "otra" },
        { x: 10, y: null, label: "SIN_Y", section: "otra" },
      ],
      weak: [{
        metric: "Check list EPP", code: "PREP_EPP_CHECK", section: "preparacion",
        observations: 64, applicable: 64, conforming: 26, nonConforming: 38,
        compliance: 40.63, technicians: { conforming: [], nonConforming: [] },
      }],
      strong: [{
        metric: "Ejecución", code: "EJEC_1", section: "ejecucion",
        observations: 10, applicable: 10, conforming: 10, nonConforming: 0,
        compliance: 100, technicians: { conforming: [], nonConforming: [] },
      }],
    };

    expect(calculateNarrative(input)).toMatchObject({
      globalGap: { global: 73.33, gap: 26.67, healthy: 7 },
      sectionGap: { weakest: { name: "preparacion" }, restAverage: 90 },
      lowBandCount: 6,
      scatterRisk: { risk: 1, total: 3 },
      eppInsight: { directAverage: null, checklist: 40.63 },
      metricRange: { lowest: { code: "PREP_EPP_CHECK" }, highest: { code: "EJEC_1" } },
    });
    expect(formatSectionName("ascenso-y descenso")).toBe("Ascenso Y Descenso");
  });
});
