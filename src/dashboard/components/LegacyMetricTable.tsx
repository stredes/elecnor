import Link from "next/link";
import { useState } from "react";
import type { LegacyMetric } from "../contracts/legacy-dashboard-contract";
import { LegacyMetricQuickPanel } from "./LegacyMetricQuickPanel";
import { LegacyReadingGuide } from "./LegacyReadingGuide";
import { LegacyReportShell } from "./LegacyReportShell";

export function LegacyMetricTable({ title, metrics, index, reportTitle, lead, guide }: { readonly title: string; readonly metrics: readonly LegacyMetric[]; readonly index: string; readonly reportTitle: string; readonly lead: string; readonly guide: string }) {
  const [selected, setSelected] = useState<LegacyMetric | null>(null);
  const range = metrics[0];
  return <LegacyReportShell id={index === "3" ? "metricas-debiles" : undefined} index={index} title={reportTitle} lead={lead}><div className="legacy-metric-table-card"><h3>{title}</h3><p>Cumplimiento: registros conformes sobre registros aplicables.</p>{metrics.length ? <div className="legacy-table-wrap"><table className="legacy-table"><caption className="visually-hidden">{title}</caption><thead><tr><th>Métrica</th><th>Sección</th><th>Cumplimiento</th><th>Detalle</th></tr></thead><tbody>{metrics.map((metric) => <tr key={metric.code}><th><button type="button" onClick={() => setSelected(metric)}>{metric.metric}</button></th><td>{formatName(metric.section)}</td><td className={metric.compliance !== null && metric.compliance < 70 ? "is-danger" : ""}>{metric.compliance === null ? "Sin registros aplicables" : `${metric.compliance.toFixed(2)}% · ${metric.conforming}/${metric.applicable} conformes`}</td><td><Link href={`/metricas/${encodeURIComponent(metric.code)}`}>Ver desglose →</Link></td></tr>)}</tbody></table></div> : <p className="legacy-empty">Sin datos.</p>}</div><LegacyReadingGuide title={title === "Métricas más débiles" ? "Por qué estas brechas son tan importantes" : "Cómo dialogan los indicadores altos con los bajos"} how="Cada fila cruza dos dimensiones en una misma celda: cuántas veces la métrica fue aplicable y el porcentaje de cumplimiento." reveals={range ? `${range.metric} registra ${formatPercentage(range.compliance)}.` : guide} /><LegacyMetricQuickPanel metric={selected} onClose={() => setSelected(null)} /></LegacyReportShell>;
}

function formatName(value: string): string { return value.split(/\s+/u).map((word) => word ? word[0].toUpperCase() + word.slice(1) : word).join(" "); }
function formatPercentage(value: number | null): string { return value === null ? "—" : `${value.toFixed(2)}%`; }
