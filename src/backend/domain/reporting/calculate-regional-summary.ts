import { recoverRegion, resolveRegion } from "../geography/resolve-location";
import type { ReportingInspectionFact, ReportingMetricFact } from "./reporting-facts-contract";
import { roundSql } from "./reporting-rounding";

export type RegionalSummary = {
  readonly region: string;
  readonly audits: number;
  readonly validScores: number;
  readonly compliance: number | null;
  readonly belowThreshold: number;
  readonly nonCompliances: number;
};

const UNKNOWN_REGION = "Sin región informada";
const COMPLIANCE_THRESHOLD = 0.7;

export function calculateRegionalSummary(
  inspections: readonly ReportingInspectionFact[],
  metrics: readonly ReportingMetricFact[],
): readonly RegionalSummary[] {
  const nonCompliances = nonComplianceByInspection(metrics);
  const groups = new Map<string, { audits: number; scores: number[]; belowThreshold: number; nonCompliances: number }>();
  for (const inspection of inspections) {
    const region = resolveInspectionRegion(inspection);
    const group = groups.get(region) ?? { audits: 0, scores: [], belowThreshold: 0, nonCompliances: 0 };
    group.audits += 1;
    if (inspection.percentage !== null) {
      group.scores.push(inspection.percentage);
      if (inspection.percentage < COMPLIANCE_THRESHOLD) group.belowThreshold += 1;
    }
    group.nonCompliances += nonCompliances.get(inspection.id ?? "") ?? 0;
    groups.set(region, group);
  }
  return [...groups].map(([region, group]) => ({
    region,
    audits: group.audits,
    validScores: group.scores.length,
    compliance: group.scores.length ? roundSql(average(group.scores) * 100) : null,
    belowThreshold: group.belowThreshold,
    nonCompliances: group.nonCompliances,
  })).sort((left, right) => right.nonCompliances - left.nonCompliances || right.audits - left.audits || left.region.localeCompare(right.region));
}

function nonComplianceByInspection(metrics: readonly ReportingMetricFact[]): Map<string, number> {
  const result = new Map<string, number>();
  for (const metric of metrics) {
    if (metric.state !== "NO_CONFORME" || !metric.inspectionId) continue;
    result.set(metric.inspectionId, (result.get(metric.inspectionId) ?? 0) + 1);
  }
  return result;
}

function resolveInspectionRegion(inspection: ReportingInspectionFact): string {
  return resolveRegion(null, inspection.region ?? null)
    ?? recoverRegion(inspection.city ?? null, inspection.address ?? null, inspection.filename ?? null)
    ?? UNKNOWN_REGION;
}

function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
