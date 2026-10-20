import { NORMALIZED_DOCUMENT_VERSION, type NormalizedDocument } from "./normalized-document";

const ROOT = ["schemaVersion", "source", "audit", "sections", "findings", "generalObservations", "warnings"];
const SOURCE = ["format", "filename", "sha256", "importedAt", "status", "rubricVersion", "legacyId", "sourceSystem", "provenance"];
const AUDIT = ["title", "status", "auditor", "technician", "date", "partialDate", "time", "timezone", "location", "score", "flaggedItems", "actions"];
const PERSON = ["name", "role"];
const LOCATION = ["address", "city", "region", "latitude", "longitude"];
const SCORE = ["obtained", "maximum", "percentage", "percentageScale"];
const SECTION = ["name", "rawName", "order", "items"];
const ITEM = ["number", "section", "label", "rawLabel", "response", "state", "applicable", "conforming", "nonConforming", "notApplicable", "observation", "page", "code"];

export class NormalizedDocumentContractError extends Error {
  public constructor() {
    super("Documento normalizado inválido.");
    this.name = "NormalizedDocumentContractError";
  }
}

export function parseNormalizedDocument(value: unknown): NormalizedDocument {
  if (!record(value) || !exact(value, ROOT) || value.schemaVersion !== NORMALIZED_DOCUMENT_VERSION) fail();
  if (!source(value.source) || !audit(value.audit)) fail();
  if (!arrayOf(value.sections, section) || !arrayOf(value.findings, item)) fail();
  if (!arrayOf(value.generalObservations, text) || !arrayOf(value.warnings, text)) fail();
  return value as NormalizedDocument;
}

function source(value: unknown): boolean {
  if (!record(value) || !exact(value, SOURCE) || !nullableText(value.filename) || !nullableText(value.sha256)) return false;
  return nullableText(value.importedAt) && nullableText(value.status) && nullableText(value.rubricVersion)
    && nullableText(value.legacyId) && nullableText(value.sourceSystem) && json(value.provenance);
}

function audit(value: unknown): boolean {
  if (!record(value) || !exact(value, AUDIT) || !nullableText(value.title) || !nullableText(value.status)) return false;
  return person(value.auditor) && person(value.technician) && nullableText(value.date) && nullableText(value.partialDate)
    && nullableText(value.time) && nullableText(value.timezone) && location(value.location) && score(value.score)
    && nullableInteger(value.flaggedItems) && nullableInteger(value.actions);
}

function person(value: unknown): boolean {
  return value === null || record(value) && exact(value, PERSON) && nullableText(value.name) && nullableText(value.role);
}

function location(value: unknown): boolean {
  return record(value) && exact(value, LOCATION) && nullableText(value.address) && nullableText(value.city)
    && nullableText(value.region) && nullableNumber(value.latitude, -90, 90) && nullableNumber(value.longitude, -180, 180);
}

function score(value: unknown): boolean {
  if (value === null) return true;
  return record(value) && exact(value, SCORE) && nullableNumber(value.obtained) && nullableNumber(value.maximum)
    && nullableNumber(value.percentage) && (value.percentageScale === null || value.percentageScale === "fraction" || value.percentageScale === "percent");
}

function section(value: unknown): boolean {
  return record(value) && exact(value, SECTION) && nullableText(value.name) && nullableText(value.rawName)
    && nullableInteger(value.order) && arrayOf(value.items, item);
}

function item(value: unknown): boolean {
  return record(value) && exact(value, ITEM) && nullableInteger(value.number) && nullableText(value.section)
    && nullableText(value.label) && nullableText(value.rawLabel) && nullableText(value.response) && nullableText(value.state)
    && nullableNumber(value.applicable) && nullableNumber(value.conforming) && nullableNumber(value.nonConforming)
    && nullableNumber(value.notApplicable) && nullableText(value.observation) && nullableInteger(value.page, 1)
    && nullableText(value.code);
}

function arrayOf(value: unknown, check: (item: unknown) => boolean): boolean {
  return Array.isArray(value) && value.every(check);
}

function json(value: unknown): boolean {
  return value === null || typeof value === "string" || typeof value === "number" && Number.isFinite(value)
    || typeof value === "boolean" || Array.isArray(value) && value.every(json)
    || record(value) && Object.values(value).every(json);
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exact(value: Record<string, unknown>, fields: readonly string[]): boolean {
  return Object.keys(value).length === fields.length && fields.every((field) => field in value);
}

function nullableText(value: unknown): boolean { return value === null || typeof value === "string"; }
function text(value: unknown): value is string { return typeof value === "string"; }
function nullableNumber(value: unknown, low = -Number.MAX_VALUE, high = Number.MAX_VALUE): boolean {
  return value === null || typeof value === "number" && Number.isFinite(value) && value >= low && value <= high;
}
function nullableInteger(value: unknown, low = 0): boolean {
  return value === null || typeof value === "number" && Number.isInteger(value) && value >= low;
}
function fail(): never { throw new NormalizedDocumentContractError(); }
