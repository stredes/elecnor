import { parseDocumentProvenance, parseDocumentProvenanceFromUniqueness } from "./document-provenance";
import { parseUniquenessFacts } from "./uniqueness-facts";
import { parseInspectionWorkContext, type InspectionListItem, type InspectionListResult, type InspectionWorkContext } from "./inspection-list-contract";

const RESULT_FIELDS = ["data", "total", "limit", "offset", "dates", "auditors", "regions"];
const ITEM_FIELDS = ["id", "date", "time", "technician", "auditor", "address", "city", "region", "percentage", "score", "maxScore", "actions", "rubric", "status", "filename"];
const OPTIONAL_ITEM_FIELDS = ["document_id", "documentId", "provenance", "uniqueness", "work_context", "workContext"];

export class InspectionListContractError extends Error {
  public constructor() {
    super("Respuesta de inspecciones inválida.");
    this.name = "InspectionListContractError";
  }
}

export function parseInspectionList(value: unknown): InspectionListResult {
  if (!record(value) || !exact(value, RESULT_FIELDS) || !Array.isArray(value.data)
    || !["dates", "auditors", "regions"].every((key) => strings(value[key]))
    || !["total", "limit", "offset"].every((key) => integer(value[key]))) fail();
  return { ...value, data: value.data.map(parseItem) } as unknown as InspectionListResult;
}

function parseItem(value: unknown): InspectionListItem {
  if (!record(value) || !exact(value, ITEM_FIELDS, OPTIONAL_ITEM_FIELDS) || typeof value.id !== "string") fail();
  if (!nullableText(value.status)) fail();
  const textFields = ["date", "time", "technician", "auditor", "address", "city", "region", "rubric", "filename"];
  const numberFields = ["percentage", "score", "maxScore", "actions"];
  if (!textFields.every((key) => nullableText(value[key])) || !numberFields.every((key) => nullableNumber(value[key]))) fail();
  const documentId = optionalText(value.document_id) ?? optionalText(value.documentId);
  const uniqueness = parseItemUniqueness(value.uniqueness);
  const provenance = value.provenance !== undefined && value.provenance !== null
    ? parseDocumentProvenance(value.provenance, documentId)
    : parseDocumentProvenanceFromUniqueness(uniqueness, documentId);
  return {
    id: value.id, date: text(value.date), time: text(value.time), technician: text(value.technician),
    auditor: text(value.auditor), address: text(value.address), city: text(value.city), region: text(value.region),
    percentage: number(value.percentage), score: number(value.score), maxScore: number(value.maxScore),
    actions: number(value.actions), rubric: text(value.rubric), status: text(value.status), filename: text(value.filename),
    workContext: parseWorkContext(value.work_context ?? value.workContext),
    provenance, uniqueness,
  };
}

function parseWorkContext(value: unknown): InspectionWorkContext {
  try { return parseInspectionWorkContext(value); } catch { fail(); }
}

function parseItemUniqueness(value: unknown): InspectionListItem["uniqueness"] {
  if (value === undefined) return null;
  try {
    return parseUniquenessFacts(value);
  } catch {
    fail();
  }
  return null;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exact(value: Record<string, unknown>, required: string[], optional: string[] = []): boolean {
  const keys = Object.keys(value);
  return keys.length >= required.length && keys.every((key) => required.includes(key) || optional.includes(key))
    && required.every((field) => field in value);
}

function nullableText(value: unknown): boolean { return value === null || typeof value === "string"; }
function optionalText(value: unknown): string | null { return value === undefined ? null : text(value); }
function text(value: unknown): string | null { if (!nullableText(value)) fail(); return value as string | null; }
function nullableNumber(value: unknown): boolean { return value === null || typeof value === "number" && Number.isFinite(value); }
function number(value: unknown): number | null { if (value === null) return null; if (typeof value !== "number" || !Number.isFinite(value)) fail(); return value; }
function integer(value: unknown): boolean { return typeof value === "number" && Number.isInteger(value) && value >= 0; }
function strings(value: unknown): value is readonly string[] { return Array.isArray(value) && value.every((item) => typeof item === "string"); }
function fail(): never { throw new InspectionListContractError(); }
