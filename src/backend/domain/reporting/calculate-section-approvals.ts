import type { ReportingDetailFacts } from "./reporting-details-contract";

const round2 = (value: number) => Number(value.toFixed(2));

export function calculateSectionApprovals(facts: ReportingDetailFacts) {
  const grouped = new Map<string, Map<string, { applicable: number; conforming: number }>>();
  for (const row of facts.metrics) {
    if (row.applicable === null || row.conforming === null) continue;
    const section = row.section ?? "Sin seccion";
    const byInspection = grouped.get(section) ?? new Map();
    const total = byInspection.get(row.inspectionId) ?? { applicable: 0, conforming: 0 };
    total.applicable += row.applicable;
    total.conforming += row.conforming;
    byInspection.set(row.inspectionId, total);
    grouped.set(section, byInspection);
  }
  return [...grouped].map(([name, inspections]) => {
    const evaluated = [...inspections.values()].filter((item) => item.applicable > 0);
    const approved = evaluated.filter((item) => item.conforming * 100 >= 70 * item.applicable).length;
    return { name, total: facts.inspections.length, evaluated: evaluated.length, approved,
      below: evaluated.length - approved, notEvaluated: facts.inspections.length - evaluated.length,
      percentage: evaluated.length ? round2(100 * approved / evaluated.length) : 0 };
  }).sort((a, b) => a.approved - b.approved || a.name.localeCompare(b.name));
}
