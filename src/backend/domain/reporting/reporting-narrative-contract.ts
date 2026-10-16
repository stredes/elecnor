import type { ScoreBand } from "./reporting-overview-contract";
import type {
  MetricStat,
  ScatterPoint,
} from "./reporting-metric-contract";

export type NarrativeSection = {
  readonly name: string;
  readonly percentage: number | null;
};

export type NarrativeMetric = MetricStat;

export type NarrativeGlobalInput = {
  readonly score: number;
  readonly validScores: number;
  readonly below70: number;
};

export type NarrativeGlobalGap = {
  readonly global: number;
  readonly gap: number;
  readonly healthy: number;
};

export type NarrativeInput = {
  readonly global: NarrativeGlobalInput;
  readonly sections: readonly NarrativeSection[];
  readonly distribution: readonly ScoreBand[];
  readonly scatter: readonly ScatterPoint[];
  readonly weak: readonly NarrativeMetric[];
  readonly strong: readonly NarrativeMetric[];
};

export type NarrativeSummary = {
  readonly globalGap: NarrativeGlobalGap;
  readonly sectionGap: {
    weakest: NarrativeSection | null;
    restAverage: number | null;
  };
  readonly lowBandCount: number;
  readonly scatterRisk: { risk: number; total: number };
  readonly eppInsight: { directAverage: number | null; checklist: number | null };
  readonly metricRange: {
    lowest: NarrativeMetric | null;
    highest: NarrativeMetric | null;
  };
};
