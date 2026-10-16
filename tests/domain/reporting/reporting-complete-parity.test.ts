import { describe, expect, it } from "vitest";
import { calculateMetricRankings } from "@/backend/domain/reporting/calculate-metric-rankings";
import type { ReportingDetailFacts } from "@/backend/domain/reporting/reporting-details-contract";

const facts: ReportingDetailFacts = { inspections: [], metrics: [
  { inspectionId: "i1", code: "M1", metric: "M1", section: "S", applicable: 10, conforming: 8, state: "CONFORME", observation: null, date: "2026-01-01", technician: "Ana", notApplicable: 0 },
  { inspectionId: "i2", code: "M1", metric: "M1", section: "S", applicable: 10, conforming: 6, state: "NO_CONFORME", observation: null, date: "2026-01-02", technician: "Luis", notApplicable: 0 },
  ...Array.from({ length: 12 }, (_, index) => ({ inspectionId: `i${index + 3}`, code: `M${index + 2}`, metric: `M${index + 2}`, section: "S", applicable: 10, conforming: index, state: "CONFORME", observation: null, date: "2026-01-03", technician: null, notApplicable: 0 })),
] };

describe("NP-0035/AC-01/TEST-05 complete ranking parity", () => {
  it("retains technician categories and endpoint top-12 alongside dashboard top-10", () => {
    const result = calculateMetricRankings(facts);
    expect(result.weak.find((metric) => metric.code === "M1")?.technicians).toEqual({ conforming: ["Ana"], nonConforming: ["Luis"] });
    expect(result.weak).toHaveLength(10);
    expect(calculateMetricRankings(facts, 12).weak).toHaveLength(12);
  });
});
