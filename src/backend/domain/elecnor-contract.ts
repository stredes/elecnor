export type ElecnorComparisonStatus = "all" | "with_inspection" | "without_inspection" | "reviewed" | "pending_review";
export type ElecnorComparisonSort = "name" | "rut" | "audits" | "approval";
export type ElecnorComparisonDirection = "asc" | "desc";
export type ElecnorMatchKind = "RUT_EXACTO" | "NOMBRE_EXACTO" | "VARIANTE_NOMBRE";
export type ElecnorInspection = {
  readonly audit_id: string;
  readonly filename: string | null;
  readonly sha256: string;
  readonly blob_url: string | null;
  readonly technician_detected: string | null;
  readonly technician_normalized: string | null;
  readonly technician_canonical: string | null;
  readonly inspection_date: string | null;
  readonly inspection_time: string | null;
  readonly technician_rut: string | null;
  readonly percentage: number | null;
  readonly match_kind: ElecnorMatchKind;
  readonly match_score: number;
};
export type ElecnorWorker = {
  readonly worker_id: string;
  readonly rut: string;
  readonly name: string;
  readonly name_detected: string | null;
  readonly commune: string | null;
  readonly supervisor: string | null;
  readonly reviewed: boolean;
  readonly review_note: string | null;
  readonly status: "INSPECCION_ENCONTRADA" | "REVISAR_VARIANTE" | "SIN_INSPECCION";
  readonly inspection_count: number;
  readonly inspections: readonly ElecnorInspection[];
};
export type ElecnorMetrics = {
  readonly total_workers: number;
  readonly with_inspection: number;
  readonly without_inspection: number;
  readonly exact_matches: number;
  readonly variant_matches: number;
  readonly reviewed: number;
  readonly pending_review: number;
};
export type ElecnorComparisonResult = {
  readonly data: readonly ElecnorWorker[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly metrics: ElecnorMetrics;
};
export type ElecnorComparisonQuery = {
  readonly q: string;
  readonly status: ElecnorComparisonStatus;
  readonly limit: number;
  readonly offset: number;
  readonly sort?: ElecnorComparisonSort;
  readonly direction?: ElecnorComparisonDirection;
};
