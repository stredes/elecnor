import type { ReportingFacts } from "@/backend/domain/reporting/reporting-facts-contract";

export const territoryFacts: ReportingFacts = {
  importLogs: [],
  metrics: [],
  inspections: [
    { id: "I-1", date: "2026-01-01", technician: "Ana", auditor: "A1", percentage: 0.8, actions: 1, city: "Talca" },
    { id: "I-2", date: "2026-01-08", technician: "Ana", auditor: "A2", percentage: 0.6, actions: 0, city: "Concepción" },
    { id: "I-3", date: "2026-02-01", technician: "Ana", auditor: "A1", percentage: 0.7, actions: 2, region: "Maule" },
    { id: "I-4", date: "2026-02-15", technician: "Bruno", auditor: "B1", percentage: 0.9, actions: null, city: "Renca" },
    { id: "I-5", date: "2026-03-01", technician: "Bruno", auditor: "B1", percentage: 0.7, actions: 0 },
    { id: "I-6", date: "2026-03-08", technician: "Bruno", auditor: "B2", percentage: 0.5, actions: 0, address: "Calle Santiago 10, Renca" },
  ],
};
