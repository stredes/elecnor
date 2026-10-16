import { describe, expect, it } from "vitest";
import { calculateSectionApprovals } from "@/backend/domain/reporting/calculate-section-approvals";
import { calculateSectionReports } from "@/backend/domain/reporting/calculate-section-reports";
import { detailFacts } from "./reporting-detail-fixtures";

describe("NP-0035 section parity", () => {
  it("keeps granular sections and inspection approvals in separate universes", () => {
    const sections = calculateSectionReports(detailFacts);
    const preparation = sections.find((section) => section.name === "preparacion");
    expect(preparation).toMatchObject({
      applicable: 40,
      conforming: 25,
      percentage: 62.5,
    });
    expect(preparation?.metrics.map((metric) => metric.code)).toEqual(["AST", "PREP_EPP_CHECK"]);
    expect(preparation?.metrics[0].technicians).toEqual({
      conforming: ["Ana"],
      nonConforming: ["Bruno"],
    });

    const approvals = calculateSectionApprovals(detailFacts);
    const approval = approvals.sections.find((section) => section.name === "preparacion");
    expect(approval).toMatchObject({
      total: 3,
      evaluated: 2,
      approved: 1,
      belowThreshold: 1,
      notEvaluated: 1,
      approvalPercentage: 50,
    });
    expect(approvals.allApproved).toBe(3);
  });
});
