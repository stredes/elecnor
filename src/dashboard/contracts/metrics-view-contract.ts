import type { DashboardSnapshot } from "@/backend/domain/dashboard";
import type { LegacyDashboardModel } from "./legacy-dashboard-contract";
import type { MetricListResult } from "@/backend/domain/read-models/metric-contract";

export type MetricsViewProps = {
  readonly snapshot: DashboardSnapshot | null;
  readonly report?: LegacyDashboardModel;
  readonly catalog?: MetricListResult;
  readonly deferReport?: boolean;
  readonly error?: string;
};
