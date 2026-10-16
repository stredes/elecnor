import type { ReportingInspectionFact } from "../reporting/reporting-facts-contract";

export type TechnicianProfile = {
  readonly technician: string;
  readonly inspections: readonly ReportingInspectionFact[];
  readonly promedio: number | null;
  readonly bajo70: number;
  readonly auditores: number;
  readonly fechas: number;
};
