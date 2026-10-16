import { describe, expect, it } from "vitest";
import { calculateReportingNarrative } from "@/backend/domain/reporting/calculate-reporting-narrative";

describe("NP-0035 reporting narrative parity", () => {
  it("keeps null EPP and no-evidence narrative without inference", () => {
    expect(calculateReportingNarrative({ sections: [], weak: [], strong: [], scatter: [], lowBands: 0, global: "n/a", validScores: 0, below70: 0 })).toMatchObject({
      epp: { directAverage: null, checklist: null },
      sectionGap: { weakest: null, restAverage: null },
      scatterRisk: { risk: 0, total: 0 },
      healthy: 0,
      gap: 100,
    });
  });
});
