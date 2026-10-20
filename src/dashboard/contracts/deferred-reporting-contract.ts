import type { ReactNode } from "react";
import type { LegacyDashboardModel } from "./legacy-dashboard-contract";

export type DeferredReportingProps = {
  readonly endpoint?: string;
  readonly initial?: LegacyDashboardModel;
  readonly fallback: ReactNode;
  readonly errorFallback?: (message: string) => ReactNode;
  readonly children: (report: LegacyDashboardModel) => ReactNode;
};
