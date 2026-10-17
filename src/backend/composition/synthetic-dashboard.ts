import { GetDashboard } from "../application/get-dashboard";
import { MemoryDashboardReader } from "../adapters/outbound/memory-dashboard-reader";

export const syntheticDashboardQuery = new GetDashboard(new MemoryDashboardReader());
