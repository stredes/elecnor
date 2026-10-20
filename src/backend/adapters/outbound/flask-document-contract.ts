import type { BackendProvenance } from "../../domain/backend-contract";

export type FlaskMetricRecord = {
  readonly sectionOriginal: string | null;
  readonly sectionNormalized: string | null;
  readonly sectionOrder: number | null;
  readonly metricOriginal: string | null;
  readonly metricNormalized: string | null;
  readonly code: string | null;
  readonly stateOriginal: string | null;
  readonly stateNormalized: string | null;
  readonly applicable: number | null;
  readonly conforming: number | null;
  readonly nonConforming: number | null;
  readonly notApplicable: number | null;
  readonly observation: string | null;
};

export type FlaskInspectionRecord = {
  readonly filename: string;
  readonly pdfHash: string;
  readonly importedAt: string;
  readonly inspectionDate: string | null;
  readonly inspectionTime: string | null;
  readonly technician: string | null;
  readonly auditor: string | null;
  readonly auditorRole: string | null;
  readonly address: string | null;
  readonly city: string | null;
  readonly region: string | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly scoreObtained: number | null;
  readonly scoreMax: number | null;
  readonly percentage: number | null;
  readonly flaggedItems: number | null;
  readonly actions: number | null;
  readonly rubricVersion: string;
  readonly importStatus: string;
  readonly warnings: readonly string[];
  readonly generalObservation: string | null;
  readonly metrics: readonly FlaskMetricRecord[];
  readonly legacyId?: string | null;
  readonly sourceSystem?: string | null;
  readonly provenance?: BackendProvenance;
  readonly partialDate?: string | null;
  readonly timezone?: string | null;
};
