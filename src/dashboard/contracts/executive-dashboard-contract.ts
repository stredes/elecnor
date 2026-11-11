import type { ReactNode } from "react";
import type { LegacyDashboardModel } from "./legacy-dashboard-contract";

export type ExecutiveDashboardProps = { readonly model: LegacyDashboardModel; readonly generatedAt: string };
export type ExecutiveSeverityFilter = "all" | "critical" | "attention";
export type ExecutivePortalLayoutProps = { readonly children: ReactNode };
