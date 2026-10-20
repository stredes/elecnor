import type {
  DocumentItem,
  DocumentSection,
  NormalizedDocument,
} from "../../domain/normalized-document";
import type { DocumentFormatMapper } from "../../ports/document-processing";
import { NORMALIZED_DOCUMENT_VERSION } from "../../domain/normalized-document";
import type {
  FlaskInspectionRecord,
  FlaskMetricRecord,
} from "./flask-document-contract";

export type { FlaskInspectionRecord, FlaskMetricRecord } from "./flask-document-contract";

export const flaskDocumentMapper: DocumentFormatMapper<FlaskInspectionRecord> = {
  format: "flask-mitti",
  map: mapFlaskInspection,
};

export function mapFlaskInspection(source: FlaskInspectionRecord): NormalizedDocument {
  return {
    schemaVersion: NORMALIZED_DOCUMENT_VERSION,
    source: {
      format: "flask-mitti", filename: source.filename, sha256: source.pdfHash,
      importedAt: source.importedAt, status: source.importStatus,
      rubricVersion: source.rubricVersion, legacyId: source.legacyId ?? null,
      sourceSystem: source.sourceSystem ?? "FLASK", provenance: source.provenance ?? {},
    },
    audit: {
      title: null, status: source.importStatus,
      auditor: { name: source.auditor, role: source.auditorRole },
      technician: { name: source.technician, role: null },
      date: source.inspectionDate, partialDate: source.partialDate ?? null, time: source.inspectionTime,
      timezone: source.timezone ?? null,
      location: {
        address: source.address, city: source.city, region: source.region,
        latitude: source.latitude, longitude: source.longitude,
      },
      score: mapFlaskScore(source),
      flaggedItems: source.flaggedItems, actions: source.actions,
    },
    sections: groupFlaskMetrics(source.metrics),
    findings: [],
    generalObservations: source.generalObservation ? [source.generalObservation] : [],
    warnings: [...source.warnings],
  };
}

function mapFlaskScore(source: FlaskInspectionRecord) {
  const values = [source.scoreObtained, source.scoreMax, source.percentage];
  return values.some((value) => value !== null)
    ? {
        obtained: source.scoreObtained, maximum: source.scoreMax,
        percentage: source.percentage, percentageScale: "fraction" as const,
      }
    : null;
}

function groupFlaskMetrics(metrics: readonly FlaskMetricRecord[]): DocumentSection[] {
  const groups = new Map<string, DocumentSection & { items: DocumentItem[] }>();
  for (const metric of metrics) {
    const key = `${metric.sectionOrder}|${metric.sectionNormalized}|${metric.sectionOriginal}`;
    const group = groups.get(key) ?? {
      name: metric.sectionNormalized ?? metric.sectionOriginal,
      rawName: metric.sectionOriginal,
      order: metric.sectionOrder,
      items: [],
    };
    group.items.push({
      number: null, section: metric.sectionNormalized ?? metric.sectionOriginal,
      label: metric.metricNormalized ?? metric.metricOriginal,
      rawLabel: metric.metricOriginal, response: null,
      state: metric.stateNormalized ?? metric.stateOriginal,
      applicable: metric.applicable, conforming: metric.conforming,
      nonConforming: metric.nonConforming, notApplicable: metric.notApplicable,
      observation: metric.observation, page: null, code: metric.code,
    });
    groups.set(key, group);
  }
  return [...groups.values()];
}
