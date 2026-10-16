export type MetricTechnicians = {
  readonly conforming: readonly string[];
  readonly nonConforming: readonly string[];
};

export type SectionMetric = {
  readonly metric: string;
  readonly code: string | null;
  readonly applicable: number;
  readonly conforming: number;
  readonly nonConforming: number;
  readonly percentage: number | null;
  readonly nonConformingPercentage: number | null;
  readonly technicians: MetricTechnicians;
};

export type SectionReport = {
  readonly name: string;
  readonly applicable: number;
  readonly conforming: number;
  readonly nonConforming: number;
  readonly percentage: number | null;
  readonly metrics: readonly SectionMetric[];
};

export type SectionInspectionApproval = {
  readonly name: string;
  readonly total: number;
  readonly evaluated: number;
  readonly approved: number;
  readonly belowThreshold: number;
  readonly notEvaluated: number;
  readonly approvalPercentage: number;
  readonly approvalThreshold: number;
};

export type SectionApprovalReport = {
  readonly sections: readonly SectionInspectionApproval[];
  readonly allApproved: number;
};
