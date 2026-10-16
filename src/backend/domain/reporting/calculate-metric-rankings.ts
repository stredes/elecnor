import type { ReportingDetailFacts, ReportingMetricResult } from "./reporting-details-contract";

type MetricAggregate = ReportingMetricResult & { observations: number };
const keyOf = (row: ReportingDetailFacts["metrics"][number]) => [row.metric, row.code, row.section].join("\u001f");
const round2 = (value: number) => Number(value.toFixed(2));

export function calculateMetricRankings(facts: ReportingDetailFacts) {
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
    groups.set(key, current);
  }
  const all = [...groups.values()].filter((item) => item.applicable > 0).map((item) => ({
    ...item, compliance: round2(100 * item.conforming / item.applicable),
  }));
  return {
    weak: [...all].sort((a, b) => a.compliance! - b.compliance! || b.applicable - a.applicable).slice(0, 10),
    strong: [...all].sort((a, b) => b.compliance! - a.compliance! || a.applicable - b.applicable).slice(0, 10),
    scatter: all.map((item) => ({ x: item.applicable, y: item.compliance, label: item.metric, section: item.section })),
  };
}
