export type UnknownMetric = {
  readonly id: string;
  readonly inspectionId: string;
  readonly metric: string;
  readonly normalized: string;
  readonly status: string;
  readonly assignedCode: string | null;
  readonly filename: string;
};

export type UnknownMetricResult = { readonly count: number; readonly data: readonly UnknownMetric[] };
