import type { ReportingAnalytics } from "../domain/analytics/analytics-contract";
import type { FindingResult } from "../domain/read-models/finding-contract";
import type { ImportLogResult } from "../domain/read-models/log-contract";
import type { MetricDetail, MetricListResult } from "../domain/read-models/metric-contract";
import type { UnknownMetricResult } from "../domain/read-models/unknown-contract";

export interface MetricsReader {
  list(band?: string): Promise<MetricListResult>;
  detail(code: string): Promise<MetricDetail | null>;
}
export interface UnknownMetricsReader { list(): Promise<UnknownMetricResult>; }
export interface FindingsReader { list(): Promise<FindingResult>; }
export interface LogsReader { list(): Promise<ImportLogResult>; }
export interface AnalyticsReader { read(minimo?: number, limite?: number): Promise<ReportingAnalytics>; }
