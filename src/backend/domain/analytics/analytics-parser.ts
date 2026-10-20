import type { ReportingAnalytics } from "./analytics-contract";

export class AnalyticsContractError extends Error {
  public constructor() { super("Respuesta de analytics inválida."); this.name = "AnalyticsContractError"; }
}

export function parseAnalytics(value: unknown): ReportingAnalytics {
  const root = record(value);
  if (!root || !exact(root, ["progress", "evolution", "ranking", "traceability", "geolocation"]) || !progress(root.progress) || !evolution(root.evolution) || !ranking(root.ranking) || !traceability(root.traceability) || !geolocation(root.geolocation)) fail();
  return root as ReportingAnalytics;
}

function progress(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => {
    const row = record(item);
    return row !== null && exact(row, ["period", "inspections", "compliance"]) && typeof row.period === "string" && integer(row.inspections) && number(row.compliance);
  });
}

function evolution(value: unknown): boolean {
  const root = record(value);
  return root !== null && exact(root, ["semanas", "total"]) && integer(root.total) && Array.isArray(root.semanas) && root.semanas.every(week);
}

function week(value: unknown): boolean {
  const row = record(value);
  return row !== null && exact(row, ["inicio", "inspecciones", "promedio", "bajo70"]) && typeof row.inicio === "string" && integer(row.inspecciones) && nullableNumber(row.promedio) && integer(row.bajo70);
}

function ranking(value: unknown): boolean {
  const root = record(value);
  return root !== null && exact(root, ["promedio_global", "minimo", "limite", "tecnicos", "auditores"]) && nullableNumber(root.promedio_global) && integer(root.minimo) && integer(root.limite) && Array.isArray(root.tecnicos) && root.tecnicos.every(rank) && Array.isArray(root.auditores) && root.auditores.every(rank);
}

function rank(value: unknown): boolean {
  const row = record(value);
  return row !== null && exact(row, ["nombre", "inspecciones", "promedio", "bajo70"]) && typeof row.nombre === "string" && integer(row.inspecciones) && number(row.promedio) && integer(row.bajo70);
}

function traceability(value: unknown): boolean {
  const root = record(value);
  return root !== null && exact(root, ["total", "con_acciones", "sin_acciones", "porcentaje_sin_acciones"]) && integer(root.total) && integer(root.con_acciones) && integer(root.sin_acciones) && number(root.porcentaje_sin_acciones);
}

function geolocation(value: unknown): boolean {
  const root = record(value);
  return root !== null && exact(root, ["total", "con_geolocalizacion", "sin_geolocalizacion", "porcentaje_con_geolocalizacion", "direcciones_clasificadas", "direcciones_pendientes", "porcentaje_direcciones_clasificadas", "por_region"]) && integer(root.total) && integer(root.con_geolocalizacion) && integer(root.sin_geolocalizacion) && number(root.porcentaje_con_geolocalizacion) && integer(root.direcciones_clasificadas) && integer(root.direcciones_pendientes) && number(root.porcentaje_direcciones_clasificadas) && Array.isArray(root.por_region) && root.por_region.every(region);
}

function region(value: unknown): boolean { const row = record(value); return row !== null && exact(row, ["region", "total"]) && typeof row.region === "string" && integer(row.total); }
function record(value: unknown): Record<string, unknown> | null { return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function exact(value: Record<string, unknown>, fields: readonly string[]): boolean { return Object.keys(value).length === fields.length && fields.every((field) => field in value); }
function number(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value); }
function nullableNumber(value: unknown): boolean { return value === null || number(value); }
function integer(value: unknown): value is number { return number(value) && Number.isInteger(value) && value >= 0; }
function fail(): never { throw new AnalyticsContractError(); }
