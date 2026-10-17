import type { DashboardSnapshot } from "@/backend/domain/dashboard";
import type { LegacyDashboardModel } from "./legacy-dashboard-contract";

export type DashboardViewProps = {
  readonly snapshot: DashboardSnapshot;
  readonly report?: LegacyDashboardModel;
  readonly homeHref?: string;
};
