import type { MetricDetail, MetricListResult, MetricRecord, MetricSummary, MetricTechnician } from "./metric-contract";

export class MetricContractError extends Error {
  public constructor() { super("Respuesta de métricas inválida."); this.name = "MetricContractError"; }
}

export function parseMetricList(value: unknown): MetricListResult {
  const root = record(value);
  if (!root || !exact(root, ["count", "data"]) || !integer(root.count) || !Array.isArray(root.data)) fail();
  return { count: root.count, data: root.data.map(parseSummary) };
}

export function parseMetricDetail(value: unknown): MetricDetail {
  const root = record(value);
  if (!root || !exact(root, ["code", "metric", "section", "observations", "applicable", "conforming", "non_conforming", "compliance", "technicians", "records"])) fail();
  const summary = parseSummary({ metric: root.metric, code: root.code, section: root.section, observations: root.observations, applicable: root.applicable, conforming: root.conforming, non_conforming: root.non_conforming, compliance: root.compliance });
  if (!Array.isArray(root.technicians) || !root.technicians.every(isTechnician) || !Array.isArray(root.records) || !root.records.every(isRecordItem)) fail();
  return { ...summary, technicians: root.technicians.map(toTechnician), records: root.records.map(toRecord) };
}

function parseSummary(value: unknown): MetricSummary {
  const root = record(value);
  if (!root || !exact(root, ["metric", "code", "section", "observations", "applicable", "conforming", "non_conforming", "compliance"])) fail();
  if (typeof root.metric !== "string" || !nullableText(root.code) || !nullableText(root.section) || !integer(root.observations) || !integer(root.applicable) || !integer(root.conforming) || !integer(root.non_conforming) || !nullableNumber(root.compliance)) fail();
  return { metric: root.metric as string, code: root.code as string | null, section: root.section as string | null, observations: root.observations as number, applicable: root.applicable as number, conforming: root.conforming as number, nonConforming: root.non_conforming as number, compliance: root.compliance as number | null };
}

function isTechnician(value: unknown): boolean {
  const item = record(value);
  return item !== null && exact(item, ["technician", "applicable", "conforming", "non_conforming"]) && typeof item.technician === "string" && integer(item.applicable) && integer(item.conforming) && integer(item.non_conforming);
}
function toTechnician(value: unknown): MetricTechnician { const item = value as Record<string, unknown>; return { technician: item.technician as string, applicable: item.applicable as number, conforming: item.conforming as number, nonConforming: item.non_conforming as number }; }
function isRecordItem(value: unknown): boolean { const item = record(value); return item !== null && exact(item, ["inspection_id", "technician", "date", "observation"]) && typeof item.inspection_id === "string" && nullableText(item.technician) && nullableText(item.date) && nullableText(item.observation); }
function toRecord(value: unknown): MetricRecord { const item = value as Record<string, unknown>; return { inspectionId: item.inspection_id as string, technician: item.technician as string | null, date: item.date as string | null, observation: item.observation as string | null }; }
function record(value: unknown): Record<string, unknown> | null { return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function exact(value: Record<string, unknown>, fields: readonly string[]): boolean { return Object.keys(value).length === fields.length && fields.every((field) => field in value); }
function nullableText(value: unknown): boolean { return value === null || typeof value === "string"; }
function nullableNumber(value: unknown): boolean { return value === null || typeof value === "number" && Number.isFinite(value); }
function integer(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value >= 0; }
function fail(): never { throw new MetricContractError(); }
