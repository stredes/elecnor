import type { ReportingFacts } from "@/backend/domain/reporting/reporting-facts-contract";

export const thresholdFacts: ReportingFacts = {
  inspections: ["I-1", "I-2", "I-3", "I-4"].map((id) => ({
    id, technician: null, percentage: null, actions: null,
  })),
  importLogs: [],
  metrics: [
    metricRow("I-1", 10, 7, "CONFORME"), metricRow("I-2", 0, 0, "NA"),
    metricRow("I-3", 10, null, "DESCONOCIDO"), metricRow("I-4", 10, 7, "CONFORME"),
  ],
};

export function metricRow(
  inspectionId: string, applicable: number, conforming: number | null, state: string,
) {
  return { inspectionId, section: "seccion", metric: "Métrica", code: "M",
    applicable, conforming, state };
}

export const recordFacts: ReportingFacts = {
  inspections: Array.from({ length: 201 }, (_, index) => ({
    id: `I-${index}`, date: `2026-10-${String((index % 28) + 1).padStart(2, "0")}`,
    technician: "Ana", percentage: null, actions: null,
  })),
  importLogs: [],
  metrics: Array.from({ length: 201 }, (_, index) => ({
    inspectionId: `I-${index}`, code: "RECORDS", metric: "Métrica", section: "s",
    applicable: 1, conforming: 1, state: "CONFORME", observation: `O-${index}`,
  })),
};
