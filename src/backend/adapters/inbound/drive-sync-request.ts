import type { DriveSyncRequest } from "../../ports/drive-import-gateway";

export class DriveSyncRequestError extends Error {
  public constructor() { super("Solicitud de sincronización inválida."); this.name = "DriveSyncRequestError"; }
}

export function parseDriveSyncRequest(value: unknown): DriveSyncRequest {
  if (value === undefined || value === null) return {};
  if (!record(value) || Object.keys(value).some((key) => !["limit", "retry_of", "request_id"].includes(key))) fail();
  const limit = value.limit === undefined || value.limit === null ? undefined : integer(value.limit);
  if (value.limit !== undefined && value.limit !== null && limit === null) fail();
  return { limit: limit ?? undefined, retryOf: text(value.retry_of), requestId: text(value.request_id) };
}

function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function text(value: unknown): string | null { if (value === undefined || value === null) return null; if (typeof value !== "string" || value.length > 256) fail(); return value; }
function integer(value: unknown): number | null { return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 100 ? value : null; }
function fail(): never { throw new DriveSyncRequestError(); }
