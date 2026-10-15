import {
  NORMALIZED_DOCUMENT_VERSION,
  type NormalizedDocument,
} from "./normalized-document";

const DOCUMENT_FIELDS = [
  "schemaVersion", "source", "audit", "sections", "findings",
  "generalObservations", "warnings",
] as const;
const SOURCE_FIELDS = [
  "format", "filename", "sha256", "importedAt", "status", "rubricVersion",
] as const;

export class NormalizedDocumentContractError extends Error {
  public constructor() {
    super("Documento normalizado inválido.");
    this.name = "NormalizedDocumentContractError";
  }
}

export function parseNormalizedDocument(value: unknown): NormalizedDocument {
  if (!isRecord(value) || !hasExactFields(value, DOCUMENT_FIELDS)) {
    throw new NormalizedDocumentContractError();
  }
  if (value.schemaVersion !== NORMALIZED_DOCUMENT_VERSION || !isSource(value.source)) {
    throw new NormalizedDocumentContractError();
  }
  if (!Array.isArray(value.sections) || !Array.isArray(value.findings)) {
    throw new NormalizedDocumentContractError();
  }
  if (!Array.isArray(value.generalObservations) || !Array.isArray(value.warnings)) {
    throw new NormalizedDocumentContractError();
  }
  return value as NormalizedDocument;
}

function isSource(value: unknown): boolean {
  return isRecord(value) && hasExactFields(value, SOURCE_FIELDS)
    && (value.format === "flask-mitti" || value.format === "fasapi-mitti");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactFields<T extends readonly string[]>(
  value: Record<string, unknown>, fields: T,
): boolean {
  const keys = Object.keys(value);
  return keys.length === fields.length && keys.every((key) => fields.includes(key));
}
