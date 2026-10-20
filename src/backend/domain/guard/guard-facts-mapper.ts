import type { InspectionListItem } from "../inspection-list-contract";
import type { InspectionFacts, InspectionFactsPatch, EvaluationMode } from "./guard-facts-contract";
import { normalizeTechnicianName } from "./technician-normalize";
import { factsFromDetailItem } from "./guard-facts-detail-mapper";

const TIME_ONLY_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function extractTimeFromDateTime(dateTime: string | null): string | null {
  if (!dateTime) return null;
  const match = dateTime.match(/(\d{2}:\d{2})(?::\d{2})?/);
  return match ? match[1] : null;
}

export { factsFromDetailItem };

export function factsFromListItem(
  item: InspectionListItem,
  patch: InspectionFactsPatch = {},
): InspectionFacts {
  const provenance = item.provenance ?? null;
  const uniqueness = item.uniqueness ?? null;
  const metrics = patch.metrics ?? [];
  const sha256 = patch.provenance?.sha256 ?? uniqueness?.sha256 ?? provenance?.sha256 ?? null;
  const filename = patch.provenance?.filename ?? item.filename ?? provenance?.filename ?? null;

  const localInspectionAt = patch.localInspectionAt ??
    (item.time && TIME_ONLY_PATTERN.test(item.time) ? item.time : null) ??
    extractTimeFromDateTime(uniqueness?.localInspectionAt ?? null) ??
    null;

  const timestampRaw = patch.timestampRaw ??
    uniqueness?.localInspectionAt ??
    uniqueness?.modifiedTime ??
    null;

  const technicianNormalized = patch.technicianNormalized ??
    (uniqueness?.technicianNormalized ? normalizeTechnicianName(uniqueness.technicianNormalized) : null) ??
    (item.technician ? normalizeTechnicianName(item.technician) : null);

  return {
    inspectionId: item.id,
    documentId: patch.documentId ?? provenance?.documentId ?? null,
    documentKind: patch.documentKind ?? uniqueness?.documentKind ?? null,
    technicianNormalized,
    auditor: patch.auditor ?? item.auditor,
    timestampRaw,
    localInspectionDate: patch.localInspectionDate ?? uniqueness?.localInspectionDate ?? item.date,
    localInspectionAt,
    timezone: patch.timezone ?? null,
    datePrecision: patch.datePrecision ?? null,
    timePrecision: patch.timePrecision ?? null,
    importStatus: patch.importStatus ?? uniqueness?.completeness ?? item.status,
    metricCount: patch.metricCount ?? uniqueness?.metricCount ?? metrics.length,
    exactCopyOf: patch.exactCopyOf ?? uniqueness?.exactCopyOf ?? null,
    rubric: patch.rubric ?? item.rubric,
    provenance: {
      present: Boolean(filename && sha256),
      filename,
      sha256,
      sha256Recalculated: patch.provenance?.sha256Recalculated ?? provenance?.sha256Recalculated ?? null,
    },
    metrics,
    sections: patch.sections ?? [],
    evaluationMode: "list" as EvaluationMode,
  };
}