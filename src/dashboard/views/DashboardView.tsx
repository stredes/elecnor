import Link from "next/link";
import { MetricCard } from "../components/MetricCard";
import { ExecutiveDashboard } from "../components/ExecutiveDashboard";
import { ExecutivePortalLayout } from "../components/ExecutivePortalLayout";
import { ReportLayout } from "../components/ReportLayout";
import { LegacyDashboard } from "../components/LegacyDashboard";
import { DeferredReporting } from "../components/DeferredReporting";
import { ReportSkeleton } from "../components/ReportSkeleton";
import type { DashboardViewProps } from "../contracts/dashboard-view-contract";

export function DashboardView({ snapshot, report, homeHref, deferReport, error }: DashboardViewProps) {
  if (!snapshot) return <ReportLayout activeRoute="dashboard" showFooter={false}><p role="alert">{error ?? "No hay datos del backend."}</p></ReportLayout>;
  if (report) return homeHref ? <ExecutivePortalLayout><ExecutiveDashboard model={report} generatedAt={snapshot.generatedAt} /></ExecutivePortalLayout> : <ReportLayout activeRoute="dashboard"><LegacyDashboard model={report} /></ReportLayout>;
  if (deferReport) return <DeferredDashboard snapshot={snapshot} homeHref={homeHref} />;
  return <SnapshotDashboard snapshot={snapshot} />;
}

function DeferredDashboard({ snapshot, homeHref }: { readonly snapshot: NonNullable<DashboardViewProps["snapshot"]>; readonly homeHref?: string }) {
  const content = <DeferredReporting key={refreshKey(snapshot)} fallback={<ReportSkeleton variant="dashboard" />} errorFallback={(message) => <SnapshotDashboardContent snapshot={snapshot} error={message} />}>{(model) => homeHref ? <ExecutiveDashboard model={model} generatedAt={snapshot.generatedAt} /> : <LegacyDashboard model={model} />}</DeferredReporting>;
  return homeHref ? <ExecutivePortalLayout>{content}</ExecutivePortalLayout> : <ReportLayout activeRoute="dashboard"><div>{content}</div></ReportLayout>;
}

function refreshKey(snapshot: NonNullable<DashboardViewProps["snapshot"]>): string { return `${snapshot.generatedAt}:${snapshot.metrics.map((metric) => `${metric.id}=${metric.value}`).join("|")}`; }

function SnapshotDashboard({ snapshot, error }: { readonly snapshot: NonNullable<DashboardViewProps["snapshot"]>; readonly error?: string }) {
  return <ReportLayout activeRoute="dashboard" showFooter={false}><SnapshotDashboardContent snapshot={snapshot} error={error} /></ReportLayout>;
}

function SnapshotDashboardContent({ snapshot, error }: { readonly snapshot: NonNullable<DashboardViewProps["snapshot"]>; readonly error?: string }) {
  return <><header className="dashboard-header"><div><p className="eyebrow">ELECNOR · OPERACIONES</p><h1>Panel de inspecciones</h1><p className="subtitle">Una vista sintética para validar la nueva arquitectura.</p></div><span className={`status status-${snapshot.status}`}>{snapshot.status}</span></header>{error && <p role="alert">{error}</p>}<section className="metric-grid" aria-label="Indicadores principales">{snapshot.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}</section><footer className="dashboard-footer"><span>Datos sintéticos de desarrollo</span><Link href="/api/health">Comprobar API</Link></footer></>;
}
