export type DocumentProvenance = {
  readonly documentId: string | null;
  readonly filename: string | null;
  readonly sha256: string | null;
  readonly origin: string | null;
  readonly receivedAt: string | null;
  readonly date: string | null;
  readonly time: string | null;
  readonly sha256Recalculated?: string | null;
};

export class DocumentProvenanceContractError extends Error {
  public constructor() {
    super("Provenance documental inválida.");
    this.name = "DocumentProvenanceContractError";
  }
}

const FIELDS = [
  "document_id", "documentId", "drive_file_id", "driveFileId", "filename", "sha256",
  "origin", "source", "source_system", "received_at", "receivedAt", "date", "source_date",
  "time", "source_time", "source_modified_at", "source_created_at", "sha256_recalculated",
];

export function parseDocumentProvenance(
  value: unknown,
  fallbackDocumentId: string | null = null,
): DocumentProvenance | null {
  if (value === undefined || value === null) return fallback(fallbackDocumentId);
  const item = record(value);
  if (!item || Object.keys(item).some((key) => !FIELDS.includes(key))) fail();
  validateInternalDriveIds(item);
  const sha256 = alias(item, "sha256");
  if (sha256 !== null && !/^[a-f0-9]{64}$/iu.test(sha256)) fail();
  return {
    documentId: alias(item, "document_id", "documentId") ?? fallbackDocumentId,
    filename: alias(item, "filename"), sha256, origin: alias(item, "origin", "source", "source_system"),
    receivedAt: alias(item, "received_at", "receivedAt"),
    date: alias(item, "date", "source_date", "source_modified_at"),
    time: alias(item, "time", "source_time", "source_created_at"),
    sha256Recalculated: alias(item, "sha256_recalculated"),
  };
}

export function parseDocumentProvenanceFromUniqueness(
  uniqueness: { readonly provenance?: { readonly filename?: string | null; readonly sha256?: string | null } | null } | null | undefined,
  fallbackDocumentId: string | null = null,
): DocumentProvenance | null {
  const prov = uniqueness?.provenance;
  if (!prov) return fallback(fallbackDocumentId);
  const filename = prov.filename ?? null;
  const sha256 = prov.sha256 ?? null;
  if (sha256 !== null && !/^[a-f0-9]{64}$/iu.test(sha256)) return fallback(fallbackDocumentId);
  if (filename === null && sha256 === null) return fallback(fallbackDocumentId);
  return {
    documentId: fallbackDocumentId,
    filename,
    sha256,
    origin: "GOOGLE_DRIVE",
    receivedAt: null,
    date: null,
    time: null,
    sha256Recalculated: null,
  };
}

function fallback(documentId: string | null): DocumentProvenance | null {
  return documentId ? { documentId, filename: null, sha256: null, origin: null, receivedAt: null, date: null, time: null, sha256Recalculated: null } : null;
}

function alias(item: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    if (!(key in item) || item[key] === null || item[key] === undefined) continue;
    if (typeof item[key] !== "string") fail();
    return item[key] as string;
  }
  return null;
}

function validateInternalDriveIds(item: Record<string, unknown>): void {
  for (const key of ["drive_file_id", "driveFileId"])
    if (key in item && item[key] !== null && item[key] !== undefined && typeof item[key] !== "string") fail();
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function fail(): never { throw new DocumentProvenanceContractError(); }