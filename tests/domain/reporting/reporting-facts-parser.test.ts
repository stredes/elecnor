import { describe, expect, it } from "vitest";
import { parseReportingFacts } from "@/backend/domain/reporting/reporting-facts-parser";

describe("reporting facts parser", () => {
  it("preserves nullable fields and zero-valued facts", () => {
    const result = parseReportingFacts({
      inspections: [{ id: "AUD-1", date: null, technician: null, percentage: 0, actions: 0 }],
      importLogs: [{ id: "LOG-1" }],
      metrics: [{ state: "NO_CONFORME", inspectionId: "AUD-1", applicable: 0, conforming: 0 }],
    });

    expect(result.inspections[0]).toMatchObject({ id: "AUD-1", technician: null, percentage: 0, actions: 0 });
    expect(result.metrics[0]).toMatchObject({ state: "NO_CONFORME", applicable: 0, conforming: 0 });
  });
});
