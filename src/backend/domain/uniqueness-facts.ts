export type UniquenessProvenance = {
  readonly filename: string | null;
  readonly sha256: string | null;
};

export type UniquenessFacts = {
  readonly sha256: string | null;
  readonly technicianNormalized: string | null;
  readonly localInspectionDate: string | null;
  readonly localInspectionAt: string | null;
  readonly completeness: string | null;
  readonly metricCount: number | null;
  readonly modifiedTime: string | null;
  readonly documentKind: string | null;
  readonly exactCopyOf: string | null;
  readonly inspectionTime: string | null;
  readonly timezone: string | null;
  readonly timePrecision: string | null;
  readonly datePrecision: string | null;
  readonly provenance: UniquenessProvenance | null;
};

export class UniquenessFactsContractError extends Error {
  public constructor() {
    super("Bloque uniqueness inválido.");
    this.name = "UniquenessFactsContractError";
  }
}

const REQUIRED_FIELDS = [
  "sha256", "technician_normalized", "local_inspection_date", "local_inspection_at",
  "completeness", "metric_count", "modified_time", "document_kind", "exact_copy_of",
] as const;

const OPTIONAL_FIELDS = [
  "inspection_time", "timezone", "time_precision", "date_precision", "provenance",
] as const;

const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS] as const;

export function parseUniquenessFacts(value: unknown): UniquenessFacts | null {
  if (value === undefined || value === null) return null;
  const item = record(value);
  if (!item) fail();
  const keys = Object.keys(item);
  if (!REQUIRED_FIELDS.every((field) => field in item)) fail();
  if (keys.some((key) => !ALL_FIELDS.includes(key as typeof ALL_FIELDS[number]))) {
    // Allow extra fields but don't fail - just ignore them
  }
  const sha256 = text(item.sha256);
  if (sha256 !== null && !/^[a-f0-9]{64}$/iu.test(sha256)) fail();
  if (!integer(item.metric_count)) fail();
  return {
    sha256,
    technicianNormalized: text(item.technician_normalized),
    localInspectionDate: text(item.local_inspection_date),
    localInspectionAt: text(item.local_inspection_at),
    completeness: text(item.completeness),
    metricCount: item.metric_count as number | null,
    modifiedTime: text(item.modified_time),
    documentKind: text(item.document_kind),
    exactCopyOf: text(item.exact_copy_of),
    inspectionTime: text(item.inspection_time),
    timezone: text(item.timezone),
    timePrecision: text(item.time_precision),
    datePrecision: text(item.date_precision),
    provenance: parseUniquenessProvenance(item.provenance),
  };
}

function parseUniquenessProvenance(value: unknown): UniquenessProvenance | null {
  if (value === undefined || value === null) return null;
  const item = record(value);
  if (!item) return null;
  const filename = text(item.filename);
  const sha256 = text(item.sha256);
  if (filename === null && sha256 === null) return null;
  if (sha256 !== null && !/^[a-f0-9]{64}$/iu.test(sha256)) return null;
  return { filename, sha256 };
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function text(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") fail();
  return value;
}

function integer(value: unknown): boolean {
  return value === undefined || value === null || typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function fail(): never { throw new UniquenessFactsContractError(); }
