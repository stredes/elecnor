export type GuardProvenanceFacts = {
  readonly present: boolean;
  readonly filename: string | null;
  readonly sha256: string | null;
  readonly sha256Recalculated: string | null;
};

export type GuardMetricFacts = {
  readonly code: string | null;
  readonly section: string | null;
  readonly label: string | null;
  readonly applicable: number | null;
  readonly conforming: number | null;
  readonly nonConforming: number | null;
  readonly score: number | null;
  readonly maxScore: number | null;
  readonly percentage: number | null;
};

export type GuardSectionFacts = {
  readonly name: string;
  readonly metricCount: number;
};

export type EvaluationMode = "list" | "detail";

export type InspectionFacts = {
  readonly inspectionId: string;
  readonly documentId: string | null;
  readonly documentKind: string | null;
  readonly technicianNormalized: string | null;
  readonly auditor: string | null;
  readonly timestampRaw: string | null;
  readonly localInspectionDate: string | null;
  readonly localInspectionAt: string | null;
  readonly timezone: string | null;
  readonly datePrecision: string | null;
  readonly timePrecision: string | null;
  readonly importStatus: string | null;
  readonly metricCount: number | null;
  readonly exactCopyOf: string | null;
  readonly rubric: string | null;
  readonly provenance: GuardProvenanceFacts;
  readonly metrics: readonly GuardMetricFacts[];
  readonly sections: readonly GuardSectionFacts[];
  readonly evaluationMode: EvaluationMode;
};

export type InspectionFactsPatch = Partial<Omit<InspectionFacts, "inspectionId" | "provenance" | "evaluationMode">> & {
  readonly provenance?: Partial<GuardProvenanceFacts>;
};
