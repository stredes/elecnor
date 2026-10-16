import type { ReportingFacts } from "@/backend/domain/reporting/reporting-facts-contract";

export const baselineReportingFacts: ReportingFacts = {
  importLogs: [{ id: "log-1" }, { id: "log-2" }, { id: "log-2" }],
  inspections: [
    { technician: "Ana", percentage: 0.5, actions: 2 },
    { technician: "Ana", percentage: 0.7, actions: null },
    { technician: "Luis", percentage: 1, actions: 0 },
    { technician: "Sofía", percentage: null, actions: 1 },
  ],
  metrics: [
    { state: "NO_CONFORME" },
    { state: "CONFORME" },
    { state: "NO_CONFORME" },
  ],
};
