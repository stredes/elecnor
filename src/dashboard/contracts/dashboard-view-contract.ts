import type { DashboardSnapshot } from "@/backend/domain/dashboard";
import type { LegacyDashboardModel } from "./legacy-dashboard-contract";

export type DashboardViewProps = {
  readonly snapshot: DashboardSnapshot | null;
  readonly report?: LegacyDashboardModel;
  readonly homeHref?: string;
  readonly deferReport?: boolean;
  readonly error?: string;
};
