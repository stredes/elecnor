export type ExtractedScore = {
  readonly obtained: number | null;
  readonly maximum: number | null;
  readonly percentage: number | null;
};

export type ExtractedMetricFact = {
  readonly section: string | null;
  readonly sectionOrder: number | null;
  readonly label: string | null;
  readonly answer: string | null;
  readonly observation: string | null;
  readonly page: number | null;
};

export type ExtractedInspectionFacts = {
  readonly technician: string | null;
  readonly auditor: string | null;
  readonly auditorRole: string | null;
  readonly inspectionDate: string | null;
  readonly inspectionTime: string | null;
  readonly timezone: string | null;
  readonly address: string | null;
  readonly city: string | null;
  readonly region: string | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly score: ExtractedScore | null;
  readonly flaggedItems: number | null;
  readonly actions: number | null;
  readonly rubricVersion: string | null;
  readonly metrics: readonly ExtractedMetricFact[];
};
