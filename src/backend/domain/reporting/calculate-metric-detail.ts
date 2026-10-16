import { roundSql } from "./reporting-rounding";
import { METRIC_RECORD_LIMIT } from "./reporting-limits";
import type {
  ReportingFacts,
  ReportingMetricFact,
} from "./reporting-facts-contract";
import type {
  MetricDetail,
  TechnicianBreakdown,
  MetricRecord,
} from "./reporting-detail-contract";
import { countState, sumKnown } from "./reporting-detail-utils";

export function calculateMetricDetail(facts: ReportingFacts, code: string): MetricDetail | null {
  const items = facts.metrics.filter((item) => item.code === code);
  if (!items.length) return null;
  const inspectionMap = new Map(facts.inspections.map((item) => [item.id, item]));
  const applicable = sumKnown(items.map((item) => item.applicable)) ?? 0;
  const conforming = sumKnown(items.map((item) => item.conforming));
  return {
    code,
    metric: items.find((item) => item.metric != null)?.metric ?? null,
    section: items.find((item) => item.section != null)?.section ?? null,
    observations: items.length,
    applicable,
    conforming: conforming ?? 0,
    nonConforming: countState(items, "NO_CONFORME"),
    compliance: applicable > 0 && conforming !== null
      ? roundSql(100 * conforming / applicable)
      : null,
    technicians: technicianBreakdown(items, inspectionMap),
    records: metricRecords(items, inspectionMap),
  };
}

function technicianBreakdown(
  items: readonly ReportingMetricFact[],
  inspections: ReadonlyMap<
    string | undefined,
    { technician: string | null }
  >,
): readonly TechnicianBreakdown[] {
  const groups = new Map<string, ReportingMetricFact[]>();
  for (const item of items) {
    const name = item.technician ?? inspections.get(item.inspectionId)?.technician;
    if (name) groups.set(name, [...(groups.get(name) ?? []), item]);
  }
  return [...groups].map(([technician, rows]) => ({
    technician,
    applicable: sumKnown(rows.map((item) => item.applicable)) ?? 0,
    conforming: sumKnown(rows.map((item) => item.conforming)) ?? 0,
    nonConforming: countState(rows, "NO_CONFORME"),
  })).filter((item) => item.applicable > 0).sort((left, right) =>
    right.nonConforming - left.nonConforming || left.technician.localeCompare(right.technician));
}

function metricRecords(
  items: readonly ReportingMetricFact[],
  inspections: ReadonlyMap<
    string | undefined,
    { technician: string | null; date?: string | null }
  >,
): readonly MetricRecord[] {
  return items.map((item, index) => ({ item, index }))
    .filter(({ item }) => Boolean(item.observation))
    .sort((left, right) => {
    const leftDate = inspections.get(left.item.inspectionId)?.date ?? null;
    const rightDate = inspections.get(right.item.inspectionId)?.date ?? null;
    if (leftDate === rightDate) return right.index - left.index;
    if (leftDate === null) return 1;
    if (rightDate === null) return -1;
    return rightDate.localeCompare(leftDate);
   }).slice(0, METRIC_RECORD_LIMIT).map(({ item }) => ({
    inspectionId: item.inspectionId ?? null,
    technician: item.technician ?? inspections.get(item.inspectionId)?.technician ?? null,
    date: inspections.get(item.inspectionId)?.date ?? null,
    observation: item.observation!,
  }));
}
