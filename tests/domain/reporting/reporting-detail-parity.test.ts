import { describe, expect, it } from "vitest";
import { calculateSections } from "@/backend/domain/reporting/calculate-sections";
import { getMetricDetail } from "@/backend/domain/reporting/get-metric-detail";
import type { ReportingDetailFacts } from "@/backend/domain/reporting/reporting-details-contract";

const categoryFacts: ReportingDetailFacts = { inspections: [], metrics: [
  { inspectionId: "i1", code: "M", metric: "M", section: "S", applicable: 2, conforming: 2, state: "CONFORME", observation: null, date: "2026-01-01", technician: "Ana", notApplicable: 0 },
  { inspectionId: "i2", code: "M", metric: "M", section: "S", applicable: 2, conforming: 1, state: "NO_CONFORME", observation: null, date: "2026-01-02", technician: "Luis", notApplicable: 0 },
] };

describe("NP-0035/AC-01/TEST-07 section and detail parity", () => {
  it("retains technician categories in section metrics and limits detail records to 200", () => {
    expect(calculateSections(categoryFacts)[0].metrics[0].technicians).toEqual({ conforming: ["Ana"], nonConforming: ["Luis"] });
    const metrics = Array.from({ length: 205 }, (_, index) => ({ ...categoryFacts.metrics[0], inspectionId: `i${index}`, observation: `obs-${index}`, date: `2026-01-${String(index).padStart(3, "0")}` }));
    const detail = getMetricDetail({ inspections: [], metrics }, "M");
    expect(detail?.records).toHaveLength(200);
    expect(detail?.records[0].inspectionId).toBe("i204");
  });
});
