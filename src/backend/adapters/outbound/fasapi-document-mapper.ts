import type {
  DocumentItem,
  DocumentPerson,
  DocumentScore,
  NormalizedDocument,
} from "../../domain/normalized-document";
import { NORMALIZED_DOCUMENT_VERSION } from "../../domain/normalized-document";
import type { DocumentFormatMapper } from "../../ports/document-processing";
import type {
  FasapiDocumentRecord,
  FasapiFindingRecord,
  FasapiPersonRecord,
  FasapiQuestionRecord,
  FasapiScoreRecord,
} from "./fasapi-document-contract";

export type {
  FasapiDocumentRecord,
  FasapiFindingRecord,
  FasapiPersonRecord,
  FasapiQuestionRecord,
  FasapiScoreRecord,
} from "./fasapi-document-contract";

export const fasapiDocumentMapper: DocumentFormatMapper<FasapiDocumentRecord> = {
  format: "fasapi-mitti",
  map: mapFasapiDocument,
};

export function mapFasapiDocument(source: FasapiDocumentRecord): NormalizedDocument {
  const audit = source.auditoria;
  return {
    schemaVersion: NORMALIZED_DOCUMENT_VERSION,
    source: {
      format: "fasapi-mitti", filename: null, sha256: null, importedAt: null,
      status: null, rubricVersion: null,
    },
    audit: {
      title: audit.titulo, status: audit.estado,
      auditor: mapPerson(audit.auditor), technician: mapPerson(audit.tecnico),
      date: audit.fecha, partialDate: audit.fecha_parcial, time: audit.hora,
      timezone: audit.zona_horaria,
      location: {
        address: audit.direccion_cliente, city: null, region: null,
        latitude: null, longitude: null,
      },
      score: mapScore(audit.puntuacion),
      flaggedItems: audit.elementos_senalados, actions: audit.acciones,
    },
    sections: source.secciones.map((section) => ({
      name: section.nombre, rawName: section.nombre, order: null,
      items: section.preguntas.map(mapQuestion),
    })),
    findings: source.resumen_elementos_senalados.map(mapFinding),
    generalObservations: [...source.observaciones_generales],
    warnings: [...source.advertencias],
  };
}

function mapPerson(person: FasapiPersonRecord | null): DocumentPerson | null {
  return person ? { name: person.nombre, role: person.cargo } : null;
}

function mapScore(score: FasapiScoreRecord | null): DocumentScore | null {
  return score
    ? {
        obtained: score.obtenida, maximum: score.maxima,
        percentage: score.porcentaje, percentageScale: "percent",
      }
    : null;
}

function mapQuestion(question: FasapiQuestionRecord): DocumentItem {
  return {
    number: question.numero, section: null,
    label: question.pregunta, rawLabel: question.pregunta,
    response: question.respuesta, state: null,
    applicable: null, conforming: null, nonConforming: null, notApplicable: null,
    observation: question.observacion, page: question.pagina, code: null,
  };
}

function mapFinding(finding: FasapiFindingRecord): DocumentItem {
  return {
    number: null, section: finding.seccion,
    label: finding.pregunta, rawLabel: finding.pregunta,
    response: finding.respuesta, state: null,
    applicable: null, conforming: null, nonConforming: null, notApplicable: null,
    observation: finding.observacion, page: finding.pagina, code: null,
  };
}
