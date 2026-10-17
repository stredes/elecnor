import type { InspectionListItem } from "../inspection-list-contract";

export type InspectionDetailInspection = InspectionListItem & {
  readonly auditorRole: string | null;
  readonly observation: string | null;
};

export type InspectionMetric = {
  readonly id: string;
  readonly section: string;
  readonly metric: string;
  readonly code: string;
  readonly status: string | null;
  readonly applicable: number | null;
  readonly conforming: number | null;
  readonly nonConforming: number | null;
  readonly notApplicable: number | null;
  readonly observation: string | null;
};

export type InspectionDetail = {
  readonly inspection: InspectionDetailInspection;
  readonly metrics: readonly InspectionMetric[];
};

export function parseInspectionDetail(value: unknown): InspectionDetail {
  const root = record(value);
  const inspection = root && record(root.inspection);
  if (!root || !inspection || !Array.isArray(root.metrics)) throw new Error("Invalid inspection detail");
  return {
    inspection: parseInspection(inspection),
    metrics: root.metrics.map(parseMetric),
  };
}

function parseInspection(value: Record<string, unknown>): InspectionDetailInspection {
  const status = value.status;
  if (typeof value.id !== "string" || (status !== "COMPLETA" && status !== "PARCIAL")) throw new Error("Invalid inspection");
  return {
    id: value.id, filename: text(value.filename), date: text(value.date), time: text(value.time),
    technician: text(value.technician), auditor: text(value.auditor), address: text(value.address),
    city: text(value.city), region: text(value.region), percentage: number(value.percentage),
    score: number(value.score), maxScore: number(value.maxScore), actions: number(value.actions),
    rubric: text(value.rubric), status, auditorRole: text(value.auditorRole), observation: text(value.observation),
  };
}

function parseMetric(value: unknown): InspectionMetric {
  const item = record(value);
  const section = item && firstText(item.section, item.sectionNormalized, item.sectionOriginal);
  const metric = item && firstText(item.metric, item.metricNormalized, item.metricOriginal);
  const code = item && firstText(item.code, item.metricCode, item.id);
  if (!item || typeof item.id !== "string" || !section || !metric || !code) throw new Error("Invalid inspection metric");
  return {
    id: item.id, section, metric, code, status: text(item.status),
    applicable: number(item.applicable), conforming: number(item.conforming),
    nonConforming: number(item.nonConforming), notApplicable: number(item.notApplicable),
    observation: text(item.observation),
  };
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new Error("Invalid text field");
  return value;
}

function number(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("Invalid numeric field");
  return value;
}

function firstText(...values: unknown[]): string | null {
  return values.find((value): value is string => typeof value === "string" && value.trim() !== "") ?? null;
}
