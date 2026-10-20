import type {
  Procedure,
  ProcedureCatalogResult,
  ProcedureDetail,
  ProcedureFamily,
} from "./procedure-contract";

export class ProcedureContractError extends Error {
  public constructor() {
    super("Respuesta de procedimientos inválida.");
    this.name = "ProcedureContractError";
  }
}

type JsonRecord = Record<string, unknown>;

export function parseProcedureCatalog(value: unknown): ProcedureCatalogResult {
  const root = record(value);
  if (!root || !keys(root, ["families", "total", "filters"]) || !Array.isArray(root.families)) fail();
  const filters = record(root.filters);
  const q = filters?.q;
  const area = filters?.area;
  if (!filters || !keys(filters, ["q", "area"]) || !text(q) || !text(area) || !integer(root.total)) fail();
  return { families: root.families.map(parseFamily), total: root.total, filters: { q, area } };
}

export function parseProcedureDetail(value: unknown): ProcedureDetail {
  const root = record(value);
  if (!root || !keysOptional(root, ["procedure", "pdfUrl", "document_id", "documentId", "video"])
    || !optionalText(root.pdfUrl) || !optionalText(root.document_id) || !optionalText(root.documentId)) fail();
  const procedure = parseProcedure(root.procedure);
  const video = root.video;
  const videoRecord = record(video);
  if (video !== undefined && (!videoRecord || !keys(videoRecord, ["status"]) || (videoRecord.status !== "unavailable" && videoRecord.status !== "pending-policy"))) fail();
  return { procedure, pdfUrl: optionalValue(root.pdfUrl) ?? procedure.pdfUrl, documentId: optionalValue(root.document_id ?? root.documentId ?? procedure.documentId), video: video as ProcedureDetail["video"] };
}

function parseFamily(value: unknown): ProcedureFamily {
  const family = record(value);
  if (!family || !keys(family, ["code", "title", "procedures", "total", "conVideo"]) || !text(family.code) || !text(family.title) || !Array.isArray(family.procedures) || !integer(family.total) || !integer(family.conVideo)) fail();
  return { code: family.code, title: family.title, procedures: family.procedures.map(parseProcedure), total: family.total, conVideo: family.conVideo };
}

function parseProcedure(value: unknown): Procedure {
  const procedure = record(value);
  const fields = ["id", "title", "code", "area", "description", "youtubeVideoId", "filename", "createdAt", "updatedAt"];
  const optional = ["pdfUrl", "document_id", "documentId"];
  if (!procedure || !keysOptionalFields(procedure, fields, optional) || !text(procedure.id) || !text(procedure.title) || !nullableText(procedure.code) || !nullableText(procedure.area) || !nullableText(procedure.description) || !nullableText(procedure.youtubeVideoId) || !optionalText(procedure.pdfUrl) || !optionalText(procedure.document_id) || !optionalText(procedure.documentId) || !text(procedure.filename) || !text(procedure.createdAt) || !text(procedure.updatedAt)) fail();
  return { id: requiredValue(procedure.id), title: requiredValue(procedure.title), code: optionalValue(procedure.code), area: optionalValue(procedure.area), description: optionalValue(procedure.description), youtubeVideoId: optionalValue(procedure.youtubeVideoId), pdfUrl: optionalValue(procedure.pdfUrl), documentId: optionalValue(procedure.document_id ?? procedure.documentId), filename: requiredValue(procedure.filename), createdAt: requiredValue(procedure.createdAt), updatedAt: requiredValue(procedure.updatedAt) };
}

function record(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as JsonRecord : null;
}

function keys(value: JsonRecord, expected: readonly string[]): boolean {
  return Object.keys(value).length === expected.length && expected.every((key) => key in value);
}

function keysOptional(value: JsonRecord, expected: readonly string[]): boolean {
  return Object.keys(value).every((key) => expected.includes(key)) && "procedure" in value;
}

function keysOptionalFields(value: JsonRecord, required: readonly string[], optional: readonly string[]): boolean {
  return required.every((key) => key in value) && Object.keys(value).every((key) => required.includes(key) || optional.includes(key));
}

function text(value: unknown): value is string { return typeof value === "string"; }
function nullableText(value: unknown): boolean { return value === null || text(value); }
function optionalText(value: unknown): boolean { return value === undefined || nullableText(value); }
function requiredValue(value: unknown): string { if (!text(value)) fail(); return value; }
function optionalValue(value: unknown): string | null { if (value === undefined || value === null) return null; return requiredValue(value); }
function integer(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value >= 0; }
function fail(): never { throw new ProcedureContractError(); }
