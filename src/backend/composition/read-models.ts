import { BackendConfigurationError } from "../adapters/outbound/http-errors";
import { HttpAnalyticsReader } from "../adapters/outbound/http-analytics-reader";
import { HttpMetricsReader } from "../adapters/outbound/http-metrics-reader";
import { HttpSupportReaders } from "../adapters/outbound/http-support-readers";
import { resolveBackendSelection } from "./backend-config";
import { inspectionScopeOptions, resolveInspectionScope } from "./inspection-scope";

export function createMetricsReader(fetcher?: typeof fetch) {
  const selection = resolveBackendSelection();
  const scope = resolveInspectionScope();
  if (selection.mode === "http" && selection.url) {
    return new HttpMetricsReader(selection.url, fetcher ?? fetch, selection.paths.metrics,
      inspectionScopeOptions(options(selection), scope), scope);
  }
  return { list: async () => { throw missing(); }, detail: async () => { throw missing(); } };
}

export function createAnalyticsReader(fetcher?: typeof fetch) {
  const selection = resolveBackendSelection();
  if (selection.mode === "http" && selection.url) return new HttpAnalyticsReader(selection.url, fetcher ?? fetch, selection.paths.analytics, options(selection));
  return { read: async () => { throw missing(); } };
}

export function createSupportReaders(fetcher?: typeof fetch) {
  const selection = resolveBackendSelection();
  if (selection.mode === "http" && selection.url) return new HttpSupportReaders(selection.url, fetcher ?? fetch, selection.paths, options(selection));
  return { unknowns: async () => { throw missing(); }, findings: async () => { throw missing(); }, logs: async () => { throw missing(); } };
}

function options(selection: ReturnType<typeof resolveBackendSelection>) {
  return { contractVersion: selection.contractVersion, internalToken: selection.internalToken, requiredScope: "official" as const, timeoutMs: selection.timeoutMs };
}
function missing(): BackendConfigurationError { return new BackendConfigurationError("El backend aún no expone este read model."); }

export const metricsReader = createMetricsReader();
export const analyticsReader = createAnalyticsReader();
export const supportReaders = createSupportReaders();
