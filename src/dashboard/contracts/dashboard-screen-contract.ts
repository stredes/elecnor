import type { DashboardSnapshot } from "@/backend/domain/dashboard";
import type { LegacyDashboardModel } from "./legacy-dashboard-contract";

export type DashboardScreenProps = { snapshot: DashboardSnapshot; report?: LegacyDashboardModel };
