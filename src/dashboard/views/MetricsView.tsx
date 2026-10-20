import { MetricCard } from "../components/MetricCard";
import { ReportLayout } from "../components/ReportLayout";
import { LegacyMetricsPage } from "../components/LegacyMetricsPage";
import { MetricsCatalogContent, MetricsCatalogView } from "./MetricsCatalogView";
import { DeferredReporting } from "../components/DeferredReporting";
import { ReportSkeleton } from "../components/ReportSkeleton";
import type { MetricsViewProps } from "../contracts/metrics-view-contract";

export function MetricsView({ snapshot, report, catalog, deferReport, error }: MetricsViewProps) {
  if (report) {
    return <ReportLayout activeRoute="metrics" homeHref="/"><LegacyMetricsPage model={report} /></ReportLayout>;
  }
  if (deferReport && snapshot) return <ReportLayout activeRoute="metrics" homeHref="/"><DeferredReporting key={`${snapshot.generatedAt}:${catalog?.count ?? "summary"}`} fallback={catalog ? <MetricsCatalogContent catalog={catalog} error={error} /> : <ReportSkeleton variant="metrics" />} errorFallback={(message) => catalog ? <MetricsCatalogContent catalog={catalog} error={message} /> : <MetricsSnapshotContent snapshot={snapshot} error={message} />}>{(model) => <LegacyMetricsPage model={model} />}</DeferredReporting></ReportLayout>;
  if (deferReport && catalog) return <ReportLayout activeRoute="metrics" homeHref="/"><DeferredReporting key={`catalog:${catalog.count}`} fallback={<ReportSkeleton variant="metrics" />} errorFallback={(message) => <MetricsCatalogContent catalog={catalog} error={message} />}>{(model) => <LegacyMetricsPage model={model} />}</DeferredReporting></ReportLayout>;
  if (catalog) return <MetricsCatalogView catalog={catalog} error={error} />;
  if (!snapshot) return <ReportLayout activeRoute="metrics" showFooter={false}><p role="alert">{error ?? "No hay datos del backend."}</p></ReportLayout>;
  return <ReportLayout activeRoute="metrics" showFooter={false}><MetricsSnapshotContent snapshot={snapshot} /></ReportLayout>;
}

function MetricsSnapshotContent({ snapshot, error }: { readonly snapshot: NonNullable<MetricsViewProps["snapshot"]>; readonly error?: string }) {
  return <><header className="dashboard-header"><div><p className="eyebrow">ELECNOR · REPORTING</p><h1>Métricas</h1><p className="subtitle">Indicadores sintéticos de desarrollo.</p></div></header>{error && <p role="alert">{error}</p>}<section className="metric-grid" aria-label="Métricas">{snapshot.metrics.length > 0 ? snapshot.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />) : <p>No hay métricas para mostrar.</p>}</section></>;
}
