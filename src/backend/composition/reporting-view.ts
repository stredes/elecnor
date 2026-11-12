import { BackendConfigurationError } from "../adapters/outbound/http-errors";
import { HttpReportingFactsReader } from "../adapters/outbound/http-reporting-facts-reader";
import { MemoryReportingDetailsReader } from "../adapters/outbound/memory-reporting-details-reader";
import { MemoryReportingFactsReader } from "../adapters/outbound/memory-reporting-facts-reader";
import { GetReportingDetails } from "../application/reporting/get-reporting-details";
import { HttpMetricsReader } from "../adapters/outbound/http-metrics-reader";
import { syntheticMetricDetailQuery, syntheticReportingQuery } from "./synthetic-reporting";
import { resolveInspectionBackendSelection } from "./backend-config";
import { inspectionScopeOptions, resolveInspectionScope } from "./inspection-scope";
import { createReportingAnalytics } from "./reporting-analytics";
import { calculateRegionalSummary } from "../domain/reporting/calculate-regional-summary";
import { calculateWorkContextInspections, calculateWorkContextPeople, enrichWorkContexts } from "../domain/reporting/calculate-work-context-people";
import { calculatePeopleSample } from "../domain/reporting/calculate-people-sample";
import { createReportingOverview } from "./reporting-overview";
import { type InspectionWorkContext } from "../domain/inspection-list-contract";
import type { ReportingFacts } from "../domain/reporting/reporting-facts-contract";
import type { MetricDetailQuery, ReportingViewPayload, ReportingViewQuery } from "./reporting-view-contract";
import { readAllInspectionRows } from "./inspections";
import { createAsyncCache } from "./async-cache";

export type { MetricDetailQuery, ReportingViewPayload, ReportingViewQuery } from "./reporting-view-contract";

export function createReportingViewQuery(): ReportingViewQuery {
  const selection = resolveInspectionBackendSelection();
  if (selection.mode === "memory") return syntheticReportingQuery;
  if (selection.mode === "http" && selection.url) {
    const scope = resolveInspectionScope();
    const options = inspectionScopeOptions({
      contractVersion: selection.contractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs,
    }, scope);
    const factsReader = new HttpReportingFactsReader(selection.url, fetch, undefined, options, scope);
    const cache = createAsyncCache(async () => buildReport(await enrichMissingWorkContexts(await factsReader.read())), 30_000);
    return { execute: () => cache.read() };
  }
  return { execute: async () => { throw missingReportingContract(); } };
}

async function enrichMissingWorkContexts(facts: ReportingFacts): Promise<ReportingFacts> {
  if (!facts.inspections.some((inspection) => !inspection.workContext || inspection.workContext === "SIN_CLASIFICAR")) return facts;
  const rows = await readAllInspectionRows();
  const contextByInspectionId = new Map<string, InspectionWorkContext>();
  for (const row of rows) {
    const workContext = row.visualWorkContext ?? row.workContext;
    if (workContext) contextByInspectionId.set(row.id, workContext);
  }
  return { ...facts, inspections: enrichWorkContexts(facts.inspections, contextByInspectionId) };
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
  return { overview, details, analytics, executive: { regions: calculateRegionalSummary(facts.inspections, facts.metrics), peopleByWorkContext: calculateWorkContextPeople(facts.inspections), inspectionsByWorkContext: calculateWorkContextInspections(facts.inspections), peopleSample: calculatePeopleSample(facts.inspections) } };
}

export function createMetricDetailQuery(): MetricDetailQuery {
  const selection = resolveInspectionBackendSelection();
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
