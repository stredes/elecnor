import { useState } from "react";
import type { WeeklySeriesPoint } from "@/backend/domain/analytics/series";
import type { LegacyDashboardModel } from "../contracts/legacy-dashboard-contract";
import { LegacyChartTooltip } from "./LegacyChartTooltip";

type ProgressPoint = { readonly period: string; readonly label: string; readonly inspections: number; readonly compliance: number; readonly href: string };
type LegacyProgressChartProps = { readonly progress?: LegacyDashboardModel["progress"]; readonly weeklyProgress?: readonly WeeklySeriesPoint[] };

export function LegacyProgressChart({ progress, weeklyProgress }: LegacyProgressChartProps) {
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  const isWeekly = weeklyProgress !== undefined;
  const source = isWeekly ? weeklyPoints(weeklyProgress) : monthlyPoints(progress ?? []);
  const chartProgress = source.filter((point) => isComparable(point.period, isWeekly));
  const width = Math.max(560, chartProgress.length * 70); const height = 190; const padding = 28;
  const step = chartProgress.length > 1 ? (width - padding * 2) / (chartProgress.length - 1) : 0;
  const points = chartProgress.map((point, index) => ({ ...point, x: padding + index * step, y: height - padding - (point.compliance / 100) * (height - padding * 2) }));
  const labelStep = Math.max(1, Math.ceil(points.length / 8));
  const activePoint = points.find((point) => point.period === activePeriod) ?? null;
  return <div className={`legacy-progress-chart${isWeekly ? " is-weekly" : ""}`}>{points.length === 0 ? <p className="legacy-empty">Sin períodos comparables.</p> : <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Línea de cumplimiento promedio por ${isWeekly ? "semana" : "período"}`}><line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} /><line x1={padding} y1={height - padding - 0.7 * (height - padding * 2)} x2={width - padding} y2={height - padding - 0.7 * (height - padding * 2)} className="legacy-threshold" /><polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} />{points.map((point, index) => <a className={activePeriod === point.period ? "is-active" : undefined} key={point.period} href={point.href} aria-label={`${point.label}: ${point.compliance}% de cumplimiento, ${point.inspections} inspecciones`} onMouseEnter={() => setActivePeriod(point.period)} onMouseLeave={() => setActivePeriod(null)} onFocus={() => setActivePeriod(point.period)} onBlur={() => setActivePeriod(null)}><circle cx={point.x} cy={point.y} r="6" /><title>{`${point.label}: ${point.compliance}% de cumplimiento, ${point.inspections} inspecciones`}</title>{(index % labelStep === 0 || index === points.length - 1) && <text x={point.x} y={height - 7}>{point.label}</text>}<text x={point.x} y={Math.max(12, point.y - 12)}>{point.compliance}%</text></a>)}</svg>}{activePoint && <LegacyChartTooltip label={activePoint.label} value={`${activePoint.compliance}% de cumplimiento`} detail={`${activePoint.inspections.toLocaleString("es-CL")} inspecciones · ${isWeekly ? "Semana" : "Período"} ${activePoint.period}`} />}</div>;
}

function monthlyPoints(progress: LegacyDashboardModel["progress"]): readonly ProgressPoint[] {
  return progress.map((point) => ({ period: point.period, label: point.period, inspections: point.inspections, compliance: point.compliance, href: `/inspecciones?month=${encodeURIComponent(point.period)}` }));
}

function weeklyPoints(progress: readonly WeeklySeriesPoint[] | undefined): readonly ProgressPoint[] {
  return (progress ?? []).filter((point) => point.promedio !== null).map((point) => ({ period: point.inicio, label: formatWeekLabel(point.inicio), inspections: point.inspecciones, compliance: point.promedio ?? 0, href: weekHref(point.inicio) }));
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
