import { describe, expect, it } from "vitest";
import { calculateMetricNonCompliance } from "@/backend/domain/reporting/calculate-metric-non-compliance";
import { calculateTotalApprovals } from "@/backend/domain/reporting/calculate-total-approvals";

describe("NP-0035/AC-01/TEST-08 derived metric policies", () => {
  it("preserves panel complement precision and sums section approval units", () => {
    expect(calculateMetricNonCompliance(21.41, 100)).toBe(78.59);
    expect(calculateMetricNonCompliance(21.41, 100, 78.6)).toBe(78.6);
    expect(calculateMetricNonCompliance(null, 0)).toBeNull();
    expect(calculateTotalApprovals([{ approved: 2 }, { approved: 3 }])).toBe(5);
  });
});
