import type {
  FasapiDocumentRecord,
  FasapiFindingRecord,
  FasapiQuestionRecord,
  FasapiSectionRecord,
} from "./fasapi-document-contract";

const ROOT = ["auditoria", "secciones", "resumen_elementos_senalados", "observaciones_generales", "advertencias"];
const AUDIT = ["titulo", "estado", "auditor", "tecnico", "fecha", "fecha_parcial", "hora", "zona_horaria", "direccion_cliente", "puntuacion", "elementos_senalados", "acciones"];
const PERSON = ["nombre", "cargo"];
const SCORE = ["obtenida", "maxima", "porcentaje"];
const SECTION = ["nombre", "preguntas"];
const QUESTION = ["numero", "pregunta", "respuesta", "observacion", "pagina"];
const FINDING = ["seccion", "pregunta", "respuesta", "observacion", "pagina"];

export class FasapiResponseContractError extends Error {
  public constructor() {
    super("Respuesta de extracción Fasapi inválida.");
    this.name = "FasapiResponseContractError";
  }
}

export function parseFasapiResponse(value: unknown): FasapiDocumentRecord {
  const root = record(value);
  if (!root || !exact(root, ROOT) || !audit(root.auditoria) || !sections(root.secciones)
    || !findings(root.resumen_elementos_senalados) || !strings(root.observaciones_generales) || !strings(root.advertencias)) fail();
  return root as FasapiDocumentRecord;
}

function audit(value: unknown): boolean {
  const item = record(value);
  if (!item || !exact(item, AUDIT) || !nullableText(item.titulo) || !nullableText(item.estado)
    || !person(item.auditor) || !person(item.tecnico) || !nullableText(item.fecha) || !nullableText(item.fecha_parcial)
    || !nullableText(item.hora) || !nullableText(item.zona_horaria) || !nullableText(item.direccion_cliente)
    || !score(item.puntuacion) || !nullableInteger(item.elementos_senalados) || !nullableInteger(item.acciones)) return false;
  return true;
}

function person(value: unknown): boolean {
  const item = record(value);
  return value === null || item !== null && exact(item, PERSON) && nullableText(item.nombre) && nullableText(item.cargo);
}

function score(value: unknown): boolean {
  const item = record(value);
  return value === null || item !== null && exact(item, SCORE) && nullableNumber(item.obtenida)
    && nullableNumber(item.maxima) && nullableNumber(item.porcentaje);
}

function sections(value: unknown): value is readonly FasapiSectionRecord[] {
  return Array.isArray(value) && value.every((item) => {
    const section = record(item);
    return section !== null && exact(section, SECTION) && typeof section.nombre === "string" && questions(section.preguntas);
  });
}

function questions(value: unknown): value is readonly FasapiQuestionRecord[] {
  return Array.isArray(value) && value.every((item) => {
    const question = record(item);
    return question !== null && exact(question, QUESTION) && nullableInteger(question.numero)
      && typeof question.pregunta === "string" && nullableText(question.respuesta)
      && nullableText(question.observacion) && nullableInteger(question.pagina, 1);
  });
}

function findings(value: unknown): value is readonly FasapiFindingRecord[] {
  return Array.isArray(value) && value.every((item) => {
    const finding = record(item);
    return finding !== null && exact(finding, FINDING) && nullableText(finding.seccion)
      && typeof finding.pregunta === "string" && nullableText(finding.respuesta)
      && nullableText(finding.observacion) && nullableInteger(finding.pagina, 1);
  });
}

function strings(value: unknown): value is readonly string[] { return Array.isArray(value) && value.every((item) => typeof item === "string"); }
function nullableText(value: unknown): boolean { return value === null || typeof value === "string"; }
function nullableNumber(value: unknown): boolean { return value === null || typeof value === "number" && Number.isFinite(value); }
function nullableInteger(value: unknown, low = 0): boolean { return value === null || typeof value === "number" && Number.isInteger(value) && value >= low; }
function record(value: unknown): Record<string, unknown> | null { return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function exact(value: Record<string, unknown>, fields: readonly string[]): boolean { return Object.keys(value).length === fields.length && fields.every((field) => field in value); }
function fail(): never { throw new FasapiResponseContractError(); }
