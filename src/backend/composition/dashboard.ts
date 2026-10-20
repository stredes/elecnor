import { GetDashboard } from "../application/get-dashboard";
import { HttpDashboardReader } from "../adapters/outbound/http-dashboard-reader";
import { MemoryDashboardReader } from "../adapters/outbound/memory-dashboard-reader";
import type { DashboardReader } from "../ports/dashboard-reader";
import { resolveBackendSelection } from "./backend-config";
import { inspectionScopeOptions, resolveInspectionScope } from "./inspection-scope";

export function createDashboardQuery(fetcher?: typeof fetch) {
  const selection = resolveBackendSelection();
  const scope = resolveInspectionScope();
  const reader = selection.mode === "http" && selection.url
    ? new HttpDashboardReader(selection.url, fetcher ?? fetch, selection.paths.dashboard, inspectionScopeOptions({
      contractVersion: selection.contractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs,
    }, scope), scope)
    : selection.mode === "memory"
      ? new MemoryDashboardReader()
      : unavailableReader(selection.error);
  return new GetDashboard(reader);
}

function unavailableReader(error?: Error): DashboardReader {
  return { read: async () => { throw error ?? new Error("Backend no configurado."); } };
}

export const dashboardQuery = createDashboardQuery();
