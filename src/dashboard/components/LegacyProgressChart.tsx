import type { WeeklySeriesPoint } from "@/backend/domain/analytics/series";
import type { LegacyDashboardModel } from "../contracts/legacy-dashboard-contract";

type ProgressPoint = { readonly period: string; readonly label: string; readonly compliance: number };
type LegacyProgressChartProps = { readonly progress?: LegacyDashboardModel["progress"]; readonly weeklyProgress?: readonly WeeklySeriesPoint[] };
type ProgressDomain = { readonly minimum: number; readonly maximum: number };
const MIN_WEEKLY_INSPECTIONS_FOR_TREND = 2;
const WEEKLY_EVOLUTION_START = "2026-06-01";
const WEEKLY_DOMAIN: ProgressDomain = { minimum: 70, maximum: 90 };
const FULL_DOMAIN: ProgressDomain = { minimum: 0, maximum: 100 };
const TREND_TICKS = [70, 80, 90] as const;

export function LegacyProgressChart({ progress, weeklyProgress }: LegacyProgressChartProps) {
  const isWeekly = weeklyProgress !== undefined;
  const source = isWeekly ? weeklyPoints(weeklyProgress) : monthlyPoints(progress ?? []);
  const chartProgress = source.filter((point) => isComparable(point.period, isWeekly));
  const width = Math.max(560, chartProgress.length * 70); const height = 190; const padding = 28;
  const step = chartProgress.length > 1 ? (width - padding * 2) / (chartProgress.length - 1) : 0;
  const domain = isWeekly ? WEEKLY_DOMAIN : monthlyDomain(chartProgress);
  const points = chartProgress.map((point, index) => ({ ...point, x: padding + index * step, y: scaleY(point.compliance, domain, height, padding) }));
  const labelStep = Math.max(1, Math.ceil(points.length / 8));
  const firstPoint = points[0] ?? null;
  const finalPoint = points.at(-1) ?? null;
  return <div className={`legacy-progress-chart${isWeekly ? " is-weekly" : ""}`}>{points.length === 0 ? <p className="legacy-empty">Sin períodos comparables.</p> : <><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Evolución lineal del cumplimiento desde ${isWeekly ? "el 1 de junio" : "el primer período"}`}><desc>La línea recta resume la tendencia entre el cumplimiento observado al inicio y el cierre real. No se muestran cantidades ni porcentajes sobre los puntos.</desc><TrendGrid domain={domain} height={height} padding={padding} weekly={isWeekly} />{points.length > 1 && firstPoint && finalPoint && <line className="legacy-progress-line" x1={firstPoint.x} y1={firstPoint.y} x2={finalPoint.x} y2={finalPoint.y} />}{points.map((point, index) => <g className="legacy-progress-date" key={point.period}>{(index === 0 || index === points.length - 1) && <circle className={`legacy-progress-point${index === points.length - 1 ? " is-final" : ""}`} cx={point.x} cy={point.y} r={index === points.length - 1 ? "7" : "5"} />}{(index % labelStep === 0 || index === points.length - 1) && <text x={point.x} y={height - 7}>{point.label}</text>}</g>)}</svg><div className="legacy-progress-summary" aria-label="Resumen de la evolución"><div><span>{isWeekly ? "Inicio de evolución" : "Primer período"}</span><strong>{isWeekly ? formatLongDate(firstPoint!.period) : firstPoint!.label}</strong></div><div className="is-final"><span>Cumplimiento final real</span><strong>{formatCompliance(finalPoint!.compliance)}%</strong><small>{isWeekly ? finalPoint!.label : finalPoint!.period}</small></div></div></>}</div>;
}

function scaleY(value: number, domain: { readonly minimum: number; readonly maximum: number }, height: number, padding: number): number {
  const normalized = Math.max(0, Math.min(1, (value - domain.minimum) / (domain.maximum - domain.minimum)));
  return height - padding - normalized * (height - padding * 2);
}

function monthlyDomain(points: readonly ProgressPoint[]): ProgressDomain {
  if (!points.length) return FULL_DOMAIN;
  const values = points.map((point) => point.compliance);
  let minimum = Math.max(0, Math.floor((Math.min(...values) - 5) / 5) * 5);
  let maximum = Math.min(100, Math.ceil((Math.max(...values) + 5) / 5) * 5);
  if (maximum - minimum < 20) {
    if (minimum === 0) maximum = 20;
    else if (maximum === 100) minimum = 80;
    else {
      const center = (minimum + maximum) / 2;
      minimum = Math.max(0, Math.floor((center - 10) / 5) * 5);
      maximum = Math.min(100, minimum + 20);
    }
  }
  return { minimum, maximum };
}

function TrendGrid({ domain, height, padding, weekly }: { readonly domain: { readonly minimum: number; readonly maximum: number }; readonly height: number; readonly padding: number; readonly weekly: boolean }) {
  if (!weekly) return <line x1={padding} y1={height - padding} x2="100%" y2={height - padding} />;
  return <g className="legacy-progress-grid" aria-hidden="true">{TREND_TICKS.map((tick) => <g key={tick}><line x1={padding} y1={scaleY(tick, domain, height, padding)} x2="100%" y2={scaleY(tick, domain, height, padding)} /><text x={padding - 7} y={scaleY(tick, domain, height, padding) + 3}>{tick}%</text></g>)}</g>;
}

function monthlyPoints(progress: LegacyDashboardModel["progress"]): readonly ProgressPoint[] {
  return progress.map((point) => ({ period: point.period, label: point.period, compliance: point.compliance }));
}

function weeklyPoints(progress: readonly WeeklySeriesPoint[] | undefined): readonly ProgressPoint[] {
  return (progress ?? []).filter((point) => point.inspecciones >= MIN_WEEKLY_INSPECTIONS_FOR_TREND && point.promedio !== null).map((point) => ({ period: point.inicio, label: formatWeekLabel(point.inicio), compliance: point.promedio ?? 0 }));
}

function isComparable(period: string, weekly: boolean): boolean {
  return weekly ? period >= WEEKLY_EVOLUTION_START : period !== "2026-04";
}

function formatWeekLabel(value: string): string {
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatLongDate(value: string): string {
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatCompliance(value: number): string {
  return value.toFixed(1);
}
