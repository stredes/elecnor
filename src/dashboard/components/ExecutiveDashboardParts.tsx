import Link from "next/link";
import { exigencyLevelLabel, exigencyStateClass, scoreBandLevelLabel, scoreBandStateClass } from "@/backend/domain/reporting/exigency-scale";
import type { LegacyDashboardModel, LegacyMetric } from "../contracts/legacy-dashboard-contract";

export const PILLARS = [
  ["P1", "Conocimiento técnico insuficiente", "Brechas en el dominio de riesgos y controles críticos durante la ejecución de las tareas."],
  ["P2", "Cultura preventiva débil", "La prevención no siempre se consolida como un hábito visible en las decisiones cotidianas."],
  ["P3", "Producción por encima de la seguridad", "La presión por avanzar puede favorecer atajos y el debilitamiento de controles esenciales."],
] as const;

export function Kpi({ label, value, detail, tone, href }: { readonly label: string; readonly value: string; readonly detail: string; readonly tone: string; readonly href: string }) {
  return <Link className={`executive-kpi is-${tone}`} href={href}><span>{label}</span><strong>{value}</strong><small>{detail}</small><em>Ver origen →</em></Link>;
}

export function MetricBar({ section, threshold }: { readonly section: LegacyDashboardModel["sections"][number]; readonly threshold: number }) {
  const value = section.compliance;
  const status = statusFor(value, threshold);
  return <Link className="executive-metric-row" href={section.metrics[0]?.code ? `/metricas/${encodeURIComponent(section.metrics[0].code)}` : "/metricas"}><div><strong>{formatName(section.name)}</strong><small>{section.nonConforming} incumplimientos · {section.applicable} aplicables</small></div><span className={`executive-status ${status}`}>{formatPercentage(value)} · {exigencyLevelLabel(value)}</span><i className={`executive-meter ${status}`}><b style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }} /></i></Link>;
}

export function RegionRow({ region, threshold, selected, onSelect }: { readonly region: LegacyDashboardModel["regions"][number]; readonly threshold: number; readonly selected: boolean; readonly onSelect: () => void }) {
  const status = statusFor(region.compliance, threshold);
  return <article className={`executive-region-row${selected ? " is-selected" : ""}`}><button type="button" onClick={onSelect}><span><strong>{region.region}</strong><small>{region.audits} auditorías · {region.nonCompliances} incumplimientos</small></span><b className={`executive-status ${status}`}>{formatPercentage(region.compliance)} · {exigencyLevelLabel(region.compliance)}</b></button><i className={`executive-meter ${status}`}><b style={{ width: `${Math.max(0, Math.min(100, region.compliance ?? 0))}%` }} /></i><Link href={inspectionHref(region.region)}>Ver auditorías →</Link></article>;
}

export function FindingRow({ metric }: { readonly metric: LegacyMetric }) {
  return <article className="executive-finding-row"><div><span>{formatName(metric.section)}</span><strong>{metric.metric}</strong><small>{metric.nonConforming} incumplimientos · {metric.applicable} registros aplicables</small></div><b className={`executive-status ${statusFor(metric.compliance, 70)}`}>{formatPercentage(metric.compliance)} · {exigencyLevelLabel(metric.compliance)}</b><Link href={`/metricas/${encodeURIComponent(metric.code)}`} aria-label={`Ver detalle de ${metric.metric}`}>Detalle →</Link></article>;
}

export function Trace({ label, detail, value, total, danger = false, perfect = false }: { readonly label: string; readonly detail: string; readonly value: number; readonly total: number; readonly danger?: boolean; readonly perfect?: boolean }) {
  const percentage = total ? Math.round(value / total * 100) : 0;
  const tone = danger ? "is-danger" : perfect ? "is-perfect" : "is-positive";
  return <div className={`executive-result-card ${tone}`} aria-label={`${label}: ${value.toLocaleString("es-CL")} auditorías, ${percentage}% del total válido`}><div className="executive-result-card-label"><i aria-hidden="true" /><span>{label}</span></div><div className="executive-result-card-number"><strong>{value.toLocaleString("es-CL")}</strong><small>auditorías</small></div><div className="executive-result-card-meta"><b>{percentage}%</b><span>{detail}</span></div><i className="executive-trace-meter" aria-hidden="true"><b style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }} /></i></div>;
}

export function ObservedComplianceBands({ distribution }: { readonly distribution: LegacyDashboardModel["distribution"] }) {
  const total = distribution.reduce((sum, band) => sum + band.count, 0);
  return <section className="executive-observed-bands" aria-labelledby="observed-bands-title"><div className="executive-observed-bands-heading"><strong id="observed-bands-title">Colorimetría de cumplimiento</strong><span>{total.toLocaleString("es-CL")} puntajes válidos</span></div><ul aria-label="Inspecciones por porcentaje de cumplimiento">{distribution.map((band) => <li className={scoreBandStateClass(band.label)} key={band.label}><i className={scoreBandStateClass(band.label)} aria-hidden="true" /><span><strong>{band.label === "100" ? "100%" : `${band.label}%`}</strong><small className="legacy-band-level">{scoreBandLevelLabel(band.label)}</small><small className="legacy-band-count">{band.count.toLocaleString("es-CL")} inspecciones</small></span><b>{formatShare(band.count, total)}</b></li>)}</ul></section>;
}

export function PanelHeading({ kicker, title, description }: { readonly kicker: string; readonly title: string; readonly description: string }) {
  return <header className="executive-panel-heading"><span>{kicker}</span><h2>{title}</h2><p>{description}</p></header>;
}

export function MetricStatusLegend() {
  return <div className="executive-status-legend" aria-label="Leyenda de estatus de las métricas"><span><i className="is-level-5" />Nivel 5 · Buen estado</span><span><i className="is-level-4" />Nivel 4 · Aceptable</span><span><i className="is-level-3" />Nivel 3 · Mejorable</span><span><i className="is-level-2" />Nivel 2 · Deficiente</span><span><i className="is-level-1" />Nivel 1 · Manual</span><span><i className="is-level-0" />Nivel 0 · Manual</span><span><i className="is-empty" />Sin dato</span></div>;
}

export function EmptyState({ text }: { readonly text: string }) { return <p className="executive-empty">{text}</p>; }
export function inspectionHref(region: string): string { return `/inspecciones?region=${encodeURIComponent(region)}`; }
export function formatName(value: string): string { return value.split(/\s+/u).map((word) => word ? word[0].toUpperCase() + word.slice(1) : word).join(" "); }
export function formatPercentage(value: number | null): string { return value === null ? "Sin dato" : `${value.toFixed(1)}%`; }
export function formatDate(value: string): string { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? "No disponible" : new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeZone: "America/Santiago" }).format(parsed); }
export function formatShortDate(value: string): string { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? "—" : new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Santiago" }).format(parsed); }
export function statusFor(value: number | null, threshold: number): string { void threshold; return exigencyStateClass(value); }
export function toneFor(value: string, threshold: number): string { void threshold; const state = exigencyStateClass(Number.parseFloat(value)); return state === "is-empty" ? "neutral" : state.slice(3); }
export function distributionColor(index: number, label?: string): string {
  if (label === "100") return "var(--exigency-5)";
  if (label === "90-99") return "var(--exigency-4)";
  if (label === "80-89") return "var(--exigency-3)";
  if (label === "70-79" || label === "60-69" || label === "50-59" || label === "0-49") return "var(--exigency-2)";
  return ["var(--exigency-2)", "var(--exigency-3)", "var(--exigency-4)", "var(--exigency-5)"][index % 4];
}

function formatShare(value: number, total: number): string { return `${total ? (value / total * 100).toFixed(1) : "0.0"}%`; }
