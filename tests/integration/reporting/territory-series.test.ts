import { describe, expect, it } from "vitest";
import { MemoryReportingFactsReader } from "@/backend/adapters/outbound/memory-reporting-facts-reader";
import { createReportingAnalytics } from "@/backend/composition/reporting-analytics";
import { territoryFacts } from "./territory-fixtures";

describe("NP-0036/AC-03/TEST-03 territory and series read model", () => {
  it("integrates territorial, temporal, ranking and traceability projections", async () => {
    const result = await createReportingAnalytics(new MemoryReportingFactsReader(territoryFacts)).execute();

    expect(result.progress).toEqual([
      { period: "2026-01", inspections: 2, compliance: 70 },
      { period: "2026-02", inspections: 2, compliance: 80 },
      { period: "2026-03", inspections: 2, compliance: 60 },
    ]);
    expect(result.evolution.total).toBe(6);
    expect(result.ranking.tecnicos).toEqual([
      { nombre: "Ana", inspecciones: 3, promedio: 70, bajo70: 1 },
      { nombre: "Bruno", inspecciones: 3, promedio: 70, bajo70: 1 },
    ]);
    expect(result.traceability).toMatchObject({ total: 6, con_acciones: 2, sin_acciones: 4 });
    expect(result.geolocation).toMatchObject({ total: 6, con_geolocalizacion: 5, sin_geolocalizacion: 1 });
    expect(result.geolocation.por_region).toEqual([
      { region: "Maule", total: 2 }, { region: "Región Metropolitana", total: 2 }, { region: "Biobío", total: 1 },
    ]);
  });
});
