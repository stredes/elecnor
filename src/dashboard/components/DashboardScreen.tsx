import { DashboardView } from "../views/DashboardView";
import type { DashboardScreenProps } from "../contracts/dashboard-screen-contract";

export function DashboardScreen({ snapshot }: DashboardScreenProps) {
  return <DashboardView snapshot={snapshot} />;
}
