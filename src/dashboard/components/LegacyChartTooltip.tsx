type LegacyChartTooltipProps = {
  readonly label: string;
  readonly value: string;
  readonly detail?: string;
};

export function LegacyChartTooltip({ label, value, detail }: LegacyChartTooltipProps) {
  return <div className="legacy-chart-tooltip" role="status" aria-live="polite"><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>;
}
