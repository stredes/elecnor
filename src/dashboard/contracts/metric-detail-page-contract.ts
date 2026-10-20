import type { LegacyDashboardModel } from "./legacy-dashboard-contract";
import type { LegacyMetricDetail } from "./legacy-metric-detail-contract";

export type MetricDetailPageProps = { readonly detail: LegacyMetricDetail | null; readonly observed: LegacyDashboardModel | null; readonly error?: string };
