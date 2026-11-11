import type { ReportingAnalytics } from "../domain/analytics/analytics-contract";
import type { RegionalSummary } from "../domain/reporting/calculate-regional-summary";
import type { ReportingDetailsResult } from "../application/reporting/reporting-details-result-contract";
import type { ReportingOverview } from "../domain/reporting/reporting-overview-contract";
import type { MetricDetail } from "../domain/read-models/metric-contract";

export type ReportingViewPayload = {
  readonly overview: ReportingOverview;
  readonly details: ReportingDetailsResult;
  readonly analytics: ReportingAnalytics;
  readonly executive: { readonly regions: readonly RegionalSummary[] };
};
export type ReportingViewQuery = { execute(): Promise<ReportingViewPayload> };
export type MetricDetailQuery = { execute(code: string): Promise<MetricDetail | null> };
