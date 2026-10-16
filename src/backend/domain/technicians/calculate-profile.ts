import { roundSql } from "../reporting/reporting-rounding";
import type { ReportingInspectionFact } from "../reporting/reporting-facts-contract";
import { selectTechnicianProfile } from "./select-profile";
import type { TechnicianProfile } from "./profile-contract";

export function calculateTechnicianProfile(
  items: readonly ReportingInspectionFact[], technician: string,
): TechnicianProfile {
  const inspections = selectTechnicianProfile(items, technician);
  const scores = inspections.flatMap((item) => item.percentage === null ? [] : [item.percentage]);
  return {
    technician,
    inspections,
    promedio: scores.length ? roundSql(average(scores) * 100) : null,
    bajo70: scores.filter((score) => score < 0.7).length,
    auditores: new Set(inspections.map((item) => item.auditor).filter(Boolean)).size,
    fechas: new Set(inspections.map((item) => item.date)).size,
  };
}

function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
