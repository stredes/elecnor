import type { ReportingDetailFacts, ReportingMetricResult, ReportingSectionResult } from "./reporting-details-contract";

const round1 = (value: number) => Number(value.toFixed(1));

export function calculateSections(facts: ReportingDetailFacts): ReportingSectionResult[] {
  const groups = new Map<string, Map<string, ReportingMetricResult>>();
  for (const row of facts.metrics) {
    if (!row.metric || row.applicable === null) continue;
    const section = row.section ?? "Sin seccion";
    const metrics = groups.get(section) ?? new Map();
    const key = [row.metric, row.code].join("\u001f");
    const value = metrics.get(key) ?? { metric: row.metric, code: row.code ?? "", section, applicable: 0,
      conforming: 0, nonConforming: 0, observations: 0, compliance: null,
      technicians: { conforming: [] as string[], nonConforming: [] as string[] } };
    value.applicable += row.applicable;
    value.conforming += row.conforming ?? 0;
    value.nonConforming += Number(row.state === "NO_CONFORME");
    const technicianBucket = row.state === "CONFORME" ? value.technicians.conforming :
      row.state === "NO_CONFORME" ? value.technicians.nonConforming : null;
    if (technicianBucket && row.technician && !technicianBucket.includes(row.technician)) technicianBucket.push(row.technician);
    metrics.set(key, value);
    groups.set(section, metrics);
  }
  return [...groups].map(([name, map]) => {
    const metrics = [...map.values()].filter((metric) => metric.applicable > 0).map((metric) => ({
      ...metric, compliance: round1(100 * metric.conforming / metric.applicable),
      nonCompliance: round1(100 * (metric.applicable - metric.conforming) / metric.applicable),
      technicians: { conforming: [...metric.technicians.conforming].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
        nonConforming: [...metric.technicians.nonConforming].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })) },
    }));
    const applicable = metrics.reduce((sum, item) => sum + item.applicable, 0);
    const conforming = metrics.reduce((sum, item) => sum + item.conforming, 0);
    return { name, metric: name, code: "", section: name, applicable, conforming,
      nonConforming: metrics.reduce((sum, item) => sum + item.nonConforming, 0), observations: metrics.length,
      compliance: applicable ? round1(100 * conforming / applicable) : null,
      technicians: { conforming: [], nonConforming: [] }, metrics };
  }).filter((section) => section.applicable > 0).sort((a, b) => a.compliance! - b.compliance!);
}
