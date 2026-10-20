import type { InspectionFacts, InspectionFactsPatch } from "@/backend/domain/guard/guard-facts-contract";
import type { InspectionListItem } from "@/backend/domain/inspection-list-contract";

export const HASH = "a".repeat(64);
export const OTHER_HASH = "b".repeat(64);
export const COMPUTED_AT = "2026-10-19T12:00:00.000Z";

export const OK_FACTS: InspectionFacts = {
  inspectionId: "INS-1",
  documentId: "DOC-1",
  documentKind: "INSPECTION",
  technicianNormalized: "Ana Pérez",
  auditor: "Luis Gómez",
  timestampRaw: "2026-01-10T09:00:00+01:00",
  localInspectionDate: "2026-01-10",
  localInspectionAt: "09:00",
  timezone: "Europe/Madrid",
  datePrecision: "day",
  timePrecision: "minute",
  importStatus: "COMPLETA",
  metricCount: 1,
  exactCopyOf: null,
  rubric: "RUBRICA-2026",
  provenance: { present: true, filename: "acta.pdf", sha256: HASH, sha256Recalculated: HASH },
  metrics: [
    { code: "EPP-01", section: "EPP", label: "Casco", applicable: 1, conforming: 1, nonConforming: 0, score: 8, maxScore: 10, percentage: 80 },
  ],
  sections: [{ name: "EPP", metricCount: 1 }],
  evaluationMode: "detail",
};

export function facts(patch: InspectionFactsPatch & { readonly inspectionId?: string } = {}): InspectionFacts {
  return {
    ...OK_FACTS,
    ...patch,
    provenance: { ...OK_FACTS.provenance, ...patch.provenance },
  } as InspectionFacts;
}

export function listItem(patch: Partial<InspectionListItem> = {}): InspectionListItem {
  return {
    id: "INS-1",
    date: "2026-01-10",
    time: null,
    technician: "Ana Pérez",
    auditor: "Luis Gómez",
    address: "Calle 1",
    city: "Ciudad",
    region: "Norte",
    percentage: 80,
    score: 8,
    maxScore: 10,
    actions: 0,
    rubric: "RUBRICA-2026",
    status: "COMPLETA",
    filename: "acta.pdf",
    provenance: {
      documentId: "DOC-1",
      filename: "acta.pdf",
      sha256: HASH,
      origin: "GOOGLE_DRIVE",
      receivedAt: COMPUTED_AT,
      date: "2026-01-10",
      time: "09:00",
    },
    ...patch,
  };
}

export const ONE_METRIC: InspectionFactsPatch = {
  metrics: [{ code: "EPP-01", section: "EPP", label: "Casco", applicable: 1, conforming: 1, nonConforming: 0, score: 8, maxScore: 10, percentage: 80 }],
  sections: [{ name: "EPP", metricCount: 1 }],
};
