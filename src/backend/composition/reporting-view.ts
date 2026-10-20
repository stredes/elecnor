import { BackendConfigurationError } from "../adapters/outbound/http-errors";
import { HttpReportingFactsReader } from "../adapters/outbound/http-reporting-facts-reader";
import { MemoryReportingDetailsReader } from "../adapters/outbound/memory-reporting-details-reader";
import { MemoryReportingFactsReader } from "../adapters/outbound/memory-reporting-facts-reader";
import { GetReportingDetails } from "../application/reporting/get-reporting-details";
import { HttpMetricsReader } from "../adapters/outbound/http-metrics-reader";
import { syntheticMetricDetailQuery, syntheticReportingQuery } from "./synthetic-reporting";
import { resolveBackendSelection } from "./backend-config";
import { inspectionScopeOptions, resolveInspectionScope } from "./inspection-scope";
import { createReportingAnalytics } from "./reporting-analytics";
import { createReportingOverview } from "./reporting-overview";
import type { MetricDetailQuery, ReportingViewPayload, ReportingViewQuery } from "./reporting-view-contract";

export type { MetricDetailQuery, ReportingViewPayload, ReportingViewQuery } from "./reporting-view-contract";

export function createReportingViewQuery(): ReportingViewQuery {
  const selection = resolveBackendSelection();
  if (selection.mode === "memory") return syntheticReportingQuery;
  if (selection.mode === "http" && selection.url) {
    const scope = resolveInspectionScope();
    const options = inspectionScopeOptions({
      contractVersion: selection.contractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs,
    }, scope);
    const factsReader = new HttpReportingFactsReader(selection.url, fetch, undefined, options, scope);
    return { execute: async () => {
      return buildReport(await factsReader.read());
    } };
  }
  return { execute: async () => { throw missingReportingContract(); } };
}

async function buildReport(facts: import("../domain/reporting/reporting-facts-contract").ReportingFacts): Promise<ReportingViewPayload> {
  const overviewReader = new MemoryReportingFactsReader(facts);
  const detailsReader = new MemoryReportingDetailsReader({
    inspections: facts.inspections.map((item) => ({ id: item.id ?? "", technician: item.technician })),
    metrics: facts.metrics.map((item) => ({ inspectionId: item.inspectionId ?? "", code: item.code ?? null, metric: item.metric ?? null, section: item.section ?? null, applicable: item.applicable ?? null, conforming: item.conforming ?? null, state: item.state, observation: item.observation ?? null, date: item.date ?? "", technician: item.technician ?? null, notApplicable: item.notApplicable ?? null })),
  });
  const [overview, details, analytics] = await Promise.all([
    createReportingOverview(overviewReader).execute(),
    new GetReportingDetails(detailsReader, overviewReader).execute(),
    createReportingAnalytics(overviewReader).execute(),
  ]);
  return { overview, details, analytics };
}

export function createMetricDetailQuery(): MetricDetailQuery {
  const selection = resolveBackendSelection();
  if (selection.mode === "memory") return syntheticMetricDetailQuery;
  if (selection.mode === "http" && selection.url) {
    const scope = resolveInspectionScope();
    const reader = new HttpMetricsReader(selection.url, fetch, selection.paths.metrics, inspectionScopeOptions({
      contractVersion: selection.contractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs,
    }, scope), scope);
    return { execute: (code) => reader.detail(code) };
  }
  return { execute: async () => { throw missingReportingContract(); } };
}

function missingReportingContract(): BackendConfigurationError {
  return new BackendConfigurationError("No existe un contrato HTTP de reporting detallado configurado para este backend.");
}

export const reportingViewQuery = createReportingViewQuery();
export const metricDetailQuery = createMetricDetailQuery();
