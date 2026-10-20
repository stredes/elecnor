import type { InspectionFacts, InspectionFactsPatch, EvaluationMode } from "./guard-facts-contract";
import { normalizeTechnicianName } from "./technician-normalize";

const TIME_ONLY_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function extractTimeFromDateTime(dateTime: string | null): string | null {
  if (!dateTime) return null;
  const match = dateTime.match(/(\d{2}:\d{2})(?::\d{2})?/);
  return match ? match[1] : null;
}

type DetailInspection = {
  readonly id: string;
  readonly date: string | null;
  readonly time: string | null;
  readonly technician: string | null;
  readonly auditor: string | null;
  readonly status: string | null;
  readonly rubric: string | null;
  readonly filename: string | null;
  readonly document_id: string | null;
  readonly uniqueness?: {
    readonly sha256: string | null;
    readonly technician_normalized: string | null;
    readonly local_inspection_date: string | null;
    readonly local_inspection_at: string | null;
    readonly completeness: string | null;
    readonly metric_count: number | null;
    readonly modified_time: string | null;
    readonly document_kind: string | null;
    readonly exact_copy_of: string | null;
  } | null;
  readonly provenance?: {
    readonly filename: string | null;
    readonly sha256: string | null;
    readonly sha256_recalculated: string | null;
  } | null;
};

type DetailInput = { readonly inspection: DetailInspection };

export function factsFromDetailItem(
  detail: DetailInput,
  patch: InspectionFactsPatch = {},
): InspectionFacts {
  const uniqueness = detail.inspection.uniqueness ?? null;
  const provenance = detail.inspection.provenance ?? null;
  const metrics = patch.metrics ?? [];
  const sha256 = patch.provenance?.sha256 ?? uniqueness?.sha256 ?? provenance?.sha256 ?? null;
  const filename = patch.provenance?.filename ?? detail.inspection.filename ?? provenance?.filename ?? null;

  const localInspectionAt = patch.localInspectionAt ??
    (detail.inspection.time && TIME_ONLY_PATTERN.test(detail.inspection.time) ? detail.inspection.time : null) ??
    extractTimeFromDateTime(uniqueness?.local_inspection_at ?? null) ??
    null;

  const timestampRaw = patch.timestampRaw ??
    uniqueness?.local_inspection_at ??
    uniqueness?.modified_time ??
    null;

  const technicianNormalized = patch.technicianNormalized ??
    (uniqueness?.technician_normalized ? normalizeTechnicianName(uniqueness.technician_normalized) : null) ??
    (detail.inspection.technician ? normalizeTechnicianName(detail.inspection.technician) : null);

  return {
    inspectionId: detail.inspection.id,
    documentId: patch.documentId ?? provenance?.sha256 ? (detail.inspection.document_id ?? null) : null,
    documentKind: patch.documentKind ?? uniqueness?.document_kind ?? null,
    technicianNormalized,
    auditor: patch.auditor ?? detail.inspection.auditor,
    timestampRaw,
    localInspectionDate: patch.localInspectionDate ?? uniqueness?.local_inspection_date ?? detail.inspection.date,
    localInspectionAt,
    timezone: patch.timezone ?? null,
    datePrecision: patch.datePrecision ?? null,
    timePrecision: patch.timePrecision ?? null,
    importStatus: patch.importStatus ?? uniqueness?.completeness ?? detail.inspection.status,
    metricCount: patch.metricCount ?? uniqueness?.metric_count ?? metrics.length,
    exactCopyOf: patch.exactCopyOf ?? uniqueness?.exact_copy_of ?? null,
    rubric: patch.rubric ?? detail.inspection.rubric,
    provenance: {
      present: Boolean(filename && sha256),
      filename,
      sha256,
      sha256Recalculated: patch.provenance?.sha256Recalculated ?? provenance?.sha256_recalculated ?? null,
    },
    metrics,
    sections: patch.sections ?? [],
    evaluationMode: "detail" as EvaluationMode,
  };
}