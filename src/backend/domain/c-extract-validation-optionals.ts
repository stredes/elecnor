import { ITEM_FIELDS, exact, nullableInteger, nullableText, record } from "./c-extract-validation-primitives";

export function optionalItems(value: unknown): boolean {
  return value === undefined || items(value);
}

function items(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => record(item) && exact(item, ITEM_FIELDS)
    && nullableInteger(item.index) && nullableText(item.label) && nullableText(item.response)
    && nullableText(item.observation) && nullableInteger(item.page, 1)
    && nullableText(item.source_text));
}

export function optionalStrings(value: unknown): boolean {
  return value === undefined || Array.isArray(value) && value.every(nullableText);
}

export function optionalProvenance(value: unknown): boolean {
  return value === undefined || record(value) && Object.values(value).every((item) => (
    item === null || typeof item === "string" || typeof item === "number" || typeof item === "boolean"
  ));
}

export function optionalMetadata(value: unknown): boolean {
  return value === undefined || record(value) && Object.values(value).every(nullableText);
}

export function optionalText(value: Record<string, unknown>, key: string): boolean {
  return !(key in value) || value[key] === null || typeof value[key] === "string";
}
