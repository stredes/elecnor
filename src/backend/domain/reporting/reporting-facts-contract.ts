export type ReportingInspectionFact = {
  readonly technician: string | null;
  readonly percentage: number | null;
  readonly actions: number | null;
};

export type ReportingImportLogFact = { readonly id: string };

export type ReportingMetricFact = { readonly state: string };

export type ReportingFacts = {
  readonly inspections: readonly ReportingInspectionFact[];
  readonly importLogs: readonly ReportingImportLogFact[];
  readonly metrics: readonly ReportingMetricFact[];
};
