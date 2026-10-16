import { describe, expect, it } from "vitest";
import { calculateMetricRankings } from "@/backend/domain/reporting/calculate-metric-rankings";
import { calculateSections } from "@/backend/domain/reporting/calculate-sections";
import type { ReportingDetailFacts } from "@/backend/domain/reporting/reporting-details-contract";

const facts: ReportingDetailFacts = { inspections: [], metrics: [
  { inspectionId: "i1", code: "M", metric: "M", section: "S", applicable: 100, conforming: 21.41, state: "CONFORME", observation: null, date: "2026-01-01", technician: "Ana", notApplicable: 0 },
] };

describe("NP-0035/AC-01/TEST-09 complement rounding", () => {
  it("keeps section one-decimal complement distinct from panel two-decimal complement", () => {
    expect(calculateSections(facts)[0].metrics[0].nonCompliance).toBe(78.6);
    expect(calculateMetricRankings(facts).weak[0].nonCompliance).toBe(78.59);
  });
});
