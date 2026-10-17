export type LegacyMetricDetail = {
  readonly code: string; readonly metric: string; readonly section: string;
  readonly observations: number; readonly applicable: number; readonly conforming: number;
  readonly nonConforming: number; readonly compliance: number | null;
  readonly technicians: readonly { readonly technician: string; readonly applicable: number; readonly conforming: number; readonly nonConforming: number }[];
  readonly records: readonly { readonly inspectionId: string; readonly technician: string; readonly date: string; readonly observation: string }[];
};
