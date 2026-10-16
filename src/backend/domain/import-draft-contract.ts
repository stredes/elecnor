import type { ExtractedScore } from "./import-facts-contract";

export type AnswerState = "CONFORME" | "NO_CONFORME" | "NA" | "DESCONOCIDO";
export type ImportStatus = "COMPLETA" | "PARCIAL";

export type MetricDraft = {
  readonly section: string | null;
  readonly sectionOrder: number | null;
  readonly label: string | null;
  readonly normalizedLabel: string | null;
  readonly code: string | null;
  readonly canonicalName: string | null;
  readonly catalogSection: string | null;
  readonly confidence: number | null;
  readonly state: AnswerState;
  readonly applicable: number | null;
  readonly conforming: number | null;
  readonly nonConforming: number | null;
  readonly notApplicable: number | null;
  readonly observation: string | null;
  readonly page: number | null;
};

export type UnknownMetricCandidate = {
  readonly label: string;
  readonly normalizedLabel: string;
  readonly section: string | null;
  readonly sectionOrder: number | null;
  readonly status: "PENDIENTE";
};

export type ImportDraft = {
  readonly status: ImportStatus;
  readonly technician: string | null;
  readonly auditor: string | null;
  readonly auditorRole: string | null;
  readonly inspectionDate: string | null;
  readonly inspectionTime: string | null;
  readonly timezone: string | null;
  readonly address: string | null;
  readonly city: string | null;
  readonly region: string | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly score: ExtractedScore | null;
  readonly flaggedItems: number | null;
  readonly actions: number | null;
  readonly rubricVersion: string;
  readonly logicalKey: string | null;
  readonly metrics: readonly MetricDraft[];
  readonly unknownMetrics: readonly UnknownMetricCandidate[];
};
