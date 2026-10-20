import {
  C_EXTRACT_VERSION,
  type CExtractDocument,
} from "./c-extract-types";
import {
  date,
  location,
  optionalItems,
  optionalMetadata,
  optionalProvenance,
  optionalStrings,
  optionalText,
  rubric,
  score,
  sections,
  source,
} from "./c-extract-validation";
import {
  allowed as allowedRoot,
  record,
  required as requiredRoot,
} from "./c-extract-validation-primitives";

export class CExtractContractError extends Error {
  public constructor() {
    super("C-EXTRACT v1.0.0 inválido.");
    this.name = "CExtractContractError";
  }
}

export function parseCExtractDocument(value: unknown): CExtractDocument {
  if (!record(value) || !allowedRoot(value) || !requiredRoot(value)) fail();
  if (value.contract_version !== C_EXTRACT_VERSION || typeof value.document_type !== "string") fail();
  if (value.extraction_status !== "complete" && value.extraction_status !== "partial") fail();
  if (!sections(value.sections)) fail();
  if (!optionalText(value, "document_id") || !optionalText(value, "legacy_id")
    || !optionalText(value, "partial_date") || !optionalText(value, "time")
    || !optionalText(value, "timezone")) fail();
  if (!optional(value, "date", date) || !optional(value, "location", location)
    || !optional(value, "rubric", rubric)) fail();
  if (!optional(value, "source", source) || !optional(value, "score", score)
    || !optionalItems(value.findings) || !optionalStrings(value.observations)
    || !optionalStrings(value.warnings) || !optionalProvenance(value.provenance)
    || !optionalMetadata(value.metadata)) fail();
  return value as CExtractDocument;
}

function optional(
  value: Record<string, unknown>,
  key: string,
  check: (candidate: unknown) => boolean,
): boolean {
  return !(key in value) || value[key] === null || check(value[key]);
}

function fail(): never {
  throw new CExtractContractError();
}
