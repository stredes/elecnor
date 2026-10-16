import type { ExtractedInspectionFacts } from "@/backend/domain/import-facts-contract";

export const validImportFacts: ExtractedInspectionFacts = {
  technician: "Ana Soto",
  auditor: "Eva Ríos",
  auditorRole: "Supervisora",
  inspectionDate: "2026-09-09",
  inspectionTime: "08:05",
  timezone: null,
  address: "1469, Talca, Maule, Chile",
  city: null,
  region: null,
  latitude: null,
  longitude: null,
  score: { obtained: 20, maximum: 24, percentage: 83.33 },
  flaggedItems: 1,
  actions: 2,
  rubricVersion: null,
  metrics: [
    { section: "Preparación", sectionOrder: 1, label: "Utiliza lentes de seguridad", answer: "Yes", observation: null, page: 2 },
    { section: "Cierre", sectionOrder: 2, label: "No utiliza joyas", answer: "N/A", observation: "No aplica", page: 3 },
    { section: "Cierre", sectionOrder: 2, label: "Pregunta sin catálogo", answer: "Pendiente", observation: null, page: 3 },
  ],
};
