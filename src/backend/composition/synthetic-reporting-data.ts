import type { ReportingDetailFacts } from "../domain/reporting/reporting-details-contract";
import type { ReportingFacts } from "../domain/reporting/reporting-facts-contract";

const inspections = [
  { id: "synthetic-inspection-1", date: "2026-01-10", technician: "Técnico A", auditor: "Auditor A", address: "Calle 1", city: "Ciudad", region: "Maule", filename: "synthetic-1.pdf", percentage: 0.8, actions: 0 },
  { id: "synthetic-inspection-2", date: "2026-02-15", technician: "Técnico B", auditor: "Auditor B", address: "Calle 2", city: "Ciudad", region: "Maule", filename: "synthetic-2.pdf", percentage: 0.65, actions: 1 },
  { id: "synthetic-inspection-3", date: "2026-03-01", technician: "Técnico C", auditor: null, address: "Calle 3", city: "Ciudad", region: "Valparaíso", filename: "synthetic-3.pdf", percentage: null, actions: null },
] as const;

const metrics: ReportingDetailFacts["metrics"] = [
  row("synthetic-inspection-1", "2026-01-10", "Técnico A", "AST-01", "Análisis seguro de trabajo", "preparacion", "NO_CONFORME", 1, 0, null),
  row("synthetic-inspection-2", "2026-02-15", "Técnico B", "AST-01", "Análisis seguro de trabajo", "preparacion", "NO_CONFORME", 1, 0, null),
  row("synthetic-inspection-3", "2026-03-01", "Técnico C", "AST-01", "Análisis seguro de trabajo", "preparacion", "CONFORME", 1, 1, null),
  row("synthetic-inspection-1", "2026-01-10", "Técnico A", "EPP-01", "Uso de casco", "inspeccion y uso de epp", "CONFORME", 1, 1, null),
  row("synthetic-inspection-1", "2026-01-10", "Técnico A", "PREP_EPP_CHECK", "Check list EPP", "inspeccion y uso de epp", "NO_CONFORME", 1, 0, "Control sintético pendiente."),
  row("synthetic-inspection-2", "2026-02-15", "Técnico B", "EPP-01", "Uso de casco", "inspeccion y uso de epp", "CONFORME", 1, 1, null),
  row("synthetic-inspection-2", "2026-02-15", "Técnico B", "PREP_EPP_CHECK", "Check list EPP", "inspeccion y uso de epp", "NO_CONFORME", 1, 0, "Registro sintético."),
  row("synthetic-inspection-3", "2026-03-01", "Técnico C", "EPP-01", "Uso de casco", "inspeccion y uso de epp", "CONFORME", 1, 1, null),
  row("synthetic-inspection-3", "2026-03-01", "Técnico C", "PREP_EPP_CHECK", "Check list EPP", "inspeccion y uso de epp", "CONFORME", 1, 1, null),
];

export const syntheticReportingFacts: ReportingFacts = {
  inspections,
  importLogs: [{ id: "import-1" }, { id: "import-2" }, { id: "import-3" }],
  metrics: metrics.map(({ inspectionId, section, metric, code, applicable, conforming, state, technician, observation }) => ({
    inspectionId, section, metric, code, applicable, conforming, state: state ?? "", technician, observation,
  })),
};

export const syntheticReportingDetailFacts: ReportingDetailFacts = {
  inspections: inspections.map(({ id, technician }) => ({ id, technician })),
  metrics,
};

function row(
  inspectionId: string, date: string, technician: string, code: string, metric: string,
  section: string, state: string, applicable: number, conforming: number, observation: string | null,
) {
  return { inspectionId, date, technician, code, metric, section, state, applicable, conforming, observation, notApplicable: 0 };
}
