import type { ReportingFacts, ReportingMetricFact } from "./reporting-facts-contract";

export class ReportingFactsContractError extends Error {
  public constructor() { super("Respuesta de hechos de reporting inválida."); this.name = "ReportingFactsContractError"; }
}

export function parseReportingFacts(value: unknown): ReportingFacts {
  const root = record(value);
  if (!root || !Array.isArray(root.inspections) || !Array.isArray(root.importLogs) || !Array.isArray(root.metrics)) fail();
  return {
    inspections: root.inspections.map((item) => {
      const row = record(item);
      if (!row || typeof row.id !== "string" || row.id.length === 0 || !isTextOrNull(row.technician) || !isNumberOrNull(row.percentage) || !isNumberOrNull(row.actions)) fail();
      return { id: row.id as string, date: textOrNull(row.date), technician: row.technician as string | null, auditor: textOrNull(row.auditor), address: textOrNull(row.address), city: textOrNull(row.city), region: textOrNull(row.region), filename: textOrNull(row.filename), percentage: row.percentage as number | null, actions: row.actions as number | null };
    }),
    importLogs: root.importLogs.map((item) => { const row = record(item); if (!row || typeof row.id !== "string") fail(); return { id: row.id }; }),
    metrics: root.metrics.map(parseMetric),
  };
}

function parseMetric(value: unknown): ReportingMetricFact {
  const row = record(value);
  if (!row || typeof row.state !== "string") fail();
  return { state: row.state, inspectionId: textOrNull(row.inspectionId), code: textOrNull(row.code), section: textOrNull(row.section), metric: textOrNull(row.metric), applicable: numberOrNull(row.applicable), conforming: numberOrNull(row.conforming), technician: textOrNull(row.technician), observation: textOrNull(row.observation), date: textOrNull(row.date), notApplicable: numberOrNull(row.not_applicable ?? row.notApplicable) };
}

function record(value: unknown): Record<string, unknown> | null { return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function isTextOrNull(value: unknown): boolean { return value === null || value === undefined || typeof value === "string"; }
function isNumberOrNull(value: unknown): boolean { return value === null || value === undefined || typeof value === "number" && Number.isFinite(value); }
function textOrNull(value: unknown): string | null { return value === null || value === undefined ? null : typeof value === "string" ? value : fail(); }
function numberOrNull(value: unknown): number | null { return value === null || value === undefined ? null : typeof value === "number" && Number.isFinite(value) ? value : fail(); }
function fail(): never { throw new ReportingFactsContractError(); }
