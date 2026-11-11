import type { ElecnorComparisonResult, ElecnorInspection, ElecnorWorker } from "./elecnor-contract";

export function parseElecnorComparison(value: unknown): ElecnorComparisonResult {
  if (!isRecord(value) || !Array.isArray(value.data) || typeof value.total !== "number" || !isRecord(value.metrics)) throw new Error("Invalid Elecnor comparison response");
  return { data: value.data.map(parseWorker), total: value.total, limit: number(value.limit), offset: number(value.offset), metrics: {
    total_workers: number(value.metrics.total_workers), with_inspection: number(value.metrics.with_inspection), without_inspection: number(value.metrics.without_inspection), exact_matches: number(value.metrics.exact_matches), variant_matches: number(value.metrics.variant_matches), reviewed: number(value.metrics.reviewed), pending_review: number(value.metrics.pending_review),
  } };
}
function parseWorker(value: unknown): ElecnorWorker {
  if (!isRecord(value)) throw new Error("Invalid Elecnor worker");
  return { worker_id: string(value.worker_id), rut: string(value.rut), name: string(value.name), name_detected: nullableString(value.name_detected), commune: nullableString(value.commune), supervisor: nullableString(value.supervisor), reviewed: Boolean(value.reviewed), review_note: nullableString(value.review_note), status: value.status === "INSPECCION_ENCONTRADA" || value.status === "REVISAR_VARIANTE" ? value.status : "SIN_INSPECCION", inspection_count: number(value.inspection_count), inspections: Array.isArray(value.inspections) ? value.inspections.map(parseInspection) : [] };
}
function parseInspection(value: unknown): ElecnorInspection {
  if (!isRecord(value)) throw new Error("Invalid Elecnor inspection");
  const kind = value.match_kind === "RUT_EXACTO" || value.match_kind === "NOMBRE_EXACTO" ? value.match_kind : "VARIANTE_NOMBRE";
  return { audit_id: string(value.audit_id), filename: nullableString(value.filename), sha256: string(value.sha256), blob_url: nullableString(value.blob_url), technician_detected: nullableString(value.technician_detected), technician_normalized: nullableString(value.technician_normalized), technician_canonical: nullableString(value.technician_canonical), inspection_date: nullableString(value.inspection_date), inspection_time: nullableString(value.inspection_time), technician_rut: nullableString(value.technician_rut), percentage: typeof value.percentage === "number" ? value.percentage : null, match_kind: kind, match_score: typeof value.match_score === "number" ? value.match_score : 0 };
}
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
function string(value: unknown): string { return typeof value === "string" ? value : ""; }
function nullableString(value: unknown): string | null { return typeof value === "string" && value ? value : null; }
function number(value: unknown): number { return typeof value === "number" && Number.isFinite(value) ? value : 0; }
