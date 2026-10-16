import type { ReportingDetailFacts } from "./reporting-details-contract";

export function getMetricDetail(facts: ReportingDetailFacts, code: string) {
  const rows = facts.metrics.filter((row) => row.code === code);
  if (!rows.length) return null;
  const first = rows[0];
  const applicable = rows.reduce((sum, row) => sum + (row.applicable ?? 0), 0);
  const conforming = rows.reduce((sum, row) => sum + (row.conforming ?? 0), 0);
  const technicians = [...new Set(rows.filter((row) => row.technician && row.state === "CONFORME").map((row) => row.technician!))];
  return { code, metric: first.metric ?? "", section: first.section ?? "", observations: rows.reduce((sum, row) => sum + (row.applicable ?? 0) + (row.notApplicable ?? 0), 0),
    applicable, conforming, nonConforming: rows.filter((row) => row.state === "NO_CONFORME").length,
    compliance: applicable > 0 ? Number((100 * conforming / applicable).toFixed(2)) : null,
    technicians: technicians.sort((a, b) => a.localeCompare(b)),
    records: rows.slice(0, 200).map((row) => ({ inspectionId: row.inspectionId,
      technician: row.technician ?? "", date: row.date, observation: row.observation ?? "" })),
  };
}
