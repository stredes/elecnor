import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MemoryReportingFactsReader } from "@/backend/adapters/outbound/memory-reporting-facts-reader";
import { createReportingOverview } from "@/backend/composition/reporting-overview";
import { baselineReportingFacts } from "../domain/reporting/reporting-fixtures";

const root = process.cwd();
const pureFiles = [
  "src/backend/domain/reporting/calculate-kpis.ts",
  "src/backend/domain/reporting/calculate-percentiles.ts",
  "src/backend/domain/reporting/count-score-bands.ts",
  "src/backend/application/reporting/get-dashboard-overview.ts",
  "src/backend/ports/read-inspection-facts.ts",
];

describe("NP-0034/AC-03/TEST-03 reporting architecture", () => {
  it("composes the overview with an injected facts reader", async () => {
    const reader = new MemoryReportingFactsReader(baselineReportingFacts);

    await expect(createReportingOverview(reader).execute()).resolves.toMatchObject({
      kpis: { "Inspecciones únicas": 4, "Promedio global": "73.33%" },
    });
  });

  it("keeps policies pure and the existing dashboard route unactivated", () => {
    for (const file of pureFiles) {
      const source = readFileSync(`${root}/${file}`, "utf8");
      expect(source).not.toMatch(/\b(?:next|react|fetch|sqlite|sql|adapters|composition)\b|process\.env/i);
    }
    const route = readFileSync(`${root}/pages/api/dashboard.ts`, "utf8");
    expect(route).toContain("dashboardQuery");
    expect(route).not.toContain("GetDashboardOverview");
  });
});
