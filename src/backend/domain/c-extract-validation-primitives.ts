export const ROOT_FIELDS = [
  "contract_version", "document_type", "extraction_status", "sections", "document_id",
  "legacy_id", "partial_date", "date", "time", "timezone", "location", "rubric",
  "source", "score", "findings", "observations", "warnings", "provenance", "metadata",
];
export const SECTION_FIELDS = ["index", "name", "items"];
export const ITEM_FIELDS = ["index", "label", "response", "observation", "page", "source_text"];
export const DATE_FIELDS = ["year", "month", "day"];
export const LOCATION_FIELDS = ["city", "region", "latitude", "longitude", "source"];
export const RUBRIC_FIELDS = ["name", "version", "source"];
export const SOURCE_FIELDS = ["filename", "sha256", "pages"];
export const SCORE_FIELDS = ["obtained", "maximum", "percentage", "percentage_scale"];

export function nullableText(value: unknown): boolean {
  return value === null || typeof value === "string";
}
export function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
export function nullableNumber(value: unknown, low = -Number.MAX_VALUE, high = Number.MAX_VALUE): boolean {
  return value === null || typeof value === "number" && Number.isFinite(value)
    && value >= low && value <= high;
}
export function nullableInteger(value: unknown, low = 0, high = Number.MAX_SAFE_INTEGER): boolean {
  return value === null || typeof value === "number" && Number.isInteger(value)
    && value >= low && value <= high;
}
export function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function required(value: Record<string, unknown>): boolean {
  return ["contract_version", "document_type", "extraction_status", "sections"]
    .every((field) => field in value);
}
export function allowed(value: Record<string, unknown>): boolean {
  return Object.keys(value).every((field) => ROOT_FIELDS.includes(field));
}
export function exact(value: unknown, fields: readonly string[]): value is Record<string, unknown> {
  return record(value) && Object.keys(value).length === fields.length
    && fields.every((field) => field in value);
}
