import type { ReportingFacts } from "@/backend/domain/reporting/reporting-facts-contract";

export const detailFacts = {
  importLogs: [],
  inspections: [
    {
      id: "I-1", technician: "Ana", percentage: 0.8, actions: 0,
      date: "2026-10-01",
    },
    {
      id: "I-2", technician: "Bruno", percentage: 0.6, actions: 1,
      date: "2026-10-02",
    },
    {
      id: "I-3", technician: "Carla", percentage: null, actions: null,
      date: "2026-10-03",
    },
  ],
  metrics: [
    metric("I-1", "preparacion", "AST", "AST", 10, 7, "CONFORME", "Ana", "ok"),
    metric("I-2", "preparacion", "AST", "AST", 10, 6, "NO_CONFORME", "Bruno", "falta"),
    metric("I-3", "preparacion", "AST", "AST", 0, 0, "NA", null, null),
    metric(
      "I-1", "preparacion", "Check list EPP", "PREP_EPP_CHECK", 10, 4,
      "NO_CONFORME", "Ana", "sin check",
    ),
    metric(
      "I-2", "preparacion", "Check list EPP", "PREP_EPP_CHECK", 10, 8,
      "CONFORME", "Bruno", "ok",
    ),
    metric("I-3", "preparacion", "Check list EPP", "PREP_EPP_CHECK", 0, 0, "NA", null, null),
    metric(
      "I-1", "inspeccion y uso de epp", "Calzado", "EPP_DIRECT", 10, 9,
      "CONFORME", "Ana", null,
    ),
    metric(
      "I-2", "inspeccion y uso de epp", "Calzado", "EPP_DIRECT", 10, 9,
      "CONFORME", "Bruno", null,
    ),
    metric("I-1", null, null, null, 10, 0, "DESCONOCIDO", null, null),
  ],
} as unknown as ReportingFacts;

function metric(
  inspectionId: string,
  section: string | null,
  metricName: string | null,
  code: string | null,
  applicable: number,
  conforming: number,
  state: string,
  technician: string | null,
  observation: string | null,
) {
  return {
    inspectionId, section, metric: metricName, code, applicable,
    conforming, state, technician, observation,
  };
}
