import { parseInspectionWorkContext, type InspectionListItem } from "../inspection-list-contract";
import { parseDocumentProvenance } from "../document-provenance";
import { parseUniquenessFacts } from "../uniqueness-facts";

export type InspectionDetailInspection = InspectionListItem & {
  readonly auditorRole: string | null;
  readonly observation: string | null;
};

export type InspectionMetric = {
  readonly id: string;
  readonly section: string;
  readonly metric: string;
  readonly code: string;
  readonly status: string | null;
  readonly applicable: number | null;
  readonly conforming: number | null;
  readonly nonConforming: number | null;
  readonly notApplicable: number | null;
  readonly observation: string | null;
};

export type InspectionDetail = {
  readonly inspection: InspectionDetailInspection;
  readonly metrics: readonly InspectionMetric[];
};

export function parseInspectionDetail(value: unknown): InspectionDetail {
  const root = record(value);
  const inspection = root && record(root.inspection);
  if (!root || !inspection || !Array.isArray(root.metrics)) throw new Error("Invalid inspection detail");
  const source = record(root.source);
  return {
    inspection: withSource(parseInspection(inspection), source),
    metrics: root.metrics.map(parseMetric),
  };
}

function withSource(inspection: InspectionDetailInspection, source: Record<string, unknown> | null): InspectionDetailInspection {
  if (!source) return inspection;
  const sourceData = record(source.provenance);
  const documentId = text(source.document_id ?? source.documentId);
  const provenance = parseDocumentProvenance({
    document_id: documentId,
    drive_file_id: source.drive_file_id,
    filename: source.filename,
    sha256: source.sha256,
    source_system: sourceData?.source_system ?? "GOOGLE_DRIVE",
    received_at: sourceData?.received_at,
    source_modified_at: source.source_modified_at ?? inspection.date,
    source_created_at: source.source_created_at ?? inspection.time,
  }, documentId);
  return { ...inspection, provenance };
}

function parseInspection(value: Record<string, unknown>): InspectionDetailInspection {
  const status = text(value.status);
  if (typeof value.id !== "string") throw new Error("Invalid inspection");
  return {
    id: value.id, filename: text(value.filename), date: text(value.date), time: text(value.time),
    technician: text(value.technician), auditor: text(value.auditor), address: text(value.address),
    city: text(value.city), region: text(value.region), percentage: number(value.percentage),
    score: number(value.score), maxScore: number(value.maxScore), actions: number(value.actions),
    rubric: text(value.rubric), status, workContext: parseInspectionWorkContext(value.work_context), visualWorkContext: value.visual_work_context === null || value.visual_work_context === undefined ? null : parseInspectionWorkContext(value.visual_work_context), contextSource: value.context_source === "VISUAL" ? "VISUAL" : "TEXT", visualConfidence: number(value.visual_confidence), visualEvidencePage: integerOrNull(value.visual_evidence_page), visualEvidenceImage: integerOrNull(value.visual_evidence_image), visualRationale: text(value.visual_rationale), auditorRole: text(value.auditorRole), observation: text(value.observation),
    provenance: parseDocumentProvenance(value.provenance, text(value.document_id ?? value.documentId)),
    uniqueness: parseUniquenessFacts(value.uniqueness),
  };
}

function parseMetric(value: unknown): InspectionMetric {
  const item = record(value);
  const section = item && firstText(item.section, item.sectionNormalized, item.sectionOriginal);
  const metric = item && firstText(item.metric, item.metricNormalized, item.metricOriginal);
  const code = item && firstText(item.code, item.metricCode, item.id);
  if (!item || typeof item.id !== "string" || !section || !metric || !code) throw new Error("Invalid inspection metric");
  return {
    id: item.id, section, metric, code, status: text(item.status),
    applicable: number(item.applicable), conforming: number(item.conforming),
    nonConforming: number(item.nonConforming), notApplicable: number(item.notApplicable),
    observation: text(item.observation),
  };
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new Error("Invalid text field");
  return value;
}

function number(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("Invalid numeric field");
  return value;
}

function integerOrNull(value: unknown): number | null {
  const parsed = number(value);
  if (parsed === null) return null;
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error("Invalid integer field");
  return parsed;
}

function firstText(...values: unknown[]): string | null { return values.find((value): value is string => typeof value === "string" && value.trim() !== "") ?? null; }
