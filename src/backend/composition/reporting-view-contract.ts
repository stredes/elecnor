import type { ReportingAnalytics } from "../domain/analytics/analytics-contract";
import type { RegionalSummary } from "../domain/reporting/calculate-regional-summary";
import type { WorkContextInspections, WorkContextPeople } from "../domain/reporting/calculate-work-context-people";
import type { ReportingDetailsResult } from "../application/reporting/reporting-details-result-contract";
import type { ReportingOverview } from "../domain/reporting/reporting-overview-contract";
import type { MetricDetail } from "../domain/read-models/metric-contract";
import type { PeopleSample } from "../domain/reporting/calculate-people-sample";

export type ReportingViewPayload = {
  readonly overview: ReportingOverview;
  readonly details: ReportingDetailsResult;
  readonly analytics: ReportingAnalytics;
  readonly executive: { readonly regions: readonly RegionalSummary[]; readonly peopleByWorkContext: WorkContextPeople; readonly inspectionsByWorkContext: WorkContextInspections; readonly peopleSample: PeopleSample };
};
export type ReportingViewQuery = { execute(): Promise<ReportingViewPayload> };
export type MetricDetailQuery = { execute(code: string): Promise<MetricDetail | null> };
