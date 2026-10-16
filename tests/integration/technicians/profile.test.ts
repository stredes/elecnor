import { describe, expect, it } from "vitest";
import { MemoryReportingFactsReader } from "@/backend/adapters/outbound/memory-reporting-facts-reader";
import { createTechnicianProfile } from "@/backend/composition/technician-profile";
import { territoryFacts } from "../reporting/territory-fixtures";

describe("NP-0036 technician profile", () => {
  it("returns a calculated profile from the shared facts port", async () => {
    const result = await createTechnicianProfile(
      new MemoryReportingFactsReader(territoryFacts), "Ana",
    ).execute();

    expect(result.inspections).toHaveLength(3);
    expect(result.promedio).toBe(70);
    expect(result.bajo70).toBe(1);
    expect(result.auditores).toBe(2);
    expect(result.fechas).toBe(3);
  });
});
