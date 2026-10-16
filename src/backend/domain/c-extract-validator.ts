import {
  C_EXTRACT_VERSION,
  type CExtractDate,
  type CExtractDocument,
  type CExtractItem,
  type CExtractLocation,
  type CExtractRubric,
  type CExtractSection,
  type CExtractSource,
} from "./c-extract-types";

const ROOT_FIELDS = ["contract_version", "document_type", "extraction_status", "sections", "document_id", "date", "time", "timezone", "location", "rubric", "source", "metadata"];
const SECTION_FIELDS = ["index", "name", "items"];
const ITEM_FIELDS = ["index", "label", "response", "observation", "page", "source_text"];
const DATE_FIELDS = ["year", "month", "day"];
const LOCATION_FIELDS = ["city", "region", "latitude", "longitude", "source"];
const RUBRIC_FIELDS = ["name", "version", "source"];
const SOURCE_FIELDS = ["filename", "sha256", "pages"];

export class CExtractContractError extends Error {
  public constructor() {
    super("C-EXTRACT v1.0.0 inválido.");
    this.name = "CExtractContractError";
  }
}

export function parseCExtractDocument(value: unknown): CExtractDocument {
  if (!record(value) || !allowed(value, ROOT_FIELDS) || !required(value, ROOT_FIELDS.slice(0, 4))) fail();
  if (value.contract_version !== C_EXTRACT_VERSION || !text(value.document_type)) fail();
  if (value.extraction_status !== "complete" && value.extraction_status !== "partial") fail();
  if (!sections(value.sections)) fail();
  if (!optionalText(value, "document_id") || !optionalText(value, "time") || !optionalText(value, "timezone")) fail();
  if (!optional(value, "date", date) || !optional(value, "location", location) || !optional(value, "rubric", rubric)) fail();
  if (!optional(value, "source", source) || !optionalMetadata(value.metadata)) fail();
  return value as CExtractDocument;
}

function sections(value: unknown): value is readonly CExtractSection[] {
  return Array.isArray(value) && value.every((item, index) => section(item, index));
}

function section(value: unknown, expectedIndex: number): value is CExtractSection {
  if (!record(value) || !exact(value, SECTION_FIELDS) || value.index !== expectedIndex || !nullableText(value.name)) return false;
  return Array.isArray(value.items) && value.items.every((item, index) => itemValue(item, index));
}

function itemValue(value: unknown, expectedIndex: number): value is CExtractItem {
  return record(value) && exact(value, ITEM_FIELDS) && value.index === expectedIndex
    && nullableText(value.label) && nullableText(value.response) && nullableText(value.observation)
    && nullableText(value.source_text) && nullableInteger(value.page, 1);
}

function date(value: unknown): value is CExtractDate {
  return record(value) && exact(value, DATE_FIELDS) && nullableInteger(value.year, 1)
    && nullableInteger(value.month, 1, 12) && nullableInteger(value.day, 1, 31);
}

function location(value: unknown): value is CExtractLocation {
  if (!record(value) || !exact(value, LOCATION_FIELDS) || !nullableText(value.city) || !nullableText(value.region) || !nullableText(value.source)) return false;
  const coordinates = value.latitude !== null || value.longitude !== null;
  return nullableNumber(value.latitude, -90, 90) && nullableNumber(value.longitude, -180, 180)
    && (!coordinates || text(value.source));
}

function rubric(value: unknown): value is CExtractRubric {
  if (!record(value) || !exact(value, RUBRIC_FIELDS) || !nullableText(value.name) || !nullableText(value.version) || !nullableText(value.source)) return false;
  return (!value.name && !value.version) || text(value.source);
}

function source(value: unknown): value is CExtractSource {
  return record(value) && exact(value, SOURCE_FIELDS) && nullableText(value.filename)
    && nullableText(value.sha256) && nullableInteger(value.pages, 1);
}

function optional(value: Record<string, unknown>, key: string, check: (candidate: unknown) => boolean): boolean {
  return !(key in value) || value[key] === null || check(value[key]);
}

function optionalText(value: Record<string, unknown>, key: string): boolean {
  return !(key in value) || value[key] === null || typeof value[key] === "string";
}

function optionalMetadata(value: unknown): boolean {
  return value === undefined || record(value) && Object.values(value).every((item) => item === null || typeof item === "string");
}

function nullableText(value: unknown): boolean { return value === null || typeof value === "string"; }
function text(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
function nullableInteger(value: unknown, low: number, high = Number.MAX_SAFE_INTEGER): boolean {
  return value === null || typeof value === "number" && Number.isInteger(value) && value >= low && value <= high;
}
function nullableNumber(value: unknown, low: number, high: number): boolean { return value === null || typeof value === "number" && Number.isFinite(value) && value >= low && value <= high; }
function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function required(value: Record<string, unknown>, fields: readonly string[]): boolean { return fields.every((field) => field in value); }
function allowed(value: Record<string, unknown>, fields: readonly string[]): boolean { return Object.keys(value).every((field) => fields.includes(field)); }
function exact(value: Record<string, unknown>, fields: readonly string[]): boolean { return Object.keys(value).length === fields.length && allowed(value, fields) && required(value, fields); }
function fail(): never { throw new CExtractContractError(); }
