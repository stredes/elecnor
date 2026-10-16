import type { ReportingDetailFacts } from "./reporting-details-contract";

export function getMetricDetail(facts: ReportingDetailFacts, code: string) {
  const rows = facts.metrics.filter((row) => row.code === code);
  if (!rows.length) return null;
  const first = rows[0];
  const applicable = rows.reduce((sum, row) => sum + (row.applicable ?? 0), 0);
  const conforming = rows.reduce((sum, row) => sum + (row.conforming ?? 0), 0);
  const technicians = [...new Set(rows.map((row) => row.technician).filter((name): name is string => Boolean(name)))].map((technician) => {
    const own = rows.filter((row) => row.technician === technician);
    return { technician, applicable: own.reduce((sum, row) => sum + (row.applicable ?? 0), 0),
      conforming: own.reduce((sum, row) => sum + (row.conforming ?? 0), 0),
      nonConforming: own.filter((row) => row.state === "NO_CONFORME").length };
  }).filter((item) => item.applicable > 0).sort((a, b) => b.nonConforming - a.nonConforming || a.technician.localeCompare(b.technician, "en", { sensitivity: "base" }));
  const records = rows.filter((row) => row.observation).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 200);
  return { code, metric: first.metric ?? "", section: first.section ?? "", observations: rows.length,
    applicable, conforming, nonConforming: rows.filter((row) => row.state === "NO_CONFORME").length,
    compliance: applicable > 0 ? Number((100 * conforming / applicable).toFixed(2)) : null,
    technicians, records: records.map((row) => ({ inspectionId: row.inspectionId,
      technician: row.technician ?? "", date: row.date, observation: row.observation ?? "" })),
  };
}
