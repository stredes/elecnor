export type DriveSyncSummary = {
  readonly syncId: string;
  readonly driveFilesSeen: number;
  readonly duplicateCandidates: number;
  readonly seleccionados: number;
  readonly procesados: number;
  readonly duplicados: number;
  readonly errores: number;
  readonly inspeccionesNuevas: number;
  readonly metricasInsertadas: number;
  readonly metricasSinClasificar: number;
};

export type DriveSyncItemStatus = {
  readonly documentId: string | null;
  readonly inspectionId: string | null;
  readonly filename: string | null;
  readonly sha256: string | null;
  readonly status: string;
  readonly duplicateDecision: string | null;
  readonly duplicateOfDocumentId: string | null;
  readonly error: string | null;
  readonly provenance: DocumentProvenance | null;
};

export type DriveSyncStatus = {
  readonly syncId: string;
  readonly source: string;
  readonly status: string;
  readonly requestedAt: string | null;
  readonly startedAt: string | null;
  readonly finishedAt: string | null;
  readonly retryOf: string | null;
  readonly summary: DriveSyncSummary | null;
  readonly items: readonly DriveSyncItemStatus[];
};

export type DriveSyncResult = {
  readonly summary: DriveSyncSummary;
  readonly upstreamStatus: 200 | 202;
};
import type { DocumentProvenance } from "./document-provenance";
