import type { ReportingAnalytics } from "../domain/analytics/analytics-contract";
import type { ReportingDetailsResult } from "../application/reporting/reporting-details-result-contract";
import type { ReportingOverview } from "../domain/reporting/reporting-overview-contract";
import type { MetricDetail } from "../domain/read-models/metric-contract";

export type ReportingViewPayload = {
  readonly overview: ReportingOverview;
  readonly details: ReportingDetailsResult;
  readonly analytics: ReportingAnalytics;
};
export type ReportingViewQuery = { execute(): Promise<ReportingViewPayload> };
export type MetricDetailQuery = { execute(code: string): Promise<MetricDetail | null> };
