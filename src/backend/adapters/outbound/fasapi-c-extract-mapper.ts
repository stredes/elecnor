import type { CExtractDocument } from "../../domain/c-extract-contract";
import { C_EXTRACT_VERSION } from "../../domain/c-extract-contract";
import type { FasapiDocumentRecord, FasapiQuestionRecord } from "./fasapi-document-contract";
import type { ExtractionRequestMetadata } from "./fasapi-c-extract-contract";

export type { ExtractionRequestMetadata } from "./fasapi-c-extract-contract";

export function mapFasapiToCExtract(
  source: FasapiDocumentRecord,
  metadata: ExtractionRequestMetadata,
): CExtractDocument {
  const audit = source.auditoria;
  const score = audit.puntuacion;
  return {
    contract_version: C_EXTRACT_VERSION,
    document_type: "inspection",
    extraction_status: audit.estado?.toLowerCase().includes("complet") ? "complete" : "partial",
    document_id: null,
    legacy_id: metadata.legacyId ?? null,
    partial_date: audit.fecha_parcial,
    date: dateParts(audit.fecha),
    time: audit.hora,
    timezone: audit.zona_horaria,
    location: { address: audit.direccion_cliente, city: null, region: null, latitude: null, longitude: null, source: null },
    rubric: null,
    source: { filename: metadata.filename, sha256: metadata.sha256, pages: null, source_system: "FASAPI" },
    score: score ? {
      obtained: score.obtenida, maximum: score.maxima, percentage: score.porcentaje,
      percentage_scale: scale(score.porcentaje),
    } : null,
    sections: source.secciones.map((section, index) => ({
      index, name: section.nombre,
      items: section.preguntas.map((item, itemIndex) => mapQuestion(item, itemIndex)),
    })),
    findings: source.resumen_elementos_senalados.map((item, index) => ({
      index, label: item.pregunta, response: item.respuesta,
      observation: item.observacion, page: item.pagina, source_text: item.pregunta,
    })),
    observations: [...source.observaciones_generales],
    warnings: [...source.advertencias],
    provenance: metadata.provenance ?? {},
    metadata: { source_system: "FASAPI", legacy_id: metadata.legacyId ?? null },
  };
}

function mapQuestion(item: FasapiQuestionRecord, index: number) {
  return {
    index, label: item.pregunta, response: item.respuesta,
    observation: item.observacion, page: item.pagina, source_text: item.pregunta,
  };
}

function dateParts(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) return null;
  return { year: Number(value.slice(0, 4)), month: Number(value.slice(5, 7)), day: Number(value.slice(8, 10)) };
}

function scale(value: number | null): "fraction" | "percent" | null {
  return value === null ? null : Math.abs(value) <= 1 ? "fraction" : "percent";
}
