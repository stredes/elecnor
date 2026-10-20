import { DashboardView } from "../views/DashboardView";
import type { DashboardScreenProps } from "../contracts/dashboard-screen-contract";

export function DashboardScreen({ snapshot, report, deferReport, error }: DashboardScreenProps) {
  return <DashboardView snapshot={snapshot} report={report} deferReport={deferReport} error={error} />;
}
