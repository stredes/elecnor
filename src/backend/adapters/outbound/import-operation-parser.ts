import { parseDocumentProvenance } from "../../domain/document-provenance";
import type { DriveSyncItemStatus, DriveSyncStatus, DriveSyncSummary } from "../../domain/import-operation-contract";

export class ImportOperationContractError extends Error {
  public constructor(message = "Estado de sincronización inválido.") { super(message); this.name = "ImportOperationContractError"; }
}

const SUMMARY = ["seleccionados", "procesados", "duplicados", "errores", "inspecciones_nuevas", "metricas_insertadas", "metricas_sin_clasificar"];
const STATE = ["sync_id", "source", "status", "requested_at", "started_at", "finished_at", "retry_of", "summary", "items"];
const ITEM = ["document_id", "inspection_id", "filename", "sha256", "status", "duplicate_decision", "duplicate_of_document_id", "error", "provenance"];

export function parseDriveSyncSummary(value: unknown): DriveSyncSummary {
  const root = record(value);
  if (!root || typeof root.sync_id !== "string" || !integer(root.drive_files_seen) || !integer(root.duplicate_candidates)) fail();
  for (const key of SUMMARY) if (!integer(root[key])) fail();
  return { syncId: root.sync_id, driveFilesSeen: numberValue(root.drive_files_seen), duplicateCandidates: numberValue(root.duplicate_candidates), seleccionados: numberValue(root.seleccionados), procesados: numberValue(root.procesados), duplicados: numberValue(root.duplicados), errores: numberValue(root.errores), inspeccionesNuevas: numberValue(root.inspecciones_nuevas), metricasInsertadas: numberValue(root.metricas_insertadas), metricasSinClasificar: numberValue(root.metricas_sin_clasificar) };
}

export function parseDriveSyncStatus(value: unknown): DriveSyncStatus {
  const root = record(value);
  if (!root || !exact(root, STATE) || typeof root.sync_id !== "string" || typeof root.source !== "string" || typeof root.status !== "string" || !nullableText(root.requested_at) || !nullableText(root.started_at) || !nullableText(root.finished_at) || !nullableText(root.retry_of) || !(root.summary === null || record(root.summary)) || !Array.isArray(root.items)) fail();
  return { syncId: root.sync_id, source: root.source, status: root.status, requestedAt: root.requested_at as string | null, startedAt: root.started_at as string | null, finishedAt: root.finished_at as string | null, retryOf: root.retry_of as string | null, summary: root.summary === null ? null : parseDriveSyncSummary(root.summary), items: root.items.map(parseItem) };
}

function parseItem(value: unknown): DriveSyncItemStatus {
  const item = record(value);
  if (!item || !exact(item, ITEM) || !nullableText(item.document_id) || !nullableText(item.inspection_id) || !nullableText(item.filename) || !nullableHash(item.sha256) || typeof item.status !== "string" || !nullableText(item.duplicate_decision) || !nullableText(item.duplicate_of_document_id) || !nullableText(item.error)) fail();
  return { documentId: item.document_id as string | null, inspectionId: item.inspection_id as string | null, filename: item.filename as string | null, sha256: item.sha256 as string | null, status: item.status, duplicateDecision: item.duplicate_decision as string | null, duplicateOfDocumentId: item.duplicate_of_document_id as string | null, error: item.error as string | null, provenance: parseDocumentProvenance(item.provenance, item.document_id as string | null) };
}

function record(value: unknown): Record<string, unknown> | null { return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function exact(value: Record<string, unknown>, fields: readonly string[]): boolean { return Object.keys(value).length === fields.length && fields.every((field) => field in value); }
function nullableText(value: unknown): boolean { return value === null || typeof value === "string"; }
function nullableHash(value: unknown): boolean { return value === null || typeof value === "string" && /^[a-f0-9]{64}$/iu.test(value); }
function integer(value: unknown): boolean { return typeof value === "number" && Number.isInteger(value) && value >= 0; }
function numberValue(value: unknown): number { if (!integer(value)) fail(); return value as number; }
function fail(): never { throw new ImportOperationContractError(); }
