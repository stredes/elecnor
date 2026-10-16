import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createReportingDetails } from "@/backend/composition/reporting-details";
import type { ReadInspectionFacts } from "@/backend/ports/read-inspection-facts";
import { detailFacts } from "../../domain/reporting/reporting-detail-fixtures";

const root = process.cwd();
const pureFiles = [
  "src/backend/domain/reporting/calculate-section-approvals.ts",
  "src/backend/domain/reporting/calculate-section-reports.ts",
  "src/backend/domain/reporting/calculate-metric-ranking.ts",
  "src/backend/domain/reporting/calculate-metric-detail.ts",
  "src/backend/domain/reporting/calculate-narrative.ts",
  "src/backend/application/reporting/get-reporting-details.ts",
];
const presentationFiles = [
  "pages/dashboard/index.tsx",
  "pages/api/dashboard.ts",
  "src/dashboard/components/DashboardScreen.tsx",
  "src/dashboard/components/MetricCard.tsx",
];

describe("NP-0035/AC-03/TEST-03 reporting consumers", () => {
  it("composes all projections from one injected facts reader", async () => {
    let reads = 0;
    const reader: ReadInspectionFacts = {
      read: async () => { reads += 1; return detailFacts; },
    };
    const result = await createReportingDetails(reader).execute();

    expect(reads).toBe(1);
    expect(result.metrics.weak[0].code).toBe("PREP_EPP_CHECK");
    expect(result.narrative.metricRange.highest?.code).toBe("EPP_DIRECT");
  });

  it("keeps reporting decisions out of routes and presentation", () => {
    for (const file of pureFiles) {
      expect(readFileSync(`${root}/${file}`, "utf8")).not.toMatch(
        /from ["'](?:next|react|sqlite3|better-sqlite3|pg|typeorm|prisma|\.\.\/.*(?:adapters|composition))/i,
      );
    }
    const presentation = presentationFiles
      .map((file) => readFileSync(`${root}/${file}`, "utf8"))
      .join("\n");
    expect(presentation).not.toMatch(
      /calculate(?:Section|Metric|Narrative)|PREP_EPP_CHECK|nonConformingPercentage/,
    );
    expect(readFileSync(`${root}/pages/api/dashboard.ts`, "utf8"))
      .not.toContain("GetReportingDetails");
  });
});
