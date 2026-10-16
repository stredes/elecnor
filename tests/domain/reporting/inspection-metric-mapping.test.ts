import { describe, expect, it } from "vitest";
import { mapInspectionMetric } from "@/backend/domain/reporting/map-inspection-metric";
import type { ReportingDetailMetric } from "@/backend/domain/reporting/reporting-details-contract";

const fact: ReportingDetailMetric = { inspectionId: "i1", code: "M", metric: "M", section: "S", applicable: 2, conforming: 1, state: "NO_CONFORME", observation: "obs", date: "2026-01-01", technician: "Ana", notApplicable: 1 };

describe("NP-0035/AC-01/TEST-10 inspection metric mapping", () => {
  it("uses the inspection observation universe and preserves null compliance", () => {
    expect(mapInspectionMetric(fact)).toMatchObject({ observations: 3, compliance: 50 });
    expect(mapInspectionMetric({ ...fact, applicable: 0, conforming: 0, notApplicable: 2 })).toMatchObject({ observations: 2, compliance: null });
  });
});
