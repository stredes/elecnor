import type { AnalyticInspection } from "./series";
import type { TraceabilityData } from "./analytics-contract";

export function calculateTraceability(items: readonly AnalyticInspection[]): TraceabilityData {
  const total = items.filter((item) => item.percentage !== null).length;
  const conAcciones = items.filter((item) => (item.actions ?? 0) > 0).length;
  const sinAcciones = items.filter(
    (item) => item.percentage !== null && (item.actions ?? 0) === 0,
  ).length;
  return {
    total,
    con_acciones: conAcciones,
    sin_acciones: sinAcciones,
    porcentaje_sin_acciones: total ? roundPercent(sinAcciones / total) : 0,
  };
}

function roundPercent(value: number): number {
  return Math.round(value * 10000) / 100;
}
