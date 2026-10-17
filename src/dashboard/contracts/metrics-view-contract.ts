import type { DashboardSnapshot } from "@/backend/domain/dashboard";
import type { LegacyDashboardModel } from "./legacy-dashboard-contract";

export type MetricsViewProps = {
  readonly snapshot: DashboardSnapshot;
  readonly report?: LegacyDashboardModel;
};
