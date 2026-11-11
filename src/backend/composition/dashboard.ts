import { GetDashboard } from "../application/get-dashboard";
import { HttpDashboardReader } from "../adapters/outbound/http-dashboard-reader";
import { MemoryDashboardReader } from "../adapters/outbound/memory-dashboard-reader";
import type { DashboardReader } from "../ports/dashboard-reader";
import { createAsyncCache } from "./async-cache";
import { resolveInspectionBackendSelection } from "./backend-config";
import { inspectionScopeOptions, resolveInspectionScope } from "./inspection-scope";

export function createDashboardQuery(fetcher?: typeof fetch) {
  const selection = resolveInspectionBackendSelection();
  const scope = resolveInspectionScope();
  const reader = selection.mode === "http" && selection.url
    ? new HttpDashboardReader(selection.url, fetcher ?? fetch, selection.paths.dashboard, inspectionScopeOptions({
      contractVersion: selection.contractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs,
    }, scope), scope)
    : selection.mode === "memory"
      ? new MemoryDashboardReader()
      : unavailableReader(selection.error);
  const query = new GetDashboard(reader);
  const cache = createAsyncCache(() => query.execute(), 30_000);
  return { execute: () => cache.read() };
}

function unavailableReader(error?: Error): DashboardReader {
  return { read: async () => { throw error ?? new Error("Backend no configurado."); } };
}

export const dashboardQuery = createDashboardQuery();
