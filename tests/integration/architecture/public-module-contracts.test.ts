import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const pureFiles = [
  "src/backend/domain/geography/resolve-location.ts",
  "src/backend/domain/analytics/series.ts",
  "src/backend/domain/analytics/ranking.ts",
  "src/backend/domain/analytics/traceability.ts",
  "src/backend/domain/analytics/geolocation.ts",
  "src/backend/domain/technicians/calculate-profile.ts",
  "src/backend/application/reporting/get-reporting-analytics.ts",
  "src/backend/application/technicians/get-technician-profile.ts",
];

describe("NP-0036 public module contracts", () => {
  it("keeps read models free of framework and repository dependencies", () => {
    for (const file of pureFiles) {
      expect(readFileSync(`${root}/${file}`, "utf8")).not.toMatch(
        /from ["'](?:next|react|sqlite3|better-sqlite3|pg|typeorm|prisma|.*adapters|.*composition)/i,
      );
    }
  });

  it("leaves existing routes inactive while composition owns wiring", () => {
    const route = readFileSync(`${root}/pages/api/dashboard.ts`, "utf8");
    expect(route).not.toMatch(/GetReportingAnalytics|GetTechnicianProfile|createReportingAnalytics/);
    expect(readFileSync(`${root}/src/backend/composition/reporting-analytics.ts`, "utf8"))
      .toContain("GetReportingAnalytics");
    expect(readFileSync(`${root}/src/backend/composition/technician-profile.ts`, "utf8"))
      .toContain("GetTechnicianProfile");
  });
});
