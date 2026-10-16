import type { MetricTechnicians } from "./reporting-section-contract";

export type MetricStat = {
  readonly metric: string;
  readonly code: string | null;
  readonly section: string | null;
  readonly observations: number;
  readonly applicable: number;
  readonly conforming: number;
  readonly nonConforming: number;
  readonly compliance: number | null;
  readonly technicians: MetricTechnicians;
};

export type ScatterPoint = {
  readonly x: number;
  readonly y: number | null;
  readonly label: string;
  readonly section: string | null;
};

export type MetricRanking = {
  readonly weak: readonly MetricStat[];
  readonly strong: readonly MetricStat[];
  readonly scatter: readonly ScatterPoint[];
};

export type TechnicianBreakdown = {
  readonly technician: string;
  readonly applicable: number;
  readonly conforming: number;
  readonly nonConforming: number;
};

export type MetricRecord = {
  readonly inspectionId: string | null;
  readonly technician: string | null;
  readonly date: string | null;
  readonly observation: string;
};

export type MetricDetail = {
  readonly code: string;
  readonly metric: string | null;
  readonly section: string | null;
  readonly observations: number;
  readonly applicable: number;
  readonly conforming: number;
  readonly nonConforming: number;
  readonly compliance: number | null;
  readonly technicians: readonly TechnicianBreakdown[];
  readonly records: readonly MetricRecord[];
};
