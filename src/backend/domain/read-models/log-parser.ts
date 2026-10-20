import type { ImportLog, ImportLogResult } from "./log-contract";

export class LogContractError extends Error {
  public constructor() { super("Respuesta de logs inválida."); this.name = "LogContractError"; }
}

export function parseLogs(value: unknown): ImportLogResult {
  const root = record(value);
  if (!root || !exact(root, ["count", "data"]) || !integer(root.count) || !Array.isArray(root.data)) fail();
  return { count: root.count, data: root.data.map(parseItem) };
}

function parseItem(value: unknown): ImportLog {
  const item = record(value);
  if (!item || !exact(item, ["id", "datetime", "type", "file", "inspection_id", "result", "message", "duration"])) fail();
  if (typeof item.id !== "string" || typeof item.datetime !== "string" || typeof item.type !== "string" || !nullableText(item.file) || !nullableText(item.inspection_id) || typeof item.result !== "string" || typeof item.message !== "string" || !integer(item.duration)) fail();
  return { id: item.id as string, datetime: item.datetime as string, type: item.type as string, file: item.file as string | null, inspectionId: item.inspection_id as string | null, result: item.result as string, message: item.message as string, duration: item.duration as number };
}

function record(value: unknown): Record<string, unknown> | null { return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function exact(value: Record<string, unknown>, fields: readonly string[]): boolean { return Object.keys(value).length === fields.length && fields.every((field) => field in value); }
function nullableText(value: unknown): boolean { return value === null || typeof value === "string"; }
function integer(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value >= 0; }
function fail(): never { throw new LogContractError(); }
