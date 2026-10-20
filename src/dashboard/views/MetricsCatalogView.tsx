import Link from "next/link";
import type { MetricListResult } from "@/backend/domain/read-models/metric-contract";
import { ReportLayout } from "../components/ReportLayout";

export function MetricsCatalogView({ catalog, error }: { readonly catalog: MetricListResult; readonly error?: string }) {
  return <ReportLayout activeRoute="metrics" homeHref="/"><MetricsCatalogContent catalog={catalog} error={error} /></ReportLayout>;
}

export function MetricsCatalogContent({ catalog, error }: { readonly catalog: MetricListResult; readonly error?: string }) {
  return <><nav className="legacy-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span>/</span><span aria-current="page">Métricas</span></nav><header className="legacy-route-header"><div><i aria-hidden="true" /><h1>Métricas</h1></div><p>Indicadores agregados desde las inspecciones oficiales disponibles.</p></header>{error && <p role="alert">{error}</p>}<p className="legacy-results-count">{catalog.count} métrica{catalog.count === 1 ? "" : "s"} con registros aplicables.</p><section className="legacy-route-table" aria-label="Catálogo de métricas"><table><thead><tr><th>Métrica</th><th>Sección</th><th>Observaciones</th><th>Aplicables</th><th>Cumplimiento</th><th>Detalle</th></tr></thead><tbody>{catalog.data.map((metric) => <tr key={metric.code ?? metric.metric}><th>{metric.metric}</th><td>{metric.section ?? "Sin sección"}</td><td>{metric.observations}</td><td>{metric.applicable}</td><td className={metric.compliance !== null && metric.compliance < 70 ? "is-danger" : ""}>{metric.compliance === null ? "—" : `${metric.compliance}%`}</td><td>{metric.code ? <Link href={`/metricas/${encodeURIComponent(metric.code)}`}>Ver desglose</Link> : "—"}</td></tr>)}</tbody></table>{!catalog.data.length && <p className="legacy-empty">No hay métricas con registros aplicables.</p>}</section></>;
}
