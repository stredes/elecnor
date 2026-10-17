import { DashboardView } from "../views/DashboardView";
import type { DashboardScreenProps } from "../contracts/dashboard-screen-contract";

export function DashboardScreen({ snapshot, report }: DashboardScreenProps) {
  return <DashboardView snapshot={snapshot} report={report} />;
}
