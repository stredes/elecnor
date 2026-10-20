export type MetricSummary = {
  readonly metric: string;
  readonly code: string | null;
  readonly section: string | null;
  readonly observations: number;
  readonly applicable: number;
  readonly conforming: number;
  readonly nonConforming: number;
  readonly compliance: number | null;
};

export type MetricListResult = { readonly count: number; readonly data: readonly MetricSummary[] };
export type MetricTechnician = { readonly technician: string; readonly applicable: number; readonly conforming: number; readonly nonConforming: number };
export type MetricRecord = { readonly inspectionId: string; readonly technician: string | null; readonly date: string | null; readonly observation: string | null };
export type MetricDetail = MetricSummary & { readonly technicians: readonly MetricTechnician[]; readonly records: readonly MetricRecord[] };
