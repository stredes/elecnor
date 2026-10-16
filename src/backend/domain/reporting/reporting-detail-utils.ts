import type { ReportingMetricFact } from "./reporting-facts-contract";
import type { MetricTechnicians } from "./reporting-detail-contract";

export function normalizeSection(section: string | null | undefined): string {
  return section ?? "Sin seccion";
}

export function sumKnown(values: readonly (number | null | undefined)[]): number | null {
  const known = values.filter((value): value is number => value !== null && value !== undefined);
  return known.length ? known.reduce((total, value) => total + value, 0) : null;
}

export function countState(items: readonly ReportingMetricFact[], state: string): number {
  return items.filter((item) => item.state === state).length;
}

export function techniciansFor(items: readonly ReportingMetricFact[]): MetricTechnicians {
  const conforming = new Set<string>();
  const nonConforming = new Set<string>();
  for (const item of items) {
    if (!item.technician || !["CONFORME", "NO_CONFORME"].includes(item.state)) continue;
    (item.state === "CONFORME" ? conforming : nonConforming).add(item.technician);
  }
  return { conforming: ordered(conforming), nonConforming: ordered(nonConforming) };
}

export function ordered(values: ReadonlySet<string>): string[] {
  return [...values].sort((left, right) => {
    const a = left.toLowerCase();
    const b = right.toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

export function keyOf(...parts: readonly (string | null | undefined)[]): string {
  return JSON.stringify(parts);
}
