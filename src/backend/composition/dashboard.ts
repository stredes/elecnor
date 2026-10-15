import { GetDashboard } from "../application/get-dashboard";
import { HttpDashboardReader } from "../adapters/outbound/http-dashboard-reader";
import { MemoryDashboardReader } from "../adapters/outbound/memory-dashboard-reader";

const backendUrl = process.env.BACKEND_API_URL;
const reader = backendUrl
  ? new HttpDashboardReader(backendUrl)
  : new MemoryDashboardReader();

export const dashboardQuery = new GetDashboard(reader);
