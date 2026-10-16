import { describe, expect, it } from "vitest";
import { calculateSectionApprovals } from "@/backend/domain/reporting/calculate-section-approvals";
import type { ReportingDetailFacts } from "@/backend/domain/reporting/reporting-details-contract";

const facts: ReportingDetailFacts = {
  inspections: [{ id: "i1", technician: "Ana" }, { id: "i2", technician: "Luis" }],
  metrics: [
    { inspectionId: "i1", code: "A", metric: "A", section: "S", applicable: 10, conforming: 7, state: "CONFORME", observation: null, date: "2026-01-01", technician: "Ana", notApplicable: 0 },
    { inspectionId: "i2", code: "A", metric: "A", section: "S", applicable: 10, conforming: 6, state: "NO_CONFORME", observation: null, date: "2026-01-02", technician: "Luis", notApplicable: 0 },
  ],
};

describe("NP-0035/AC-01/TEST-01 section approvals", () => {
  it("counts approvals per inspection and section, including exact 70 percent", () => {
    expect(calculateSectionApprovals(facts)).toEqual([
      { name: "S", total: 2, evaluated: 2, approved: 1, below: 1, notEvaluated: 0, percentage: 50 },
    ]);
  });
});
