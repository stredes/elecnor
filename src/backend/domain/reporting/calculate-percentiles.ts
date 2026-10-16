import type { ReportingFacts } from "./reporting-facts-contract";
import type { ReportingPercentiles } from "./reporting-overview-contract";
import { roundPython } from "./reporting-rounding";

export function calculatePercentiles(facts: ReportingFacts): ReportingPercentiles {
  const values = facts.inspections
    .flatMap((item) => item.percentage === null ? [] : [item.percentage])
    .sort((left, right) => left - right);
  if (!values.length) return { media: null, mediana: null, p25: null, p75: null };
  return {
    media: roundPython(mean(values) * 100),
    mediana: roundPython(median(values) * 100),
    p25: roundPython(values[Math.floor(0.25 * (values.length - 1))] * 100),
    p75: roundPython(values[Math.floor(0.75 * (values.length - 1))] * 100),
  };
}

function mean(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function median(values: readonly number[]): number {
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
}
