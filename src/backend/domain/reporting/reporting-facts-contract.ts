export type ReportingInspectionFact = {
  readonly id?: string;
  readonly date?: string | null;
  readonly technician: string | null;
  readonly auditor?: string | null;
  readonly address?: string | null;
  readonly city?: string | null;
  readonly region?: string | null;
  readonly filename?: string | null;
  readonly percentage: number | null;
  readonly actions: number | null;
};

export type ReportingImportLogFact = { readonly id: string };

export type ReportingMetricFact = {
  readonly state: string;
  readonly inspectionId?: string;
  readonly section?: string | null;
  readonly metric?: string | null;
  readonly code?: string | null;
  readonly applicable?: number | null;
  readonly conforming?: number | null;
  readonly technician?: string | null;
  readonly observation?: string | null;
};

export type ReportingFacts = {
  readonly inspections: readonly ReportingInspectionFact[];
  readonly importLogs: readonly ReportingImportLogFact[];
  readonly metrics: readonly ReportingMetricFact[];
};
