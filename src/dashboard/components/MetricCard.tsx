import type { MetricCardProps } from "../contracts/metric-card-contract";

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <article className="metric-card">
      <p className="metric-label">{metric.label}</p>
      <strong className="metric-value">{metric.value}</strong>
      <span className="metric-trend">{metric.trend} vs. período anterior</span>
    </article>
  );
}
