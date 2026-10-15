import type { DashboardMetric } from "@/backend/domain/dashboard";

type MetricCardProps = { metric: DashboardMetric };

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <article className="metric-card">
      <p className="metric-label">{metric.label}</p>
      <strong className="metric-value">{metric.value}</strong>
      <span className="metric-trend">{metric.trend} vs. período anterior</span>
    </article>
  );
}
