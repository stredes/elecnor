import type { LegacyDashboardModel } from "../contracts/legacy-dashboard-contract";
import { exigencyStateClass } from "@/backend/domain/reporting/exigency-scale";

export function LegacyMetricHighlights({ model }: { readonly model: LegacyDashboardModel }) {
  const { kpis } = model;
  const items = [
    ["Inspecciones analizadas", formatNumber(kpis.inspeccionesUnicas), "Base consolidada", ""],
    ["Cumplimiento global", kpis.promedioGlobal, `${kpis.promedioGlobal} clasificado según nivel de exigencia`, exigencyStateClass(Number.parseFloat(kpis.promedioGlobal))],
    ["Personas bajo 90%", formatNumber(kpis.personasBajo90 ?? 0), "Técnicos con algún resultado bajo 90%", "is-danger"],
    ["Acciones", formatNumber(kpis.acciones), "Seguimientos registrados", "is-aqua"],
  ] as const;
  return <section className="legacy-metric-highlights legacy-glass-surface hc-report-enter-up" aria-labelledby="metric-highlights-title"><div className="legacy-metric-highlights-heading"><p>Resumen operativo</p><h2 id="metric-highlights-title">Indicadores clave</h2><span>Una lectura rápida de la base analizada antes de entrar al detalle de cada visualización.</span></div><div className="legacy-metric-highlights-grid">{items.map(([label, value, note, accent]) => <article className={`legacy-metric-highlight-card ${accent}`} key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</div></section>;
}

function formatNumber(value: number): string { return new Intl.NumberFormat("es-CL").format(value); }
