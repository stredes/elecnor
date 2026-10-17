import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GetDashboardOverview } from "@/backend/application/reporting/get-dashboard-overview";
import { GetReportingDetails } from "@/backend/application/reporting/get-reporting-details";
import { buildReportSnapshot } from "@/backend/application/reporting/build-report-snapshot";
import { ExportReport } from "@/backend/application/reporting/export-report";
import { MemoryReportingFactsReader } from "@/backend/adapters/outbound/memory-reporting-facts-reader";
import { MemoryReportingDetailsReader } from "@/backend/adapters/outbound/memory-reporting-details-reader";
import { MemoryReportRenderer } from "@/backend/adapters/outbound/memory-report-renderer";
import { baselineReportingFacts } from "../../domain/reporting/reporting-fixtures";

const pureFiles = [
  "src/backend/application/reporting/export-report.ts",
  "src/backend/ports/reporting/read-report-snapshot.ts",
  "src/backend/ports/reporting/render-report.ts",
];

describe("NP-0040/AC-03/TEST-03 report export boundaries", () => {
  it("delegates a snapshot to the renderer without runtime dependencies", async () => {
    const overview = await new GetDashboardOverview(new MemoryReportingFactsReader(baselineReportingFacts)).execute();
    const details = await new GetReportingDetails(new MemoryReportingDetailsReader({ inspections: [], metrics: [] })).execute();
    const snapshot = buildReportSnapshot(overview, details);
    const exporter = new ExportReport({ read: async () => snapshot }, new MemoryReportRenderer([]));

    await expect(exporter.execute()).resolves.toMatchObject({ status: "RENDERED" });
  });

  it("keeps the application boundary free of Next, SQL and openpyxl", () => {
    for (const file of pureFiles) {
      expect(readFileSync(`${process.cwd()}/${file}`, "utf8")).not.toMatch(/next|react|sqlite|openpyxl|fetch/i);
    }
  });
});
