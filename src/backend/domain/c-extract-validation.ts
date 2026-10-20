import type {
  CExtractDate,
  CExtractItem,
  CExtractLocation,
  CExtractRubric,
  CExtractSection,
  CExtractSource,
} from "./c-extract-types";
import {
  DATE_FIELDS,
  ITEM_FIELDS,
  LOCATION_FIELDS,
  RUBRIC_FIELDS,
  SCORE_FIELDS,
  SECTION_FIELDS,
  SOURCE_FIELDS,
  exact,
  nullableInteger,
  nullableNumber,
  nullableText,
  record,
  text,
} from "./c-extract-validation-primitives";
export {
  optionalItems,
  optionalMetadata,
  optionalProvenance,
  optionalStrings,
  optionalText,
} from "./c-extract-validation-optionals";

export function sections(value: unknown): value is readonly CExtractSection[] {
  return Array.isArray(value) && value.every((item, index) => section(item, index));
}

function section(value: unknown, expectedIndex: number): value is CExtractSection {
  if (!record(value) || !exact(value, SECTION_FIELDS) || value.index !== expectedIndex
    || !nullableText(value.name)) return false;
  return Array.isArray(value.items) && value.items.every((item, index) => itemValue(item, index));
}

function itemValue(value: unknown, expectedIndex: number): value is CExtractItem {
  return record(value) && exact(value, ITEM_FIELDS) && value.index === expectedIndex
    && nullableText(value.label) && nullableText(value.response)
    && nullableText(value.observation) && nullableText(value.source_text)
    && nullableInteger(value.page, 1);
}

export function date(value: unknown): value is CExtractDate {
  return record(value) && exact(value, DATE_FIELDS) && nullableInteger(value.year, 1)
    && nullableInteger(value.month, 1, 12) && nullableInteger(value.day, 1, 31);
}

export function location(value: unknown): value is CExtractLocation {
  const fields = exact(value, LOCATION_FIELDS) || exact(value, [...LOCATION_FIELDS, "address"]);
  if (!record(value) || !fields || !optionalAddress(value) || !nullableText(value.city)
    || !nullableText(value.region) || !nullableText(value.source)) return false;
  const coordinates = value.latitude !== null || value.longitude !== null;
  return nullableNumber(value.latitude, -90, 90) && nullableNumber(value.longitude, -180, 180)
    && (!coordinates || text(value.source));
}

function optionalAddress(value: Record<string, unknown>): boolean {
  return typeof value.address === "undefined" || nullableText(value.address);
}

export function rubric(value: unknown): value is CExtractRubric {
  if (!record(value) || !exact(value, RUBRIC_FIELDS) || !nullableText(value.name)
    || !nullableText(value.version) || !nullableText(value.source)) return false;
  return (!value.name && !value.version) || text(value.source);
}

export function source(value: unknown): value is CExtractSource {
  const fields = exact(value, SOURCE_FIELDS) || exact(value, [...SOURCE_FIELDS, "source_system"]);
  return record(value) && fields && nullableText(value.filename) && nullableText(value.sha256)
    && nullableInteger(value.pages, 1)
    && (typeof value.source_system === "undefined" || nullableText(value.source_system));
}

export function score(value: unknown): boolean {
  return record(value) && exact(value, SCORE_FIELDS) && nullableNumber(value.obtained)
    && nullableNumber(value.maximum) && nullableNumber(value.percentage)
    && (value.percentage_scale === null || value.percentage_scale === "fraction"
      || value.percentage_scale === "percent");
}
