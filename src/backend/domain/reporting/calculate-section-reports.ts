import { roundPython } from "./reporting-rounding";
import type {
  ReportingFacts,
  ReportingMetricFact,
} from "./reporting-facts-contract";
import type { SectionMetric, SectionReport } from "./reporting-detail-contract";
import {
  countState,
  keyOf,
  normalizeSection,
  sumKnown,
  techniciansFor,
} from "./reporting-detail-utils";

type MetricBucket = {
  section: string;
  metric: string;
  code: string | null;
  items: ReportingMetricFact[];
};
type MetricResult = { section: string; metric: SectionMetric };

export function calculateSectionReports(facts: ReportingFacts): readonly SectionReport[] {
  const groups = new Map<string, MetricBucket>();
  for (const item of facts.metrics) {
    if (item.metric == null || item.applicable == null) continue;
    const section = normalizeSection(item.section);
    const key = keyOf(section, item.metric, item.code);
    const bucket = groups.get(key) ?? {
      section,
      metric: item.metric,
      code: item.code ?? null,
      items: [],
    };
    bucket.items.push(item);
    groups.set(key, bucket);
  }
  const metrics = [...groups.values()].map(toMetric).filter((item) => item.metric.applicable > 0);
  const sections = new Map<string, SectionMetric[]>();
  for (const result of metrics) {
    const current = sections.get(result.section) ?? [];
    sections.set(result.section, [...current, result.metric]);
  }
  return [...sections].map(([name, items]) => toSection(name, items)).sort(byPercentage);
}

function toMetric(bucket: MetricBucket): MetricResult {
  const applicable = sumKnown(bucket.items.map((item) => item.applicable)) ?? 0;
  const conforming = sumKnown(bucket.items.map((item) => item.conforming));
  return {
    section: bucket.section,
    metric: {
      metric: bucket.metric,
      code: bucket.code,
      applicable,
      conforming: conforming ?? 0,
      nonConforming: countState(bucket.items, "NO_CONFORME"),
      percentage: conforming === null ? null : roundPython(100 * conforming / applicable, 1),
      nonConformingPercentage: conforming === null
        ? null
        : roundPython(100 * (applicable - conforming) / applicable, 1),
      technicians: techniciansFor(bucket.items),
    },
  };
}

function toSection(name: string, metrics: readonly SectionMetric[]): SectionReport {
  const applicable = metrics.reduce((total, metric) => total + metric.applicable, 0);
  const conforming = metrics.reduce((total, metric) => total + metric.conforming, 0);
  return {
    name, applicable, conforming,
    nonConforming: metrics.reduce(
      (total, metric) => total + metric.nonConforming, 0,
    ),
    percentage: roundPython(100 * conforming / applicable, 1), metrics,
  };
}

function byPercentage(left: SectionReport, right: SectionReport): number {
  return (left.percentage ?? Number.POSITIVE_INFINITY)
    - (right.percentage ?? Number.POSITIVE_INFINITY);
}
