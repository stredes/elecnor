import { describe, expect, it } from "vitest";
import { calculateRegionalSummary } from "@/backend/domain/reporting/calculate-regional-summary";
import { syntheticReportingFacts } from "@/backend/composition/synthetic-reporting-data";

describe("calculateRegionalSummary", () => {
  it("keeps audit counts, score denominators and non-compliances traceable by region", () => {
    const result = calculateRegionalSummary(syntheticReportingFacts.inspections, syntheticReportingFacts.metrics);
    expect(result).toEqual([
      { region: "Maule", audits: 2, validScores: 2, compliance: 72.5, belowThreshold: 1, nonCompliances: 4 },
      { region: "Valparaíso", audits: 1, validScores: 0, compliance: null, belowThreshold: 0, nonCompliances: 0 },
    ]);
  });

  it("does not lose an inspection without a resolvable region", () => {
    const [inspection] = syntheticReportingFacts.inspections;
    const result = calculateRegionalSummary([{ ...inspection, region: null, city: null, address: null, filename: null }], []);
    expect(result[0]).toMatchObject({ region: "Sin región informada", audits: 1, validScores: 1 });
  });
});
