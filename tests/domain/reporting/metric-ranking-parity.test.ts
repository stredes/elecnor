import { describe, expect, it } from "vitest";
import { calculateMetricRankings } from "@/backend/domain/reporting/calculate-metric-rankings";
import type { ReportingDetailFacts } from "@/backend/domain/reporting/reporting-details-contract";

const facts: ReportingDetailFacts = { inspections: [], metrics: [
  { inspectionId: "i1", code: "A", metric: "A", section: "S", applicable: 2, conforming: 1, state: "NO_CONFORME", observation: "x", date: "2026-01-01", technician: "Ana", notApplicable: 0 },
  { inspectionId: "i2", code: "A", metric: "A", section: "S", applicable: 2, conforming: 2, state: "CONFORME", observation: null, date: "2026-01-02", technician: "Luis", notApplicable: 0 },
] };

describe("metric ranking and detail parity", () => {
  it("preserves top limits, observations and metric universes", () => {
    const result = calculateMetricRankings(facts);
    expect(result.weak).toHaveLength(1);
    expect(result.weak[0]).toMatchObject({ applicable: 4, conforming: 3, nonConforming: 1, observations: 2, compliance: 75 });
  });
});
