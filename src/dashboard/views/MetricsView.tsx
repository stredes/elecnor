import { MetricCard } from "../components/MetricCard";
import { ReportLayout } from "../components/ReportLayout";
import type { MetricsViewProps } from "../contracts/metrics-view-contract";

export function MetricsView({ snapshot }: MetricsViewProps) {
  return (
    <ReportLayout activeRoute="metrics">
      <header className="dashboard-header">
          <div>
            <p className="eyebrow">ELECNOR · REPORTING</p>
            <h1>Métricas</h1>
            <p className="subtitle">Indicadores sintéticos de desarrollo.</p>
          </div>
      </header>
      <section className="metric-grid" aria-label="Métricas">
        {snapshot.metrics.length > 0
          ? snapshot.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)
          : <p>No hay métricas para mostrar.</p>}
      </section>
    </ReportLayout>
  );
}
