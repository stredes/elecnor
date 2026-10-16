import type { ReportingDetailFacts, ReportingMetricResult } from "./reporting-details-contract";
import { calculateMetricNonCompliance } from "./calculate-metric-non-compliance";

type MetricAggregate = Omit<ReportingMetricResult, "applicable" | "conforming" | "nonConforming"> & {
  applicable: number; conforming: number; nonConforming: number; observations: number;
};
const keyOf = (row: ReportingDetailFacts["metrics"][number]) => [row.metric, row.code, row.section].join("\u001f");
const round2 = (value: number) => Number(value.toFixed(2));

export function calculateMetricRankings(facts: ReportingDetailFacts, limit = 10) {
  const groups = new Map<string, MetricAggregate>();
  for (const row of facts.metrics) {
    if (!row.metric) continue;
    const key = keyOf(row);
    const current = groups.get(key) ?? { code: row.code ?? "", metric: row.metric, section: row.section ?? "",
      applicable: 0, conforming: 0, nonConforming: 0, observations: 0, compliance: null,
      technicians: { conforming: [], nonConforming: [] } };
    current.observations += 1;
    current.applicable += row.applicable ?? 0;
    current.conforming += row.conforming ?? 0;
    if (row.state === "NO_CONFORME") current.nonConforming += 1;
    if (row.technician !== null && row.code !== null) {
      const category = row.state === "NO_CONFORME" ? current.technicians.nonConforming :
        row.state === "CONFORME" ? current.technicians.conforming : null;
      if (category && !category.includes(row.technician)) category.push(row.technician);
    }
    groups.set(key, current);
  }
  const all = [...groups.values()].filter((item) => item.applicable > 0).map((item) => ({
    ...item, compliance: round2(100 * item.conforming / item.applicable),
    nonCompliance: calculateMetricNonCompliance(round2(100 * item.conforming / item.applicable), item.applicable),
    technicians: { conforming: [...item.technicians.conforming].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
      nonConforming: [...item.technicians.nonConforming].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })) },
  }));
  return {
    weak: [...all].sort((a, b) => a.compliance! - b.compliance! || b.applicable - a.applicable).slice(0, limit),
    strong: [...all].sort((a, b) => b.compliance! - a.compliance! || a.applicable - b.applicable).slice(0, limit),
    scatter: all.map((item) => ({ x: item.applicable, y: item.compliance, label: item.metric, section: item.section })),
  };
}
