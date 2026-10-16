import { roundSql } from "./reporting-rounding";
import { METRIC_DASHBOARD_LIMIT, METRIC_ENDPOINT_LIMIT } from "./reporting-limits";
import type {
  ReportingFacts,
  ReportingMetricFact,
} from "./reporting-facts-contract";
import type { MetricRanking, MetricStat } from "./reporting-detail-contract";
import {
  countState,
  keyOf,
  sumKnown,
  techniciansFor,
} from "./reporting-detail-utils";
type MetricBucket = {
  metric: string;
  code: string | null;
  section: string | null;
  items: ReportingMetricFact[];
};

export function calculateMetricStats(facts: ReportingFacts): readonly MetricStat[] {
  const groups = new Map<string, MetricBucket>();
  const inspections = new Map(
    facts.inspections.filter((item) => item.id).map((item) => [item.id, item]),
  );
  for (const item of facts.metrics) {
    if (item.metric == null) continue;
    const key = keyOf(item.metric, item.code, item.section);
    const bucket = groups.get(key) ?? {
      metric: item.metric,
      code: item.code ?? null,
      section: item.section ?? null,
      items: [],
    };
    bucket.items.push(item);
    groups.set(key, bucket);
  }
  return [...groups.values()]
    .map((bucket) => toStat(bucket, inspections))
    .filter((item) => item.applicable > 0);
}

export function calculateMetricRanking(
  stats: readonly MetricStat[], limit = METRIC_DASHBOARD_LIMIT,
): MetricRanking {
  return {
    weak: selectMetricBand(stats, "weak", limit),
    strong: selectMetricBand(stats, "strong", limit),
    scatter: stats.map((item) => ({
      x: item.applicable,
      y: item.compliance,
      label: item.metric,
      section: item.section,
    })),
  };
}

export function selectMetricBand(
  stats: readonly MetricStat[], band: "weak" | "strong", limit = METRIC_ENDPOINT_LIMIT,
): readonly MetricStat[] {
  return stats.map((metric, index) => ({ metric, index })).sort((left, right) => {
    const comparison = compareMetrics(left.metric, right.metric, band);
    return comparison || left.index - right.index;
  }).slice(0, limit).map((item) => item.metric);
}

function toStat(
  bucket: MetricBucket,
  inspections: ReadonlyMap<string | undefined, { technician: string | null }>,
): MetricStat {
  const applicable = sumKnown(bucket.items.map((item) => item.applicable)) ?? 0;
  const conforming = sumKnown(bucket.items.map((item) => item.conforming));
  return {
    metric: bucket.metric,
    code: bucket.code,
    section: bucket.section,
    observations: bucket.items.length,
    applicable,
    conforming: conforming ?? 0,
    nonConforming: countState(bucket.items, "NO_CONFORME"),
    compliance: conforming === null ? null : roundSql(100 * conforming / applicable),
    technicians: techniciansFor(bucket.items, inspections),
  };
}

function compareMetrics(left: MetricStat, right: MetricStat, band: "weak" | "strong"): number {
  const nullOrder = compareNull(left.compliance, right.compliance);
  if (nullOrder) return nullOrder;
  const difference = band === "weak"
    ? (left.compliance! - right.compliance!) || (right.applicable - left.applicable)
    : (right.compliance! - left.compliance!) || (left.applicable - right.applicable);
  return difference;
}

function compareNull(left: number | null, right: number | null): number {
  if (left === null && right !== null) return 1;
  if (left !== null && right === null) return -1;
  return 0;
}
