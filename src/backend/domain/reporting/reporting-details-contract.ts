export type ReportingDetailInspection = { readonly id: string; readonly technician: string | null };
export type ReportingDetailMetric = {
  readonly inspectionId: string; readonly code: string | null; readonly metric: string | null;
  readonly section: string | null; readonly applicable: number | null; readonly conforming: number | null;
  readonly state: string | null; readonly observation: string | null; readonly date: string;
  readonly technician: string | null; readonly notApplicable: number | null;
};
export type ReportingDetailFacts = {
  readonly inspections: readonly ReportingDetailInspection[];
  readonly metrics: readonly ReportingDetailMetric[];
};
export type ReportingMetricResult = {
  readonly code: string; readonly metric: string; readonly section: string; readonly applicable: number;
  readonly conforming: number; readonly nonConforming: number; readonly observations: number;
  readonly compliance: number | null; readonly technicians: { readonly conforming: string[]; readonly nonConforming: string[] };
};
export type ReportingSectionResult = ReportingMetricResult & { readonly name: string; readonly metrics: ReportingMetricResult[] };
