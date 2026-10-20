import type { UnknownMetric, UnknownMetricResult } from "./unknown-contract";

export class UnknownMetricContractError extends Error {
  public constructor() { super("Respuesta de métricas desconocidas inválida."); this.name = "UnknownMetricContractError"; }
}

export function parseUnknownMetrics(value: unknown): UnknownMetricResult {
  const root = record(value);
  if (!root || !exact(root, ["count", "data"]) || !integer(root.count) || !Array.isArray(root.data)) fail();
  return { count: root.count, data: root.data.map(parseItem) };
}

function parseItem(value: unknown): UnknownMetric {
  const item = record(value);
  if (!item || !exact(item, ["id", "inspection_id", "metric", "normalized", "status", "assigned_code", "filename"])) fail();
  if (!["id", "inspection_id", "metric", "normalized", "status", "filename"].every((key) => typeof item[key] === "string") || !nullableText(item.assigned_code)) fail();
  return { id: item.id as string, inspectionId: item.inspection_id as string, metric: item.metric as string, normalized: item.normalized as string, status: item.status as string, assignedCode: item.assigned_code as string | null, filename: item.filename as string };
}

function record(value: unknown): Record<string, unknown> | null { return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function exact(value: Record<string, unknown>, fields: readonly string[]): boolean { return Object.keys(value).length === fields.length && fields.every((field) => field in value); }
function nullableText(value: unknown): boolean { return value === null || typeof value === "string"; }
function integer(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value >= 0; }
function fail(): never { throw new UnknownMetricContractError(); }
