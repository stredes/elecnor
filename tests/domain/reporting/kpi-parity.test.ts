import { describe, expect, it } from "vitest";
import { GetDashboardOverview } from "@/backend/application/reporting/get-dashboard-overview";
import type { ReadInspectionFacts } from "@/backend/ports/read-inspection-facts";
import { baselineReportingFacts } from "./reporting-fixtures";

describe("NP-0034/AC-01/TEST-01 reporting KPI parity", () => {
  it("preserves the seven baseline metrics and representation", async () => {
    const reader: ReadInspectionFacts = {
      read: async () => baselineReportingFacts,
    };

    await expect(new GetDashboardOverview(reader).execute()).resolves.toEqual({
      kpis: {
        "PDF recibidos": 3,
        "Inspecciones únicas": 4,
        "Puntajes válidos": 3,
        "Promedio global": "73.33%",
        "Bajo 70%": 1,
        "Puntaje perfecto": 1,
        Hallazgos: 2,
        Acciones: 3,
      },
      panorama: { media: 73.33, mediana: 70, p25: 50, p75: 70, "Puntaje perfecto": 1 },
      distribution: [
        { label: "0-49", count: 0 }, { label: "50-59", count: 1 },
        { label: "60-69", count: 0 }, { label: "70-79", count: 1 },
        { label: "80-89", count: 0 }, { label: "90-99", count: 0 },
        { label: "100", count: 1 },
      ],
    });
  });
});
