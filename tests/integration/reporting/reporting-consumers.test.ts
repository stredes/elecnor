import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GetReportingDetails } from "@/backend/application/reporting/get-reporting-details";
import { MemoryReportingDetailsReader } from "@/backend/adapters/outbound/memory-reporting-details-reader";
import { ReportingInsights } from "@/dashboard/components/ReportingInsights";

describe("NP-0035/AC-03/TEST-03 reporting consumers", () => {
  it("renders backend-owned section, metric, and narrative results without recalculation", async () => {
    const result = await new GetReportingDetails(new MemoryReportingDetailsReader({
      inspections: [{ id: "i1", technician: "Ana" }],
      metrics: [{ inspectionId: "i1", code: "A", metric: "A", section: "Preparacion", applicable: 10, conforming: 7, state: "CONFORME", observation: null, date: "2026-01-01", technician: "Ana", notApplicable: 0 }],
    })).execute();
    const html = renderToStaticMarkup(createElement(ReportingInsights, { report: result }));
    expect(html).toContain("Preparacion");
    expect(html).toContain("70%");
    expect(html).toContain("A");
  });
});
