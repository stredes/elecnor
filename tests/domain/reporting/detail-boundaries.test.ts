import { describe, expect, it } from "vitest";
import { calculateSectionApprovals } from "@/backend/domain/reporting/calculate-section-approvals";
import { calculateMetricRankings } from "@/backend/domain/reporting/calculate-metric-rankings";
import { getMetricDetail } from "@/backend/domain/reporting/get-metric-detail";
import type { ReportingDetailFacts } from "@/backend/domain/reporting/reporting-details-contract";

const empty: ReportingDetailFacts = { inspections: [{ id: "i1", technician: null }], metrics: [] };

describe("NP-0035/AC-02/TEST-02 reporting boundaries", () => {
  it("does not count missing, NA, or unknown metrics as failed evaluations", () => {
    expect(calculateSectionApprovals(empty)).toEqual([]);
    expect(calculateMetricRankings(empty)).toEqual({ weak: [], strong: [], scatter: [] });
  });

  it("keeps detail compliance null when its metric has no applicable universe", () => {
    const detail = getMetricDetail({ inspections: [], metrics: [{ inspectionId: "i1", code: "NA", metric: "No aplica", section: null, applicable: 0, conforming: 0, state: "NA", observation: null, date: "", technician: null, notApplicable: 1 }] }, "NA");
    expect(detail).toMatchObject({ observations: 1, applicable: 0, compliance: null, records: [{ technician: "" }] });
  });

  it("preserves detail technician category counts", () => {
    const detail = getMetricDetail({ inspections: [], metrics: [
      { inspectionId: "i1", code: "M", metric: "M", section: "S", applicable: 2, conforming: 1, state: "NO_CONFORME", observation: "x", date: "2026-01-01", technician: "Ana", notApplicable: 0 },
    ] }, "M");
    expect(detail?.technicians).toEqual([{ technician: "Ana", applicable: 2, conforming: 1, nonConforming: 1 }]);
  });
});
