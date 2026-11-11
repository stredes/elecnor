import { useState } from "react";
import { exigencyStateClass } from "@/backend/domain/reporting/exigency-scale";
import type { WeeklySeriesPoint } from "@/backend/domain/analytics/series";
import type { LegacyDashboardModel } from "../contracts/legacy-dashboard-contract";
import { LegacyChartTooltip } from "./LegacyChartTooltip";

type ProgressPoint = { readonly period: string; readonly label: string; readonly inspections: number; readonly compliance: number; readonly href: string; readonly levelClass: string };
type LegacyProgressChartProps = { readonly progress?: LegacyDashboardModel["progress"]; readonly weeklyProgress?: readonly WeeklySeriesPoint[] };
type ProgressDomain = { readonly minimum: number; readonly maximum: number };
const MIN_WEEKLY_INSPECTIONS_FOR_TREND = 2;
const WEEKLY_DOMAIN: ProgressDomain = { minimum: 70, maximum: 90 };
const FULL_DOMAIN: ProgressDomain = { minimum: 0, maximum: 100 };
const TREND_TICKS = [70, 80, 90] as const;

export function LegacyProgressChart({ progress, weeklyProgress }: LegacyProgressChartProps) {
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  const isWeekly = weeklyProgress !== undefined;
  const source = isWeekly ? weeklyPoints(weeklyProgress) : monthlyPoints(progress ?? []);
  const chartProgress = source.filter((point) => isComparable(point.period, isWeekly));
  const width = Math.max(560, chartProgress.length * 70); const height = 190; const padding = 28;
  const step = chartProgress.length > 1 ? (width - padding * 2) / (chartProgress.length - 1) : 0;
  const domain = isWeekly ? WEEKLY_DOMAIN : monthlyDomain(chartProgress);
  const points = chartProgress.map((point, index) => ({ ...point, x: padding + index * step, y: scaleY(point.compliance, domain, height, padding) }));
  const labelStep = Math.max(1, Math.ceil(points.length / 8));
  const activePoint = points.find((point) => point.period === activePeriod) ?? null;
  return <div className={`legacy-progress-chart${isWeekly ? " is-weekly" : ""}`}>{points.length === 0 ? <p className="legacy-empty">Sin períodos comparables.</p> : <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Línea de cumplimiento promedio por ${isWeekly ? "semana" : "período"}`}><TrendGrid domain={domain} height={height} padding={padding} weekly={isWeekly} />{points.slice(1).map((point, index) => { const previous = points[index]; return <line className={`legacy-progress-segment ${point.levelClass}`} key={`segment-${point.period}`} x1={previous.x} y1={previous.y} x2={point.x} y2={point.y} />; })}{points.map((point, index) => <a className={`${activePeriod === point.period ? "is-active " : ""}${point.levelClass}`} key={point.period} href={point.href} aria-label={`${point.label}: ${point.compliance}% de cumplimiento, ${point.inspections} inspecciones`} onMouseEnter={() => setActivePeriod(point.period)} onMouseLeave={() => setActivePeriod(null)} onFocus={() => setActivePeriod(point.period)} onBlur={() => setActivePeriod(null)}><circle cx={point.x} cy={point.y} r="6" /><title>{`${point.label}: ${point.compliance}% de cumplimiento, ${point.inspections} inspecciones`}</title>{(index % labelStep === 0 || index === points.length - 1) && <text x={point.x} y={height - 7}>{point.label}</text>}<text x={point.x} y={Math.max(12, point.y - 12)}>{point.compliance}%</text></a>)}</svg>}{activePoint && <LegacyChartTooltip label={activePoint.label} value={`${activePoint.compliance}% de cumplimiento`} detail={`${activePoint.inspections.toLocaleString("es-CL")} inspecciones · ${isWeekly ? "Semana" : "Período"} ${activePoint.period}`} />}</div>;
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
  return progress.map((point) => ({ period: point.period, label: point.period, inspections: point.inspections, compliance: point.compliance, href: `/inspecciones?month=${encodeURIComponent(point.period)}`, levelClass: exigencyStateClass(point.compliance) }));
}

function weeklyPoints(progress: readonly WeeklySeriesPoint[] | undefined): readonly ProgressPoint[] {
  return (progress ?? []).filter((point) => point.inspecciones >= MIN_WEEKLY_INSPECTIONS_FOR_TREND && point.promedio !== null).map((point) => ({ period: point.inicio, label: formatWeekLabel(point.inicio), inspections: point.inspecciones, compliance: point.promedio ?? 0, href: weekHref(point.inicio), levelClass: exigencyStateClass(point.promedio) }));
}

function isComparable(period: string, weekly: boolean): boolean {
  return weekly ? !period.startsWith("2026-04-") : period !== "2026-04";
}

function formatWeekLabel(value: string): string {
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function weekHref(start: string): string {
  const end = new Date(`${start}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 6);
  return `/inspecciones?from=${encodeURIComponent(start)}&to=${encodeURIComponent(end.toISOString().slice(0, 10))}`;
}
