import type { calculateMetricRankings } from "../../domain/reporting/calculate-metric-rankings";
import type { calculateReportingNarrative } from "../../domain/reporting/calculate-reporting-narrative";
import type { calculateSectionApprovals } from "../../domain/reporting/calculate-section-approvals";
import type { ReportingSectionResult } from "../../domain/reporting/reporting-details-contract";

export type ReportingDetailsResult = {
  readonly sections: ReportingSectionResult[];
  readonly approvals: ReturnType<typeof calculateSectionApprovals>;
  readonly rankings: ReturnType<typeof calculateMetricRankings>;
  readonly narrative: ReturnType<typeof calculateReportingNarrative>;
};
